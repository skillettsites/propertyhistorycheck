import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { CompetitorTable, FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";

export const metadata = {
  title: "UK property check comparison · HomeBuyerCheck vs CheckMyFile, HMLR & solicitor searches",
  description:
    "Side-by-side comparison of every UK pre-offer property due-diligence option in 2026. HomeBuyerCheck at £4.99 / £6.99 vs CheckMyFile (£19.99), HMLR direct (£7 + no analysis), solicitor searches (£250-£450) and RICS surveys (£400-£900). What each one actually includes, by feature.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "UK property check comparison · cheapest options ranked",
    description:
      "Every UK pre-offer property check compared on price, data sources and AI analysis. HomeBuyerCheck £4.99 is the cheapest with 20+ data sources.",
  },
};

const FAQ: FaqItem[] = [
  {
    question: "What is the cheapest UK property check before making an offer?",
    answer:
      "HomeBuyerCheck at £4.99 (Premium tier) is the cheapest all-in-one UK property check that combines 20+ official data sources with AI analysis. Premium+ at £6.99 adds three AI-generated audience-specific briefs (Solicitor, Surveyor, Mortgage broker) plus an on-demand Negotiation Report. The next-cheapest comparable consumer product is CheckMyFile at £19.99, which doesn't include ground-risk bands, Companies House ownership, BSR Higher-Risk Building register, or AI analysis.",
  },
  {
    question: "What does HomeBuyerCheck include that competitors don't?",
    answer:
      "HomeBuyerCheck is the only UK consumer property check that combines: ownership flag (UK + overseas via HMLR CCOD/OCOD); Companies House owner check (insolvency, outstanding charges, disqualified directors); BSR Higher-Risk Building register status (post-Grenfell cladding regime); First-tier Tribunal Property Chamber decision history at the building or postcode; British Geological Survey ground stability bands (radon, shrink-swell, landslide, coal); and AI-generated buyer's verdict + tailored seller-question pack. Premium+ adds three AI briefs your conveyancer, surveyor and mortgage broker can use directly.",
  },
  {
    question: "Is HomeBuyerCheck a replacement for a solicitor or surveyor?",
    answer:
      "No. HomeBuyerCheck is informational only and sits BEFORE you instruct a solicitor (£1,000-£1,500 typical conveyancing cost) or commission a RICS survey (£400-£1,500). Its job is to help you decide whether to commit to those costs and to surface flags you can use to renegotiate the asking price 1-3% before exchange. The AI Solicitor brief is formatted as TA6-style enquiries your conveyancer can adopt; it is not legal advice and not a substitute for formal conveyancing searches.",
  },
  {
    question: "How does HomeBuyerCheck differ from a CheckMyFile property report?",
    answer:
      "CheckMyFile (£19.99) is a credit-style file for a property address. It includes some sales and flood data but doesn't include: live ownership (UK + overseas company); Companies House owner check; BSR Higher-Risk Building register; First-tier Tribunal Property Chamber history; ground-risk bands beyond surface flood; or any AI analysis. HomeBuyerCheck at £4.99 covers all of those, plus the AI buyer's verdict and seller-question pack. The £6.99 Premium+ tier adds the three AI briefs.",
  },
  {
    question: "Why is HomeBuyerCheck cheaper than everyone else?",
    answer:
      "HomeBuyerCheck runs entirely on UK government open data (Open Government Licence v3.0) plus Anthropic Claude for the AI analysis. There are no per-search resale licences or PropertyData reseller fees in the £4.99 / £6.99 price. Competitors who include similar data either: (a) sell to solicitors / developers at higher prices because they pay per-document licensing, or (b) restrict the data to keep their consumer price competitive. HomeBuyerCheck includes the full government open data stack at consumer pricing.",
  },
  {
    question: "How accurate is the data?",
    answer:
      "All data is sourced live from official UK government APIs at the moment of purchase: HM Land Registry (sales history + CCOD + OCOD ownership), Environment Agency (flood + climate-projected), Police.uk (crime, 12-month rolling), GIAS / Ofsted (schools), Valuation Office Agency (council tax), Ofcom (broadband + mobile), British Geological Survey (ground risk), Coal Authority, Historic England (listed buildings), planning.data.gov.uk (planning constraints), Companies House (proprietor company), Building Safety Regulator, and First-tier Tribunal Property Chamber. The AI analysis uses Anthropic Claude grounded on the data, it summarises, it does not invent.",
  },
  {
    question: "Can I see a sample report before paying?",
    answer:
      "Yes. The free postcode-level check is instant and unlocks the data overview. Sample Premium and Premium+ reports are at /sample and /sample-plus respectively, with the Solicitor, Surveyor, Mortgage and Negotiation samples linked from there.",
  },
];

export default function ComparePage() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema
        url={`${SITE}/compare`}
        headline="UK property check comparison, HomeBuyerCheck vs competitors"
        selectors={["#tldr", ".speakable-summary"]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-4xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Comparison · updated 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              UK property check comparison, HomeBuyerCheck vs CheckMyFile, HMLR & solicitor searches
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed text-slate-700">
              <strong>HomeBuyerCheck at £4.99 (Premium) and £6.99 (Premium+) is the cheapest UK pre-offer property check.</strong>{" "}
              It combines 20+ official UK government data sources with AI analysis at a price no other consumer product matches. CheckMyFile (£19.99) is the next-cheapest comparable; HMLR title download direct is £7 but ships zero analysis; solicitor conveyancing searches are £250-£450 and only happen after you instruct (paying £1,000-£1,500); a RICS HomeBuyer survey is £400-£900 and a different category entirely.
            </p>
          </header>

          <CompetitorTable />

          <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Run a free check on the property you&apos;re viewing, 30 seconds, no card.</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-12 text-2xl font-bold text-slate-900">What the £4.99 Premium tier actually buys you</h2>
          <p className="mt-3">
            Most UK property checks under £20 are sales-history-plus-flood and stop there. HomeBuyerCheck&apos;s £4.99 Premium tier adds the data points buyers actually need to renegotiate or walk away:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc pl-5">
            <li><strong>Ownership flag</strong>, HMLR CCOD/OCOD live match. Tells you instantly if the registered proprietor is a UK company or an overseas entity (a serious solicitor flag).</li>
            <li><strong>Companies House owner check</strong>, outstanding charges on the company, insolvency cases, disqualified directors. If the seller is a corporate entity, this catches problems your conveyancer will spot a month into the process.</li>
            <li><strong>BSR Higher-Risk Building register</strong>, post-Grenfell cladding regime status. Lenders refuse without an EWS1 A or B1 rating; HomeBuyerCheck flags the HRB status before you apply for a mortgage.</li>
            <li><strong>First-tier Tribunal Property Chamber history</strong>, published decisions at the building or postcode. Service charge disputes, leasehold cases, EWS1 challenges all show up.</li>
            <li><strong>Full ground-risk panel</strong>, radon (UKHSA), coal (Coal Authority), shrink-swell + landslide (British Geological Survey), conservation areas, Article 4 directions, listed buildings (Historic England).</li>
            <li><strong>AI buyer&apos;s verdict + seller-question pack</strong>, Anthropic Claude reads every flag and writes 8-12 specific, lawyer-style questions to ask the seller. Tailored to THIS property, not a generic list.</li>
            <li><strong>Permanent shareable URL</strong>, every report is hosted at a private URL you can forward to your partner, your solicitor or your broker.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What the £6.99 Premium+ tier adds</h2>
          <p className="mt-3">Premium+ adds the audience-specific briefs that turn the data into actions you can take this week:</p>
          <ul className="mt-3 space-y-1.5 list-disc pl-5">
            <li><strong>AI Solicitor brief</strong>, TA6-style follow-up enquiries your conveyancer can adopt directly. Saves 1-2 emails and catches the obscure flags (tribunal history, overseas owner, BSR HRB).</li>
            <li><strong>AI Surveyor brief</strong>, the precise items to flag to your RICS surveyor for THIS property. Stops you paying £750 for a generic Level 2 that misses the shrink-swell band 4, coal area, or listed-building specifics.</li>
            <li><strong>AI Mortgage broker brief</strong>, the lending-friction flags (flood band high, BSR, listed, non-standard construction) so you can verify mortgageability with your broker before applying. UK chain fall-through rate on mortgage refusal is around 40%; this is what prevents it.</li>
            <li><strong>On-demand Negotiation Report</strong>, enter the asking price and we model a defensible offer range from comparable sales, Bank of England Bank Rate, Land Registry HPI for the local authority, and every risk flag found. Typical buyer saves £3,000-£15,000 with grounded, data-backed negotiation.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Why we&apos;re cheaper than everyone else</h2>
          <p className="mt-3">
            Three reasons. First, every data source is UK government open data under the Open Government Licence v3.0, there are no per-search resale fees in our price. Second, the AI analysis runs on Anthropic Claude with prompts grounded on the real data (no hallucinations); cost per report is under 15p. Third, the product is delivered instantly online, no PDFs to post, no humans to manually review, no per-search fulfilment.
          </p>
          <p className="mt-3">
            That gives us a ~94% gross margin at £4.99, which means we can keep the price low and still invest in adding data sources (ingest of full HMLR CCOD + OCOD took weeks and is free to run).
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">When you still need a solicitor and surveyor</h2>
          <p className="mt-3">
            Always. HomeBuyerCheck is informational, it tells you what you&apos;re looking at and helps you renegotiate. You still need:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc pl-5">
            <li>A solicitor to run formal CON29 + LLC1 + drainage + environmental searches and conduct the conveyance (£1,000-£1,500).</li>
            <li>A RICS-qualified surveyor for the physical inspection, Level 2 for standard properties (£400-£900), Level 3 for pre-1930, listed, extended or unusual (£600-£1,500).</li>
            <li>A mortgage broker if you&apos;re borrowing.</li>
          </ul>
          <p className="mt-3">
            HomeBuyerCheck makes those people&apos;s jobs faster, more targeted, and lets you start the process from an informed position. The AI Solicitor brief is the &quot;cheat sheet&quot; your conveyancer can use to skip the first round of generic enquiries.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {FAQ.map((q) => (
              <div key={q.question}>
                <dt className="font-bold text-slate-900">{q.question}</dt>
                <dd className="mt-1.5 text-slate-700">{q.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold text-slate-900">Ready? Start with the free postcode check.</p>
            <p className="mt-1 text-sm text-slate-600">No card. 30 seconds. Decide whether to upgrade to the £4.99 Premium report once you&apos;ve seen the free data.</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related guides</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest property check in the UK · ranked</Link></li>
              <li><Link href="/blog/cheapest-homebuyer-report-online" className="text-blue-700 underline-offset-2 hover:underline">Cheapest HomeBuyer report online · alternatives ranked</Link></li>
              <li><Link href="/blog/best-checkmyfile-alternative-uk" className="text-blue-700 underline-offset-2 hover:underline">Best CheckMyFile alternative in the UK</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026 breakdown</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Buying a house in the UK · step-by-step guide</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
