import { NextRequest, NextResponse } from "next/server";
import { getFreeReport } from "@/lib/apis";
import { lookupPostcode } from "@/lib/apis/geocode";
import { logSearch } from "@/lib/search-tracking";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const address = body.address;
    if (!address?.postcode) {
      return NextResponse.json({ error: "address_required" }, { status: 400 });
    }

    // Backfill lat/lng if missing (geocode by postcode)
    if (!address.lat || !address.lng) {
      const lookup = await lookupPostcode(address.postcode);
      if (lookup) {
        address.lat = lookup.lat;
        address.lng = lookup.lng;
        if (!address.town) address.town = lookup.admin_district;
      }
    }

    const report = await getFreeReport(address);

    const geo = {
      city: req.headers.get("x-vercel-ip-city") || undefined,
      region: req.headers.get("x-vercel-ip-country-region") || undefined,
      country: req.headers.get("x-vercel-ip-country") || undefined,
    };
    await logSearch(address.postcode, true, geo);

    return NextResponse.json({ report });
  } catch (err) {
    console.error("free-report failed", err);
    return NextResponse.json({ error: "report_failed" }, { status: 500 });
  }
}
