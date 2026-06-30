import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import CostOfBuyingCalculator from "@/components/CostOfBuyingCalculator";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Cost of Buying a House Calculator UK 2026 (Full Breakdown)",
  description:
    "Free calculator for the total cost of buying a house in the UK. Add up your deposit, stamp duty, conveyancing, survey, mortgage and removals fees for 2026, instantly. See the real cash you need up front.",
  alternates: { canonical: "/cost-of-buying-a-house-calculator" },
};

const FAQS = [
  {
    q: "How much money do I need to buy a house in the UK?",
    a: "Beyond the deposit, budget for stamp duty, conveyancing (legal fees plus searches, around £1,200 to £2,100), a survey (£400 to £2,000), mortgage arrangement and valuation fees (often £500 to £1,000), and removals (£300 to £1,400). On a typical £300,000 first home with a 10% deposit, the total cash needed up front is usually £33,000 to £36,000.",
  },
  {
    q: "What are the hidden costs of buying a house?",
    a: "The costs people forget are the ones beyond the deposit: stamp duty, conveyancing disbursements (searches, Land Registry fee), a survey, mortgage product and valuation fees, removals, and sometimes leasehold management-pack fees. Together they can add £3,000 to £8,000 on a typical purchase, which is why this calculator totals them all.",
  },
  {
    q: "Is stamp duty included in the cost of buying a house?",
    a: "Yes, it is one of the larger up-front costs. Stamp Duty Land Tax is charged on the purchase price, with relief for first-time buyers up to £500,000 and a surcharge on additional properties. This calculator includes it in the total, alongside the deposit and all fees.",
  },
  {
    q: "How can I reduce the cost of buying a house?",
    a: "Negotiating the price down is the biggest lever, because it cuts both the price and the stamp duty on it. Choosing the right survey level for the property avoids overpaying, and screening a property cheaply before you offer means you do not waste non-refundable search fees on a purchase that falls through. HomeBuyerCheck gives you the risk evidence to negotiate, from £4.99.",
  },
];

export default function CostOfBuyingCalculatorPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Cost of buying a house calculator", url: "/cost-of-buying-a-house-calculator" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Cost of Buying a House Calculator (UK, 2026)</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700">
              Work out the real cash you need to buy a home, not just the deposit. This calculator adds up your deposit, stamp
              duty, conveyancing, survey, mortgage fees and removals so you can see the full up-front cost before you start.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,440px)]">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-slate-900">The full cost of buying, line by line</h2>
              <p className="mt-3 text-slate-700">
                Most people budget for the deposit and forget the rest. The other costs, stamp duty, conveyancing, survey,
                mortgage fees and removals, routinely add several thousand pounds, and they are nearly all due around exchange
                and completion, when cash is tightest.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                <li><strong>Deposit</strong>, the big one, typically 5% to 25% of the price.</li>
                <li><strong>Stamp duty</strong>, a tax on the price, with first-time-buyer relief and a second-home surcharge.</li>
                <li><strong>Conveyancing</strong>, the solicitor&apos;s legal fee plus searches and the Land Registry fee.</li>
                <li><strong>Survey</strong>, from a Level 2 HomeBuyer Report to a Level 3 Building Survey.</li>
                <li><strong>Mortgage fees</strong>, arrangement and valuation fees charged by the lender.</li>
                <li><strong>Removals</strong>, scaling with the size of the property and distance.</li>
              </ul>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">The cheapest way to cut the bill</h2>
              <p className="mt-3 text-slate-700">
                Two costs scale directly with the price: the deposit and the stamp duty. So negotiating the price down saves
                you twice over. The way buyers justify a lower offer is with evidence, a flood risk, a ground-stability flag, a
                short lease, an ownership issue.
              </p>
              <p className="mt-3 text-slate-700">
                For £4.99, HomeBuyerCheck surfaces exactly that evidence for the specific address, the same risks a survey and
                searches would later confirm, so you can make a lower, defensible offer before you exchange. It also stops you
                wasting non-refundable search fees on a property you would walk away from.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <CostOfBuyingCalculator />
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Cut the biggest two costs: negotiate the price</p>
                <p className="mt-1 text-xs text-slate-600">
                  Free instant check on any UK address. Premium from £4.99 gives you the risk evidence to justify a lower
                  offer, which cuts both the price and the stamp duty on it.
                </p>
                <div className="mt-3"><PostcodeLookup /></div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">Cost of buying FAQs</h2>
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
            <p className="text-sm font-bold text-slate-900">Calculate each cost in detail</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/stamp-duty-calculator" className="text-blue-600 hover:underline">Stamp duty calculator</Link></li>
              <li><Link href="/conveyancing-cost-calculator" className="text-blue-600 hover:underline">Conveyancing cost calculator</Link></li>
              <li><Link href="/property-survey-cost-calculator" className="text-blue-600 hover:underline">Property survey cost calculator</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Run a full pre-purchase property check from £4.99</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
