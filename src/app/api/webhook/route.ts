import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail } from "@/lib/email";
import { findAddressesByPostcode, lookupPostcode } from "@/lib/apis/geocode";
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

  // Idempotency: log every event
  await admin.from("stripe_events").upsert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  }, { onConflict: "id" });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tier = session.metadata?.tier as "standard" | "premium" | "lease-only" | undefined;
    const postcode = session.metadata?.postcode;
    const uprn = session.metadata?.uprn;
    const fullAddressFromMeta = session.metadata?.full_address;
    const leaseAddon = session.metadata?.lease_addon === "1";
    const parentToken = session.metadata?.parent_token;
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

    if (!tier || !postcode || !customerEmail) {
      console.error("webhook missing fields", { tier, postcode, customerEmail });
      return NextResponse.json({ ok: true });
    }

    // Lease-only follow-on purchase — attach to existing parent report, queue fulfilment.
    if (tier === "lease-only") {
      try {
        const parent = parentToken
          ? await admin
              .from("reports")
              .select("id, data, customer_email, stripe_session_id")
              .ilike("stripe_session_id", `%${parentToken}`)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : null;
        const parentReport = parent?.data;
        if (!parentReport) {
          console.error("lease-only: parent report not found for token", parentToken);
        } else {
          const data = parentReport.data as unknown as import("@/lib/types").PaidReport | null;
          const fullAddress = data?.free?.property?.fullAddress ?? null;
          const titleNumber = data?.title?.titleNumber ?? null;

          await admin.from("lease_orders").insert({
            report_id: parentReport.id,
            stripe_session_id: session.id,
            status: "pending",
            customer_email: customerEmail,
            full_address: fullAddress,
            postcode,
            title_number: titleNumber,
            ordered_at: new Date().toISOString(),
            note: "Lease-only follow-on purchase",
          });

          // Update parent report's data.lease block to pending so /r/[token] reflects it.
          if (data) {
            const updated: import("@/lib/types").PaidReport = {
              ...data,
              lease: {
                status: "pending",
                orderedAt: new Date().toISOString(),
                note: "Ordered from HM Land Registry. Typical fulfilment 4-24 hours.",
              },
            };
            await admin
              .from("reports")
              .update({ data: updated as unknown as Record<string, unknown> })
              .eq("id", parentReport.id);
          }

          if (data) await notifyOperatorTelegram("lease", data, parentReport.stripe_session_id ?? session.id);

          await admin.from("conversion_events").insert({
            site_id: "homebuyercheck",
            event_type: "lease_addon_purchased",
            metadata: { postcode, session_id: session.id, parent_token: parentToken },
          });
        }
      } catch (err) {
        console.error("lease-only fulfilment failed", err);
      }
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
      // Resolve address — trust the address the buyer selected at /check.
      // The OS Places-based findAddressesByPostcode is unreliable (requires OS_DATA_HUB_KEY)
      // and would otherwise overwrite a real selected address with a postcode-only stub.
      const address = await resolveAddressFromMetadata(postcode, fullAddressFromMeta, uprn);
      if (!address) throw new Error("address_unresolvable");

      const report = await getPaidReport(address, tier, { leaseAddon });

      // Persist
      await admin
        .from("reports")
        .update({
          status: "ready",
          data: report as unknown as Record<string, unknown>,
          ready_at: new Date().toISOString(),
        })
        .eq("id", insertRow?.id);

      // Lease add-on: queue the manual fulfilment row + ping operator on Telegram
      if (leaseAddon && tier === "premium") {
        await admin.from("lease_orders").insert({
          report_id: insertRow?.id,
          stripe_session_id: session.id,
          status: "pending",
          customer_email: customerEmail,
          full_address: report.free.property.fullAddress ?? null,
          postcode: report.free.property.postcode,
          title_number: report.title?.titleNumber ?? null,
          ordered_at: new Date().toISOString(),
        });
        await notifyOperatorTelegram("lease", report, session.id);
      }

      // Send email + PDF — only mark email_sent=true if delivery succeeds
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

      // Conversion log
      await admin.from("conversion_events").insert({
        site_id: "homebuyercheck",
        event_type: "paid_report_completed",
        metadata: { tier, postcode, session_id: session.id, lease_addon: leaseAddon, email_delivered: emailDelivered },
      });
    } catch (err) {
      console.error("fulfilment failed", err);
      await admin
        .from("reports")
        .update({ status: "failed" })
        .eq("id", insertRow?.id);
    }
  }

  return NextResponse.json({ ok: true });
}

async function notifyOperatorTelegram(
  kind: "lease",
  report: import("@/lib/types").PaidReport,
  sessionId: string,
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  const address = report.free.property.fullAddress ?? report.free.property.postcode;
  const adminBase = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";
  const adminUrl = `${adminBase}/admin/${kind}/${encodeURIComponent(sessionId)}`;
  const titleNum = report.title?.titleNumber ?? "(no title number — search by address)";
  const hmlrUrl = report.title?.titleNumber
    ? `https://eservices.landregistry.gov.uk/wps/portal/Property_Search?titleNumber=${encodeURIComponent(report.title.titleNumber)}`
    : "https://eservices.landregistry.gov.uk/wps/portal/Property_Search";
  const text = [
    "📄 *Lease (OC2) order — fulfil within 48h*",
    "",
    `Address: ${address}`,
    `Title: ${titleNum}`,
    `Session: ${sessionId.slice(-12)}`,
    "",
    `1. Order from HMLR: ${hmlrUrl}`,
    `2. Upload the PDF: ${adminUrl}`,
  ].join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("telegram notify failed", err);
  }
}

/**
 * Build a PostcodeAddress for `getPaidReport` from the trusted Stripe checkout metadata.
 *
 * Strategy: trust the address the buyer selected at /check (came through `full_address`)
 * and parse it into PAON/SAON for HMLR title matching. Fill lat/lng/admin codes via
 * postcodes.io. Use OS Places ONLY if we have a UPRN + key (gives canonical AddressBase
 * fields). Never fall back to the postcode-only stub that overwrites the user's choice.
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

  // If we have a UPRN + OS key, prefer the canonical AddressBase record (cleanest paon/saon).
  if (uprn && process.env.OS_DATA_HUB_KEY) {
    const matches = await findAddressesByPostcode(formattedPostcode);
    const match = matches.find((a) => a.uprn === uprn);
    if (match) return match;
  }

  // Trust the buyer's selected fullAddress. Parse PAON/SAON from the string.
  const parts = parseAddressForHmlr(fullAddress ?? "");

  // Geocode via postcodes.io (free, no key) to get lat/lng + admin fields.
  let lat: number | undefined;
  let lng: number | undefined;
  let town: string | undefined;
  let region: string | undefined;
  let country: string | undefined;
  let lsoa: string | undefined;
  let msoa: string | undefined;
  let adminDistrictCode: string | undefined;
  let adminDistrictName: string | undefined;
  const geo = await lookupPostcode(formattedPostcode);
  if (geo) {
    lat = geo.lat;
    lng = geo.lng;
    town = geo.admin_district;
    region = geo.region;
    country = geo.country;
    lsoa = geo.lsoa;
    msoa = geo.msoa;
    adminDistrictCode = geo.admin_district;
    adminDistrictName = geo.admin_district;
  }

  return {
    uprn: uprn || undefined,
    fullAddress: fullAddress?.trim() || formattedPostcode,
    paon: parts.paon,
    saon: parts.saon,
    street: parts.street,
    postcode: formattedPostcode,
    lat,
    lng,
    town,
    region,
    country,
    lsoa,
    msoa,
    adminDistrictCode,
    adminDistrictName,
  };
}

/**
 * Parse a UK address string into PAON (principal address: building name or number) + SAON
 * (sub-address: flat/apartment number) for HM Land Registry title matching.
 *
 * Examples:
 *   "Apartment 604, Binnacle House, 10 Cobblestone Square, London"
 *     → { saon: "604", paon: "Binnacle House", street: "Cobblestone Square" }
 *   "Flat 12, Acacia Court, Kingsley Mews"
 *     → { saon: "12", paon: "Acacia Court", street: "Kingsley Mews" }
 *   "26 Parsons Close, Newbury"
 *     → { paon: "26", street: "Parsons Close" }
 *   "Penthouse, 1 The Square, Wapping"
 *     → { saon: "Penthouse", paon: "1", street: "The Square" }
 */
function parseAddressForHmlr(input: string): { saon?: string; paon?: string; street?: string } {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return {};

  // Strip postcode if present at end
  const noPostcode = trimmed.replace(/,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").trim();
  const segments = noPostcode.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return {};

  // Pattern: "Apartment 604" / "Flat 12B" / "Unit 5" / "Suite 3"
  const flatPrefix = /^(?:apartment|apt|flat|unit|suite|maisonette|penthouse|studio)\b\s*(\S*)/i;
  let saon: string | undefined;
  let paon: string | undefined;
  let street: string | undefined;
  let remaining = [...segments];

  const flatMatch = remaining[0].match(flatPrefix);
  if (flatMatch) {
    saon = (flatMatch[1] || remaining[0]).toUpperCase();
    remaining.shift();
  }

  // Next segment is usually the building/PAON
  if (remaining.length > 0) {
    const candidate = remaining[0];
    // If the candidate starts with a number, treat that as PAON
    const numMatch = candidate.match(/^(\d+[A-Z]?)\b(.*)/i);
    if (numMatch) {
      paon = numMatch[1].toUpperCase();
      const rest = numMatch[2].trim().replace(/^[\s-,]+/, "");
      if (rest) street = rest;
      remaining.shift();
      if (!street && remaining.length > 0) {
        street = remaining[0];
      }
    } else {
      paon = candidate;
      remaining.shift();
      // Next segment might be a number + street ("10 Cobblestone Square")
      if (remaining.length > 0) {
        const nextNumMatch = remaining[0].match(/^(\d+[A-Z]?)\s+(.*)/i);
        if (nextNumMatch) {
          // The number/street pair takes priority — replace PAON with the building number
          // when the original PAON wasn't a number (it was a building name then street #).
          // Actually keep building-name as PAON; treat as street.
          street = remaining[0];
          remaining.shift();
        } else {
          street = remaining[0];
          remaining.shift();
        }
      }
    }
  }

  return { saon, paon, street };
}
