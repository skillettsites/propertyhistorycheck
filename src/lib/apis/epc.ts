/**
 * EPC Open Data — new MHCLG endpoint (Bearer EPC_API_TOKEN)
 * with legacy fallback (Basic EPC_API_EMAIL:EPC_API_KEY).
 *
 * The new endpoint returns:
 *   addressLine1, postcode, currentEnergyEfficiencyBand, potentialEnergyEfficiencyBand,
 *   registrationDate, propertyType, builtForm, mainFuelType, totalFloorArea, uprn.
 */

import { EpcData } from "../types";

const NEW_ENDPOINT = "https://api.get-energy-performance-data.communities.gov.uk";
const LEGACY_ENDPOINT = "https://epc.opendatacommunities.org/api/v1/domestic/search";

function cleanEnv(v: string | undefined): string {
  return (v || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

function formatPostcode(p: string): string {
  const c = p.replace(/\s+/g, "").toUpperCase();
  if (c.length < 5) return c;
  return `${c.slice(0, -3)} ${c.slice(-3)}`;
}

export async function getEpcByPostcode(postcode: string, paon?: string): Promise<EpcData | undefined> {
  const formatted = formatPostcode(postcode);
  const newToken = cleanEnv(process.env.EPC_API_TOKEN);
  if (newToken) {
    const r = await tryNewEndpoint(formatted, paon, newToken);
    if (r) return r;
  }
  const email = cleanEnv(process.env.EPC_API_EMAIL);
  const key = cleanEnv(process.env.EPC_API_KEY);
  if (email && key) {
    const r = await tryLegacyEndpoint(formatted, paon, email, key);
    if (r) return r;
  }
  return undefined;
}

async function tryNewEndpoint(postcode: string, paon: string | undefined, token: string): Promise<EpcData | undefined> {
  try {
    const params = new URLSearchParams({ postcode, page_size: "30" });
    const res = await fetch(`${NEW_ENDPOINT}/api/domestic/search?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const rows: Array<Record<string, unknown>> = json?.data ?? [];
    return pickBestNew(rows, paon);
  } catch (err) {
    console.error("EPC new endpoint failed", err);
    return undefined;
  }
}

async function tryLegacyEndpoint(
  postcode: string,
  paon: string | undefined,
  email: string,
  key: string
): Promise<EpcData | undefined> {
  try {
    const cleaned = postcode.replace(/\s+/g, "");
    const res = await fetch(`${LEGACY_ENDPOINT}?postcode=${encodeURIComponent(cleaned)}&size=20`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return pickBestLegacy(json?.rows ?? [], paon);
  } catch (err) {
    console.error("EPC legacy endpoint failed", err);
    return undefined;
  }
}

function pickBestNew(rows: Array<Record<string, unknown>>, paon?: string): EpcData | undefined {
  if (!rows.length) return undefined;
  let row = rows[0];
  if (paon) {
    const match = rows.find((r) => {
      const a = String(r.addressLine1 ?? "").toLowerCase();
      return a.includes(paon.toLowerCase());
    });
    if (match) row = match;
  }
  return {
    rating: row.currentEnergyEfficiencyBand as EpcData["rating"],
    potentialRating: row.potentialEnergyEfficiencyBand as EpcData["potentialRating"],
    buildYear: parseYear(row.constructionAgeBand),
    builtForm: row.builtForm as string | undefined,
    propertyType: row.propertyType as string | undefined,
    totalFloorArea: numberOrUndef(row.totalFloorArea),
    mainHeating: (row.mainFuelType ?? row.mainHeatingDescription) as string | undefined,
    inspectionDate: (row.inspectionDate ?? row.registrationDate) as string | undefined,
  };
}

function pickBestLegacy(rows: Array<Record<string, unknown>>, paon?: string): EpcData | undefined {
  if (!rows.length) return undefined;
  let row = rows[0];
  if (paon) {
    const match = rows.find((r) => {
      const a = String(r.address ?? r.address1 ?? "").toLowerCase();
      return a.includes(paon.toLowerCase());
    });
    if (match) row = match;
  }
  return {
    rating: (row["current-energy-rating"] ?? row.currentEnergyRating) as EpcData["rating"],
    potentialRating: (row["potential-energy-rating"] ?? row.potentialEnergyRating) as EpcData["potentialRating"],
    buildYear: parseYear(row["construction-age-band"] ?? row.constructionAgeBand),
    builtForm: (row["built-form"] ?? row.builtForm) as string | undefined,
    propertyType: (row["property-type"] ?? row.propertyType) as string | undefined,
    totalFloorArea: numberOrUndef(row["total-floor-area"] ?? row.totalFloorArea),
    mainHeating: (row["mainheat-description"] ?? row.mainHeatingDescription) as string | undefined,
    inspectionDate: (row["inspection-date"] ?? row.inspectionDate) as string | undefined,
  };
}

function parseYear(band: unknown): number | undefined {
  if (!band) return undefined;
  const s = String(band);
  const m = s.match(/(\d{4})/);
  if (m) return Number(m[1]);
  if (/before\s*1900/i.test(s)) return 1899;
  return undefined;
}

function numberOrUndef(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
