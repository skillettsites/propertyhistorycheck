/**
 * BGS GeoSure shrink-swell ground stability — free WMS.
 * Returns risk band 1-5 indicating clay-soil shrink-swell potential
 * (the most common subsidence cause for UK domestic properties).
 *
 * Endpoint: https://map.bgs.ac.uk/arcgis/services/GeoSure/GeoSure_v8/MapServer/WMSServer
 */

import { GroundRisk } from "../types";

const WMS_BASE = "https://map.bgs.ac.uk/arcgis/services/GeoSure/GeoSure_v8/MapServer/WMSServer";
// Layer 1 = Shrink-Swell (the clay-soil hazard most relevant to domestic insurance)
const SHRINK_SWELL_LAYER = "1";

// WGS84 -> EPSG:27700 (British National Grid). Same approximation as flood.ts.
function wgs84ToBng(lat: number, lng: number): { east: number; north: number } {
  const a = 6377563.396;
  const b = 6356256.910;
  const f0 = 0.9996012717;
  const lat0 = (49 * Math.PI) / 180;
  const lon0 = (-2 * Math.PI) / 180;
  const n0 = -100000;
  const e0 = 400000;
  const e2 = 1 - (b * b) / (a * a);
  const n = (a - b) / (a + b);
  const phi = (lat * Math.PI) / 180;
  const lam = (lng * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const nu = (a * f0) / Math.sqrt(1 - e2 * sinPhi * sinPhi);
  const rho = (a * f0 * (1 - e2)) / Math.pow(1 - e2 * sinPhi * sinPhi, 1.5);
  const eta2 = nu / rho - 1;
  const M =
    b * f0 *
    ((1 + n + (5 / 4) * n * n + (5 / 4) * n * n * n) * (phi - lat0)
      - (3 * n + 3 * n * n + (21 / 8) * n * n * n) * Math.sin(phi - lat0) * Math.cos(phi + lat0)
      + ((15 / 8) * n * n + (15 / 8) * n * n * n) * Math.sin(2 * (phi - lat0)) * Math.cos(2 * (phi + lat0))
      - (35 / 24) * n * n * n * Math.sin(3 * (phi - lat0)) * Math.cos(3 * (phi + lat0)));
  const I = M + n0;
  const II = (nu / 2) * sinPhi * cosPhi;
  const III = (nu / 24) * sinPhi * Math.pow(cosPhi, 3) * (5 - Math.pow(Math.tan(phi), 2) + 9 * eta2);
  const IIIA = (nu / 720) * sinPhi * Math.pow(cosPhi, 5) * (61 - 58 * Math.pow(Math.tan(phi), 2) + Math.pow(Math.tan(phi), 4));
  const IV = nu * cosPhi;
  const V = (nu / 6) * Math.pow(cosPhi, 3) * (nu / rho - Math.pow(Math.tan(phi), 2));
  const VI = (nu / 120) * Math.pow(cosPhi, 5) * (5 - 18 * Math.pow(Math.tan(phi), 2) + Math.pow(Math.tan(phi), 4) + 14 * eta2 - 58 * Math.pow(Math.tan(phi), 2) * eta2);
  const dLam = lam - lon0;
  const north = I + II * dLam * dLam + III * Math.pow(dLam, 4) + IIIA * Math.pow(dLam, 6);
  const east = e0 + IV * dLam + V * Math.pow(dLam, 3) + VI * Math.pow(dLam, 5);
  return { east, north };
}

export async function getGroundRisk(lat: number, lng: number): Promise<GroundRisk | undefined> {
  try {
    const { east, north } = wgs84ToBng(lat, lng);
    const half = 50;
    const params = new URLSearchParams({
      service: "WMS",
      version: "1.3.0",
      request: "GetFeatureInfo",
      layers: SHRINK_SWELL_LAYER,
      query_layers: SHRINK_SWELL_LAYER,
      crs: "EPSG:27700",
      bbox: `${east - half},${north - half},${east + half},${north + half}`,
      width: "101",
      height: "101",
      i: "50",
      j: "50",
      info_format: "application/json",
    });
    const res = await fetch(`${WMS_BASE}?${params.toString()}`, {
      next: { revalidate: 86400 * 30 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat) return { shrinkSwell: "unknown" };
    const props = feat.properties ?? {};
    // BGS classifies 1=very low ... 5=very high; field name varies by service
    const raw = String(
      props.CLASS ?? props.Class ?? props.RISK ?? props.SS_CLASS ?? props.SHRINK_SWELL ?? ""
    ).toLowerCase();
    const band = mapBand(raw);
    return {
      shrinkSwell: band,
      shrinkSwellNote: typeof props.DESCRIPTION === "string" ? props.DESCRIPTION : undefined,
    };
  } catch {
    return undefined;
  }
}

function mapBand(s: string): GroundRisk["shrinkSwell"] {
  if (s.includes("very high") || s.includes("5")) return "very-high";
  if (s.includes("high") || s.includes("4")) return "high";
  if (s.includes("significant")) return "significant";
  if (s.includes("moderate") || s.includes("3")) return "moderate";
  if (s.includes("low") && s.includes("very")) return "very-low";
  if (s.includes("low") || s.includes("2") || s.includes("1")) return "low";
  return "unknown";
}
