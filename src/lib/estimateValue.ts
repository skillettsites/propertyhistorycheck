/**
 * Property value estimator.
 *
 * The dominant signal is RECENT, SAME-TYPE comparable sales in the postcode,
 * each indexed to today by HPI and recency-weighted so a sale from a few months
 * ago counts for far more than one from five years ago. The property's own last
 * sale is a secondary signal that decays with age, and the all-types postcode
 * median is only a thin-data fallback (it mixes flats, terraces and houses, so
 * it badly understates a semi/detached if used as a primary anchor).
 *
 * Returns a single point estimate plus a confidence band.
 */

import { FreeReport, PriceSale } from "./types";

const UK_HPI_AVG_GROWTH = 0.045; // ~4.5% per year long-run UK average
const YEAR_MS = 365.25 * 24 * 3600 * 1000;

// Land Registry records include garages, parking spaces, lease extensions and
// shared-ownership fractions that sell for a few thousand pounds. They are not
// habitable-property values and wreck a median (e.g. a £19k transaction pulling
// a Tewkesbury house estimate down). Exclude transactions below this floor.
const MIN_PLAUSIBLE_PRICE = 25_000;

const TYPE_LABEL: Record<string, string> = {
  D: "detached", S: "semi-detached", T: "terraced", F: "flat", O: "",
};

export interface ValueEstimate {
  estimate: number;
  lowEnd: number;
  highEnd: number;
  confidence: "low" | "medium" | "high";
  sources: Array<{ label: string; value: number; weight: number }>;
}

const yearsSince = (date: string) => Math.max(0, (Date.now() - new Date(date).getTime()) / YEAR_MS);
const hpiIndex = (price: number, yearsAgo: number) => price * Math.pow(1 + UK_HPI_AVG_GROWTH, yearsAgo);

export function estimatePropertyValue(report: FreeReport): ValueEstimate | null {
  const sources: Array<{ label: string; value: number; weight: number }> = [];

  // Subject property type: EPC first, else this property's own Land Registry record.
  const ownSales = (report.priceHistory?.sales ?? []).filter((s) => s.price >= MIN_PLAUSIBLE_PRICE);
  const subjectType =
    mapEpcType(report.epc?.propertyType) ?? ownSales.find((s) => s.propertyType)?.propertyType;

  // 1. PRIMARY: recent same-type comparable sales, HPI-indexed and recency-weighted.
  let comps = (report.priceHistory?.similarSales ?? []).filter((s) => s.price >= MIN_PLAUSIBLE_PRICE);
  if (subjectType) {
    // Keep same-type comps (records with no type are kept rather than discarded),
    // but only narrow if doing so still leaves a usable sample.
    const typed = comps.filter((s) => !s.propertyType || s.propertyType === subjectType);
    if (typed.length >= 2) comps = typed;
  }
  comps = comps.slice(0, 12);

  if (comps.length >= 1) {
    let num = 0, den = 0;
    let recentCount = 0;
    for (const s of comps) {
      const ya = yearsSince(s.date);
      if (ya <= 3) recentCount++;
      const indexed = hpiIndex(s.price, ya);
      // Recency weight: a sale this year counts ~5x a five-year-old one.
      const rw = 1 / (1 + ya * 0.9);
      num += indexed * rw;
      den += rw;
    }
    const compValue = num / den;
    const typeLabel = subjectType ? TYPE_LABEL[subjectType] || "comparable" : "comparable";
    // Comps lead the estimate: weight grows with sample size and how many are recent.
    const weight = Math.min(11, 4 + comps.length * 0.5 + recentCount);
    sources.push({
      label: `${comps.length} ${typeLabel} sales in the postcode, recency-weighted & HPI-indexed`,
      value: compValue,
      weight,
    });
  }

  // 2. SECONDARY: this property's own last sale, indexed, decaying with age.
  const ownLatest: PriceSale | undefined = ownSales[0]; // sorted desc by date
  if (ownLatest) {
    const ya = yearsSince(ownLatest.date);
    const weight = ya < 2 ? 6 : ya < 4 ? 4 : ya < 7 ? 2 : ya < 12 ? 1 : 0.5;
    sources.push({
      label: `This property last sold £${ownLatest.price.toLocaleString()} in ${new Date(ownLatest.date).getFullYear()} (HPI-indexed to today)`,
      value: hpiIndex(ownLatest.price, ya),
      weight,
    });
  }

  // 3. FALLBACK ONLY: all-types postcode median. Mixes flats/terraces/houses, so
  // it's a poor anchor for a specific house and is used only when comps are thin.
  const median = report.priceHistory?.postcodeMedian;
  if (comps.length < 3 && median && median >= MIN_PLAUSIBLE_PRICE) {
    sources.push({
      label: `Postcode median, all property types (${report.priceHistory!.postcodeSampleSize} sales)`,
      value: median,
      weight: 1.5,
    });
  }

  if (sources.length === 0) return null;

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const weightedAvg = sources.reduce((sum, s) => sum + s.value * s.weight, 0) / totalWeight;
  const estimate = Math.round(weightedAvg / 1000) * 1000;

  // Confidence is driven by how much recent same-type evidence we have.
  const recentComps = comps.filter((s) => yearsSince(s.date) <= 3).length;
  let confidence: ValueEstimate["confidence"] = "low";
  if (recentComps >= 3 || (comps.length >= 4 && recentComps >= 1)) confidence = "high";
  else if (comps.length >= 2 || totalWeight >= 5) confidence = "medium";

  const spread = confidence === "high" ? 0.06 : confidence === "medium" ? 0.10 : 0.15;

  return {
    estimate,
    lowEnd: Math.round((estimate * (1 - spread)) / 1000) * 1000,
    highEnd: Math.round((estimate * (1 + spread)) / 1000) * 1000,
    confidence,
    sources,
  };
}

function mapEpcType(epcType?: string): "D" | "S" | "T" | "F" | "O" | undefined {
  if (!epcType) return undefined;
  const t = epcType.toLowerCase();
  if (t.includes("detached") && !t.includes("semi")) return "D";
  if (t.includes("semi")) return "S";
  if (t.includes("terrace")) return "T";
  if (t.includes("flat") || t.includes("maisonette") || t.includes("apartment")) return "F";
  return undefined;
}

