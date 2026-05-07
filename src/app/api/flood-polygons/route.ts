import { NextRequest, NextResponse } from "next/server";

/**
 * Flood-risk-zone polygons from planning.data.gov.uk for ~3km around the
 * property. Returns a GeoJSON FeatureCollection with each feature tagged
 * with its zone (2 or 3) so the map can colour-code: amber Zone 2, red Zone 3.
 */

interface PlanningEntity {
  entity: number;
  name?: string;
  reference?: string;
  geometry?: string;
  "flood-risk-level"?: string;
  "flood-risk-type"?: string;
}

function wktToGeoJsonGeometry(wkt: string) {
  const trimmed = wkt.trim();
  if (trimmed.startsWith("MULTIPOLYGON")) {
    const inner = trimmed.replace(/^MULTIPOLYGON\s*\(\(\(/, "").replace(/\)\)\)$/, "");
    const polygons = inner.split(/\)\)\s*,\s*\(\(/);
    const coords = polygons.map((poly) =>
      poly.split(/\)\s*,\s*\(/).map((ring) =>
        ring.split(",").map((pair) => pair.trim().split(/\s+/).map(Number))
      )
    );
    return { type: "MultiPolygon", coordinates: coords };
  }
  if (trimmed.startsWith("POLYGON")) {
    const inner = trimmed.replace(/^POLYGON\s*\(\(/, "").replace(/\)\)$/, "");
    const rings = inner.split(/\)\s*,\s*\(/);
    const coords = rings.map((ring) =>
      ring.split(",").map((pair) => pair.trim().split(/\s+/).map(Number))
    );
    return { type: "Polygon", coordinates: coords };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ type: "FeatureCollection", features: [] });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);

  // Try a wider bbox query first
  const dLat = 0.025; // ~2.8km
  const dLng = 0.04; // ~2.8km at UK latitudes
  const wkt = `POLYGON((${lngNum - dLng} ${latNum - dLat},${lngNum + dLng} ${latNum - dLat},${lngNum + dLng} ${latNum + dLat},${lngNum - dLng} ${latNum + dLat},${lngNum - dLng} ${latNum - dLat}))`;

  try {
    const queries = [
      // Wider bbox
      `https://www.planning.data.gov.uk/entity.json?dataset=flood-risk-zone&geometry=${encodeURIComponent(wkt)}&geometry_relation=intersects&limit=50`,
      // Fallback: lat/lng point intersect
      `https://www.planning.data.gov.uk/entity.json?dataset=flood-risk-zone&latitude=${latNum}&longitude=${lngNum}&limit=50`,
    ];

    let entities: PlanningEntity[] = [];
    for (const url of queries) {
      try {
        const res = await fetch(url, { next: { revalidate: 86400 * 7 }, signal: AbortSignal.timeout(7000) });
        if (!res.ok) continue;
        const data = await res.json();
        const e = data.entities || [];
        if (e.length > 0) {
          entities = e;
          break;
        }
      } catch { /* try next */ }
    }

    const features = entities
      .map((e) => {
        if (!e.geometry) return null;
        const geom = wktToGeoJsonGeometry(e.geometry);
        if (!geom) return null;
        const zone = parseInt(e["flood-risk-level"] ?? "2", 10);
        return {
          type: "Feature",
          geometry: geom,
          properties: {
            name: e.name ?? `Flood Zone ${zone}`,
            zone,
            riskType: e["flood-risk-type"],
          },
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      { type: "FeatureCollection", features },
      { headers: { "Cache-Control": "public, s-maxage=86400" } }
    );
  } catch {
    return NextResponse.json({ type: "FeatureCollection", features: [] });
  }
}
