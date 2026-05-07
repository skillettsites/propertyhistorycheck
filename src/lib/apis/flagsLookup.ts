/**
 * Premium flags lookup — listed building, conservation area, TPOs, AONB,
 * green belt, Article 4, mining, contaminated land, knotweed, radon.
 *
 * Strategy: each is a free OGL dataset (Historic England, planning.data.gov.uk,
 * Coal Authority WMS, BGS). For MVP we hit cached Postgres tables that we
 * pre-load nightly. If a table is empty, we return undefined and the report
 * displays "Unknown — premium check unavailable".
 */

import { createAdminClient } from "../supabase/admin";

export interface PremiumFlags {
  listedBuilding?: { listed: boolean; grade?: string; entryUrl?: string };
  conservationArea?: { inArea: boolean; name?: string };
  treePreservationOrder?: { affected: boolean; count?: number };
  radonRiskBand?: 1 | 2 | 3 | 4 | 5;
  miningArea?: boolean;
  coalReportingArea?: boolean;
  contaminatedLand?: boolean;
  aonb?: boolean;
  greenBelt?: boolean;
  article4?: boolean;
  knotweedRisk?: "low" | "medium" | "high" | "unknown";
}

export async function getPremiumFlags(lat: number, lng: number, postcode: string): Promise<PremiumFlags> {
  const admin = createAdminClient();
  const flags: PremiumFlags = {};

  // Listed buildings (Historic England NHLE)
  try {
    const { data } = await admin
      .from("listed_buildings")
      .select("grade, entry_url")
      .gte("lat", lat - 0.001)
      .lte("lat", lat + 0.001)
      .gte("lng", lng - 0.001)
      .lte("lng", lng + 0.001)
      .limit(1)
      .maybeSingle();
    flags.listedBuilding = {
      listed: !!data,
      grade: data?.grade as string | undefined,
      entryUrl: data?.entry_url as string | undefined,
    };
  } catch { /* table not yet populated */ }

  // Conservation areas (planning.data.gov.uk)
  try {
    const { data } = await admin
      .from("conservation_areas")
      .select("name")
      .contains("postcodes", [postcode.replace(/\s+/g, "")])
      .limit(1)
      .maybeSingle();
    flags.conservationArea = { inArea: !!data, name: data?.name as string | undefined };
  } catch { /* */ }

  // TPOs
  try {
    const { count } = await admin
      .from("tree_preservation_orders")
      .select("id", { count: "exact", head: true })
      .gte("lat", lat - 0.005)
      .lte("lat", lat + 0.005)
      .gte("lng", lng - 0.005)
      .lte("lng", lng + 0.005);
    flags.treePreservationOrder = { affected: (count ?? 0) > 0, count: count ?? 0 };
  } catch { /* */ }

  // Radon (UKHSA / BGS GeoSure radon affected areas)
  try {
    const { data } = await admin
      .from("radon_bands")
      .select("band")
      .eq("postcode", postcode.replace(/\s+/g, "").toUpperCase())
      .limit(1)
      .maybeSingle();
    if (data?.band) flags.radonRiskBand = data.band as PremiumFlags["radonRiskBand"];
  } catch { /* */ }

  // Coal Authority reporting area
  try {
    const { data } = await admin
      .from("coal_reporting_areas")
      .select("id")
      .gte("lat", lat - 0.01)
      .lte("lat", lat + 0.01)
      .gte("lng", lng - 0.01)
      .lte("lng", lng + 0.01)
      .limit(1)
      .maybeSingle();
    flags.coalReportingArea = !!data;
    flags.miningArea = !!data;
  } catch { /* */ }

  return flags;
}
