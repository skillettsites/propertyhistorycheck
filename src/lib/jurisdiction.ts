/**
 * Which UK nation an address is in, and whether we can deliver a full paid
 * /check report there.
 *
 * Paid reports lean on England & Wales data sources: HM Land Registry sold
 * prices + CCOD/OCOD ownership, the EPC register, GIAS schools, Historic
 * England listings and planning.data.gov.uk overlays. Scotland (Registers of
 * Scotland, Scottish EPC, Scottish Government school data) and Northern Ireland
 * (Land & Property Services, NI EPC) are separate systems we don't yet ingest,
 * so a paid report there comes back mostly empty. We block the sale rather than
 * charge for a hollow report; the free summary still shows what we can provide.
 */
export type Jurisdiction = "england" | "wales" | "scotland" | "northern-ireland" | "unknown";

// Postcode areas (the leading letters) that are wholly in Scotland.
const SCOTTISH_AREAS = new Set([
  "AB", "DD", "DG", "EH", "FK", "G", "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE",
]);

export function jurisdictionFromPostcode(postcode?: string): Jurisdiction {
  if (!postcode) return "unknown";
  const pc = postcode.toUpperCase().replace(/\s+/g, "");
  if (pc.startsWith("BT")) return "northern-ireland";
  const area = (pc.match(/^[A-Z]{1,2}/) || [""])[0];
  if (SCOTTISH_AREAS.has(area)) return "scotland";
  return "unknown"; // England vs Wales aren't separable by area alone
}

/** Prefer the postcodes.io country string; fall back to postcode-area heuristics. */
export function resolveJurisdiction(country?: string, postcode?: string): Jurisdiction {
  const c = (country || "").toLowerCase();
  if (c.includes("scotland")) return "scotland";
  if (c.includes("northern ireland")) return "northern-ireland";
  if (c.includes("wales")) return "wales";
  if (c.includes("england")) return "england";
  return jurisdictionFromPostcode(postcode);
}

/** True when a paid report can be meaningfully populated (England & Wales). */
export function fullReportSupported(country?: string, postcode?: string): boolean {
  const j = resolveJurisdiction(country, postcode);
  return j !== "scotland" && j !== "northern-ireland";
}

export function jurisdictionLabel(j: Jurisdiction): string {
  switch (j) {
    case "scotland": return "Scotland";
    case "northern-ireland": return "Northern Ireland";
    case "wales": return "Wales";
    case "england": return "England";
    default: return "this area";
  }
}
