import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport, type PaidTier } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail } from "@/lib/email";
import { lookupPostcode } from "@/lib/apis/geocode";
import { generateSolicitorBrief, generateSurveyorBrief, generateMortgageBrief } from "@/lib/apis/aiBriefs";
import type { PostcodeAddress, PaidReport } from "@/lib/types";

export const runtime = "nodejs";
// Premium+ orchestrator runs 4 AI calls in parallel (seller-questions
// + 3 briefs), each up to 60s. Plus the data fan-out + ownership/CH lookups
// + flag aggregation + Supabase writes + email send. Allow 120s headroom.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_placeholder"
    );
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency gate. Stripe re-delivers the SAME event.id on retry, and it
  // retries (with backoff over ~3 days) whenever it doesn't get a 2xx inside
  // its timeout window. Fulfilment below is slow (Premium+ runs 4 AI calls, up
  // to 120s), so Stripe routinely times out waiting and retries even though we
  // eventually return 200. Previously nothing checked the recorded event, so
  // every retry re-ran the whole block, re-sending the buyer's report email and
  // re-firing the owner Telegram alert (one real £6.99 order fulfilled 5×).
  // Recording the event id under its primary key makes the first delivery win
  // atomically; any retry hits the unique violation (23505) and we acknowledge
  // without re-processing. A genuine write failure returns 500 so Stripe retries
  // later rather than dropping an unfulfilled order.
  const { error: dedupeErr } = await admin.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (dedupeErr) {
    if (dedupeErr.code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("stripe_events insert failed", dedupeErr);
    return NextResponse.json({ error: "event_record_failed" }, { status: 500 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const tier = session.metadata?.tier as (PaidTier | "standard_plus_upgrade") | undefined;
  const postcode = session.metadata?.postcode;
  const uprn = session.metadata?.uprn;
  const fullAddressFromMeta = session.metadata?.full_address;
  const existingToken = session.metadata?.existing_token;
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

  // Premium → Premium+ £2 in-place upgrade. Looks up the existing report,
  // generates the 3 AI briefs against its stored data, updates the row to
  // standard_plus, and sends the buyer a fresh email. Existing token + URL
  // are preserved.
  if (tier === "standard_plus_upgrade") {
    if (!existingToken || !customerEmail) {
      console.error("upgrade webhook missing fields", { existingToken, customerEmail });
      return NextResponse.json({ ok: true });
    }
    await handleUpgrade(admin, session, existingToken, customerEmail);
    return NextResponse.json({ ok: true });
  }

  if (!tier || !postcode || !customerEmail) {
    console.error("webhook missing fields", { tier, postcode, customerEmail });
    return NextResponse.json({ ok: true });
  }

  if (tier !== "standard" && tier !== "standard_plus") {
    // £4.99 Premium and £6.99 Premium+ are the only live first-purchase tiers.
    // Legacy tiers from any earlier version are ignored.
    console.warn("webhook received legacy tier", tier);
    return NextResponse.json({ ok: true });
  }

  // Insert pending report row
  const { data: insertRow } = await admin
    .from("reports")
    .insert({
      tier,
      status: "processing",
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      customer_email: customerEmail,
      amount_paid: session.amount_total,
    })
    .select("id")
    .single();

  try {
    const address = await resolveAddressFromMetadata(postcode, fullAddressFromMeta, uprn);
    if (!address) throw new Error("address_unresolvable");

    const report = await getPaidReport(address, tier);

    await admin
      .from("reports")
      .update({
        status: "ready",
        data: report as unknown as Record<string, unknown>,
        ready_at: new Date().toISOString(),
      })
      .eq("id", insertRow?.id);

    let emailDelivered = false;
    try {
      await sendPropertyReportEmail(customerEmail, report, tier, session.id);
      emailDelivered = true;
    } catch (emailErr) {
      console.error("email send threw, report still saved, but email failed", emailErr);
    }

    await admin
      .from("reports")
      .update({ email_sent: emailDelivered })
      .eq("id", insertRow?.id);

    await admin.from("conversion_events").insert({
      site_id: "homebuyercheck",
      event_type: "paid_report_completed",
      metadata: { tier, postcode, session_id: session.id, email_delivered: emailDelivered },
    });

    // Telegram purchase notification (like CCC). Best-effort; never throws.
    await notifyPurchaseTelegram({
      tier,
      address: report.free.property.fullAddress ?? postcode,
      postcode,
      amountPence: session.amount_total ?? 0,
      customerEmail,
      sessionId: session.id,
      emailDelivered,
      ownershipNotable: report.ownership?.overseasOwned || report.ownership?.ukCompanyOwned,
    });
  } catch (err) {
    console.error("fulfilment failed", err);
    await admin
      .from("reports")
      .update({ status: "failed" })
      .eq("id", insertRow?.id);
  }

  return NextResponse.json({ ok: true });
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/**
 * In-place £2 Premium → Premium+ upgrade.
 *
 * Looks up the existing report by its 12-char token (= last 12 chars of the
 * original Stripe session id; matches the /r/[token] route convention),
 * generates the three Premium+ AI briefs against the stored PaidReport data,
 * merges them into the row, updates the tier to standard_plus, and sends a
 * fresh email. Idempotent on stripe_session_id (Stripe won't re-fire the same
 * checkout.session.completed for an already-processed session).
 */
async function handleUpgrade(
  admin: SupabaseAdmin,
  session: Stripe.Checkout.Session,
  existingToken: string,
  customerEmail: string,
): Promise<void> {
  // Find the row by token suffix. Defensive: take the most-recent ready row
  // matching the token in case there are legacy duplicates.
  const { data: row, error: lookupErr } = await admin
    .from("reports")
    .select("id, tier, data, status, customer_email")
    .ilike("stripe_session_id", `%${existingToken}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupErr || !row?.data) {
    console.error("upgrade: existing report not found", { existingToken, lookupErr: lookupErr?.message });
    return;
  }
  if (row.status !== "ready") {
    console.error("upgrade: existing report not ready", { existingToken, status: row.status });
    return;
  }
  if (row.tier === "standard_plus") {
    console.warn("upgrade: row already standard_plus, skipping AI re-run", { existingToken });
    return;
  }

  const existing = row.data as unknown as PaidReport;

  // Generate the three Premium+ AI briefs. Each function catches its own
  // errors and returns undefined on failure, matches the orchestrator
  // behaviour for a fresh standard_plus purchase.
  const [solicitor, surveyor, mortgage] = await Promise.all([
    generateSolicitorBrief(existing),
    generateSurveyorBrief(existing),
    generateMortgageBrief(existing),
  ]);

  const upgraded: PaidReport = {
    ...existing,
    solicitorBrief: solicitor,
    surveyorBrief: surveyor,
    mortgageBrief: mortgage,
  };

  await admin
    .from("reports")
    .update({
      tier: "standard_plus",
      data: upgraded as unknown as Record<string, unknown>,
      ready_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  let emailDelivered = false;
  try {
    // Reuse the original token's URL by passing the original session id (the
    // 12-char suffix is preserved). Existing buyer keeps the same /r/{token}.
    await sendPropertyReportEmail(customerEmail, upgraded, "standard_plus", `pad${existingToken}`);
    emailDelivered = true;
  } catch (emailErr) {
    console.error("upgrade email send threw", emailErr);
  }

  await admin
    .from("reports")
    .update({ email_sent: emailDelivered })
    .eq("id", row.id);

  await admin.from("conversion_events").insert({
    site_id: "homebuyercheck",
    event_type: "paid_report_upgraded",
    metadata: {
      tier: "standard_plus_upgrade",
      existing_token: existingToken,
      upgrade_session_id: session.id,
      email_delivered: emailDelivered,
    },
  });

  await notifyPurchaseTelegram({
    tier: "standard_plus_upgrade",
    address: upgraded.free.property.fullAddress ?? "",
    postcode: upgraded.free.property.postcode ?? "",
    amountPence: session.amount_total ?? 200,
    customerEmail,
    sessionId: session.id,
    emailDelivered,
    ownershipNotable: upgraded.ownership?.overseasOwned || upgraded.ownership?.ukCompanyOwned,
  });
}

/**
 * Build a PostcodeAddress for getPaidReport from the buyer's selected
 * Stripe metadata. Trusts the chosen full_address; parses paon/saon for
 * downstream HMLR/Leases matching.
 */
async function resolveAddressFromMetadata(
  postcode: string,
  fullAddress: string | undefined,
  uprn: string | undefined,
): Promise<PostcodeAddress | null> {
  const cleanPostcode = postcode.trim().toUpperCase();
  const formattedPostcode = cleanPostcode.length >= 5
    ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`.replace(/\s+/g, " ")
    : cleanPostcode;

  const parts = parseAddressForHmlr(fullAddress ?? "");

  let lat: number | undefined, lng: number | undefined;
  let town: string | undefined, region: string | undefined, country: string | undefined;
  let lsoa: string | undefined, msoa: string | undefined;
  let adminDistrictCode: string | undefined, adminDistrictName: string | undefined;
  const geo = await lookupPostcode(formattedPostcode);
  if (geo) {
    lat = geo.lat; lng = geo.lng;
    town = geo.admin_district; region = geo.region; country = geo.country;
    lsoa = geo.lsoa; msoa = geo.msoa;
    adminDistrictCode = geo.admin_district; adminDistrictName = geo.admin_district;
  }

  return {
    uprn: uprn || undefined,
    fullAddress: fullAddress?.trim() || formattedPostcode,
    paon: parts.paon,
    saon: parts.saon,
    street: parts.street,
    postcode: formattedPostcode,
    lat, lng, town, region, country, lsoa, msoa,
    adminDistrictCode, adminDistrictName,
  };
}

function parseAddressForHmlr(input: string): { saon?: string; paon?: string; street?: string } {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return {};
  const noPostcode = trimmed.replace(/,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").trim();
  const segments = noPostcode.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return {};
  const flatPrefix = /^(?:apartment|apt|flat|unit|suite|maisonette|penthouse|studio)\b\s*(\S*)/i;
  let saon: string | undefined, paon: string | undefined, street: string | undefined;
  const remaining = [...segments];
  const flatMatch = remaining[0].match(flatPrefix);
  if (flatMatch) {
    saon = (flatMatch[1] || remaining[0]).toUpperCase();
    remaining.shift();
  }
  if (remaining.length > 0) {
    const candidate = remaining[0];
    const numMatch = candidate.match(/^(\d+[A-Z]?)\b(.*)/i);
    if (numMatch) {
      paon = numMatch[1].toUpperCase();
      const rest = numMatch[2].trim().replace(/^[\s-,]+/, "");
      if (rest) street = rest;
      remaining.shift();
      if (!street && remaining.length > 0) street = remaining[0];
    } else {
      paon = candidate;
      remaining.shift();
      if (remaining.length > 0) {
        street = remaining[0];
        remaining.shift();
      }
    }
  }
  return { saon, paon, street };
}

interface PurchaseAlert {
  tier: string;
  address: string;
  postcode: string;
  amountPence: number;
  customerEmail: string;
  sessionId: string;
  emailDelivered: boolean;
  ownershipNotable?: boolean;
}

async function notifyPurchaseTelegram(p: PurchaseAlert): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  const tierLabel =
    p.tier === "standard_plus" ? "Premium+" :
    p.tier === "standard_plus_upgrade" ? "Premium+ upgrade (£2)" :
    "Premium";
  const amount = `£${(p.amountPence / 100).toFixed(2)}`;
  const reportUrl = `https://www.homebuyercheck.co.uk/r/${p.sessionId.slice(-12)}`;
  const lines = [
    `💰 *HBC sale, ${amount} ${tierLabel}*`,
    "",
    `Address: ${p.address}`,
    `Postcode: ${p.postcode}`,
    `Buyer: ${p.customerEmail}`,
    `Email delivered: ${p.emailDelivered ? "✅" : "❌"}`,
    p.ownershipNotable ? "Owner: corporate flag ⚠" : "",
    "",
    `Report: ${reportUrl}`,
  ].filter(Boolean).join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("purchase telegram alert failed", err);
  }
}
