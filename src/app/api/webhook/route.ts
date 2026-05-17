import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport, type PaidTier } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail } from "@/lib/email";
import { lookupPostcode } from "@/lib/apis/geocode";
import type { PostcodeAddress } from "@/lib/types";

export const runtime = "nodejs";

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

  await admin.from("stripe_events").upsert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  }, { onConflict: "id" });

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const tier = session.metadata?.tier as PaidTier | undefined;
  const postcode = session.metadata?.postcode;
  const uprn = session.metadata?.uprn;
  const fullAddressFromMeta = session.metadata?.full_address;
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

  if (!tier || !postcode || !customerEmail) {
    console.error("webhook missing fields", { tier, postcode, customerEmail });
    return NextResponse.json({ ok: true });
  }

  if (tier !== "standard") {
    // Only the £4.99 Standard tier is sold now. Legacy tiers from any earlier
    // version (premium, lease-only, standard-plus-lease) are ignored.
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
      console.error("email send threw — report still saved, but email failed", emailErr);
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
  const tierLabel = "Standard";
  const amount = `£${(p.amountPence / 100).toFixed(2)}`;
  const reportUrl = `https://www.homebuyercheck.co.uk/r/${p.sessionId.slice(-12)}`;
  const lines = [
    `💰 *HBC sale — ${amount} ${tierLabel}*`,
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
