import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Local land charges check (England & Wales)",
  description:
    "What local land charges are, what a Premium £4.99 HomeBuyerCheck already shows from open data, and how to run the official free personal search on GOV.UK.",
  alternates: { canonical: "/local-land-charges" },
};

const TIERS: { name: string; price: string; tag: string; desc: string; badge?: string }[] = [
  {
    name: "Premium",
    price: "£4.99",
    tag: "Risk & Title Synthesis",
    desc: "Listed / conservation / Article 4 / TPO overlays, plus flood, ground risk, radon, ownership and an AI buyer's verdict — the open-data picture before you pay a solicitor for LLC1 + CON29.",
  },
  {
    name: "Premium+",
    price: "£6.99",
    tag: "Pre-Exchange Brief",
    badge: "Most popular",
    desc: "Everything in Premium, plus AI solicitor, surveyor and mortgage briefs, a negotiation report, and the leasehold-extension calculator.",
  },
  {
    name: "Pre-Exchange Bundle",
    price: "£14.99",
    tag: "Reads the official title register",
    desc: "Everything in Premium+, plus the official HM Land Registry title register read out in plain English. Still does not buy the £15 LLC certificate.",
  },
];

const FAQS = [
  {
    q: "What are local land charges?",
    a: "They are restrictions and obligations that bind the land: planning conditions, highways agreements, tree preservation orders, conservation areas, listed buildings and environmental health notices. A solicitor's LLC1 reads the official register.",
  },
  {
    q: "Is the official local land charges search free?",
    a: "The personal search on GOV.UK is free. An optional £15 official certificate exists. HomeBuyerCheck does not purchase that certificate.",
  },
  {
    q: "Does HomeBuyerCheck replace an LLC1?",
    a: "No. Premium (£4.99) shows the listed, conservation, Article 4 and TPO overlays already in the report, and points you to the official free personal search. It does not replace a conveyancer's official LLC1 + CON29 pack.",
  },
  {
    q: "Does every council use the HM Land Registry service?",
    a: "Not yet. Not every local authority has migrated onto the HMLR Local Land Charges service. If the address is not on that service, the council still holds the register.",
  },
];

export default function LocalLandChargesPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Local land charges check", url: "/local-land-charges" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Local land charges check (England &amp; Wales)</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              Local land charges are the restrictions that travel with the land, not the seller. A Premium HomeBuyerCheck
              at <strong>£4.99</strong> already shows the listed, conservation, Article 4 and TPO overlays from open data,
              then points you to the official <strong>free</strong> personal search on GOV.UK.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
            <p className="mt-3 text-xs text-slate-500">
              Free postcode check first. Upgrade to Premium only if you want the full risk picture before you offer.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14">
          <h2 className="text-2xl font-bold text-slate-900">What local land charges are</h2>
          <p className="mt-3 text-slate-700">
            A local land charge is an entry on a statutory register that binds whoever owns the property. Typical entries
            include planning conditions, highways agreements, tree preservation orders, conservation areas, listed
            buildings and environmental health notices. Buyers usually meet them as the LLC1 half of a solicitor&apos;s
            local authority search.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What this report already knows</h2>
          <p className="mt-3 text-slate-700">
            Premium already includes the open-data overlays that overlap the register most buyers worry about:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Listed building status (Historic England / planning.data.gov.uk).</li>
            <li>Conservation area.</li>
            <li>Article 4 direction (permitted-development rights withdrawn).</li>
            <li>Tree preservation order zones.</li>
          </ul>
          <p className="mt-3 text-slate-700">
            Those flags are informational. They are not invented LLC register rows, and they are not a scrape of GOV.UK.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">The official free personal search</h2>
          <p className="mt-3 text-slate-700">
            Anyone can run a personal search of the Local Land Charges register for free:
          </p>
          <p className="mt-3 text-slate-700">
            <a href="https://www.gov.uk/search-local-land-charges" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              Search local land charges on GOV.UK
            </a>
          </p>
          <p className="mt-3 text-slate-700">
            The official search is free. An optional £15 official certificate exists. HomeBuyerCheck does not purchase
            that certificate. Not every local authority has migrated onto the HM Land Registry service yet; if the
            address is missing, the council still holds the register.
          </p>

          <div id="report-options" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900">Your report options</h2>
            <p className="mt-3 text-slate-700">
              Run a free check on any UK address first, then pick Premium at £4.99 if you want the open-data risk
              picture. No new product, no extra LLC fee.
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
              <p className="mt-1 text-xs text-slate-600">Free instant check. Upgrade to Premium £4.99 only if something flags.</p>
              <div className="mt-3"><PostcodeLookup /></div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">What this is not</p>
            <p className="mt-2 text-sm text-slate-700">
              HomeBuyerCheck does not replace a conveyancer&apos;s official local authority search. Use Premium to
              screen a property before you offer, then run the free personal search and let your solicitor order the
              official pack if you proceed.
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
              <li><Link href="/llc-search" className="text-blue-600 hover:underline">LLC search / LLC1: what a local land charges search shows</Link></li>
              <li><Link href="/local-authority-search" className="text-blue-600 hover:underline">Local authority search: LLC1 vs CON29 vs a £4.99 pre-offer check</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Run a property check from £4.99</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
