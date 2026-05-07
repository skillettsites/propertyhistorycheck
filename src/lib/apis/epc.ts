/**
 * EPC Open Data.
 *
 * MIGRATION 2026: legacy `epc.opendatacommunities.org` retired mid-May 2026.
 * Use new MHCLG endpoint with Bearer token.
 *
 * Adapter abstracts the swap so call-sites don't care which is live.
 */

import { EpcData } from "../types";

const NEW_ENDPOINT = "https://api.get-energy-performance-data.communities.gov.uk";
const LEGACY_ENDPOINT = "https://epc.opendatacommunities.org/api/v1/domestic/search";

export async function getEpcByPostcode(
  postcode: string,
  paon?: string
): Promise<EpcData | undefined> {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, "").replace(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/, "$1 $2");

  const newToken = process.env.EPC_BEARER_TOKEN;
  if (newToken) {
    const result = await tryNewEndpoint(cleaned, paon, newToken);
    if (result) return result;
  }

  const legacyToken = process.env.EPC_API_TOKEN;
  if (legacyToken) {
    const result = await tryLegacyEndpoint(cleaned, paon, legacyToken);
    if (result) return result;
  }

  return undefined;
}

async function tryNewEndpoint(
  postcode: string,
  paon: string | undefined,
  token: string
): Promise<EpcData | undefined> {
  try {
    const params = new URLSearchParams({ postcode, size: "20" });
    const res = await fetch(`${NEW_ENDPOINT}/api/v1/certificates/domestic?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const rows: Array<Record<string, unknown>> = data?.data ?? data?.rows ?? [];
    return pickBestEpc(rows, paon);
  } catch (err) {
    console.error("EPC new endpoint failed", err);
    return undefined;
  }
}

async function tryLegacyEndpoint(
  postcode: string,
  paon: string | undefined,
  token: string
): Promise<EpcData | undefined> {
  try {
    const url = `${LEGACY_ENDPOINT}?postcode=${encodeURIComponent(postcode)}&size=20`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(token).toString("base64")}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const rows: Array<Record<string, unknown>> = data?.rows ?? [];
    return pickBestEpc(rows, paon);
  } catch (err) {
    console.error("EPC legacy endpoint failed", err);
    return undefined;
  }
}

function pickBestEpc(rows: Array<Record<string, unknown>>, paon?: string): EpcData | undefined {
  if (!rows.length) return undefined;
  let best = rows[0];
  if (paon) {
    const match = rows.find((r) => {
      const a = String(r.address1 ?? r.address ?? "").toLowerCase();
      return a.includes(paon.toLowerCase());
    });
    if (match) best = match;
  }
  return {
    rating: (best["current-energy-rating"] || best.currentEnergyRating) as EpcData["rating"],
    potentialRating: (best["potential-energy-rating"] || best.potentialEnergyRating) as EpcData["potentialRating"],
    buildYear: parseYear(best["construction-age-band"] || best.constructionAgeBand),
    builtForm: (best["built-form"] || best.builtForm) as string | undefined,
    propertyType: (best["property-type"] || best.propertyType) as string | undefined,
    totalFloorArea: numberOrUndef(best["total-floor-area"] || best.totalFloorArea),
    mainHeating: (best["mainheat-description"] || best.mainHeatingDescription) as string | undefined,
    inspectionDate: (best["inspection-date"] || best.inspectionDate) as string | undefined,
  };
}

function parseYear(band: unknown): number | undefined {
  if (!band) return undefined;
  const s = String(band);
  const match = s.match(/(\d{4})/);
  if (match) return Number(match[1]);
  if (/before\s*1900/i.test(s)) return 1899;
  return undefined;
}

function numberOrUndef(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
