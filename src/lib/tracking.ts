const STORAGE_KEY = "phc_attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  referrer_source?: string;
  landing_page?: string;
}

function parseReferrerSource(referrer: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com")) return "chatgpt";
    if (host.includes("google")) return "google";
    if (host.includes("bing")) return "bing";
    if (host.includes("yahoo")) return "yahoo";
    if (host.includes("duckduckgo")) return "duckduckgo";
    if (host.includes("ecosia")) return "ecosia";
    if (host.includes("copilot.microsoft")) return "copilot";
    if (host.includes("claude.ai")) return "claude";
    if (host.includes("perplexity")) return "perplexity";
    if (host.includes("facebook") || host.includes("fb.com")) return "facebook";
    if (host.includes("twitter") || host.includes("x.com")) return "twitter";
    if (host.includes("reddit")) return "reddit";
    if (host.includes("moneysavingexpert")) return "moneysavingexpert";
    if (host.includes("mumsnet")) return "mumsnet";
    return host;
  } catch {
    return undefined;
  }
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
  if (referrer && !referrer.includes("propertyhistorycheck.co.uk")) {
    a.referrer = referrer;
    const source = parseReferrerSource(referrer);
    if (source) a.referrer_source = source;
  }

  a.landing_page = window.location.pathname;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a));
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
