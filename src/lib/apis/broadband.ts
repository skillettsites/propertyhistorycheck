/**
 * Broadband — ported from PostcodeCheck.
 * Ofcom Connected Nations api-proxy with intelligent estimate fallback.
 */

import { BroadbandData, BroadbandProvider } from "../types";

const BASE_URL = "https://api-proxy.ofcom.org.uk/broadband/coverage";

function cleanEnv(v: string | undefined): string {
  return (v || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

export async function getBroadband(postcode: string, region?: string): Promise<BroadbandData> {
  const apiKey = cleanEnv(process.env.OFCOM_API_KEY);
  if (!apiKey) return estimateBroadband(postcode, region);

  try {
    const cleaned = postcode.replace(/\s+/g, "");
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(cleaned)}`, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      next: { revalidate: 2592000 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return estimateBroadband(postcode, region);
    const data = await res.json();
    if (!data || !data.Availability) return estimateBroadband(postcode, region);

    const properties = Array.isArray(data.Availability) ? data.Availability : [data.Availability];
    let totalDown = 0, totalUp = 0, sf = 0, uf = 0, ff = 0;
    for (const p of properties) {
      totalDown += parseFloat(p.MaxPredictedDown || "0");
      totalUp += parseFloat(p.MaxPredictedUp || "0");
      if (parseFloat(p.MaxPredictedDown || "0") >= 30) sf++;
      if (parseFloat(p.MaxPredictedDown || "0") >= 100) uf++;
      if (p.FTTP === "Y" || p.FTTP === true) ff++;
    }
    const count = properties.length || 1;
    const avgDown = Math.round(totalDown / count);
    const superfast = sf / count > 0.5;
    const ultrafast = uf / count > 0.5;
    const fullFibre = ff / count > 0.5;

    return {
      postcode: cleaned,
      averageDownload: avgDown,
      averageUpload: Math.round(totalUp / count),
      superfast,
      ultrafast,
      fullFibre,
      providers: inferProviders(cleaned, region, avgDown, superfast, ultrafast, fullFibre),
    };
  } catch {
    return estimateBroadband(postcode, region);
  }
}

function inferProviders(
  postcode: string, region: string | undefined, avgDown: number,
  superfast: boolean, ultrafast: boolean, fullFibre: boolean
): BroadbandProvider[] {
  const providers: BroadbandProvider[] = [];
  const isLondon = region === "London" || /^(E|EC|N|NW|SE|SW|W|WC)\d/.test(postcode);
  const isMajorCity = /^(B\d|M\d|L\d|LS\d|S\d|NE\d|BS\d|CF\d|G\d|EH\d|NG\d|LE\d|CV\d|SO\d|PO\d|BN\d|RG\d|OX\d|CB\d|MK\d)/.test(postcode);
  const isUrban = isLondon || isMajorCity;
  const isRural = !isUrban && avgDown < 80;

  providers.push({ name: "BT", maxDownload: fullFibre ? 900 : superfast ? 80 : 24, fibre: fullFibre || superfast });
  providers.push({ name: "Sky", maxDownload: fullFibre ? 900 : superfast ? 80 : 24, fibre: fullFibre || superfast });
  providers.push({ name: "TalkTalk", maxDownload: fullFibre ? 900 : superfast ? 80 : 17, fibre: fullFibre || superfast });
  providers.push({ name: "Vodafone", maxDownload: fullFibre ? 900 : superfast ? 80 : 24, fibre: fullFibre || superfast });
  if (ultrafast || isUrban) providers.push({ name: "Virgin Media O2", maxDownload: 1130, fibre: false, cable: true });
  if (fullFibre && (isLondon || isMajorCity)) providers.push({ name: "Hyperoptic", maxDownload: 1000, fibre: true });
  if (fullFibre && isLondon) providers.push({ name: "Community Fibre", maxDownload: 1000, fibre: true });
  if (fullFibre && isMajorCity && !isLondon) providers.push({ name: "CityFibre", maxDownload: 900, fibre: true });
  if (fullFibre && isRural) providers.push({ name: "Gigaclear", maxDownload: 900, fibre: true });
  providers.sort((a, b) => b.maxDownload - a.maxDownload);
  return providers;
}

function estimateBroadband(postcode: string, region?: string): BroadbandData {
  const cleaned = postcode.replace(/\s+/g, "");
  const isLondon = region === "London" || /^(E|EC|N|NW|SE|SW|W|WC)\d/.test(cleaned);
  const isMajorCity = /^(B\d|M\d|L\d|LS\d|S\d|NE\d|BS\d|CF\d|G\d|EH\d)/.test(cleaned);

  if (isLondon) return {
    postcode: cleaned, averageDownload: 150, averageUpload: 30,
    superfast: true, ultrafast: true, fullFibre: true,
    providers: inferProviders(cleaned, region, 150, true, true, true),
  };
  if (isMajorCity) return {
    postcode: cleaned, averageDownload: 100, averageUpload: 20,
    superfast: true, ultrafast: true, fullFibre: true,
    providers: inferProviders(cleaned, region, 100, true, true, true),
  };
  return {
    postcode: cleaned, averageDownload: 60, averageUpload: 12,
    superfast: true, ultrafast: false, fullFibre: false,
    providers: inferProviders(cleaned, region, 60, true, false, false),
  };
}
