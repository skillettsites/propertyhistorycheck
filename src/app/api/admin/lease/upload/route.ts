import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const BUCKET = "lease-pdfs";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const adminKey = fd.get("adminKey");
  const sessionId = fd.get("sessionId");
  const file = fd.get("file");

  if (typeof adminKey !== "string" || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (typeof sessionId !== "string" || !sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the lease order and its parent report
  const { data: orderRow } = await admin
    .from("lease_orders")
    .select("id, report_id, customer_email")
    .eq("stripe_session_id", sessionId)
    .order("ordered_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!orderRow) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  // Upload to Supabase Storage
  const path = `${sessionId}/${Date.now()}-lease.pdf`;
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(arrayBuffer), {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadErr) {
    console.error("storage upload failed", uploadErr);
    return NextResponse.json({ error: "upload_failed", detail: uploadErr.message }, { status: 500 });
  }

  // Signed URL (valid 30 days, can re-mint on render of /r/[token])
  const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 30);
  const documentUrl = signed?.signedUrl ?? null;

  // Update order row
  const fulfilledAt = new Date().toISOString();
  await admin
    .from("lease_orders")
    .update({
      status: "ready",
      document_url: documentUrl,
      fulfilled_at: fulfilledAt,
    })
    .eq("id", orderRow.id);

  // Update the parent report's data.lease block so /r/[token] auto-shows the download
  if (orderRow.report_id) {
    const { data: rpt } = await admin
      .from("reports")
      .select("data")
      .eq("id", orderRow.report_id)
      .maybeSingle();
    const data = rpt?.data as unknown as PaidReport | null;
    if (data) {
      const updated: PaidReport = {
        ...data,
        lease: {
          status: "ready",
          orderedAt: data.lease?.orderedAt ?? fulfilledAt,
          fulfilledAt,
          documentUrl: documentUrl ?? undefined,
        },
      };
      await admin.from("reports").update({ data: updated as unknown as Record<string, unknown> }).eq("id", orderRow.report_id);
    }
  }

  // Email the buyer (best-effort, swallow errors)
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (orderRow.customer_email) {
      await resend.emails.send({
        from: "HomeBuyerCheck <reports@homebuyercheck.co.uk>",
        to: orderRow.customer_email,
        subject: "Your lease document is ready",
        html: `<p>Your registered lease (OC2) has arrived from HM Land Registry and is now available on your report.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk"}/r/${sessionId.slice(-12)}">Open your report</a></p>
<p>Direct PDF download: <a href="${documentUrl}">${documentUrl}</a> (link valid 30 days).</p>`,
      });
    }
  } catch (err) {
    console.error("resend email failed", err);
  }

  return NextResponse.json({ ok: true, documentUrl });
}
