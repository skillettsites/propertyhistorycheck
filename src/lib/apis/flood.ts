/**
 * Environment Agency flood risk.
 * Free, no key. Uses /flood-monitoring/id/floods + /id/floodAreas endpoints.
 * Ported from PostcodeCheck.
 */

import { FloodRisk } from "../types";

const BASE = "https://environment.data.gov.uk/flood-monitoring";

export async function getFloodRisk(lat: number, lng: number): Promise<FloodRisk | undefined> {
  try {
    const warningsRes = await fetch(`${BASE}/id/floods?lat=${lat}&long=${lng}&dist=5`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3500),
    });

    let nearbyWarnings: FloodRisk["nearbyWarnings"] = [];
    if (warningsRes.ok) {
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

    const areasRes = await fetch(`${BASE}/id/floodAreas?lat=${lat}&long=${lng}&dist=1`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3500),
    });

    let inFloodZone2 = false;
    let inFloodZone3 = false;
    if (areasRes.ok) {
      const data = await areasRes.json();
      const areas = data.items || [];
      if (areas.length > 0) {
        inFloodZone2 = true;
        if (nearbyWarnings.some((w) => w.severityLevel <= 2)) {
          inFloodZone3 = true;
        }
      }
    }

    let riskLevel: FloodRisk["riskLevel"] = "very-low";
    if (inFloodZone3 || nearbyWarnings.some((w) => w.severityLevel <= 2)) riskLevel = "high";
    else if (inFloodZone2 || nearbyWarnings.some((w) => w.severityLevel === 3)) riskLevel = "medium";
    else if (nearbyWarnings.length > 0) riskLevel = "low";

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
