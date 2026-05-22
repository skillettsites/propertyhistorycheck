/**
 * Historic England listed-building detail lookup via planning.data.gov.uk.
 *
 * Free, no key. Complements `planningConstraints.ts` which only flags the
 * presence of nearby listed buildings, this adapter returns the full
 * NHLE entry (grade, name, list reference, Historic England URL).
 *
 * Spatial query gotcha: listed-building entities expose only `point`
 * (no `geometry` polygon), so the lat/lng / `near` query params on
 * planning.data.gov.uk return 0 results. We send a small WKT POLYGON
 * bounding box around the property and use `geometry_relation=intersects`,
 * which the API does honour for point-typed datasets.
 */

import { ListedBuildingDetail } from "../types";

const ENDPOINT = "https://www.planning.data.gov.uk/entity.json";

interface NhleEntity {
  entity?: number;
  name?: string;
  reference?: string;
  point?: string; // "POINT (lng lat)"
  "entry-date"?: string;
  "start-date"?: string;
  "documentation-url"?: string;
  "listed-building-grade"?: string;
}

// ~50m bounding box at UK latitudes. 1 degree lat ~= 111 km, so 0.00045 ~= 50m.
// Longitude shrinks by cos(lat); use the same delta, for England that's ~30m E-W,
// good enough to catch the building you're standing on plus immediate neighbours.
const HALF_DEG = 0.00045;

function buildBboxWkt(lat: number, lng: number): string {
  const minLng = lng - HALF_DEG;
  const maxLng = lng + HALF_DEG;
  const minLat = lat - HALF_DEG;
  const maxLat = lat + HALF_DEG;
  return `POLYGON((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat}))`;
}

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

function parsePoint(wkt: string): { lat: number; lng: number } | undefined {
  // "POINT (-2.239117 51.198831)"
  const m = /POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i.exec(wkt);
  if (!m) return undefined;
  const lng = Number(m[1]);
  const lat = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { lat, lng };
}

function normaliseGrade(raw?: string): ListedBuildingDetail["grade"] | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toUpperCase();
  if (s === "I" || s === "1") return "I";
  if (s === "II*" || s === "II *" || s === "2*") return "II*";
  if (s === "II" || s === "2") return "II";
  return undefined;
}

export async function getListedBuildingDetail(
  lat: number,
  lng: number,
): Promise<ListedBuildingDetail | undefined> {
  try {
    const wkt = buildBboxWkt(lat, lng);
    const params = new URLSearchParams({
      dataset: "listed-building",
      geometry: wkt,
      geometry_relation: "intersects",
      limit: "20",
    });
    const url = `${ENDPOINT}?${params.toString()}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 * 30 },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const entities: NhleEntity[] = data?.entities || [];
    if (entities.length === 0) return { listed: false };

    // Pick the geographically nearest entry to the property.
    let nearest: { entity: NhleEntity; distance: number } | undefined;
    for (const e of entities) {
      if (!e.point) continue;
      const p = parsePoint(e.point);
      if (!p) continue;
      const d = haversineMetres(lat, lng, p.lat, p.lng);
      if (!nearest || d < nearest.distance) nearest = { entity: e, distance: d };
    }
    if (!nearest) {
      // Entries existed but none had parseable points; still flag as listed.
      return { listed: true };
    }

    const e = nearest.entity;
    const grade = normaliseGrade(e["listed-building-grade"]);
    const entryUrl =
      e["documentation-url"] ||
      (e.reference
        ? `https://historicengland.org.uk/listing/the-list/list-entry/${e.reference}`
        : undefined);

    return {
      listed: true,
      grade,
      name: e.name,
      listDate: e["start-date"] || e["entry-date"] || undefined,
      entryUrl,
      distance: Math.round(nearest.distance),
    };
  } catch (err) {
    console.error("listed-building lookup failed", err);
    return undefined;
  }
}
