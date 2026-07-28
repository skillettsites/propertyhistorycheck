import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/property-due-diligence-cost-uk`;

export const metadata = {
  title: "UK property due diligence cost · 2026 full breakdown (£0-£3,650)",
  description:
    "The full UK pre-purchase due-diligence cost ladder in 2026, from free pre-offer checks (£0) and HomeBuyerCheck Premium (£4.99) to RICS surveys (£400-£1,500) and full conveyancing (£1,000-£1,500). What you actually need at each step, and what you can safely skip.",
  alternates: { canonical: "/blog/property-due-diligence-cost-uk" },
};

const FAQ: FaqItem[] = [
  {
    question: "What is the total cost of due diligence on a UK property purchase?",
    answer:
      "£1,685-£3,650 from offer to exchange in 2026: £4.99-£6.99 for a pre-offer HomeBuyerCheck (optional but recommended); £400-£1,500 for a RICS survey; £250-£450 for conveyancing searches (LLC1, CON29, drainage, environmental, CON29M if applicable); £1,000-£1,500 for conveyancing fees; £30-£300 for the lender's mortgage valuation. Excludes stamp duty (typically 0-12% of purchase price separately).",
  },
  {
    question: "Which due-diligence costs are refundable if the purchase falls through?",
    answer:
      "Almost none. Search fees (£250-£450), survey fees (£400-£1,500), and conveyancer disbursements are non-refundable once incurred. The conveyancer's legal fees are typically pro-rated to the work done at fall-through, so you pay £200-£600 depending on how far through the process you were. About 1 in 3 UK transactions falls through, running £4.99 pre-offer due diligence is the cheapest insurance against losing £400-£1,500 at week 8.",
  },
  {
    question: "What's the minimum I can spend on property due diligence in the UK?",
    answer:
      "£0, UK government open data is free at HomeBuyerCheck's free tier (sales history, EPC, flood, crime, schools, council tax). But you'll still need a solicitor (£1,000-£1,500 + £250-£450 searches) to actually buy the property; you can't skip that. The realistic minimum from offer-to-keys is ~£1,500 in pure due-diligence costs, on top of stamp duty and deposit.",
  },
  {
    question: "Is the £4.99 HomeBuyerCheck the cheapest first step?",
    answer:
      "Yes among paid options. The free tier (£0) is cheaper still and covers the basics. The £4.99 Premium tier is the cheapest paid product that adds ownership, ground risk, BSR Higher-Risk Building, Companies House, tribunal history and AI analysis. The next-cheapest comparable consumer product is CheckMyFile at £19.99 (4x the price) which doesn't include the BSR / tribunal / ownership / Companies House layers.",
  },
  {
    question: "Which due-diligence costs can I actually skip?",
    answer:
      "Few. The mortgage lender's valuation is often free or included with the application. Some chancel repair searches (£15-£30) and tin/brine searches (£25-£60) are only needed in specific regions, HomeBuyerCheck's £4.99 Premium tier flags which apply. The full Level 2 or Level 3 survey is occasionally skippable on newer-build properties under 10 years old with NHBC cover, replaced by the lender's standard valuation. Everything else (CON29, drainage, environmental, conveyancing) is required by your lender.",
  },
  {
    question: "How do I get the best value from £1,500 of conveyancing?",
    answer:
      "Run the £6.99 Premium+ HomeBuyerCheck and forward the AI Solicitor brief to your conveyancer when you instruct. It's a one-page TA6-style document with pre-exchange enquiries specific to your property's flags. Saves 1-2 rounds of generic email back-and-forth, lets your conveyancer focus on the items that matter (overseas owner, BSR HRB, tribunal history, ground risk), and typically returns conveyancing 2-3 weeks faster.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="UK property due diligence cost 2026" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Cost ladder · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              UK property due diligence cost · 2026 full breakdown
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>Total UK property due-diligence cost: £1,685-£3,650 from offer to exchange in 2026.</strong>{" "}
              That breaks down into £4.99-£6.99 for a pre-offer HomeBuyerCheck (optional), £400-£1,500 for a RICS survey, £250-£450 for conveyancing searches, and £1,000-£1,500 for conveyancing fees. Stamp duty + deposit are separate. The single best ROI in that stack is the £4.99 pre-offer check, because about 1 in 3 UK transactions falls through and the average loss is £400-£800 in non-refundable fees.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Start with the free check</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Full UK due-diligence cost ladder · 2026</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-bold text-slate-900">Stage</th>
                  <th className="text-left p-3 font-bold text-slate-900">Cost</th>
                  <th className="text-left p-3 font-bold text-slate-900">When</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-900">HomeBuyerCheck (free)</td>
                  <td className="p-3 font-bold">£0</td>
                  <td className="p-3">Before viewing</td>
                </tr>
                <tr className="border-b border-slate-100 bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-900">HomeBuyerCheck Premium</td>
                  <td className="p-3 font-bold">£4.99</td>
                  <td className="p-3">Pre-offer</td>
                </tr>
                <tr className="border-b border-slate-100 bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-900">HomeBuyerCheck Premium+</td>
                  <td className="p-3 font-bold">£6.99</td>
                  <td className="p-3">Pre-offer + during conveyancing</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">HMLR title register download</td>
                  <td className="p-3 font-bold">£7-£14</td>
                  <td className="p-3">Optional pre-offer</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Mortgage AiP</td>
                  <td className="p-3 font-bold">£0</td>
                  <td className="p-3">Pre-offer</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Mortgage lender valuation</td>
                  <td className="p-3 font-bold">£0-£300</td>
                  <td className="p-3">After mortgage application</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RICS Level 2 HomeBuyer survey</td>
                  <td className="p-3 font-bold">£400-£900</td>
                  <td className="p-3">Post-offer</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">RICS Level 3 Building survey</td>
                  <td className="p-3 font-bold">£600-£1,500</td>
                  <td className="p-3">Post-offer (pre-1930 / listed / extended)</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Conveyancing search pack</td>
                  <td className="p-3 font-bold">£250-£450</td>
                  <td className="p-3">After instruction</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Conveyancing legal fees</td>
                  <td className="p-3 font-bold">£1,000-£1,500</td>
                  <td className="p-3">Offer to completion</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Where the £1,685-£3,650 goes</h2>
          <p className="mt-3">
            On a typical £350,000 UK property purchase in 2026:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc pl-5">
            <li><strong>£6.99</strong>, HomeBuyerCheck Premium+ pre-offer due diligence (recommended).</li>
            <li><strong>£550</strong>, RICS Level 2 HomeBuyer survey (midpoint).</li>
            <li><strong>£350</strong>, full conveyancing search pack (LLC1 + CON29 + drainage + environmental).</li>
            <li><strong>£1,250</strong>, conveyancing fees including VAT (midpoint).</li>
            <li><strong>£0</strong>, mortgage lender valuation (most fee-free in 2026).</li>
            <li><strong>~£2,156 total due-diligence spend</strong>, excluding stamp duty (£7,500 at 2-5% on £350k) and deposit.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">The single biggest ROI in that stack</h2>
          <p className="mt-3">
            HomeBuyerCheck Premium+ at £6.99. Two reasons.
          </p>
          <p className="mt-3">
            <strong>(1) Avoiding fall-through losses.</strong> About 1 in 3 UK transactions falls through, with the buyer typically losing £400-£800 in non-refundable fees. The £6.99 check catches the deal-breakers BEFORE you commit to that spend: overseas company owner without ROE compliance, BSR HRB without EWS1, Flood Zone 3 with no insurance availability, tribunal-active leasehold building, ground-risk band 5. Expected value of avoiding a fall-through is roughly £150-£250 even at 30% base rate.
          </p>
          <p className="mt-3">
            <strong>(2) Renegotiation leverage.</strong> The Premium+ Negotiation Report typically helps a buyer save 1-3% off the asking price using documented flags. On a £350,000 property, that&apos;s £3,500-£10,500. A 500-1,500x return on the £6.99 product cost.
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
            <p className="text-sm font-bold text-slate-900">Start with the free check before you spend £1,500 of conveyancing</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs all UK property checks · comparison</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026</Link></li>
              <li><Link href="/blog/title-register-download-cost-uk" className="text-blue-700 underline-offset-2 hover:underline">UK title register download cost</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Buying a house in the UK · step-by-step</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
