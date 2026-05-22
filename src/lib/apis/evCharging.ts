/**
 * EV charging stations from Open Charge Map.
 * Free API, no key required for low-volume use.
 * Endpoint: https://api.openchargemap.io/v3/poi/
 */

import { EvChargingData } from "../types";

interface OpenChargeMapPoi {
  AddressInfo?: {
    Title?: string;
    Latitude?: number;
    Longitude?: number;
    Distance?: number;
  };
  Connections?: Array<{ PowerKW?: number }>;
  OperatorInfo?: { Title?: string };
}

function haversineM(la: number, lo: number, lb: number, lob: number) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLa = toRad(lb - la);
  const dLo = toRad(lob - lo);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la)) * Math.cos(toRad(lb)) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

async function fetchWithRetry(url: string, init: RequestInit, timeoutMs: number, attempts = 2): Promise<Response | undefined> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return res;
      if (res.status >= 500) continue;
      return undefined;
    } catch {
      // AbortError or network, retry once
    }
  }
  return undefined;
}

export async function getEvCharging(lat: number, lng: number): Promise<EvChargingData | undefined> {
  try {
    const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=2&distanceunit=Miles&maxresults=30&compact=true&verbose=false`;
    const res = await fetchWithRetry(url, {
      headers: { Accept: "application/json", "User-Agent": "HomeBuyerCheck/1.0 (https://www.homebuyercheck.co.uk)" },
      next: { revalidate: 86400 * 7 },
    }, 9000, 2);
    if (!res) return undefined;
    const data = (await res.json()) as OpenChargeMapPoi[];
    if (!Array.isArray(data) || data.length === 0) {
      return { count: 0, fastChargers: 0, rapidChargers: 0 };
    }

    let fast = 0, rapid = 0;
    let nearestName: string | undefined;
    let nearestDist = Infinity;
    let nearestPower: number | undefined;
    let nearestOp: string | undefined;

    for (const p of data) {
      const a = p.AddressInfo;
      if (!a?.Latitude || !a?.Longitude) continue;
      const d = haversineM(lat, lng, a.Latitude, a.Longitude);
      const maxPower = (p.Connections ?? []).reduce((m, c) => Math.max(m, c.PowerKW ?? 0), 0);
      if (maxPower >= 50) rapid++;
      else if (maxPower >= 7) fast++;
      if (d < nearestDist) {
        nearestDist = d;
        nearestName = a.Title;
        nearestPower = maxPower || undefined;
        nearestOp = p.OperatorInfo?.Title;
      }
    }

    return {
      count: data.length,
      fastChargers: fast,
      rapidChargers: rapid,
      nearest: nearestName
        ? { name: nearestName, distanceM: nearestDist, powerKw: nearestPower, operator: nearestOp }
        : undefined,
    };
  } catch {
    return undefined;
  }
}
