/**
 * Environment Agency flood risk.
 *
 * Free, OGL, no auth. NaFRA2 dataset (2025/2026 update) includes
 * climate-projected risk under UKCP18 scenarios — use that for the premium
 * tier as a competitive feature.
 *
 * Real-time flood-monitoring API:
 *   https://environment.data.gov.uk/flood-monitoring/doc/reference
 *
 * The "long-term flood risk" service (NaFRA) is consumed by lookup at
 * https://check-long-term-flood-risk.service.gov.uk/postcode — there is no
 * public REST endpoint for postcode→band, so we fall back to the WMS
 * GetFeatureInfo pattern at runtime, OR use a third-party reseller.
 */

import { FloodRisk, FloodBand } from "../types";

const REAL_TIME_BASE = "https://environment.data.gov.uk/flood-monitoring";

export async function getFloodRisk(
  lat: number,
  lng: number
): Promise<FloodRisk | undefined> {
  // Real-time alert check (informational, low signal — most properties have no live alert)
  const live = await checkLiveAlerts(lat, lng);

  // Long-term band — best-effort via Defra spatial WFS.
  const band = await getLongTermBand(lat, lng);

  if (!band && !live) return undefined;
  return {
    riversAndSea: band ?? "unknown",
    surfaceWater: "unknown", // requires premium dataset
    reservoirs: live ?? false,
  };
}

async function checkLiveAlerts(lat: number, lng: number): Promise<boolean | undefined> {
  try {
    const url = `${REAL_TIME_BASE}/id/floods?lat=${lat}&long=${lng}&dist=2`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;
    const data = await res.json();
    return Array.isArray(data?.items) && data.items.length > 0;
  } catch (err) {
    console.error("flood live alerts failed", err);
    return undefined;
  }
}

async function getLongTermBand(_lat: number, _lng: number): Promise<FloodBand | undefined> {
  // TODO: integrate Defra Flood Map for Planning WMS GetFeatureInfo, or
  // load NaFRA2 polygons into PostGIS for offline lookup. For MVP we return
  // 'unknown' and surface this as a paid-tier feature rather than free.
  return undefined;
}
