import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  adminKey?: string;
  sessionId?: string;
  hrbRegistered?: boolean | null;
  rating?: string | null;
  assessedOn?: string | null;
  assessor?: string | null;
  documentUrl?: string | null;
  notes?: string | null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.adminKey || body.adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: orderRow } = await admin
    .from("ews1_orders")
    .select("id, report_id, customer_email, full_address")
    .eq("stripe_session_id", body.sessionId)
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!orderRow) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  const fulfilledAt = new Date().toISOString();

  await admin
    .from("ews1_orders")
    .update({
      status: "ready",
      hrb_registered: body.hrbRegistered ?? null,
      rating: body.rating ?? null,
      assessed_on: body.assessedOn ?? null,
      assessor: body.assessor ?? null,
      document_url: body.documentUrl ?? null,
      notes: body.notes ?? null,
      fulfilled_at: fulfilledAt,
    })
    .eq("id", orderRow.id);

  // Update parent report's data.ews1 block so /r/[token] auto-shows findings.
  if (orderRow.report_id) {
    const { data: rpt } = await admin
      .from("reports")
      .select("data")
      .eq("id", orderRow.report_id)
      .maybeSingle();
    const data = rpt?.data as unknown as PaidReport | null;
    if (data) {
      const ratingValue = body.rating ?? undefined;
      const validRatings = new Set(["A1", "A2", "A3", "B1", "B2", "Unknown"]);
      const updated: PaidReport = {
        ...data,
        ews1: {
          status: "ready",
          orderedAt: data.ews1?.orderedAt ?? fulfilledAt,
          fulfilledAt,
          hrbRegistered: body.hrbRegistered ?? undefined,
          rating: ratingValue && validRatings.has(ratingValue)
            ? (ratingValue as "A1" | "A2" | "A3" | "B1" | "B2" | "Unknown")
            : undefined,
          assessedOn: body.assessedOn ?? undefined,
          assessor: body.assessor ?? undefined,
          documentUrl: body.documentUrl ?? undefined,
          notes: body.notes ?? undefined,
        },
      };
      await admin.from("reports").update({ data: updated as unknown as Record<string, unknown> }).eq("id", orderRow.report_id);
    }
  }

  // Email buyer (best-effort)
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (orderRow.customer_email) {
      const ratingLine = body.rating ? `<p><strong>EWS1 rating found:</strong> ${body.rating}</p>` : "<p>No EWS1 form found on public registers.</p>";
      const hrbLine = body.hrbRegistered ? "<p><strong>BSR Higher-Risk Building:</strong> Yes — building is registered.</p>" : body.hrbRegistered === false ? "<p><strong>BSR Higher-Risk Building:</strong> No — not registered (building likely &lt; 18m).</p>" : "";
      const notesLine = body.notes ? `<p><em>${body.notes.replace(/</g, "&lt;")}</em></p>` : "";
      await resend.emails.send({
        from: "HomeBuyerCheck <reports@homebuyercheck.co.uk>",
        to: orderRow.customer_email,
        subject: "Your EWS1 cladding check is ready",
        html: `<p>Your EWS1 cladding check for ${orderRow.full_address ?? "the property"} is now available on your report.</p>${ratingLine}${hrbLine}${notesLine}<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk"}/r/${body.sessionId.slice(-12)}">Open your report</a></p>`,
      });
    }
  } catch (err) {
    console.error("resend email failed", err);
  }

  return NextResponse.json({ ok: true });
}
