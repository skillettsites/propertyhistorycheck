/**
 * Environment Agency flood risk.
 *
 * Flood ZONE membership (the headline "is this property in a flood zone?")
 * comes from the EA "Flood Map for Planning (Rivers and Sea)" polygons via
 * point-in-polygon queries against the published ArcGIS FeatureServer:
 *   - layer 1 = Flood Zone 3 (high probability, >1% rivers / >0.5% sea)
 *   - layer 2 = Flood Zone 2 (medium probability, 0.1-1% rivers / 0.1-0.5% sea)
 *
 * Active flood WARNINGS come from the free real-time flood-monitoring API.
 *
 * IMPORTANT: a previous version inferred "in Flood Zone 2" from the presence
 * of any flood *alert/warning area* within 1km (the /floodAreas endpoint).
 * Those administrative areas blanket whole river catchments including high
 * ground that is NOT in any flood zone, so almost every property was wrongly
 * flagged "medium / in Flood Zone 2". This version uses the actual flood-zone
 * polygons, so the answer reflects the real planning flood zone.
 */

import { FloodRisk } from "../types";

const RT_BASE = "https://environment.data.gov.uk/flood-monitoring";
const FMP_BASE =
  "https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Flood_Map_for_Planning/FeatureServer";

/** Point-in-polygon count against one Flood Map for Planning layer. */
async function inFloodZoneLayer(layerId: number, lat: number, lng: number): Promise<boolean | null> {
  try {
    const url =
      `${FMP_BASE}/${layerId}/query?geometry=${lng},${lat}` +
      `&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects` +
      `&returnCountOnly=true&f=json`;
    const res = await fetch(url, {
      next: { revalidate: 86400 * 30 },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: number; error?: unknown };
    if (data.error || typeof data.count !== "number") return null;
    return data.count > 0;
  } catch {
    return null; // null = "couldn't determine", never falsely claim a zone
  }
}

export async function getFloodRisk(lat: number, lng: number): Promise<FloodRisk | undefined> {
  try {
    // Run the three queries in parallel: active warnings + FZ3 + FZ2.
    const [warningsRes, inZone3Raw, inZone2Raw] = await Promise.all([
      fetch(`${RT_BASE}/id/floods?lat=${lat}&long=${lng}&dist=5`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3500),
      }).catch(() => null),
      inFloodZoneLayer(1, lat, lng), // Flood Zone 3
      inFloodZoneLayer(2, lat, lng), // Flood Zone 2
    ]);

    let nearbyWarnings: FloodRisk["nearbyWarnings"] = [];
    if (warningsRes && warningsRes.ok) {
      const data = await warningsRes.json();
      const items = data.items || [];
      nearbyWarnings = items.map(
        (item: {
          floodAreaID?: string;
          description?: string;
          severity?: string;
          severityLevel?: number;
          message?: string;
        }) => ({
          id: item.floodAreaID || "",
          description: item.description || "",
          severity: item.severity || "",
          severityLevel: item.severityLevel || 4,
          message: item.message || "",
        })
      );
    }

    // FZ3 is a subset of FZ2: if in zone 3, it's also in zone 2.
    const inFloodZone3 = inZone3Raw === true;
    const inFloodZone2 = inFloodZone3 || inZone2Raw === true;

    // Risk level from actual zone membership + any active warnings.
    let riskLevel: FloodRisk["riskLevel"] = "very-low";
    if (inFloodZone3 || nearbyWarnings.some((w) => w.severityLevel <= 2)) {
      riskLevel = "high";
    } else if (inFloodZone2 || nearbyWarnings.some((w) => w.severityLevel === 3)) {
      riskLevel = "medium";
    } else if (nearbyWarnings.length > 0) {
      riskLevel = "low";
    }

    return {
      inFloodZone2,
      inFloodZone3,
      nearbyWarnings: nearbyWarnings.slice(0, 5),
      riskLevel,
    };
  } catch {
    return undefined;
  }
}
