import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/cheapest-homebuyer-report-online`;

export const metadata = {
  title: "Cheapest HomeBuyer report online · UK 2026 alternatives ranked",
  description:
    "A full RICS HomeBuyer (Level 2) survey costs £400-£900. Most issues that derail a UK purchase aren't structural — they're title, ownership, ground risk and lender friction. HomeBuyerCheck at £4.99 / £6.99 covers what you actually need to know before commissioning a survey. Full comparison.",
  alternates: { canonical: "/blog/cheapest-homebuyer-report-online" },
};

const FAQ: FaqItem[] = [
  {
    question: "What is the cheapest HomeBuyer report online?",
    answer:
      "A formal RICS Level 2 HomeBuyer Report by a chartered surveyor costs £400-£900 in 2026 and is a physical inspection of the building. The cheapest online property due-diligence report — HomeBuyerCheck Premium at £4.99 — is a different category that covers title, ownership, ground risk, flood, BSR Higher-Risk Building register, Property Chamber tribunal history and AI analysis. Most buyers run HomeBuyerCheck first (£4.99) to decide whether to commission the survey at all.",
  },
  {
    question: "Can I skip the RICS survey if I have a HomeBuyerCheck report?",
    answer:
      "No. The two are complementary. HomeBuyerCheck covers the data flags (title, ownership, ground risk, flood, BSR, tribunal); the RICS survey covers the physical condition (cracks, damp, roof, electrics, structural). For pre-1930 properties, listed buildings, anything extended or unusual, you should still commission a Level 3 Building Survey (£600-£1,500). HomeBuyerCheck's £6.99 Premium+ tier includes an AI Surveyor brief that tells your surveyor exactly what to look for at THIS property — preventing a generic survey that misses the local-specific issues.",
  },
  {
    question: "Is a Level 2 HomeBuyer Report cheaper than a Level 3 Building Survey?",
    answer:
      "Yes. Level 2 (HomeBuyer Report) is £400-£900 for standard modern properties. Level 3 (Building Survey) is £600-£1,500 for older, listed, extended or unusual properties. Anything pre-1930 or with non-standard construction is genuinely worth the Level 3 uplift. The choice is structural, not financial.",
  },
  {
    question: "When should I commission the RICS survey in the buying process?",
    answer:
      "After your offer is accepted, before the solicitor's searches return. Standard UK order: (1) free check / £4.99 Premium HomeBuyerCheck pre-offer, (2) offer + acceptance, (3) commission survey + instruct solicitor in parallel, (4) review survey + search results, (5) renegotiate or proceed to exchange. The HomeBuyerCheck reports at stages (1) and (3) feed the solicitor and surveyor with targeted enquiries via the Premium+ AI briefs.",
  },
  {
    question: "What does a £400 HomeBuyer Report actually include?",
    answer:
      "A RICS Level 2 covers: external condition (roof, walls, chimneys, gutters), internal condition (floors, ceilings, walls, joinery), services (heating, electrics, plumbing, drainage) at visual-inspection level, damp, woodworm, energy efficiency, and a market valuation. It does NOT cover: title flags, ownership status, ground risk beyond visible cracks, planning history, BSR Higher-Risk Building register, or tribunal history. HomeBuyerCheck's £4.99 Premium tier covers all those.",
  },
  {
    question: "How do I save money on the RICS survey?",
    answer:
      "Three ways. (1) Compare 3 local RICS surveyors — prices vary 30-50% for the same property. (2) Provide them with the HomeBuyerCheck £6.99 Premium+ AI Surveyor brief so they don't waste inspection time on flags you already know. (3) Use the Level 2 not Level 3 only if the property is post-1930, not listed, not extended — otherwise the Level 3 is cheaper than the cost of missing a problem.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="Cheapest HomeBuyer report online UK" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Buyer&apos;s guide · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Cheapest HomeBuyer report online · UK 2026
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>A formal RICS HomeBuyer Report (Level 2) costs £400-£900 in the UK.</strong>{" "}
              That&apos;s for a chartered surveyor&apos;s physical inspection. If you&apos;re searching for the cheapest pre-offer property check that covers ownership, title, ground risk, flood, BSR Higher-Risk Building register, Property Chamber tribunal history and lender friction — that&apos;s HomeBuyerCheck at £4.99 (Premium) or £6.99 (Premium+ with AI Solicitor / Surveyor / Mortgage briefs). The two products complement each other; you typically run HomeBuyerCheck first and decide whether to commit to the survey.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Run the free check first — 30 seconds, no card.</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">UK HomeBuyer report cost ladder · 2026</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-bold text-slate-900">Product</th>
                  <th className="text-left p-3 font-bold text-slate-900">Cost</th>
                  <th className="text-left p-3 font-bold text-slate-900">Covers</th>
                  <th className="text-left p-3 font-bold text-slate-900">When</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-900">HomeBuyerCheck Premium</td>
                  <td className="p-3 font-bold text-slate-900">£4.99</td>
                  <td className="p-3">Title, ownership, ground risk, flood, BSR HRB, tribunal, AI verdict</td>
                  <td className="p-3">Pre-offer</td>
                </tr>
                <tr className="border-b border-slate-100 bg-emerald-50">
                  <td className="p-3 font-bold text-emerald-900">HomeBuyerCheck Premium+</td>
                  <td className="p-3 font-bold text-slate-900">£6.99</td>
                  <td className="p-3">Premium + AI Solicitor / Surveyor / Mortgage briefs + Negotiation Report</td>
                  <td className="p-3">Pre-offer + during conveyancing</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">Mortgage lender valuation</td>
                  <td className="p-3 font-bold text-slate-900">£0-£300</td>
                  <td className="p-3">Lender&apos;s own market-value check. Not a survey.</td>
                  <td className="p-3">After mortgage application</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">RICS Level 1 Condition Report</td>
                  <td className="p-3 font-bold text-slate-900">£300-£500</td>
                  <td className="p-3">Traffic-light overview, no advice. Newer properties only.</td>
                  <td className="p-3">Post-offer</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-semibold text-slate-900">RICS Level 2 HomeBuyer Report</td>
                  <td className="p-3 font-bold text-slate-900">£400-£900</td>
                  <td className="p-3">Visual inspection, traffic-light condition, advice, valuation</td>
                  <td className="p-3">Post-offer</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">RICS Level 3 Building Survey</td>
                  <td className="p-3 font-bold text-slate-900">£600-£1,500</td>
                  <td className="p-3">Detailed inspection, pre-1930 / listed / extended / non-standard</td>
                  <td className="p-3">Post-offer</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Why HomeBuyerCheck and a RICS survey are not substitutes</h2>
          <p className="mt-3">
            They cover different categories. HomeBuyerCheck is data: title, ownership, planning, ground risk, flood, BSR HRB, tribunal history, Companies House — every piece of recorded information about the property and its owner. RICS surveys are physical: cracks, damp, roof tiles, electrics, structural integrity — what a chartered surveyor sees walking through the property.
          </p>
          <p className="mt-3">
            About 70% of issues that derail a UK property purchase fall into the data category, not the physical category. Ownership traps, BSR-unmortgageable flats, tribunal-active leasehold buildings, flood-zone insurance refusals — none of these need a surveyor to find them. They need the data check. <Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline">See what HomeBuyerCheck Premium surfaces</Link>.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">When to commission the £400+ RICS survey</h2>
          <p className="mt-3">
            After your offer is accepted, before the solicitor&apos;s formal searches return. Run HomeBuyerCheck at the pre-offer stage (£4.99 or £6.99 Premium+) — if the data check throws up unmortgageable flags (overseas owner without ROE compliance, BSR HRB without EWS1, Flood Zone 3 with no insurance availability), don&apos;t waste £400-£900 on a survey. Walk away or renegotiate first.
          </p>
          <p className="mt-3">
            If the data check is clean, commission the RICS survey. If you have HomeBuyerCheck Premium+ (£6.99), forward the AI Surveyor brief to your surveyor — it tells them what to focus on (e.g. &quot;shrink-swell band 4 means look for diagonal cracking at corner returns&quot;, &quot;coal mining reporting area means check basement floor levels&quot;). Targeted surveys catch more.
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
            <p className="text-sm font-bold text-slate-900">Start with the free check</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs all UK property checks · full comparison</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
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
