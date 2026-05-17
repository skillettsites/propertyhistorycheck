/**
 * Admin: rebuild a paid report.
 *
 * Use when a webhook fired with a broken/missing address (e.g. before the
 * resolveAddressFromMetadata fix). Re-runs getPaidReport using the buyer's
 * Stripe checkout metadata and overwrites the existing report row.
 *
 * Auth: ADMIN_KEY (shared secret, set in Vercel env).
 *
 * Usage:
 *   POST /api/admin/rebuild-report
 *   { "sessionId": "cs_live_...", "adminKey": "..." }
 */

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail } from "@/lib/email";
import { lookupPostcode, findAddressesByPostcode } from "@/lib/apis/geocode";
import type { PostcodeAddress } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  sessionId?: string;
  adminKey?: string;
  resendEmail?: boolean;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.adminKey || body.adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(body.sessionId);
  } catch (err) {
    console.error("admin/rebuild: stripe lookup failed", err);
    return NextResponse.json({ error: "stripe_session_not_found" }, { status: 404 });
  }

  const tier = session.metadata?.tier as "standard" | "premium" | undefined;
  const postcode = session.metadata?.postcode;
  const uprn = session.metadata?.uprn;
  const fullAddressFromMeta = session.metadata?.full_address;
  const leaseAddon = session.metadata?.lease_addon === "1";
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

  if (!tier || !postcode || !customerEmail) {
    return NextResponse.json({ error: "missing_metadata", tier, postcode, customerEmail }, { status: 400 });
  }

  const address = await resolveAddressFromMetadata(postcode, fullAddressFromMeta, uprn);
  if (!address) return NextResponse.json({ error: "address_unresolvable" }, { status: 500 });

  const admin = createAdminClient();

  // Upsert the report row.
  const report = await getPaidReport(address, tier, { leaseAddon });

  const { data: existing } = await admin
    .from("reports")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  let reportId: string | null = existing?.id ?? null;

  if (reportId) {
    await admin
      .from("reports")
      .update({
        tier,
        status: "ready",
        data: report as unknown as Record<string, unknown>,
        ready_at: new Date().toISOString(),
        customer_email: customerEmail,
        amount_paid: session.amount_total,
      })
      .eq("id", reportId);
  } else {
    const { data: ins } = await admin
      .from("reports")
      .insert({
        tier,
        status: "ready",
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        customer_email: customerEmail,
        amount_paid: session.amount_total,
        data: report as unknown as Record<string, unknown>,
        ready_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    reportId = ins?.id ?? null;
  }

  // Ensure a lease_orders row exists if leaseAddon was purchased.
  if (leaseAddon && tier === "premium" && reportId) {
    const { data: existingLease } = await admin
      .from("lease_orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (!existingLease) {
      await admin.from("lease_orders").insert({
        report_id: reportId,
        stripe_session_id: session.id,
        status: "pending",
        customer_email: customerEmail,
        full_address: report.free.property.fullAddress ?? null,
        postcode: report.free.property.postcode,
        title_number: report.title?.titleNumber ?? null,
        ordered_at: new Date().toISOString(),
        note: "Backfilled by admin/rebuild-report",
      });
    } else {
      // Update with the now-correct title number.
      await admin
        .from("lease_orders")
        .update({ title_number: report.title?.titleNumber ?? null })
        .eq("id", existingLease.id);
    }
  }

  // Optionally re-send the email.
  let emailDelivered = false;
  if (body.resendEmail !== false) {
    try {
      await sendPropertyReportEmail(customerEmail, report, tier, session.id);
      emailDelivered = true;
      await admin.from("reports").update({ email_sent: true }).eq("id", reportId!);
    } catch (err) {
      console.error("admin/rebuild: email send failed", err);
    }
  }

  return NextResponse.json({
    ok: true,
    sessionId: session.id,
    reportId,
    tier,
    addressUsed: {
      fullAddress: address.fullAddress,
      paon: address.paon,
      saon: address.saon,
      street: address.street,
      postcode: address.postcode,
    },
    titlePulled: Boolean(report.title?.titleNumber),
    titleNumber: report.title?.titleNumber ?? null,
    emailDelivered,
  });
}

async function resolveAddressFromMetadata(
  postcode: string,
  fullAddress: string | undefined,
  uprn: string | undefined,
): Promise<PostcodeAddress | null> {
  const cleanPostcode = postcode.trim().toUpperCase();
  const formattedPostcode = cleanPostcode.length >= 5
    ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`.replace(/\s+/g, " ")
    : cleanPostcode;

  if (uprn && process.env.OS_DATA_HUB_KEY) {
    const matches = await findAddressesByPostcode(formattedPostcode);
    const match = matches.find((a) => a.uprn === uprn);
    if (match) return match;
  }

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
