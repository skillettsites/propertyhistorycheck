/**
 * Product tiers for HomeBuyerCheck.
 *
 * Live tiers:
 *  - £4.99 Premium (id: "standard"): radon, coal mining, ground stability,
 *    listed building & conservation overlays, ownership flag (UK / overseas
 *    company), Companies House owner check, BSR Higher-Risk Building register
 *    status, Property Chamber tribunal history at the building, AI buyer's
 *    verdict, AI seller-question pack, permanent online URL.
 *  - £6.99 Premium+ (id: "standard_plus"): Premium + three AI briefs
 *    (Solicitor / Surveyor / Mortgage broker) grounded on the flags + HS2
 *    safeguarded distance + aircraft noise at the exact address.
 *  - £2.00 Upgrade (id: "standard_plus_upgrade"): in-place upgrade for an
 *    existing Premium buyer, generates the three Premium+ briefs against
 *    their existing report, updates the row to standard_plus, sends a fresh
 *    email. Stripe metadata must include `existing_token` so the webhook
 *    knows which report to upgrade.
 *
 * NOTE: the internal IDs are kept as `standard` and `standard_plus` to
 * preserve historical Stripe data, Supabase rows, and webhook compatibility.
 * Only user-facing copy uses the new "Premium" / "Premium+" names.
 *
 * Both tiers run on free OGL v3.0 data + Anthropic Claude. COGS ~£0.30 for
 * Premium, ~£0.45 for Premium+. Margins 87-94%.
 */

export type ProductId = "standard" | "standard_plus" | "standard_plus_upgrade" | "bundle";

export interface Product {
  id: ProductId;
  /** Short human-readable label used in CTAs and email subjects. */
  name: string;
  description: string;
  priceInPence: number;
  priceFormatted: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  standard: {
    id: "standard",
    name: "Risk & Title Synthesis",
    description:
      "The risks a solicitor's searches cost £250-£450 to surface, read in plain English before you offer: title & tenure synthesis (tenure, ownership, sale history), radon, coal mining, ground stability, listed building / conservation / Article 4 overlays, UK / overseas company owner flag, Companies House owner check, BSR Higher-Risk Building register status, Property Chamber tribunal history, AI buyer's verdict and a tailored seller-question pack. Permanent online URL.",
    priceInPence: 499,
    priceFormatted: "£4.99",
  },
  standard_plus: {
    id: "standard_plus",
    name: "Pre-Exchange Brief",
    description:
      "Everything in Risk & Title Synthesis plus the artifacts that save your professionals time: an AI Solicitor brief (TA6-style pre-exchange enquiries), an AI Surveyor brief (what to flag to the RICS surveyor), an AI Mortgage broker brief (lending-friction flags), an interactive Negotiation Report (a defensible offer range from comparables, base rate and the risk flags) and the leasehold extension cost calculator.",
    priceInPence: 699,
    priceFormatted: "£6.99",
  },
  standard_plus_upgrade: {
    id: "standard_plus_upgrade",
    name: "Premium+ Upgrade",
    description:
      "Upgrade your existing Premium report to Premium+: adds the AI Solicitor brief, AI Surveyor brief, and AI Mortgage broker brief grounded on your existing report's flags. Same online URL.",
    priceInPence: 200,
    priceFormatted: "£2.00",
  },
  // Top tier. Everything in Premium+ PLUS the full title-register synthesis
  // (covenants, easements, charges in plain English, sourced from the official
  // HM Land Registry copy) and the leasehold-extension cost calculator. This is
  // the only tier that pulls the paid official title copy, so the data cost is
  // covered here, not in the cheaper tiers.
  bundle: {
    id: "bundle",
    name: "Pre-Exchange Bundle",
    description:
      "Everything in Premium+ plus the full title-register synthesis (tenure, covenants, easements and charges read out in plain English from the official HM Land Registry copy) and the leasehold-extension cost calculator. The complete pre-offer pack for your solicitor.",
    priceInPence: 1499,
    priceFormatted: "£14.99",
  },
};

export function getProduct(id: string): Product | null {
  if (id in PRODUCTS) return PRODUCTS[id as ProductId];
  return null;
}
