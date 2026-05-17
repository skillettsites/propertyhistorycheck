import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";

export const runtime = "nodejs";

/**
 * Lightweight status check polled by /checkout/success while the webhook builds the report.
 * Returns just enough for the progress UI to decide what to do.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidReportToken(token)) {
    return NextResponse.json({ status: "invalid_token" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("reports")
    .select("status, email_sent")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    // Webhook hasn't inserted yet — Stripe may still be sending the event.
    return NextResponse.json({ status: "pending" }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ status: data.status, email_sent: data.email_sent }, { headers: { "Cache-Control": "no-store" } });
}
