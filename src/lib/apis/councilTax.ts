/**
 * Council tax — authority-level fallback.
 *
 * VOA has no clean API. We prefer:
 * 1. Postgres `council_tax_bands` row if seeded (per-postcode/PAON).
 * 2. Otherwise authority lookup via postcodes.io (`admin_district`) + a static
 *    Band D rate table to give an order-of-magnitude annual cost. The user is
 *    directed to gov.uk to find their exact band.
 */

import { createAdminClient } from "../supabase/admin";
import { CouncilTax } from "../types";

const POSTCODES_IO = "https://api.postcodes.io";

const BAND_RATIOS: Record<string, number> = {
  A: 6 / 9,
  B: 7 / 9,
  C: 8 / 9,
  D: 1,
  E: 11 / 9,
  F: 13 / 9,
  G: 15 / 9,
  H: 18 / 9,
};

// 2025/26 average UK Band D council tax = ~£2,280; vary slightly by region.
const REGIONAL_BAND_D: Record<string, number> = {
  London: 1820,
  "South East": 2360,
  "South West": 2330,
  "East of England": 2280,
  "East Midlands": 2310,
  "West Midlands": 2270,
  "Yorkshire and The Humber": 2280,
  "North East": 2320,
  "North West": 2280,
  Wales: 2200,
};

const DEFAULT_BAND_D = 2280;

export async function getCouncilTax(
  postcode: string,
  paon?: string
): Promise<CouncilTax | undefined> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();

  // Try DB first
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("council_tax_bands")
      .select("band, authority, band_d_amount")
      .eq("postcode", cleaned)
      .limit(20);
    if (data && data.length > 0) {
      const row = data[0];
      const ratio = BAND_RATIOS[row.band as string] ?? 1;
      const annual = row.band_d_amount ? Math.round(row.band_d_amount * ratio) : undefined;
      return {
        band: row.band as CouncilTax["band"],
        authority: row.authority as string,
        estimatedAnnualCost: annual,
      };
    }
  } catch {
    /* fall through */
  }

  // Fallback: postcodes.io for authority
  try {
    const res = await fetch(`${POSTCODES_IO}/postcodes/${encodeURIComponent(cleaned)}`, {
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const r = data.result;
    if (!r) return undefined;

    const region = r.region as string | undefined;
    const authority = r.admin_district as string | undefined;
    if (!authority) return undefined;
    const bandD = REGIONAL_BAND_D[region ?? ""] ?? DEFAULT_BAND_D;
    return {
      authority,
      estimatedAnnualCost: bandD,
      // band intentionally omitted — user directed to gov.uk for exact band
    };
  } catch {
    return undefined;
  }
  // Note: paon argument unused at MVP — placeholder for future per-property scrape integration.
  void paon;
}
