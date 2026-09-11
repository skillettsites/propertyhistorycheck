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
  geo: GeoData = {},
  searchType: "address" | "postcode" = "postcode"
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("searches").insert({
      site_id: SITE_ID,
      search_query: query,
      search_type: searchType,
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

/**
 * One row per checkout session created, written by /api/checkout the moment
 * Stripe returns the session. The webhook stamps paid_at on completion, so
 * expired sessions can be compared with paid ones without another Stripe pull.
 */
export interface CheckoutStartRow {
  session_id: string;
  tier: string;
  postcode: string | null;
  landing_page: string | null;
  referrer: string | null;
  referrer_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  traffic_source: string | null;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  user_agent: string | null;
  country: string | null;
  attempt: number | null;
  is_upgrade: boolean;
  amount_pence: number | null;
}

export function deviceFromUserAgent(ua: string | null | undefined): CheckoutStartRow["device"] {
  if (!ua) return "unknown";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return "mobile";
  return "desktop";
}

export async function logCheckoutStart(row: CheckoutStartRow): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("hbc_checkouts").insert(row);
    if (error) console.error("logCheckoutStart failed", error.message);
  } catch (err) {
    console.error("logCheckoutStart failed", err);
  }
}

export async function markCheckoutPaid(sessionId: string, amountPence: number | null | undefined): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("hbc_checkouts")
      .update({ paid_at: new Date().toISOString(), amount_pence: amountPence ?? null })
      .eq("session_id", sessionId);
    if (error) console.error("markCheckoutPaid failed", error.message);
  } catch (err) {
    console.error("markCheckoutPaid failed", err);
  }
}
