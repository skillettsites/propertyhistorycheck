/**
 * Free report orchestrator. Parallel fan-out across all data sources.
 */

import { FreeReport, PostcodeAddress } from "../types";
import { getPricePaidByPostcode } from "./landRegistry";
import { getEpcByPostcode, getEpcsForPostcode } from "./epc";
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
import { getEvCharging } from "./evCharging";
import { getGroundRisk } from "./groundRisk";
import { getNoise } from "./noise";
import { getWalkScore } from "./walkScore";
import { getAirQuality } from "./airQuality";
import { getListedBuildingDetail } from "./listedBuilding";
// estimateMonthlyRent moved to paidReport.ts
import { computeLifestyleScores, computeAreaTrend, computeCompositeRisk } from "../synthesised";

/**
 * @param opts.fast  When true, skip the slowest sources (police crime + the three
 *   Overpass "local context" queries) and the synthesised verdict that depends on
 *   them. This returns a "core" report in a fraction of the time so the results
 *   page can paint immediately; the client fetches the full report in parallel and
 *   fills the deferred sections in when it lands.
 */
export async function getFreeReport(
  address: PostcodeAddress,
  opts?: { fast?: boolean }
): Promise<FreeReport> {
  const fast = opts?.fast ?? false;
  const lat = address.lat;
  const lng = address.lng;
  const postcode = address.postcode;
  const paon = address.paon;
  const saon = address.saon;

  // Fetch EPC first because its propertyType feeds the similar-sales filter
  // and its floor area sizes the solar estimate.
  const epcUpfront = await getEpcByPostcode(postcode, paon, saon).catch(() => undefined);

  const [
    priceHistory, flood, crime, councilTax, broadband, mobile, planning,
    healthcare, transportNearby, greenspace, demographics,
    evCharging, groundRisk, noise, walkScore, airQuality, listedBuilding,
    postcodeEpcs, solarSettled,
  ] = await Promise.allSettled([
    getPricePaidByPostcode(postcode, paon, saon, epcUpfront?.propertyType),
    lat && lng ? getFloodRisk(lat, lng) : Promise.resolve(undefined),
    // Deferred in fast mode: police.uk is the slowest source (24 month fetches).
    fast || !(lat && lng) ? Promise.resolve(undefined) : getCrimeByLatLng(lat, lng),
    Promise.resolve(getCouncilTax({
      adminDistrictCode: address.adminDistrictCode,
      adminDistrictName: address.adminDistrictName,
      region: address.region,
      country: address.country,
    })),
    getBroadband(postcode, address.region),
    getMobileSignal(postcode),
    lat && lng ? getPlanningData(lat, lng) : Promise.resolve(undefined),
    // Deferred in fast mode: the three Overpass "local context" queries.
    fast || !(lat && lng) ? Promise.resolve(undefined) : getHealthcareNearby(lat, lng),
    fast || !(lat && lng) ? Promise.resolve(undefined) : getTransportNearby(lat, lng),
    fast || !(lat && lng) ? Promise.resolve(undefined) : getGreenspace(lat, lng),
    getDemographics(address.lsoa, address.msoa),
    lat && lng ? getEvCharging(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getGroundRisk(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getNoise(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getWalkScore(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getAirQuality(lat, lng) : Promise.resolve(undefined),
    lat && lng ? getListedBuildingDetail(lat, lng) : Promise.resolve(undefined),
    getEpcsForPostcode(postcode),
    // Solar runs in the same parallel batch (sized from the already-resolved EPC
    // floor area). Previously it was awaited serially after the batch, adding up
    // to 5s of dead time to every report.
    lat && lng ? getSolarPotential(lat, lng, epcUpfront?.totalFloorArea) : Promise.resolve(undefined),
  ]);

  // Synchronous static-data lookups
  const schools = lat && lng ? getNearestSchools(lat, lng, 8) : [];
  const amenities = lat && lng ? getAmenities(lat, lng) : undefined;
  const transport = getTransportScore(address.lsoa);
  const imd = getIMD(address.lsoa);

  const pick = <T>(p: PromiseSettledResult<T>): T | undefined =>
    p.status === "fulfilled" ? p.value : undefined;

  const solar = pick(solarSettled);

  // Enrich similar sales with habitable rooms from the postcode's bulk EPC list.
  // Land Registry has no bedroom data; EPC's `numberHabitableRooms` is the closest proxy.
  const enrichedPriceHistory = (() => {
    const ph = pick(priceHistory);
    if (!ph) return ph;
    const epcs = pick(postcodeEpcs) ?? [];
    if (!epcs.length) return ph;
    const enrich = (sale: import("../types").PriceSale): import("../types").PriceSale => {
      // For flats, SAON is the unit identifier (e.g. "APARTMENT 604"), most specific.
      // For houses, only PAON is set ("12" or "ROSE COTTAGE"), also unique within the postcode.
      // Try most-specific match first; never fall back to whole-building (PAON-only when SAON exists)
      // because that match is non-unique and would attach random EPCs to flat sales.
      const candidates: string[] = [];
      if (sale.saon) {
        candidates.push(sale.saon.toLowerCase());
      } else if (sale.paon) {
        // House: PAON alone is the address identifier
        candidates.push(sale.paon.toLowerCase());
      }
      for (const c of candidates) {
        // Whole-word exact match preferred, then substring as fallback
        const exact = epcs.find((e) => e.addressLine1 === c || e.addressLine1.startsWith(c + " ") || e.addressLine1.startsWith(c + ","));
        const hit = exact ?? epcs.find((e) => e.addressLine1.includes(c));
        if (hit && (hit.habitableRooms != null || hit.totalFloorArea != null)) {
          return { ...sale, habitableRooms: hit.habitableRooms, floorAreaM2: hit.totalFloorArea };
        }
      }
      return sale;
    };
    return {
      ...ph,
      sales: ph.sales.map(enrich),
      similarSales: ph.similarSales?.map(enrich),
    };
  })();

  // Rental estimate moved to PAID flow only, see paidReport.ts.
  // The free report shows a locked teaser. Avoids burning PropertyData credits
  // on every free pageview (~1p / call adds up).
  const rentalEstimate: import("../types").RentalEstimate | undefined = undefined;

  // Synthesised signals, pure functions over the raw data above. Computed last.
  const signalInput = {
    schools, imd, crime: pick(crime), flood: pick(flood), groundRisk: pick(groundRisk),
    airQuality: pick(airQuality), walkScore: pick(walkScore), transportNearby: pick(transportNearby),
    healthcare: pick(healthcare), greenspace: pick(greenspace), planning: pick(planning),
    demographics: pick(demographics), epc: epcUpfront, priceHistory: enrichedPriceHistory,
    rentalEstimate, listedBuilding: pick(listedBuilding),
  };
  // These synthesised verdicts blend crime + local-context data, so in fast mode
  // (where those are deferred) we leave them undefined and let the full report fill
  // them in. The client shows a "loading…" placeholder for them until then.
  const lifestyleScores = fast ? undefined : computeLifestyleScores(signalInput);
  const areaTrend = fast ? undefined : computeAreaTrend(signalInput);
  const compositeRisk = fast ? undefined : computeCompositeRisk(signalInput);

  return {
    property: address,
    priceHistory: enrichedPriceHistory,
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
    evCharging: pick(evCharging),
    groundRisk: pick(groundRisk),
    noise: pick(noise),
    walkScore: pick(walkScore),
    airQuality: pick(airQuality),
    listedBuilding: pick(listedBuilding),
    rentalEstimate,
    lifestyleScores,
    areaTrend,
    compositeRisk,
    generatedAt: new Date().toISOString(),
  };
}
