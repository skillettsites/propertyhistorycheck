/**
 * Environment Agency flood risk.
 *
 * Strategy:
 * 1. Real-time alert check (free, no auth) for active alerts at the location.
 * 2. WMS GetFeatureInfo against the Risk of Flooding from Rivers and Sea
 *    layer for a long-term band ("Very Low" / "Low" / "Medium" / "High").
 * 3. Same again for surface water risk.
 *
 * No key required. Rate-limited only by sensible HTTP politeness.
 * 24-hour cache via Next fetch revalidation.
 */

import { FloodRisk, FloodBand } from "../types";

const REAL_TIME_BASE = "https://environment.data.gov.uk/flood-monitoring";
const WMS_RIVERS_SEA = "https://environment.data.gov.uk/spatialdata/risk-of-flooding-from-rivers-and-sea/wms";
const WMS_SURFACE_WATER = "https://environment.data.gov.uk/spatialdata/risk-of-flooding-from-surface-water/wms";

export async function getFloodRisk(lat: number, lng: number): Promise<FloodRisk | undefined> {
  const [live, riversAndSea, surfaceWater] = await Promise.all([
    checkLiveAlerts(lat, lng),
    getBandFromWms(lat, lng, WMS_RIVERS_SEA, "Risk_of_Flooding_from_Rivers_and_Sea"),
    getBandFromWms(lat, lng, WMS_SURFACE_WATER, "Risk_of_Flooding_from_Surface_Water"),
  ]);

  if (!riversAndSea && !surfaceWater && live === undefined) return undefined;
  return {
    riversAndSea: riversAndSea ?? "unknown",
    surfaceWater: surfaceWater ?? "unknown",
    reservoirs: live ?? false,
  };
}

async function checkLiveAlerts(lat: number, lng: number): Promise<boolean | undefined> {
  try {
    const url = `${REAL_TIME_BASE}/id/floods?lat=${lat}&long=${lng}&dist=2`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return Array.isArray(data?.items) && data.items.length > 0;
  } catch {
    return undefined;
  }
}

/**
 * Convert WGS84 lat/lng to British National Grid (EPSG:27700) for WMS query.
 * Pure-JS approximation accurate to ~1-2m for England + Wales, more than
 * enough to land in the right grid cell for flood-risk lookup.
 */
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

async function getBandFromWms(
  lat: number,
  lng: number,
  wmsBase: string,
  layer: string
): Promise<FloodBand | undefined> {
  try {
    const { east, north } = wgs84ToBng(lat, lng);
    const half = 50; // 50m bbox
    const params = new URLSearchParams({
      service: "WMS",
      version: "1.3.0",
      request: "GetFeatureInfo",
      layers: layer,
      query_layers: layer,
      crs: "EPSG:27700",
      bbox: `${east - half},${north - half},${east + half},${north + half}`,
      width: "101",
      height: "101",
      i: "50",
      j: "50",
      info_format: "application/json",
    });
    const url = `${wmsBase}?${params.toString()}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const features = data?.features ?? [];
    if (features.length === 0) return "very_low";
    const props = features[0]?.properties ?? {};
    const rawBand = String(
      props.prob_4band ??
      props.SW_RISK ??
      props.RISK ??
      props.risk_band ??
      ""
    ).toLowerCase();
    if (rawBand.includes("high")) return "high";
    if (rawBand.includes("medium")) return "medium";
    if (rawBand.includes("low") && rawBand.includes("very")) return "very_low";
    if (rawBand.includes("low")) return "low";
    return undefined;
  } catch {
    return undefined;
  }
}
