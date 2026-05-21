import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Directly tests the Anthropic API call from the same Lambda the production
// orchestrator uses, returning everything the SDK + fetch sees so we can
// diagnose why generateSellerQuestions / generateSolicitorBrief return undefined.
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ stage: "missing_key", env_keys: Object.keys(process.env).filter(k => k.startsWith("ANTHROPIC")) });
  }

  const t0 = Date.now();
  let stage = "before_fetch";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        temperature: 0,
        system: "Reply with exactly the JSON {\"ok\": true} and nothing else.",
        messages: [{ role: "user", content: "Test." }],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    stage = "after_fetch";
    const status = res.status;
    const text = await res.text();
    return NextResponse.json({
      keyLength: key.length,
      keyPrefix: key.slice(0, 12),
      status,
      ok: res.ok,
      elapsedMs: Date.now() - t0,
      bodyPreview: text.slice(0, 600),
      stage,
    });
  } catch (err) {
    return NextResponse.json({
      keyLength: key.length,
      stage,
      elapsedMs: Date.now() - t0,
      errorName: (err as Error)?.name,
      errorMessage: (err as Error)?.message,
    }, { status: 500 });
  }
}
