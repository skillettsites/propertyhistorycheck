/**
 * Free report orchestrator.
 *
 * Parallel fan-out across all free data sources via Promise.allSettled —
 * a single failure must not kill the whole report. Pattern matches CCC.
 */

import { FreeReport, PostcodeAddress } from "../types";
import { getPricePaidByPostcode } from "./landRegistry";
import { getEpcByPostcode } from "./epc";
import { getFloodRisk } from "./flood";
import { getCrimeByLatLng } from "./police";
import { getNearestSchools } from "./schools";
import { getCouncilTax } from "./councilTax";
import { getBroadband, getMobileCoverage } from "./broadband";

export async function getFreeReport(address: PostcodeAddress): Promise<FreeReport> {
  const lat = address.lat;
  const lng = address.lng;
  const postcode = address.postcode;
  const paon = address.paon;

  const [priceHistory, epc, flood, crime, schools, councilTax, broadband, mobile] =
    await Promise.allSettled([
      getPricePaidByPostcode(postcode, paon),
      getEpcByPostcode(postcode, paon),
      lat && lng ? getFloodRisk(lat, lng) : Promise.resolve(undefined),
      lat && lng ? getCrimeByLatLng(lat, lng) : Promise.resolve(undefined),
      lat && lng ? getNearestSchools(lat, lng, 5) : Promise.resolve([]),
      getCouncilTax(postcode, paon),
      getBroadband(postcode),
      getMobileCoverage(postcode),
    ]);

  const pick = <T>(p: PromiseSettledResult<T>): T | undefined =>
    p.status === "fulfilled" ? p.value : undefined;

  return {
    property: address,
    priceHistory: pick(priceHistory),
    epc: pick(epc),
    flood: pick(flood),
    crime: pick(crime),
    schools: pick(schools) ?? [],
    councilTax: pick(councilTax),
    broadband: pick(broadband),
    mobile: pick(mobile) ?? [],
    generatedAt: new Date().toISOString(),
  };
}
