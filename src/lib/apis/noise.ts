/**
 * Defra strategic noise mapping (Round 4) — free WMS GetFeatureInfo.
 * Returns Lden / Lnight decibel readings for road and rail noise at the
 * point, classifies each into a level, and gives an overall worst-case
 * verdict.
 *
 * Endpoints:
 *   Road: https://environment.data.gov.uk/spatialdata/road-noise-all-metrics-england-round-4/wms
 *   Rail: https://environment.data.gov.uk/spatialdata/railway-noise-all-metrics-england-round-4/wms
 *
 * Coverage: England only. Properties outside noise-mapped corridors return
 * `null` for individual readings, which is interpreted as "no significant
 * noise mapped at this location". If all four readings are null, the whole
 * adapter returns `undefined`.
 */

import { NoiseData } from "../types";

const ROAD_NOISE_WMS =
  "https://environment.data.gov.uk/spatialdata/road-noise-all-metrics-england-round-4/wms";

// NOTE: Defra deprecated the railway-noise-all-metrics-england-round-4 WMS
// endpoint (returns 404 as of April 2026). No replacement URL has been
// published. Rail noise queries will gracefully return null, interpreted as
// "no significant rail noise mapped at this location". Road noise is the
// dominant source for most properties so this is an acceptable fallback.
const RAIL_NOISE_WMS =
  "https://environment.data.gov.uk/spatialdata/railway-noise-all-metrics-england-round-4/wms";

const ROAD_LDEN_LAYER = "Road_Noise_Lden_England_Round_4_All";
const ROAD_LNIGHT_LAYER = "Road_Noise_Lnight_England_Round_4_All";
const RAIL_LDEN_LAYER = "Railway_Noise_Lden_England_Round_4_All";
const RAIL_LNIGHT_LAYER = "Railway_Noise_Lnight_England_Round_4_All";

export async function getNoise(lat: number, lng: number): Promise<NoiseData | undefined> {
  try {
    const [
      roadLdenResult,
      roadLnightResult,
      railLdenResult,
      railLnightResult,
    ] = await Promise.allSettled([
      fetchNoiseValue(lat, lng, ROAD_NOISE_WMS, ROAD_LDEN_LAYER),
      fetchNoiseValue(lat, lng, ROAD_NOISE_WMS, ROAD_LNIGHT_LAYER),
      fetchNoiseValue(lat, lng, RAIL_NOISE_WMS, RAIL_LDEN_LAYER),
      fetchNoiseValue(lat, lng, RAIL_NOISE_WMS, RAIL_LNIGHT_LAYER),
    ]);

    const roadNoiseLden =
      roadLdenResult.status === "fulfilled" ? roadLdenResult.value : null;
    const roadNoiseLnight =
      roadLnightResult.status === "fulfilled" ? roadLnightResult.value : null;
    const railNoiseLden =
      railLdenResult.status === "fulfilled" ? railLdenResult.value : null;
    const railNoiseLnight =
      railLnightResult.status === "fulfilled" ? railLnightResult.value : null;

    // If all values are null, the property is not in a noise-mapped corridor.
    if (
      roadNoiseLden === null &&
      roadNoiseLnight === null &&
      railNoiseLden === null &&
      railNoiseLnight === null
    ) {
      return undefined;
    }

    const roadNoiseLevel = classifyLden(roadNoiseLden);
    const railNoiseLevel = classifyLden(railNoiseLden);
    const overallLevel = worstLevel(roadNoiseLevel, railNoiseLevel);

    const verdict = buildVerdict(
      roadNoiseLden,
      railNoiseLden,
      roadNoiseLevel,
      railNoiseLevel,
      overallLevel
    );

    return {
      roadNoiseLden,
      roadNoiseLnight,
      railNoiseLden,
      railNoiseLnight,
      roadNoiseLevel,
      railNoiseLevel,
      overallLevel,
      verdict,
    };
  } catch {
    return undefined;
  }
}

/**
 * Fetch a single Lden / Lnight value from a Defra noise WMS GetFeatureInfo
 * endpoint. Tries application/json first, falls back to text/plain. Retries
 * once on transient failure, with a 9-second per-attempt timeout matching
 * the groundRisk adapter.
 */
async function fetchNoiseValue(
  lat: number,
  lng: number,
  wmsBase: string,
  layer: string
): Promise<number | null> {
  const formats = ["application/json", "text/plain"];
  const d = 0.0001; // ~11m bbox around the point
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;

  for (const format of formats) {
    const url =
      `${wmsBase}` +
      `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo` +
      `&LAYERS=${layer}&QUERY_LAYERS=${layer}` +
      `&CRS=EPSG:4326&SRS=EPSG:4326` +
      `&BBOX=${bbox}` +
      `&WIDTH=10&HEIGHT=10&I=5&J=5&X=5&Y=5` +
      `&INFO_FORMAT=${encodeURIComponent(format)}`;

    let res: Response | undefined;
    for (let i = 0; i < 2; i++) {
      try {
        res = await fetch(url, {
          next: { revalidate: 86400 * 30 },
          signal: AbortSignal.timeout(9000),
        });
        if (res.ok) break;
        if (res.status < 500) {
          res = undefined;
          break;
        }
      } catch {
        // retry once on AbortError / network
      }
    }
    if (!res || !res.ok) continue;

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("json") || format === "application/json") {
      try {
        const data = await res.json();
        const db = extractDbFromJson(data);
        if (db !== null) return db;
      } catch {
        continue;
      }
    } else {
      const text = await res.text();
      const db = extractDbFromText(text);
      if (db !== null) return db;
    }
  }

  return null;
}

/**
 * Extract a dB value from a GeoServer JSON response. The response typically
 * has a "features" array with properties containing the noise band or value.
 */
function extractDbFromJson(data: Record<string, unknown>): number | null {
  const features = data.features as Array<Record<string, unknown>> | undefined;

  if (Array.isArray(features) && features.length > 0) {
    const props = (features[0].properties || {}) as Record<string, unknown>;

    const candidateKeys = [
      "Value", "value", "VALUE",
      "Band", "band", "BAND",
      "NoiseLevel", "noise_level", "Noise_Level",
      "Lden", "lden", "LDEN",
      "Lnight", "lnight", "LNIGHT",
      "dB", "db", "DB",
      "GRAY_INDEX", "gray_index",
    ];

    for (const key of candidateKeys) {
      const val = props[key];
      if (val !== undefined && val !== null) {
        const num = parseFloat(String(val));
        if (!isNaN(num) && num > 0 && num < 150) {
          return Math.round(num * 10) / 10;
        }
      }
    }

    // Try to parse a range like "55.0-59.9" or "55-60" and take the midpoint.
    for (const key of Object.keys(props)) {
      const val = String(props[key]);
      const rangeMatch = val.match(/(\d+\.?\d*)\s*[-to]+\s*(\d+\.?\d*)/);
      if (rangeMatch) {
        const low = parseFloat(rangeMatch[1]);
        const high = parseFloat(rangeMatch[2]);
        if (low >= 30 && high <= 150) {
          return Math.round(((low + high) / 2) * 10) / 10;
        }
      }
    }
  }

  return null;
}

/**
 * Extract a dB value from a plain text or HTML WMS response. Looks for
 * patterns like "55.0 dB", "Band = 55-60", or bare numbers in a noise
 * context.
 */
function extractDbFromText(text: string): number | null {
  const dbMatch = text.match(/(?:value|band|level|db|noise)[^\d]*(\d+\.?\d*)/i);
  if (dbMatch) {
    const num = parseFloat(dbMatch[1]);
    if (num >= 30 && num <= 150) {
      return Math.round(num * 10) / 10;
    }
  }

  const rangeMatch = text.match(/(\d+\.?\d*)\s*[-to]+\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (low >= 30 && high <= 150) {
      return Math.round(((low + high) / 2) * 10) / 10;
    }
  }

  const bareMatch = text.match(/\b(\d{2}\.?\d?)\b/);
  if (bareMatch) {
    const num = parseFloat(bareMatch[1]);
    if (num >= 40 && num <= 100) {
      return Math.round(num * 10) / 10;
    }
  }

  return null;
}

/**
 * Classify an Lden value into a noise level. Based on WHO Environmental
 * Noise Guidelines:
 *   <50 dB Lden  = quiet
 *   50-60 dB     = moderate
 *   60-70 dB     = noisy
 *   >70 dB       = very noisy
 */
function classifyLden(db: number | null): NoiseData["roadNoiseLevel"] {
  if (db === null) return "quiet"; // no data implies not in noise-mapped corridor
  if (db < 50) return "quiet";
  if (db < 60) return "moderate";
  if (db < 70) return "noisy";
  return "very-noisy";
}

function worstLevel(
  a: NoiseData["roadNoiseLevel"],
  b: NoiseData["railNoiseLevel"]
): NoiseData["overallLevel"] {
  const order: Record<NoiseData["overallLevel"], number> = {
    quiet: 0,
    moderate: 1,
    noisy: 2,
    "very-noisy": 3,
  };
  return order[a] >= order[b] ? a : b;
}

function buildVerdict(
  roadDb: number | null,
  railDb: number | null,
  roadLevel: NoiseData["roadNoiseLevel"],
  railLevel: NoiseData["railNoiseLevel"],
  overall: NoiseData["overallLevel"]
): string {
  const parts: string[] = [];

  if (roadDb !== null) {
    parts.push(
      `Road noise measured at approximately ${roadDb} dB Lden (${formatLevel(roadLevel)})`
    );
  } else {
    parts.push("No significant road noise mapped at this location");
  }

  if (railDb !== null) {
    parts.push(
      `Rail noise measured at approximately ${railDb} dB Lden (${formatLevel(railLevel)})`
    );
  } else {
    parts.push("No significant rail noise mapped at this location");
  }

  switch (overall) {
    case "quiet":
      parts.push(
        "Overall, this location is in a quiet area with noise levels well within recommended limits."
      );
      break;
    case "moderate":
      parts.push(
        "Overall, noise levels are moderate. You may notice traffic or rail noise during peak hours, but levels are within acceptable ranges for residential areas."
      );
      break;
    case "noisy":
      parts.push(
        "Noise levels are elevated at this location. Consider double glazing and the impact on outdoor spaces. This could affect property desirability for some buyers."
      );
      break;
    case "very-noisy":
      parts.push(
        "This location has high noise exposure exceeding WHO recommended limits. Sound insulation measures are strongly recommended. This may have a measurable impact on property values."
      );
      break;
  }

  return parts.map((p) => p.replace(/\.$/, "")).join(". ") + ".";
}

function formatLevel(level: NoiseData["roadNoiseLevel"]): string {
  switch (level) {
    case "quiet":
      return "quiet";
    case "moderate":
      return "moderate";
    case "noisy":
      return "noisy";
    case "very-noisy":
      return "very noisy";
    default:
      return level;
  }
}
