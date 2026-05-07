/**
 * Demographics — ONS Census 2021 via Nomis API.
 * Free, no auth. Queries by LSOA code (from postcodes.io).
 *
 * Datasets:
 *  - NM_2021_1: Usual resident population
 *  - NM_2099_1: Tenure of household (owner-occupied / rented)
 *  - NM_2078_1: Age in 5-year bands
 *
 * For a fast MVP we query usual-resident population at MSOA level (faster
 * + less geography lookup) and skip the heavier breakdowns. Returns
 * undefined if the LSOA isn't recognised.
 */

const NOMIS_BASE = "https://www.nomisweb.co.uk/api/v01/dataset";

export interface Demographics {
  population: number;
  source: string;
}

// LSOA21 codes start with E01 (England) or W01 (Wales).
// Nomis geography ids for LSOAs are computed via the area lookup endpoint,
// but for MVP we use the Nomis "type 154" code which equals 1207000000 + sequential id.
// Simpler: query the population-by-place dataset with the LSOA21 code directly.

export async function getDemographics(lsoaCode: string | undefined): Promise<Demographics | undefined> {
  if (!lsoaCode) return undefined;
  try {
    const url =
      `${NOMIS_BASE}/NM_2021_1.data.json` +
      `?date=latest&geography=${lsoaCode}&measures=20100&select=obs_value`;
    const res = await fetch(url, {
      next: { revalidate: 86400 * 30 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const obs = data?.obs?.[0];
    const population = Number(obs?.obs_value?.value ?? 0);
    if (!population) return undefined;
    return {
      population,
      source: "ONS Census 2021",
    };
  } catch {
    return undefined;
  }
}
