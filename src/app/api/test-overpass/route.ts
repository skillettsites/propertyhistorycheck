import { NextResponse } from "next/server";
import { getGreenspace, getHealthcareNearby, getTransportNearby } from "@/lib/apis/overpass";

export const maxDuration = 30;

export async function GET() {
  const lat = 51.5014, lng = -0.1419; // Buckingham Palace
  const start = Date.now();
  const [greenspace, healthcare, transport] = await Promise.allSettled([
    getGreenspace(lat, lng),
    getHealthcareNearby(lat, lng),
    getTransportNearby(lat, lng),
  ]);
  return NextResponse.json({
    elapsed_ms: Date.now() - start,
    greenspace: greenspace.status === "fulfilled" ? greenspace.value : { error: String(greenspace.reason) },
    healthcare: healthcare.status === "fulfilled"
      ? { gpsCount: healthcare.value?.gps.length, nearestGp: healthcare.value?.nearestGp?.name }
      : { error: String(healthcare.reason) },
    transport: transport.status === "fulfilled"
      ? { stationsCount: transport.value?.stations.length, nearestStation: transport.value?.nearestStation?.name, nearestTube: transport.value?.nearestTube?.name }
      : { error: String(transport.reason) },
  });
}
