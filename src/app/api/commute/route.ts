import { NextRequest, NextResponse } from "next/server";
import type { CommuteResult } from "@/lib/types";

export const runtime = "nodejs";

const POSTCODES_IO = "https://api.postcodes.io";
const OSRM_BASE = "https://router.project-osrm.org";
const TFL_API = "https://api.tfl.gov.uk";

interface PostcodeLookup {
  latitude: number;
  longitude: number;
  region?: string;
  admin_district?: string;
}

async function lookupPostcode(postcode: string): Promise<PostcodeLookup | null> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  try {
    const res = await fetch(`${POSTCODES_IO}/postcodes/${encodeURIComponent(cleaned)}`, {
      next: { revalidate: 86400 * 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.result) return null;
    const r = data.result;
    return {
      latitude: r.latitude,
      longitude: r.longitude,
      region: r.region,
      admin_district: r.admin_district,
    };
  } catch {
    return null;
  }
}

async function osrmRoute(profile: "driving" | "foot" | "cycling", from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  // OSRM expects lon,lat
  const url = `${OSRM_BASE}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false&alternatives=false`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    return {
      durationSeconds: route.duration as number,
      distanceMeters: route.distance as number,
    };
  } catch {
    return null;
  }
}

function isLondon(p?: PostcodeLookup | null): boolean {
  if (!p) return false;
  return p.region === "London";
}

async function tflJourney(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<{ durationMinutes: number; note?: string } | null> {
  // TfL accepts lat,lng pairs as "from" and "to"
  const fromStr = `${from.lat},${from.lng}`;
  const toStr = `${to.lat},${to.lng}`;
  try {
    const url = `${TFL_API}/Journey/JourneyResults/${encodeURIComponent(fromStr)}/to/${encodeURIComponent(toStr)}`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const journeys = data?.journeys ?? [];
    if (!journeys.length) return null;
    const fastest = journeys.reduce(
      (m: { duration: number }, j: { duration: number }) => (j.duration < m.duration ? j : m),
      journeys[0]
    );
    return { durationMinutes: fastest.duration };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fromPc: string | undefined = body.fromPostcode;
    const toInput: string | undefined = body.to;
    if (!fromPc || !toInput) {
      return NextResponse.json({ error: "fromPostcode and to required" }, { status: 400 });
    }

    const fromLookup = await lookupPostcode(fromPc);
    if (!fromLookup) return NextResponse.json({ error: "from_postcode_not_found" }, { status: 400 });

    // "to" can be a postcode or a free-form address (we resolve as postcode first, then fall back).
    let toLookup: PostcodeLookup | null = await lookupPostcode(toInput);
    if (!toLookup) {
      // Try to extract a postcode from the typed string
      const m = toInput.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
      if (m) toLookup = await lookupPostcode(m[0]);
    }
    if (!toLookup) {
      return NextResponse.json({ error: "destination_not_found" }, { status: 400 });
    }

    const from = { lat: fromLookup.latitude, lng: fromLookup.longitude };
    const to = { lat: toLookup.latitude, lng: toLookup.longitude };

    const [driving, walking, cycling, tfl] = await Promise.allSettled([
      osrmRoute("driving", from, to),
      osrmRoute("foot", from, to),
      osrmRoute("cycling", from, to),
      isLondon(fromLookup) || isLondon(toLookup) ? tflJourney(from, to) : Promise.resolve(null),
    ]);

    const drv = driving.status === "fulfilled" ? driving.value : null;
    const wlk = walking.status === "fulfilled" ? walking.value : null;
    const cyc = cycling.status === "fulfilled" ? cycling.value : null;
    const tflResult = tfl.status === "fulfilled" ? tfl.value : null;

    const milesPerMeter = 0.000621371;
    const fuelPricePerLitre = 1.42; // 2026 UK average pump price
    const milesPerLitre = 11.5;     // ~52mpg → ~11.5 mi/L
    const drivingMiles = drv ? drv.distanceMeters * milesPerMeter : undefined;
    const drivingFuelCost = drivingMiles
      ? Math.round((drivingMiles / milesPerLitre) * fuelPricePerLitre * 100) / 100
      : undefined;

    let publicTransportMinutes: number | undefined;
    let publicTransportNote: string | undefined;
    let publicTransportProvider: "TfL" | "estimate" | undefined;
    if (tflResult) {
      publicTransportMinutes = tflResult.durationMinutes;
      publicTransportProvider = "TfL";
      publicTransportNote = "via TfL Journey Planner";
    } else if (drivingMiles) {
      // Fallback estimate: assume 50 km/h average rail/coach door-to-door including waiting
      const avgKph = 50;
      const distKm = (drv?.distanceMeters ?? 0) / 1000;
      publicTransportMinutes = Math.round((distKm / avgKph) * 60);
      publicTransportProvider = "estimate";
      publicTransportNote = "estimate based on 50 km/h average rail door-to-door";
    }

    const result: CommuteResult = {
      destinationPostcode: toInput.toUpperCase(),
      destinationLat: to.lat,
      destinationLng: to.lng,
      drivingMinutes: drv ? Math.round(drv.durationSeconds / 60) : undefined,
      drivingMiles: drivingMiles ? Math.round(drivingMiles * 10) / 10 : undefined,
      drivingFuelCost,
      walkingMinutes: wlk && wlk.distanceMeters < 16000 ? Math.round(wlk.durationSeconds / 60) : undefined,
      walkingMiles: wlk && wlk.distanceMeters < 16000 ? Math.round(wlk.distanceMeters * milesPerMeter * 10) / 10 : undefined,
      cyclingMinutes: cyc && cyc.distanceMeters < 50000 ? Math.round(cyc.durationSeconds / 60) : undefined,
      publicTransportMinutes,
      publicTransportNote,
      publicTransportProvider,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("commute failed", err);
    return NextResponse.json({ error: "commute_failed" }, { status: 500 });
  }
}
