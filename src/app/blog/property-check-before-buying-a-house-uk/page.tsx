import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/property-check-before-buying-a-house-uk`;

export const metadata = {
  title: "Property check before buying a house · UK 2026 (15 things to verify before you offer)",
  description:
    "The 15 things every UK buyer should verify BEFORE making an offer in 2026 — ownership, title, ground risk, flood, BSR Higher-Risk Building register, tribunal history, planning, EPC, conveyancing cost. £4.99 covers all 15 in 30 seconds.",
  alternates: { canonical: "/blog/property-check-before-buying-a-house-uk" },
};

const FAQ: FaqItem[] = [
  {
    question: "What checks should I do on a UK house before making an offer?",
    answer:
      "Fifteen checks: (1) registered ownership (UK or overseas company); (2) outstanding charges on the proprietor; (3) sales history + last sale price vs postcode median; (4) BSR Higher-Risk Building register status; (5) EWS1 cladding status if flat; (6) flood risk zone + climate-projected 2050; (7) Bristish Geological Survey ground stability bands (radon, shrink-swell, landslide); (8) coal mining reporting area; (9) listed building status + grade; (10) conservation area + Article 4 directions; (11) Property Chamber tribunal history; (12) EPC rating + 2030 minimum compliance; (13) planning applications within 500m; (14) crime statistics; (15) council tax band + EPC potential rating. HomeBuyerCheck Premium at £4.99 covers all 15 in one report.",
  },
  {
    question: "How much should I spend on pre-offer checks?",
    answer:
      "£0-£10. The free HomeBuyerCheck postcode check covers sales history, EPC, flood band, crime, council tax, schools and broadband. The £4.99 Premium tier adds ownership, ground risk, BSR HRB, Companies House, tribunal and AI analysis. The £6.99 Premium+ tier adds three AI audience-specific briefs plus a Negotiation Report. Beyond that you're into £85+ CON29 searches (only available via solicitor) and £400+ RICS surveys (only after offer accepted). Spending more pre-offer is not cost-effective.",
  },
  {
    question: "When should I run the property check — before or after the viewing?",
    answer:
      "Before the second viewing. Run the free check on your phone in the car park after viewing 1 — it takes 30 seconds. If the data throws up anything material (flood zone 3, BSR HRB, ground-risk band 5, overseas owner), you don't need a second viewing. If it's clean, run the £4.99 Premium check before you make the offer; the AI seller-question pack gives you a list of specific questions to ask before submitting.",
  },
  {
    question: "What is the biggest mistake UK buyers make at the pre-offer stage?",
    answer:
      "Offering before checking the public record. About 1 in 3 UK property transactions falls through after offer (Quick Move Now data); a substantial fraction is because the buyer's solicitor surfaces something at week 6-8 that was visible in the public record before the offer was made. Common examples: overseas company owner without Register of Overseas Entities compliance; BSR HRB-registered building with no EWS1; tribunal-active leasehold; outstanding charges on the proprietor company. A £4.99 pre-offer check catches these in 30 seconds.",
  },
  {
    question: "Can I trust a free property check or do I need to pay?",
    answer:
      "The free tier is good for the basics — sales history, EPC, flood band, crime, council tax. It's instantly enough to decide whether to view. For a property you're considering offering on, the £4.99 Premium tier adds the data that actually breaks deals: ownership, BSR HRB, ground risk, Companies House proprietor check, tribunal history. The ROI on £4.99 is high because each of these flags is the kind of thing that costs £400-£1,500 to surface via a survey or £1,000-£1,500 via a solicitor.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="Property check before buying UK house" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Buyer&apos;s guide · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Property check before buying a UK house · 15 things to verify before you offer
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>Run a property check BEFORE you offer, not after.</strong>{" "}
              About 1 in 3 UK property purchases falls through, and a large share collapse because the solicitor surfaces a public-record flag at week 6-8 that was visible from day one. The 15 checks below take 30 seconds to run on any UK address via HomeBuyerCheck&apos;s £4.99 Premium tier. The free tier covers 7 of them; the £4.99 tier adds the 8 that actually break deals.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Run the free check on the property you&apos;re viewing</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">The 15 things to check before you offer on a UK house</h2>

          <ol className="mt-4 space-y-4 list-decimal pl-5">
            <li><strong>Registered ownership</strong> — UK individual, UK company, or overseas company (HMLR CCOD / OCOD). Overseas-company ownership without Register of Overseas Entities compliance is a serious conveyancing flag.</li>
            <li><strong>Outstanding charges on the proprietor</strong> — if owned by a company, check Companies House for outstanding charges (mortgage, debenture, fixed charge over property). Multiple charges signal financial pressure on the seller.</li>
            <li><strong>Sales history + last sale price</strong> — HM Land Registry Price Paid Data goes back to 1995. Compare to postcode median; a sale at 30%+ discount to local median is a red flag worth questioning.</li>
            <li><strong>BSR Higher-Risk Building register</strong> — flats only; any building over 18m or 7 storeys is registered post-Grenfell. Lenders refuse without an EWS1 A or B1.</li>
            <li><strong>EWS1 cladding status</strong> — applies to flats in HRB-register buildings. Ask the freeholder before you offer.</li>
            <li><strong>Flood risk zone + climate-projected 2050</strong> — Environment Agency Risk of Flooding from Rivers and Sea (RoFRaS) zones 1-3, surface water risk, and climate-projected 2050. Flood Zone 3 properties face insurance refusals or Flood Re engagement.</li>
            <li><strong>Ground stability bands</strong> — British Geological Survey radon, shrink-swell clay, landslide, and ground stability layers. Band 4-5 of shrink-swell is the most expensive of all to remediate.</li>
            <li><strong>Coal mining reporting area</strong> — Coal Authority publishes the official map. Properties in reporting areas need a CON29M search (£32.40) at conveyancing stage.</li>
            <li><strong>Listed building status + grade</strong> — Grade I, II*, II from Historic England. Listed Building Consent restricts what you can alter; unauthorised work is a criminal offence on the owner.</li>
            <li><strong>Conservation area + Article 4 directions</strong> — restricts permitted development (windows, satellite dishes, paint colours). planning.data.gov.uk publishes the live list.</li>
            <li><strong>Property Chamber tribunal history</strong> — First-tier Tribunal published decisions. Leasehold disputes, service charge cases, EWS1 challenges all show here.</li>
            <li><strong>EPC rating + 2030 minimum</strong> — current proposed UK minimum is EPC C from 2030 for rentals. Below E (EPC F, G) means likely retrofit cost before resale.</li>
            <li><strong>Planning applications within 500m</strong> — &gt;8 applications in the last 12 months means the area is changing. Could be good (new amenities, gentrification) or bad (overdevelopment, lost views).</li>
            <li><strong>Crime statistics — last 12 months</strong> — data.police.uk crime by category within ~1 mile. Doesn&apos;t determine whether to buy, but does affect insurance premiums.</li>
            <li><strong>Council tax band</strong> — Valuation Office Agency. Band H on a modest property typically means historic mis-banding; worth challenging.</li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Which checks does the £4.99 Premium tier cover?</h2>
          <p className="mt-3">
            All 15. The free tier covers points 3, 6 (basic), 12-14. The £4.99 Premium tier adds points 1-2 (ownership + Companies House), 4-5 (BSR HRB), 6 (full flood + climate), 7-8 (ground risk + coal), 9-11 (listed + conservation + tribunal) plus the AI buyer&apos;s verdict and tailored seller-question pack.{" "}
            <Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline">See a sample Premium report</Link>.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">The £6.99 Premium+ adds offer-stage tools</h2>
          <p className="mt-3">
            Once you&apos;ve decided to offer, the £2 extra (or £6.99 direct) unlocks: AI Solicitor brief for your conveyancer; AI Surveyor brief for your RICS surveyor; AI Mortgage broker brief for the broker; on-demand Negotiation Report that produces a defensible offer range from comps + Bank Rate + UKHPI + flag adjustments. Typical buyer saves £3,000-£15,000 through grounded negotiation.{" "}
            <Link href="/sample-plus" className="text-blue-700 underline-offset-2 hover:underline">Sample Premium+ report</Link>.
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
            <p className="text-sm font-bold text-slate-900">Run the check on the property you&apos;re viewing</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs all UK property checks · comparison table</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
              <li><Link href="/blog/cheapest-homebuyer-report-online" className="text-blue-700 underline-offset-2 hover:underline">Cheapest HomeBuyer report online</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="text-blue-700 underline-offset-2 hover:underline">Buying a house in the UK · step-by-step guide</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
