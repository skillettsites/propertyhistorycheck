/**
 * Demographics — ONS Census 2021 via Nomis API.
 * Free, no auth. Queries by LSOA code (from postcodes.io).
 *
 * Returns population + tenure mix (owner-occupied / social rent / private rent).
 * Each component fetched in parallel; individual failures swallowed.
 */

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
  const url = `${NOMIS_BASE}/NM_2073_1.data.json?date=latest&geography=${lsoaCode}&c2021_tenure_9=0,1,2,3,4,5,6,7,8&measures=20100&select=c2021_tenure_9,obs_value`;
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

export async function getDemographics(lsoaCode: string | undefined): Promise<Demographics | undefined> {
  if (!lsoaCode) return undefined;
  const [population, tenure] = await Promise.all([
    getPopulation(lsoaCode),
    getTenureMix(lsoaCode),
  ]);
  if (!population && !tenure) return undefined;
  return {
    population: population ?? 0,
    source: "ONS Census 2021",
    tenure,
  };
}
