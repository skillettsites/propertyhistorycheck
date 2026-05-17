/**
 * Companies House public REST API adapter.
 *
 * Used to enrich a registered owner name (e.g. from the Land Registry title
 * register) with a Companies House profile: status, officers count, outstanding
 * charges (mortgages / debentures), and a plain-English risk note.
 *
 * Auth: HTTP Basic with the API key as the username and an empty password.
 * Free tier: 600 requests / 5 minutes per key. Set COMPANIES_HOUSE_API_KEY in env.
 *
 * Endpoint: https://api.company-information.service.gov.uk/
 */

const CH_BASE = "https://api.company-information.service.gov.uk";

const CORPORATE_SUFFIXES = [
  "LTD",
  "LIMITED",
  "PLC",
  "LLP",
  "LP",
  "GMBH",
  "SA",
  "INC",
  "AG",
  "AB",
  "BV",
];

export interface CompanyOwnerInfo {
  companyNumber: string;
  companyName: string;
  status: "active" | "dissolved" | "liquidation" | "administration" | "unknown";
  incorporatedOn?: string;
  registeredAddress?: string;
  sicCodes?: string[];
  officersCount?: number;
  /** Total outstanding charges (mortgages / debentures registered against the company). */
  outstandingCharges?: number;
  /** Detail of each outstanding charge: lender, type, date. */
  outstandingChargesDetail?: Array<{ lenderName?: string; classification?: string; createdOn?: string }>;
  /** Insolvency cases registered against the company (liquidation, administration, CVA, etc.). */
  insolvencyCases?: Array<{ type: string; dates?: Array<{ type?: string; date?: string }> }>;
  /** Companies House profile URL */
  profileUrl: string;
  /** Plain-English risk note based on status + charges + insolvency */
  riskNote?: string;
  /** Whether this is a Register of Overseas Entities (OE-prefixed) record */
  isOverseasEntity?: boolean;
}

export interface DisqualifiedDirector {
  /** Person identifier from Companies House. */
  personId: string;
  /** Full name as registered. */
  name: string;
  /** Date of birth (year + month — Companies House anonymises day). */
  dateOfBirth?: string;
  /** Disqualification start. */
  disqualifiedFrom?: string;
  /** Disqualification end. */
  disqualifiedUntil?: string;
  /** Case reference (e.g. "Companies Act 2006 s.155"). */
  caseReason?: string;
  /** Profile URL on Companies House for further reading. */
  profileUrl: string;
}

interface CHSearchResponse {
  items?: Array<{
    company_number?: string;
    title?: string;
    company_status?: string;
  }>;
}

interface CHProfileResponse {
  company_number?: string;
  company_name?: string;
  company_status?: string;
  date_of_creation?: string;
  date_of_cessation?: string;
  registered_office_address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  sic_codes?: string[];
}

interface CHOfficersResponse {
  items?: Array<{
    resigned_on?: string;
  }>;
  active_count?: number;
  total_results?: number;
}

interface CHChargesResponse {
  items?: Array<{
    status?: string;
    classification?: { description?: string };
    persons_entitled?: Array<{ name?: string }>;
    created_on?: string;
  }>;
  total_count?: number;
}

interface CHInsolvencyResponse {
  cases?: Array<{
    type?: string;
    dates?: Array<{ type?: string; date?: string }>;
    practitioners?: Array<{ name?: string }>;
  }>;
}

interface CHDisqualifiedSearchResponse {
  items?: Array<{
    title?: string;
    description?: string;
    date_of_birth?: { year?: number; month?: number };
    links?: { self?: string };
  }>;
  total_results?: number;
}

interface CHDisqualifiedDetail {
  surname?: string;
  forename?: string;
  other_forenames?: string;
  date_of_birth?: string;
  disqualifications?: Array<{
    disqualified_from?: string;
    disqualified_until?: string;
    case_identifier?: string;
    reason?: { description?: string; description_identifier?: string };
  }>;
}

function hasCorporateSuffix(name: string): boolean {
  // Strip punctuation and split on whitespace; check the trailing token(s)
  const cleaned = name
    .toUpperCase()
    .replace(/[.,;]/g, "")
    .trim();
  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/);
  const last = tokens[tokens.length - 1];
  return CORPORATE_SUFFIXES.includes(last);
}

function authHeader(apiKey: string): string {
  // HTTP Basic: username = apiKey, password = empty
  const encoded = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

async function chFetch(path: string, apiKey: string): Promise<Response | undefined> {
  const url = `${CH_BASE}${path}`;
  let res: Response | undefined;
  for (let i = 0; i < 2; i++) {
    try {
      res = await fetch(url, {
        headers: {
          Authorization: authHeader(apiKey),
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 86400 * 7 },
      });
      if (res.ok) return res;
      // 401/403 = bad key, 404 = not found — don't retry
      if (res.status === 401 || res.status === 403 || res.status === 404) return res;
      if (res.status < 500) return res;
    } catch {
      // retry once on AbortError / network
    }
  }
  return res;
}

function mapStatus(raw: string | undefined): CompanyOwnerInfo["status"] {
  if (!raw) return "unknown";
  const s = raw.toLowerCase();
  if (s === "active") return "active";
  if (s.includes("dissolved")) return "dissolved";
  if (s.includes("liquidation")) return "liquidation";
  if (s.includes("administration")) return "administration";
  return "unknown";
}

function formatAddress(addr: CHProfileResponse["registered_office_address"]): string | undefined {
  if (!addr) return undefined;
  const parts = [
    addr.address_line_1,
    addr.address_line_2,
    addr.locality,
    addr.region,
    addr.postal_code,
    addr.country,
  ].filter((p): p is string => Boolean(p && p.trim()));
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function buildRiskNote(
  status: CompanyOwnerInfo["status"],
  officersCount: number | undefined,
  outstandingCharges: number | undefined,
  cessationDate: string | undefined,
  insolvencyCount: number,
): string {
  if (status === "dissolved") {
    const year = cessationDate ? cessationDate.slice(0, 4) : undefined;
    return year
      ? `DISSOLVED in ${year} — title may need probate-style transfer`
      : "DISSOLVED — title may need probate-style transfer";
  }
  if (status === "liquidation") {
    return "IN LIQUIDATION — title sale controlled by liquidator";
  }
  if (status === "administration") {
    return "IN ADMINISTRATION — title sale controlled by administrator";
  }
  if (insolvencyCount > 0 && status !== "active") {
    return `${insolvencyCount} historical insolvency case${insolvencyCount === 1 ? "" : "s"} — verify resolution before exchange`;
  }
  const parts: string[] = [];
  parts.push(status === "active" ? "Active" : "Status unknown");
  if (typeof officersCount === "number") {
    parts.push(`${officersCount} officer${officersCount === 1 ? "" : "s"}`);
  }
  if (typeof outstandingCharges === "number" && outstandingCharges > 0) {
    parts.push(
      `${outstandingCharges} outstanding charge${outstandingCharges === 1 ? "" : "s"} (mortgages)`,
    );
  } else if (typeof outstandingCharges === "number") {
    parts.push("no outstanding charges");
  }
  if (insolvencyCount > 0) {
    parts.push(`${insolvencyCount} historical insolvency case${insolvencyCount === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

/**
 * Companies House disqualified-directors search.
 *
 * Used to flag if any officer of a corporate property owner is currently
 * (or recently) disqualified from being a company director. This is a
 * material red flag — disqualified individuals are typically blocked due
 * to fraud, wrongful trading, or persistent non-compliance.
 *
 * Free Companies House key. Up to 50 results, paginated.
 */
export async function lookupDisqualifiedDirectors(name: string): Promise<DisqualifiedDirector[]> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey || !name) return [];
  try {
    const path = `/disqualified-officers/search?q=${encodeURIComponent(name)}&items_per_page=10`;
    const res = await chFetch(path, apiKey);
    if (!res || !res.ok) return [];
    const data = (await res.json()) as CHDisqualifiedSearchResponse;
    const items = data.items ?? [];
    if (items.length === 0) return [];
    const out: DisqualifiedDirector[] = [];
    for (const item of items) {
      const selfLink = item.links?.self;
      if (!selfLink) continue;
      const personId = selfLink.split("/").pop() ?? selfLink;
      const detailRes = await chFetch(selfLink, apiKey);
      if (!detailRes || !detailRes.ok) continue;
      const detail = (await detailRes.json()) as CHDisqualifiedDetail;
      const disq = detail.disqualifications?.[0];
      const fullName = [detail.forename, detail.other_forenames, detail.surname]
        .filter(Boolean).join(" ").trim() || (item.title ?? "");
      out.push({
        personId,
        name: fullName,
        dateOfBirth: detail.date_of_birth ?? (item.date_of_birth?.year && item.date_of_birth?.month
          ? `${item.date_of_birth.year}-${String(item.date_of_birth.month).padStart(2, "0")}`
          : undefined),
        disqualifiedFrom: disq?.disqualified_from,
        disqualifiedUntil: disq?.disqualified_until,
        caseReason: disq?.reason?.description,
        profileUrl: `https://find-and-update.company-information.service.gov.uk${selfLink}`,
      });
    }
    return out;
  } catch (err) {
    console.error("lookupDisqualifiedDirectors failed", err);
    return [];
  }
}

export async function lookupCompanyOwner(name: string): Promise<CompanyOwnerInfo | undefined> {
  if (!name || !hasCorporateSuffix(name)) return undefined;

  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    console.warn("COMPANIES_HOUSE_API_KEY not set; Companies House lookup unavailable");
    return undefined;
  }

  try {
    // 1. Search for the company
    const searchPath = `/search/companies?q=${encodeURIComponent(name)}&items_per_page=5`;
    const searchRes = await chFetch(searchPath, apiKey);
    if (!searchRes || !searchRes.ok) return undefined;
    const searchData = (await searchRes.json()) as CHSearchResponse;
    const top = searchData.items?.[0];
    const companyNumber = top?.company_number;
    if (!companyNumber) return undefined;

    // 2-5. Fetch profile, officers, charges, insolvency in parallel
    const [profileRes, officersRes, chargesRes, insolvencyRes] = await Promise.all([
      chFetch(`/company/${companyNumber}`, apiKey),
      chFetch(`/company/${companyNumber}/officers`, apiKey),
      chFetch(`/company/${companyNumber}/charges`, apiKey),
      chFetch(`/company/${companyNumber}/insolvency`, apiKey),
    ]);

    if (!profileRes || !profileRes.ok) return undefined;
    const profile = (await profileRes.json()) as CHProfileResponse;

    let officersCount: number | undefined;
    if (officersRes && officersRes.ok) {
      const officersData = (await officersRes.json()) as CHOfficersResponse;
      if (typeof officersData.active_count === "number") {
        officersCount = officersData.active_count;
      } else if (Array.isArray(officersData.items)) {
        officersCount = officersData.items.filter((o) => !o.resigned_on).length;
      }
    }

    let outstandingCharges: number | undefined;
    let outstandingChargesDetail: CompanyOwnerInfo["outstandingChargesDetail"];
    if (chargesRes && chargesRes.ok) {
      const chargesData = (await chargesRes.json()) as CHChargesResponse;
      if (Array.isArray(chargesData.items)) {
        const open = chargesData.items.filter((c) => c.status === "outstanding");
        outstandingCharges = open.length;
        outstandingChargesDetail = open.slice(0, 5).map((c) => ({
          lenderName: c.persons_entitled?.[0]?.name,
          classification: c.classification?.description,
          createdOn: c.created_on,
        }));
      } else if (typeof chargesData.total_count === "number") {
        outstandingCharges = 0;
      }
    } else if (chargesRes && chargesRes.status === 404) {
      outstandingCharges = 0;
    }

    let insolvencyCases: CompanyOwnerInfo["insolvencyCases"];
    if (insolvencyRes && insolvencyRes.ok) {
      const insolvencyData = (await insolvencyRes.json()) as CHInsolvencyResponse;
      if (Array.isArray(insolvencyData.cases) && insolvencyData.cases.length > 0) {
        insolvencyCases = insolvencyData.cases.map((c) => ({
          type: c.type ?? "unknown",
          dates: c.dates,
        }));
      }
    }
    // 404 from /insolvency = no insolvency cases on record (normal for healthy companies)

    const status = mapStatus(profile.company_status);
    const riskNote = buildRiskNote(
      status,
      officersCount,
      outstandingCharges,
      profile.date_of_cessation,
      insolvencyCases?.length ?? 0,
    );

    return {
      companyNumber,
      companyName: profile.company_name ?? top?.title ?? name,
      status,
      incorporatedOn: profile.date_of_creation,
      registeredAddress: formatAddress(profile.registered_office_address),
      sicCodes: profile.sic_codes,
      officersCount,
      outstandingCharges,
      outstandingChargesDetail,
      insolvencyCases,
      profileUrl: `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`,
      riskNote,
      isOverseasEntity: companyNumber.toUpperCase().startsWith("OE"),
    };
  } catch (err) {
    console.error("lookupCompanyOwner failed", err);
    return undefined;
  }
}
