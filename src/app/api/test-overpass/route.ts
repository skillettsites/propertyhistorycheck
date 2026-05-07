import { NextResponse } from "next/server";

export const maxDuration = 30;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const QUERIES: Record<string, string> = {
  greenspace_nodes: `[out:json][timeout:8];(node[leisure=park](around:1500,51.5014,-0.1419););out body 5;`,
  greenspace_ways: `[out:json][timeout:8];(way[leisure=park](around:1500,51.5014,-0.1419);relation[leisure=park](around:1500,51.5014,-0.1419););out tags center 5;`,
  healthcare: `[out:json][timeout:8];(node[amenity=pharmacy](around:1500,51.5014,-0.1419););out body 5;`,
};

export async function GET() {
  const results: Record<string, unknown> = {};
  for (const [name, query] of Object.entries(QUERIES)) {
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
          signal: AbortSignal.timeout(10000),
        });
        const body = await res.text();
        results[`${name}@${new URL(endpoint).host}`] = {
          status: res.status,
          ok: res.ok,
          elapsed_ms: Date.now() - start,
          bodyLength: body.length,
          bodyHead: body.slice(0, 400),
        };
        if (res.ok) break;
      } catch (err) {
        results[`${name}@${new URL(endpoint).host}`] = {
          error: err instanceof Error ? err.message : String(err),
          elapsed_ms: Date.now() - start,
        };
      }
    }
  }
  return NextResponse.json(results);
}
