/**
 * HM Land Registry title register pull (PAID, premium-tier only).
 *
 * Flow (cost ~£9.20 wholesale per call, only fires after Premium £14.99 paid):
 * 1. Address → UPRN via PropertyData /address-match-uprn (10 credits ≈ £0.14)
 * 2. UPRN → title number via PropertyData /uprn-title (1 credit ≈ £0.014)
 * 3. Order title register PDF via PropertyData /land-registry-documents (£9 inc VAT)
 * 4. Send PDF to Anthropic Claude Sonnet for structured extraction (~£0.05)
 *
 * On any failure, returns undefined and the report falls back to showing
 * the raw PDF download link (without parsed fields) to the buyer.
 *
 * Migration path: once HMLR Business Gateway is onboarded (~6 weeks), swap
 * this whole chain for a single XML call to HMLR. Same return shape, cheaper.
 */

import type { TitleRegisterSummary } from "../types";
import { findTitleNumber, orderTitleDocument } from "./propertyData";
import { extractTitleRegisterFromPdf } from "./titleExtractor";

export async function getTitleRegister(
  postcode: string,
  paon: string,
  saon?: string,
): Promise<TitleRegisterSummary | undefined> {
  const propertyDataKey = process.env.PROPERTYDATA_API_KEY;
  if (!propertyDataKey) {
    console.warn("PROPERTYDATA_API_KEY missing; title register pull unavailable");
    return undefined;
  }

  // Step 1+2: address → UPRN → title number
  const fullAddress = [saon, paon].filter(Boolean).join(", ");
  if (!fullAddress) return undefined;
  const lookup = await findTitleNumber({ postcode, fullAddress });
  if (!lookup) {
    console.error("title number lookup failed for", fullAddress, postcode);
    return undefined;
  }

  // Step 3: order register PDF
  const order = await orderTitleDocument(lookup.titleNumber, "register");
  if (!order?.documentUrl) {
    console.error("title register PDF order failed for", lookup.titleNumber);
    return undefined;
  }

  // Step 4: extract structured fields via Anthropic.
  const extracted = await extractTitleRegisterFromPdf(order.documentUrl);
  if (extracted) {
    return {
      ...extracted,
      // Backfill title number from the PropertyData lookup if Anthropic missed it.
      titleNumber: extracted.titleNumber ?? lookup.titleNumber,
      rawDocumentUrl: order.documentUrl,
    };
  }

  // Fall back: PDF + title number + tenure guess from title class, no other fields.
  return {
    titleNumber: lookup.titleNumber,
    tenure: /leasehold/i.test(lookup.titleClass) ? "leasehold" : "freehold",
    rawDocumentUrl: order.documentUrl,
  };
}
