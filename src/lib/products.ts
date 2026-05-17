/**
 * Product tiers for HomeBuyerCheck.
 *
 * Phase 1 — single £4.99 Standard tier. HMLR Registered Leases dataset
 * dropped because Commercial licence is £5,000+VAT/year, way beyond launch
 * volume break-even. Lease term/years remaining is removed entirely until
 * we can either justify Commercial licence or find a truly-free alternative.
 *
 * - £4.99 Standard: ~£0.30 cost → 94% margin. Adds live planning overlays
 *   (conservation, TPO, Article 4, AONB, green belt, scheduled monument,
 *   world heritage, brownfield), full BGS GeoSure 6-hazard panel, UKHSA
 *   radon band, Coal Authority reporting area, Historic England listed
 *   building, HMLR CCOD/OCOD owner-type flag, Companies House owner check
 *   (when corporate), BSR Higher-Risk Building register status (per-postcode
 *   live lookup), AI buyer's verdict, AI seller questions, permanent URL.
 */

export type ProductId = "standard";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  priceInPence: number;
  priceFormatted: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  standard: {
    id: "standard",
    name: "Standard Property Report",
    description:
      "Everything in the free report plus radon, coal mining, ground stability, listed building & conservation overlays, ownership flag (UK / overseas company), Companies House owner check, BSR Higher-Risk Building register status, AI buyer's verdict, AI seller-question pack, permanent online URL",
    priceInPence: 499,
    priceFormatted: "£4.99",
  },
};

export function getProduct(id: string): Product | null {
  if (id in PRODUCTS) return PRODUCTS[id as ProductId];
  return null;
}
