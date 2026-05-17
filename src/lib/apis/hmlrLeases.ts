/**
 * HMLR Registered Leases dataset lookup.
 *
 * Data source: gov.uk Use Land & Property Data — "Registered Leases" dataset.
 * Free, OGL v3.0, England + Wales, covers every registered lease >7 years.
 * Published 6th working day of each month. Ingested monthly via GitHub Action.
 *
 * Local mirror: Supabase table `hmlr_leases` (see migration).
 *   Columns: title_number, postcode_normalised, property_description, paon,
 *   saon, term_raw, term_years, lease_start_date, last_refreshed
 *
 * Matching strategy: postcode is the most reliable join. Within a postcode
 * we use paon (building number/name) + saon (flat/apt number) to narrow to
 * the specific leasehold title. If we can't match precisely we return null
 * (NOT a fake result) — the report will display "No registered lease found
 * in HMLR Leases dataset for this address" which is the honest answer.
 */

import { createAdminClient } from "../supabase/admin";
import type { LeaseholdInfo } from "../types";

function normalisePostcode(pc: string): string {
  return pc.replace(/\s+/g, "").toUpperCase();
}

function normaliseFragment(s: string | undefined): string {
  return (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function calculateYearsRemaining(termYears: number | null, startDate: string | null): number | null {
  if (!termYears || !startDate) return null;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + termYears);
  const remaining = (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(remaining));
}

interface LeaseRow {
  title_number: string;
  postcode_normalised: string;
  property_description: string;
  paon: string | null;
  saon: string | null;
  term_raw: string | null;
  term_years: number | null;
  lease_start_date: string | null;
  last_refreshed: string | null;
}

export async function lookupLease(postcode: string, paon?: string, saon?: string): Promise<LeaseholdInfo | undefined> {
  const admin = createAdminClient();
  const postcodeKey = normalisePostcode(postcode);

  // Fetch all leases for this postcode (typically 1-50 rows).
  const { data, error } = await admin
    .from("hmlr_leases")
    .select("title_number, postcode_normalised, property_description, paon, saon, term_raw, term_years, lease_start_date, last_refreshed")
    .eq("postcode_normalised", postcodeKey)
    .limit(100);

  if (error) {
    console.error("hmlr_leases query failed", error);
    return undefined;
  }
  if (!data || data.length === 0) {
    return { found: false };
  }

  const rows = data as LeaseRow[];

  // Try to narrow by paon + saon.
  const paonKey = normaliseFragment(paon);
  const saonKey = normaliseFragment(saon);

  let match: LeaseRow | undefined;
  if (saonKey || paonKey) {
    match = rows.find((r) => {
      const rPaon = normaliseFragment(r.paon ?? "");
      const rSaon = normaliseFragment(r.saon ?? "");
      const rDesc = normaliseFragment(r.property_description ?? "");
      const paonHit = paonKey ? (rPaon === paonKey || rDesc.includes(paonKey)) : true;
      const saonHit = saonKey ? (rSaon === saonKey || rDesc.includes(saonKey)) : true;
      return paonHit && saonHit;
    });
  }

  // If multiple leases for the address (rare: subdivided flats etc.) prefer the longest term.
  if (!match) {
    return { found: false };
  }

  const yearsRemaining = calculateYearsRemaining(match.term_years, match.lease_start_date);

  return {
    found: true,
    titleNumber: match.title_number,
    termYears: match.term_years ?? undefined,
    startDate: match.lease_start_date ?? undefined,
    yearsRemaining: yearsRemaining ?? undefined,
    termRaw: match.term_raw ?? undefined,
    sourcedAt: match.last_refreshed ?? undefined,
  };
}
