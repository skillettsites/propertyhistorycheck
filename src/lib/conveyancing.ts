/**
 * Conveyancing cost estimator for the /conveyancing-cost-calculator tool.
 *
 * Produces a realistic 2026 UK breakdown for BUYING a home: the solicitor's
 * legal fee plus the disbursements (searches, HM Land Registry registration,
 * bank transfer, ID/AML, and leasehold supplements). SDLT is deliberately
 * excluded here and surfaced separately, because it is a tax, not a
 * conveyancing cost, and has its own calculator.
 *
 * All figures are typical market ranges, not quotes. Sources: HomeOwners
 * Alliance / Muve / industry fee surveys for legal fees; HM Land Registry
 * Scale 1 (electronic) for registration fees; standard search-pack pricing.
 */

export interface ConveyancingInput {
  price: number;
  leasehold: boolean;
  mortgage: boolean;
  newBuild: boolean;
  coalArea: boolean;
}

export interface CostLine {
  label: string;
  low: number;
  high: number;
  note?: string;
}

export interface ConveyancingResult {
  legalFee: CostLine;
  disbursements: CostLine[];
  totalLow: number;
  totalHigh: number;
  sdltSeparateNote: string;
}

/** Typical solicitor legal fee (ex-VAT shown inclusive of VAT) by price band, freehold purchase. */
function baseLegalFee(price: number): { low: number; high: number } {
  if (price <= 100_000) return { low: 600, high: 950 };
  if (price <= 250_000) return { low: 800, high: 1150 };
  if (price <= 500_000) return { low: 1000, high: 1500 };
  if (price <= 750_000) return { low: 1300, high: 1900 };
  if (price <= 1_000_000) return { low: 1600, high: 2300 };
  // Above £1m fees often scale ~0.2% of price.
  const scaled = Math.round((price * 0.002) / 50) * 50;
  return { low: Math.max(2000, scaled), high: Math.max(2800, Math.round(scaled * 1.4)) };
}

/** HM Land Registry registration fee, Scale 1, electronic (online) lodgement, 2026. */
function hmlrRegistrationFee(price: number): number {
  if (price <= 80_000) return 20;
  if (price <= 100_000) return 40;
  if (price <= 200_000) return 100;
  if (price <= 500_000) return 150;
  if (price <= 1_000_000) return 295;
  return 500;
}

export function estimateConveyancing(input: ConveyancingInput): ConveyancingResult {
  const { price, leasehold, mortgage, newBuild, coalArea } = input;

  // Legal fee: base by band, plus supplements for the things that add work.
  const base = baseLegalFee(price);
  let feeLow = base.low;
  let feeHigh = base.high;
  const feeNotes: string[] = [];
  if (leasehold) { feeLow += 200; feeHigh += 350; feeNotes.push("leasehold +£200-£350"); }
  if (newBuild) { feeLow += 150; feeHigh += 300; feeNotes.push("new build +£150-£300"); }
  if (mortgage) { feeLow += 100; feeHigh += 200; feeNotes.push("acting for lender +£100-£200"); }

  const legalFee: CostLine = {
    label: "Solicitor / conveyancer legal fee (incl. VAT)",
    low: feeLow,
    high: feeHigh,
    note: feeNotes.length ? feeNotes.join(", ") : "freehold, cash purchase",
  };

  // Disbursements.
  const disbursements: CostLine[] = [];

  // Search pack.
  const searchLow = coalArea ? 280 : 250;
  const searchHigh = coalArea ? 510 : 450;
  disbursements.push({
    label: "Conveyancing search pack",
    low: searchLow,
    high: searchHigh,
    note: coalArea
      ? "local authority, drainage, environmental + coal mining (CON29M)"
      : "local authority, drainage & water, environmental",
  });

  // HM Land Registry registration.
  const hmlr = hmlrRegistrationFee(price);
  disbursements.push({
    label: "HM Land Registry registration fee",
    low: hmlr,
    high: hmlr,
    note: "Scale 1, electronic lodgement",
  });

  // Standard small disbursements.
  disbursements.push({
    label: "Other disbursements",
    low: 40,
    high: 90,
    note: "Land Registry priority + bankruptcy searches, ID / AML checks",
  });

  // Bank transfer fee (only with a mortgage / completion monies).
  if (mortgage) {
    disbursements.push({ label: "Telegraphic / CHAPS transfer fee", low: 25, high: 50 });
  }

  // Leasehold extras: management pack (LPE1), notice of transfer/charge, deed of covenant.
  if (leasehold) {
    disbursements.push({
      label: "Leasehold management pack & notices",
      low: 250,
      high: 800,
      note: "LPE1 pack from freeholder/managing agent + notice fees (set by the freeholder)",
    });
  }

  const totalLow = legalFee.low + disbursements.reduce((s, d) => s + d.low, 0);
  const totalHigh = legalFee.high + disbursements.reduce((s, d) => s + d.high, 0);

  return {
    legalFee,
    disbursements,
    totalLow,
    totalHigh,
    sdltSeparateNote:
      "Stamp Duty Land Tax (SDLT) is charged on top of this and depends on price, whether you are a first-time buyer, and whether it is an additional property. It is a tax, not a conveyancing fee, so it is not included in the totals above.",
  };
}
