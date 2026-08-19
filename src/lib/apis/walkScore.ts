/**
 * Walk-score-style 0-100 amenity density score using Overpass.
 * Counts unique POIs within 800m and weights by category, the way
 * Walk Score / Walkability Index does in the US (no UK equivalent exists).
 */

import { WalkScore } from "../types";
import { runOverpass } from "./overpassClient";

interface Element {
  type: string;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

const QUERY = (lat: number, lng: number) => `[out:json][timeout:10];
(
  node[shop=supermarket](around:1500,${lat},${lng});
  node[shop=convenience](around:500,${lat},${lng});
  node[shop=bakery](around:500,${lat},${lng});
  node[amenity=restaurant](around:800,${lat},${lng});
  node[amenity=cafe](around:800,${lat},${lng});
  node[amenity=pub](around:800,${lat},${lng});
  node[amenity=fast_food](around:800,${lat},${lng});
  node[amenity=pharmacy](around:1500,${lat},${lng});
  node[amenity=doctors](around:2000,${lat},${lng});
  node[amenity=school](around:1500,${lat},${lng});
  node[railway=station](around:2000,${lat},${lng});
  node[highway=bus_stop](around:500,${lat},${lng});
  node[amenity=bank](around:1500,${lat},${lng});
  node[amenity=post_office](around:1500,${lat},${lng});
  node[leisure=fitness_centre](around:1500,${lat},${lng});
  node[leisure=swimming_pool](around:2500,${lat},${lng});
  node[amenity=library](around:1500,${lat},${lng});
);out body 200;`;

function haversineM(la: number, lo: number, lb: number, lob: number) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLa = toRad(lb - la);
  const dLo = toRad(lob - lo);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la)) * Math.cos(toRad(lb)) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

async function runQuery(query: string): Promise<Element[]> {
  return (await runOverpass(query)) as Element[];
}

interface Bucket {
  type: string;
  weight: number;
  match: (t: Record<string, string>) => boolean;
  cap: number;
}
const BUCKETS: Bucket[] = [
  { type: "Supermarkets", weight: 15, cap: 3, match: (t) => t.shop === "supermarket" },
  { type: "Cafes & restaurants", weight: 14, cap: 8, match: (t) => t.amenity === "restaurant" || t.amenity === "cafe" || t.amenity === "fast_food" },
  { type: "Pubs", weight: 6, cap: 4, match: (t) => t.amenity === "pub" },
  { type: "Convenience stores", weight: 8, cap: 4, match: (t) => t.shop === "convenience" || t.shop === "bakery" },
  { type: "Pharmacy / GP", weight: 8, cap: 3, match: (t) => t.amenity === "pharmacy" || t.amenity === "doctors" },
  { type: "Schools", weight: 8, cap: 3, match: (t) => t.amenity === "school" },
  { type: "Public transport", weight: 18, cap: 6, match: (t) => t.railway === "station" || t.highway === "bus_stop" },
  { type: "Banks & post", weight: 6, cap: 3, match: (t) => t.amenity === "bank" || t.amenity === "post_office" },
  { type: "Leisure", weight: 7, cap: 3, match: (t) => t.leisure === "fitness_centre" || t.leisure === "swimming_pool" || t.amenity === "library" },
];

export async function getWalkScore(lat: number, lng: number): Promise<WalkScore | undefined> {
  const elements = await runQuery(QUERY(lat, lng));
  if (elements.length === 0) return undefined;

  let total = 0;
  const breakdown: WalkScore["amenities"] = [];
  for (const b of BUCKETS) {
    const matches = elements.filter((e) => e.tags && b.match(e.tags) && e.lat && e.lon);
    const count = matches.length;
    if (count === 0) {
      breakdown.push({ type: b.type, count: 0 });
      continue;
    }
    const ratio = Math.min(1, count / b.cap);
    total += b.weight * ratio;
    let nearest = Infinity;
    for (const m of matches) {
      const d = haversineM(lat, lng, m.lat!, m.lon!);
      if (d < nearest) nearest = d;
    }
    breakdown.push({ type: b.type, count, nearestM: Number.isFinite(nearest) ? nearest : undefined });
  }
  const score = Math.min(100, Math.round(total));
  const band: WalkScore["band"] =
    score >= 80 ? "Walker's paradise"
    : score >= 60 ? "Very walkable"
    : score >= 35 ? "Some amenities"
    : "Car-dependent";
  return { score, band, amenities: breakdown };
}
