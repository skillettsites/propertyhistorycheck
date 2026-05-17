/**
 * Paid report orchestrator — pulls everything needed for a Standard or Premium tier.
 */

import { PaidReport, PostcodeAddress, CompanyOwner, TitlePlanRef, LeaseAddon, Ews1Addon } from "../types";
import { getFreeReport } from "./index";
import { getTitleRegister } from "./titleRegister";
import { getPremiumFlags } from "./flagsLookup";
import { lookupCompanyOwner } from "./companiesHouse";
import { generateSellerQuestions } from "./aiSellerQuestions";
import { orderTitlePlan, estimateMonthlyRent } from "./propertyData";

export async function getPaidReport(
  address: PostcodeAddress,
  tier: "standard" | "premium",
  options?: { leaseAddon?: boolean; ews1Addon?: boolean }
): Promise<PaidReport> {
  const free = await getFreeReport(address);

  const lat = address.lat ?? 0;
  const lng = address.lng ?? 0;

  const flagsPromise = lat && lng
    ? getPremiumFlags(lat, lng, address.postcode)
    : Promise.resolve({});

  const titlePromise = tier === "premium" && address.paon
    ? getTitleRegister(address.postcode, address.paon, address.saon)
    : Promise.resolve(undefined);

  // Rental estimate is a paid-only feature (PropertyData ~1p/call).
  // Computed in parallel with flags + title.
  const rentalPromise = (async () => {
    if (!free.epc?.propertyType) return undefined;
    const bedrooms = free.epc.habitableRooms != null
      ? Math.max(1, free.epc.habitableRooms - 1)
      : undefined;
    const rent = await estimateMonthlyRent({
      postcode: address.postcode,
      bedrooms,
      propertyType: free.epc.propertyType,
    });
    if (!rent) return undefined;
    // Yield = annual rent ÷ purchase-price estimate (HPI-indexed last sale, else postcode median)
    const lastSale = free.priceHistory?.sales?.[0];
    let priceProxy: number | undefined;
    if (lastSale) {
      const yearsAgo = (Date.now() - new Date(lastSale.date).getTime()) / (365.25 * 24 * 3600 * 1000);
      priceProxy = lastSale.price * Math.pow(1.045, yearsAgo);
    } else if (free.priceHistory?.postcodeMedian) {
      priceProxy = free.priceHistory.postcodeMedian;
    }
    const grossYieldPct = priceProxy
      ? Math.round((rent.monthlyRent * 12 * 1000) / priceProxy) / 10
      : undefined;
    return { ...rent, grossYieldPct };
  })();

  const [flags, title, rentalEstimate] = await Promise.all([flagsPromise, titlePromise, rentalPromise]);
  // Inject rental into the free sub-report so existing UI components pick it up.
  if (rentalEstimate) free.rentalEstimate = rentalEstimate;

  // Premium-only enrichments — depend on the title pull, run in parallel.
  let companyOwner: CompanyOwner | undefined;
  let titlePlan: TitlePlanRef | undefined;
  if (tier === "premium" && title) {
    const corporateOwner = (title.registeredOwners ?? []).find((o) =>
      /\b(LTD|LIMITED|LLP|LP|PLC|GMBH|SA|INC|AG|AB|BV)\b/i.test(o ?? "")
    );
    const [ch, plan] = await Promise.all([
      corporateOwner ? lookupCompanyOwner(corporateOwner) : Promise.resolve(undefined),
      title.titleNumber ? orderTitlePlan(title.titleNumber) : Promise.resolve(undefined),
    ]);
    if (ch) companyOwner = ch;
    if (plan) titlePlan = { documentUrl: plan.documentUrl, orderRef: plan.orderRef };
  }

  // Seed lease pending state if user paid the £9.99 add-on. Fulfilment happens
  // out-of-band (Stripe webhook → Telegram → manual HMLR order → admin upload
  // → reports.data.lease.status flips to "ready").
  let lease: LeaseAddon | undefined;
  if (options?.leaseAddon) {
    lease = {
      status: "pending",
      orderedAt: new Date().toISOString(),
      note: "Ordered from HM Land Registry. Delivered within 48 hours (most arrive same-day). You'll get an email when it's ready.",
    };
  }

  // Seed EWS1 pending state if user paid the £4.99 add-on. Fulfilment is manual:
  // operator checks BSR HRB Register + FIA + Building Safety Portal then posts findings.
  let ews1: Ews1Addon | undefined;
  if (options?.ews1Addon) {
    ews1 = {
      status: "pending",
      orderedAt: new Date().toISOString(),
      notes: "Cross-referencing BSR Higher-Risk Building register, FIA EWS1 portal, and Building Safety Portal. Delivered within 48 hours.",
    };
  }

  // AI seller questions — generated last because it consumes everything else.
  const interim: PaidReport = {
    free,
    title,
    titlePlan,
    lease,
    ews1,
    companyOwner,
    flags,
    buyersVerdict: composeVerdict(free, flags, title),
    generatedAt: new Date().toISOString(),
  };
  const sellerQuestions = tier === "premium"
    ? await generateSellerQuestions(interim)
    : undefined;

  return {
    ...interim,
    sellerQuestions,
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
