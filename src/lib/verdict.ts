/**
 * Heuristic "Initial assessment" generator for the free report.
 * Reads the data we already have and produces a 3-5 sentence buyer-focused
 * verdict. No AI / no API key. Premium tier gets a longer AI-generated narrative.
 */

import { FreeReport } from "./types";

interface Verdict {
  headline: string;
  paragraphs: string[];
  positives: string[];
  cautions: string[];
}

export function buildInitialAssessment(report: FreeReport): Verdict {
  const positives: string[] = [];
  const cautions: string[] = [];
  const paragraphs: string[] = [];

  // Property summary
  const epc = report.epc;
  const price = report.priceHistory?.sales?.[0];
  const town = report.property.town;
  let opening = `This ${town ? `${town} ` : ""}property`;
  if (epc?.buildYear) opening += ` was built around ${epc.buildYear}`;
  if (epc?.totalFloorArea) opening += ` and has a ${epc.totalFloorArea}m² floor area`;
  if (price) opening += `. It last sold in ${new Date(price.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })} for £${price.price.toLocaleString()}`;
  opening += ".";
  paragraphs.push(opening);

  // Energy
  if (epc?.rating) {
    if (["A", "B"].includes(epc.rating)) positives.push(`EPC ${epc.rating} — excellent energy efficiency`);
    else if (["E", "F", "G"].includes(epc.rating)) cautions.push(`EPC ${epc.rating} — below the proposed 2030 minimum for rentals; expect retrofit costs`);
    else if (epc.rating === "C" || epc.rating === "D") {
      // neutral — note potential
      if (epc.potentialRating && ["A", "B"].includes(epc.potentialRating)) {
        positives.push(`EPC ${epc.rating} now, potential ${epc.potentialRating} after improvements`);
      }
    }
  }

  // Council tax
  if (report.councilTax?.estimatedAnnualCost) {
    if (report.councilTax.estimatedAnnualCost > 3000) {
      cautions.push(`Council tax is £${report.councilTax.estimatedAnnualCost.toLocaleString()}/yr — above the UK average`);
    }
  }

  // Flood
  if (report.flood) {
    if (report.flood.riskLevel === "high") {
      cautions.push("In a high flood-risk area — expect significantly higher home insurance premiums and possible Flood Re engagement");
    } else if (report.flood.riskLevel === "medium") {
      cautions.push("In a medium flood-risk area — insurance premiums likely 2x typical");
    } else if (report.flood.riskLevel === "very-low") {
      positives.push("Very low flood risk");
    }
  }

  // Crime
  if (report.crime) {
    if (report.crime.totalIncidents > 3000) {
      cautions.push(`${report.crime.totalIncidents.toLocaleString()} crimes reported within ~1 mile in 12 months — materially above the national average`);
    } else if (report.crime.totalIncidents < 500) {
      positives.push("Low recorded crime in the immediate area");
    }
  }

  // Planning
  if (report.planning) {
    if (report.planning.inConservationArea) cautions.push("In a conservation area — alterations may need additional consent");
    if (report.planning.hasArticle4) cautions.push("Article 4 direction in force — extra restrictions on permitted development");
    if (report.planning.nearListedBuildings > 0) {
      cautions.push(`${report.planning.nearListedBuildings} listed building${report.planning.nearListedBuildings === 1 ? "" : "s"} within close range — affects extension/renovation scope`);
    }
    if (report.planning.totalApps12m > 8) {
      cautions.push(`${report.planning.totalApps12m} planning applications within 500m in 12 months — area is changing`);
    } else if (report.planning.totalApps12m === 0) {
      positives.push("No recent planning applications nearby — settled neighbourhood");
    }
  }

  // IMD
  if (report.imd) {
    if (report.imd.decile >= 8) positives.push(`IMD decile ${report.imd.decile}/10 — low-deprivation area`);
    else if (report.imd.decile <= 3) cautions.push(`IMD decile ${report.imd.decile}/10 — higher-deprivation area`);
  }

  // Connectivity
  if (report.broadband?.fullFibre) positives.push("Full fibre broadband available");
  if (report.transport && report.transport.connectivityScore < 30) {
    cautions.push(`Transport connectivity is limited (${report.transport.connectivityScore}/100)`);
  }

  // Schools
  if (report.schools && report.schools.length > 0) {
    const outstanding = report.schools.filter((s) => s.rating === "Outstanding").length;
    if (outstanding >= 2) positives.push(`${outstanding} Ofsted-Outstanding schools within 3 km`);
  }

  // Closing recommendation
  let recommendation = "";
  if (cautions.length === 0) {
    recommendation = "No automated red flags surfaced. Continue with standard solicitor due diligence and a RICS Level 2 survey.";
  } else if (cautions.length <= 2) {
    recommendation = "A handful of items deserve a closer look before you commit. The Premium report runs a live HM Land Registry title pull and produces a property-specific verdict.";
  } else {
    recommendation = `${cautions.length} flags worth investigating. Strongly consider the Premium report for a full title-register pull and AI-driven red-flag narrative before instructing a solicitor.`;
  }
  paragraphs.push(recommendation);

  let headline: string;
  if (cautions.length === 0 && positives.length >= 2) headline = "Looks promising on the public-data signals.";
  else if (cautions.length >= 3) headline = "Several findings worth checking before you offer.";
  else if (cautions.length >= 1) headline = "Mostly clean, with a few items to verify.";
  else headline = "Initial assessment based on public data.";

  return { headline, paragraphs, positives, cautions };
}
