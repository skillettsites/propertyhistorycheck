import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import ConveyancingCostCalculator from "@/components/ConveyancingCostCalculator";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Conveyancing Cost Calculator UK 2026: Fees + Searches",
  description:
    "Free conveyancing cost calculator. Estimate solicitor legal fees, search pack, HM Land Registry and leasehold disbursements for buying a UK home in 2026, instantly. Then screen the property for £4.99 before you commit.",
  alternates: { canonical: "/conveyancing-cost-calculator" },
};

const FAQS = [
  {
    q: "How much does conveyancing cost when buying a house in 2026?",
    a: "Conveyancing typically costs £800 to £1,500 in legal fees plus £300 to £600 of disbursements (searches, HM Land Registry fee, transfer and ID checks), so most freehold purchases total roughly £1,200 to £2,100. Leasehold flats cost more because of management-pack and notice fees. Stamp Duty is charged separately on top.",
  },
  {
    q: "What is included in conveyancing fees?",
    a: "Two things: the solicitor's own legal fee (their time, scaled by price and complexity), and disbursements, which are third-party costs they pay on your behalf. Disbursements include the conveyancing search pack (£250 to £450), the HM Land Registry registration fee (£20 to £500 by price band), bankruptcy and priority searches, and ID/AML checks. Leasehold adds a management pack and notice fees.",
  },
  {
    q: "Why is leasehold conveyancing more expensive?",
    a: "A leasehold purchase needs extra work: reviewing the lease, raising enquiries on ground rent and service charges, and obtaining a management pack (LPE1) from the freeholder or managing agent, which itself can cost £250 to £800. There are also notice of transfer and notice of charge fees set by the freeholder. Expect £200 to £350 more in legal fees plus those disbursements.",
  },
  {
    q: "Is Stamp Duty part of conveyancing costs?",
    a: "No. Stamp Duty Land Tax is a tax paid to HMRC, collected by your solicitor at completion but separate from their conveyancing fee. It depends on the price, whether you are a first-time buyer, and whether it is an additional property, so it is calculated separately from the conveyancing estimate.",
  },
  {
    q: "Can I reduce what I spend on property searches?",
    a: "You cannot skip the searches a lender requires, but you can avoid paying for them twice. Searches (£250 to £450) are only ordered after your offer is accepted, so if a purchase falls through you lose them. Screening a property for £4.99 with HomeBuyerCheck before you offer means you commit your search budget only to a property worth buying.",
  },
];

export default function ConveyancingCostCalculatorPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Conveyancing cost calculator", url: "/conveyancing-cost-calculator" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Conveyancing Cost Calculator (UK, 2026)</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700">
              Estimate the full cost of conveyancing when buying a home: the solicitor&apos;s legal fee plus every
              disbursement, searches, HM Land Registry, leasehold notices. Adjust the price and property type to see your
              total instantly. Stamp Duty is a separate tax and is calculated on its own.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
            {/* Left: copy */}
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-slate-900">What conveyancing actually costs</h2>
              <p className="mt-3 text-slate-700">
                Conveyancing cost has two parts. The first is the <strong>legal fee</strong>, what the solicitor or licensed
                conveyancer charges for their time. It scales with the purchase price and with complexity, so a leasehold flat
                or a new build costs more than a simple freehold house.
              </p>
              <p className="mt-3 text-slate-700">
                The second is <strong>disbursements</strong>, third-party costs the solicitor pays on your behalf. The biggest
                is the search pack (£250 to £450), followed by the HM Land Registry registration fee, which steps up by price
                band from £20 to £500. Small searches, bank transfer and ID checks add the rest.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">When you pay, and the trap to avoid</h2>
              <p className="mt-3 text-slate-700">
                You instruct a conveyancer after your offer is accepted, and the searches are ordered shortly after. That
                timing matters: searches are <strong>non-refundable</strong>, so if the sale collapses before exchange, the
                £250 to £450 you spent is gone, and you pay again on the next property.
              </p>
              <p className="mt-3 text-slate-700">
                That is exactly why a cheap pre-offer screen pays for itself. For £4.99, HomeBuyerCheck flags the risks a
                survey and searches would later uncover, ground stability, flooding, mining, ownership, planning, tribunal
                history, so you commit your search budget only to a property worth buying.
              </p>

              <h2 className="mt-8 text-2xl font-bold text-slate-900">How this estimate is built</h2>
              <p className="mt-3 text-slate-700">
                Legal fees use typical 2026 UK market ranges by price band, with supplements for leasehold, new build and
                acting for a lender. The HM Land Registry fee uses the official Scale 1 electronic-lodgement bands. The search
                pack reflects standard local-authority, drainage and environmental pricing, plus the coal mining search in
                affected areas. These are realistic ranges to budget with, not a formal quote.
              </p>
            </div>

            {/* Right: the tool */}
            <div className="order-1 lg:order-2">
              <ConveyancingCostCalculator />
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-sm font-semibold text-slate-900">Before you pay for searches, screen the property</p>
                <p className="mt-1 text-xs text-slate-600">
                  Free instant check on any UK address. Premium from £4.99 adds ownership, ground risk, tribunal history and an
                  AI buyer&apos;s verdict, no subscription.
                </p>
                <div className="mt-3"><PostcodeLookup /></div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">Conveyancing cost FAQs</h2>
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
              <li><Link href="/blog/how-much-are-property-searches-when-buying" className="text-blue-600 hover:underline">Full breakdown of property search costs</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-600 hover:underline">Every conveyancing search by cost (2026)</Link></li>
              <li><Link href="/guides/conveyancing-explained" className="text-blue-600 hover:underline">Conveyancing explained, step by step</Link></li>
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
