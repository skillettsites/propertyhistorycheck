import { NextRequest, NextResponse } from "next/server";
import { getFreeReport } from "@/lib/apis";
import { logSearch } from "@/lib/search-tracking";

export const maxDuration = 30;

const POSTCODES_IO = "https://api.postcodes.io";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const address = body.address;
    // `fast` returns a "core" report (skips the slowest sources) so the results
    // page can paint immediately; the client requests the full report in parallel.
    const fast = Boolean(body.fast);
    if (!address?.postcode) {
      return NextResponse.json({ error: "address_required" }, { status: 400 });
    }

    // Backfill lat/lng/admin_district/region/lsoa from postcodes.io if missing
    if (!address.lat || !address.lng || !address.adminDistrictCode) {
      try {
        const cleaned = String(address.postcode).replace(/\s+/g, "");
        const lookupRes = await fetch(`${POSTCODES_IO}/postcodes/${encodeURIComponent(cleaned)}`, {
          next: { revalidate: 86400 * 30 },
          signal: AbortSignal.timeout(4000),
        });
        if (lookupRes.ok) {
          const data = await lookupRes.json();
          const r = data.result;
          if (r) {
            address.lat = address.lat ?? r.latitude;
            address.lng = address.lng ?? r.longitude;
            address.town = address.town ?? r.admin_district;
            address.region = address.region ?? r.region;
            address.country = address.country ?? r.country;
            address.adminDistrictCode = r.codes?.admin_district;
            address.adminDistrictName = r.admin_district;
            address.lsoa = r.codes?.lsoa;
            address.msoa = r.codes?.msoa;
          }
        }
      } catch {
        /* swallow */
      }
    }

    const report = await getFreeReport(address, { fast });

    // Only log once per search: the client fires both a fast and a full request
    // in parallel, so we attribute the search to the full (non-fast) call.
    if (!fast) {
      const geo = {
        city: req.headers.get("x-vercel-ip-city") || undefined,
        region: req.headers.get("x-vercel-ip-country-region") || undefined,
        country: req.headers.get("x-vercel-ip-country") || undefined,
      };
      // Log the full address (not just the postcode) so CommandCenter shows the
      // actual property people looked up. Fall back to postcode if no address text.
      const fullAddress =
        typeof address.fullAddress === "string" && address.fullAddress.trim()
          ? address.fullAddress.trim()
          : "";
      await logSearch(
        fullAddress || address.postcode,
        true,
        geo,
        fullAddress ? "address" : "postcode"
      );
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("free-report failed", err);
    return NextResponse.json({ error: "report_failed" }, { status: 500 });
  }
}
