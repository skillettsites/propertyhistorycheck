/**
 * HMLR CCOD (UK companies) + OCOD (overseas companies) ownership lookup.
 *
 * Free, OGL v3.0, England + Wales. Published 2nd working day of each month.
 * Ingested monthly via GitHub Action into Supabase tables `hmlr_ccod` and
 * `hmlr_ocod`.
 *
 * Use case: when a property's registered owner is a corporate entity, flag
 * that to the buyer (offshore vehicle, holding company, etc. — material
 * info for negotiation + searches). For OCOD specifically we also know the
 * country of incorporation.
 *
 * Honest unknowns: a missing match means "no corporate proprietor on
 * record" — i.e. probably an individual owner. We do NOT claim individual
 * ownership outright since the dataset is one month stale.
 */

import { createAdminClient } from "../supabase/admin";
import type { OwnershipFlag } from "../types";

function normalisePostcode(pc: string): string {
  return pc.replace(/\s+/g, "").toUpperCase();
}

function normaliseFragment(s: string | undefined): string {
  return (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

interface OwnerRow {
  title_number: string;
  postcode_normalised: string;
  property_address: string;
  proprietor_name: string;
  country_incorporated: string | null;
  source: "ccod" | "ocod";
}

export async function lookupOwnership(postcode: string, paon?: string, saon?: string): Promise<OwnershipFlag | undefined> {
  const admin = createAdminClient();
  const postcodeKey = normalisePostcode(postcode);

  // Read both ownership datasets in parallel.
  const [ccodRes, ocodRes] = await Promise.allSettled([
    admin
      .from("hmlr_ccod")
      .select("title_number, postcode_normalised, property_address, proprietor_name")
      .eq("postcode_normalised", postcodeKey)
      .limit(50),
    admin
      .from("hmlr_ocod")
      .select("title_number, postcode_normalised, property_address, proprietor_name, country_incorporated")
      .eq("postcode_normalised", postcodeKey)
      .limit(50),
  ]);

  const ccodRows: OwnerRow[] = ccodRes.status === "fulfilled" && ccodRes.value.data
    ? (ccodRes.value.data as Omit<OwnerRow, "source">[]).map((r) => ({ ...r, country_incorporated: null, source: "ccod" as const }))
    : [];
  const ocodRows: OwnerRow[] = ocodRes.status === "fulfilled" && ocodRes.value.data
    ? (ocodRes.value.data as Omit<OwnerRow, "source">[]).map((r) => ({ ...r, source: "ocod" as const }))
    : [];

  if (ccodRows.length === 0 && ocodRows.length === 0) {
    return { ukCompanyOwned: false, overseasOwned: false };
  }

  // Narrow by address fragments.
  const paonKey = normaliseFragment(paon);
  const saonKey = normaliseFragment(saon);
  const matchesAddress = (row: OwnerRow): boolean => {
    const addrKey = normaliseFragment(row.property_address);
    const paonHit = paonKey ? addrKey.includes(paonKey) : true;
    const saonHit = saonKey ? addrKey.includes(saonKey) : true;
    return paonHit && saonHit;
  };

  const ccodMatches = paonKey || saonKey ? ccodRows.filter(matchesAddress) : ccodRows;
  const ocodMatches = paonKey || saonKey ? ocodRows.filter(matchesAddress) : ocodRows;

  const proprietors = [
    ...new Set([...ccodMatches, ...ocodMatches].map((r) => r.proprietor_name).filter(Boolean)),
  ];
  const country = ocodMatches.find((r) => r.country_incorporated)?.country_incorporated ?? undefined;

  return {
    ukCompanyOwned: ccodMatches.length > 0,
    overseasOwned: ocodMatches.length > 0,
    proprietors: proprietors.length > 0 ? proprietors.slice(0, 4) : undefined,
    countryIncorporated: country ?? undefined,
  };
}
