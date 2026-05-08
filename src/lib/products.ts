/**
 * Product tiers for PropertyHistoryCheck.
 *
 * Pricing (May 2026):
 * - £4.99 Standard: well below impulse threshold; pure conversion play.
 * - £14.99 Premium: undercuts every priced competitor (Move iQ £17.99, PropertyPassport £19+).
 *   Includes a live HM Land Registry title register pull via Business Gateway direct
 *   (~£3 wholesale, leaving healthy ~73% margin even after Stripe fees).
 *   The live title register is the single moat ChatGPT cannot cross.
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
      "Full flood risk, planning history, restrictive covenants flag, listed building / conservation area, full crime breakdown, environmental hazards, permanent online URL",
    priceInPence: 499,
    priceFormatted: "£4.99",
    includesTitleRegister: false,
    includesPdf: true,
  },
  premium: {
    id: "premium",
    name: "Premium Property Report",
    description:
      "Standard plus live HM Land Registry title register pull, lease length analysis, climate-projected flood risk, mining/subsidence/radon flags, AI buyer's verdict",
    priceInPence: 1499,
    priceFormatted: "£14.99",
    includesTitleRegister: true,
    includesPdf: true,
  },
};

export function getProduct(id: string): Product | null {
  if (id in PRODUCTS) return PRODUCTS[id as ProductId];
  return null;
}
