import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Monthly cron: download the latest HM Land Registry Price Paid increment and
 * upsert into the price_paid table. Triggered on the 1st of each month at 03:00 UTC.
 *
 * For MVP this is a stub, the full implementation streams the CSV
 * (~115-230MB / month) and upserts in batches. Run locally first to verify
 * the schema, then expose here.
 */
export async function GET() {
  // TODO: implement monthly Land Registry CSV ingestion.
  return NextResponse.json({ ok: true, note: "stub" });
}
