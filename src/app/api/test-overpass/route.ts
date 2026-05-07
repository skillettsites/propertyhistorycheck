import { NextResponse } from "next/server";

export const maxDuration = 30;

const QUERY = `[out:json][timeout:8];
(
  node[amenity=pharmacy](around:1500,51.4001,-1.3251);
  node[amenity=doctors](around:2000,51.4001,-1.3251);
);out body 5;`;

export async function GET() {
  const results: Record<string, unknown> = {};
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: AbortSignal.timeout(10000),
      });
      const elapsed = Date.now() - start;
      const text = await res.text();
      results[endpoint] = {
        ok: res.ok,
        status: res.status,
        elapsed_ms: elapsed,
        bodyLength: text.length,
        bodyHead: text.slice(0, 300),
      };
    } catch (err) {
      results[endpoint] = {
        error: err instanceof Error ? err.message : String(err),
        elapsed_ms: Date.now() - start,
      };
    }
  }
  return NextResponse.json(results);
}
