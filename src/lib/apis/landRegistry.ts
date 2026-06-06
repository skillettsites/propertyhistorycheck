/**
 * HM Land Registry Price Paid lookup.
 *
 * For street-numbered properties:
 *  PAON = "26", street = "Parsons Close" → match by paon
 *
 * For flats in named buildings:
 *  PAON = "Binnacle House" (or street number "10"), SAON = "604" or "Apartment 604"
 *  → match by saon (flat number)
 *
 * Returns:
 *  - sales: this exact property's recorded sales
 *  - similarSales: same-postcode same-property-type sales (excludes this property)
 *  - postcode aggregates for headline stats
 */

import { createAdminClient } from "../supabase/admin";
import { PriceHistory, PriceSale } from "../types";

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";

function formatPostcode(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  if (c.length < 5) return c;
  return `${c.slice(0, -3)} ${c.slice(-3)}`;
}

/**
 * Strict equality check that tolerates Land Registry's noisy address text:
 *  "604" matches saon "604" or "APARTMENT 604" or "FLAT 604" or "604," etc.
 *  "BINNACLE HOUSE" matches paon "BINNACLE HOUSE" or "BINNACLE HSE".
 */
function saonMatches(target: string | undefined, candidate: string | undefined): boolean {
  if (!target || !candidate) return false;
  const t = target.toUpperCase().replace(/^(APARTMENT|APT|FLAT|UNIT|SUITE|MAISONETTE)\s+/i, "").trim();
  const c = candidate.toUpperCase().replace(/^(APARTMENT|APT|FLAT|UNIT|SUITE|MAISONETTE)\s+/i, "").trim();
  if (!t || !c) return false;
  return t === c;
}

function paonMatches(target: string | undefined, candidate: string | undefined): boolean {
  if (!target || !candidate) return false;
  return target.toUpperCase().trim() === candidate.toUpperCase().trim();
}

export async function getPricePaidByPostcode(
  postcode: string,
  paon?: string,
  saon?: string,
  epcPropertyType?: string,
): Promise<PriceHistory | undefined> {
  const formatted = formatPostcode(postcode);

  // Pull ALL postcode sales once (cheap on SPARQL, ~50 max for residential postcodes).
  const allSales = await trySparqlPostcode(formatted);
  if (!allSales || allSales.length === 0) return undefined;

  // Identify this property's sales by saon (flat) or paon (street number)
  let propertySales: PriceSale[] = [];
  if (saon) {
    propertySales = allSales.filter((s) => saonMatches(saon, s.saon));
  } else if (paon) {
    // For street-numbered houses (no saon), match by paon only when no saon is present
    propertySales = allSales.filter((s) => paonMatches(paon, s.paon) && !s.saon);
  }

  // Identify similar sales: same property type as us, exclude self.
  // Prefer the EPC-derived type, but fall back to this property's OWN Land
  // Registry property type when the EPC didn't resolve, otherwise we'd leak
  // other property types (e.g. detached) into the "similar" comps and skew
  // the valuation.
  const ownType = propertySales.find((s) => s.propertyType)?.propertyType;
  const matchType = mapEpcTypeToLrCode(epcPropertyType) ?? ownType;
  const similarSales = allSales.filter((s) => {
    // Exclude this property's own sales
    const isSelf =
      (saon && saonMatches(saon, s.saon)) ||
      (paon && paonMatches(paon, s.paon) && !s.saon);
    if (isSelf) return false;
    if (matchType && s.propertyType && s.propertyType !== matchType) return false;
    return true;
  });

  const prices = allSales.map((s) => s.price).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    sales: propertySales,
    similarSales: similarSales.slice(0, 12),
    postcodeAverage: Math.round(avg),
    postcodeMedian: median,
    postcodeSampleSize: allSales.length,
  };
}

function mapEpcTypeToLrCode(epcType?: string): "D" | "S" | "T" | "F" | "O" | undefined {
  if (!epcType) return undefined;
  const t = epcType.toLowerCase();
  if (t.includes("detached")) return "D";
  if (t.includes("semi")) return "S";
  if (t.includes("terrace")) return "T";
  if (t.includes("flat") || t.includes("maisonette") || t.includes("apartment")) return "F";
  return undefined;
}

async function trySparqlPostcode(postcode: string): Promise<PriceSale[] | undefined> {
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
      OPTIONAL { ?addr lrcommon:paon ?paon }
      OPTIONAL { ?addr lrcommon:saon ?saon }
      OPTIONAL { ?addr lrcommon:street ?street }
      BIND(STRAFTER(STR(?pt), "/common/") AS ?ptShort)
      BIND(STRAFTER(STR(?et), "/common/") AS ?etShort)
    }
    ORDER BY DESC(?date) LIMIT 200
  `.trim();

  try {
    const res = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
      },
      body: `query=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const bindings: Array<Record<string, { value: string }>> = json?.results?.bindings ?? [];
    if (!bindings.length) return undefined;
    return bindings.map((b) => ({
      price: Number(b.amount?.value ?? 0),
      date: (b.date?.value ?? "").slice(0, 10),
      propertyType: shortLetter(b.ptShort?.value, ["detached", "semi-detached", "terraced", "flat-maisonette", "other"]),
      newBuild: b.newBuild?.value === "true",
      tenure: shortLetter(b.etShort?.value, ["freehold", "leasehold"]) === "F" ? "F" : "L",
      paon: b.paon?.value,
      saon: b.saon?.value,
      street: b.street?.value,
    }));
  } catch (err) {
    console.error("SPARQL postcode query failed", err);
    return undefined;
  }
}

function shortLetter(val: string | undefined, allowed: string[]): "D" | "S" | "T" | "F" | "O" | undefined {
  if (!val) return undefined;
  const lower = val.toLowerCase();
  for (const a of allowed) {
    if (lower.startsWith(a.charAt(0))) return a.charAt(0).toUpperCase() as "D" | "S" | "T" | "F" | "O";
  }
  return undefined;
}

// Legacy DB path retained for when price_paid table is loaded; currently unused.
export async function getPricePaidFromDb(
  postcode: string,
  paon?: string
): Promise<PriceHistory | undefined> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const upperPaon = paon?.toUpperCase();
  try {
    const admin = createAdminClient();
    let q = admin
      .from("price_paid")
      .select("price, transfer_date, property_type, new_build, tenure, paon, saon, street")
      .eq("postcode", cleaned)
      .order("transfer_date", { ascending: false })
      .limit(50);
    if (upperPaon) q = q.eq("paon", upperPaon);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return undefined;
    const sales: PriceSale[] = data.map((r) => ({
      price: r.price as number,
      date: r.transfer_date as string,
      propertyType: r.property_type as PriceSale["propertyType"],
      newBuild: r.new_build as boolean,
      tenure: r.tenure as PriceSale["tenure"],
      paon: r.paon as string | undefined,
      saon: r.saon as string | undefined,
      street: r.street as string | undefined,
    }));
    return { sales };
  } catch {
    return undefined;
  }
}
