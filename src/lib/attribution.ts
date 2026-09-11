/**
 * Traffic-source classification shared by the browser (first-touch capture),
 * the checkout route (Stripe metadata) and the webhook (reports row).
 *
 * Pure module: no imports, no window, no env. It is unit-tested directly under
 * node --test, so keep it dependency-free.
 */

export type TrafficSource =
  | "ai"
  | "organic"
  | "paid"
  | "social"
  | "cross_sell"
  | "referral"
  | "direct"
  | "other";

export const TRAFFIC_SOURCES: readonly TrafficSource[] = [
  "ai",
  "organic",
  "paid",
  "social",
  "cross_sell",
  "referral",
  "direct",
  "other",
];

/** AI assistants that send referral traffic. Matched on host (or host + path). */
const AI_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "copilot.microsoft.com",
  "copilot.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
];

/** utm_source / utm_medium values that name an AI assistant. */
const AI_UTM_PATTERN = /^(chatgpt|openai|chat\.openai|copilot|microsoft[-_ ]?copilot|perplexity|claude|anthropic|gemini|bing[-_ ]?chat|ai)(\.|$|[-_ ])/;

const SEARCH_HOSTS = [
  "google.",
  "bing.com",
  "yahoo.",
  "duckduckgo.com",
  "ecosia.org",
  "search.brave.com",
  "yandex.",
  "qwant.com",
  "startpage.com",
  "ask.com",
  "baidu.com",
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
  "reddit.com",
  "linkedin.com",
  "tiktok.com",
  "pinterest.",
  "youtube.com",
  "youtu.be",
  "nextdoor.",
  "threads.net",
];

const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "paid-search", "paid_social", "paid-social", "display", "cpm"]);

function parseUrl(referrer: string | null | undefined): { host: string; path: string } | null {
  if (!referrer) return null;
  try {
    const u = new URL(referrer);
    return { host: u.hostname.toLowerCase().replace(/^www\./, ""), path: u.pathname.toLowerCase() };
  } catch {
    return null;
  }
}

function hostMatches(host: string, needle: string): boolean {
  // "google." matches google.com, google.co.uk; "bing.com" matches bing.com and cn.bing.com.
  if (needle.endsWith(".")) return host === needle.slice(0, -1) || host.startsWith(needle) || host.includes("." + needle);
  return host === needle || host.endsWith("." + needle);
}

/** True when the referrer is one of the named AI assistants (incl. bing.com/chat). */
export function isAiReferrer(referrer: string | null | undefined): boolean {
  const u = parseUrl(referrer);
  if (!u) return false;
  if (AI_HOSTS.some((h) => hostMatches(u.host, h))) return true;
  if (hostMatches(u.host, "bing.com") && (u.path.startsWith("/chat") || u.path.startsWith("/copilot"))) return true;
  return false;
}

/** True when a utm_source (or utm_medium) names an AI assistant. */
export function isAiUtm(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  if (!v) return false;
  return AI_UTM_PATTERN.test(v);
}

/**
 * Short, stable label for the referrer (kept for the existing
 * `referrer_source` field in Stripe metadata and conversion_events).
 * Unknown hosts fall through to the bare hostname.
 */
export function parseReferrerSource(referrer: string | null | undefined): string | undefined {
  const u = parseUrl(referrer);
  if (!u) return undefined;
  const host = u.host;
  if (hostMatches(host, "chatgpt.com") || hostMatches(host, "chat.openai.com")) return "chatgpt";
  if (hostMatches(host, "copilot.microsoft.com") || hostMatches(host, "copilot.com")) return "copilot";
  if (hostMatches(host, "perplexity.ai")) return "perplexity";
  if (hostMatches(host, "claude.ai")) return "claude";
  if (hostMatches(host, "gemini.google.com")) return "gemini";
  if (hostMatches(host, "bing.com") && (u.path.startsWith("/chat") || u.path.startsWith("/copilot"))) return "bing_chat";
  if (host.includes("google")) return "google";
  if (host.includes("bing")) return "bing";
  if (host.includes("yahoo")) return "yahoo";
  if (host.includes("duckduckgo")) return "duckduckgo";
  if (host.includes("ecosia")) return "ecosia";
  if (host.includes("facebook") || host.includes("fb.com")) return "facebook";
  if (host.includes("twitter") || host === "x.com" || host.endsWith(".x.com")) return "twitter";
  if (host.includes("reddit")) return "reddit";
  if (host.includes("moneysavingexpert")) return "moneysavingexpert";
  if (host.includes("mumsnet")) return "mumsnet";
  return host;
}

export interface ClassifyInput {
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
}

/**
 * Classify a visit into a channel. Order matters:
 *  1. utm_medium=cross-sell (PostcodeCheck links, includes the bot traffic)
 *  2. AI named in utm_source / utm_medium
 *  3. paid utm_medium
 *  4. AI referrer host
 *  5. search engine referrer
 *  6. social referrer
 *  7. any other referrer -> referral; any other utm -> other; nothing -> direct
 */
export function classifyTrafficSource(input: ClassifyInput): TrafficSource {
  const medium = (input.utm_medium ?? "").trim().toLowerCase();
  const source = (input.utm_source ?? "").trim().toLowerCase();
  if (medium === "cross-sell" || medium === "cross_sell") return "cross_sell";
  if (isAiUtm(source) || isAiUtm(medium)) return "ai";
  if (PAID_MEDIUMS.has(medium)) return "paid";
  if (isAiReferrer(input.referrer)) return "ai";
  const u = parseUrl(input.referrer);
  if (u) {
    if (SEARCH_HOSTS.some((h) => hostMatches(u.host, h))) return "organic";
    if (SOCIAL_HOSTS.some((h) => hostMatches(u.host, h))) return "social";
    return "referral";
  }
  if (source || medium) return "other";
  return "direct";
}

export function isTrafficSource(value: unknown): value is TrafficSource {
  return typeof value === "string" && (TRAFFIC_SOURCES as readonly string[]).includes(value);
}
