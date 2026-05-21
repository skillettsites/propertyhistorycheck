/**
 * Structured-data builders. Output is consumed by the JsonLd component
 * and dropped into <Script> tags on each page.
 *
 * Schema.org coverage: Organization, WebSite, BreadcrumbList, FAQPage,
 * Service, Article, HowTo. Aimed at maximising SERP rich-result eligibility
 * + LLM citation surface area (Perplexity / ChatGPT cite structured-data
 * pages much more readily).
 */

const SITE_URL = "https://www.homebuyercheck.co.uk";
const SITE_NAME = "HomeBuyerCheck";
const LOGO = `${SITE_URL}/logo.png`;

export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO,
    sameAs: [],
    foundingDate: "2026",
    description:
      "HomeBuyerCheck provides UK pre-offer property due-diligence reports. Free instant postcode-level report covering sales history, EPC, flood, crime, schools and council tax. Optional £4.99 Premium adds ground-risk panel, radon, listed/conservation overlays, BSR Higher-Risk Building register, ownership and Companies House owner check, Property Chamber tribunal history and an AI buyer's verdict.",
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/check?postcode={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(qas: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  priceFrom?: number;
  priceTo?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    ...(opts.priceFrom != null
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "GBP",
            lowPrice: opts.priceFrom,
            highPrice: opts.priceTo ?? opts.priceFrom,
          },
        }
      : {}),
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@type": "Organization", name: opts.authorName ?? SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO },
    },
  };
}
