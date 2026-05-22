/**
 * Mobile signal, Ofcom api-proxy with density-based fallback.
 * Ported from PostcodeCheck.
 */

import { MobileSignalData } from "../types";

function cleanEnv(v: string | undefined): string {
  return (v || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

export async function getMobileSignal(
  postcode: string,
  populationDensityHint?: number
): Promise<MobileSignalData> {
  const apiKey = cleanEnv(process.env.OFCOM_API_KEY);
  if (!apiKey) return estimateFromDensity(populationDensityHint);

  try {
    const cleaned = postcode.replace(/\s+/g, "");
    const url = `https://api-proxy.ofcom.org.uk/mobile/coverage?postcode=${encodeURIComponent(cleaned)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json", "Ocp-Apim-Subscription-Key": apiKey },
      next: { revalidate: 2592000 },
    });
    if (!res.ok) return estimateFromDensity(populationDensityHint);
    const data = await res.json();
    const parsed = parseOfcomResponse(data);
    return parsed ?? estimateFromDensity(populationDensityHint);
  } catch {
    return estimateFromDensity(populationDensityHint);
  }
}

function parseOfcomResponse(data: Record<string, unknown>): MobileSignalData | null {
  try {
    const operators: MobileSignalData["operators"] = [];
    const operatorNames = ["EE", "Three", "O2", "Vodafone"];
    const results = (data as Record<string, unknown[]>).Availability ||
                    (data as Record<string, unknown[]>).availability || [];

    if (Array.isArray(results) && results.length > 0) {
      for (const entry of results) {
        const e = entry as Record<string, unknown>;
        operators.push({
          name: String(e.Operator || e.operator || "Unknown"),
          indoor4g: Boolean(e.Indoor4G || e.indoor4g || e.DataIndoor === "Available"),
          outdoor4g: Boolean(e.Outdoor4G || e.outdoor4g || e.DataOutdoor === "Available"),
          data5g: Boolean(e.Data5G || e.data5g || false),
        });
      }
    } else {
      for (const name of operatorNames) {
        const key = name.toLowerCase();
        const opData = (data as Record<string, Record<string, unknown>>)[key] ||
                       (data as Record<string, Record<string, unknown>>)[name];
        if (opData) {
          operators.push({
            name,
            indoor4g: Boolean(opData.Indoor4G || opData.indoor || opData["4GIndoor"]),
            outdoor4g: Boolean(opData.Outdoor4G || opData.outdoor || opData["4GOutdoor"]),
            data5g: Boolean(opData["5G"] || opData.Data5G),
          });
        }
      }
    }

    if (operators.length === 0) return null;
    const total4g = operators.filter((o) => o.outdoor4g).length;
    const total5g = operators.filter((o) => o.data5g).length;
    const overallScore = Math.round(
      (total4g / operators.length) * 70 + (total5g / operators.length) * 30
    );
    return { operators, overallScore };
  } catch {
    return null;
  }
}

function estimateFromDensity(density?: number): MobileSignalData {
  const effective = density ?? 150;
  const good = effective > 200;
  const moderate = effective > 50;
  const operators: MobileSignalData["operators"] = [
    { name: "EE", indoor4g: good || moderate, outdoor4g: true, data5g: good },
    { name: "Three", indoor4g: good, outdoor4g: good || moderate, data5g: good },
    { name: "O2", indoor4g: good || moderate, outdoor4g: true, data5g: good },
    { name: "Vodafone", indoor4g: good, outdoor4g: good || moderate, data5g: good },
  ];
  const overallScore = good ? 85 : moderate ? 60 : 35;
  return { operators, overallScore };
}
