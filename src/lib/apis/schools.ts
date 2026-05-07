/**
 * Schools — closest establishments by lat/lng.
 *
 * Source: GIAS (Get Information About Schools) bulk CSV refreshed daily.
 * For MVP we use a fallback list cached in Postgres (table: schools).
 * Distance: haversine from property lat/lng to school coords.
 */

import { createAdminClient } from "../supabase/admin";
import { School } from "../types";

export async function getNearestSchools(
  lat: number,
  lng: number,
  limit = 5
): Promise<School[]> {
  const admin = createAdminClient();
  // Approximate bounding box (~10 miles) to limit scan.
  const dLat = 0.15;
  const dLng = 0.25;
  const { data, error } = await admin
    .from("schools")
    .select("name, type_of_establishment, ofsted_rating, urn, age_low, age_high, lat, lng")
    .gte("lat", lat - dLat)
    .lte("lat", lat + dLat)
    .gte("lng", lng - dLng)
    .lte("lng", lng + dLng)
    .limit(200);

  if (error || !data) return [];

  const withDistance = data.map((s) => ({
    raw: s,
    distance: haversine(lat, lng, s.lat as number, s.lng as number),
  }));
  withDistance.sort((a, b) => a.distance - b.distance);

  return withDistance.slice(0, limit).map((d) => ({
    name: d.raw.name as string,
    type: d.raw.type_of_establishment as string,
    ofstedRating: d.raw.ofsted_rating as School["ofstedRating"],
    distanceMiles: Math.round(d.distance * 10) / 10,
    ageRange: d.raw.age_low && d.raw.age_high ? `${d.raw.age_low}-${d.raw.age_high}` : undefined,
    urn: d.raw.urn ? String(d.raw.urn) : undefined,
  }));
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
