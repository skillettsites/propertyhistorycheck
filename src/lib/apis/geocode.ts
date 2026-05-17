/**
 * Postcode → addresses → lat/lng/UPRN.
 *
 * Strategy:
 *  - For autocomplete, use postcodes.io (free, no key, OGL).
 *  - For per-address UPRN + AddressBase fields, prefer OS Places API
 *    (PSGA Premium Plan, £1,000/mo free credit).
 *  - Optionally swap to Ideal Postcodes by setting IDEAL_POSTCODES_API_KEY.
 *
 * GetAddress.io is dead (High Court ruling Feb 2026); do not use.
 */

import { PostcodeAddress } from "../types";

const POSTCODES_IO = "https://api.postcodes.io";
const OS_PLACES = "https://api.os.uk/search/places/v1";

export interface PostcodeLookup {
  postcode: string;
  lat: number;
  lng: number;
  admin_district?: string;
  admin_county?: string;
  region?: string;
  country?: string;
  parish?: string;
  parliamentary_constituency?: string;
  lsoa?: string;
  msoa?: string;
}

export async function lookupPostcode(postcode: string): Promise<PostcodeLookup | null> {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  try {
    const res = await fetch(`${POSTCODES_IO}/postcodes/${encodeURIComponent(clean)}`, {
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.result) return null;
    const r = data.result;
    return {
      postcode: r.postcode,
      lat: r.latitude,
      lng: r.longitude,
      admin_district: r.admin_district,
      admin_county: r.admin_county,
      region: r.region,
      country: r.country,
      parish: r.parish,
      parliamentary_constituency: r.parliamentary_constituency,
      lsoa: r.codes?.lsoa,
      msoa: r.codes?.msoa,
    };
  } catch (err) {
    console.error("lookupPostcode failed", err);
    return null;
  }
}

export async function autocompletePostcode(query: string): Promise<string[]> {
  const clean = query.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 2) return [];
  try {
    const res = await fetch(
      `${POSTCODES_IO}/postcodes/${encodeURIComponent(clean)}/autocomplete`,
      { next: { revalidate: 86400 * 7 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.result) ? data.result : [];
  } catch (err) {
    console.error("autocompletePostcode failed", err);
    return [];
  }
}

/**
 * OS Places API — find addresses for a postcode.
 * Requires OS_DATA_HUB_KEY. £1,000/mo free credit on the Premium Plan.
 * Falls back to a postcode-only stub if no key is configured.
 */
export async function findAddressesByPostcode(postcode: string): Promise<PostcodeAddress[]> {
  const key = process.env.OS_DATA_HUB_KEY;
  if (!key) {
    const lookup = await lookupPostcode(postcode);
    if (!lookup) return [];
    return [
      {
        postcode: lookup.postcode,
        fullAddress: lookup.postcode,
        lat: lookup.lat,
        lng: lookup.lng,
        town: lookup.admin_district,
      },
    ];
  }

  try {
    const url = `${OS_PLACES}/postcode?postcode=${encodeURIComponent(postcode)}&key=${key}&dataset=DPA&maxresults=100`;
    const res = await fetch(url, { next: { revalidate: 86400 * 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];
    return results.map((r: { DPA: Record<string, unknown> }) => {
      const dpa = r.DPA;
      return {
        uprn: String(dpa.UPRN ?? ""),
        fullAddress: String(dpa.ADDRESS ?? ""),
        paon: dpa.BUILDING_NUMBER ? String(dpa.BUILDING_NUMBER) : (dpa.BUILDING_NAME as string | undefined),
        saon: dpa.SUB_BUILDING_NAME as string | undefined,
        street: dpa.THOROUGHFARE_NAME as string | undefined,
        town: dpa.POST_TOWN as string | undefined,
        postcode: String(dpa.POSTCODE ?? postcode),
        lat: dpa.LAT as number | undefined,
        lng: dpa.LNG as number | undefined,
      } satisfies PostcodeAddress;
    });
  } catch (err) {
    console.error("findAddressesByPostcode (OS Places) failed", err);
    return [];
  }
}
