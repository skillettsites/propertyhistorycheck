/**
 * Heuristic "Initial assessment" generator. Reads the data we already have and
 * produces a 3-5 sentence buyer-focused verdict. No AI / no API key.
 *
 * Tier-aware: the recommendation paragraph and headline both pivot on whether
 * the buyer is reading the FREE checks, has paid for Premium, or has paid for
 * Premium+. Free buyers get an upsell pitch; Premium buyers get an upgrade
 * pitch; Premium+ buyers get a "walk through this with your conveyancer" voice.
 *
 * Cautions are returned with an optional `anchor` so the UI can deep-link the
 * bullet to the matching detail section (planning map, flood card, etc.).
 */

import { FreeReport } from "./types";

export type Tier = "standard" | "standard_plus" | undefined;

export interface CautionItem {
  text: string;
  /** Anchor target on the same page (e.g. "planning-card") so the bullet can
   * scroll the user straight to the detailed breakdown. */
  anchor?: string;
}

interface Verdict {
  headline: string;
  paragraphs: string[];
  positives: string[];
  cautions: CautionItem[];
}

export function buildInitialAssessment(report: FreeReport, paidTier?: Tier): Verdict {
  const positives: string[] = [];
  const cautions: CautionItem[] = [];
  const paragraphs: string[] = [];

  const epc = report.epc;

  // Energy
  if (epc?.rating) {
    if (["A", "B"].includes(epc.rating)) positives.push(`EPC ${epc.rating}, excellent energy efficiency`);
    else if (["E", "F", "G"].includes(epc.rating)) cautions.push({ text: `EPC ${epc.rating}, below the proposed 2030 minimum for rentals; expect retrofit costs`, anchor: "section-property-essentials" });
    else if (epc.rating === "C" || epc.rating === "D") {
      if (epc.potentialRating && ["A", "B"].includes(epc.potentialRating)) {
        positives.push(`EPC ${epc.rating} now, potential ${epc.potentialRating} after improvements`);
      }
    }
  }

  // Council tax
  if (report.councilTax?.estimatedAnnualCost) {
    if (report.councilTax.estimatedAnnualCost > 3000) {
      cautions.push({ text: `Council tax is £${report.councilTax.estimatedAnnualCost.toLocaleString()}/yr, above the UK average`, anchor: "section-finance" });
    }
  }

  // Flood
  if (report.flood) {
    if (report.flood.riskLevel === "high") {
      cautions.push({ text: "In a high flood-risk area, expect significantly higher home insurance premiums and possible Flood Re engagement", anchor: "section-risks" });
    } else if (report.flood.riskLevel === "medium") {
      cautions.push({ text: "In a medium flood-risk area, insurance premiums likely 2x typical", anchor: "section-risks" });
    } else if (report.flood.riskLevel === "very-low") {
      positives.push("Very low flood risk");
    }
  }

  // Crime
  if (report.crime) {
    if (report.crime.totalIncidents > 3000) {
      cautions.push({ text: `${report.crime.totalIncidents.toLocaleString()} crimes reported within ~1 mile in 12 months, materially above the national average`, anchor: "section-area" });
    } else if (report.crime.totalIncidents < 500) {
      positives.push("Low recorded crime in the immediate area");
    }
  }

  // Planning
  if (report.planning) {
    if (report.planning.inConservationArea) cautions.push({ text: "In a conservation area, alterations may need additional consent", anchor: "section-risks" });
    if (report.planning.hasArticle4) cautions.push({ text: "Article 4 direction in force, extra restrictions on permitted development", anchor: "section-risks" });
    if (report.planning.nearListedBuildings > 0) {
      cautions.push({ text: `${report.planning.nearListedBuildings} listed building${report.planning.nearListedBuildings === 1 ? "" : "s"} within close range, affects extension/renovation scope`, anchor: "section-risks" });
    }
    if (report.planning.totalApps12m > 8) {
      cautions.push({ text: `${report.planning.totalApps12m} planning applications within 500m in 12 months, area is changing`, anchor: "section-risks" });
    } else if (report.planning.totalApps12m === 0) {
      positives.push("No recent planning applications nearby, settled neighbourhood");
    }
  }

  // IMD
  if (report.imd) {
    if (report.imd.decile >= 8) positives.push(`IMD decile ${report.imd.decile}/10, low-deprivation area`);
    else if (report.imd.decile <= 3) cautions.push({ text: `IMD decile ${report.imd.decile}/10, higher-deprivation area`, anchor: "section-area" });
  }

  // Connectivity
  if (report.broadband?.fullFibre) positives.push("Full fibre broadband available");
  if (report.transport && report.transport.connectivityScore < 30) {
    cautions.push({ text: `Transport connectivity is limited (${report.transport.connectivityScore}/100)`, anchor: "section-connectivity" });
  }

  // Schools
  if (report.schools && report.schools.length > 0) {
    const outstanding = report.schools.filter((s) => s.rating === "Outstanding").length;
    if (outstanding >= 2) positives.push(`${outstanding} Ofsted-Outstanding schools within 3 km`);
  }

  // Tier-aware closing recommendation.
  paragraphs.push(buildRecommendation(cautions.length, paidTier));

  const headline = buildHeadline(cautions.length, positives.length, paidTier);

  return { headline, paragraphs, positives, cautions };
}

function buildRecommendation(cautionCount: number, paidTier: Tier): string {
  // PAID PREMIUM+, buyer has the AI briefs. Voice: walk through with your conveyancer.
  if (paidTier === "standard_plus") {
    if (cautionCount === 0) {
      return "No automated red flags. Your AI Solicitor, Surveyor and Mortgage briefs below cover the items your conveyancer should still raise on standard searches.";
    }
    return `${cautionCount} flag${cautionCount === 1 ? "" : "s"} to walk through with your conveyancer. Your AI Solicitor brief below has the pre-exchange enquiries ready to forward.`;
  }
  // PAID PREMIUM, buyer has the data but not the AI briefs.
  if (paidTier === "standard") {
    if (cautionCount === 0) {
      return "No automated red flags. Your Premium report below covers ownership, ground risk and tribunal history. Upgrade to Premium+ for £2 to add the AI Solicitor / Surveyor / Mortgage briefs.";
    }
    return `${cautionCount} flag${cautionCount === 1 ? "" : "s"} to investigate. Your Premium report below covers ownership, ground risk and tribunal history. Upgrade to Premium+ for £2 to get the AI Solicitor brief that turns these flags into pre-exchange enquiries.`;
  }
  // FREE, original upsell pitch.
  if (cautionCount === 0) {
    return "No automated red flags from the free data sources. Unlock the £4.99 Premium report for ownership, BSR Higher-Risk Building, ground-risk and Property Chamber tribunal history before you commit.";
  }
  if (cautionCount <= 2) {
    return `${cautionCount} flag${cautionCount === 1 ? "" : "s"} to investigate. The £4.99 Premium report adds ownership, ground risk and tribunal history before you offer.`;
  }
  return `${cautionCount} red flags. Run the £4.99 Premium report before you offer, it adds ownership, ground risk and Property Chamber tribunal history on top of what's already shown.`;
}

function buildHeadline(cautionCount: number, positiveCount: number, paidTier: Tier): string {
  // Paid voice: drop "before you offer", they've already moved past that step.
  if (paidTier === "standard" || paidTier === "standard_plus") {
    if (cautionCount === 0 && positiveCount >= 2) return "Clean signals across the automated checks.";
    if (cautionCount >= 3) return `${cautionCount} risks to address before exchange.`;
    if (cautionCount >= 1) return `${cautionCount} item${cautionCount === 1 ? "" : "s"} to address before exchange.`;
    return "Walk through these with your conveyancer.";
  }
  // Free voice, pre-offer.
  if (cautionCount === 0 && positiveCount >= 2) return "Clean signals, but run the paid checks before you offer.";
  if (cautionCount >= 3) return `${cautionCount} risks flagged on this property.`;
  if (cautionCount >= 1) return `${cautionCount} item${cautionCount === 1 ? "" : "s"} to check before you offer.`;
  return "Verify the title before you offer.";
}
