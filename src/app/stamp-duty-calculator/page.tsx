import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Stamp Duty Calculator UK 2026 (SDLT, First-Time Buyer & BTL)",
  description:
    "Free stamp duty calculator for 2026. Work out SDLT for a standard buyer, first-time buyer or second home / buy-to-let in England & Northern Ireland, instantly. Slide the price to see the tax change.",
  alternates: { canonical: "/stamp-duty-calculator" },
};

const FAQS = [
  {
    q: "How much is stamp duty in 2026?",
    a: "For a standard buyer in England and Northern Ireland, SDLT is 0% up to £125,000, 2% on £125,001 to £250,000, 5% on £250,001 to £925,000, 10% on £925,001 to £1.5m and 12% above that. First-time buyers pay nothing up to £300,000 (on purchases up to £500,000). An additional 5% surcharge applies to second homes and buy-to-let.",
  },
  {
    q: "How much stamp duty does a first-time buyer pay?",
    a: "A first-time buyer pays no stamp duty on the first £300,000 and 5% on the portion from £300,001 to £500,000. If the property costs more than £500,000, first-time buyer relief does not apply and you pay the standard rates. Use the calculator above to see your exact figure.",
  },
  {
    q: "What is the stamp duty surcharge on a second home?",
    a: "If you are buying an additional property (a second home or buy-to-let) and will own more than one property at the end of the day, a 5% surcharge is added on top of the standard rates across every band. The calculator shows the standard, first-time-buyer and second-home figures side by side.",
  },
  {
    q: "Does this calculator cover Scotland and Wales?",
    a: "No. Scotland uses Land and Buildings Transaction Tax (LBTT) and Wales uses Land Transaction Tax (LTT), both with different bands and rates. This calculator covers Stamp Duty Land Tax (SDLT) for England and Northern Ireland.",
  },
  {
    q: "Is stamp duty part of my conveyancing costs?",
    a: "No. Stamp duty is a tax paid to HMRC, collected by your solicitor at completion. It is separate from the conveyancing fee, which covers the solicitor's work and disbursements like searches. You can estimate those separately with our conveyancing cost calculator.",
  },
];

export default function StampDutyCalculatorPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Stamp duty calculator", url: "/stamp-duty-calculator" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Stamp Duty Calculator (UK, 2026)</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700">
              Work out the Stamp Duty Land Tax (SDLT) on a property purchase in England and Northern Ireland. The calculator
              shows what a standard buyer, a first-time buyer and a second-home or buy-to-let purchaser would each pay, so you
              can see exactly where you stand.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
            {/* Left: copy */}
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-slate-900">How stamp duty works</h2>
              <p className="mt-3 text-slate-700">
                SDLT is charged in <strong>bands</strong>, like income tax. You pay the rate for each band only on the part of
                the price that falls within it, not the whole price. That is why the effective rate (the tax as a percentage
                of the price) is always lower than the top band you reach.
              </p>
              <p className="mt-3 text-slate-700">
                There are three common situations, and the calculator shows all three at once: a <strong>standard</strong>
                {" "}buyer, a <strong>first-time buyer</strong> (relief up to £500,000), and a <strong>second home or
                buy-to-let</strong> purchase, which carries a 5% surcharge across every band.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">When you pay it</h2>
              <p className="mt-3 text-slate-700">
                Stamp duty is due within 14 days of completion. In practice your solicitor collects it from you and files the
                SDLT return on your behalf, so you never deal with HMRC directly. Budget for it alongside your deposit and
                conveyancing costs, it is one of the larger up-front sums when buying.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">Before you commit to a price</h2>
              <p className="mt-3 text-slate-700">
                Stamp duty is fixed by the price you pay, so negotiating the price down saves tax as well as cash. Knowing a
                property&apos;s risks gives you grounds to negotiate. For £4.99, HomeBuyerCheck flags ground stability,
                flooding, mining, ownership and planning issues for the exact address, the kind of evidence buyers use to
                justify a lower offer before exchange.
              </p>
            </div>

            {/* Right: the tool */}
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <StampDutyCalculator defaultPrice={300_000} />
              </div>
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Negotiate the price, cut the stamp duty</p>
                <p className="mt-1 text-xs text-slate-600">
                  Free instant check on any UK address. Premium from £4.99 gives you the risk evidence to justify a lower
                  offer, no subscription.
                </p>
                <div className="mt-3"><PostcodeLookup /></div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">Stamp duty FAQs</h2>
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
              <li><Link href="/conveyancing-cost-calculator" className="text-blue-600 hover:underline">Conveyancing cost calculator</Link></li>
              <li><Link href="/property-survey-cost-calculator" className="text-blue-600 hover:underline">Property survey cost calculator</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Run a full pre-purchase property check from £4.99</Link></li>
              <li><Link href="/guides/buying-a-house-uk" className="text-blue-600 hover:underline">The full UK house-buying guide</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
