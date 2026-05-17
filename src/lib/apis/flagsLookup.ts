/**
 * Premium flags lookup — live API queries against free UK gov data.
 *
 * Replaces the prior implementation that read from empty Supabase tables.
 *
 * Sources (all free, no auth, Open Government Licence):
 * - planning.data.gov.uk — listed building, conservation area, TPO,
 *   Article 4 direction, AONB, green belt, brownfield, scheduled monument,
 *   world heritage site, flood risk (single call, multiple ?dataset= params)
 * - BGS GeoSure (ArcGIS REST, hex_grids MapServer) — ground stability
 *   bands 1-5 for shrink-swell, landslide, soluble rocks, etc.
 * - BGS Radon (ArcGIS REST) — radon affected area band 1-6
 * - Coal Authority WMS GetFeatureInfo — coal mining reporting area yes/no
 *
 * Coverage: ENGLAND ONLY for planning.data.gov.uk overlays. BGS + Coal
 * services cover England, Wales, Scotland.
 *
 * Latency: all calls run in parallel, ~500-800ms total.
 *
 * Honest unknowns: if a service is unreachable we mark the field
 * `undefined` and the report renderer shows "Service unavailable" — not
 * "No risk", which would be a misleading default.
 */

const PLANNING_DATA = "https://www.planning.data.gov.uk/entity.json";
const BGS_HEX = "https://map.bgs.ac.uk/arcgis/rest/services/GeoIndex_Onshore/hex_grids/MapServer";
const BGS_RADON = "https://map.bgs.ac.uk/arcgis/rest/services/GeoIndex_Onshore/radon/MapServer/0/query";
const COAL_WMS = "https://map.bgs.ac.uk/arcgis/services/CoalAuthority/coalauthority_coal_mining_reporting_areas/MapServer/WMSServer";

export interface PremiumFlags {
  listedBuilding?: { listed: boolean; grade?: string; name?: string; entryUrl?: string };
  conservationArea?: { inArea: boolean; name?: string; reference?: string };
  treePreservationOrder?: { affected: boolean; count?: number; names?: string[] };
  article4?: { affected: boolean; name?: string };
  aonb?: { inArea: boolean; name?: string };
  greenBelt?: boolean;
  scheduledMonument?: { affected: boolean; name?: string };
  worldHeritageSite?: { inArea: boolean; name?: string };
  brownfieldLand?: boolean;
  coalReportingArea?: boolean;
  miningArea?: boolean;
  radonRiskBand?: 1 | 2 | 3 | 4 | 5 | 6;
  radonNote?: string;
  shrinkSwellBand?: 1 | 2 | 3 | 4 | 5;
  shrinkSwellLabel?: string;
  landslideBand?: 1 | 2 | 3 | 4 | 5;
  landslideLabel?: string;
  solubleRocksBand?: 1 | 2 | 3 | 4 | 5;
  collapsibleGroundBand?: 1 | 2 | 3 | 4 | 5;
  compressibleGroundBand?: 1 | 2 | 3 | 4 | 5;
  runningSandBand?: 1 | 2 | 3 | 4 | 5;
}

export async function getPremiumFlags(lat: number, lng: number, postcode: string): Promise<PremiumFlags> {
  if (!lat || !lng) return {};
  const [planning, ground, radon, coal] = await Promise.allSettled([
    fetchPlanningOverlays(lat, lng),
    fetchGroundStability(lat, lng),
    fetchRadon(lat, lng),
    fetchCoalReporting(lat, lng),
  ]);

  return {
    ...(planning.status === "fulfilled" ? planning.value : {}),
    ...(ground.status === "fulfilled" ? ground.value : {}),
    ...(radon.status === "fulfilled" ? radon.value : {}),
    ...(coal.status === "fulfilled" ? coal.value : {}),
  };
}

interface PlanningEntity {
  entity: number;
  name?: string;
  dataset: string;
  reference?: string;
  "listed-building-grade"?: string;
}

async function fetchPlanningOverlays(lat: number, lng: number): Promise<Partial<PremiumFlags>> {
  const datasets = [
    "conservation-area",
    "tree-preservation-zone",
    "article-4-direction-area",
    "listed-building",
    "listed-building-outline",
    "area-of-outstanding-natural-beauty",
    "green-belt",
    "brownfield-land",
    "scheduled-monument",
    "world-heritage-site",
  ];
  const params = new URLSearchParams();
  params.set("longitude", String(lng));
  params.set("latitude", String(lat));
  params.set("limit", "100");
  for (const d of datasets) params.append("dataset", d);

  const url = `${PLANNING_DATA}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 86400 * 7 } });
  if (!res.ok) {
    console.error("planning.data.gov.uk fetch failed", res.status);
    return {};
  }
  const data = await res.json();
  const entities = (data.entities ?? []) as PlanningEntity[];

  const byDataset = (name: string) => entities.filter((e) => e.dataset === name);

  const listed = byDataset("listed-building").concat(byDataset("listed-building-outline"));
  const conservation = byDataset("conservation-area");
  const tpos = byDataset("tree-preservation-zone");
  const article4 = byDataset("article-4-direction-area");
  const aonb = byDataset("area-of-outstanding-natural-beauty");
  const green = byDataset("green-belt");
  const scheduled = byDataset("scheduled-monument");
  const whs = byDataset("world-heritage-site");
  const brownfield = byDataset("brownfield-land");

  return {
    listedBuilding: {
      listed: listed.length > 0,
      grade: listed[0]?.["listed-building-grade"],
      name: listed[0]?.name,
      entryUrl: listed[0]?.reference
        ? `https://historicengland.org.uk/listing/the-list/list-entry/${listed[0].reference}`
        : undefined,
    },
    conservationArea: {
      inArea: conservation.length > 0,
      name: conservation[0]?.name,
      reference: conservation[0]?.reference,
    },
    treePreservationOrder: {
      affected: tpos.length > 0,
      count: tpos.length,
      names: tpos.map((t) => t.name).filter(Boolean).slice(0, 3) as string[],
    },
    article4: {
      affected: article4.length > 0,
      name: article4[0]?.name,
    },
    aonb: {
      inArea: aonb.length > 0,
      name: aonb[0]?.name,
    },
    greenBelt: green.length > 0,
    scheduledMonument: {
      affected: scheduled.length > 0,
      name: scheduled[0]?.name,
    },
    worldHeritageSite: {
      inArea: whs.length > 0,
      name: whs[0]?.name,
    },
    brownfieldLand: brownfield.length > 0,
  };
}

interface BgsHexFeature {
  attributes?: Record<string, string | number | null>;
}

/** Query a single BGS GeoSure layer for the 1-5 hazard band at a point. */
async function queryBgsLayer(layerId: number, lat: number, lng: number): Promise<BgsHexFeature["attributes"] | null> {
  const geometry = JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } });
  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
    f: "json",
  });
  const res = await fetch(`${BGS_HEX}/${layerId}/query?${params.toString()}`, { next: { revalidate: 86400 * 30 } });
  if (!res.ok) return null;
  const data = await res.json();
  const features = (data.features ?? []) as BgsHexFeature[];
  return features[0]?.attributes ?? null;
}

function parseBand(value: string | number | null | undefined): 1 | 2 | 3 | 4 | 5 | undefined {
  if (value == null) return undefined;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1 || n > 5) return undefined;
  return n as 1 | 2 | 3 | 4 | 5;
}

async function fetchGroundStability(lat: number, lng: number): Promise<Partial<PremiumFlags>> {
  // Layer IDs (from BGS hex_grids MapServer):
  //   1 = Mining-not-coal, 2 = Collapsible, 3 = Compressible,
  //   4 = Landslides, 5 = RunningSand, 6 = ShrinkSwell, 7 = SolubleRocks
  const [mining, collapsible, compressible, landslide, runningSand, shrinkSwell, soluble] = await Promise.allSettled([
    queryBgsLayer(1, lat, lng),
    queryBgsLayer(2, lat, lng),
    queryBgsLayer(3, lat, lng),
    queryBgsLayer(4, lat, lng),
    queryBgsLayer(5, lat, lng),
    queryBgsLayer(6, lat, lng),
    queryBgsLayer(7, lat, lng),
  ]);

  const out: Partial<PremiumFlags> = {};

  if (shrinkSwell.status === "fulfilled" && shrinkSwell.value) {
    out.shrinkSwellBand = parseBand(shrinkSwell.value.CLASS);
    out.shrinkSwellLabel = typeof shrinkSwell.value.Legend === "string" ? shrinkSwell.value.Legend : undefined;
  }
  if (landslide.status === "fulfilled" && landslide.value) {
    out.landslideBand = parseBand(landslide.value.CLASS);
    out.landslideLabel = typeof landslide.value.Legend === "string" ? landslide.value.Legend : undefined;
  }
  if (soluble.status === "fulfilled" && soluble.value) {
    out.solubleRocksBand = parseBand(soluble.value.CLASS);
  }
  if (collapsible.status === "fulfilled" && collapsible.value) {
    out.collapsibleGroundBand = parseBand(collapsible.value.CLASS);
  }
  if (compressible.status === "fulfilled" && compressible.value) {
    out.compressibleGroundBand = parseBand(compressible.value.CLASS);
  }
  if (runningSand.status === "fulfilled" && runningSand.value) {
    out.runningSandBand = parseBand(runningSand.value.CLASS);
  }
  if (mining.status === "fulfilled" && mining.value) {
    const cls = mining.value.Class;
    const legend = mining.value.Legend;
    // Mining-not-coal uses "Class" string field, "NA" means no record.
    const hasMining = typeof cls === "string" && cls !== "NA" && cls !== "" && cls !== "0";
    out.miningArea = hasMining;
    if (hasMining && typeof legend === "string") {
      out.radonNote = undefined; // not radon, just keep type-safe
    }
  }

  return out;
}

async function fetchRadon(lat: number, lng: number): Promise<Partial<PremiumFlags>> {
  const geometry = JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } });
  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
    f: "json",
  });
  const res = await fetch(`${BGS_RADON}?${params.toString()}`, { next: { revalidate: 86400 * 30 } });
  if (!res.ok) return {};
  const data = await res.json();
  const feature = (data.features ?? [])[0];
  if (!feature?.attributes) return {};
  const band = parseInt(String(feature.attributes.CLASS_MAX ?? ""), 10);
  if (!Number.isFinite(band) || band < 1 || band > 6) return {};
  return {
    radonRiskBand: band as 1 | 2 | 3 | 4 | 5 | 6,
    radonNote: typeof feature.attributes.Description === "string" ? feature.attributes.Description : undefined,
  };
}

async function fetchCoalReporting(lat: number, lng: number): Promise<Partial<PremiumFlags>> {
  // Small bbox around the point. Coal Authority WMS rejects JSON; ask for XML and parse.
  const delta = 0.0005;
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.3.0",
    request: "GetFeatureInfo",
    layers: "Coal.Mining.Reporting.Area",
    query_layers: "Coal.Mining.Reporting.Area",
    crs: "EPSG:4326",
    bbox,
    width: "100",
    height: "100",
    i: "50",
    j: "50",
    info_format: "text/xml",
  });
  const res = await fetch(`${COAL_WMS}?${params.toString()}`, { next: { revalidate: 86400 * 30 } });
  if (!res.ok) return {};
  const xml = await res.text();
  // A populated FeatureInfoResponse contains a <Fields> or <Field> with NAME.
  // Empty response = not in coal area.
  const inCoalArea = /\bNAME\s*=/i.test(xml) || /<FeatureInfo[^>]*>\s*<Field/i.test(xml);
  return { coalReportingArea: inCoalArea };
}
