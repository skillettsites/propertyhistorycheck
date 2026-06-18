import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog";

const CATEGORY_ORDER: Array<{ key: "comparison" | "cost" | "qa" | "data-story"; label: string }> = [
  { key: "comparison", label: "Comparisons & reviews" },
  { key: "cost", label: "Costs guides" },
  { key: "qa", label: "Buyer questions answered" },
  { key: "data-story", label: "Data studies" },
];

export const metadata = {
  title: "UK property buying guides + cheapest property check comparisons",
  description: "UK property buying guides covering pre-offer due diligence, cheapest property checks ranked, conveyancing search costs, title register reading, flood risk, leasehold and CheckMyFile alternatives.",
  alternates: { canonical: "/blog" },
};

interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  /** Comparison/cheapest pages live under /blog/[slug]; guides live under /guides/[slug]. */
  prefix?: "blog" | "guides";
}

const POSTS: PostSummary[] = [
  // High-intent comparison + cheapest-X pages
  { prefix: "blog", slug: "cheapest-property-check-uk", title: "Cheapest property check in the UK · ranked (2026)", excerpt: "Every UK property check ranked by price, £4.99 HomeBuyerCheck Premium vs £19.99 CheckMyFile vs £7 HMLR title vs £250-£450 solicitor searches. Full comparison table." },
  { prefix: "blog", slug: "cheapest-homebuyer-report-online", title: "Cheapest HomeBuyer report online · UK 2026", excerpt: "RICS HomeBuyer surveys cost £400-£900. The cheapest online pre-offer property check is £4.99. How the two complement each other." },
  { prefix: "blog", slug: "best-checkmyfile-alternative-uk", title: "Best CheckMyFile property report alternative · £4.99 vs £19.99", excerpt: "Side-by-side: 4x cheaper, materially more data. Ownership flag, BSR HRB, Companies House, tribunal history, AI verdict." },
  { prefix: "blog", slug: "property-check-before-buying-a-house-uk", title: "Property check before buying a UK house · 15 things to verify", excerpt: "The 15 things every UK buyer should check before offering, ownership, title, ground risk, flood, BSR HRB, tribunal, planning. £4.99 covers all 15." },
  { prefix: "blog", slug: "conveyancing-searches-cost-uk-2026", title: "UK conveyancing searches cost · 2026 breakdown", excerpt: "Every UK conveyancing search by cost, LLC1, CON29, CON29DW, environmental, CON29M, LPE1. £250-£450 total. How £4.99 pre-offer changes the spend." },
  { prefix: "blog", slug: "title-register-download-cost-uk", title: "UK title register download cost · £7 direct from HMLR", excerpt: "£7 for the title register, £7 for the plan. What each register contains and what HomeBuyerCheck adds for £4.99." },
  { prefix: "blog", slug: "property-due-diligence-cost-uk", title: "UK property due diligence cost · 2026 full breakdown", excerpt: "Total £1,685-£3,650 from offer to exchange. Where every pound goes, what you can skip, where the £4.99 check returns 1,500x." },
  // Existing guides
  { prefix: "guides", slug: "buying-a-house-uk", title: "Buying a house in the UK, the 2026 step-by-step guide", excerpt: "Every stage of the UK house-buying process, from offer to exchange to completion." },
  { slug: "conveyancing-explained", title: "Conveyancing explained, what your solicitor actually does", excerpt: "What the £1,500 you're about to spend on a solicitor actually buys you, and what they don't check." },
  { slug: "short-lease-buying-a-flat", title: "Buying a flat with a short lease (under 80 years), what to know", excerpt: "Marriage value, lender thresholds, ground rent traps, and how to use a short lease to renegotiate the price." },
  { slug: "conservation-area-buyers-guide", title: "Buying in a conservation area, what changes", excerpt: "Article 4 directions, window restrictions, paint colours, satellite dishes, insurance, and the resale premium." },
  { slug: "coal-mining-area-property", title: "Buying a property in a coal mining area", excerpt: "CON29M searches, mine entries, subsidence history and what flags lead to insurance refusals." },
  { slug: "listed-building-grades", title: "Listed building grades I, II*, II, what each means for a buyer", excerpt: "Listed Building Consent, what's actually protected inside the home, unauthorised work penalties, and ownership cost." },
  { slug: "flood-zone-2-and-3", title: "How to read a UK flood zone map", excerpt: "Flood Zone 1, 2, 3a and 3b explained, surface water risk, Flood Re eligibility and real-world insurance premium hikes." },
  { slug: "restrictive-covenants-explained", title: "Restrictive covenants on UK property, what they are and how to handle them", excerpt: "Common covenant types, when they're enforceable, Lands Tribunal applications, indemnity insurance and what to ask your solicitor." },
  { slug: "freehold-vs-leasehold", title: "Freehold vs leasehold, what UK buyers need to know in 2026", excerpt: "Tenure definitions, the 2024 Reform Act, commonhold, share of freehold, lease extension cost and what mortgage lenders look for." },
  { slug: "japanese-knotweed-property", title: "Buying a property with Japanese knotweed nearby, risk and remediation", excerpt: "The 7-metre rule, mortgage impact, treatment cost, insurance-backed warranties and the TA6 disclosure obligation post-Davies v Bridgend." },
  { slug: "title-register-uk-explained", title: "How to read a UK Land Registry title register, line by line", excerpt: "The Property, Proprietorship and Charges Registers explained, with a redacted example showing what each entry means." },
  { prefix: "guides", slug: "buying-a-flat-checklist", title: "Buying a flat in the UK, a buyer's pre-offer checklist", excerpt: "Lease length, ground rent, service charge history, sinking fund, EWS1, share of freehold, Section 20, LPE1 and covenants." },
];

export default function BlogIndex() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold text-slate-900">UK property buying guides + price comparisons</h1>
          <p className="mt-3 text-slate-700">
            High-intent comparison pages first, then the original buyer guides. Start with the <Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs competitors comparison</Link> if you&apos;re choosing a check.
          </p>
          <ul className="mt-8 space-y-6">
            {POSTS.map((p) => (
              <li key={p.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Link href={`/${p.prefix ?? "guides"}/${p.slug}`} className="text-lg font-semibold text-slate-900 hover:text-blue-700">{p.title}</Link>
                <p className="mt-2 text-sm text-slate-700">{p.excerpt}</p>
              </li>
            ))}
          </ul>

          {CATEGORY_ORDER.map(({ key, label }) => {
            const items = BLOG_POSTS.filter((p) => p.category === key);
            if (!items.length) return null;
            return (
              <div key={key} className="mt-12">
                <h2 className="text-xl font-bold text-slate-900">{label}</h2>
                <ul className="mt-4 space-y-3">
                  {items.map((p) => (
                    <li key={p.slug} className="rounded-xl border border-slate-200 bg-white p-4">
                      <Link href={`/blog/${p.slug}`} className="font-semibold text-slate-900 hover:text-blue-700">{p.h1}</Link>
                      <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
    </>
  );
}
