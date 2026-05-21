import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import { generateNegotiationReport } from "@/lib/apis/negotiationReport";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
// Negotiation rationale uses Claude; allow up to 30s.
export const maxDuration = 30;

/**
 * Compute a Negotiation Report on-demand for a £6.99 Plus paid buyer.
 *
 * POST { askingPrice: number }
 *
 * Reads the stored PaidReport from Supabase using the token (last 12 chars of
 * the Stripe session id), validates the tier is `standard_plus`, computes a
 * fresh analysis (comps + BoE base rate + Land Registry UKHPI + flag
 * adjustments + AI rationale) and returns it.
 *
 * Not idempotent in the sense that re-running gives slightly different
 * AI rationale text, but numerical outputs are deterministic for the same
 * asking price.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidReportToken(token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  let body: { askingPrice?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const askingPriceRaw = body.askingPrice;
  const askingPrice =
    typeof askingPriceRaw === "number"
      ? askingPriceRaw
      : typeof askingPriceRaw === "string"
        ? parseFloat(askingPriceRaw)
        : NaN;

  if (!Number.isFinite(askingPrice) || askingPrice < 25_000 || askingPrice > 50_000_000) {
    return NextResponse.json({ error: "asking_price_out_of_range" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("reports")
    .select("data, tier, status")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "report_not_found" }, { status: 404 });
  }
  if (row.status !== "ready") {
    return NextResponse.json({ error: "report_not_ready" }, { status: 409 });
  }
  if (row.tier !== "standard_plus") {
    return NextResponse.json({ error: "tier_not_eligible", message: "The Negotiation Report is included with the £6.99 Premium+ tier." }, { status: 403 });
  }

  const paidReport = row.data as unknown as PaidReport;
  if (!paidReport || !paidReport.free) {
    return NextResponse.json({ error: "report_data_missing" }, { status: 500 });
  }

  try {
    const analysis = await generateNegotiationReport(paidReport, askingPrice);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Negotiation report failed", err);
    return NextResponse.json({ error: "negotiation_failed", message: String((err as Error)?.message ?? err) }, { status: 500 });
  }
}
