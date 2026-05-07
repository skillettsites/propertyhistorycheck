/**
 * Paid report orchestrator — pulls everything needed for a Standard or Premium tier.
 */

import { PaidReport, PostcodeAddress } from "../types";
import { getFreeReport } from "./index";
import { getTitleRegister } from "./titleRegister";
import { getPremiumFlags } from "./flagsLookup";

export async function getPaidReport(
  address: PostcodeAddress,
  tier: "standard" | "premium"
): Promise<PaidReport> {
  const free = await getFreeReport(address);

  const lat = address.lat ?? 0;
  const lng = address.lng ?? 0;

  const flags = lat && lng
    ? await getPremiumFlags(lat, lng, address.postcode)
    : {};

  let title;
  if (tier === "premium" && address.paon) {
    title = await getTitleRegister(address.postcode, address.paon, address.saon);
  }

  return {
    free,
    title,
    flags,
    buyersVerdict: composeVerdict(free, flags, title),
    generatedAt: new Date().toISOString(),
  };
}

function composeVerdict(
  free: import("../types").FreeReport,
  flags: import("./flagsLookup").PremiumFlags,
  title?: import("../types").TitleRegisterSummary
): string {
  const lines: string[] = [];

  if (title?.tenure === "leasehold" && title.leaseRemainingYears != null) {
    if (title.leaseRemainingYears < 80) {
      lines.push(`Lease has ${title.leaseRemainingYears} years remaining — under 80 triggers marriage value and harder mortgage approvals.`);
    } else if (title.leaseRemainingYears < 100) {
      lines.push(`Lease has ${title.leaseRemainingYears} years remaining — workable but consider extension cost in your offer.`);
    }
  }

  if (title?.hasRestrictiveCovenants) {
    lines.push("Restrictive covenants are noted on the title — review with your solicitor before extending or running a business from home.");
  }

  if (free.flood?.riskLevel === "high" || free.flood?.riskLevel === "medium") {
    lines.push("Property sits in a known flood-risk area — expect higher insurance premiums and possible Flood Re engagement.");
  }

  if (flags.coalReportingArea) {
    lines.push("Property is in a Coal Authority reporting area — a CON29M mining search (£60) is recommended before exchange.");
  }

  if (flags.listedBuilding?.listed) {
    lines.push(`Property is listed (${flags.listedBuilding.grade ?? "grade unknown"}) — alterations require Listed Building Consent.`);
  }

  if (flags.radonRiskBand && flags.radonRiskBand >= 3) {
    lines.push("Property sits in a higher-radon-risk zone — UKHSA testing recommended before exchange.");
  }

  if (free.epc?.rating && ["E", "F", "G"].includes(free.epc.rating)) {
    lines.push(`EPC rating is ${free.epc.rating} — below the proposed 2030 minimum for rentals; factor retrofit cost into your offer.`);
  }

  if (free.crime && free.crime.totalIncidents > 1500) {
    lines.push("Crime volume in this area is materially above the national average — review the breakdown by category for context.");
  }

  if (lines.length === 0) {
    return "No major flags detected from automated checks. Continue with standard solicitor due diligence and a RICS Level 2 or Level 3 survey.";
  }

  return lines.join(" ");
}
