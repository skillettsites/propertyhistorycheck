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
    const tier = session.metadata?.tier as "standard" | "premium" | undefined;
    const postcode = session.metadata?.postcode;
    const uprn = session.metadata?.uprn;
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

    if (!tier || !postcode || !customerEmail) {
      console.error("webhook missing fields", { tier, postcode, customerEmail });
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

      // Build full report
      const report = await getPaidReport(address, tier);

      // Persist
      await admin
        .from("reports")
        .update({
          status: "ready",
          data: report as unknown as Record<string, unknown>,
          ready_at: new Date().toISOString(),
        })
        .eq("id", insertRow?.id);

      // Send email + PDF
      await sendPropertyReportEmail(customerEmail, report, tier, session.id);

      // Mark email sent
      await admin
        .from("reports")
        .update({ email_sent: true })
        .eq("id", insertRow?.id);

      // Conversion log
      await admin.from("conversion_events").insert({
        site_id: "propertyhistorycheck",
        event_type: "paid_report_completed",
        metadata: { tier, postcode, session_id: session.id },
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
