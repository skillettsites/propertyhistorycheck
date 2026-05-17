/**
 * Demographics — ONS Census 2021 via Nomis API.
 * Free, no auth. Queries by LSOA code (from postcodes.io) for age/tenure/population.
 *
 * Returns population + tenure mix + median age + (when available) median household income.
 * Each component fetched in parallel; individual failures swallowed.
 */

import msoaIncome from "@/data/msoa-income.json";
import { Demographics } from "../types";

const NOMIS_BASE = "https://www.nomisweb.co.uk/api/v01/dataset";

async function fetchNomis(url: string): Promise<unknown | undefined> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 * 30 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

async function getPopulation(lsoaCode: string): Promise<number | undefined> {
  const url = `${NOMIS_BASE}/NM_2021_1.data.json?date=latest&geography=${lsoaCode}&measures=20100&select=obs_value`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await fetchNomis(url)) as any;
  const v = data?.obs?.[0]?.obs_value?.value;
  return v ? Number(v) : undefined;
}

async function getTenureMix(lsoaCode: string): Promise<Demographics["tenure"] | undefined> {
  // NM_2072_1 is the correct TS054 Tenure dataset (NM_2073_1 was TS055 Purpose of second address).
  const url = `${NOMIS_BASE}/NM_2072_1.data.json?date=latest&geography=${lsoaCode}&c2021_tenure_9=0,1,2,3,4,5,6,7,8&measures=20100&select=c2021_tenure_9,obs_value`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await fetchNomis(url)) as any;
  const obs: Array<{ c2021_tenure_9: { value: number }; obs_value: { value: number } }> = data?.obs ?? [];
  if (!obs.length) return undefined;
  let total = 0;
  let owner = 0, social = 0, privateRent = 0;
  for (const o of obs) {
    const cat = o.c2021_tenure_9.value;
    const n = Number(o.obs_value.value || 0);
    if (cat === 0) total = n;
    else if (cat === 1 || cat === 2 || cat === 3) owner += n;
    else if (cat === 4 || cat === 5) social += n;
    else if (cat === 6 || cat === 7) privateRent += n;
  }
  if (!total || total <= 0) return undefined;
  return {
    ownerOccupiedPct: Math.round((owner / total) * 100),
    socialRentPct: Math.round((social / total) * 100),
    privateRentPct: Math.round((privateRent / total) * 100),
  };
}

/**
 * Median age from Nomis NM_2020_1 (TS007A — Age by five-year age bands).
 *
 * The Nomis API returns counts per band, not a median directly. We compute
 * the median by finding the band that contains the (total/2)-th observation,
 * then linearly interpolating inside that band.
 *
 * Each band represents a 5-year span (e.g. 25-29). Linear interpolation:
 *   median = lowerBound + ((total/2 - cumulativeBefore) / countInBand) * bandWidth
 *
 * Edge bands ("4 and under" → 0-4 width 5; "85 and over" → width 10) handled
 * by mapping each cell value to (lowerBound, upperBound).
 */
async function getMedianAge(lsoaCode: string): Promise<number | undefined> {
  const url = `${NOMIS_BASE}/NM_2020_1.data.json?date=latest&geography=${lsoaCode}&measures=20100&select=c2021_age_19,obs_value`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await fetchNomis(url)) as any;
  const obs: Array<{ c2021_age_19: { value: number }; obs_value: { value: number } }> = data?.obs ?? [];
  if (!obs.length) return undefined;

  // Cell values 1..18 mapped to age bands. Cell 0 = total.
  // Width is 5 for bands 1-17; band 18 (85+) is unbounded — we use 10 as a conservative upper width.
  const bandRange = (cell: number): { lower: number; width: number } | undefined => {
    if (cell === 1) return { lower: 0, width: 5 };           // 0-4
    if (cell === 2) return { lower: 5, width: 5 };           // 5-9
    if (cell === 3) return { lower: 10, width: 5 };          // 10-14
    if (cell === 4) return { lower: 15, width: 5 };          // 15-19
    if (cell === 5) return { lower: 20, width: 5 };          // 20-24
    if (cell === 6) return { lower: 25, width: 5 };          // 25-29
    if (cell === 7) return { lower: 30, width: 5 };          // 30-34
    if (cell === 8) return { lower: 35, width: 5 };          // 35-39
    if (cell === 9) return { lower: 40, width: 5 };          // 40-44
    if (cell === 10) return { lower: 45, width: 5 };         // 45-49
    if (cell === 11) return { lower: 50, width: 5 };         // 50-54
    if (cell === 12) return { lower: 55, width: 5 };         // 55-59
    if (cell === 13) return { lower: 60, width: 5 };         // 60-64
    if (cell === 14) return { lower: 65, width: 5 };         // 65-69
    if (cell === 15) return { lower: 70, width: 5 };         // 70-74
    if (cell === 16) return { lower: 75, width: 5 };         // 75-79
    if (cell === 17) return { lower: 80, width: 5 };         // 80-84
    if (cell === 18) return { lower: 85, width: 10 };        // 85+
    return undefined;
  };

  const ordered: Array<{ lower: number; width: number; count: number }> = [];
  let total = 0;
  for (const o of obs) {
    const cell = o.c2021_age_19.value;
    if (cell === 0) {
      total = Number(o.obs_value.value || 0);
      continue;
    }
    const range = bandRange(cell);
    if (!range) continue;
    ordered.push({ ...range, count: Number(o.obs_value.value || 0) });
  }
  if (!total || !ordered.length) return undefined;
  ordered.sort((a, b) => a.lower - b.lower);

  const target = total / 2;
  let cumulative = 0;
  for (const band of ordered) {
    if (cumulative + band.count >= target) {
      if (band.count <= 0) return undefined;
      const median = band.lower + ((target - cumulative) / band.count) * band.width;
      return Math.round(median);
    }
    cumulative += band.count;
  }
  return undefined;
}

/**
 * Median household income.
 *
 * Now sourced from ONS Excel snapshot (vintage financial year ending 2023,
 * published 10 December 2025). The ONS "Income estimates for small areas in
 * England and Wales" dataset is published as a downloadable spreadsheet only
 * (Nomis does not expose it via API), so we ingest the xlsx at build time via
 * scripts/ingest-ons-income.mjs and serve the resulting JSON map.
 *
 * We use unequivalised "Net annual income" (disposable, before housing-cost
 * adjustment) — the rawest £ figure, which is what buyers think in.
 * Values are rounded to the nearest £100.
 */
async function getMedianHouseholdIncome(msoaCode: string): Promise<number | undefined> {
  return (msoaIncome as Record<string, number>)[msoaCode];
}

export async function getDemographics(
  lsoaCode: string | undefined,
  msoaCode?: string | undefined,
): Promise<Demographics | undefined> {
  if (!lsoaCode) return undefined;
  const [population, tenure, medianAge, medianHouseholdIncome] = await Promise.all([
    getPopulation(lsoaCode),
    getTenureMix(lsoaCode),
    getMedianAge(lsoaCode),
    msoaCode ? getMedianHouseholdIncome(msoaCode) : Promise.resolve(undefined),
  ]);
  if (!population && !tenure && !medianAge && !medianHouseholdIncome) return undefined;
  return {
    population: population ?? 0,
    source: "ONS Census 2021",
    tenure,
    medianAge,
    medianHouseholdIncome,
  };
}
