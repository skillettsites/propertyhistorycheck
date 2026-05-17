/**
 * Defra UK-AIR air quality.
 *
 * Free, OGL, no key. Uses the Defra Sensor Observation Service (SOS)
 * REST API: https://uk-air.defra.gov.uk/sos-ukair/api/v1/
 *
 * Phenomenon IDs (EIONET vocabulary):
 *   8    = Nitrogen dioxide (NO2)  — ug/m3
 *   6001 = Particulate matter < 2.5 um (PM2.5) — ug/m3
 *
 * The `near` query param is NOT honoured server-side (Defra returns the full
 * UK list regardless), so we fetch all timeseries for each phenomenon and
 * find the nearest station ourselves. Station coordinates come back as
 * [latitude, longitude] (NOT GeoJSON [lng,lat]) so we read them in that order.
 *
 * Defra encodes "no data" as the sentinel value -99.0 — we filter those out.
 */

import { AirQualityData } from "../types";

const BASE = "https://uk-air.defra.gov.uk/sos-ukair/api/v1";

interface SosTimeseries {
  id: string;
  label?: string;
  station?: {
    properties?: { id?: number; label?: string };
    geometry?: { coordinates?: [number, number, string] }; // [lat, lng, alt]
  };
}

interface SosTimeseriesDetail {
  lastValue?: { timestamp?: number; value?: number };
  firstValue?: { timestamp?: number; value?: number };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findNearestReading(
  lat: number,
  lng: number,
  phenomenon: number,
): Promise<{ value: number; stationName: string; distanceKm: number } | undefined> {
  const res = await fetch(`${BASE}/timeseries?phenomenon=${phenomenon}`, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return undefined;
  const list = (await res.json()) as SosTimeseries[];
  if (!Array.isArray(list) || list.length === 0) return undefined;

  // Score every station by distance, take closest with a defined position.
  let best: { ts: SosTimeseries; distanceKm: number } | undefined;
  for (const ts of list) {
    const coords = ts.station?.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const sLat = Number(coords[0]);
    const sLng = Number(coords[1]);
    if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) continue;
    const d = haversineKm(lat, lng, sLat, sLng);
    if (!best || d < best.distanceKm) best = { ts, distanceKm: d };
  }
  if (!best) return undefined;

  // Fetch detail to get the latest reading.
  const detailRes = await fetch(`${BASE}/timeseries/${best.ts.id}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(6000),
    headers: { Accept: "application/json" },
  });
  if (!detailRes.ok) return undefined;
  const detail = (await detailRes.json()) as SosTimeseriesDetail;
  const v = detail.lastValue?.value;
  // -99.0 is Defra's "no data" sentinel.
  if (typeof v !== "number" || !Number.isFinite(v) || v <= -90) return undefined;

  const rawLabel = best.ts.station?.properties?.label || "";
  const stationName = rawLabel.replace(/-[^-]+\(air\)$/i, "").trim() || "Defra station";

  return { value: v, stationName, distanceKm: best.distanceKm };
}

function daqiCategory(band: number): AirQualityData["daqiCategory"] {
  if (band <= 3) return "Low";
  if (band <= 6) return "Moderate";
  if (band <= 9) return "High";
  return "Very High";
}

// DAQI hourly band derivation from instantaneous concentrations.
// Source: Defra DAQI band breakpoints (ug/m3) for NO2 and PM2.5.
// We take the worse of the two pollutant bands (DAQI's "highest band wins" rule).
function bandFromNo2(no2: number): number {
  // 1: 0-67, 2: 68-134, 3: 135-200, 4: 201-267, 5: 268-334, 6: 335-400,
  // 7: 401-467, 8: 468-534, 9: 535-600, 10: 601+
  return Math.min(10, Math.max(1, Math.ceil(no2 / 67) || 1));
}
function bandFromPm25(pm: number): number {
  // 1: 0-11, 2: 12-23, 3: 24-35, 4: 36-41, 5: 42-47, 6: 48-53,
  // 7: 54-58, 8: 59-64, 9: 65-70, 10: 71+
  if (pm < 12) return 1;
  if (pm < 24) return 2;
  if (pm < 36) return 3;
  if (pm < 42) return 4;
  if (pm < 48) return 5;
  if (pm < 54) return 6;
  if (pm < 59) return 7;
  if (pm < 65) return 8;
  if (pm < 71) return 9;
  return 10;
}

function clampBand(n: number): AirQualityData["daqiBand"] {
  const b = Math.min(10, Math.max(1, Math.round(n)));
  return b as AirQualityData["daqiBand"];
}

export async function getAirQuality(
  lat: number,
  lng: number,
): Promise<AirQualityData | undefined> {
  try {
    const [no2Result, pm25Result] = await Promise.allSettled([
      findNearestReading(lat, lng, 8),
      findNearestReading(lat, lng, 6001),
    ]);

    const no2 = no2Result.status === "fulfilled" ? no2Result.value : undefined;
    const pm25 = pm25Result.status === "fulfilled" ? pm25Result.value : undefined;

    if (!no2 && !pm25) return undefined;

    // Pick the closer station for the "nearestStation" label.
    let nearestStation: AirQualityData["nearestStation"];
    if (no2 && pm25) {
      const closer = no2.distanceKm <= pm25.distanceKm ? no2 : pm25;
      nearestStation = { name: closer.stationName, distanceKm: round1(closer.distanceKm) };
    } else if (no2) {
      nearestStation = { name: no2.stationName, distanceKm: round1(no2.distanceKm) };
    } else if (pm25) {
      nearestStation = { name: pm25.stationName, distanceKm: round1(pm25.distanceKm) };
    }

    let daqiBand: AirQualityData["daqiBand"] | undefined;
    if (no2 || pm25) {
      const bands: number[] = [];
      if (no2) bands.push(bandFromNo2(no2.value));
      if (pm25) bands.push(bandFromPm25(pm25.value));
      if (bands.length) daqiBand = clampBand(Math.max(...bands));
    }

    return {
      no2: no2 ? Math.round(no2.value * 10) / 10 : undefined,
      pm25: pm25 ? Math.round(pm25.value * 10) / 10 : undefined,
      daqiBand,
      daqiCategory: daqiBand ? daqiCategory(daqiBand) : undefined,
      source: "Defra UK-AIR",
      nearestStation,
    };
  } catch (err) {
    console.error("air quality lookup failed", err);
    return undefined;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
