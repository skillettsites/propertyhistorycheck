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

export async function getEpcByPostcode(postcode: string, paon?: string, saon?: string): Promise<EpcData | undefined> {
  const formatted = formatPostcode(postcode);
  // Legacy first: returns full record (rooms, floor area, property type, built form).
  // The new MHCLG endpoint's search response is summary-only (rating + dates only).
  const email = cleanEnv(process.env.EPC_API_EMAIL);
  const key = cleanEnv(process.env.EPC_API_KEY);
  if (email && key) {
    const r = await tryLegacyEndpoint(formatted, paon, saon, email, key);
    if (r) return r;
  }
  // Fallback: new endpoint, even though it returns less.
  const newToken = cleanEnv(process.env.EPC_API_TOKEN);
  if (newToken) {
    const r = await tryNewEndpoint(formatted, paon, saon, newToken);
    if (r) return r;
  }
  return undefined;
}

async function tryNewEndpoint(postcode: string, paon: string | undefined, saon: string | undefined, token: string): Promise<EpcData | undefined> {
  try {
    const params = new URLSearchParams({ postcode, page_size: "100" });
    const res = await fetch(`${NEW_ENDPOINT}/api/domestic/search?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const rows: Array<Record<string, unknown>> = json?.data ?? [];
    return pickBestNew(rows, paon, saon);
  } catch (err) {
    console.error("EPC new endpoint failed", err);
    return undefined;
  }
}

async function tryLegacyEndpoint(
  postcode: string,
  paon: string | undefined,
  saon: string | undefined,
  email: string,
  key: string
): Promise<EpcData | undefined> {
  try {
    const cleaned = postcode.replace(/\s+/g, "");
    const res = await fetch(`${LEGACY_ENDPOINT}?postcode=${encodeURIComponent(cleaned)}&size=100`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return pickBestLegacy(json?.rows ?? [], paon, saon);
  } catch (err) {
    console.error("EPC legacy endpoint failed", err);
    return undefined;
  }
}

function pickBestNew(rows: Array<Record<string, unknown>>, paon?: string, saon?: string): EpcData | undefined {
  if (!rows.length) return undefined;
  // Sort newest first so when multiple EPCs exist for one address we pick the latest.
  const sorted = [...rows].sort((a, b) => {
    const da = Date.parse(String(a.inspectionDate ?? a.registrationDate ?? "")) || 0;
    const db = Date.parse(String(b.inspectionDate ?? b.registrationDate ?? "")) || 0;
    return db - da;
  });
  let row = sorted[0];
  // SAON (e.g. "APARTMENT 604") is the unit identifier and most specific.
  // PAON (e.g. "BINNACLE HOUSE") is the building name — non-unique inside a postcode of flats.
  // Try SAON first, then PAON, then first row.
  const tryMatch = (needle: string) => {
    const n = needle.toLowerCase();
    return sorted.find((r) => {
      const lines = [r.addressLine1, r.addressLine2, r.addressLine3].map((x) => String(x ?? "").toLowerCase());
      return lines.some((l) => l === n || l.startsWith(n + " ") || l.startsWith(n + ","));
    }) ?? sorted.find((r) => {
      const a = String(r.addressLine1 ?? "").toLowerCase();
      return a.includes(n);
    });
  };
  if (saon) {
    const m = tryMatch(saon);
    if (m) row = m;
  } else if (paon) {
    const m = tryMatch(paon);
    if (m) row = m;
  }
  return {
    rating: row.currentEnergyEfficiencyBand as EpcData["rating"],
    potentialRating: row.potentialEnergyEfficiencyBand as EpcData["potentialRating"],
    buildYear: parseYear(row.constructionAgeBand),
    builtForm: cleanString(row.builtForm),
    propertyType: cleanString(row.propertyType),
    totalFloorArea: numberOrUndef(row.totalFloorArea),
    mainHeating: cleanString(row.mainFuelType ?? row.mainHeatingDescription),
    inspectionDate: cleanString(row.inspectionDate ?? row.registrationDate),
    habitableRooms: numberOrUndef(row.numberHabitableRooms ?? row.numberOfHabitableRooms),
  };
}

function pickBestLegacy(rows: Array<Record<string, unknown>>, paon?: string, saon?: string): EpcData | undefined {
  if (!rows.length) return undefined;
  // Sort newest-inspection first so we pick the current EPC if multiple exist per address.
  const sorted = [...rows].sort((a, b) => {
    const da = Date.parse(String(a["inspection-date"] ?? a["lodgement-date"] ?? a.inspectionDate ?? "")) || 0;
    const db = Date.parse(String(b["inspection-date"] ?? b["lodgement-date"] ?? b.inspectionDate ?? "")) || 0;
    return db - da;
  });
  let row = sorted[0];
  // SAON (e.g. "APARTMENT 604") is the unit identifier — most specific. PAON
  // ("BINNACLE HOUSE") matches every flat in the building, so PAON-only filtering
  // returns whichever flat is first in the list (a real bug we hit on Apt 604).
  const tryMatch = (needle: string) => {
    const n = needle.toLowerCase();
    return sorted.find((r) => {
      const a = String(r.address ?? r.address1 ?? "").toLowerCase();
      // Exact apartment-number match: "apartment 604," or "apartment 604,binnacle..."
      return a === n || a.startsWith(n + " ") || a.startsWith(n + ",") || a.includes(", " + n + ",") || a.includes(", " + n + " ");
    }) ?? sorted.find((r) => {
      const a = String(r.address ?? r.address1 ?? "").toLowerCase();
      return a.includes(n);
    });
  };
  if (saon) {
    const m = tryMatch(saon);
    if (m) row = m;
  } else if (paon) {
    const m = tryMatch(paon);
    if (m) row = m;
  }
  return {
    rating: (row["current-energy-rating"] ?? row.currentEnergyRating) as EpcData["rating"],
    potentialRating: (row["potential-energy-rating"] ?? row.potentialEnergyRating) as EpcData["potentialRating"],
    buildYear: parseYear(row["construction-age-band"] ?? row.constructionAgeBand),
    builtForm: cleanString(row["built-form"] ?? row.builtForm),
    propertyType: cleanString(row["property-type"] ?? row.propertyType),
    totalFloorArea: numberOrUndef(row["total-floor-area"] ?? row.totalFloorArea),
    mainHeating: cleanString(row["mainheat-description"] ?? row.mainHeatingDescription),
    inspectionDate: cleanString(row["inspection-date"] ?? row.inspectionDate),
    habitableRooms: numberOrUndef(row["number-habitable-rooms"] ?? row.numberHabitableRooms),
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

/**
 * EPC datasets routinely contain sentinel strings for missing values
 * ("NO DATA!", "INVALID!", "NA", "N/A", "unknown"). Strip these so the UI
 * can hide the row instead of rendering meaningless noise.
 */
function cleanString(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (/^(no\s*data!?|invalid!?|n\/?a|unknown|none)$/i.test(s)) return undefined;
  return s;
}

export interface EpcAddressRow {
  /** Lowercased address line 1 — use to match against Land Registry PAON/SAON. */
  addressLine1: string;
  habitableRooms?: number;
  totalFloorArea?: number;
  propertyType?: string;
}

/**
 * Bulk EPC lookup for all addresses in a postcode. Used to enrich Land Registry
 * comparable sales with bedroom-equivalent (habitable rooms) data — Land Registry
 * doesn't expose room counts, but the EPC register does.
 */
export async function getEpcsForPostcode(postcode: string): Promise<EpcAddressRow[]> {
  const formatted = formatPostcode(postcode);
  // Legacy first: it returns full records with rooms / floor area in the search response.
  const email = cleanEnv(process.env.EPC_API_EMAIL);
  const key = cleanEnv(process.env.EPC_API_KEY);
  if (email && key) {
    try {
      const cleaned = formatted.replace(/\s+/g, "");
      const res = await fetch(`${LEGACY_ENDPOINT}?postcode=${encodeURIComponent(cleaned)}&size=100`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 86400 * 30 },
      });
      if (res.ok) {
        const json = await res.json();
        const rows: Array<Record<string, unknown>> = json?.rows ?? [];
        // Dedupe by address — legacy returns superseded EPCs; keep the most recent.
        const byAddress = new Map<string, { row: EpcAddressRow; ts: number }>();
        for (const r of rows) {
          const a = String(r.address ?? r.address1 ?? "").trim();
          if (!a) continue;
          const key = a.toLowerCase();
          const ts = Date.parse(String(r["inspection-date"] ?? r["lodgement-date"] ?? "")) || 0;
          const existing = byAddress.get(key);
          if (existing && existing.ts >= ts) continue;
          byAddress.set(key, {
            ts,
            row: {
              addressLine1: key,
              habitableRooms: numberOrUndef(r["number-habitable-rooms"] ?? r.numberHabitableRooms),
              totalFloorArea: numberOrUndef(r["total-floor-area"] ?? r.totalFloorArea),
              propertyType: cleanString(r["property-type"] ?? r.propertyType),
            },
          });
        }
        const parsed = Array.from(byAddress.values()).map((v) => v.row);
        if (parsed.length) return parsed;
      }
    } catch { /* fall through to new endpoint */ }
  }
  const newToken = cleanEnv(process.env.EPC_API_TOKEN);
  if (newToken) {
    try {
      const params = new URLSearchParams({ postcode: formatted, page_size: "100" });
      const res = await fetch(`${NEW_ENDPOINT}/api/domestic/search?${params}`, {
        headers: { Authorization: `Bearer ${newToken}`, Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
        next: { revalidate: 86400 * 30 },
      });
      if (res.ok) {
        const json = await res.json();
        const rows: Array<Record<string, unknown>> = json?.data ?? [];
        // The new endpoint search is summary-only. Address still useful for sanity but no rooms/area.
        return rows
          .map((r): EpcAddressRow | undefined => {
            const a = String(r.addressLine1 ?? "").trim();
            if (!a) return undefined;
            return {
              addressLine1: a.toLowerCase(),
              habitableRooms: undefined,
              totalFloorArea: undefined,
              propertyType: undefined,
            };
          })
          .filter((r): r is EpcAddressRow => !!r);
      }
    } catch { /* swallow */ }
  }
  return [];
}
