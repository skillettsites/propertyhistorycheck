import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Local authority search: LLC1 vs CON29 vs a £4.99 pre-offer check",
  description:
    "How a solicitor's £100–£250 LLC1 + CON29 pack differs from a £4.99 Premium HomeBuyerCheck and the official free local land charges personal search. We do not replace the conveyancer's official search.",
  alternates: { canonical: "/local-authority-search" },
};

const TIERS: { name: string; price: string; tag: string; desc: string; badge?: string }[] = [
  {
    name: "Premium",
    price: "£4.99",
    tag: "Pre-offer screen",
    desc: "Open-data listed / conservation / Article 4 / TPO plus flood, ground, radon and ownership — so you only pay the £100–£250 solicitor pack on a property you still want.",
  },
  {
    name: "Premium+",
    price: "£6.99",
    tag: "Pre-Exchange Brief",
    badge: "Most popular",
    desc: "Everything in Premium, plus AI briefs your solicitor and surveyor can use once the official LLC1 + CON29 is on order.",
  },
  {
    name: "Pre-Exchange Bundle",
    price: "£14.99",
    tag: "Reads the official title register",
    desc: "Everything in Premium+, plus the official title register in plain English. Still not a substitute for the council search pack.",
  },
];

const FAQS = [
  {
    q: "What is a local authority search?",
    a: "It is the pack your conveyancer orders from the council: an LLC1 (Local Land Charges register) plus a CON29 (standard enquiries about planning, roads, building control and nearby schemes). Together they typically cost £100 to £250.",
  },
  {
    q: "What is the difference between LLC1 and CON29?",
    a: "LLC1 reads charges that bind the land. CON29 asks the council questions about the property and the area around it. They are usually sold as one pack, not as a HomeBuyerCheck product.",
  },
  {
    q: "Does a £4.99 Premium report replace the solicitor search?",
    a: "No. Premium is a pre-offer screen from open data, plus a pointer to the official free personal LLC search. It does not replace a conveyancer's official LLC1 + CON29 pack.",
  },
  {
    q: "Is there a free official LLC search?",
    a: "Yes. The personal search on GOV.UK is free. An optional £15 official certificate exists; HomeBuyerCheck does not purchase it. Not every local authority has migrated onto the HM Land Registry service yet.",
  },
];

export default function LocalAuthoritySearchPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Local authority search", url: "/local-authority-search" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Local authority search: LLC1 vs CON29 vs a £4.99 pre-offer check</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              A solicitor&apos;s local authority pack (LLC1 + CON29) typically costs <strong>£100–£250</strong> after
              you instruct them. A Premium HomeBuyerCheck at <strong>£4.99</strong> plus the official{" "}
              <strong>free</strong> personal LLC search lets you screen the property before that bill. We do not replace
              the conveyancer&apos;s official search.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
            <p className="mt-3 text-xs text-slate-500">
              Same Premium price as the rest of the site. No new SKU and no £15 official LLC certificate purchased by us.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14">
          <h2 className="text-2xl font-bold text-slate-900">LLC1 vs CON29</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Part</th>
                  <th className="py-2 pr-3 font-semibold">What it is</th>
                  <th className="py-2 font-semibold">Typical cost</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-slate-100">
                  <td className="py-3 pr-3 font-semibold text-slate-900">LLC1</td>
                  <td className="py-3 pr-3">Register of local land charges that bind the land (planning conditions, highways agreements, TPOs, conservation, listed buildings, environmental health notices).</td>
                  <td className="py-3">Part of the pack. Personal search free on GOV.UK; optional official certificate £15.</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 pr-3 font-semibold text-slate-900">CON29</td>
                  <td className="py-3 pr-3">Standard enquiries to the council: planning history, building control, road status, notices and nearby schemes.</td>
                  <td className="py-3">Part of the pack. Council-set fee.</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 pr-3 font-semibold text-slate-900">Solicitor pack</td>
                  <td className="py-3 pr-3">LLC1 + CON29 ordered together after you instruct a conveyancer.</td>
                  <td className="py-3 font-semibold">£100–£250</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3 font-semibold text-slate-900">Premium pre-offer check</td>
                  <td className="py-3 pr-3">Open-data listed / conservation / Article 4 / TPO plus the wider HomeBuyerCheck risk report. Points you to the free personal LLC search.</td>
                  <td className="py-3 font-semibold">£4.99</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Why the solicitor pack still matters</h2>
          <p className="mt-3 text-slate-700">
            Lenders expect an official local authority search. The CON29 answers questions open data cannot, and the
            official LLC1 is the register your conveyancer relies on. HomeBuyerCheck does not claim to replace that
            pack, and we do not buy the £15 official LLC certificate on any sale.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What to do before you pay £100–£250</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Run a free HomeBuyerCheck on the address, then Premium at £4.99 if you want the overlays and wider risk picture.</li>
            <li>
              Run the official free personal search at{" "}
              <a href="https://www.gov.uk/search-local-land-charges" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                gov.uk/search-local-land-charges
              </a>
              . Not every local authority has migrated onto the HM Land Registry service yet.
            </li>
            <li>If you still want the property, instruct a solicitor and let them order the official LLC1 + CON29 pack.</li>
          </ol>

          <div id="report-options" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900">Your report options</h2>
            <p className="mt-3 text-slate-700">
              Funnel into the existing Premium product. No new price and no new Stripe product.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
                    t.badge ? "border-emerald-400 shadow-sm" : "border-slate-200"
                  }`}
                >
                  {t.badge ? (
                    <span className="absolute -top-2.5 left-5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {t.badge}
                    </span>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    <span className="text-xl font-extrabold text-slate-900">{t.price}</span>
                  </div>
                  <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{t.tag}</span>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-900">Check your property now</p>
              <p className="mt-1 text-xs text-slate-600">Free instant check. Premium is still £4.99.</p>
              <div className="mt-3"><PostcodeLookup /></div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Clear limit</p>
            <p className="mt-2 text-sm text-slate-700">
              This page contrasts the solicitor pack with a cheap pre-offer screen. It does not claim HomeBuyerCheck
              replaces a conveyancer&apos;s official search.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
            <div className="mt-4 space-y-5">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-slate-900">{f.q}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 border-t border-slate-100 pt-6">
            <p className="text-sm font-bold text-slate-900">Related checks</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/local-land-charges" className="text-blue-600 hover:underline">Local land charges check (England &amp; Wales)</Link></li>
              <li><Link href="/llc-search" className="text-blue-600 hover:underline">LLC search / LLC1: what a local land charges search shows</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Run a property check from £4.99</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
