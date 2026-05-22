import { NextRequest, NextResponse } from "next/server";

const NEW_API_BASE = "https://api.get-energy-performance-data.communities.gov.uk";
const LEGACY_API_BASE = "https://epc.opendatacommunities.org/api/v1/domestic/search";
const OS_PLACES_BASE = "https://api.os.uk/search/places/v1";

function cleanEnv(v: string | undefined): string {
  return (v || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length < 5) return cleaned;
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
}

function toTitleCase(str: string): string {
  return str
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildAddress(rec: Record<string, string>): string {
  // New MHCLG API returns: addressLine1, addressLine2, addressLine3, addressLine4, postTown, postcode
  const newApiLines = [rec.addressLine1, rec.addressLine2, rec.addressLine3, rec.addressLine4]
    .filter((s) => s && String(s).trim().length > 0);
  if (newApiLines.length > 0) {
    const parts = newApiLines.map((s) => toTitleCase(String(s).trim()));
    if (rec.postTown) parts.push(toTitleCase(String(rec.postTown).trim()));
    return parts.join(", ");
  }

  // Legacy API: buildingName / buildingNumber / street / town fields
  const parts: string[] = [];
  const name = rec.buildingName || rec["building-name"];
  const num = rec.buildingNumber || rec["building-number"];
  const street = rec.street || rec["street"];
  const town = rec.town || rec["town"];
  if (name) parts.push(name);
  if (num && street) parts.push(`${num} ${street}`);
  else if (street) parts.push(street);
  else if (num) parts.push(num);
  if (town) parts.push(town);

  if (parts.length === 0 && (rec.address || rec["address"])) {
    return toTitleCase((rec.address || rec["address"]).trim());
  }
  return parts.map((p) => toTitleCase(p.trim())).join(", ");
}

async function fetchAddresses(postcode: string): Promise<string[]> {
  const formatted = formatPostcode(postcode);

  // Primary: new MHCLG API
  const token = cleanEnv(process.env.EPC_API_TOKEN);
  if (token) {
    try {
      const res = await fetch(
        `${NEW_API_BASE}/api/domestic/search?postcode=${encodeURIComponent(formatted)}&page_size=200`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const seen = new Set<string>();
          const addresses: string[] = [];
          for (const rec of json.data) {
            const addr = buildAddress(rec);
            if (!addr || addr.length < 3) continue;
            const k = addr.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
            if (!seen.has(k)) {
              seen.add(k);
              addresses.push(addr);
            }
          }
          return addresses.sort((a, b) => a.localeCompare(b, "en-GB"));
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Fallback: legacy EPC API (basic auth)
  const email = cleanEnv(process.env.EPC_API_EMAIL);
  const key = cleanEnv(process.env.EPC_API_KEY);
  if (email && key) {
    try {
      const cleaned = postcode.replace(/\s+/g, "");
      const res = await fetch(
        `${LEGACY_API_BASE}?postcode=${encodeURIComponent(cleaned)}&size=200`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString("base64")}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const rows = json.rows;
        if (Array.isArray(rows) && rows.length > 0) {
          const seen = new Set<string>();
          const addresses: string[] = [];
          for (const row of rows) {
            const addr = buildAddress(row);
            const k = addr.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
            if (!seen.has(k)) {
              seen.add(k);
              addresses.push(addr);
            }
          }
          return addresses.sort((a, b) => a.localeCompare(b, "en-GB"));
        }
      }
    } catch {
      /* return empty */
    }
  }

  return [];
}

/**
 * Ordnance Survey Places API, comprehensive AddressBase Premium.
 * Returns ALL UPRN-registered addresses for a postcode, including flats
 * within named buildings. Requires OS_DATA_HUB_KEY (Premium Plan, free
 * £1k/mo credit). Without the key, returns [] silently.
 */
async function fetchOsPlacesAddresses(postcode: string): Promise<string[]> {
  const key = cleanEnv(process.env.OS_DATA_HUB_KEY);
  if (!key) return [];
  try {
    const formatted = formatPostcode(postcode);
    const url = `${OS_PLACES_BASE}/postcode?postcode=${encodeURIComponent(formatted)}&key=${encodeURIComponent(key)}&dataset=DPA&maxresults=100`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.results ?? [];
    const addresses: string[] = [];
    const seen = new Set<string>();
    for (const r of results) {
      const dpa = r.DPA;
      if (!dpa) continue;
      const full = String(dpa.ADDRESS ?? "");
      if (!full) continue;
      // ADDRESS often ends with ", POSTCODE"; trim it for cleaner display
      const cleaned = full.replace(/,\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").trim();
      const titleCased = toTitleCase(cleaned);
      const k = titleCased.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
      if (!seen.has(k)) {
        seen.add(k);
        addresses.push(titleCased);
      }
    }
    return addresses.sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }));
  } catch {
    return [];
  }
}

function naturalSortAddresses(addresses: string[]): string[] {
  return [...addresses].sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true }));
}

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json({ error: "postcode parameter is required" }, { status: 400 });
  }
  try {
    // Run OS Places + EPC in parallel; combine and dedupe.
    const [epc, os] = await Promise.allSettled([
      fetchAddresses(postcode),
      fetchOsPlacesAddresses(postcode),
    ]);
    const epcList = epc.status === "fulfilled" ? epc.value : [];
    const osList = os.status === "fulfilled" ? os.value : [];

    const seen = new Set<string>();
    const combined: string[] = [];
    // OS results first, they tend to be cleaner and more comprehensive
    for (const a of osList) {
      const k = a.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
      if (a && !seen.has(k)) {
        seen.add(k);
        combined.push(a);
      }
    }
    for (const a of epcList) {
      const k = a.toLowerCase().replace(/[,.\-\s]+/g, " ").trim();
      if (a && !seen.has(k)) {
        seen.add(k);
        combined.push(a);
      }
    }

    return NextResponse.json(
      {
        postcode: formatPostcode(postcode),
        addresses: naturalSortAddresses(combined),
        sources: {
          osPlaces: osList.length,
          epc: epcList.length,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}
