import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/conveyancing-searches-cost-uk-2026`;

export const metadata = {
  title: "UK conveyancing search costs · 2026 breakdown · CON29, LLC1, drainage, environmental",
  description:
    "Every UK conveyancing search broken down by cost in 2026: LLC1 (£15-£35), CON29 (£85-£250), CON29DW drainage (£60-£90), environmental (£40-£70), CON29M coal (£32.40), chancel repair (£30). Plus how a £4.99 pre-offer check tells you which ones you actually need.",
  alternates: { canonical: "/blog/conveyancing-searches-cost-uk-2026" },
};

const FAQ: FaqItem[] = [
  {
    question: "How much do UK conveyancing searches cost in 2026?",
    answer:
      "The full UK conveyancing search pack costs £250-£450 in 2026: LLC1 local land charges (£15-£35), CON29 standard enquiries of the local authority (£85-£250), CON29DW drainage and water (£60-£90), environmental search (£40-£70), and CON29M coal mining if applicable (£32.40). On top of those, the solicitor charges £1,000-£1,500 for the conveyancing work itself.",
  },
  {
    question: "Can I order conveyancing searches without a solicitor?",
    answer:
      "Some can be ordered direct (LLC1 from the local council, CON29DW from your water company, CON29M from the Coal Authority). Most buyers go through their conveyancer because the solicitor coordinates the pack and reviews the results. Running a £4.99 HomeBuyerCheck Premium report BEFORE instructing the solicitor tells you whether you need each search at all (e.g. if you're nowhere near a coal mining area, you can skip the CON29M).",
  },
  {
    question: "What is the difference between LLC1 and CON29?",
    answer:
      "LLC1 (Local Land Charges) is a list of registered charges on the property — planning enforcement notices, financial charges, conservation area designations, listed-building status. It's a binary 'is X registered against this property' search. CON29 (Standard Enquiries) asks the local authority's planning and highways departments specific questions — pending planning applications, road schemes, contaminated land notices. They complement each other; conveyancers order both.",
  },
  {
    question: "What is a CON29M search and when do I need it?",
    answer:
      "CON29M is the Coal Authority's mining search. It tells you whether the property is in a coal mining reporting area, and if so whether there are recorded mine entries, shafts, or subsidence claims. It costs £32.40. You need it if HomeBuyerCheck's £4.99 Premium tier flags the property as being in a coal reporting area (we use the Coal Authority's published map) — about 8% of UK addresses. If you're not in a reporting area, your solicitor will skip this search.",
  },
  {
    question: "Are conveyancing searches refundable if my purchase falls through?",
    answer:
      "No. Once searches are ordered, fees are non-refundable. If your purchase falls through after the searches are returned, you lose £250-£450. This is one of the main reasons buyers run pre-offer due diligence: a £4.99 HomeBuyerCheck report can surface the deal-breakers (overseas owner, BSR HRB without EWS1, ground risk band 5, Flood Zone 3 with no insurance) before you spend £250-£450 on formal searches.",
  },
  {
    question: "Does HomeBuyerCheck replace the formal conveyancing searches?",
    answer:
      "No. Formal CON29 / LLC1 / drainage / environmental searches are required by your lender and provide regulated legal protection. HomeBuyerCheck is informational and sits BEFORE the formal search stage. Its job is to help you decide whether to proceed (and therefore whether to spend the £250-£450) and to give your conveyancer a targeted starting point via the £6.99 Premium+ AI Solicitor brief.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="UK conveyancing search costs 2026" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Cost guide · updated 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              UK conveyancing searches cost · 2026 breakdown
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>UK conveyancing searches cost £250-£450 total in 2026,</strong>{" "}
              broken down into LLC1 (£15-£35), CON29 (£85-£250), drainage and water CON29DW (£60-£90), environmental search (£40-£70), and CON29M coal mining where applicable (£32.40). On top, conveyancing fees are £1,000-£1,500. Running a £4.99 HomeBuyerCheck Premium report BEFORE you instruct tells you which searches are actually relevant for the property — saving you from buying searches that don&apos;t apply.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Run the free pre-offer check first</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Every UK conveyancing search · cost + what it covers</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-bold text-slate-900">Search</th>
                  <th className="text-left p-3 font-bold text-slate-900">Cost</th>
                  <th className="text-left p-3 font-bold text-slate-900">What it checks</th>
                  <th className="text-left p-3 font-bold text-slate-900">When required</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">LLC1 (Local Land Charges)</td>
                  <td className="p-3 font-bold">£15-£35</td>
                  <td className="p-3">Registered charges, planning enforcement, conservation area, listed status</td>
                  <td className="p-3">Always</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">CON29 (Standard Enquiries)</td>
                  <td className="p-3 font-bold">£85-£250</td>
                  <td className="p-3">Planning applications, road schemes, contaminated land notices, public rights of way</td>
                  <td className="p-3">Always</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">CON29DW (Drainage + Water)</td>
                  <td className="p-3 font-bold">£60-£90</td>
                  <td className="p-3">Foul drainage connection, surface water drainage, public sewer location</td>
                  <td className="p-3">Always (water company)</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Environmental search</td>
                  <td className="p-3 font-bold">£40-£70</td>
                  <td className="p-3">Contaminated land, landfill, radon, flood, ground stability, mining</td>
                  <td className="p-3">Always</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">CON29M (Coal Mining)</td>
                  <td className="p-3 font-bold">£32.40</td>
                  <td className="p-3">Coal mining reporting areas, mine entries, shafts, subsidence history</td>
                  <td className="p-3">If in coal area (~8% of UK)</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Chancel Repair Liability</td>
                  <td className="p-3 font-bold">£15-£30</td>
                  <td className="p-3">Whether the property is liable to contribute to church chancel repairs</td>
                  <td className="p-3">Most solicitors</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">Tin / Brine / Limestone</td>
                  <td className="p-3 font-bold">£25-£60</td>
                  <td className="p-3">Non-coal mining searches in Cornwall, Cheshire, Derbyshire</td>
                  <td className="p-3">If in mining area</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold">LPE1 (Leasehold Property Enquiries)</td>
                  <td className="p-3 font-bold">£100-£400</td>
                  <td className="p-3">Service charge accounts, ground rent, sinking fund, Section 20 notices</td>
                  <td className="p-3">All leasehold purchases</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 bg-emerald-50">HomeBuyerCheck Premium (pre-offer)</td>
                  <td className="p-3 font-bold bg-emerald-50">£4.99</td>
                  <td className="p-3 bg-emerald-50">Ownership, ground risk, flood + climate, BSR HRB, tribunal, AI verdict — covers most environmental + heritage flags</td>
                  <td className="p-3 bg-emerald-50">Before offer</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">How a £4.99 pre-offer check changes the £250-£450 search spend</h2>
          <p className="mt-3">
            HomeBuyerCheck&apos;s £4.99 Premium tier flags which formal searches are likely to throw up findings. If we tell you the property is in a coal mining reporting area, the £32.40 CON29M is worth ordering. If we flag a high flood zone, the £40-£70 environmental search is critical. If the property is leasehold with tribunal history, the £100-£400 LPE1 is the most important spend.
          </p>
          <p className="mt-3">
            Conversely: if the £4.99 report flags an unmortgageable building (BSR HRB without EWS1; overseas company owner without ROE compliance; Flood Zone 3 with no insurance availability), you can walk away before spending £250-£450 on the search pack PLUS £1,000-£1,500 on the conveyancing.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Premium+ at £6.99 adds the AI Solicitor brief</h2>
          <p className="mt-3">
            The £6.99 Premium+ tier ships an AI-generated Solicitor brief: TA6-style pre-exchange enquiries formatted for your conveyancer to adopt. Buyers typically save 1-2 rounds of email back-and-forth with their solicitor by forwarding the brief as soon as they instruct. Your solicitor still runs all the formal searches; the brief targets which questions to add to the file.{" "}
            <Link href="/sample-solicitor" className="text-blue-700 underline-offset-2 hover:underline">See a sample AI Solicitor brief</Link>.
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
            <p className="text-sm font-bold text-slate-900">Run the £4.99 check before you commit to £1,500 of conveyancing</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs all UK property checks · comparison table</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
              <li><Link href="/blog/title-register-download-cost-uk" className="text-blue-700 underline-offset-2 hover:underline">UK title register download cost</Link></li>
              <li><Link href="/blog/property-due-diligence-cost-uk" className="text-blue-700 underline-offset-2 hover:underline">Total UK property due-diligence cost · 2026</Link></li>
              <li><Link href="/guides/conveyancing-explained" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing explained · what your solicitor actually does</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
