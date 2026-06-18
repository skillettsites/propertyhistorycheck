/**
 * Paid report orchestrator. Two tiers (internal IDs unchanged; user-facing
 * labels are now Premium and Premium+):
 *  - "standard" (Premium, £4.99), all current paid features.
 *  - "standard_plus" (Premium+, £6.99), Premium + AI Solicitor/Surveyor/Mortgage
 *    briefs + HS2 safeguarded distance + aircraft noise.
 * All sources free / Anthropic-only. No PropertyData. No HMLR Leases.
 */

import {
  PaidReport,
  PostcodeAddress,
  CompanyOwner,
  OwnershipFlag,
} from "../types";
import { getFreeReport } from "./index";
import { getPremiumFlags } from "./flagsLookup";
import { lookupCompanyOwner, lookupDisqualifiedDirectors } from "./companiesHouse";
import { generateSellerQuestions } from "./aiSellerQuestions";
import { generateSolicitorBrief, generateSurveyorBrief, generateMortgageBrief } from "./aiBriefs";
import { lookupOwnership } from "./hmlrOwnership";
import { lookupBsrHrb } from "./bsrHrb";
import { lookupTribunalHistory } from "./tribunalDecisions";

export type PaidTier = "standard" | "standard_plus" | "bundle";

/** Tiers that receive the three AI pre-exchange briefs. */
const PLUS_TIERS: ReadonlyArray<PaidTier> = ["standard_plus", "bundle"];

/**
 * Title & tenure synthesis from data we already hold for free: the property's
 * own Land Registry sales (tenure F/L + last price) and the CCOD/OCOD ownership
 * flag (corporate proprietor names). The full official copy (covenants,
 * easements, charges) is a £7 HMLR add-on flagged for the buyer; this gives the
 * plain-English tenure + ownership picture without that pull.
 */
function buildTitleSummary(
  free: import("../types").FreeReport,
  ownership: OwnershipFlag | undefined,
): import("../types").TitleRegisterSummary | undefined {
  const ownSale = free.priceHistory?.sales?.[0];
  let tenure: "freehold" | "leasehold" | undefined =
    ownSale?.tenure === "L" ? "leasehold" : ownSale?.tenure === "F" ? "freehold" : undefined;

  // Fallback for flats/units that have no open-market sale of their own in the
  // Price Paid Data (common: never sold, pre-1995, or first transfer not in
  // PPD). Infer tenure from same-postcode comparables so the synthesis still
  // renders the headline tenure fact instead of being dropped entirely. We do
  // NOT synthesise a price paid for a property that never sold.
  if (!tenure) {
    const comps = free.priceHistory?.similarSales ?? [];
    let lease = 0, free_ = 0;
    for (const c of comps) { if (c.tenure === "L") lease++; else if (c.tenure === "F") free_++; }
    if (lease + free_ > 0) tenure = lease >= free_ ? "leasehold" : "freehold";
  }

  const registeredOwners = ownership?.proprietors?.length ? ownership.proprietors : undefined;
  const pricePaid = ownSale ? { amount: ownSale.price, date: ownSale.date } : undefined;
  if (!tenure && !registeredOwners && !pricePaid) return undefined;
  return { tenure, registeredOwners, pricePaid };
}

export async function getPaidReport(address: PostcodeAddress, tier: PaidTier): Promise<PaidReport> {
  const free = await getFreeReport(address);

  const lat = address.lat ?? 0;
  const lng = address.lng ?? 0;

  const flagsPromise = lat && lng
    ? getPremiumFlags(lat, lng, address.postcode)
    : Promise.resolve({});

  const ownershipPromise = lookupOwnership(address.postcode, address.paon, address.saon);
  const bsrPromise = lookupBsrHrb(address.postcode, address.paon);
  const tribunalPromise = lookupTribunalHistory(address.postcode, address.paon, address.fullAddress);

  const [flags, ownership, bsrHrb, tribunalHistory] = await Promise.all([
    flagsPromise,
    ownershipPromise,
    bsrPromise,
    tribunalPromise,
  ]);

  // Companies House owner check, only fires if ownership lookup returned a
  // corporate proprietor name (avoids wasted API calls when owner is an individual).
  let companyOwner: CompanyOwner | undefined;
  let disqualifiedDirectors: import("../types").DisqualifiedOfficer[] | undefined;
  const corporateName = ownership?.proprietors?.find((n) =>
    /\b(LTD|LIMITED|LLP|LP|PLC|GMBH|SA|INC|AG|AB|BV)\b/i.test(n)
  );
  if (corporateName) {
    // Run both lookups in parallel, both are free CH calls.
    const [ch, disq] = await Promise.all([
      lookupCompanyOwner(corporateName),
      lookupDisqualifiedDirectors(corporateName),
    ]);
    if (ch) companyOwner = ch;
    if (disq.length > 0) disqualifiedDirectors = disq;
  }

  const interim: PaidReport = {
    free,
    // Title & tenure synthesis from free register data, so every paid tier gets
    // it (the £4.99 tier is literally "Risk & Title Synthesis"). The Bundle adds
    // the official £7 copy ordering + leasehold calculator on top.
    title: buildTitleSummary(free, ownership),
    titlePlan: undefined,
    lease: undefined,
    companyOwner,
    disqualifiedDirectors,
    flags,
    ownership,
    bsrHrb,
    tribunalHistory,
    buyersVerdict: composeVerdict(free, flags, ownership, bsrHrb, tribunalHistory),
    generatedAt: new Date().toISOString(),
  };

  // Premium always gets the seller-questions pack.
  // Plus tier additionally gets three AI briefs in parallel.
  const sellerQuestionsPromise = generateSellerQuestions(interim);
  const briefsPromise: Promise<{
    solicitor?: import("../types").PreExchangeBrief;
    surveyor?: import("../types").PreExchangeBrief;
    mortgage?: import("../types").PreExchangeBrief;
  }> = PLUS_TIERS.includes(tier)
    ? Promise.all([
        generateSolicitorBrief(interim),
        generateSurveyorBrief(interim),
        generateMortgageBrief(interim),
      ]).then(([solicitor, surveyor, mortgage]) => ({ solicitor, surveyor, mortgage }))
    : Promise.resolve({});

  const [sellerQuestions, briefs] = await Promise.all([sellerQuestionsPromise, briefsPromise]);

  return {
    ...interim,
    sellerQuestions,
    solicitorBrief: briefs.solicitor,
    surveyorBrief: briefs.surveyor,
    mortgageBrief: briefs.mortgage,
  };
}

function composeVerdict(
  free: import("../types").FreeReport,
  flags: import("./flagsLookup").PremiumFlags,
  ownership: OwnershipFlag | undefined,
  bsrHrb: import("../types").BsrHrbInfo | undefined,
  tribunalHistory?: import("../types").TribunalHistorySummary,
): string {
  const lines: string[] = [];

  if (tribunalHistory && tribunalHistory.count > 0) {
    lines.push(`This building/postcode has been to the First-tier Tribunal Property Chamber ${tribunalHistory.count} time${tribunalHistory.count === 1 ? "" : "s"}${tribunalHistory.topCategory ? ` (most commonly: ${tribunalHistory.topCategory})` : ""}, review the cases below before exchange.`);
  }

  if (bsrHrb?.registered) {
    lines.push(`Building is on the BSR Higher-Risk Building register (${bsrHrb.heightMetres ? `${bsrHrb.heightMetres}m, ` : ""}${bsrHrb.numberOfFloors ? `${bsrHrb.numberOfFloors} floors, ` : ""}${bsrHrb.residentialUnits ? `${bsrHrb.residentialUnits} flats` : ""}). Get the EWS1 form, FRAEW status, and remediation plan from the freeholder before exchange.`);
  }

  if (ownership?.overseasOwned && ownership.countryIncorporated) {
    lines.push(`Owner is an overseas company registered in ${ownership.countryIncorporated}, flagged for solicitor diligence.`);
  } else if (ownership?.ukCompanyOwned) {
    lines.push("Owner is a UK company, your solicitor should verify status, charges, and beneficial ownership.");
  }

  if (free.flood?.riskLevel === "high" || free.flood?.riskLevel === "medium") {
    lines.push("Property sits in a known flood-risk area, expect higher insurance premiums and possible Flood Re engagement.");
  }

  if (flags.coalReportingArea) {
    lines.push("Property is in a Coal Authority reporting area, a CON29M mining search (£32.40) is recommended before exchange.");
  }

  if (flags.listedBuilding?.listed) {
    lines.push(`Property is listed (${flags.listedBuilding.grade ?? "grade unknown"}), alterations require Listed Building Consent.`);
  }

  if (flags.conservationArea?.inArea) {
    lines.push(`In conservation area${flags.conservationArea.name ? ` (${flags.conservationArea.name})` : ""}, tighter planning controls.`);
  }

  if (flags.article4?.affected) {
    lines.push("Article 4 direction in force, permitted development rights are restricted.");
  }

  if (flags.radonRiskBand && flags.radonRiskBand >= 3) {
    lines.push(`Radon affected area band ${flags.radonRiskBand}/6, UKHSA testing recommended before exchange.`);
  }

  if (flags.shrinkSwellBand && flags.shrinkSwellBand >= 3) {
    lines.push(`Shrink-swell clay band ${flags.shrinkSwellBand}/5, subsidence risk; consider a structural survey.`);
  }

  if (flags.landslideBand && flags.landslideBand >= 3) {
    lines.push(`Landslide hazard band ${flags.landslideBand}/5, investigate ground stability with surveyor.`);
  }

  if (free.epc?.rating && ["E", "F", "G"].includes(free.epc.rating)) {
    lines.push(`EPC rating is ${free.epc.rating}, below the proposed 2030 minimum for rentals; factor retrofit cost into your offer.`);
  }

  if (free.crime && free.crime.totalIncidents > 1500) {
    lines.push("Crime volume in this area is materially above the national average, review the breakdown by category for context.");
  }

  if (lines.length === 0) {
    return "No major flags detected from automated checks. Continue with standard solicitor due diligence and a RICS Level 2 or Level 3 survey.";
  }

  return lines.join(" ");
}
