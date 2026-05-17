/**
 * Police.uk crimes-street API.
 *
 * Free, OGL, no key. Rate limit: 15 req/sec average, burst 30.
 * Data freshness: monthly, ~6-week lag.
 *
 * Returns 12-month aggregate stats AND a sample of the most recent
 * 1-2 months' incidents with lat/lng for map display.
 */

import { CrimeData, CrimeIncident } from "../types";

const BASE = "https://data.police.uk/api";

interface ApiCrime {
  category: string;
  location?: { latitude?: string; longitude?: string; street?: { name?: string } };
  month?: string;
}

export async function getCrimeByLatLng(lat: number, lng: number): Promise<CrimeData | undefined> {
  try {
    // Fetch 24 months: months 2-13 = current period, 14-25 = prior period (for YoY trend).
    const months: string[] = [];
    const now = new Date();
    for (let i = 2; i <= 25; i++) {
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

    const current: ApiCrime[] = [];
    const prior: ApiCrime[] = [];
    const recentByMonth: Record<string, ApiCrime[]> = {};
    const monthlyCounts: { month: string; count: number }[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const list = r.status === "fulfilled" && Array.isArray(r.value) ? (r.value as ApiCrime[]) : [];
      monthlyCounts.push({ month: months[i], count: list.length });
      if (i < 12) current.push(...list);
      else prior.push(...list);
      if (i < 2) recentByMonth[months[i]] = list;
    }

    // Reverse so oldest → newest (more natural for a left-to-right chart)
    monthlyCounts.reverse();

    // Build aggregated category stats from current 12 months
    const categories: Record<string, number> = {};
    for (const c of current) {
      categories[c.category] = (categories[c.category] ?? 0) + 1;
    }
    const byCategory = Object.entries(categories)
      .map(([category, count]) => ({ category: humaniseCategory(category), count }))
      .sort((a, b) => b.count - a.count);

    const recentIncidents: CrimeIncident[] = [];
    for (const [month, list] of Object.entries(recentByMonth)) {
      for (const c of list) {
        const la = Number(c.location?.latitude);
        const lo = Number(c.location?.longitude);
        if (Number.isFinite(la) && Number.isFinite(lo)) {
          recentIncidents.push({
            category: humaniseCategory(c.category),
            categorySlug: c.category,
            lat: la,
            lng: lo,
            street: c.location?.street?.name,
            month,
          });
        }
      }
    }
    const dedup = dedupeIncidents(recentIncidents);

    const priorTotal = prior.length;
    const trendPct = priorTotal > 0 ? Math.round(((current.length - priorTotal) / priorTotal) * 1000) / 10 : undefined;

    return {
      monthsCovered: 12,
      totalIncidents: current.length,
      priorTotalIncidents: priorTotal,
      trendPct,
      monthlyCounts,
      byCategory,
      recentIncidents: dedup.slice(0, 250),
    };
  } catch (err) {
    console.error("police crime lookup failed", err);
    return undefined;
  }
}

function humaniseCategory(slug: string): string {
  return slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function dedupeIncidents(items: CrimeIncident[]): CrimeIncident[] {
  // Police.uk pins are snapped to "on or near" points; many duplicates per street.
  // Keep one per (rounded lat, rounded lng, category) to thin the map.
  const seen = new Set<string>();
  const out: CrimeIncident[] = [];
  for (const i of items) {
    const k = `${i.lat.toFixed(4)}_${i.lng.toFixed(4)}_${i.categorySlug}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(i);
  }
  return out;
}
