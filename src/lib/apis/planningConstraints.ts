/**
 * planning.data.gov.uk + PlanIt API.
 * Free, no key. Single call replaces empty Postgres tables for:
 * conservation-area, listed-building, green-belt, article-4, TPO,
 * AONB, scheduled-monument, world-heritage-site.
 *
 * Ported from PostcodeCheck (battle-tested in production).
 */

import { PlanningConstraint, PlanningAppDetail, PlanningData, PipelineApproval } from "../types";

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function oneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function nYearsAgo(n: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}

/** Pulls out an integer count from descriptions like "Erection of 240 flats" */
function extractUnits(description: string): number | undefined {
  const m = description.match(/\b(\d{1,4})\s*(?:dwellings?|flats?|units?|homes?|houses?|apartments?|residential\s+units?)\b/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Decides whether a planning app is a "pipeline" project worth flagging to a buyer. */
function isPipelineMajor(description: string): boolean {
  const d = description.toLowerCase();
  // Major residential / mixed-use / demolition / extension >= medium scale.
  // Excludes single-house small extensions, signage, listed-building consents on existing.
  if (/\b(extension|loft|porch|signage|advert|fence|change of use only|certificate of)\b/.test(d) && !/\bdwellings|flats|units|homes|residential/.test(d)) {
    return false;
  }
  return /\b(erection|construction|demolition|redevelopment|new build|residential|dwellings?|flats?|units?|homes?|apartments?|tower|block|mixed[-\s]?use|hotel|student\s+accommodation|office\s+(?:to|conversion))\b/.test(d);
}

function normaliseStatus(raw: string): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("permit") || s.includes("approv") || s.includes("granted")) return "Permitted";
  if (s.includes("refuse") || s.includes("reject") || s.includes("denied")) return "Rejected";
  if (s.includes("withdraw")) return "Withdrawn";
  if (s.includes("pending") || s.includes("undecided") || s.includes("registered") || s.includes("awaiting") || s === "") return "Pending";
  return raw || "Unknown";
}

async function fetchConstraints(lat: number, lng: number): Promise<PlanningConstraint[]> {
  const datasets = [
    "conservation-area",
    "listed-building",
    "green-belt",
    "article-4-direction-area",
    "tree-preservation-zone",
    "area-of-outstanding-natural-beauty",
    "scheduled-monument",
    "world-heritage-site",
    "flood-risk-zone",
  ];
  const datasetParams = datasets.map((d) => `dataset=${d}`).join("&");
  const url =
    `https://www.planning.data.gov.uk/entity.json` +
    `?latitude=${lat}&longitude=${lng}` +
    `&${datasetParams}` +
    `&field=name&field=dataset&field=reference` +
    `&limit=50`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 * 7 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const entities: Record<string, unknown>[] = data.entities || data.results || [];
  return entities.map((e) => ({
    type: String(e.dataset || ""),
    name: String(e.name || "Unknown"),
    reference: e.reference ? String(e.reference) : undefined,
    dataset: String(e.dataset || ""),
  }));
}

async function fetchApplications(lat: number, lng: number): Promise<PlanningAppDetail[]> {
  const startDate = oneYearAgo();
  const url =
    `https://www.planit.org.uk/api/applics/json` +
    `?lat=${lat}&lng=${lng}` +
    // pg_sz was 30, which capped the 12-month count at exactly 30 for any busy
    // area (every urban report showed "30 applications"). 200 gives an accurate
    // count; the UI only lists the first 8.
    `&krad=0.5&pg_sz=200` +
    `&start_date=${startDate}` +
    `&sort=start_date.desc`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 * 7 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const records: Record<string, unknown>[] = data.records || [];
  return records.map((r) => {
    const appLat = Number(r.location_y ?? r.lat ?? 0);
    const appLng = Number(r.location_x ?? r.lng ?? 0);
    const distance = appLat && appLng ? Math.round(haversineMetres(lat, lng, appLat, appLng)) : 0;
    return {
      reference: String(r.uid || r.reference || r._id || ""),
      address: String(r.address || ""),
      description: String(r.description || r.proposal || ""),
      status: normaliseStatus(String(r.status || r.decision || "")),
      dateReceived: String(r.start_date || r.dateReceived || ""),
      dateDecided: r.decision_date ? String(r.decision_date) : undefined,
      authority: String(r.authority_name || r.authority || ""),
      distance,
      lat: appLat || undefined,
      lng: appLng || undefined,
      url: r.url ? String(r.url) : undefined,
    };
  });
}

/**
 * Major approved-but-(probably)-not-yet-built schemes within ~1km, last 5 years.
 * Used for the "what's coming next door" forward look. Filters to >=10 units OR
 * any major description keyword (tower / block / mixed-use / hotel / student accom).
 */
async function fetchPipelineApprovals(lat: number, lng: number): Promise<PipelineApproval[]> {
  const startDate = nYearsAgo(5);
  const url =
    `https://www.planit.org.uk/api/applics/json` +
    `?lat=${lat}&lng=${lng}` +
    `&krad=1&pg_sz=100` +
    `&start_date=${startDate}` +
    `&app_state=Permitted` +
    `&sort=start_date.desc`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 * 7 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const records: Record<string, unknown>[] = data.records || [];
  const out: PipelineApproval[] = [];
  for (const r of records) {
    const description = String(r.description || r.proposal || "");
    const units = extractUnits(description);
    const isMajor = (units ?? 0) >= 10 || (isPipelineMajor(description) && (units ?? 0) >= 4);
    if (!isMajor) continue;
    const status = normaliseStatus(String(r.status || r.decision || ""));
    if (status !== "Permitted") continue;
    const appLat = Number(r.location_y ?? r.lat ?? 0);
    const appLng = Number(r.location_x ?? r.lng ?? 0);
    const distance = appLat && appLng ? Math.round(haversineMetres(lat, lng, appLat, appLng)) : 0;
    out.push({
      reference: String(r.uid || r.reference || r._id || ""),
      address: String(r.address || ""),
      description,
      units,
      decisionDate: r.decision_date ? String(r.decision_date) : undefined,
      authority: String(r.authority_name || r.authority || ""),
      distance,
      lat: appLat || undefined,
      lng: appLng || undefined,
      url: r.url ? String(r.url) : undefined,
    });
  }
  // Sort: most-recent decision first, then closest
  out.sort((a, b) => {
    const da = a.decisionDate ? Date.parse(a.decisionDate) : 0;
    const db = b.decisionDate ? Date.parse(b.decisionDate) : 0;
    if (db !== da) return db - da;
    return (a.distance ?? 0) - (b.distance ?? 0);
  });
  return out.slice(0, 12);
}

export async function getPlanningData(lat: number, lng: number): Promise<PlanningData | undefined> {
  const [constraintsResult, applicationsResult, pipelineResult] = await Promise.allSettled([
    fetchConstraints(lat, lng),
    fetchApplications(lat, lng),
    fetchPipelineApprovals(lat, lng),
  ]);
  const constraints = constraintsResult.status === "fulfilled" ? constraintsResult.value : [];
  const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
  const pipeline = pipelineResult.status === "fulfilled" ? pipelineResult.value : [];
  if (constraints.length === 0 && applications.length === 0 && pipeline.length === 0) {
    if (constraintsResult.status === "rejected" && applicationsResult.status === "rejected" && pipelineResult.status === "rejected") {
      return undefined;
    }
  }
  const constraintTypes = new Set(constraints.map((c) => c.type));
  return {
    constraints,
    inConservationArea: constraintTypes.has("conservation-area"),
    nearListedBuildings: constraints.filter((c) => c.type === "listed-building").length,
    inGreenBelt: constraintTypes.has("green-belt"),
    hasTPO: constraintTypes.has("tree-preservation-zone"),
    hasArticle4: constraintTypes.has("article-4-direction-area"),
    applications,
    totalApps12m: applications.length,
    pendingApps: applications.filter((a) => a.status === "Pending").length,
    approvedApps: applications.filter((a) => a.status === "Permitted").length,
    rejectedApps: applications.filter((a) => a.status === "Rejected").length,
    pipeline,
  };
}
