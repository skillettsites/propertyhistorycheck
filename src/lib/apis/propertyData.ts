/**
 * PropertyData.co.uk reseller API.
 *
 * Premium-tier add-ons:
 *  - Comparable rental estimate by postcode + bedrooms + property type
 *  - HM Land Registry title plan PDF order (£9 incl VAT per call)
 *  - HM Land Registry title register pull (already in titleRegister.ts elsewhere)
 *
 * Auth: API key as `?key=` query param. Set PROPERTYDATA_API_KEY in env.
 * Pricing tiers: £28/mo (2k credits) up to £288/mo (100k credits).
 *
 * Docs: https://propertydata.co.uk/api/documentation
 */

const PD_BASE = "https://api.propertydata.co.uk";

export interface RentEstimate {
  /** Median monthly rent in £. */
  monthlyRent: number;
  /** Lower (~25th percentile) bound. */
  low?: number;
  /** Upper (~75th percentile) bound. */
  high?: number;
  /** How many comparable listings the figure is based on. */
  sampleSize?: number;
  /** Granularity used: full postcode / sector / district / area. */
  granularity?: "postcode" | "sector" | "district" | "area";
  source: "PropertyData (Rightmove + Zoopla)";
}

export interface TitlePlanOrder {
  /** Direct download URL for the title plan PDF. Valid 6 months. */
  documentUrl: string;
  /** PropertyData order reference. */
  orderRef?: string;
  /** Charge to us in £, including VAT. Roughly £9.00 per doc. */
  costGbp?: number;
}

function key(): string | undefined {
  const k = (process.env.PROPERTYDATA_API_KEY || "").trim();
  return k || undefined;
}

/**
 * Map our internal property-type codes to PropertyData's vocabulary.
 * D = Detached, S = Semi, T = Terraced, F = Flat, O = Other.
 */
function mapType(t: string | undefined): "flat" | "detached" | "semi-detached" | "terraced" | undefined {
  if (!t) return undefined;
  const u = t.toUpperCase();
  if (u === "F" || u.includes("FLAT") || u.includes("MAISONETTE")) return "flat";
  if (u === "D" || u.includes("DETACH")) return "detached";
  if (u === "S" || u.includes("SEMI")) return "semi-detached";
  if (u === "T" || u.includes("TERRAC")) return "terraced";
  return undefined;
}

/**
 * Estimate monthly rent for a property using PropertyData's /rents endpoint.
 * Returns undefined if no key, no comparables, or the call fails.
 */
export async function estimateMonthlyRent(opts: {
  postcode: string;
  bedrooms?: number;
  propertyType?: string;
}): Promise<RentEstimate | undefined> {
  const k = key();
  if (!k) return undefined;
  const type = mapType(opts.propertyType);
  if (!type) return undefined;

  const params = new URLSearchParams({
    key: k,
    postcode: opts.postcode.replace(/\s+/g, ""),
    type,
  });
  if (opts.bedrooms && opts.bedrooms >= 1 && opts.bedrooms <= 5) {
    params.set("bedrooms", String(opts.bedrooms));
  }
  try {
    // PropertyData API path is /rents (no /v1/). Returns rent figures in
    // gbp_per_week — convert to monthly by × 52 / 12.
    const res = await fetch(`${PD_BASE}/rents?${params}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      status?: string;
      postcode_type?: string;
      data?: {
        long_let?: {
          average?: number;
          unit?: string;
          points_analysed?: number;
          radius?: string | number;
          "70pc_range"?: [number, number];
          "80pc_range"?: [number, number];
        };
      };
    };
    if (data.status !== "success" || !data.data?.long_let) return undefined;
    const d = data.data.long_let;
    if (!d.average || d.average <= 0) return undefined;
    // PropertyData defaults to weekly rent in GBP. If unit changes in future,
    // assume the value is already monthly.
    const weekly = !d.unit || d.unit === "gbp_per_week";
    const toMonthly = (n: number) => Math.round(weekly ? (n * 52) / 12 : n);
    const range = d["80pc_range"] ?? d["70pc_range"];
    const granularity: RentEstimate["granularity"] =
      data.postcode_type === "full" ? "postcode"
      : data.postcode_type === "sector" ? "sector"
      : data.postcode_type === "district" ? "district"
      : "area";
    return {
      monthlyRent: toMonthly(d.average),
      low: range ? toMonthly(range[0]) : undefined,
      high: range ? toMonthly(range[1]) : undefined,
      sampleSize: d.points_analysed,
      granularity,
      source: "PropertyData (Rightmove + Zoopla)",
    };
  } catch {
    return undefined;
  }
}

export interface TitleLookup {
  /** Title number assigned to this UPRN. Multiple titles can exist; we return the leasehold for flats, freehold for houses. */
  titleNumber: string;
  uprn: string;
  titleClass: string;
  /** All matched titles (for debugging / future "show all" UX). */
  allTitles: Array<{ titleNumber: string; titleClass: string }>;
}

/**
 * Address → UPRN → title number. Two PropertyData calls (~11 credits, ~£0.16).
 * For flats: picks the leasehold title. For houses: picks the freehold.
 * Returns undefined if no match found.
 */
export async function findTitleNumber(opts: {
  postcode: string;
  fullAddress: string;
}): Promise<TitleLookup | undefined> {
  const k = key();
  if (!k) return undefined;

  // Step 1: address → UPRN
  // PropertyData wants comma-separated address with the postcode at the end.
  const formattedAddress = ensureCommas(opts.fullAddress, opts.postcode);
  let uprn: string | undefined;
  try {
    const params = new URLSearchParams({ key: k, address: formattedAddress });
    const res = await fetch(`${PD_BASE}/address-match-uprn?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      status?: string;
      data?: Array<{ uprn?: number; address?: string; classificationCode?: string }>;
    };
    if (data.status !== "success" || !data.data?.length) return undefined;
    uprn = String(data.data[0].uprn);
  } catch { return undefined; }
  if (!uprn) return undefined;

  // Step 2: UPRN → title number(s)
  try {
    const params = new URLSearchParams({ key: k, uprn });
    const res = await fetch(`${PD_BASE}/uprn-title?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      status?: string;
      data?: { uprn: string; title_count: number; title_data: Array<{ title_number: string; title_class: string }> };
    };
    if (data.status !== "success" || !data.data?.title_data?.length) return undefined;
    const titles = data.data.title_data;
    // Prefer leasehold title when one exists — that's the buyer's interest for flats.
    // For houses there's usually just one freehold title.
    const lease = titles.find((t) => /leasehold/i.test(t.title_class));
    const chosen = lease ?? titles[0];
    return {
      titleNumber: chosen.title_number,
      uprn,
      titleClass: chosen.title_class,
      allTitles: titles.map((t) => ({ titleNumber: t.title_number, titleClass: t.title_class })),
    };
  } catch { return undefined; }
}

function ensureCommas(addr: string, postcode: string): string {
  // If the address already has commas, trust the caller. Otherwise insert one
  // before the postcode and one between SAON/PAON splits we recognise.
  if (addr.includes(",")) return addr;
  let s = addr.replace(new RegExp(`\\s*${postcode.replace(/\s/g, "\\s*")}\\s*$`, "i"), "").trim();
  // Insert comma after recognised SAON tokens: "APARTMENT 604 BINNACLE HOUSE" → "APARTMENT 604, BINNACLE HOUSE"
  s = s.replace(/(\b(?:APARTMENT|FLAT|UNIT|STUDIO|MAISONETTE)\s+[A-Z0-9]+)\s+([A-Z])/i, "$1, $2");
  return `${s}, ${postcode}`;
}

/**
 * Order a HM Land Registry document (register PDF, title plan PDF, or both) via
 * PropertyData. Returns a download URL valid 6 months. Costs ~£9 per `register`
 * or `plan`; `both` is two separate documents = ~£18.
 *
 * Only call AFTER payment is confirmed — every call is billed.
 *
 * Pass test=true via query for dry-run (returns pricing without charging).
 */
export async function orderTitleDocument(
  titleNumber: string,
  documents: "register" | "plan" = "register",
): Promise<TitlePlanOrder | undefined> {
  const k = key();
  if (!k) return undefined;
  if (!titleNumber || titleNumber.length < 4) return undefined;
  const params = new URLSearchParams({ key: k, title: titleNumber.toUpperCase(), documents });
  try {
    const res = await fetch(`${PD_BASE}/land-registry-documents?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      status?: string;
      data?: { document_status?: string; document_url?: string; order_ref?: string; pending_payment_price?: { total_gbp?: string } };
    };
    if (data.status !== "success" || !data.data?.document_url) return undefined;
    const total = data.data.pending_payment_price?.total_gbp;
    return {
      documentUrl: data.data.document_url,
      orderRef: data.data.order_ref,
      costGbp: total ? Number(total) : undefined,
    };
  } catch { return undefined; }
}

/**
 * Legacy alias — calls orderTitleDocument(titleNumber, "plan").
 * Kept for compatibility with existing paidReport.ts call sites.
 */
export async function orderTitlePlan(titleNumber: string): Promise<TitlePlanOrder | undefined> {
  return orderTitleDocument(titleNumber, "plan");
}

// Legacy raw fetch kept for any callers that need it directly.
async function _legacyOrderTitlePlanRaw(titleNumber: string): Promise<TitlePlanOrder | undefined> {
  const k = key();
  if (!k) return undefined;
  if (!titleNumber || titleNumber.length < 4) return undefined;
  const params = new URLSearchParams({
    key: k,
    title: titleNumber.toUpperCase(),
    documents: "plan",
  });
  try {
    const res = await fetch(`${PD_BASE}/land-registry-documents?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      status?: string;
      data?: { document_url?: string; order_ref?: string; cost_gbp?: number };
    };
    if (data.status !== "success" || !data.data?.document_url) return undefined;
    return {
      documentUrl: data.data.document_url,
      orderRef: data.data.order_ref,
      costGbp: data.data.cost_gbp,
    };
  } catch {
    return undefined;
  }
}
