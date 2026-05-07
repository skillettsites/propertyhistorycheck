import { NextResponse } from "next/server";

export const maxDuration = 30;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function GET() {
  const lat = 51.5014, lng = -0.1419;
  const query = `[out:json][timeout:18];
(
  way[leisure=park](around:1200,${lat},${lng});
  way[leisure=garden][garden:type!=residential](around:1000,${lat},${lng});
);out tags center 20;`;

  const results: Record<string, unknown> = {};
  for (const endpoint of ENDPOINTS) {
    const start = Date.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "PropertyHistoryCheck/1.0 (https://www.propertyhistorycheck.co.uk; hello@propertyhistorycheck.co.uk)",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });
      const elapsed = Date.now() - start;
      const body = await res.text();
      let elementsCount = 0;
      try {
        const parsed = JSON.parse(body);
        elementsCount = parsed?.elements?.length ?? 0;
      } catch {}
      results[new URL(endpoint).host] = {
        status: res.status,
        elapsed_ms: elapsed,
        bodyLength: body.length,
        elementsCount,
        bodyHead: body.slice(0, 600),
      };
    } catch (err) {
      results[new URL(endpoint).host] = {
        error: err instanceof Error ? err.message : String(err),
        elapsed_ms: Date.now() - start,
      };
    }
  }
  return NextResponse.json({ query, results });
}
