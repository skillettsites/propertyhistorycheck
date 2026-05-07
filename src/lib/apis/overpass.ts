/**
 * OpenStreetMap Overpass API — runtime spatial queries for amenities.
 * Free, no key. Fair-use ~10k queries/day per IP.
 * Cache aggressively (30 days).
 */

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

interface OverpassNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export interface PlaceHit {
  category: string;
  name?: string;
  brand?: string;
  lat: number;
  lng: number;
  distanceM: number;
  url?: string;
}

function haversineM(la: number, lo: number, lb: number, lob: number) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLa = toRad(lb - la);
  const dLo = toRad(lob - lo);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la)) * Math.cos(toRad(lb)) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

async function runQuery(query: string): Promise<OverpassNode[]> {
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        next: { revalidate: 86400 * 30 },
        signal: AbortSignal.timeout(13000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const elements = (data?.elements ?? []) as OverpassNode[];
      if (elements.length > 0 || res.status === 200) return elements;
    } catch {
      // try next mirror
    }
  }
  return [];
}

export interface HealthcareData {
  gps: PlaceHit[];
  pharmacies: PlaceHit[];
  dentists: PlaceHit[];
  hospitals: PlaceHit[];
  nearestGp?: PlaceHit;
  nearestPharmacy?: PlaceHit;
  nearestHospital?: PlaceHit;
}

export async function getHealthcareNearby(lat: number, lng: number): Promise<HealthcareData | undefined> {
  const query = `[out:json][timeout:8];
(
  node[amenity=doctors](around:2000,${lat},${lng});
  node[amenity=clinic](around:2000,${lat},${lng});
  node[amenity=pharmacy](around:1500,${lat},${lng});
  node[amenity=dentist](around:2500,${lat},${lng});
  node[amenity=hospital](around:5000,${lat},${lng});
);out body 60;`;
  const nodes = await runQuery(query);
  if (nodes.length === 0) return undefined;

  const map = (n: OverpassNode, category: string): PlaceHit => ({
    category,
    name: n.tags?.name,
    brand: n.tags?.brand,
    lat: n.lat,
    lng: n.lon,
    distanceM: haversineM(lat, lng, n.lat, n.lon),
  });

  const gps = nodes.filter((n) => ["doctors", "clinic"].includes(n.tags?.amenity ?? "")).map((n) => map(n, "GP")).sort((a, b) => a.distanceM - b.distanceM);
  const pharmacies = nodes.filter((n) => n.tags?.amenity === "pharmacy").map((n) => map(n, "Pharmacy")).sort((a, b) => a.distanceM - b.distanceM);
  const dentists = nodes.filter((n) => n.tags?.amenity === "dentist").map((n) => map(n, "Dentist")).sort((a, b) => a.distanceM - b.distanceM);
  const hospitals = nodes.filter((n) => n.tags?.amenity === "hospital").map((n) => map(n, "Hospital")).sort((a, b) => a.distanceM - b.distanceM);

  if (gps.length + pharmacies.length + hospitals.length === 0) return undefined;

  return {
    gps, pharmacies, dentists, hospitals,
    nearestGp: gps[0],
    nearestPharmacy: pharmacies[0],
    nearestHospital: hospitals[0],
  };
}

export interface TransportNearby {
  nearestStation?: PlaceHit;
  nearestTube?: PlaceHit;
  nearestBus?: PlaceHit;
  stations: PlaceHit[];
}

export async function getTransportNearby(lat: number, lng: number): Promise<TransportNearby | undefined> {
  const query = `[out:json][timeout:8];
(
  node[railway=station](around:5000,${lat},${lng});
  node[railway=halt](around:5000,${lat},${lng});
  node[station=subway](around:3000,${lat},${lng});
  node[highway=bus_stop](around:500,${lat},${lng});
);out body 30;`;
  const nodes = await runQuery(query);
  if (nodes.length === 0) return undefined;

  const stations: PlaceHit[] = [];
  let tube: PlaceHit | undefined;
  let bus: PlaceHit | undefined;
  for (const n of nodes) {
    const tags = n.tags ?? {};
    const item: PlaceHit = {
      category: "",
      name: tags.name,
      lat: n.lat, lng: n.lon,
      distanceM: haversineM(lat, lng, n.lat, n.lon),
    };
    if (tags.railway === "station" || tags.railway === "halt") {
      const isUnderground = tags.station === "subway";
      if (isUnderground) {
        item.category = "Tube";
        if (!tube || item.distanceM < tube.distanceM) tube = item;
      } else {
        item.category = "Rail station";
        stations.push(item);
      }
    } else if (tags.station === "subway") {
      item.category = "Tube";
      if (!tube || item.distanceM < tube.distanceM) tube = item;
    } else if (tags.highway === "bus_stop") {
      item.category = "Bus stop";
      if (!bus || item.distanceM < bus.distanceM) bus = item;
    }
  }
  stations.sort((a, b) => a.distanceM - b.distanceM);
  if (stations.length === 0 && !tube && !bus) return undefined;
  return {
    stations: stations.slice(0, 5),
    nearestStation: stations[0],
    nearestTube: tube,
    nearestBus: bus,
  };
}

export interface GreenspaceData {
  parks: PlaceHit[];
  woodland: PlaceHit[];
  nearestPark?: PlaceHit;
}

export async function getGreenspace(lat: number, lng: number): Promise<GreenspaceData | undefined> {
  const query = `[out:json][timeout:8];
(
  node[leisure=park](around:1500,${lat},${lng});
  node[leisure=garden][garden:type!=residential](around:1500,${lat},${lng});
  node[landuse=forest](around:3000,${lat},${lng});
  node[natural=wood](around:3000,${lat},${lng});
);out body 30;`;
  const nodes = await runQuery(query);
  if (nodes.length === 0) return undefined;
  const map = (n: OverpassNode, category: string): PlaceHit => ({
    category,
    name: n.tags?.name,
    lat: n.lat, lng: n.lon,
    distanceM: haversineM(lat, lng, n.lat, n.lon),
  });
  const parks = nodes.filter((n) => n.tags?.leisure === "park" || n.tags?.leisure === "garden").map((n) => map(n, "Park")).sort((a, b) => a.distanceM - b.distanceM);
  const woodland = nodes.filter((n) => n.tags?.landuse === "forest" || n.tags?.natural === "wood").map((n) => map(n, "Woodland")).sort((a, b) => a.distanceM - b.distanceM);
  if (parks.length + woodland.length === 0) return undefined;
  return { parks, woodland, nearestPark: parks[0] };
}
