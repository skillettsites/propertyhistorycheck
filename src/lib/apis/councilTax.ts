/**
 * Council Tax band.
 *
 * VOA has no clean API. Two paths:
 *  1. Pre-cached batch in Postgres (table: council_tax_bands), refreshed quarterly.
 *  2. On-miss, fall back to a paid API (PropertyData / Crystal Roof) if configured.
 *
 * Annual cost is computed from band × authority's published Band D rate.
 */

import { createAdminClient } from "../supabase/admin";
import { CouncilTax } from "../types";

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

export async function getCouncilTax(
  postcode: string,
  paon?: string,
  authority?: string
): Promise<CouncilTax | undefined> {
  const admin = createAdminClient();
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();

  let query = admin
    .from("council_tax_bands")
    .select("band, authority, band_d_amount")
    .eq("postcode", cleaned)
    .limit(20);

  const { data } = await query;

  let row: { band: string; authority: string; band_d_amount: number | null } | null = null;
  if (data && data.length) {
    row = paon
      ? null // upstream caller does paon match if needed; row-level matching not in MVP
      : data[0];
    if (!row) row = data[0];
  }

  if (!row) {
    if (authority) return { authority };
    return undefined;
  }

  const bandRatio = BAND_RATIOS[row.band] ?? 1;
  const annual = row.band_d_amount ? Math.round(row.band_d_amount * bandRatio) : undefined;
  return {
    band: row.band as CouncilTax["band"],
    authority: row.authority,
    estimatedAnnualCost: annual,
  };
}
