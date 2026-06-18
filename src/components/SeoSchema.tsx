/**
 * Reusable JSON-LD schema components for the comparison + cheapest-X landing
 * pages. Produces FAQPage and SpeakableSpecification markup that Google AI
 * Overviews + voice assistants use to read aloud or quote.
 *
 * Each blog/comparison page imports <FaqSchema items={...}/> and
 * <SpeakableSchema selectors={[...]}/> and renders them inline in the page.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSchema({ items }: { items: FaqItem[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

/**
 * SpeakableSpecification tells Google Assistant / Alexa / voice search
 * which CSS selectors to read aloud as the answer to a query. Use it for
 * the headline answer + first paragraph on each comparison/landing page.
 */
export function SpeakableSchema({
  selectors,
  url,
  headline,
}: {
  selectors: string[];
  url: string;
  headline: string;
}) {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: headline,
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: selectors,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

/**
 * Shared comparison table component reused on /compare and inside each
 * cheapest-X blog post. Single source of truth for competitor pricing:
 * if competitor prices change, update them here only.
 */
export interface CompetitorRow {
  name: string;
  price: string;
  /** Plain-text summary of what they offer. */
  summary: string;
  /** Per-feature booleans for the table. Order matches table columns. */
  features: {
    ownership: boolean;
    title: boolean;
    flood: boolean;
    groundRisk: boolean;
    tribunal: boolean;
    bsr: boolean;
    companiesHouse: boolean;
    aiBriefs: boolean;
    permanentUrl: boolean;
  };
  /** Optional external link. */
  url?: string;
  /** Highlight this row (true = our product). */
  us?: boolean;
}

export const COMPETITORS: CompetitorRow[] = [
  {
    name: "HomeBuyerCheck (us)",
    price: "£4.99 Premium · £6.99 Premium+",
    summary:
      "Full ground-risk panel, ownership (UK + overseas), Companies House owner check, BSR HRB, Property Chamber tribunal history, AI buyer's verdict, AI seller-question pack. Premium+ adds AI Solicitor / Surveyor / Mortgage briefs + on-demand Negotiation Report.",
    features: {
      ownership: true,
      title: false,
      flood: true,
      groundRisk: true,
      tribunal: true,
      bsr: true,
      companiesHouse: true,
      aiBriefs: true,
      permanentUrl: true,
    },
    url: "/check",
    us: true,
  },
  {
    name: "CheckMyFile property report",
    price: "£19.99",
    summary:
      "Address-level credit-style file. Limited buyer-specific data; no AI analysis; no BSR or tribunal history.",
    features: {
      ownership: false,
      title: false,
      flood: true,
      groundRisk: false,
      tribunal: false,
      bsr: false,
      companiesHouse: false,
      aiBriefs: false,
      permanentUrl: true,
    },
    url: "https://www.checkmyfile.com/",
  },
  {
    name: "HMLR title register direct",
    price: "£7 per title",
    summary:
      "Raw HM Land Registry title PDF, Property, Proprietorship and Charges registers. No analysis, no context, no other data sources.",
    features: {
      ownership: true,
      title: true,
      flood: false,
      groundRisk: false,
      tribunal: false,
      bsr: false,
      companiesHouse: false,
      aiBriefs: false,
      permanentUrl: false,
    },
    url: "https://eservices.landregistry.gov.uk/eservices/FindAProperty",
  },
  {
    name: "Local authority CON29 search",
    price: "£85-£250",
    summary:
      "Planning, road, contaminated-land, environmental enquiries from the local council. Only ordered AFTER instructing a solicitor.",
    features: {
      ownership: false,
      title: false,
      flood: false,
      groundRisk: false,
      tribunal: false,
      bsr: false,
      companiesHouse: false,
      aiBriefs: false,
      permanentUrl: false,
    },
  },
  {
    name: "Solicitor full conveyancing search pack",
    price: "£250-£450",
    summary:
      "LLC1 + CON29 + drainage + environmental searches via your solicitor. Only after instruction (typically £1,000-£1,500 total).",
    features: {
      ownership: true,
      title: true,
      flood: true,
      groundRisk: true,
      tribunal: false,
      bsr: false,
      companiesHouse: false,
      aiBriefs: false,
      permanentUrl: false,
    },
  },
  {
    name: "RICS Level 2 HomeBuyer Report",
    price: "£400-£900",
    summary:
      "Physical inspection by a chartered surveyor. Different category, covers building condition, not legal/title/data flags. Best AFTER pre-offer checks.",
    features: {
      ownership: false,
      title: false,
      flood: false,
      groundRisk: false,
      tribunal: false,
      bsr: false,
      companiesHouse: false,
      aiBriefs: false,
      permanentUrl: false,
    },
  },
];

export function CompetitorTable({ highlightUs = true }: { highlightUs?: boolean }) {
  const cols: Array<{ key: keyof CompetitorRow["features"]; label: string }> = [
    { key: "ownership", label: "Ownership flag" },
    { key: "flood", label: "Flood + climate" },
    { key: "groundRisk", label: "Ground risk" },
    { key: "tribunal", label: "Tribunal history" },
    { key: "bsr", label: "BSR HRB register" },
    { key: "companiesHouse", label: "Companies House" },
    { key: "aiBriefs", label: "AI briefs" },
    { key: "permanentUrl", label: "Permanent URL" },
  ];
  return (
    <div className="overflow-x-auto my-6 rounded-2xl border border-slate-200">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left p-3 font-bold text-slate-900">Service</th>
            <th className="text-left p-3 font-bold text-slate-900">Price</th>
            {cols.map((c) => (
              <th key={c.key} className="text-center p-3 font-semibold text-slate-700 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPETITORS.map((r) => (
            <tr
              key={r.name}
              className={`border-b border-slate-100 last:border-0 ${highlightUs && r.us ? "bg-emerald-50" : ""}`}
            >
              <td className="p-3 align-top">
                <p className={`font-semibold ${r.us ? "text-emerald-900" : "text-slate-900"}`}>{r.name}</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[280px]">{r.summary}</p>
              </td>
              <td className="p-3 align-top font-bold whitespace-nowrap text-slate-900">{r.price}</td>
              {cols.map((c) => (
                <td key={c.key} className="p-3 text-center align-top">
                  {r.features[c.key] ? (
                    <span className="text-emerald-600 text-lg" aria-label="yes">✓</span>
                  ) : (
                    <span className="text-slate-300 text-lg" aria-label="no">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
