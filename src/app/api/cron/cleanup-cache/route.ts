import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = createAdminClient();
  const { error } = await admin.from("api_cache").delete().lt("expires_at", new Date().toISOString());
  if (error) {
    console.error("cache cleanup failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
