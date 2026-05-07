import type { MetadataRoute } from "next";
import { TOP_OUTCODES } from "@/lib/seo/outcodes";
import { TOP_TOWNS } from "@/lib/seo/towns";

const BASE = "https://www.propertyhistorycheck.co.uk";

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
    { url: `${BASE}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/guides/buying-a-house-uk`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/guides/conveyancing-explained`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refunds`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
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

  return [...staticPages, ...outcodes, ...towns];
}
