/**
 * Broadband + mobile coverage.
 *
 * Pragmatic MVP approach:
 * 1. If Postgres tables (`ofcom_broadband`, `ofcom_mobile`) are populated, use them.
 * 2. Otherwise, surface a graceful "check at Ofcom" pointer in the UI rather than
 *    relying on undocumented endpoints that change frequently.
 *
 * Connected Nations CSV bulk-loading is the production path; tracked as a
 * pending data-ingest task in CommandCenter.
 */

import { createAdminClient } from "../supabase/admin";
import { BroadbandData, MobileCoverage } from "../types";

export async function getBroadband(postcode: string): Promise<BroadbandData | undefined> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  try {
    const admin = createAdminClient();
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
  } catch {
    return undefined;
  }
}

export async function getMobileCoverage(postcode: string): Promise<MobileCoverage[]> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ofcom_mobile")
      .select("network, voice_4g, data_4g, data_5g")
      .eq("postcode", cleaned);
    if (!data || data.length === 0) return [];
    return data.map((r) => ({
      network: r.network as MobileCoverage["network"],
      voice4g: r.voice_4g as MobileCoverage["voice4g"],
      data4g: r.data_4g as MobileCoverage["data4g"],
      data5g: r.data_5g as MobileCoverage["data5g"],
    }));
  } catch {
    return [];
  }
}
