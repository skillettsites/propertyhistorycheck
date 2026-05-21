import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Returns env-var presence + length (NEVER values) so we can debug
// "Encrypted but empty?" symptoms without leaking secrets.
export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const names = [
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID_STANDARD",
    "STRIPE_PRICE_ID_STANDARD_PLUS",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "COMPANIES_HOUSE_API_KEY",
    "EPC_API_TOKEN",
    "EPC_API_KEY",
    "EPC_API_EMAIL",
    "GOOGLE_PLACES_API_KEY",
    "OFCOM_API_KEY",
    "CQC_API_KEY",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "ADMIN_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ];
  const out: Record<string, { present: boolean; length: number; startsWith: string }> = {};
  for (const n of names) {
    const v = process.env[n] ?? "";
    out[n] = { present: v.length > 0, length: v.length, startsWith: v.length > 0 ? v.slice(0, 6) + "…" : "" };
  }
  return NextResponse.json({ env: out, nodeEnv: process.env.NODE_ENV });
}
