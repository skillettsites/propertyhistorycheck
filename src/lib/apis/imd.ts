/**
 * Index of Multiple Deprivation 2025 by LSOA.
 * Static dataset ported from PostcodeCheck. Domains: income, employment,
 * education, health, crime, barriers (housing access), living environment.
 * Each is a decile 1-10 where 10 = least deprived.
 */

import imdRaw from "@/data/imd.json";

const data = imdRaw as Record<string, number[]>;

export interface IMDData {
  score: number;
  rank: number;
  decile: number; // 1 = most deprived, 10 = least deprived
  domains: {
    income: number;
    employment: number;
    education: number;
    health: number;
    crime: number;
    barriers: number;
    livingEnvironment: number;
  };
}

export function getIMD(lsoaCode: string | undefined): IMDData | undefined {
  if (!lsoaCode) return undefined;
  const entry = data[lsoaCode];
  if (!entry) return undefined;
  const [score, rank, decile, income, employment, education, health, crime, barriers, livingEnvironment] = entry;
  return {
    score, rank, decile,
    domains: { income, employment, education, health, crime, barriers, livingEnvironment },
  };
}
