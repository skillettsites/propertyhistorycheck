import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { CompetitorTable, FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/best-checkmyfile-alternative-uk`;

export const metadata = {
  title: "Best CheckMyFile property report alternative · HomeBuyerCheck £4.99 vs £19.99 (UK 2026)",
  description:
    "CheckMyFile's property report is £19.99 and covers sales + flood. HomeBuyerCheck at £4.99 includes the same plus ownership flag, Companies House owner check, BSR Higher-Risk Building register, Property Chamber tribunal history, full ground-risk panel and AI buyer's verdict. £6.99 Premium+ adds three AI briefs. 4x cheaper for materially more data.",
  alternates: { canonical: "/blog/best-checkmyfile-alternative-uk" },
};

const FAQ: FaqItem[] = [
  {
    question: "What is the best CheckMyFile property report alternative in the UK?",
    answer:
      "HomeBuyerCheck at £4.99 (Premium tier) is the best CheckMyFile alternative, it's 4x cheaper and includes data CheckMyFile doesn't: ownership flag (HMLR CCOD/OCOD), Companies House owner check, BSR Higher-Risk Building register status, Property Chamber tribunal decision history, full British Geological Survey ground-risk panel (radon, shrink-swell, landslide, coal), and an AI buyer's verdict with 8-12 tailored seller questions. The £6.99 Premium+ tier adds AI Solicitor / Surveyor / Mortgage broker briefs.",
  },
  {
    question: "Is CheckMyFile worth £19.99 for a property report?",
    answer:
      "CheckMyFile's strengths are its consumer brand recognition and its credit-style report format. The £19.99 price gets you sales history and flood data, both available in HomeBuyerCheck's free tier and the £4.99 Premium tier respectively. If you're researching a UK property purchase, the £4.99 HomeBuyerCheck Premium tier covers materially more ground for materially less money.",
  },
  {
    question: "What does HomeBuyerCheck include that CheckMyFile doesn't?",
    answer:
      "Ownership flag (UK + overseas, via live HMLR CCOD/OCOD lookups); Companies House proprietor check (outstanding charges, insolvency cases, disqualified directors matched on name); BSR Higher-Risk Building register status (post-Grenfell cladding regime, lender-critical); First-tier Tribunal Property Chamber decision history at the building or postcode (leasehold disputes, EWS1 cases, service charges); British Geological Survey ground stability bands; Coal Authority mining reporting areas; planning constraints (Article 4, TPO, conservation areas, listed buildings, AONB); Anthropic Claude AI buyer's verdict + bespoke seller-question pack tailored to the property's actual flags.",
  },
  {
    question: "Why is HomeBuyerCheck 4x cheaper than CheckMyFile?",
    answer:
      "Three structural reasons. (1) Every data source is UK government open data under the Open Government Licence v3.0, no per-search resale fees. (2) AI analysis runs on Anthropic Claude at sub-15p per report. (3) Delivery is instant online with a permanent shareable URL, no PDF production, no manual review. That keeps the gross margin at ~94% which lets us price at £4.99 and still invest in adding data sources.",
  },
  {
    question: "Is HomeBuyerCheck regulated like CheckMyFile?",
    answer:
      "Neither HomeBuyerCheck nor CheckMyFile's property report is a regulated financial product. Both are informational. CheckMyFile is a credit reference agency for credit reports, but its property report is a separate consumer product. HomeBuyerCheck is informational only, it surfaces public-record data with AI analysis to help buyers decide whether to commission formal regulated services (solicitor conveyancing, RICS survey).",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="Best CheckMyFile property alternative UK" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Comparison · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Best CheckMyFile alternative · HomeBuyerCheck £4.99 vs £19.99
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>HomeBuyerCheck Premium at £4.99 is the best CheckMyFile property report alternative in the UK.</strong>{" "}
              At a quarter of CheckMyFile&apos;s £19.99 price it adds: ownership flag (UK + overseas), Companies House owner check (insolvency, outstanding charges, disqualified directors), BSR Higher-Risk Building register status, Property Chamber tribunal history, full British Geological Survey ground-risk panel, and AI buyer&apos;s verdict + tailored seller-question pack. The £6.99 Premium+ tier adds three AI briefs (Solicitor / Surveyor / Mortgage) and an on-demand Negotiation Report.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Try the free check first, 30 seconds, no card.</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Side-by-side: HomeBuyerCheck vs CheckMyFile</h2>
          <CompetitorTable />

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Three reasons buyers switch from CheckMyFile to HomeBuyerCheck</h2>

          <h3 className="mt-6 text-lg font-bold text-slate-900">1. The ownership and Companies House data is the deal-breaker</h3>
          <p className="mt-2">
            CheckMyFile doesn&apos;t show you whether the registered proprietor is an offshore company. HomeBuyerCheck&apos;s £4.99 Premium tier runs a live match against HM Land Registry&apos;s CCOD (UK Companies Ownership Data) and OCOD (Overseas Companies Ownership Data) registers, both ingested fresh into our database. If the property is owned by Jersey-registered Acme Properties Ltd, you&apos;ll see it before you offer. Then we check Companies House for that company: outstanding charges, insolvency cases, disqualified directors matched on name.
          </p>
          <p className="mt-2">
            That information is the difference between an offer that exchanges in 12 weeks and a chain that collapses 8 weeks in when your solicitor surfaces the same data. Catching it pre-offer is what the £4.99 buys you.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">2. BSR Higher-Risk Building register status</h3>
          <p className="mt-2">
            Post-Grenfell, any UK residential building over 18 metres or 7 storeys is on the Building Safety Regulator&apos;s register. Lenders refuse without an EWS1 A or B1 rating. CheckMyFile doesn&apos;t check this; HomeBuyerCheck does, automatically. If you&apos;re looking at a flat in any newer-build block, this is the single most important pre-offer flag.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">3. Property Chamber tribunal history</h3>
          <p className="mt-2">
            The First-tier Tribunal Property Chamber publishes every leasehold dispute decision. We ingest these daily and match them to the building or postcode you&apos;re viewing. If the block has been to tribunal over service charges in the last five years, you&apos;ll see the case reference, decision date, and category in your report. CheckMyFile doesn&apos;t include this; we do.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">The AI layer CheckMyFile doesn&apos;t have</h2>
          <p className="mt-3">
            HomeBuyerCheck&apos;s Premium tier ships an AI buyer&apos;s verdict tailored to the property&apos;s actual data + 8-12 specific seller questions. Example, on a typical UK flat with mid-band shrink-swell + a 1970s build year + service-charge increases the AI might write: <em>&quot;Was the £85k charge from Mary Dixon Ltd on 23/03/2019 ever discharged? Show the deed of release.&quot;</em> That&apos;s a real question your solicitor can adopt verbatim.
          </p>
          <p className="mt-3">
            The £6.99 Premium+ tier upgrades this to three audience-specific briefs (Solicitor brief for the conveyancer; Surveyor brief on physical inspection; Mortgage broker brief on lending friction) plus an on-demand Negotiation Report that produces a defensible offer range. None of this exists in CheckMyFile.
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
            <p className="text-sm font-bold text-slate-900">See what we surface for your specific address</p>
            <p className="mt-1 text-sm text-slate-600">Free postcode check first. Premium £4.99 if you want the full report.</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">Full HomeBuyerCheck vs competitors comparison</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
              <li><Link href="/blog/cheapest-homebuyer-report-online" className="text-blue-700 underline-offset-2 hover:underline">Cheapest HomeBuyer report online</Link></li>
              <li><Link href="/blog/property-check-before-buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Property check before buying a UK house</Link></li>
              <li><Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline">See a sample Premium £4.99 report</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
