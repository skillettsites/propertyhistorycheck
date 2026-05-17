import { Resend } from "resend";
import { PaidReport } from "./types";
import { generatePropertyReportPdf } from "./pdf/property-report";
import { buildReportUrl } from "./report-token";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const FROM_EMAIL = "reports@homebuyercheck.co.uk";

export async function sendPropertyReportEmail(
  to: string,
  report: PaidReport,
  tier: "standard" | "premium",
  stripeSessionId: string
): Promise<void> {
  const address = report.free.property.fullAddress || report.free.property.postcode;
  const reportTitle = tier === "premium" ? "Premium Property Report" : "Standard Property Report";
  const subject = `${reportTitle}: ${address}`;
  const liveUrl = buildReportUrl(stripeSessionId);

  let attachments: { filename: string; content: Buffer }[] = [];
  try {
    const pdf = await generatePropertyReportPdf(report, tier, liveUrl);
    attachments = [{
      filename: `HomeBuyerCheck-${address.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`,
      content: pdf,
    }];
  } catch (err) {
    console.error("PDF generation failed", err);
  }

  const html = buildEmailHtml(report, tier, liveUrl);

  const sanitiseTag = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256);
  const tags = [
    { name: "tier", value: sanitiseTag(tier) },
    { name: "session_id", value: sanitiseTag(stripeSessionId) },
  ];

  try {
    await resend.emails.send({
      from: `HomeBuyerCheck <${FROM_EMAIL}>`,
      replyTo: "support@homebuyercheck.co.uk",
      to,
      subject,
      html,
      attachments,
      tags,
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@homebuyercheck.co.uk>",
      },
    });
  } catch (err) {
    console.error("Email send failed", err);
  }
}

function buildEmailHtml(
  report: PaidReport,
  tier: "standard" | "premium",
  liveUrl: string | null
): string {
  const address = report.free.property.fullAddress || report.free.property.postcode;
  const date = new Date(report.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const verdict = report.buyersVerdict ?? "";

  const ctaHtml = liveUrl ? `
    <div style="text-align:center;margin:24px 0 20px;">
      <a href="${liveUrl}" target="_blank" style="display:inline-block;padding:16px 36px;background:#1d4ed8;color:#fff;text-decoration:none;font-size:16px;font-weight:700;border-radius:8px;box-shadow:0 4px 12px rgba(29,78,216,0.25);">
        View Your Full Report &rarr;
      </a>
      <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">Access any time</p>
    </div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#0f172a,#1e3a8a);border-radius:12px 12px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">HomeBuyerCheck</h1>
      <p style="margin:8px 0 0;color:#cbd5e1;font-size:13px;">${tier === "premium" ? "Premium" : "Standard"} Property Report</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
      <div style="text-align:center;margin-bottom:20px;">
        <p style="margin:0;color:#111827;font-size:16px;font-weight:600;">${address}</p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Report generated on ${date}</p>
      </div>
      ${verdict ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-left:4px solid #0284c7;border-radius:6px;padding:14px 16px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0c4a6e;">Buyer&rsquo;s verdict</p>
        <p style="margin:0;font-size:13px;color:#1f2937;line-height:1.6;">${verdict}</p>
      </div>` : ""}
      ${ctaHtml}
      <div style="border-top:1px solid #e5e7eb;margin:24px 0 16px;"></div>
      <p style="text-align:center;font-size:12px;color:#6b7280;margin:0 0 8px;line-height:1.5;">Your report is also attached as a <strong>PDF</strong> for your records.</p>
      <p style="text-align:center;font-size:11px;color:#9ca3af;margin:0;line-height:1.5;">The online version is canonical &mdash; it reflects any corrections we&rsquo;ve made since delivery.</p>
    </div>
    <div style="text-align:center;padding:18px 16px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;margin-top:12px;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Delivered by <a href="https://www.homebuyercheck.co.uk" style="color:#3b82f6;text-decoration:none;">homebuyercheck.co.uk</a></p>
      <p style="margin:6px 0 0;font-size:10px;color:#c4c8cf;line-height:1.5;">Informational use only. Not a substitute for formal conveyancing searches by a qualified solicitor. See our <a href="https://www.homebuyercheck.co.uk/terms" style="color:#9ca3af;text-decoration:underline;">terms &amp; full disclaimer</a>.</p>
    </div>
  </div></body></html>`;
}
