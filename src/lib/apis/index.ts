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
import { getIMD } from "./imd";
import { getHealthcareNearby, getTransportNearby, getGreenspace } from "./overpass";
import { getSolarPotential } from "./solar";
import { getDemographics } from "./demographics";

export async function getFreeReport(address: PostcodeAddress): Promise<FreeReport> {
  const lat = address.lat;
  const lng = address.lng;
  const postcode = address.postcode;
  const paon = address.paon;
  const saon = address.saon;

  // Fetch EPC first because its propertyType feeds the similar-sales filter
  const epcUpfront = await getEpcByPostcode(postcode, paon).catch(() => undefined);

  const [
    priceHistory, flood, crime, councilTax, broadband, mobile, planning,
    healthcare, transportNearby, greenspace, demographics,
  ] = await Promise.allSettled([
    getPricePaidByPostcode(postcode, paon, saon, epcUpfront?.propertyType),
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
    lat && lng ? getHealthcareNearby(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getTransportNearby(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getGreenspace(lat, lng) : Promise.resolve(undefined),
    getDemographics(address.lsoa),
  ]);

  // Synchronous static-data lookups
  const schools = lat && lng ? getNearestSchools(lat, lng, 8) : [];
  const amenities = lat && lng ? getAmenities(lat, lng) : undefined;
  const transport = getTransportScore(address.lsoa);
  const imd = getIMD(address.lsoa);

  // Solar — uses EPC floor area for sizing if available
  const solar = lat && lng
    ? await getSolarPotential(lat, lng, epcUpfront?.totalFloorArea)
    : undefined;

  const pick = <T>(p: PromiseSettledResult<T>): T | undefined =>
    p.status === "fulfilled" ? p.value : undefined;

  return {
    property: address,
    priceHistory: pick(priceHistory),
    epc: epcUpfront,
    flood: pick(flood),
    crime: pick(crime),
    schools,
    councilTax: pick(councilTax),
    broadband: pick(broadband),
    mobile: pick(mobile),
    planning: pick(planning),
    amenities,
    transport,
    imd,
    healthcare: pick(healthcare),
    transportNearby: pick(transportNearby),
    greenspace: pick(greenspace),
    solar,
    demographics: pick(demographics),
    generatedAt: new Date().toISOString(),
  };
}
