import type { MetadataRoute } from "next";
import { TOP_OUTCODES } from "@/lib/seo/outcodes";
import { TOP_TOWNS } from "@/lib/seo/towns";
import { BLOG_POSTS } from "@/lib/blog";
import townsData from "@/data/towns.json";
import townOutcodes from "@/data/town-outcodes.json";

const BASE = "https://www.homebuyercheck.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/check`, lastModified: today, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/property-history-check`, lastModified: today, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/free-property-check`, lastModified: today, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/title-register-check`, lastModified: today, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/flood-risk-check`, lastModified: today, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/property-checks-before-buying`, lastModified: today, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/area`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/town`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/schools`, lastModified: today, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    // Interactive calculator tools (added 2026-06-30) — capture high-volume
    // cost-research demand and funnel to /check.
    { url: `${BASE}/conveyancing-cost-calculator`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/property-survey-cost-calculator`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/stamp-duty-calculator`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    // High-intent comparison + cheapest-X landing pages (added 2026-05-18)
    { url: `${BASE}/compare`, lastModified: today, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/blog/cheapest-property-check-uk`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blog/cheapest-homebuyer-report-online`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/blog/best-checkmyfile-alternative-uk`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/blog/property-check-before-buying-a-house-uk`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/blog/conveyancing-searches-cost-uk-2026`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/blog/title-register-download-cost-uk`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog/property-due-diligence-cost-uk`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/guides/buying-a-house-uk`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/conveyancing-explained`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/short-lease-buying-a-flat`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/conservation-area-buyers-guide`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/coal-mining-area-property`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/listed-building-grades`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/flood-zone-2-and-3`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/restrictive-covenants-explained`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/freehold-vs-leasehold`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/japanese-knotweed-property`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/title-register-uk-explained`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/buying-a-flat-checklist`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];

  const outcodes: MetadataRoute.Sitemap = TOP_OUTCODES.map((o) => ({
    url: `${BASE}/area/${o.code.toLowerCase()}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const towns: MetadataRoute.Sitemap = TOP_TOWNS.map((t) => ({
    url: `${BASE}/town/${t.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const ocMap = townOutcodes as Record<string, string[]>;
  const schoolTowns: MetadataRoute.Sitemap = (townsData as Array<{ slug: string }>)
    .filter((t) => (ocMap[t.slug] || []).length > 0)
    .map((t) => ({
      url: `${BASE}/schools/${t.slug}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const blogPosts: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.dateModified ?? p.datePublished,
    changeFrequency: "weekly" as const,
    priority: p.category === "comparison" || p.category === "cost" ? 0.85 : 0.7,
  }));

  return [...staticPages, ...outcodes, ...towns, ...schoolTowns, ...blogPosts];
}
