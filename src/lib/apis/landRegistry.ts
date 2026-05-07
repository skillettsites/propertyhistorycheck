/**
 * HM Land Registry Price Paid lookup.
 *
 * Two paths:
 * 1. If `price_paid` table is populated, query Supabase (fast).
 * 2. Otherwise, hit the public SPARQL endpoint at runtime (free, no key).
 *
 * SPARQL endpoint: https://landregistry.data.gov.uk/landregistry/query
 * No documented hard rate limit — informally ~1-5 req/sec sustained.
 * Cached for 7 days via Next fetch revalidation.
 */

import { createAdminClient } from "../supabase/admin";
import { PriceHistory, PriceSale } from "../types";

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";

export async function getPricePaidByPostcode(
  postcode: string,
  paon?: string
): Promise<PriceHistory | undefined> {
  const formatted = formatPostcode(postcode);
  const upperPaon = paon?.toUpperCase();

  // Try Supabase first (fastest if populated)
  const fromDb = await tryDb(formatted.replace(/\s+/g, ""), upperPaon);
  if (fromDb && fromDb.sales.length > 0) return fromDb;

  // Try SPARQL with PAON filter first (exact-match on this property)
  if (upperPaon) {
    const exact = await trySparql(formatted, upperPaon);
    if (exact && exact.sales.length > 0) return exact;
  }

  // Fall back to postcode-only (gives neighbour comparables)
  return trySparql(formatted, undefined);
}

function formatPostcode(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  if (c.length < 5) return c;
  return `${c.slice(0, -3)} ${c.slice(-3)}`;
}

async function tryDb(postcode: string, paon?: string): Promise<PriceHistory | undefined> {
  try {
    const admin = createAdminClient();
    let q = admin
      .from("price_paid")
      .select("price, transfer_date, property_type, new_build, tenure, paon, saon, street")
      .eq("postcode", postcode)
      .order("transfer_date", { ascending: false })
      .limit(50);
    if (paon) q = q.eq("paon", paon);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return undefined;
    return composeHistory(data, !!paon);
  } catch {
    return undefined;
  }
}

interface DbRow {
  price: number;
  transfer_date: string;
  property_type?: string;
  new_build?: boolean;
  tenure?: string;
  paon?: string;
  saon?: string;
  street?: string;
}

function composeHistory(rows: DbRow[], filteredByPaon: boolean): PriceHistory {
  const sales: PriceSale[] = rows.map((r) => ({
    price: r.price,
    date: r.transfer_date,
    propertyType: r.property_type as PriceSale["propertyType"],
    newBuild: r.new_build,
    tenure: r.tenure as PriceSale["tenure"],
    paon: r.paon,
    saon: r.saon,
    street: r.street,
  }));
  if (filteredByPaon || sales.length === 0) return { sales };
  const prices = sales.map((s) => s.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return {
    sales,
    postcodeAverage: Math.round(avg),
    postcodeMedian: median,
    postcodeSampleSize: sales.length,
  };
}

async function trySparql(postcode: string, paon?: string): Promise<PriceHistory | undefined> {
  const filterClause = paon
    ? `?addr lrcommon:paon "${paon.replace(/"/g, '\\"')}" .`
    : "";
  const query = `
    PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
    PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
    SELECT ?amount ?date ?ptShort ?newBuild ?etShort ?paon ?saon ?street WHERE {
      ?txn lrppi:pricePaid ?amount ;
           lrppi:transactionDate ?date ;
           lrppi:propertyType ?pt ;
           lrppi:newBuild ?newBuild ;
           lrppi:estateType ?et ;
           lrppi:propertyAddress ?addr .
      ?addr lrcommon:postcode "${postcode}" .
      ${filterClause}
      OPTIONAL { ?addr lrcommon:paon ?paon }
      OPTIONAL { ?addr lrcommon:saon ?saon }
      OPTIONAL { ?addr lrcommon:street ?street }
      BIND(STRAFTER(STR(?pt), "/common/") AS ?ptShort)
      BIND(STRAFTER(STR(?et), "/common/") AS ?etShort)
    }
    ORDER BY DESC(?date) LIMIT 50
  `.trim();

  try {
    const res = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const bindings: Array<Record<string, { value: string }>> = json?.results?.bindings ?? [];
    if (!bindings.length) return undefined;
    const rows: DbRow[] = bindings.map((b) => ({
      price: Number(b.amount?.value ?? 0),
      transfer_date: (b.date?.value ?? "").slice(0, 10),
      property_type: shortLetter(b.ptShort?.value, ["detached", "semi-detached", "terraced", "flat-maisonette", "other"]),
      new_build: b.newBuild?.value === "true",
      tenure: shortLetter(b.etShort?.value, ["freehold", "leasehold"]) === "F" ? "F" : "L",
      paon: b.paon?.value,
      saon: b.saon?.value,
      street: b.street?.value,
    }));
    return composeHistory(rows, !!paon);
  } catch (err) {
    console.error("SPARQL price-paid lookup failed", err);
    return undefined;
  }
}

function shortLetter(val: string | undefined, allowed: string[]): string | undefined {
  if (!val) return undefined;
  const lower = val.toLowerCase();
  for (const a of allowed) {
    if (lower.startsWith(a.charAt(0))) return a.charAt(0).toUpperCase();
  }
  return undefined;
}
