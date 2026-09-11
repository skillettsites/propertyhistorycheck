import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyTrafficSource, isAiReferrer, isAiUtm, parseReferrerSource } from "../src/lib/attribution.ts";

const AI_REFERRERS = [
  "https://chatgpt.com/",
  "https://chatgpt.com/c/abc123",
  "https://chat.openai.com/",
  "https://copilot.microsoft.com/",
  "https://copilot.com/chats/xyz",
  "https://www.perplexity.ai/search/some-question",
  "https://claude.ai/chat/123",
  "https://gemini.google.com/app",
  "https://www.bing.com/chat?q=property+check",
  "https://www.bing.com/copilotsearch?q=x",
];

test("every named AI assistant referrer classifies as ai", () => {
  for (const r of AI_REFERRERS) {
    assert.equal(isAiReferrer(r), true, r);
    assert.equal(classifyTrafficSource({ referrer: r }), "ai", r);
  }
});

test("plain bing.com search is organic, only bing.com/chat is ai", () => {
  assert.equal(classifyTrafficSource({ referrer: "https://www.bing.com/search?q=homebuyercheck" }), "organic");
  assert.equal(classifyTrafficSource({ referrer: "https://www.bing.com/" }), "organic");
  assert.equal(classifyTrafficSource({ referrer: "https://www.bing.com/chat" }), "ai");
  assert.equal(parseReferrerSource("https://www.bing.com/chat"), "bing_chat");
  assert.equal(parseReferrerSource("https://www.bing.com/search?q=x"), "bing");
});

test("gemini is ai, google search is organic", () => {
  assert.equal(classifyTrafficSource({ referrer: "https://gemini.google.com/" }), "ai");
  assert.equal(parseReferrerSource("https://gemini.google.com/"), "gemini");
  assert.equal(classifyTrafficSource({ referrer: "https://www.google.com/" }), "organic");
  assert.equal(classifyTrafficSource({ referrer: "https://www.google.co.uk/" }), "organic");
  assert.equal(parseReferrerSource("https://www.google.co.uk/"), "google");
});

test("utm_source values naming an AI assistant classify as ai, whatever the referrer", () => {
  const values = ["chatgpt", "chatgpt.com", "openai", "copilot", "copilot.microsoft.com", "microsoft-copilot", "perplexity", "perplexity.ai", "claude", "claude.ai", "gemini", "bing_chat", "bing-chat", "ai"];
  for (const v of values) {
    assert.equal(isAiUtm(v), true, v);
    assert.equal(classifyTrafficSource({ utm_source: v }), "ai", v);
    assert.equal(classifyTrafficSource({ utm_source: v, referrer: "https://www.google.com/" }), "ai", v);
  }
  assert.equal(classifyTrafficSource({ utm_source: "newsletter", utm_medium: "ai" }), "ai");
});

test("utm values that merely contain letters of an AI name are not ai", () => {
  assert.equal(isAiUtm("mailchimp"), false);
  assert.equal(isAiUtm("aircraft-noise"), false);
  assert.equal(isAiUtm("claudia-newsletter"), false);
  assert.equal(classifyTrafficSource({ utm_source: "mailchimp", utm_medium: "email" }), "other");
});

test("PostcodeCheck cross-sell link is its own channel even when a bot sends no referrer", () => {
  assert.equal(classifyTrafficSource({ utm_source: "postcodecheck", utm_medium: "cross-sell" }), "cross_sell");
  assert.equal(classifyTrafficSource({ utm_source: "postcodecheck", utm_medium: "cross-sell", referrer: "https://postcodecheck.co.uk/flood-risk" }), "cross_sell");
});

test("paid, social, referral, direct", () => {
  assert.equal(classifyTrafficSource({ utm_source: "google", utm_medium: "cpc" }), "paid");
  assert.equal(classifyTrafficSource({ referrer: "https://www.facebook.com/" }), "social");
  assert.equal(classifyTrafficSource({ referrer: "https://www.reddit.com/r/HousingUK/" }), "social");
  assert.equal(classifyTrafficSource({ referrer: "https://t.co/abc" }), "social");
  assert.equal(classifyTrafficSource({ referrer: "https://forums.moneysavingexpert.com/discussion/1" }), "referral");
  assert.equal(classifyTrafficSource({ referrer: "https://search.brave.com/search?q=x" }), "organic");
  assert.equal(classifyTrafficSource({ referrer: "https://www.ecosia.org/search?q=x" }), "organic");
  assert.equal(classifyTrafficSource({ referrer: "https://duckduckgo.com/" }), "organic");
  assert.equal(classifyTrafficSource({}), "direct");
  assert.equal(classifyTrafficSource({ referrer: "", utm_source: "" }), "direct");
  assert.equal(classifyTrafficSource({ referrer: "not a url" }), "direct");
});

test("referrer_source labels stay backward compatible", () => {
  assert.equal(parseReferrerSource("https://chatgpt.com/"), "chatgpt");
  assert.equal(parseReferrerSource("https://copilot.microsoft.com/"), "copilot");
  assert.equal(parseReferrerSource("https://copilot.com/"), "copilot");
  assert.equal(parseReferrerSource("https://www.perplexity.ai/"), "perplexity");
  assert.equal(parseReferrerSource("https://claude.ai/"), "claude");
  assert.equal(parseReferrerSource("https://www.ecosia.org/"), "ecosia");
  assert.equal(parseReferrerSource("https://search.brave.com/"), "search.brave.com");
  assert.equal(parseReferrerSource(""), undefined);
  assert.equal(parseReferrerSource("garbage"), undefined);
});
