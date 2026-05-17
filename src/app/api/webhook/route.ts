import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaidReport } from "@/lib/apis/paidReport";
import { sendPropertyReportEmail } from "@/lib/email";
import { findAddressesByPostcode } from "@/lib/apis/geocode";

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
      // Resolve address
      const addresses = await findAddressesByPostcode(postcode);
      const address = uprn
        ? addresses.find((a) => a.uprn === uprn) ?? addresses[0]
        : addresses[0];
      if (!address) throw new Error("address_unresolvable");

      // Build full report (passes lease flag so paidReport.ts seeds pending block)
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
