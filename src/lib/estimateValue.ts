/**
 * Property value estimator.
 *
 * Combines:
 *  1. The property's own last sale, indexed up by HPI to today
 *  2. The postcode median (LR Price Paid)
 *  3. Same-property-type comps in the postcode (if EPC type matches)
 *
 * Returns a single point estimate plus a confidence band (roughly ±8%).
 */

import { FreeReport, PriceSale } from "./types";

const UK_HPI_AVG_GROWTH = 0.045; // ~4.5% per year long-run UK average

export interface ValueEstimate {
  estimate: number;
  lowEnd: number;
  highEnd: number;
  confidence: "low" | "medium" | "high";
  sources: Array<{ label: string; value: number; weight: number }>;
}

export function estimatePropertyValue(report: FreeReport): ValueEstimate | null {
  const sources: Array<{ label: string; value: number; weight: number }> = [];

  // 1. THIS property's most recent sale, indexed forward
  const sales = report.priceHistory?.sales ?? [];
  const ownLatest: PriceSale | undefined = sales[0]; // sorted desc by date
  if (ownLatest) {
    const yearsAgo = (Date.now() - new Date(ownLatest.date).getTime()) / (365.25 * 24 * 3600 * 1000);
    const indexed = ownLatest.price * Math.pow(1 + UK_HPI_AVG_GROWTH, yearsAgo);
    // Recent sales are the strongest signal
    const weight = yearsAgo < 2 ? 5 : yearsAgo < 5 ? 4 : yearsAgo < 10 ? 2.5 : 1.5;
    sources.push({
      label: `Last sold £${ownLatest.price.toLocaleString()} in ${new Date(ownLatest.date).getFullYear()} (HPI-indexed to today)`,
      value: indexed,
      weight,
    });
  }

  // 2. Postcode median across all property types
  const median = report.priceHistory?.postcodeMedian;
  if (median) {
    sources.push({
      label: `Postcode median (${report.priceHistory!.postcodeSampleSize} sales)`,
      value: median,
      weight: 2,
    });
  }

  // 3. Same-property-type comps in postcode
  const epcType = report.epc?.propertyType?.toLowerCase();
  const propertyTypeChar = mapEpcTypeToLrCode(epcType);
  if (propertyTypeChar && sales.length > 0) {
    const matches = sales.filter((s) => s.propertyType === propertyTypeChar);
    if (matches.length >= 2) {
      const sortedPrices = matches.map((s) => s.price).sort((a, b) => a - b);
      const sameTypeMedian = sortedPrices[Math.floor(sortedPrices.length / 2)];
      // Index forward by 2 years to bring older sales closer to today's prices
      const indexed = sameTypeMedian * Math.pow(1 + UK_HPI_AVG_GROWTH, 2);
      sources.push({
        label: `${matches.length} ${epcType ?? "similar"} sales in postcode (indexed)`,
        value: indexed,
        weight: 3,
      });
    }
  }

  if (sources.length === 0) return null;

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const weightedAvg = sources.reduce((sum, s) => sum + s.value * s.weight, 0) / totalWeight;
  const estimate = Math.round(weightedAvg / 1000) * 1000;

  // Confidence based on number + weight of inputs
  let confidence: ValueEstimate["confidence"] = "low";
  if (totalWeight >= 7) confidence = "high";
  else if (totalWeight >= 4) confidence = "medium";

  // Spread the band based on confidence
  const spread = confidence === "high" ? 0.06 : confidence === "medium" ? 0.10 : 0.15;

  return {
    estimate,
    lowEnd: Math.round((estimate * (1 - spread)) / 1000) * 1000,
    highEnd: Math.round((estimate * (1 + spread)) / 1000) * 1000,
    confidence,
    sources,
  };
}

function mapEpcTypeToLrCode(epcType?: string): "D" | "S" | "T" | "F" | "O" | undefined {
  if (!epcType) return undefined;
  const t = epcType.toLowerCase();
  if (t.includes("detached")) return "D";
  if (t.includes("semi")) return "S";
  if (t.includes("terrace") || t.includes("end-terrace") || t.includes("mid-terrace")) return "T";
  if (t.includes("flat") || t.includes("maisonette") || t.includes("apartment")) return "F";
  return "O";
}
