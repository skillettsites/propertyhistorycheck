/**
 * Pure financial helper functions for the property report page.
 *
 * Used by:
 *  - MortgageCalculator
 *  - AffordabilityCheck
 *  - EnergyBillEstimate
 *  - InsuranceCostEstimate
 *  - PriceForecast
 *
 * No external dependencies, no API calls. All inputs in £ unless stated.
 */

import type { CrimeData, FloodRisk, GroundRisk, PriceSale } from "./types";

/* -------------------------------------------------------------------------- */
/* Mortgage                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Standard amortising monthly mortgage payment (capital + interest).
 *
 *   M = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 *  P = principal (loan amount)
 *  r = monthly interest rate (annualRate / 12)
 *  n = total months (termYears × 12)
 *
 * Returns 0 if principal <= 0. Handles 0% rate as straight-line repayment.
 */
export function monthlyMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const n = termYears * 12;
  if (annualRate <= 0) return principal / n;
  const r = annualRate / 100 / 12;
  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

/* -------------------------------------------------------------------------- */
/* Affordability                                                              */
/* -------------------------------------------------------------------------- */

/**
 * UK lender standard income multiple is 4.5x. Bank of England limits any single
 * lender to having no more than 15% of new mortgages above 4.5x, so this is the
 * de-facto ceiling for most buyers.
 */
export function maxMortgage(income: number, multiplier = 4.5): number {
  if (income <= 0) return 0;
  return Math.round(income * multiplier);
}

/* -------------------------------------------------------------------------- */
/* Energy                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Estimated annual energy cost (gas + electric, £) by EPC rating.
 *
 * Baseline figures are for a typical UK home of ~86 m² (national average).
 * Sources cross-checked against UK government Energy Performance of Buildings
 * stats and Ofgem's 2026 default tariff cap (£1,738/yr dual-fuel average).
 *
 * If floor area is given, scale linearly: bigger homes cost more to heat.
 */
const EPC_BASELINE: Record<string, number> = {
  A: 600,
  B: 800,
  C: 1_200,
  D: 1_600,
  E: 2_200,
  F: 2_800,
  G: 3_400,
};

export const UK_AVG_ENERGY_BILL = 1_738; // Ofgem 2026 default tariff cap (dual fuel, average use)
export const EPC_BASELINE_FLOOR_AREA = 86; // typical UK dwelling, m²

export function epcAnnualEnergyCost(rating?: string, floorAreaM2?: number): number {
  if (!rating) return UK_AVG_ENERGY_BILL;
  const base = EPC_BASELINE[rating.toUpperCase()] ?? UK_AVG_ENERGY_BILL;
  if (!floorAreaM2 || floorAreaM2 <= 0) return base;
  const scale = floorAreaM2 / EPC_BASELINE_FLOOR_AREA;
  return Math.round(base * scale);
}

/* -------------------------------------------------------------------------- */
/* Insurance                                                                  */
/* -------------------------------------------------------------------------- */

export interface InsuranceOpts {
  flood?: FloodRisk;
  crime?: CrimeData;
  groundRisk?: GroundRisk;
  propertyValue: number;
}

export interface InsuranceEstimate {
  estimate: number;
  low: number;
  high: number;
  drivers: string[];
}

/**
 * Composite insurance estimator. Base UK premium for a £300k semi-detached is
 * roughly £200/yr (combined buildings + contents). We apply multipliers based
 * on risk signals from the report, then scale by property value sublinearly
 * because premiums grow slower than rebuild value.
 *
 * This is informational only. Real quotes vary 3-5x based on rebuild cost,
 * claims history, security, occupation, and underwriter appetite.
 */
const BASE_PREMIUM = 200;
const BASE_VALUE = 300_000;

export function estimateInsuranceCost(opts: InsuranceOpts): InsuranceEstimate {
  const drivers: string[] = [];
  let multiplier = 1.0;

  // Flood risk
  if (opts.flood) {
    switch (opts.flood.riskLevel) {
      case "high":
        multiplier *= 3.0;
        drivers.push("High flood risk");
        break;
      case "medium":
        multiplier *= 1.8;
        drivers.push("Medium flood risk");
        break;
      case "low":
        multiplier *= 1.2;
        drivers.push("Low flood risk");
        break;
      // very-low: no adjustment
    }
  }

  // Crime
  if (opts.crime?.totalIncidents) {
    const annualised =
      opts.crime.monthsCovered > 0
        ? (opts.crime.totalIncidents / opts.crime.monthsCovered) * 12
        : opts.crime.totalIncidents;
    if (annualised > 3000) {
      multiplier *= 1.3;
      drivers.push("High local crime");
    } else if (annualised > 1500) {
      multiplier *= 1.15;
      drivers.push("Above-average crime");
    } else if (annualised < 500) {
      multiplier *= 0.95;
      drivers.push("Low local crime");
    }
  }

  // Ground risk (subsidence)
  if (opts.groundRisk) {
    const s = opts.groundRisk.shrinkSwell;
    if (s === "high" || s === "very-high" || s === "significant") {
      multiplier *= 1.5;
      drivers.push("Subsidence risk");
    } else if (s === "moderate") {
      multiplier *= 1.2;
      drivers.push("Moderate subsidence risk");
    }
  }

  // Property value scaling (sublinear, exponent 0.7)
  const valueScale = Math.pow(Math.max(opts.propertyValue, 50_000) / BASE_VALUE, 0.7);

  const estimate = Math.round(BASE_PREMIUM * multiplier * valueScale);

  return {
    estimate,
    low: Math.round(estimate * 0.8),
    high: Math.round(estimate * 1.2),
    drivers: drivers.length ? drivers : ["Standard risk profile"],
  };
}

/* -------------------------------------------------------------------------- */
/* Price forecast                                                             */
/* -------------------------------------------------------------------------- */

/**
 * UK regional 5-year average annual house price growth rates. Falls back to
 * 3.5% if region is unknown. Figures derived from Land Registry HPI 2020-2025.
 */
const REGIONAL_GROWTH: Record<string, number> = {
  "London": 0.012,
  "South East": 0.028,
  "South West": 0.032,
  "East": 0.030,
  "East of England": 0.030,
  "East Midlands": 0.041,
  "West Midlands": 0.038,
  "Yorkshire": 0.035,
  "Yorkshire and The Humber": 0.035,
  "North East": 0.045,
  "North West": 0.042,
  "Wales": 0.030,
  "Scotland": 0.035,
  "Northern Ireland": 0.040,
};

const DEFAULT_GROWTH = 0.035;

export interface ForecastResult {
  y1: number;
  y3: number;
  y5: number;
  growthRate: number;
  source: string;
}

/**
 * Simple linear extrapolation from postcode sales data when available, else
 * falls back to the regional 5-year HPI average.
 *
 * NOT a regulated valuation. This is a back-of-envelope projection for
 * informational use only.
 */
export function forecastPrice(
  currentValue: number,
  sales?: PriceSale[],
  region?: string,
): ForecastResult {
  let growthRate = DEFAULT_GROWTH;
  let source = `Regional HPI average (${region ?? "UK"})`;

  // Try to derive growth rate from postcode sales (need at least 3 years span)
  if (sales && sales.length >= 3) {
    const byYear = new Map<number, number[]>();
    for (const s of sales) {
      const y = new Date(s.date).getFullYear();
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y)!.push(s.price);
    }
    const yearlyAvg: Array<{ year: number; avg: number }> = [];
    for (const [year, prices] of byYear) {
      yearlyAvg.push({ year, avg: prices.reduce((a, b) => a + b, 0) / prices.length });
    }
    yearlyAvg.sort((a, b) => a.year - b.year);

    if (yearlyAvg.length >= 3) {
      const first = yearlyAvg[0];
      const last = yearlyAvg[yearlyAvg.length - 1];
      const yearsSpan = last.year - first.year;
      if (yearsSpan > 0 && first.avg > 0) {
        // CAGR
        const cagr = Math.pow(last.avg / first.avg, 1 / yearsSpan) - 1;
        // Clamp to a sane band, outliers from tiny sample sizes can produce silly numbers
        if (Number.isFinite(cagr) && cagr > -0.05 && cagr < 0.15) {
          growthRate = cagr;
          source = `Postcode sales ${first.year}-${last.year}`;
        }
      }
    }
  } else if (region) {
    const regional = REGIONAL_GROWTH[region];
    if (regional !== undefined) {
      growthRate = regional;
    }
  }

  if (region && source.startsWith("Regional")) {
    const regional = REGIONAL_GROWTH[region] ?? DEFAULT_GROWTH;
    growthRate = regional;
  }

  return {
    y1: Math.round(currentValue * Math.pow(1 + growthRate, 1)),
    y3: Math.round(currentValue * Math.pow(1 + growthRate, 3)),
    y5: Math.round(currentValue * Math.pow(1 + growthRate, 5)),
    growthRate,
    source,
  };
}
