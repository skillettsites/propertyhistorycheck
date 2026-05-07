/**
 * Product tiers for PropertyHistoryCheck.
 *
 * Pricing rationale (research May 2026):
 * - £14.99 busts the impulse threshold; UK consumer instinct is "under £15 = no-brainer".
 * - £29.99 sits between the £7 raw HMLR title and £100+ specialist single-risk reports.
 * - Anchor against £499 RICS Level 2 survey: "spend £29 to decide whether to book one".
 * Premium tier includes a live HM Land Registry title register pull (via reseller API)
 * which is the single moat ChatGPT cannot cross.
 */

export type ProductId = "standard" | "premium";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  priceInPence: number;
  priceFormatted: string;
  includesTitleRegister: boolean;
  includesPdf: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  standard: {
    id: "standard",
    name: "Standard Property Report",
    description:
      "Full flood risk, planning history, restrictive covenants flag, listed building / conservation area, full crime breakdown, environmental hazards, signed PDF",
    priceInPence: 1499,
    priceFormatted: "£14.99",
    includesTitleRegister: false,
    includesPdf: true,
  },
  premium: {
    id: "premium",
    name: "Premium Property Report",
    description:
      "Standard plus live HM Land Registry title register pull, lease length analysis, climate-projected flood risk, mining/subsidence/radon flags, AI buyer's verdict",
    priceInPence: 2999,
    priceFormatted: "£29.99",
    includesTitleRegister: true,
    includesPdf: true,
  },
};

export function getProduct(id: string): Product | null {
  if (id in PRODUCTS) return PRODUCTS[id as ProductId];
  return null;
}
