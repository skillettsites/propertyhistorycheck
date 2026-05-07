import { NextRequest, NextResponse } from "next/server";

/**
 * Pulls flood-risk-zone polygons from planning.data.gov.uk for a small
 * area around the property and returns them as a GeoJSON FeatureCollection
 * suitable for direct rendering on Leaflet.
 */

interface PlanningEntity {
  entity: number;
  name?: string;
  reference?: string;
  geometry?: string; // WKT MULTIPOLYGON / POLYGON
  "flood-risk-level"?: string;
  "flood-risk-type"?: string;
}

// Lightweight WKT -> GeoJSON for POLYGON / MULTIPOLYGON.
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

  try {
    const url =
      `https://www.planning.data.gov.uk/entity.json` +
      `?dataset=flood-risk-zone` +
      `&latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}` +
      `&limit=10`;
    const res = await fetch(url, {
      next: { revalidate: 86400 * 7 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return NextResponse.json({ type: "FeatureCollection", features: [] });
    }
    const data = await res.json();
    const entities: PlanningEntity[] = data.entities || [];
    const features = entities
      .map((e) => {
        if (!e.geometry) return null;
        const geom = wktToGeoJsonGeometry(e.geometry);
        if (!geom) return null;
        return {
          type: "Feature",
          geometry: geom,
          properties: {
            name: e.name,
            zone: e["flood-risk-level"],
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
