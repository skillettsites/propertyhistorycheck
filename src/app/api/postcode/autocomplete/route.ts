import { NextRequest, NextResponse } from "next/server";
import { autocompletePostcode } from "@/lib/apis/geocode";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await autocompletePostcode(q);
  return NextResponse.json(
    { suggestions },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
