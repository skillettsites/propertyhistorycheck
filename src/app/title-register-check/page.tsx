import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Title Register Check: £7 from HM Land Registry (UK 2026)",
  description:
    "The HM Land Registry title register costs £7 direct from gov.uk. See what it reveals about owner, tenure, covenants and charges, what it can't tell you, and how to check those risks before you offer.",
  alternates: { canonical: "/title-register-check" },
};

const TIERS: { name: string; price: string; tag: string; desc: string; badge?: string }[] = [
  {
    name: "Premium",
    price: "£4.99",
    tag: "Risk & Title Synthesis",
    desc: "Tenure, ownership and sale-history synthesis, plus the risks the title can't show: coal mining, ground stability, radon, flood, listing / conservation / Article 4, corporate-owner checks, and an AI buyer's verdict.",
  },
  {
    name: "Premium+",
    price: "£6.99",
    tag: "Pre-Exchange Brief",
    badge: "Most popular",
    desc: "Everything in Premium, plus AI solicitor, surveyor and mortgage briefs, a negotiation report with a defensible offer range, and the leasehold-extension calculator.",
  },
  {
    name: "Pre-Exchange Bundle",
    price: "£14.99",
    tag: "Reads the official title register",
    desc: "Everything in Premium+, plus the official HM Land Registry title register read out in plain English: covenants, easements and charges. The only tier that pulls the official title copy for you.",
  },
];

const FAQS = [
  {
    q: "How much does the title register cost?",
    a: "The official HM Land Registry title register costs £7 direct from gov.uk and is delivered as a PDF straight away. The title plan (boundary diagram) is a separate £7 order. HomeBuyerCheck doesn't resell the raw register at the cheaper tiers; for the official copy on its own, gov.uk is the cheapest route.",
  },
  {
    q: "What does the title register show?",
    a: "Who legally owns the property, whether it's freehold or leasehold, the price last paid (if registered after April 2000), any mortgages or charges, restrictive covenants, and rights of way or easements. It is the legal record of what the owner has agreed to.",
  },
  {
    q: "What does the title register NOT show?",
    a: "It is silent on flood risk, ground stability and mining beneath the property, radon, building-safety register status, planning, listed-building, conservation or Article 4 overlays nearby, the neighbourhood, and the financial health of a corporate or overseas freeholder. Those are the risks a HomeBuyerCheck report surfaces, from £4.99.",
  },
  {
    q: "Can I get the title register read for me in plain English?",
    a: "Yes. Our £14.99 Pre-Exchange Bundle pulls the official HM Land Registry copy and reads the covenants, easements and charges out in plain English, alongside the full risk picture. If you only want the raw PDF to read yourself, order it for £7 from gov.uk.",
  },
];

export default function TitleRegisterCheckPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Title register check", url: "/title-register-check" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">How to check the HM Land Registry title register</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              The title register is the most important legal document on a property, and it&apos;s cheap:{" "}
              <strong>£7 direct from HM Land Registry</strong> via gov.uk. Get it. But it only tells you what the owner has
              agreed to legally. It says nothing about flooding, the ground beneath, mining, the building, or who controls
              the freeholder. <strong>That gap is what HomeBuyerCheck fills, from £4.99.</strong>
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
            <p className="mt-3 text-xs text-slate-500">
              Run a free check on your property first, then add the £7 title register from gov.uk if you want the raw legal
              document, or let our £14.99 Bundle read it for you.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14">
          {/* What's in it (kept) */}
          <h2 className="text-2xl font-bold text-slate-900">What&apos;s in a title register</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li><strong>Property register</strong>, description, plan reference, tenure (freehold/leasehold), and any rights of way or easements.</li>
            <li><strong>Proprietorship register</strong>, current registered owners, price paid (if registered after April 2000), and any restrictions on selling.</li>
            <li><strong>Charges register</strong>, mortgages, restrictive covenants, third-party rights, deeds of variation.</li>
          </ul>

          {/* Where to order (kept, accuracy refined) */}
          <h2 className="mt-10 text-2xl font-bold text-slate-900">Where to order it</h2>
          <p className="mt-3 text-slate-700">
            HM Land Registry sells the title register direct via gov.uk for £7. The title plan (boundary diagram) is a
            separate £7 order. Both are PDFs, delivered immediately.
          </p>
          <p className="mt-3 text-slate-700">
            <a href="https://www.gov.uk/search-property-information-land-registry" target="_blank" rel="noopener" className="text-blue-700 underline">
              Order from gov.uk, Search property information from HM Land Registry
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            For the raw official PDF on its own, gov.uk at £7 is the cheapest, most reliable route, so we point you there.
            Our £14.99 Pre-Exchange Bundle is the one tier that pulls the official copy and reads it out in plain English
            alongside the wider risk report.
          </p>

          {/* What to look for (kept) */}
          <h2 className="mt-10 text-2xl font-bold text-slate-900">What to look for as a buyer</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li><strong>Tenure</strong>, freehold or leasehold. If leasehold, what is the lease term remaining and the ground rent clause? Sub-80 years triggers marriage value; some lenders won&apos;t lend below 75 years.</li>
            <li><strong>Registered owner</strong>, does it match the seller you&apos;re dealing with? Any unexpected company entity or overseas owner?</li>
            <li><strong>Restrictions</strong>, Form A or other restrictions that require consent before transfer? Common with shared-ownership or properties held in trust.</li>
            <li><strong>Charges</strong>, existing mortgages or third-party rights. These must be discharged or accepted before completion.</li>
            <li><strong>Restrictive covenants</strong>, some titles ban running a business from home, parking caravans on the front garden, or extending without consent.</li>
            <li><strong>Easements / rights of way</strong>, neighbours&apos; rights to cross your land, shared drives, shared sewers.</li>
          </ul>

          {/* NEW: what it won't tell you */}
          <h2 className="mt-10 text-2xl font-bold text-slate-900">What the title register won&apos;t tell you</h2>
          <p className="mt-3 text-slate-700">
            The title is the legal record. It is silent on everything around and beneath the property, the things that
            actually change a buying decision:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Flood risk for the address.</li>
            <li>Ground stability, coal mining and subsidence risk (British Geological Survey), and the radon band.</li>
            <li>Building Safety Register status for high-rise residential blocks.</li>
            <li>Planning, listed-building, conservation-area and Article 4 overlays on and around the property.</li>
            <li>Property Chamber tribunal history, service-charge and leasehold disputes at the building.</li>
            <li>The financial health of a corporate or overseas freeholder (insolvency, charges, disqualified directors).</li>
          </ul>
          <p className="mt-3 text-slate-700">
            That is exactly what a HomeBuyerCheck report pulls together for one specific address.
          </p>

          {/* NEW: report options */}
          <div id="report-options" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900">Your report options</h2>
            <p className="mt-3 text-slate-700">
              Run a free check on any UK address first, then pick the report that fits. No subscription, instant, permanent
              online link.
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
              <p className="mt-1 text-xs text-slate-600">Free instant check on any UK address. Only upgrade if something flags.</p>
              <div className="mt-3"><PostcodeLookup /></div>
            </div>
          </div>

          {/* Sensible workflow (kept) */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Sensible workflow</p>
            <p className="mt-2 text-sm text-slate-700">
              Run our free address check first. If anything flags, run the report that fits, from £4.99. Want the title
              register itself read out in plain English? That&apos;s the £14.99 Bundle. Prefer the raw PDF to read yourself?
              Order it for £7 direct from gov.uk and review with your solicitor.
            </p>
          </div>

          {/* NEW: FAQ */}
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

          {/* Internal links */}
          <section className="mt-12 border-t border-slate-100 pt-6">
            <p className="text-sm font-bold text-slate-900">Related checks</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/free-property-check" className="text-blue-600 hover:underline">Run a free property check on any UK address</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Get a full pre-purchase property report from £4.99</Link></li>
              <li><Link href="/flood-risk-check" className="text-blue-600 hover:underline">Check a property&apos;s flood risk by postcode</Link></li>
              <li><Link href="/compare" className="text-blue-600 hover:underline">Compare UK property check tools and prices</Link></li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
