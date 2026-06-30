import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import SurveyCostCalculator from "@/components/SurveyCostCalculator";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Property Survey Cost Calculator UK 2026 (Level 1, 2 & 3)",
  description:
    "Free house survey cost calculator. Estimate the price of a RICS Level 1 Condition, Level 2 HomeBuyer or Level 3 Building Survey by property value and type for 2026. See which survey you need, then screen the property for £4.99 first.",
  alternates: { canonical: "/property-survey-cost-calculator" },
};

const FAQS = [
  {
    q: "How much does a house survey cost in 2026?",
    a: "A RICS Level 1 Condition Report costs roughly £300 to £700, a Level 2 HomeBuyer Report £400 to £1,200, and a Level 3 Building Survey £600 to £2,000 or more, depending on the property value, age and size. Older, listed and larger homes cost more because they take longer to inspect.",
  },
  {
    q: "What is the difference between a Level 2 and Level 3 survey?",
    a: "A RICS Level 2 (HomeBuyer Report) suits conventional, reasonably modern properties in normal condition: it flags defects and gives advice, with an optional valuation. A RICS Level 3 (Building Survey) is a much more detailed structural inspection for older, larger, altered or unusual properties, where you need to understand the building's construction and any serious issues before buying.",
  },
  {
    q: "Which survey level do I need?",
    a: "For a newer, conventional home in good order, a Level 1 or Level 2 is usually enough. For a period property, anything that has been extended or converted, a listed building, or a home with visible problems, choose a Level 3 Building Survey. If you are unsure, a Level 2 is the common default for standard houses and flats.",
  },
  {
    q: "Is a survey the same as a mortgage valuation?",
    a: "No. A mortgage valuation is for the lender's benefit and only confirms the property is worth roughly what you are paying. It is not a survey of condition. A RICS survey is for you, the buyer, and inspects the property's condition and defects. Relying on the lender's valuation alone leaves you exposed to repair costs you did not know about.",
  },
  {
    q: "Can I check a property's risks before paying for a survey?",
    a: "Yes, and it helps you choose the right survey. For £4.99, HomeBuyerCheck flags ground stability, subsidence and mining risk, flood risk, listed and conservation status and more for the exact address, so you go into the survey knowing what to ask the surveyor to look at, or decide a property is not worth surveying at all.",
  },
];

export default function SurveyCostCalculatorPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Property survey cost calculator", url: "/property-survey-cost-calculator" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Property Survey Cost Calculator (UK, 2026)</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700">
              Estimate the cost of a house survey by RICS level. Set the property value and type to compare a Level 1
              Condition Report, Level 2 HomeBuyer Report and Level 3 Building Survey side by side, and see which one you
              actually need.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
            {/* Left: copy */}
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-slate-900">What drives the price of a survey</h2>
              <p className="mt-3 text-slate-700">
                Three things move a survey fee: the <strong>level of survey</strong>, the <strong>value of the property</strong>
                {" "}(a proxy for size), and its <strong>age and complexity</strong>. A modern two-bed flat is quick to inspect.
                A Victorian house that has been extended twice takes far longer, and that time is what you pay for.
              </p>
              <p className="mt-3 text-slate-700">
                The three RICS levels exist for different properties. Level 1 is a light-touch condition check for newer homes.
                Level 2, the HomeBuyer Report, is the popular middle option for standard properties. Level 3, the Building
                Survey, is the thorough structural inspection you want for anything old, large, altered or unusual.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">Survey vs searches vs valuation</h2>
              <p className="mt-3 text-slate-700">
                These are three separate costs people often confuse. The <strong>survey</strong> inspects the building&apos;s
                condition. The <strong>searches</strong> (£250 to £450) cover legal, environmental and infrastructure matters.
                The <strong>mortgage valuation</strong> is for the lender and is not a survey at all. Most buyers pay for a
                survey and searches; the valuation is arranged by the lender.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">Spend your survey budget wisely</h2>
              <p className="mt-3 text-slate-700">
                A Level 3 survey is £600 to £2,000. Before committing that, it pays to know what the surveyor is likely to
                find. For £4.99, HomeBuyerCheck flags ground stability, subsidence and mining risk, flood exposure, listing and
                conservation status and more for the exact address, so you brief the surveyor on the right concerns, or decide
                a property is not worth surveying in the first place.
              </p>
            </div>

            {/* Right: the tool */}
            <div className="order-1 lg:order-2">
              <SurveyCostCalculator />
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Know what to survey for, before you book</p>
                <p className="mt-1 text-xs text-slate-600">
                  Free instant check on any UK address. Premium from £4.99 adds ground risk, flood, listing and an AI buyer&apos;s
                  verdict that tells the surveyor where to look.
                </p>
                <div className="mt-3"><PostcodeLookup /></div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">House survey cost FAQs</h2>
            <div className="mt-4 space-y-5">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-slate-900">{f.q}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal links */}
          <section className="mt-12 max-w-3xl border-t border-slate-100 pt-6">
            <p className="text-sm font-bold text-slate-900">Keep going</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/blog/rics-survey-cost-uk" className="text-blue-600 hover:underline">RICS survey costs explained in detail</Link></li>
              <li><Link href="/conveyancing-cost-calculator" className="text-blue-600 hover:underline">Conveyancing cost calculator</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Run a full pre-purchase property check from £4.99</Link></li>
              <li><Link href="/compare" className="text-blue-600 hover:underline">Compare UK property check tools and prices</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
