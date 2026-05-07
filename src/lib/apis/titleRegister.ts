/**
 * HM Land Registry title register pull (PAID, premium-tier only).
 *
 * Strategy: launch via PropertyData (or Sprift) reseller API while HMLR
 * Business Gateway onboarding is in progress (6-12 weeks). Migrate to direct
 * HMLR Business Gateway later for the £3-£7 wholesale fee.
 *
 * Both providers expose REST endpoints that take a title number or address
 * and return the title register PDF + parsed summary.
 */

import { TitleRegisterSummary } from "../types";

const PROPERTYDATA_BASE = "https://api.propertydata.co.uk/v1";

interface PropertyDataTitleResponse {
  title_number?: string;
  tenure?: string;
  registered_owners?: string[];
  date_of_registration?: string;
  price_paid?: { amount: number; date: string };
  lease?: {
    term_years?: number;
    start_date?: string;
    remaining_years?: number;
  };
  charges_count?: number;
  restrictions_count?: number;
  cautions_count?: number;
  has_restrictive_covenants?: boolean;
  pdf_url?: string;
}

export async function getTitleRegister(
  postcode: string,
  paon: string,
  saon?: string
): Promise<TitleRegisterSummary | undefined> {
  const key = process.env.PROPERTYDATA_API_KEY;
  if (!key) {
    console.warn("PROPERTYDATA_API_KEY not set; title register pull unavailable");
    return undefined;
  }
  try {
    const params = new URLSearchParams({
      key,
      postcode,
      paon,
    });
    if (saon) params.set("saon", saon);
    const res = await fetch(`${PROPERTYDATA_BASE}/title-register?${params}`, {
      next: { revalidate: 0 }, // never cache — paid pull, single-use
    });
    if (!res.ok) {
      console.error("PropertyData title-register failed", res.status, await res.text());
      return undefined;
    }
    const data = (await res.json()) as PropertyDataTitleResponse;
    return {
      titleNumber: data.title_number,
      tenure: data.tenure?.toLowerCase() === "leasehold" ? "leasehold" : "freehold",
      registeredOwners: data.registered_owners,
      registeredOn: data.date_of_registration,
      pricePaid: data.price_paid,
      leaseTermYears: data.lease?.term_years,
      leaseStartDate: data.lease?.start_date,
      leaseRemainingYears: data.lease?.remaining_years,
      charges: data.charges_count,
      restrictions: data.restrictions_count,
      cautions: data.cautions_count,
      hasRestrictiveCovenants: data.has_restrictive_covenants,
      rawDocumentUrl: data.pdf_url,
    };
  } catch (err) {
    console.error("getTitleRegister failed", err);
    return undefined;
  }
}
