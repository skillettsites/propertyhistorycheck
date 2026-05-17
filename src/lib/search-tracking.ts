import { createAdminClient } from "./supabase/admin";

const SITE_ID = "homebuyercheck";

export interface GeoData {
  city?: string;
  region?: string;
  country?: string;
}

export async function logSearch(
  query: string,
  resultFound: boolean,
  geo: GeoData = {}
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("searches").insert({
      site_id: SITE_ID,
      search_query: query,
      result_found: resultFound,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
    });
  } catch (err) {
    console.error("logSearch failed", err);
  }
}

export async function logConversion(
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("conversion_events").insert({
      site_id: SITE_ID,
      event_type: eventType,
      metadata,
    });
  } catch (err) {
    console.error("logConversion failed", err);
  }
}

export async function logPageview(
  path: string,
  referrer: string | null,
  geo: GeoData = {},
  deviceType: "mobile" | "tablet" | "desktop" | "unknown" = "unknown"
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("pageviews").insert({
      site_id: SITE_ID,
      path,
      referrer,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
      device_type: deviceType,
    });
  } catch (err) {
    console.error("logPageview failed", err);
  }
}
