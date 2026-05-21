import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSolicitorBrief, generateSurveyorBrief, generateMortgageBrief } from "@/lib/apis/aiBriefs";
import { sendPropertyReportEmail } from "@/lib/email";
import type { PaidReport } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * QA test runner for the £2 Premium → Premium+ in-place upgrade flow.
 *
 * Bypasses Stripe — invokes the same logic the webhook's `handleUpgrade` does:
 *   1. Look up the existing Premium report row by token
 *   2. Validate it's tier=standard + status=ready
 *   3. Generate the three Premium+ AI briefs against the stored PaidReport
 *   4. Merge into the row + flip tier=standard_plus
 *   5. Send the Premium+ email
 *   6. Return the populated section counts
 *
 * Body: { tokens: ["abc...", ...], email?: "..." }  // email override; defaults to row.customer_email
 */

interface TokenResult {
  token: string;
  status: "ok" | "error";
  liveUrl?: string;
  emailDelivered?: boolean;
  populated?: Record<string, boolean | number>;
  error?: string;
  ms?: number;
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: { tokens?: string[]; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tokens = Array.isArray(body.tokens) ? body.tokens : [];
  const emailOverride = body.email?.trim();

  if (tokens.length === 0) {
    return NextResponse.json({ error: "tokens array required" }, { status: 400 });
  }
  if (tokens.length > 10) {
    return NextResponse.json({ error: "too_many_tokens (max 10)" }, { status: 400 });
  }

  const admin = createAdminClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.homebuyercheck.co.uk";

  const results: TokenResult[] = [];

  // Sequential — avoids Anthropic 16-concurrent-request silent-fail issue.
  for (const token of tokens) {
    const started = Date.now();
    try {
      const { data: row, error: lookupErr } = await admin
        .from("reports")
        .select("id, tier, data, status, customer_email")
        .ilike("stripe_session_id", `%${token}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lookupErr || !row?.data) {
        results.push({ token, status: "error", error: `lookup_failed: ${lookupErr?.message ?? "no row"}`, ms: Date.now() - started });
        continue;
      }
      if (row.status !== "ready") {
        results.push({ token, status: "error", error: `row_not_ready: status=${row.status}`, ms: Date.now() - started });
        continue;
      }
      if (row.tier === "standard_plus") {
        results.push({ token, status: "error", error: "row_already_standard_plus", ms: Date.now() - started });
        continue;
      }

      const existing = row.data as unknown as PaidReport;
      const [solicitor, surveyor, mortgage] = await Promise.all([
        generateSolicitorBrief(existing),
        generateSurveyorBrief(existing),
        generateMortgageBrief(existing),
      ]);

      const upgraded: PaidReport = {
        ...existing,
        solicitorBrief: solicitor,
        surveyorBrief: surveyor,
        mortgageBrief: mortgage,
      };

      await admin
        .from("reports")
        .update({
          tier: "standard_plus",
          data: upgraded as unknown as Record<string, unknown>,
          ready_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      const customerEmail = emailOverride ?? row.customer_email;
      let emailDelivered = false;
      let emailErr: string | undefined;
      if (customerEmail) {
        try {
          // Reuse the original token for the URL — pass a session-id-shaped string ending in the token.
          await sendPropertyReportEmail(customerEmail, upgraded, "standard_plus", `pad${token}`);
          emailDelivered = true;
        } catch (e) {
          emailErr = String((e as Error)?.message ?? e);
        }
      }

      await admin.from("reports").update({ email_sent: emailDelivered }).eq("id", row.id);

      results.push({
        token,
        status: "ok",
        liveUrl: `${origin}/r/${token}`,
        emailDelivered,
        populated: {
          plus_solicitor_brief_items: solicitor?.items?.length ?? 0,
          plus_surveyor_brief_items: surveyor?.items?.length ?? 0,
          plus_mortgage_brief_items: mortgage?.items?.length ?? 0,
        },
        error: emailErr,
        ms: Date.now() - started,
      });
    } catch (err) {
      results.push({ token, status: "error", error: String((err as Error)?.message ?? err), ms: Date.now() - started });
    }
  }

  return NextResponse.json({ count: results.length, results });
}
