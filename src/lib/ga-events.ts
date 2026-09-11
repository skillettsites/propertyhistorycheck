/**
 * GA4 ecommerce event payloads (purchase, begin_checkout, view_item) and the
 * one safe way to hand them to gtag.js.
 *
 * Pure builders live here so they can be unit-tested under node --test; keep
 * this file free of imports.
 *
 * Why `gtagEvent` exists: the previous success-page code fell back to
 * `dataLayer.push(["event", ...])` when `window.gtag` was not yet defined.
 * gtag.js only consumes `arguments` objects from the queue, a plain array is
 * ignored, and because the React effect ran before the afterInteractive
 * gtag.js script, every purchase took that fallback. GA4 recorded zero
 * purchases across every sale. The fallback below pushes a real `arguments`
 * object, which gtag.js replays once it loads.
 */

export type GaTier = "standard" | "standard_plus" | "standard_plus_upgrade" | "bundle" | string;

export interface GaItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: 1;
}

export interface PurchaseEvent {
  transaction_id: string;
  value: number;
  currency: "GBP";
  items: GaItem[];
}

export interface CheckoutEvent {
  value: number;
  currency: "GBP";
  items: GaItem[];
}

const TIER_NAMES: Record<string, string> = {
  standard: "Premium report",
  standard_plus: "Premium+ report",
  standard_plus_upgrade: "Premium+ upgrade",
  bundle: "Pre-Exchange Bundle",
  // Legacy id still reachable via old links; keep it named so it is counted.
  premium: "Premium report (legacy)",
};

export function tierDisplayName(tier: GaTier): string {
  return TIER_NAMES[tier] ?? tier;
}

/** Pence -> pounds, 2 dp, never NaN. */
export function penceToPounds(amountPence: number | null | undefined): number {
  const n = Number(amountPence);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n) / 100;
}

export function buildItem(tier: GaTier, amountPence: number | null | undefined): GaItem {
  return { item_id: tier, item_name: tierDisplayName(tier), price: penceToPounds(amountPence), quantity: 1 };
}

/**
 * Build the GA4 `purchase` payload from the Stripe session as read back by
 * the status endpoint (never from the URL). Returns null when anything needed
 * is missing so the caller fires nothing rather than a £0 or untied purchase.
 */
export function buildPurchaseEvent(input: {
  sessionId: string | null | undefined;
  tier: GaTier | null | undefined;
  amountPence: number | null | undefined;
}): PurchaseEvent | null {
  const sessionId = (input.sessionId ?? "").trim();
  const tier = (input.tier ?? "").trim();
  if (!sessionId || !tier) return null;
  const value = penceToPounds(input.amountPence);
  if (value <= 0) return null;
  return {
    transaction_id: sessionId,
    value,
    currency: "GBP",
    items: [buildItem(tier, input.amountPence)],
  };
}

export function buildBeginCheckoutEvent(input: { tier: GaTier; amountPence: number }): CheckoutEvent {
  const item = buildItem(input.tier, input.amountPence);
  return { value: item.price, currency: "GBP", items: [item] };
}

export function buildViewItemEvent(tiers: Array<{ tier: GaTier; amountPence: number }>): CheckoutEvent {
  const items = tiers.map((t) => buildItem(t.tier, t.amountPence));
  const value = items.reduce((sum, i) => sum + i.price, 0);
  return { value: Math.round(value * 100) / 100, currency: "GBP", items };
}

/** sessionStorage key that stops a refresh double-counting a purchase. */
export function purchaseFiredKey(sessionId: string): string {
  return `hbc_purchase_fired_${sessionId}`;
}

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Send an event to GA4. Uses window.gtag when it exists; otherwise queues a
 * genuine `arguments` object on dataLayer, which gtag.js replays on load.
 * Returns true when the event was handed to gtag or queued.
 */
export function gtagEvent(name: string, params: object): boolean {
  if (typeof window === "undefined") return false;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params);
    return true;
  }
  const queue = w.dataLayer;
  // Must be a classic function: gtag.js checks for an Arguments object.
  const push = function () {
    queue.push(arguments);
  } as (...args: unknown[]) => void;
  push("event", name, params);
  return true;
}
