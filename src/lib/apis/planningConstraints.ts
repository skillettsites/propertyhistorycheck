/**
 * planning.data.gov.uk + PlanIt API.
 * Free, no key. Single call replaces empty Postgres tables for:
 * conservation-area, listed-building, green-belt, article-4, TPO,
 * AONB, scheduled-monument, world-heritage-site.
 *
 * Ported from PostcodeCheck (battle-tested in production).
 */

import { PlanningConstraint, PlanningAppDetail, PlanningData } from "../types";

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
    `&krad=0.5&pg_sz=30` +
    `&start_date=${startDate}` +
    `&sort=start_date.desc`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
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
      url: r.url ? String(r.url) : undefined,
    };
  });
}

export async function getPlanningData(lat: number, lng: number): Promise<PlanningData | undefined> {
  const [constraintsResult, applicationsResult] = await Promise.allSettled([
    fetchConstraints(lat, lng),
    fetchApplications(lat, lng),
  ]);
  const constraints = constraintsResult.status === "fulfilled" ? constraintsResult.value : [];
  const applications = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
  if (constraints.length === 0 && applications.length === 0) {
    if (constraintsResult.status === "rejected" && applicationsResult.status === "rejected") {
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
  };
}
