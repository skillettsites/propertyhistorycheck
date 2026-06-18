import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { CompetitorTable, FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/cheapest-property-check-uk`;

export const metadata = {
  title: "Cheapest property check UK · £4.99 ranked vs £19.99-£450 alternatives (2026)",
  description:
    "The cheapest UK property check in 2026 is HomeBuyerCheck at £4.99, ownership, ground risk, flood, BSR Higher-Risk Building register, Property Chamber tribunal history and AI analysis. CheckMyFile is £19.99, HMLR title is £7 (no analysis), solicitor searches £250-£450. Full table.",
  alternates: { canonical: "/blog/cheapest-property-check-uk" },
  openGraph: {
    title: "Cheapest UK property check 2026 · ranked",
    description: "Every UK property check ranked by price + what's included.",
  },
};

const FAQ: FaqItem[] = [
  {
    question: "What is the cheapest property check in the UK?",
    answer:
      "The cheapest UK property check in 2026 is HomeBuyerCheck Premium at £4.99, which includes ownership flag, full ground-risk panel, Companies House owner check, BSR Higher-Risk Building register status, Property Chamber tribunal history, and AI buyer's verdict. Premium+ at £6.99 adds three AI briefs and an on-demand Negotiation Report. The next-cheapest comparable consumer product is CheckMyFile at £19.99.",
  },
  {
    question: "Can I check a property's history for free?",
    answer:
      "Yes, HomeBuyerCheck's free tier covers sales history (HM Land Registry Price Paid), EPC rating, flood risk band, 12-month crime stats, council tax band, school proximity, and broadband + 4G/5G coverage. It runs instantly from any UK postcode at /check. The £4.99 Premium tier adds the deeper data (ownership, ground risk, ownership, BSR, tribunal history, AI analysis) that drives offer renegotiation.",
  },
  {
    question: "Why is HomeBuyerCheck cheaper than CheckMyFile?",
    answer:
      "Three reasons. (1) Every data source is UK government open data under the Open Government Licence v3.0, no per-search resale fees. (2) AI analysis runs on Anthropic Claude at sub-15p per report. (3) The product is delivered instantly online, no PDFs to post, no humans manually reviewing each report. That gives a ~94% gross margin which keeps the price at £4.99.",
  },
  {
    question: "Is a £4.99 property check accurate?",
    answer:
      "Yes, all data is pulled live from official UK government APIs at the moment of purchase: HM Land Registry (sales, CCOD, OCOD), Environment Agency (flood), Police.uk (crime), GIAS / Ofsted, Valuation Office Agency, Ofcom, British Geological Survey (ground risk), Coal Authority, Historic England, planning.data.gov.uk, Companies House, Building Safety Regulator, and First-tier Tribunal Property Chamber. The AI summarises the data, it doesn't invent flags.",
  },
  {
    question: "Do I still need a solicitor if I run a £4.99 property check?",
    answer:
      "Yes. HomeBuyerCheck is informational only and sits BEFORE you instruct a solicitor (£1,000-£1,500 typical UK conveyancing). Its job is to help you decide whether to commit to those costs and surface flags you can use to renegotiate the asking price 1-3% (£3,000-£15,000 on a typical UK home) before exchange.",
  },
  {
    question: "What does the £6.99 Premium+ tier add over £4.99 Premium?",
    answer:
      "Premium+ adds three AI-generated audience-specific briefs (Solicitor brief in TA6-style enquiries, Surveyor brief on what to flag to a RICS surveyor, Mortgage broker brief on lending friction) plus an on-demand Negotiation Report that models a defensible offer range from comps + Bank of England Bank Rate + Land Registry UKHPI + every flag found. Existing Premium buyers can upgrade in-place for £2.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema
        url={URL}
        headline="Cheapest property check UK 2026"
        selectors={["#tldr", ".speakable-summary"]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Buyer&apos;s guide · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Cheapest property check in the UK · ranked
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>HomeBuyerCheck Premium at £4.99 is the cheapest UK property check in 2026.</strong>{" "}
              It includes the full HM Land Registry ownership flag, British Geological Survey ground-risk panel, Companies House owner check, BSR Higher-Risk Building register status, Property Chamber tribunal history, full flood data + climate projection, and an AI buyer&apos;s verdict + seller-question pack. The £6.99 Premium+ tier adds three AI briefs and an on-demand Negotiation Report. Nothing else under £10 comes close.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Run the free check first, no card, 30 seconds.</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Every UK property check, ranked by price</h2>
          <CompetitorTable />
          <p className="mt-2 text-xs text-slate-500">
            Prices verified November 2026. Solicitor and surveyor figures are typical UK midmarket. HomeBuyerCheck data is updated live from each source at the moment of purchase.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">£4.99 vs everything else, what each one buys you</h2>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£0, Free check (HomeBuyerCheck)</h3>
          <p className="mt-2">
            Sales history, EPC, flood risk band, council tax band, crime in the last 12 months, school proximity, broadband + 4G/5G. Useful for: deciding whether the property is worth the next steps. Limitations: no ownership, no ground risk, no Companies House, no AI analysis.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£7, HM Land Registry title download (direct)</h3>
          <p className="mt-2">
            HMLR <a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty" className="text-blue-700 underline-offset-2 hover:underline" target="_blank" rel="noopener">FindAProperty</a> sells the raw title register PDF (Property + Proprietorship + Charges registers) for £7. You get the legal document. You don&apos;t get: any other data sources, plain-English summary, charge analysis, AI verdict, or shareable URL. Best for: buyers who specifically need the title register only and can read it.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£4.99, HomeBuyerCheck Premium (cheapest combined check)</h3>
          <p className="mt-2">
            The cheapest UK product that combines all the major data sources with AI analysis. Full ground-risk panel, ownership (UK + overseas via CCOD/OCOD), Companies House owner check, BSR HRB, tribunal history, AI buyer&apos;s verdict + 8-12 bespoke seller questions. Permanent shareable URL.{" "}
            <Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline">See a sample Premium report</Link>.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£6.99, HomeBuyerCheck Premium+</h3>
          <p className="mt-2">
            Adds three AI audience-specific briefs (Solicitor / Surveyor / Mortgage broker) plus an on-demand Negotiation Report. Buyers routinely save £3,000-£15,000 with grounded data-backed offer letters rather than offering blind.{" "}
            <Link href="/sample-plus" className="text-blue-700 underline-offset-2 hover:underline">See a sample Premium+ report</Link>.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£19.99, CheckMyFile property report</h3>
          <p className="mt-2">
            Credit-style address file. Includes sales and flood data. Doesn&apos;t include: ownership flag, Companies House owner check, BSR HRB register, tribunal history, ground-risk bands beyond surface flood, or AI analysis. 4x the price of HomeBuyerCheck Premium for less data.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£85-£250, Local authority CON29 search</h3>
          <p className="mt-2">
            Council-issued search covering planning, road, contaminated-land enquiries. <strong>Only available after you instruct a solicitor</strong>, you can&apos;t order one yourself before agreeing the purchase. Run HomeBuyerCheck first, decide whether to proceed, then your solicitor orders the CON29.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£250-£450, Solicitor full conveyancing search pack</h3>
          <p className="mt-2">
            LLC1 + CON29 + drainage + environmental searches. Again, only after instruction. Total conveyancing including these searches is typically £1,000-£1,500. Use HomeBuyerCheck&apos;s £6.99 Premium+ AI Solicitor brief to give your conveyancer a focused starting point and skip the first round of generic enquiries.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">£400-£1,500, RICS HomeBuyer / Building Survey</h3>
          <p className="mt-2">
            Physical inspection by a chartered surveyor. Different category, covers building condition not legal/title/data flags. <Link href="/blog/cheapest-homebuyer-report-online" className="text-blue-700 underline-offset-2 hover:underline">Read our HomeBuyer report comparison</Link>.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Why HomeBuyerCheck Premium is the rational choice at £4.99</h2>
          <p className="mt-3">
            A UK home buyer typically spends £1,000-£1,500 on conveyancing, £400-£1,500 on a survey, £85-£250 on the CON29, and £200-£400 on additional searches, total £1,685-£3,650 of due-diligence cost. <strong>Roughly 1 in 3 UK property transactions falls through</strong> (Quick Move Now data). When that happens, the buyer typically loses £400-£800 in non-refundable search and survey fees.
          </p>
          <p className="mt-3">
            HomeBuyerCheck&apos;s £4.99 / £6.99 reports happen BEFORE any of that. They&apos;re designed to (a) catch the obvious deal-breakers (overseas owner, BSR HRB without EWS1, ground risk band 4+, tribunal-active building) so you don&apos;t commit to the conveyancing spend, and (b) give you the leverage to renegotiate the asking price 1-3% (£3,000-£15,000) before exchange.
          </p>
          <p className="mt-3">
            On a £400,000 purchase, the Premium+ Negotiation Report&apos;s typical 1-3% saving is £4,000-£12,000, a 600-1,700x return on the £6.99 product cost.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {FAQ.map((q) => (
              <div key={q.question}>
                <dt className="font-bold text-slate-900">{q.question}</dt>
                <dd className="mt-1.5">{q.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold text-slate-900">Start with the free postcode check</p>
            <p className="mt-1 text-sm text-slate-600">See the free data first, then decide whether to upgrade to the £4.99 Premium report.</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">Full HomeBuyerCheck vs competitors comparison table</Link></li>
              <li><Link href="/blog/cheapest-homebuyer-report-online" className="text-blue-700 underline-offset-2 hover:underline">Cheapest HomeBuyer report online, ranked</Link></li>
              <li><Link href="/blog/best-checkmyfile-alternative-uk" className="text-blue-700 underline-offset-2 hover:underline">Best CheckMyFile alternative in the UK</Link></li>
              <li><Link href="/blog/property-check-before-buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Property check before buying a UK house</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Buying a house in the UK · step-by-step</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
