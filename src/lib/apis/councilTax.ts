/**
 * Council Tax lookup by ONS admin_district code.
 * Ported from PostcodeCheck — uses MHCLG 2026-27 dataset.
 */

import councilTaxRaw from "@/data/council-tax-bands.json";
import { CouncilTax } from "../types";

const BAND_MULTIPLIERS: Record<string, number> = {
  A: 6 / 9, B: 7 / 9, C: 8 / 9, D: 1,
  E: 11 / 9, F: 13 / 9, G: 15 / 9, H: 2,
};

const SCOTTISH_BAND_MULTIPLIERS: Record<string, number> = {
  A: 240 / 360, B: 280 / 360, C: 320 / 360, D: 1,
  E: 490.68 / 360, F: 585.48 / 360, G: 705 / 360, H: 882 / 360,
};

const REGIONAL_FALLBACKS: Record<string, number> = {
  "North East": 2400, "North West": 2380,
  "Yorkshire and The Humber": 2350, "East Midlands": 2430,
  "West Midlands": 2380, "East of England": 2400,
  London: 2200, "South East": 2450, "South West": 2480,
  Wales: 1850, Scotland: 1530, "Northern Ireland": 1350,
};

const data = councilTaxRaw as Record<string, { n: string; d: number }>;

export function getCouncilTax(opts: {
  adminDistrictCode?: string;
  adminDistrictName?: string;
  region?: string;
  country?: string;
  band?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
}): CouncilTax | undefined {
  const band = opts.band || "D";
  const code = opts.adminDistrictCode;

  if (code) {
    const entry = data[code];
    if (entry) {
      const isScotland = code.startsWith("S");
      const multipliers = isScotland ? SCOTTISH_BAND_MULTIPLIERS : BAND_MULTIPLIERS;
      const multiplier = multipliers[band] || 1;
      const annual = Math.round(entry.d * multiplier);
      return {
        band,
        estimatedAnnualCost: annual,
        monthlyAmount: Math.round(annual / 12),
        authority: entry.n,
        source: isScotland
          ? "Scottish Government 2025-26"
          : code.startsWith("W")
          ? "Welsh Government 2026-27"
          : code.startsWith("N")
          ? "NI rates equivalent"
          : "MHCLG 2026-27",
        isEstimate: false,
      };
    }
  }

  // Fallback by name match
  if (opts.adminDistrictName) {
    for (const [, entry] of Object.entries(data)) {
      if (entry.n.toLowerCase() === opts.adminDistrictName.toLowerCase()) {
        const multiplier = BAND_MULTIPLIERS[band] || 1;
        const annual = Math.round(entry.d * multiplier);
        return {
          band,
          estimatedAnnualCost: annual,
          monthlyAmount: Math.round(annual / 12),
          authority: entry.n,
          source: "MHCLG 2026-27",
          isEstimate: false,
        };
      }
    }
  }

  // Last fallback: regional average
  const fallback = REGIONAL_FALLBACKS[opts.region || ""] || REGIONAL_FALLBACKS[opts.country || ""];
  if (!fallback) return undefined;
  const annual = Math.round(fallback * (BAND_MULTIPLIERS[band] || 1));
  return {
    band,
    estimatedAnnualCost: annual,
    monthlyAmount: Math.round(annual / 12),
    authority: opts.adminDistrictName || "Local authority",
    source: "Regional estimate",
    isEstimate: true,
  };
}
