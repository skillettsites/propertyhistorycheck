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
  // Newest first.
  comps = [...comps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Focus on the RECENT market. Sales from 5+ years ago (even HPI-indexed)
  // systematically understate today's value, and when there are lots of them
  // they drown out the one or two genuinely recent same-type sales that best
  // reflect the current market. Use sales from the last 4 years; if there
  // aren't enough, fall back to the most recent 6 regardless of age.
  const RECENT_YEARS = 4;
  let windowed = comps.filter((s) => yearsSince(s.date) <= RECENT_YEARS);
  if (windowed.length < 4) windowed = comps.slice(0, 6);

  if (windowed.length >= 1) {
    let num = 0, den = 0, recentCount = 0;
    let mostRecentIndexed = 0, mostRecentYa = Infinity;
    for (const s of windowed) {
      const ya = yearsSince(s.date);
      if (ya <= 2) recentCount++;
      const indexed = hpiIndex(s.price, ya);
      if (ya < mostRecentYa) { mostRecentYa = ya; mostRecentIndexed = indexed; }
      // Exponential recency decay (~1.7yr half-life): a sale from this year
      // counts far more than one from four years ago.
      const w = Math.exp(-ya / 2.5);
      num += indexed * w;
      den += w;
    }
    let compValue = num / den;
    // A fresh same-type sale in the same postcode (e.g. the house next door) is
    // the single strongest piece of evidence for current value, so the estimate
    // must not come out materially BELOW it once indexed to today.
    compValue = Math.max(compValue, mostRecentIndexed * 0.97);
    const typeLabel = subjectType ? TYPE_LABEL[subjectType] || "comparable" : "comparable";
    // Comps lead the estimate: strong weight that grows with sample size + recency.
    const weight = Math.min(12, 5 + windowed.length * 0.5 + recentCount * 1.5);
    sources.push({
      label: `${windowed.length} recent ${typeLabel} sales in the postcode, recency-weighted & HPI-indexed`,
      value: compValue,
      weight,
    });
  }

  // 2. SECONDARY: this property's own last sale, indexed, decaying with age.
  // Kept deliberately weak when old so it can't drag the estimate below the
  // recent same-type comps.
  const ownLatest: PriceSale | undefined = ownSales[0]; // sorted desc by date
  if (ownLatest) {
    const ya = yearsSince(ownLatest.date);
    const weight = ya < 2 ? 6 : ya < 4 ? 3.5 : ya < 7 ? 1.5 : ya < 12 ? 0.7 : 0.4;
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

