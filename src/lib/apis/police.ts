/**
 * Police.uk crimes-street API.
 *
 * Free, OGL, no key. Rate limit: 15 req/sec average, burst 30.
 * Data freshness: monthly, ~6-week lag.
 */

import { CrimeData } from "../types";

const BASE = "https://data.police.uk/api";

export async function getCrimeByLatLng(
  lat: number,
  lng: number
): Promise<CrimeData | undefined> {
  try {
    // 12-month sliding window. Police.uk publishes 1-3 month lag — start at -2.
    const months: string[] = [];
    const now = new Date();
    for (let i = 2; i <= 13; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const results = await Promise.allSettled(
      months.map((m) =>
        fetch(`${BASE}/crimes-street/all-crime?lat=${lat}&lng=${lng}&date=${m}`, {
          next: { revalidate: 86400 * 7 },
        }).then((r) => (r.ok ? r.json() : []))
      )
    );

    const all: Array<{ category: string }> = [];
    for (const r of results) {
      if (r.status === "fulfilled" && Array.isArray(r.value)) all.push(...r.value);
    }

    const categories: Record<string, number> = {};
    for (const c of all) {
      categories[c.category] = (categories[c.category] ?? 0) + 1;
    }

    const byCategory = Object.entries(categories)
      .map(([category, count]) => ({ category: humaniseCategory(category), count }))
      .sort((a, b) => b.count - a.count);

    return {
      monthsCovered: months.length,
      totalIncidents: all.length,
      byCategory,
    };
  } catch (err) {
    console.error("police crime lookup failed", err);
    return undefined;
  }
}

function humaniseCategory(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
