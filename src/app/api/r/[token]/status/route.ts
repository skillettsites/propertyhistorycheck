import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export interface PurchaseReadback {
  session_id: string;
  tier: string;
  amount_pence: number;
  currency: string;
}

/**
 * Read the paid amount and tier back from Stripe for the GA4 purchase event.
 * Only answers for a session that belongs to this token (new purchase: token
 * is the session id suffix; upgrade: metadata.existing_token is the token)
 * and only once Stripe says it is paid. Returns no personal data.
 */
async function readPurchase(sessionId: string, token: string): Promise<PurchaseReadback | null> {
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,}$/.test(sessionId)) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const belongs = sessionId.endsWith(token) || session.metadata?.existing_token === token;
    if (!belongs) return null;
    if (session.payment_status !== "paid") return null;
    const tier = session.metadata?.tier ?? "";
    if (!tier) return null;
    return {
      session_id: session.id,
      tier,
      amount_pence: session.amount_total ?? 0,
      currency: (session.currency ?? "gbp").toUpperCase(),
    };
  } catch (err) {
    console.error("status: purchase read-back failed", err);
    return null;
  }
}

/**
 * Lightweight status check polled by /checkout/success while the webhook builds the report.
 * Returns just enough for the progress UI to decide what to do. With
 * ?session_id=cs_... it also returns the paid tier and amount (from Stripe,
 * not the URL) so the page can fire the GA4 purchase event.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidReportToken(token)) {
    return NextResponse.json({ status: "invalid_token" }, { status: 400, headers: NO_STORE });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  const purchasePromise = sessionId ? readPurchase(sessionId, token) : Promise.resolve(null);

  const admin = createAdminClient();
  const { data } = await admin
    .from("reports")
    .select("status, email_sent")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const purchase = await purchasePromise;
  const extra = purchase ? { purchase } : {};

  if (!data) {
    // Webhook hasn't inserted yet, Stripe may still be sending the event.
    return NextResponse.json({ status: "pending", ...extra }, { headers: NO_STORE });
  }
  return NextResponse.json({ status: data.status, email_sent: data.email_sent, ...extra }, { headers: NO_STORE });
}
