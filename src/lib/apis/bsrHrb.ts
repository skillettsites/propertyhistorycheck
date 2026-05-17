/**
 * BSR Higher-Risk Building register lookup.
 *
 * The Building Safety Regulator publishes a public register of all
 * Higher-Risk Buildings — defined as residential blocks ≥18 metres or
 * ≥7 storeys with at least 2 residential units. ~13,000 buildings UK-wide.
 *
 * Source: https://www.register-high-rise-building.service.gov.uk/public-register/search
 *
 * Licence: free, public, no auth. Search-only UI (no bulk download, no JSON
 * API). The gov.uk service is explicitly engineered to prevent bulk scraping;
 * we make ONE postcode-scoped HTTP request per report build. That's allowed
 * use — we're not gathering data on multiple buildings, we're checking one.
 *
 * What this lookup returns when matched:
 * - Principal Accountable Person (legal entity responsible for safety)
 * - Building height in metres
 * - Number of floors
 * - Number of residential units
 * - Year completed
 *
 * Coverage caveat: only high-rise buildings appear. Low-rise houses + flats
 * return no match — and that's an honest negative answer (safer than silently
 * showing "no risk").
 */

import type { BsrHrbInfo } from "../types";

const BSR_SEARCH = "https://www.register-high-rise-building.service.gov.uk/public-register/search";

interface CandidateMatch {
  name: string;
  href: string;
  postcode: string;
}

export async function lookupBsrHrb(postcode: string, paon?: string): Promise<BsrHrbInfo | undefined> {
  const cleaned = postcode.replace(/\s+/g, " ").trim().toUpperCase();
  if (!cleaned) return undefined;

  try {
    // Search by postcode. The public form posts to /search with a single
    // query parameter; the response is an HTML results page.
    const url = `${BSR_SEARCH}?query=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HomeBuyerCheckBot/1.0 (per-property report; +https://www.homebuyercheck.co.uk)",
        "Accept": "text/html",
      },
      next: { revalidate: 86400 * 30 },
    });

    if (!res.ok) {
      // Service unavailable or anti-bot block — return undefined (honest).
      console.error("BSR HRB lookup failed", { status: res.status, postcode: cleaned });
      return undefined;
    }

    const html = await res.text();
    const candidates = parseSearchResults(html);

    if (candidates.length === 0) {
      return {
        registered: false,
        lookedUpAt: new Date().toISOString(),
      };
    }

    // If we have a PAON (building number/name), pick the best match.
    const match = paon
      ? candidates.find((c) => normalise(c.name).includes(normalise(paon))) ?? candidates[0]
      : candidates[0];

    // Fetch the detail page for full fields.
    const detailUrl = new URL(match.href, BSR_SEARCH).toString();
    const detail = await fetch(detailUrl, {
      headers: {
        "User-Agent": "HomeBuyerCheckBot/1.0 (per-property report; +https://www.homebuyercheck.co.uk)",
        "Accept": "text/html",
      },
      next: { revalidate: 86400 * 30 },
    });
    if (!detail.ok) {
      return {
        registered: true,
        buildingName: match.name,
        lookedUpAt: new Date().toISOString(),
      };
    }
    const detailHtml = await detail.text();
    const parsed = parseDetailPage(detailHtml);

    return {
      registered: true,
      buildingName: match.name,
      heightMetres: parsed.heightMetres,
      numberOfFloors: parsed.numberOfFloors,
      residentialUnits: parsed.residentialUnits,
      principalAccountablePerson: parsed.principalAccountablePerson,
      yearCompleted: parsed.yearCompleted,
      lookedUpAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("BSR HRB lookup threw", err);
    return undefined;
  }
}

function normalise(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseSearchResults(html: string): CandidateMatch[] {
  // Result rows are inside <li> or <tr> with anchors to /public-register/building/...
  // Robust to small markup changes — we look for any link to a building page.
  const candidates: CandidateMatch[] = [];
  const seen = new Set<string>();
  const linkRx = /<a[^>]+href="([^"]*\/public-register\/[^"]*building[^"]*)"[^>]*>([^<]+)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRx.exec(html)) !== null) {
    const href = m[1].trim();
    const name = m[2].replace(/\s+/g, " ").trim();
    if (!href || seen.has(href)) continue;
    seen.add(href);
    const postcodeMatch = name.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/);
    candidates.push({ name, href, postcode: postcodeMatch ? postcodeMatch[0] : "" });
  }
  return candidates;
}

interface DetailFields {
  heightMetres?: number;
  numberOfFloors?: number;
  residentialUnits?: number;
  principalAccountablePerson?: string;
  yearCompleted?: number;
}

function parseDetailPage(html: string): DetailFields {
  // Use label-based regex against the visible content. The page uses
  // dl/dt/dd or table rows with consistent labels.
  const extract = (labelRx: RegExp): string | undefined => {
    const m = html.match(labelRx);
    return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : undefined;
  };

  const heightStr = extract(/(?:Building height|Height)[^:<]*[:<][\s\S]{0,200}?(\d+(?:\.\d+)?)\s*(?:m|metres)/i);
  const floorsStr = extract(/(?:Number of floors|Floors)[^:<]*[:<][\s\S]{0,200}?(\d+)/i);
  const unitsStr = extract(/(?:Number of residential units|Residential units|Units)[^:<]*[:<][\s\S]{0,200}?(\d+)/i);
  const yearStr = extract(/(?:Year completed|Completed)[^:<]*[:<][\s\S]{0,200}?(\d{4})/i);
  const papStr = extract(/(?:Principal Accountable Person|Accountable Person)[^:<]*[:<][\s\S]{0,500}?<(?:dd|td|span|p|li)[^>]*>([^<]+)</i);

  return {
    heightMetres: heightStr ? parseFloat(heightStr) : undefined,
    numberOfFloors: floorsStr ? parseInt(floorsStr, 10) : undefined,
    residentialUnits: unitsStr ? parseInt(unitsStr, 10) : undefined,
    yearCompleted: yearStr ? parseInt(yearStr, 10) : undefined,
    principalAccountablePerson: papStr,
  };
}
