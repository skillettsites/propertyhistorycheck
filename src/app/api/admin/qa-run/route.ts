import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport, type PaidTier } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail, getResendEmailStatus } from "@/lib/email";
import { lookupPostcode } from "@/lib/apis/geocode";
import type { PostcodeAddress, PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * QA test runner, invoked from a local terminal with the ADMIN_KEY header.
 * Bypasses Stripe + webhook. For each address in the body:
 *   1. Geocodes via postcodes.io to fill in lat/lng/admin district
 *   2. Runs the full paid orchestrator (Premium or Premium+)
 *   3. Saves the report to Supabase with a deterministic test session_id
 *   4. Sends the email via Resend to the supplied recipient
 *   5. Returns the live /r/{token} URL, populated-section counts, and any
 *      error encountered per address.
 *
 * NOT for production use. Has no rate limiting beyond Vercel's defaults.
 */

interface AddressInput {
  postcode: string;
  fullAddress: string;
  paon?: string;
  saon?: string;
  street?: string;
  uprn?: string;
}

interface AddressResult {
  input: AddressInput;
  status: "ok" | "error";
  token?: string;
  liveUrl?: string;
  emailDelivered?: boolean;
  populated?: Record<string, boolean | number>;
  resend?: { id: string; to?: string[]; subject?: string; last_event?: string; created_at?: string } | null;
  error?: string;
  ms?: number;
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: { addresses?: AddressInput[]; tier?: PaidTier; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const addresses = Array.isArray(body.addresses) ? body.addresses : [];
  const tier: PaidTier = body.tier === "standard" ? "standard" : body.tier === "bundle" ? "bundle" : "standard_plus";
  const email = body.email?.trim();

  if (addresses.length === 0 || !email) {
    return NextResponse.json({ error: "addresses and email required" }, { status: 400 });
  }
  if (addresses.length > 25) {
    return NextResponse.json({ error: "too_many_addresses (max 25)" }, { status: 400 });
  }

  const admin = createAdminClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";

  const results: AddressResult[] = [];
  // Run sequentially so we don't hammer Land Registry SPARQL + Claude API in parallel.
  for (let i = 0; i < addresses.length; i++) {
    const input = addresses[i];
    const started = Date.now();
    try {
      const address = await resolveAddress(input);
      if (!address) {
        results.push({ input, status: "error", error: "geocode_failed", ms: Date.now() - started });
        continue;
      }

      const report = await getPaidReport(address, tier);

      // Generate a 12-char alphanumeric session id suffix so isValidReportToken accepts it.
      // (deriveReportToken takes the last 12 chars and requires /^[A-Za-z0-9]+$/.)
      const rand = Math.random().toString(36).slice(2, 8);
      const ts = Date.now().toString(36).slice(-6);
      const sessionId = `qatest${ts}${rand}`.slice(-128);

      const { data: insertRow, error: insErr } = await admin
        .from("reports")
        .insert({
          tier,
          status: "ready",
          stripe_session_id: sessionId,
          stripe_payment_intent: null,
          customer_email: email,
          amount_paid: tier === "bundle" ? 1499 : tier === "standard_plus" ? 699 : 499,
          data: report as unknown as Record<string, unknown>,
          ready_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insErr) {
        results.push({ input, status: "error", error: `supabase_insert_failed: ${insErr.message}`, ms: Date.now() - started });
        continue;
      }

      // Send email, captures the same code path real buyers hit, then read the
      // status straight back from the Resend API to prove it landed there.
      let emailDelivered = false;
      let emailErrMsg: string | undefined;
      let resend: Awaited<ReturnType<typeof getResendEmailStatus>> = null;
      try {
        const resendId = await sendPropertyReportEmail(email, report, tier, sessionId);
        emailDelivered = true;
        if (resendId) resend = await getResendEmailStatus(resendId);
      } catch (emailErr) {
        emailErrMsg = String((emailErr as Error)?.message ?? emailErr);
      }

      await admin
        .from("reports")
        .update({ email_sent: emailDelivered })
        .eq("id", insertRow?.id);

      // Token = last 12 chars of the session id (matches lib/report-token deriveReportToken).
      const token = sessionId.slice(-12);

      results.push({
        input,
        status: "ok",
        token,
        liveUrl: `${origin}/r/${token}`,
        emailDelivered,
        populated: summarisePopulated(report),
        resend,
        error: emailErrMsg,
        ms: Date.now() - started,
      });
    } catch (err) {
      results.push({ input, status: "error", error: String((err as Error)?.message ?? err), ms: Date.now() - started });
    }
  }

  return NextResponse.json({ tier, email, count: results.length, results });
}

async function resolveAddress(input: AddressInput): Promise<PostcodeAddress | null> {
  const cleanPostcode = input.postcode.trim().toUpperCase();
  const formatted = cleanPostcode.length >= 5
    ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`.replace(/\s+/g, " ")
    : cleanPostcode;
  const geo = await lookupPostcode(formatted).catch(() => null);
  if (!geo) return null;
  return {
    uprn: input.uprn,
    fullAddress: input.fullAddress.trim(),
    paon: input.paon,
    saon: input.saon,
    street: input.street,
    postcode: formatted,
    lat: geo.lat,
    lng: geo.lng,
    town: geo.admin_district,
    region: geo.region,
    country: geo.country,
    lsoa: geo.lsoa,
    msoa: geo.msoa,
    adminDistrictCode: geo.admin_district,
    adminDistrictName: geo.admin_district,
  };
}

/** Returns a quick map of which paid sections actually populated, for easy QA scanning. */
function summarisePopulated(report: PaidReport): Record<string, boolean | number> {
  const f = report.free;
  return {
    free_sales_count: f.priceHistory?.sales?.length ?? 0,
    free_similar_sales: f.priceHistory?.similarSales?.length ?? 0,
    free_epc: !!f.epc?.rating,
    free_flood: !!f.flood?.riskLevel,
    free_crime: (f.crime?.totalIncidents ?? 0) > 0,
    free_schools: (f.schools?.length ?? 0) > 0,
    free_council_tax: !!f.councilTax?.band,
    free_planning: (f.planning?.totalApps12m ?? 0) >= 0,
    paid_flags_radon: report.flags?.radonRiskBand != null,
    paid_flags_shrink_swell: report.flags?.shrinkSwellBand != null,
    paid_flags_listed: !!report.flags?.listedBuilding?.listed,
    paid_flags_conservation: !!report.flags?.conservationArea?.inArea,
    paid_flags_coal: !!report.flags?.coalReportingArea,
    paid_ownership: !!report.ownership,
    paid_ownership_overseas: !!report.ownership?.overseasOwned,
    paid_ownership_uk_company: !!report.ownership?.ukCompanyOwned,
    paid_company_owner: !!report.companyOwner,
    paid_company_charges: report.companyOwner?.outstandingCharges ?? 0,
    paid_company_insolvency_cases: report.companyOwner?.insolvencyCases?.length ?? 0,
    paid_disqualified_directors: report.disqualifiedDirectors?.length ?? 0,
    paid_bsr_hrb_registered: !!report.bsrHrb?.registered,
    paid_title_present: !!report.title,
    paid_title_leasehold: report.title?.tenure === "leasehold",
    paid_tribunal_count: report.tribunalHistory?.count ?? 0,
    paid_verdict: !!report.buyersVerdict,
    paid_seller_questions: report.sellerQuestions?.length ?? 0,
    plus_solicitor_brief_items: report.solicitorBrief?.items?.length ?? 0,
    plus_surveyor_brief_items: report.surveyorBrief?.items?.length ?? 0,
    plus_mortgage_brief_items: report.mortgageBrief?.items?.length ?? 0,
  };
}
