/**
 * Free report orchestrator. Parallel fan-out across all data sources.
 */

import { FreeReport, PostcodeAddress } from "../types";
import { getPricePaidByPostcode } from "./landRegistry";
import { getEpcByPostcode } from "./epc";
import { getFloodRisk } from "./flood";
import { getCrimeByLatLng } from "./police";
import { getNearestSchools } from "./schools";
import { getCouncilTax } from "./councilTax";
import { getBroadband } from "./broadband";
import { getMobileSignal } from "./mobile";
import { getPlanningData } from "./planningConstraints";
import { getAmenities } from "./amenities";
import { getTransportScore } from "./transport";

export async function getFreeReport(address: PostcodeAddress): Promise<FreeReport> {
  const lat = address.lat;
  const lng = address.lng;
  const postcode = address.postcode;
  const paon = address.paon;

  const [
    priceHistory,
    epc,
    flood,
    crime,
    councilTax,
    broadband,
    mobile,
    planning,
  ] = await Promise.allSettled([
    getPricePaidByPostcode(postcode, paon),
    getEpcByPostcode(postcode, paon),
    lat && lng ? getFloodRisk(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getCrimeByLatLng(lat, lng) : Promise.resolve(undefined),
    Promise.resolve(getCouncilTax({
      adminDistrictCode: address.adminDistrictCode,
      adminDistrictName: address.adminDistrictName,
      region: address.region,
      country: address.country,
    })),
    getBroadband(postcode, address.region),
    getMobileSignal(postcode),
    lat && lng ? getPlanningData(lat, lng) : Promise.resolve(undefined),
  ]);

  // Synchronous (static-data) lookups
  const schools = lat && lng ? getNearestSchools(lat, lng, 8) : [];
  const amenities = lat && lng ? getAmenities(lat, lng) : undefined;
  const transport = getTransportScore(address.lsoa);

  const pick = <T>(p: PromiseSettledResult<T>): T | undefined =>
    p.status === "fulfilled" ? p.value : undefined;

  return {
    property: address,
    priceHistory: pick(priceHistory),
    epc: pick(epc),
    flood: pick(flood),
    crime: pick(crime),
    schools,
    councilTax: pick(councilTax),
    broadband: pick(broadband),
    mobile: pick(mobile),
    planning: pick(planning),
    amenities,
    transport,
    generatedAt: new Date().toISOString(),
  };
}
