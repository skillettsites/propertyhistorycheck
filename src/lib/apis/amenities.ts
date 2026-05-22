/**
 * Local amenities, supermarkets and convenience stores within 1.5km.
 * Static OSM extract from PostcodeCheck.
 */

import amenitiesRaw from "@/data/amenities.json";
import { AmenityItem, AmenitiesData } from "../types";

interface AmenityEntry {
  n: string;
  la: number;
  lo: number;
}

interface AmenitiesFile {
  supermarkets: AmenityEntry[];
  convenience: AmenityEntry[];
}

const data = amenitiesRaw as AmenitiesFile;

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearby(entries: AmenityEntry[], lat: number, lng: number, radiusM: number, limit: number): AmenityItem[] {
  const out: (AmenityItem & { _dist: number })[] = [];
  for (const e of entries) {
    const d = haversineMetres(lat, lng, e.la, e.lo);
    if (d <= radiusM) out.push({ name: e.n, distance: Math.round(d) / 1000, _dist: d });
  }
  out.sort((a, b) => a._dist - b._dist);
  return out.slice(0, limit).map(({ _dist, ...rest }) => rest);
}

export function getAmenities(lat: number, lng: number): AmenitiesData {
  const supermarkets = findNearby(data.supermarkets || [], lat, lng, 1500, 10);
  const convenience = findNearby(data.convenience || [], lat, lng, 500, 20);
  const total = supermarkets.length + convenience.length;
  let amenityScore: AmenitiesData["amenityScore"];
  if (total >= 8) amenityScore = "Excellent";
  else if (total >= 4) amenityScore = "Good";
  else if (total >= 1) amenityScore = "Average";
  else amenityScore = "Poor";
  return {
    supermarkets,
    convenienceStores: convenience.length,
    nearestSupermarket: supermarkets[0] || null,
    amenityScore,
  };
}
