/**
 * UK Stamp Duty Land Tax (SDLT) calculator — England + NI rates 2026/27.
 * Wales uses LTT (different bands) — flagged but defaults to SDLT for now.
 * Scotland uses LBTT — also flagged.
 */

export type Country = "England" | "Wales" | "Scotland" | "Northern Ireland";

export interface SdltOptions {
  price: number;
  firstTimeBuyer?: boolean;
  additionalProperty?: boolean;
  country?: Country;
}

interface Band {
  upTo: number; // inclusive
  rate: number; // 0.05 = 5%
}

// England + NI standard residential rates (post April 2025 thresholds, valid 2026/27)
const STANDARD_BANDS: Band[] = [
  { upTo: 125_000, rate: 0 },
  { upTo: 250_000, rate: 0.02 },
  { upTo: 925_000, rate: 0.05 },
  { upTo: 1_500_000, rate: 0.10 },
  { upTo: Infinity, rate: 0.12 },
];

// First-time buyer relief (England + NI). Property must be £625k or less to qualify.
const FTB_BANDS: Band[] = [
  { upTo: 300_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: Infinity, rate: 0 }, // no relief above £500k — full SDLT applies
];
const FTB_MAX_PRICE = 500_000;

// Additional property surcharge (BTL, second home) — added on top of standard rates
const ADDITIONAL_SURCHARGE = 0.05;

export interface SdltResult {
  total: number;
  effectiveRate: number; // total / price
  breakdown: Array<{ band: string; rate: string; tax: number }>;
  notes: string[];
  appliedRelief?: "first-time-buyer" | null;
}

function applyBands(price: number, bands: Band[]): { tax: number; rows: SdltResult["breakdown"] } {
  let tax = 0;
  let prevThreshold = 0;
  const rows: SdltResult["breakdown"] = [];
  for (const band of bands) {
    if (price <= prevThreshold) break;
    const portion = Math.min(price, band.upTo) - prevThreshold;
    const portionTax = portion * band.rate;
    tax += portionTax;
    if (portion > 0) {
      rows.push({
        band: `£${prevThreshold.toLocaleString()} - £${band.upTo === Infinity ? "∞" : band.upTo.toLocaleString()}`,
        rate: `${(band.rate * 100).toFixed(0)}%`,
        tax: portionTax,
      });
    }
    prevThreshold = band.upTo;
  }
  return { tax, rows };
}

export function calculateSdlt(opts: SdltOptions): SdltResult {
  const { price, firstTimeBuyer, additionalProperty, country = "England" } = opts;
  const notes: string[] = [];

  if (country === "Scotland") notes.push("Scotland uses LBTT, not SDLT — figures here are for England rates as a guide.");
  if (country === "Wales") notes.push("Wales uses LTT, not SDLT — figures here are for England rates as a guide.");

  // First-time buyer relief
  let bandsToUse: Band[] = STANDARD_BANDS;
  let appliedRelief: SdltResult["appliedRelief"] = null;
  if (firstTimeBuyer && price <= FTB_MAX_PRICE && !additionalProperty) {
    bandsToUse = FTB_BANDS;
    appliedRelief = "first-time-buyer";
    notes.push("First-time buyer relief applied (price under £500,000 limit).");
  } else if (firstTimeBuyer && price > FTB_MAX_PRICE) {
    notes.push("First-time buyer relief unavailable: price exceeds £500,000 limit.");
  }

  const { tax, rows } = applyBands(price, bandsToUse);

  let surcharge = 0;
  if (additionalProperty) {
    surcharge = price * ADDITIONAL_SURCHARGE;
    notes.push("5% additional-property surcharge added (BTL or second home).");
  }

  const total = Math.round(tax + surcharge);
  return {
    total,
    effectiveRate: total / price,
    breakdown: rows,
    notes,
    appliedRelief,
  };
}
