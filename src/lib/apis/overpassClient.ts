/**
 * Shared Overpass (OpenStreetMap) client.
 *
 * Overpass is free and fair-use, and its mirrors are individually unreliable in
 * a way that used to cost us the whole page. Measured 2026-08-19 against the
 * same query, twice, a minute apart:
 *
 *   overpass-api.de     1427ms 200 | 1468ms 200
 *   overpass.kumi.systems 130ms 502 | hung past 25s
 *   maps.mail.ru         752ms 200 | hung past 25s
 *
 * The old callers walked the mirror list SEQUENTIALLY with a 10s timeout each,
 * so a single hung mirror cost 10s and two cost 20s before the third was even
 * tried. That is what made /check take ~21 seconds on a cold address: the walk
 * score alone measured 18.8s and returned nothing.
 *
 * So: hedged requests. Fire the primary; if it has not answered within
 * `hedgeAfterMs`, start the next mirror alongside it rather than instead of it.
 * First 200 wins. A hung mirror now costs nothing but a duplicate request, the
 * common case still makes exactly one call because the primary answers inside
 * 1.5s, and the whole thing is capped by one shared budget.
 */

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

export interface OverpassElement {
  type: string;
  id?: number;
  lat?: number;
  lon?: number;
  /** Present when the query asks for `out center` on ways/relations. */
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassOptions {
  /** Hard ceiling for the whole call, mirrors included. */
  budgetMs?: number;
  /** Wait this long for the primary before also trying the next mirror. */
  hedgeAfterMs?: number;
  /** Cache lifetime in seconds. */
  revalidate?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Run an Overpass QL query. Returns [] when every mirror fails, which callers
 * already treat as "no data" — a missing section beats a page that never paints.
 */
export async function runOverpass(query: string, opts: OverpassOptions = {}): Promise<OverpassElement[]> {
  const budgetMs = opts.budgetMs ?? 12000;
  // The primary answers the light queries in ~1.4s but the walk-score query is
  // 17 clauses and legitimately takes ~7s, so hedge late: a healthy request
  // then still makes a single call rather than tripling load on a free service.
  const hedgeAfterMs = opts.hedgeAfterMs ?? 5000;
  const revalidate = opts.revalidate ?? 86400 * 30;
  const deadline = Date.now() + budgetMs;
  let settled = false;

  const attempt = async (endpoint: string, startAfterMs: number): Promise<OverpassElement[]> => {
    if (startAfterMs > 0) await sleep(startAfterMs);
    // A later mirror is pure waste once an earlier one has answered.
    if (settled) throw new Error("superseded");
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("budget_spent");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "HomeBuyerCheck/1.0 (https://www.homebuyercheck.co.uk; hello@homebuyercheck.co.uk)",
      },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate },
      signal: AbortSignal.timeout(remaining),
    });
    if (!res.ok) throw new Error(`status_${res.status}`);
    const data = await res.json();
    // A 200 is authoritative even when it lists nothing: plenty of rural
    // postcodes genuinely have no pharmacy within 1.5km, and treating empty as
    // failure would spend the whole budget proving it every time.
    settled = true;
    return (data?.elements ?? []) as OverpassElement[];
  };

  try {
    return await Promise.any(ENDPOINTS.map((endpoint, i) => attempt(endpoint, i * hedgeAfterMs)));
  } catch {
    return [];
  }
}
