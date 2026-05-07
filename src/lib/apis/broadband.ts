/**
 * Broadband + mobile coverage.
 *
 * Strategy:
 * 1. If Postgres tables (`ofcom_broadband`, `ofcom_mobile`) are populated, use them.
 * 2. Otherwise, fall back to Ofcom's checker JSON (undocumented but stable for 2+ years,
 *    consumed by the public Mobile and Broadband Checker at checker.ofcom.org.uk).
 *
 * The undocumented endpoint takes a postcode and returns:
 * - broadband: max download/upload speeds, FTTP availability
 * - mobile: per-network 4G/5G voice and data coverage
 */

import { createAdminClient } from "../supabase/admin";
import { BroadbandData, MobileCoverage } from "../types";

const OFCOM_BASE = "https://www.ofcom.org.uk/api/coverage";

export async function getBroadband(postcode: string): Promise<BroadbandData | undefined> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const fromDb = await tryDb(cleaned);
  if (fromDb) return fromDb;
  const fromOfcom = await tryOfcom(cleaned);
  return fromOfcom?.broadband;
}

export async function getMobileCoverage(postcode: string): Promise<MobileCoverage[]> {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const fromDb = await tryDbMobile(cleaned);
  if (fromDb && fromDb.length) return fromDb;
  const fromOfcom = await tryOfcom(cleaned);
  return fromOfcom?.mobile ?? [];
}

async function tryDb(postcode: string): Promise<BroadbandData | undefined> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ofcom_broadband")
      .select("max_download_mbps, max_upload_mbps, fttp_available, average_download_mbps")
      .eq("postcode", postcode)
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

async function tryDbMobile(postcode: string): Promise<MobileCoverage[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ofcom_mobile")
      .select("network, voice_4g, data_4g, data_5g")
      .eq("postcode", postcode);
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

interface OfcomCombined {
  broadband?: BroadbandData;
  mobile?: MobileCoverage[];
}

let ofcomCache: Map<string, { at: number; data: OfcomCombined }> = new Map();
const OFCOM_TTL_MS = 1000 * 60 * 60 * 24 * 7;

async function tryOfcom(postcode: string): Promise<OfcomCombined | undefined> {
  const cached = ofcomCache.get(postcode);
  if (cached && Date.now() - cached.at < OFCOM_TTL_MS) return cached.data;

  try {
    const formatted = formatPostcode(postcode);
    const url = `${OFCOM_BASE}?postcode=${encodeURIComponent(formatted)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; PropertyHistoryCheckBot/1.0)",
      },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const result = parseOfcomResponse(data);
    ofcomCache.set(postcode, { at: Date.now(), data: result });
    return result;
  } catch (err) {
    console.warn("Ofcom checker fallback failed", err);
    return undefined;
  }
}

function formatPostcode(p: string): string {
  const c = p.replace(/\s+/g, "").toUpperCase();
  if (c.length < 5) return c;
  return `${c.slice(0, -3)} ${c.slice(-3)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOfcomResponse(d: any): OfcomCombined {
  const result: OfcomCombined = {};

  // Broadband
  const bb = d?.availability?.broadband ?? d?.broadband ?? d;
  if (bb) {
    const maxDown =
      Number(bb.maxDownload ?? bb.max_download ?? bb.maxDownloadMbps ?? bb.fttp_max_download ?? bb.maxDownSpeed) || undefined;
    const maxUp =
      Number(bb.maxUpload ?? bb.max_upload ?? bb.maxUploadMbps ?? bb.maxUpSpeed) || undefined;
    const fttp = !!(bb.fttpAvailable ?? bb.fttp_available ?? bb.fttp ?? false);
    if (maxDown || maxUp) {
      result.broadband = {
        maxDownloadMbps: maxDown,
        maxUploadMbps: maxUp,
        fttpAvailable: fttp,
      };
    }
  }

  // Mobile
  const mob = d?.availability?.mobile ?? d?.mobile;
  if (mob && Array.isArray(mob)) {
    const networks: MobileCoverage[] = [];
    for (const op of mob) {
      const name = (op.operator ?? op.network ?? "").toString();
      let network: MobileCoverage["network"] | undefined;
      if (/EE/i.test(name)) network = "EE";
      else if (/O2|Telef/i.test(name)) network = "O2";
      else if (/Vodafone/i.test(name)) network = "Vodafone";
      else if (/Three|H3G|3UK/i.test(name)) network = "Three";
      if (!network) continue;
      networks.push({
        network,
        voice4g: bandToTier(op.voice4G ?? op.voice_4g ?? op.voice),
        data4g: bandToTier(op.data4G ?? op.data_4g ?? op.data),
        data5g: bandToTier(op.data5G ?? op.data_5g),
      });
    }
    if (networks.length) result.mobile = networks;
  }

  return result;
}

function bandToTier(v: unknown): "good" | "limited" | "none" | undefined {
  if (v == null) return undefined;
  const s = String(v).toLowerCase();
  if (s.includes("good") || s.includes("excellent") || s === "1") return "good";
  if (s.includes("limited") || s.includes("variable") || s.includes("indoor")) return "limited";
  if (s.includes("none") || s.includes("no")) return "none";
  return undefined;
}
