import { NextRequest, NextResponse } from "next/server";

const NEW_API_BASE = "https://api.get-energy-performance-data.communities.gov.uk";
const LEGACY_API_BASE = "https://epc.opendatacommunities.org/api/v1/domestic/search";

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
  const parts: string[] = [];
  const name = rec.buildingName || rec["building-name"];
  const num = rec.buildingNumber || rec["building-number"];
  const street = rec.street || rec["street"];
  const town = rec.town || rec["town"];

  if (name) parts.push(name);
  if (num && street) {
    parts.push(`${num} ${street}`);
  } else if (street) {
    parts.push(street);
  } else if (num) {
    parts.push(num);
  }
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

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json({ error: "postcode parameter is required" }, { status: 400 });
  }
  try {
    const addresses = await fetchAddresses(postcode);
    return NextResponse.json(
      { postcode: formatPostcode(postcode), addresses },
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
