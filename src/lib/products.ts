/**
 * Product tiers for HomeBuyerCheck.
 *
 * Pricing (May 2026, post-refactor):
 * - £4.99 Standard: free report PLUS premium env flags (radon, coal, BGS ground,
 *   listed/conservation/TPO/Article 4/AONB/scheduled monument/WHS), HMLR ownership
 *   flag (UK company / overseas company), Companies House owner check (when
 *   applicable), AI buyer's verdict, AI seller questions, solicitor handover PDF,
 *   permanent online URL. ~£0.30 cost → 94% margin.
 * - £7.99 Standard + Leasehold: above PLUS HMLR Leases dataset lookup
 *   (lease term + years remaining, calculated from the official monthly dataset).
 *   ~£0.34 cost → 96% margin. Sold only when the property is likely leasehold.
 *
 * Phase 2 (deferred until volume justifies PropertyData subscription):
 * - £19.99 Title & Tenure (live HMLR title register pull, AI deep verdict)
 * - £14.99 Lease document (OC2) PDF add-on
 */

export type ProductId = "standard" | "standard-plus-lease";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  priceInPence: number;
  priceFormatted: string;
  includesLeasehold: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  standard: {
    id: "standard",
    name: "Standard Property Report",
    description:
      "Everything in the free report plus radon, coal mining, ground stability, listed building & conservation overlays, ownership flag (UK / overseas company), Companies House owner check, AI buyer's verdict, AI seller-question pack, solicitor handover PDF, permanent online URL",
    priceInPence: 499,
    priceFormatted: "£4.99",
    includesLeasehold: false,
  },
  "standard-plus-lease": {
    id: "standard-plus-lease",
    name: "Standard + Leasehold Report",
    description:
      "Everything in the Standard report plus lease term & years remaining from the official HM Land Registry Leases dataset. Recommended for any leasehold property (most flats).",
    priceInPence: 799,
    priceFormatted: "£7.99",
    includesLeasehold: true,
  },
};

export function getProduct(id: string): Product | null {
  if (id in PRODUCTS) return PRODUCTS[id as ProductId];
  return null;
}
