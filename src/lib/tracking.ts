import { classifyTrafficSource, isTrafficSource, parseReferrerSource, type TrafficSource } from "./attribution";

const STORAGE_KEY = "phc_attribution";
const ATTEMPT_KEY = "hbc_checkout_attempts";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  referrer_source?: string;
  landing_page?: string;
  /** Channel classification (ai / organic / paid / social / cross_sell / referral / direct / other). */
  traffic_source?: TrafficSource;
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const a: Attribution = {};

  const utm = (k: string) => params.get(k) || undefined;
  if (utm("utm_source")) a.utm_source = utm("utm_source");
  if (utm("utm_medium")) a.utm_medium = utm("utm_medium");
  if (utm("utm_campaign")) a.utm_campaign = utm("utm_campaign");
  if (utm("utm_content")) a.utm_content = utm("utm_content");

  const referrer = document.referrer;
  if (referrer && !referrer.includes("homebuyercheck.co.uk")) {
    a.referrer = referrer;
    const source = parseReferrerSource(referrer);
    if (source) a.referrer_source = source;
  }

  a.landing_page = window.location.pathname;
  a.traffic_source = classifyTrafficSource({ referrer: a.referrer, utm_source: a.utm_source, utm_medium: a.utm_medium });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a));
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const a = JSON.parse(stored) as Attribution;
    // Sessions captured before traffic_source existed: classify on read so the
    // checkout body always carries it.
    if (!isTrafficSource(a.traffic_source)) {
      a.traffic_source = classifyTrafficSource({ referrer: a.referrer, utm_source: a.utm_source, utm_medium: a.utm_medium });
    }
    return a;
  } catch {
    return null;
  }
}

/**
 * Count checkout starts in this browser session (1 on the first click). Sent
 * with the checkout request and logged, so a second session created seconds
 * after the first is visible as attempt 2 instead of looking like a new buyer.
 */
export function nextCheckoutAttempt(): number {
  if (typeof window === "undefined") return 1;
  try {
    const n = Number(sessionStorage.getItem(ATTEMPT_KEY) ?? "0") + 1;
    sessionStorage.setItem(ATTEMPT_KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}
