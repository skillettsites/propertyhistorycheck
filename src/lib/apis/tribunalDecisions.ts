/**
 * Property Chamber (First-tier Tribunal) decisions lookup.
 *
 * Data source: gov.uk Search API + per-decision Content API. Ingested into
 * Supabase `tribunal_decisions` via daily GitHub Action.
 *
 * Strategy: match by postcode (strong key) then trigram-fuzzy on building
 * name / property address. Returns count + 3 most recent matching cases.
 *
 * Open Government Licence v3.0, re-use lawful + attributed.
 */

import { createAdminClient } from "../supabase/admin";

export interface TribunalDecision {
  slug: string;
  caseReference?: string;
  category?: string;
  propertyAddress?: string;
  buildingName?: string;
  applicantName?: string;
  respondentName?: string;
  decisionDate?: string;
  decisionSummary?: string;
  pdfUrl?: string;
  govUkUrl: string;
}

export interface TribunalHistory {
  /** Total matching decisions for this building/postcode. */
  count: number;
  /** Most recent decisions, up to 5. */
  recent: TribunalDecision[];
  /** Most common category (e.g. "Service charge disputes"). */
  topCategory?: string;
  /** Per-category counts. */
  byCategory: Record<string, number>;
}

function normalisePostcode(pc: string): string {
  return pc.replace(/\s+/g, "").toUpperCase();
}

function normaliseFragment(s: string | undefined): string {
  return (s ?? "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim();
}

interface DbRow {
  slug: string;
  case_reference: string | null;
  category: string | null;
  property_address: string | null;
  building_name: string | null;
  applicant_name: string | null;
  respondent_name: string | null;
  decision_date: string | null;
  decision_summary: string | null;
  pdf_url: string | null;
}

export async function lookupTribunalHistory(postcode: string, paon?: string, fullAddress?: string): Promise<TribunalHistory | undefined> {
  const admin = createAdminClient();
  const postcodeKey = normalisePostcode(postcode);
  if (!postcodeKey) return undefined;

  // First filter by postcode, should yield a small set (<200 typically).
  const { data, error } = await admin
    .from("tribunal_decisions")
    .select("slug, case_reference, category, property_address, building_name, applicant_name, respondent_name, decision_date, decision_summary, pdf_url")
    .eq("postcode_normalised", postcodeKey)
    .order("decision_date", { ascending: false })
    .limit(200);

  if (error) {
    console.error("tribunal_decisions query failed", error);
    return undefined;
  }
  if (!data || data.length === 0) {
    return { count: 0, recent: [], byCategory: {} };
  }

  let rows = data as DbRow[];

  // If we have a building/flat name, narrow by fuzzy match.
  const paonKey = normaliseFragment(paon);
  const addrKey = normaliseFragment(fullAddress);
  if (paonKey || addrKey) {
    const target = `${paonKey} ${addrKey}`.trim();
    rows = rows.filter((r) => {
      const candidate = normaliseFragment(`${r.building_name ?? ""} ${r.property_address ?? ""}`);
      if (!candidate) return false;
      // If the PAON appears in the candidate row, treat as a hit.
      if (paonKey && candidate.includes(paonKey)) return true;
      // Fall back to any address fragment overlap.
      if (addrKey && candidate.includes(addrKey.split(/\s+/)[0])) return true;
      return false;
    });
  }

  if (rows.length === 0) {
    // No precise building match, but there's history at the postcode level.
    // Worth surfacing as "X cases in this postcode" even if we can't pinpoint.
    rows = data as DbRow[];
  }

  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    const cat = r.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }
  const topCategory = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const recent: TribunalDecision[] = rows.slice(0, 5).map((r) => ({
    slug: r.slug,
    caseReference: r.case_reference ?? undefined,
    category: r.category ?? undefined,
    propertyAddress: r.property_address ?? undefined,
    buildingName: r.building_name ?? undefined,
    applicantName: r.applicant_name ?? undefined,
    respondentName: r.respondent_name ?? undefined,
    decisionDate: r.decision_date ?? undefined,
    decisionSummary: r.decision_summary ?? undefined,
    pdfUrl: r.pdf_url ?? undefined,
    govUkUrl: `https://www.gov.uk/residential-property-tribunal-decisions/${r.slug}`,
  }));

  return {
    count: rows.length,
    recent,
    topCategory,
    byCategory,
  };
}
