import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBeginCheckoutEvent,
  buildPurchaseEvent,
  buildViewItemEvent,
  gtagEvent,
  penceToPounds,
  purchaseFiredKey,
} from "../src/lib/ga-events.ts";

test("purchase payload is built from the session read-back, in pounds", () => {
  const ev = buildPurchaseEvent({ sessionId: "cs_live_abc123", tier: "standard_plus", amountPence: 699 });
  assert.deepEqual(ev, {
    transaction_id: "cs_live_abc123",
    value: 6.99,
    currency: "GBP",
    items: [{ item_id: "standard_plus", item_name: "Premium+ report", price: 6.99, quantity: 1 }],
  });
});

test("every live tier gets a readable item_name", () => {
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "standard", amountPence: 499 })?.items[0].item_name, "Premium report");
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "bundle", amountPence: 1499 })?.items[0].item_name, "Pre-Exchange Bundle");
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "standard_plus_upgrade", amountPence: 200 })?.items[0].item_name, "Premium+ upgrade");
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "premium", amountPence: 499 })?.items[0].item_name, "Premium report (legacy)");
  // Unknown tier still fires, named by its id, so nothing is silently dropped.
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "future_tier", amountPence: 999 })?.items[0].item_name, "future_tier");
});

test("no purchase without a session id, tier or positive amount", () => {
  assert.equal(buildPurchaseEvent({ sessionId: "", tier: "standard", amountPence: 499 }), null);
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "", amountPence: 499 }), null);
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "standard", amountPence: 0 }), null);
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "standard", amountPence: null }), null);
  assert.equal(buildPurchaseEvent({ sessionId: "cs_1", tier: "standard", amountPence: Number.NaN }), null);
});

test("discounted amounts use the amount actually paid", () => {
  const ev = buildPurchaseEvent({ sessionId: "cs_1", tier: "standard", amountPence: 449 });
  assert.equal(ev?.value, 4.49);
  assert.equal(ev?.items[0].price, 4.49);
});

test("penceToPounds never returns NaN or negative", () => {
  assert.equal(penceToPounds(499), 4.99);
  assert.equal(penceToPounds(undefined), 0);
  assert.equal(penceToPounds(-5), 0);
  assert.equal(penceToPounds(Number.NaN), 0);
});

test("begin_checkout and view_item payloads", () => {
  assert.deepEqual(buildBeginCheckoutEvent({ tier: "bundle", amountPence: 1499 }), {
    value: 14.99,
    currency: "GBP",
    items: [{ item_id: "bundle", item_name: "Pre-Exchange Bundle", price: 14.99, quantity: 1 }],
  });
  const view = buildViewItemEvent([
    { tier: "standard", amountPence: 499 },
    { tier: "standard_plus", amountPence: 699 },
    { tier: "bundle", amountPence: 1499 },
  ]);
  assert.equal(view.items.length, 3);
  assert.equal(view.value, 26.97);
  assert.equal(view.currency, "GBP");
});

test("fired key is per session id", () => {
  assert.equal(purchaseFiredKey("cs_live_x"), "hbc_purchase_fired_cs_live_x");
});

test("gtagEvent queues an Arguments object when gtag.js has not loaded, and calls gtag when it has", () => {
  const g = globalThis as unknown as { window?: unknown };
  const fake: { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void } = {};
  g.window = fake;
  try {
    assert.equal(gtagEvent("purchase", { transaction_id: "cs_1" }), true);
    assert.equal(fake.dataLayer?.length, 1);
    const queued = fake.dataLayer?.[0] as IArguments;
    // gtag.js only replays entries that are real Arguments objects, never arrays.
    assert.equal(Object.prototype.toString.call(queued), "[object Arguments]");
    assert.equal(Array.isArray(queued), false);
    assert.equal(queued[0], "event");
    assert.equal(queued[1], "purchase");
    assert.deepEqual(queued[2], { transaction_id: "cs_1" });

    const calls: unknown[][] = [];
    fake.gtag = (...a: unknown[]) => { calls.push(a); };
    assert.equal(gtagEvent("begin_checkout", { value: 4.99 }), true);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], ["event", "begin_checkout", { value: 4.99 }]);
    assert.equal(fake.dataLayer?.length, 1, "no extra queue entry once gtag exists");
  } finally {
    delete g.window;
  }
});

test("gtagEvent is a no-op on the server", () => {
  const g = globalThis as unknown as { window?: unknown };
  delete g.window;
  assert.equal(gtagEvent("purchase", {}), false);
});
