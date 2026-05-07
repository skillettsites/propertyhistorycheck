/**
 * HM Land Registry Price Paid Data.
 *
 * Strategy: load monthly increments into Postgres (table: price_paid).
 * For runtime queries we hit our own DB, NOT the SPARQL endpoint
 * (treat SPARQL as nightly aggregation only — no synchronous user requests).
 *
 * Bulk download URL changes monthly:
 *   https://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv
 *
 * Licence: OGL v3.0 — display "Contains HM Land Registry data © Crown copyright and database right".
 */

import { createAdminClient } from "../supabase/admin";
import { PriceHistory, PriceSale } from "../types";

export async function getPricePaidByPostcode(
  postcode: string,
  paon?: string
): Promise<PriceHistory | undefined> {
  const admin = createAdminClient();
  const clean = postcode.replace(/\s+/g, "").toUpperCase();

  let query = admin
    .from("price_paid")
    .select("price, transfer_date, property_type, new_build, tenure, paon, saon, street")
    .eq("postcode", clean)
    .order("transfer_date", { ascending: false })
    .limit(50);

  if (paon) query = query.eq("paon", paon.toUpperCase());

  const { data, error } = await query;
  if (error || !data) return undefined;

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

  if (paon || sales.length === 0) {
    return { sales };
  }

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
