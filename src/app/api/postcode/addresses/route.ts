import { NextRequest, NextResponse } from "next/server";
import { findAddressesByPostcode, lookupPostcode } from "@/lib/apis/geocode";

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json({ error: "postcode required" }, { status: 400 });
  }
  const [addresses, lookup] = await Promise.all([
    findAddressesByPostcode(postcode),
    lookupPostcode(postcode),
  ]);
  return NextResponse.json(
    { addresses, lookup },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" } }
  );
}
