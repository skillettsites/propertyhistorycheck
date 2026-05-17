/**
 * Paid report orchestrator — pulls everything for the Standard / Standard+Lease tiers.
 *
 * Phase 1 (current): no PropertyData. All sources are free / Anthropic-only.
 * Phase 2 (later, when volume justifies £28/mo PropertyData): re-enable title pull.
 */

import {
  PaidReport,
  PostcodeAddress,
  CompanyOwner,
  LeaseholdInfo,
  OwnershipFlag,
} from "../types";
import { getFreeReport } from "./index";
import { getPremiumFlags } from "./flagsLookup";
import { lookupCompanyOwner } from "./companiesHouse";
import { generateSellerQuestions } from "./aiSellerQuestions";
import { lookupLease } from "./hmlrLeases";
import { lookupOwnership } from "./hmlrOwnership";

export type PaidTier = "standard" | "standard-plus-lease";

export async function getPaidReport(
  address: PostcodeAddress,
  tier: PaidTier,
): Promise<PaidReport> {
  const free = await getFreeReport(address);

  const lat = address.lat ?? 0;
  const lng = address.lng ?? 0;

  // Always pull: premium flags (live APIs, ~500ms) + ownership lookup.
  const flagsPromise = lat && lng
    ? getPremiumFlags(lat, lng, address.postcode)
    : Promise.resolve({});

  const ownershipPromise = lookupOwnership(address.postcode, address.paon, address.saon);

  // Lease lookup only for Standard+Lease tier (uses HMLR Leases dataset).
  const leasePromise: Promise<LeaseholdInfo | undefined> = tier === "standard-plus-lease"
    ? lookupLease(address.postcode, address.paon, address.saon)
    : Promise.resolve(undefined);

  const [flags, ownership, leasehold] = await Promise.all([flagsPromise, ownershipPromise, leasePromise]);

  // Companies House owner check — only fires if ownership lookup returned a
  // corporate proprietor name (avoids wasted API calls when owner is an individual).
  let companyOwner: CompanyOwner | undefined;
  const corporateName = ownership?.proprietors?.find((n) =>
    /\b(LTD|LIMITED|LLP|LP|PLC|GMBH|SA|INC|AG|AB|BV)\b/i.test(n)
  );
  if (corporateName) {
    const ch = await lookupCompanyOwner(corporateName);
    if (ch) companyOwner = ch;
  }

  // Build interim report (no title in this phase).
  const interim: PaidReport = {
    free,
    title: undefined,
    titlePlan: undefined,
    lease: undefined,
    companyOwner,
    flags,
    leasehold,
    ownership,
    buyersVerdict: composeVerdict(free, flags, leasehold, ownership),
    generatedAt: new Date().toISOString(),
  };

  // AI seller questions — generated last because it consumes everything else.
  const sellerQuestions = await generateSellerQuestions(interim);

  return {
    ...interim,
    sellerQuestions,
  };
}

function composeVerdict(
  free: import("../types").FreeReport,
  flags: import("./flagsLookup").PremiumFlags,
  leasehold: LeaseholdInfo | undefined,
  ownership: OwnershipFlag | undefined,
): string {
  const lines: string[] = [];

  if (leasehold?.found && leasehold.yearsRemaining != null) {
    if (leasehold.yearsRemaining < 80) {
      lines.push(`Lease has ${leasehold.yearsRemaining} years remaining — under 80 triggers marriage value and harder mortgage approvals.`);
    } else if (leasehold.yearsRemaining < 100) {
      lines.push(`Lease has ${leasehold.yearsRemaining} years remaining — workable but factor extension cost into your offer.`);
    }
  }

  if (ownership?.overseasOwned && ownership.countryIncorporated) {
    lines.push(`Owner is an overseas company registered in ${ownership.countryIncorporated} — flagged for solicitor diligence.`);
  } else if (ownership?.ukCompanyOwned) {
    lines.push("Owner is a UK company — your solicitor should verify status, charges, and beneficial ownership.");
  }

  if (free.flood?.riskLevel === "high" || free.flood?.riskLevel === "medium") {
    lines.push("Property sits in a known flood-risk area — expect higher insurance premiums and possible Flood Re engagement.");
  }

  if (flags.coalReportingArea) {
    lines.push("Property is in a Coal Authority reporting area — a CON29M mining search (£32.40) is recommended before exchange.");
  }

  if (flags.listedBuilding?.listed) {
    lines.push(`Property is listed (${flags.listedBuilding.grade ?? "grade unknown"}) — alterations require Listed Building Consent.`);
  }

  if (flags.conservationArea?.inArea) {
    lines.push(`In conservation area${flags.conservationArea.name ? ` (${flags.conservationArea.name})` : ""} — tighter planning controls.`);
  }

  if (flags.article4?.affected) {
    lines.push("Article 4 direction in force — permitted development rights are restricted.");
  }

  if (flags.radonRiskBand && flags.radonRiskBand >= 3) {
    lines.push(`Radon affected area band ${flags.radonRiskBand}/6 — UKHSA testing recommended before exchange.`);
  }

  if (flags.shrinkSwellBand && flags.shrinkSwellBand >= 3) {
    lines.push(`Shrink-swell clay band ${flags.shrinkSwellBand}/5 — subsidence risk; consider a structural survey.`);
  }

  if (flags.landslideBand && flags.landslideBand >= 3) {
    lines.push(`Landslide hazard band ${flags.landslideBand}/5 — investigate ground stability with surveyor.`);
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
