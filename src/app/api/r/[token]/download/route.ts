import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import { generatePropertyReportPdf } from "@/lib/pdf/property-report";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Download the complete paid report as a PDF.
 * GET /api/r/{token}/download
 * Reads the stored PaidReport by token (last 12 chars of the Stripe session id)
 * and streams a single, cleanly-paginated PDF as an attachment.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isValidReportToken(token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("reports")
    .select("tier, data, status")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row?.data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const report = row.data as unknown as PaidReport;
  const tier: "standard" | "standard_plus" | "bundle" =
    row.tier === "bundle" ? "bundle" : row.tier === "standard_plus" ? "standard_plus" : "standard";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";

  try {
    const pdfBuffer = await generatePropertyReportPdf(report, tier, `${origin}/r/${token}`);
    const addr = (report.free?.property?.fullAddress || report.free?.property?.postcode || "report")
      .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HomeBuyerCheck-${addr}.pdf"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("pdf download failed", err);
    return NextResponse.json({ error: "pdf_failed" }, { status: 500 });
  }
}
