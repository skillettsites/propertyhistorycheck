/**
 * Schools, nearest 15 within 3km, ported from PostcodeCheck static dataset.
 * Source: GIAS bulk register (35,000+ UK establishments), serialised as JSON.
 */

import schoolsRaw from "@/data/schools.json";
import { School } from "../types";

interface SchoolEntry {
  u: number; // URN
  n: string; // name
  p: "P" | "S" | "O"; // phase
  pc: string; // postcode
  la: number; // lat
  lo: number; // lng
  r?: "O" | "G" | "R" | "I"; // Ofsted rating
}

const schools = schoolsRaw as SchoolEntry[];
const PHASE_MAP: Record<string, string> = { P: "Primary", S: "Secondary", O: "All-through" };
const RATING_MAP: Record<string, string> = {
  O: "Outstanding",
  G: "Good",
  R: "Requires Improvement",
  I: "Inadequate",
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function getNearestSchools(lat: number, lng: number, limit = 8): School[] {
  const results: (School & { _dist: number })[] = [];
  for (const s of schools) {
    if (!s.la || !s.lo) continue;
    const dist = haversineKm(lat, lng, s.la, s.lo);
    if (dist <= 3) {
      results.push({
        urn: s.u,
        name: s.n,
        phase: PHASE_MAP[s.p] || "Other",
        rating: s.r ? RATING_MAP[s.r] || "Unknown" : "Not inspected",
        postcode: s.pc,
        distance: dist,
        latitude: s.la,
        longitude: s.lo,
        _dist: dist,
      });
    }
  }
  results.sort((a, b) => a._dist - b._dist);
  return results.slice(0, limit).map(({ _dist, ...rest }) => rest);
}
