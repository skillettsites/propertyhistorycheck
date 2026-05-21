/**
 * Negotiation Report — invoked on demand when a £6.99 Plus buyer enters an
 * asking price on the report page.
 *
 * Inputs:
 *   - PaidReport (already paid for, contains comps + flags + ownership + EPC)
 *   - Asking price (buyer-entered)
 *
 * Outputs (NegotiationAnalysis):
 *   - Suggested offer range derived from comps + market trend + flag adjustments
 *   - Comparables table
 *   - Market context (BoE base rate, Land Registry UKHPI annual change)
 *   - Numerical adjustments per flag (each with rationale)
 *   - Affordability sketch (monthly mortgage at 75% LTV, BoE + 1.5pp 5-yr fix)
 *   - AI-composed rationale paragraph
 *   - Honest caveat
 *
 * Data sources — all free, all OGL v3.0:
 *   - Land Registry SPARQL Price Paid (already pulled in PaidReport.free)
 *   - Bank of England IADB Bank Rate API
 *   - Land Registry UKHPI per local authority
 *   - Anthropic Claude for the rationale text only — never invents data.
 */

import type {
  PaidReport,
  PostcodeAddress,
  PriceSale,
  NegotiationAnalysis,
  NegotiationComp,
  NegotiationAdjustment,
} from "../types";

// Bank of England IADB — Bank Rate (IUDBEDR) + 5Y nominal zero-coupon gilt
// yield (IUDSNZC, market-implied 5-year horizon) + 20Y nominal zero-coupon
// gilt yield (IUDLNZC, long-horizon market expectation). Daily updates, free.
const BOE_RATE_URL =
  "https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=01/Jan/2024&Dateto=31/Dec/2030&SeriesCodes=IUDBEDR,IUDSNZC,IUDLNZC&CSVF=TT&UsingCodes=Y&Filter=N&title=BoEMarket&VPD=Y";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const TIMEOUT_MS = 60_000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateNegotiationReport(
  report: PaidReport,
  askingPrice: number,
): Promise<NegotiationAnalysis> {
  if (!Number.isFinite(askingPrice) || askingPrice < 25_000 || askingPrice > 50_000_000) {
    throw new Error("asking_price_out_of_range");
  }

  // 1. Pull market context — BoE Bank Rate + market-implied forward rates
  // (5Y + 20Y gilt yields) + UKHPI for this LAD — in parallel.
  const localAuthority = report.free.property.adminDistrictName;
  const ladCode = report.free.property.adminDistrictCode;
  const [boeMarket, ukhpi] = await Promise.all([
    fetchBoeMarketContext().catch(() => undefined),
    fetchUkhpi(ladCode).catch(() => undefined),
  ]);

  // 2. Filter and rank comparables — same-postcode same-type within last 36 months.
  const comparables = pickComparables(report);

  // 3. Compute baseline from comps + EPC floor area.
  const floorAreaM2 = report.free.epc?.totalFloorArea;
  const { baseline, medianPricePerSqM } = computeBaseline(comparables, floorAreaM2, ukhpi?.annualChangePct);

  // 4. Apply flag-driven adjustments.
  const adjustments = computeAdjustments(report);
  const totalAdjustmentPct = adjustments.reduce(
    (acc, a) => acc + (a.direction === "down" ? -a.pct : a.pct),
    0,
  );

  // 5. Derive suggested offer range.
  const modelledFairValue = baseline * (1 + totalAdjustmentPct / 100);
  const suggestedOfferRange = {
    low: Math.round(modelledFairValue * 0.95),
    mid: Math.round(modelledFairValue),
    high: Math.round(modelledFairValue * 1.03),
  };

  // 6. Asking-price reasonableness.
  const askingDeltaPct = modelledFairValue > 0
    ? ((askingPrice - modelledFairValue) / modelledFairValue) * 100
    : 0;
  const askingVsModelled: NegotiationAnalysis["askingVsModelled"] =
    askingDeltaPct > 3 ? "above" : askingDeltaPct < -3 ? "below" : "at";

  // 7. Affordability sketch — modelled at today's typical 5-yr fix rate AND
  // (when forward gilt data available) at the market-implied 5Y horizon rate
  // so the buyer sees what their mortgage might cost when they remortgage.
  const assumedLtv = 75;
  const assumedRate = boeMarket ? boeMarket.baseRate + 1.5 : 6.0;
  const monthlyAtAsking = mortgageMonthly(askingPrice, assumedLtv, assumedRate);
  const monthlyAtSuggested = mortgageMonthly(suggestedOfferRange.mid, assumedLtv, assumedRate);
  // The 5Y gilt yield is what the market thinks the average UK short-rate will
  // average over the next 5 years (plus a small term premium). Adding a typical
  // 5-yr fix margin of ~1.0pp over gilt gives a reasonable proxy of the rate a
  // buyer would face at their next remortgage.
  const futureRate = boeMarket?.fiveYearGilt ? boeMarket.fiveYearGilt + 1.0 : undefined;
  const monthlyAtAskingFuture = futureRate ? mortgageMonthly(askingPrice, assumedLtv, futureRate) : undefined;
  const monthlyAtSuggestedFuture = futureRate ? mortgageMonthly(suggestedOfferRange.mid, assumedLtv, futureRate) : undefined;

  // 8. Build the numerical analysis BEFORE the AI call so AI only formats.
  const analysis: NegotiationAnalysis = {
    askingPrice,
    suggestedOfferRange,
    askingVsModelled,
    askingDeltaPct: Math.round(askingDeltaPct * 10) / 10,
    modelledFairValue: Math.round(modelledFairValue),
    comparables,
    medianPricePerSqM,
    marketContext: {
      boeBaseRate: boeMarket?.baseRate,
      boeRateAsOf: boeMarket?.asOf,
      marketImplied5YRate: boeMarket?.fiveYearGilt,
      marketImplied20YRate: boeMarket?.twentyYearGilt,
      ukhpiAnnualChangePct: ukhpi?.annualChangePct,
      ukhpiAsOf: ukhpi?.asOf,
      localAuthority,
    },
    adjustments,
    affordability: {
      monthlyAtAsking,
      monthlyAtSuggested,
      monthlySaving: monthlyAtAsking && monthlyAtSuggested ? monthlyAtAsking - monthlyAtSuggested : undefined,
      monthlyAtAskingFuture,
      monthlyAtSuggestedFuture,
      futureRate: futureRate ? Math.round(futureRate * 100) / 100 : undefined,
      assumedLtv,
      assumedRate: Math.round(assumedRate * 100) / 100,
    },
    caveat:
      "This is a model built from public sold-price data, the current Bank of England Bank Rate plus market-implied forward rates from the UK gilt yield curve, the Land Registry UKHPI annual change for this local authority, and the risk flags found in your paid report. The 5Y gilt yield reflects the bond market's pricing of expected short rates plus a term premium — it is NOT the Bank of England's own staff forecast (that is published quarterly in the Monetary Policy Report). Real offer success depends on seller motivation, chain status, competing offers and survey findings. Use the suggested range as a starting point with your buying agent or solicitor — not as a substitute for professional valuation.",
    generatedAt: new Date().toISOString(),
  };

  // 9. AI rationale — last step, never invents numbers.
  analysis.aiRationale = await composeRationale(analysis, report).catch((err) => {
    console.error("Negotiation AI rationale failed", err);
    return undefined;
  });

  return analysis;
}

// ---------------------------------------------------------------------------
// Comparables — pull from existing free-report price history.
// ---------------------------------------------------------------------------

function pickComparables(report: PaidReport): NegotiationComp[] {
  const history = report.free.priceHistory;
  if (!history) return [];
  const epcType = report.free.epc?.propertyType?.toLowerCase();
  const inferredType = mapEpcTypeToLandRegistry(epcType);

  // similarSales already excludes this property by saon/paon.
  const candidates = (history.similarSales ?? []).filter((s) => {
    if (!s.date || !s.price) return false;
    // Recent enough — within 36 months
    const monthsAgo = monthsBetween(s.date, new Date().toISOString().slice(0, 10));
    if (monthsAgo > 36) return false;
    // Same property type if we have one
    if (inferredType && s.propertyType && s.propertyType !== inferredType) return false;
    return true;
  });

  // Most recent 10.
  candidates.sort((a, b) => b.date.localeCompare(a.date));
  return candidates.slice(0, 10).map((s) => toComp(s, report.free.epc?.totalFloorArea));
}

function toComp(s: PriceSale, ownFloorArea?: number): NegotiationComp {
  const today = new Date();
  const saleDate = new Date(s.date);
  const daysAgo = Math.round((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
  // Only show £/m² when WE have a floor area to compare against — comps
  // don't carry their own area in Land Registry data.
  const pricePerSqM = ownFloorArea && ownFloorArea > 0 ? Math.round(s.price / ownFloorArea) : undefined;
  const addressParts = [s.saon, s.paon, s.street].filter(Boolean).join(" ");
  return {
    address: addressParts || "Same postcode",
    price: s.price,
    date: s.date,
    propertyType: humanPropertyType(s.propertyType),
    pricePerSqM,
    daysAgo,
  };
}

function mapEpcTypeToLandRegistry(epcType?: string): "D" | "S" | "T" | "F" | undefined {
  if (!epcType) return undefined;
  if (epcType.includes("flat") || epcType.includes("maisonette")) return "F";
  if (epcType.includes("detached") && !epcType.includes("semi")) return "D";
  if (epcType.includes("semi")) return "S";
  if (epcType.includes("terraced") || epcType.includes("mid-terrace") || epcType.includes("end-terrace")) return "T";
  return undefined;
}

function humanPropertyType(code?: string): string | undefined {
  switch (code) {
    case "D": return "Detached";
    case "S": return "Semi-detached";
    case "T": return "Terraced";
    case "F": return "Flat";
    case "O": return "Other";
    default: return undefined;
  }
}

function monthsBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
}

// ---------------------------------------------------------------------------
// Baseline — median or trimmed mean of comp prices, uplifted by UKHPI annual.
// ---------------------------------------------------------------------------

function computeBaseline(
  comps: NegotiationComp[],
  ownFloorArea: number | undefined,
  hpiAnnualChangePct: number | undefined,
): { baseline: number; medianPricePerSqM?: number } {
  if (comps.length === 0) {
    return { baseline: 0 };
  }

  // Uplift each comp to today using HPI annual rate.
  const annual = hpiAnnualChangePct ?? 0;
  const today = new Date();

  const upliftedPrices = comps.map((c) => {
    const saleDate = new Date(c.date);
    const yrs = (today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (yrs <= 0) return c.price;
    return c.price * Math.pow(1 + annual / 100, yrs);
  });

  // If EPC floor area present, prefer £/m² × ownFloorArea route.
  let medianPricePerSqM: number | undefined;
  if (ownFloorArea && ownFloorArea > 0) {
    const pricesPerSqM = upliftedPrices.map((p) => p / ownFloorArea);
    medianPricePerSqM = Math.round(median(pricesPerSqM));
    return { baseline: medianPricePerSqM * ownFloorArea, medianPricePerSqM };
  }

  // Otherwise straight median price.
  const baseline = Math.round(median(upliftedPrices));
  return { baseline };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ---------------------------------------------------------------------------
// Flag-driven adjustments — heuristic but defensible. Each cites RICS / lender
// guidance as rationale rather than fabricating a precise number.
// ---------------------------------------------------------------------------

function computeAdjustments(report: PaidReport): NegotiationAdjustment[] {
  const adj: NegotiationAdjustment[] = [];
  const f = report.flags;
  const free = report.free;

  if (free.flood?.riskLevel === "high" || free.flood?.inFloodZone3) {
    adj.push({
      flag: "Flood risk high / Flood Zone 3",
      direction: "down",
      pct: 4,
      rationale: "High flood risk reduces lender appetite and adds typical insurance loading of £200-£600/yr. Surveyors and RICS guidance commonly apply 3-7% value adjustment.",
    });
  } else if (free.flood?.riskLevel === "medium" || free.flood?.inFloodZone2) {
    adj.push({
      flag: "Flood risk medium / Flood Zone 2",
      direction: "down",
      pct: 1.5,
      rationale: "Medium flood risk typically attracts a small insurance loading; mortgage availability mostly unaffected if Flood Re-eligible.",
    });
  }

  if (report.bsrHrb?.registered) {
    adj.push({
      flag: "BSR Higher-Risk Building register",
      direction: "down",
      pct: 6,
      rationale: "All mainstream lenders require an EWS1 form (rating A/B1) before issuing a mortgage offer on a Higher-Risk Building. Until that's confirmed, the property carries a material discount risk and potential service-charge exposure for cladding remediation.",
    });
  }

  if (f.listedBuilding?.listed) {
    const grade = (f.listedBuilding.grade ?? "").toUpperCase();
    if (grade.includes("I") && !grade.includes("II")) {
      adj.push({
        flag: "Grade I listed",
        direction: "down",
        pct: 3,
        rationale: "Grade I listed buildings need specialist lenders, specialist insurance and Listed Building Consent for any work — common 2-5% RICS valuation adjustment.",
      });
    } else {
      adj.push({
        flag: `Listed building (${f.listedBuilding.grade ?? "grade unknown"})`,
        direction: "down",
        pct: 1.5,
        rationale: "Grade II listed buildings require Listed Building Consent for alterations and tend to carry slightly higher insurance and maintenance costs.",
      });
    }
  }

  if (typeof f.shrinkSwellBand === "number" && f.shrinkSwellBand >= 4) {
    adj.push({
      flag: `Shrink-swell clay band ${f.shrinkSwellBand}/5`,
      direction: "down",
      pct: 2,
      rationale: "High shrink-swell clay raises subsidence risk; some specialist lenders require subsidence indemnity. RICS surveyors typically flag for structural assessment.",
    });
  }

  if (typeof f.landslideBand === "number" && f.landslideBand >= 4) {
    adj.push({
      flag: `Landslide hazard band ${f.landslideBand}/5`,
      direction: "down",
      pct: 1.5,
      rationale: "High landslide hazard band warrants a ground stability investigation. Few buyers adjust for this routinely — material if confirmed by surveyor.",
    });
  }

  if (f.coalReportingArea) {
    adj.push({
      flag: "Coal Authority reporting area",
      direction: "down",
      pct: 1,
      rationale: "Coal Authority reporting area triggers a £32.40 CON29M search recommendation; only a value driver if historic subsidence is found in the search.",
    });
  }

  if (typeof f.radonRiskBand === "number" && f.radonRiskBand >= 5) {
    adj.push({
      flag: `Radon Affected Area band ${f.radonRiskBand}/6`,
      direction: "down",
      pct: 0.5,
      rationale: "High radon band warrants a £30 UKHSA test kit. Buyers rarely apply a material discount; sump retrofit ~£1,500 if levels exceed action level.",
    });
  }

  if (f.article4?.affected) {
    adj.push({
      flag: "Article 4 direction (permitted development rights restricted)",
      direction: "down",
      pct: 1,
      rationale: "Article 4 directions remove permitted-development rights (extensions, short-let conversions). Value impact depends on the buyer's intentions.",
    });
  }

  if (report.ownership?.overseasOwned) {
    adj.push({
      flag: "Overseas company seller",
      direction: "down",
      pct: 0,
      rationale: "Process risk only — verify Register of Overseas Entities compliance. No automatic value discount; flagged for solicitor diligence.",
    });
  }

  if (report.tribunalHistory && report.tribunalHistory.count >= 2) {
    adj.push({
      flag: `Property Chamber tribunal history (${report.tribunalHistory.count} cases)`,
      direction: "down",
      pct: 1.5,
      rationale: "Multiple tribunal cases at the building or postcode indicate ongoing freeholder / service-charge disputes. Review the cases before committing.",
    });
  }

  if (free.epc?.rating === "F" || free.epc?.rating === "G") {
    adj.push({
      flag: `EPC ${free.epc.rating}`,
      direction: "down",
      pct: 1.5,
      rationale: "Below proposed 2030 rental minimum (EPC C). Factor in retrofit cost; lenders increasingly applying preferential terms to EPC C+ stock.",
    });
  }

  return adj;
}

// ---------------------------------------------------------------------------
// Affordability — repayment mortgage monthly cost, 75% LTV, given assumed rate.
// ---------------------------------------------------------------------------

function mortgageMonthly(price: number, ltv: number, ratePct: number): number | undefined {
  if (!price || !ltv || !ratePct) return undefined;
  const loan = price * (ltv / 100);
  const monthlyRate = ratePct / 100 / 12;
  const termMonths = 25 * 12;
  if (monthlyRate === 0) return Math.round(loan / termMonths);
  const m = (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  return Math.round(m);
}

// ---------------------------------------------------------------------------
// Bank of England base rate fetcher — CSV API, polite, cached for 24h.
// ---------------------------------------------------------------------------

interface BoeMarketContext {
  /** Current official UK Bank Rate (%) — IUDBEDR series. */
  baseRate: number;
  /** UK 5-year nominal zero-coupon gilt yield (%) — IUDSNZC series. Market's
   *  pricing of where short rates will average over the next 5 years (plus a
   *  small term premium). Used as a market-implied 5-year horizon rate. */
  fiveYearGilt?: number;
  /** UK 20-year nominal zero-coupon gilt yield (%) — IUDLNZC series. Long-
   *  horizon market expectation including term premium. */
  twentyYearGilt?: number;
  /** Date of the latest reading (CSV row date, e.g. "01 May 2026"). */
  asOf: string;
}

let _boeCache: { ctx: BoeMarketContext; cachedAt: number } | undefined;
const BOE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchBoeMarketContext(): Promise<BoeMarketContext | undefined> {
  if (_boeCache && Date.now() - _boeCache.cachedAt < BOE_TTL_MS) {
    return _boeCache.ctx;
  }
  const res = await fetch(BOE_RATE_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return undefined;
  const text = await res.text();
  // CSV (3-series request): "DATE,IUDBEDR,IUDSNZC,IUDLNZC\n02 Jan 2024,5.25,4.10,4.85\n..."
  // Skip series-metadata header rows; find the data table by the DATE header.
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return undefined;
  const headerIdx = lines.findIndex((l) => /^DATE,/i.test(l));
  if (headerIdx === -1) return undefined;
  const dataRows = lines.slice(headerIdx + 1).filter((l) => /^\d/.test(l));
  if (dataRows.length === 0) return undefined;
  // Walk backwards to the most recent row that has at least IUDBEDR populated.
  // Some series occasionally have gaps; pick the latest row with a valid base rate.
  let baseRate = NaN;
  let fiveYearGilt: number | undefined;
  let twentyYearGilt: number | undefined;
  let asOf = "";
  for (let i = dataRows.length - 1; i >= 0; i--) {
    const cells = dataRows[i].split(",").map((s) => s.trim());
    const r = parseFloat(cells[1]);
    if (Number.isFinite(r)) {
      baseRate = r;
      const five = parseFloat(cells[2]);
      const twenty = parseFloat(cells[3]);
      fiveYearGilt = Number.isFinite(five) ? Math.round(five * 100) / 100 : undefined;
      twentyYearGilt = Number.isFinite(twenty) ? Math.round(twenty * 100) / 100 : undefined;
      asOf = cells[0];
      break;
    }
  }
  if (!Number.isFinite(baseRate)) return undefined;
  const ctx: BoeMarketContext = { baseRate, fiveYearGilt, twentyYearGilt, asOf };
  _boeCache = { ctx, cachedAt: Date.now() };
  return ctx;
}

// ---------------------------------------------------------------------------
// UKHPI annual change for a local authority — Land Registry SPARQL.
// ---------------------------------------------------------------------------

let _ukhpiCache: Map<string, { annualChangePct: number; asOf: string; cachedAt: number }> = new Map();
const UKHPI_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function fetchUkhpi(ladCode: string | undefined): Promise<{ annualChangePct: number; asOf: string } | undefined> {
  if (!ladCode) return undefined;
  const cached = _ukhpiCache.get(ladCode);
  if (cached && Date.now() - cached.cachedAt < UKHPI_TTL_MS) {
    return { annualChangePct: cached.annualChangePct, asOf: cached.asOf };
  }

  // Land Registry exposes UKHPI by ONS GSS code via SPARQL. Use the public endpoint.
  const sparql = `
    PREFIX ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
    SELECT ?date ?annualChange WHERE {
      ?obs ukhpi:refRegion <http://landregistry.data.gov.uk/id/region/${ladCode}> ;
           ukhpi:refMonth ?date ;
           ukhpi:percentageAnnualChange ?annualChange .
    } ORDER BY DESC(?date) LIMIT 1
  `;
  const url = `https://landregistry.data.gov.uk/landregistry/query?query=${encodeURIComponent(sparql)}&output=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const data = await res.json();
    const row = data?.results?.bindings?.[0];
    if (!row) return undefined;
    const date = String(row.date?.value ?? "").slice(0, 7);
    const annualChange = parseFloat(row.annualChange?.value ?? "");
    if (!Number.isFinite(annualChange) || !date) return undefined;
    _ukhpiCache.set(ladCode, { annualChangePct: annualChange, asOf: date, cachedAt: Date.now() });
    return { annualChangePct: annualChange, asOf: date };
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// AI rationale — Claude composes 200-400 word write-up over the numerical
// analysis. NEVER invents new flags; just narrates what's been computed.
// ---------------------------------------------------------------------------

const RATIONALE_PROMPT = `You are a UK property buying agent briefing a homebuyer on their offer
strategy. You will receive a structured JSON object containing the comparable
sales found, market context (Bank of England base rate, market-implied 5Y
and 20Y forward rates from the UK gilt yield curve, Land Registry UKHPI
annual change), flag-driven adjustments, affordability sketches today and
at the future market-implied rate, and a modelled fair value range.

YOUR JOB: write a 250-350 word rationale paragraph for the buyer.

RULES:
- Do NOT invent any number, flag, or fact not in the data.
- Quote specific comparables, dates and prices verbatim.
- Reference the BoE base rate AND the market-implied 5Y forward rate
  explicitly. If the 5Y forward is HIGHER than today's base rate, say so —
  it means the bond market is pricing in rate rises and a 5-year fix is
  more conservative than a tracker. If LOWER, the inverse. Frame this as
  market-implied, NOT as a BoE staff forecast (you do not have that data).
- Reference the UKHPI annual change percentage for the local authority.
- Explain each flag adjustment as one short sentence, citing the flag.
- Frame the suggested offer range as a starting point, not a guarantee.
- Mention the affordability comparison — what the monthly mortgage looks
  like today and at the future implied rate — to ground the buyer's
  longer-term thinking.
- Use UK English. Plain language. No real estate jargon. NEVER name
  specific mortgage lenders by name (their policies change weekly).
- End with one sentence on negotiating tactics keyed to the data
  (e.g. "Time since last sale is 7 years and prices in this LA fell 2.1%
  over the last year — frame your offer around the local trend and the
  EWS1 uncertainty, not the asking price.").
- Keep tone calm, factual, slightly informal — like a friend who happens
  to be a buying agent.

Output PLAIN TEXT ONLY — no markdown, no headers, no lists. Just the
paragraph.`;

async function composeRationale(
  analysis: NegotiationAnalysis,
  report: PaidReport,
): Promise<string | undefined> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return undefined;

  const userPrompt = buildRationaleInput(analysis, report.free.property);

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": ANTHROPIC_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      temperature: 0.3,
      system: RATIONALE_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    console.error("Negotiation rationale API failed", res.status, await res.text().catch(() => "<no body>"));
    return undefined;
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const block = data?.content?.find((b) => b.type === "text");
  return block?.text?.trim();
}

function buildRationaleInput(analysis: NegotiationAnalysis, property: PostcodeAddress): string {
  const safe = {
    address: property.fullAddress,
    localAuthority: property.adminDistrictName,
    askingPrice: analysis.askingPrice,
    modelledFairValue: analysis.modelledFairValue,
    suggestedOfferRange: analysis.suggestedOfferRange,
    askingVsModelled: analysis.askingVsModelled,
    askingDeltaPct: analysis.askingDeltaPct,
    medianPricePerSqM: analysis.medianPricePerSqM,
    comparables: analysis.comparables.map((c) => ({
      address: c.address,
      price: c.price,
      date: c.date,
      propertyType: c.propertyType,
      daysAgo: c.daysAgo,
    })),
    marketContext: analysis.marketContext,
    adjustments: analysis.adjustments,
    affordability: analysis.affordability,
  };
  return `${JSON.stringify(safe, null, 2)}\n\nNow write the 200-300 word rationale paragraph.`;
}
