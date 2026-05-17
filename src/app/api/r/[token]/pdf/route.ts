import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken, buildReportUrl } from "@/lib/report-token";
import { generatePropertyReportPdf } from "@/lib/pdf/property-report";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ReportRow {
  id: string;
  tier: "standard" | "premium";
  status: string;
  data: PaidReport | null;
  stripe_session_id: string;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidReportToken(token)) return NextResponse.json({ error: "invalid_token" }, { status: 404 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select("id, tier, status, data, stripe_session_id")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const row = data as ReportRow;
  if (row.status !== "ready" || !row.data) {
    return NextResponse.json({ error: "not_ready" }, { status: 425 });
  }

  const liveUrl = buildReportUrl(row.stripe_session_id);
  const pdf = await generatePropertyReportPdf(row.data, row.tier, liveUrl);

  const safeAddress = (row.data.free.property.fullAddress || row.data.free.property.postcode || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="homebuyercheck-${safeAddress}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
