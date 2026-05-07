import type { MetadataRoute } from "next";

const BASE = "https://www.propertyhistorycheck.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/check`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/property-history-check`, lastModified: today, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/free-property-check`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/title-register-check`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/flood-risk-check`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/property-checks-before-buying`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refunds`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];
  return staticPages;
}
