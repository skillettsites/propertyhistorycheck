/**
 * Broadband + mobile coverage.
 *
 * Source: Ofcom Connected Nations CSV (postcode-level), free with email signup.
 * Cached in Postgres (table: ofcom_broadband, ofcom_mobile).
 * If those tables aren't populated yet, returns undefined gracefully.
 */

import { createAdminClient } from "../supabase/admin";
import { BroadbandData, MobileCoverage } from "../types";

export async function getBroadband(postcode: string): Promise<BroadbandData | undefined> {
  const admin = createAdminClient();
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const { data } = await admin
    .from("ofcom_broadband")
    .select("max_download_mbps, max_upload_mbps, fttp_available, average_download_mbps")
    .eq("postcode", cleaned)
    .limit(1)
    .maybeSingle();
  if (!data) return undefined;
  return {
    maxDownloadMbps: data.max_download_mbps as number,
    maxUploadMbps: data.max_upload_mbps as number,
    fttpAvailable: data.fttp_available as boolean,
    averageDownloadMbps: data.average_download_mbps as number,
  };
}

export async function getMobileCoverage(postcode: string): Promise<MobileCoverage[]> {
  const admin = createAdminClient();
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const { data } = await admin
    .from("ofcom_mobile")
    .select("network, voice_4g, data_4g, data_5g")
    .eq("postcode", cleaned);
  if (!data) return [];
  return data.map((r) => ({
    network: r.network as MobileCoverage["network"],
    voice4g: r.voice_4g as MobileCoverage["voice4g"],
    data4g: r.data_4g as MobileCoverage["data4g"],
    data5g: r.data_5g as MobileCoverage["data5g"],
  }));
}
