import { NextRequest, NextResponse } from "next/server";
import { generateSellerQuestions } from "@/lib/apis/aiSellerQuestions";
import { generateSolicitorBrief } from "@/lib/apis/aiBriefs";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Runs generateSellerQuestions + generateSolicitorBrief against an existing
// stored PaidReport. Returns counts + first item per call so we can see if
// they're returning undefined OR returning a valid result.
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const token: string | undefined = body.token;
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("reports")
    .select("data")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !row?.data) {
    return NextResponse.json({ error: "report_not_found", supabaseError: error?.message });
  }
  const report = row.data as unknown as PaidReport;

  const t1 = Date.now();
  const sellerQ = await generateSellerQuestions(report).catch((e) => ({ error: String(e) }));
  const t2 = Date.now();
  const solicitor = await generateSolicitorBrief(report).catch((e) => ({ error: String(e) }));
  const t3 = Date.now();

  return NextResponse.json({
    token,
    sellerQuestions: {
      ms: t2 - t1,
      type: Array.isArray(sellerQ) ? "array" : typeof sellerQ,
      count: Array.isArray(sellerQ) ? sellerQ.length : undefined,
      isUndefined: sellerQ === undefined,
      firstItem: Array.isArray(sellerQ) && sellerQ[0] ? sellerQ[0] : null,
      errorObject: (sellerQ as { error?: string } | undefined)?.error,
    },
    solicitorBrief: {
      ms: t3 - t2,
      type: solicitor && typeof solicitor === "object" && "items" in solicitor ? "brief" : typeof solicitor,
      itemCount: (solicitor as { items?: unknown[] } | undefined)?.items?.length,
      isUndefined: solicitor === undefined,
      summary: (solicitor as { summary?: string } | undefined)?.summary,
      errorObject: (solicitor as { error?: string } | undefined)?.error,
    },
  });
}
