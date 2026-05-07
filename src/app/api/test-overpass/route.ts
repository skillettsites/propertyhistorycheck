import { NextResponse } from "next/server";
import { getGreenspace } from "@/lib/apis/overpass";

export const maxDuration = 30;

export async function GET() {
  const start = Date.now();
  const lat = 51.5014, lng = -0.1419;
  const result = await getGreenspace(lat, lng);
  return NextResponse.json({
    elapsed_ms: Date.now() - start,
    result: result ?? null,
    parksCount: result?.parks?.length ?? 0,
  });
}
