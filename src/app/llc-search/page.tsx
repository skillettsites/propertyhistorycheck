import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "LLC search / LLC1: what a local land charges search shows",
  description:
    "What an LLC1 local land charges search shows, how the free GOV.UK personal search works, and how a £4.99 Premium HomeBuyerCheck fits before you instruct a solicitor.",
  alternates: { canonical: "/llc-search" },
};

const TIERS: { name: string; price: string; tag: string; desc: string; badge?: string }[] = [
  {
    name: "Premium",
    price: "£4.99",
    tag: "Risk & Title Synthesis",
    desc: "The pre-offer LLC picture from open data: listed, conservation, Article 4 and TPO, plus flood, ground, radon and ownership. Then use the free GOV.UK personal search.",
  },
  {
    name: "Premium+",
    price: "£6.99",
    tag: "Pre-Exchange Brief",
    badge: "Most popular",
    desc: "Everything in Premium, plus AI solicitor, surveyor and mortgage briefs so your conveyancer knows which LLC / CON29 questions to press.",
  },
  {
    name: "Pre-Exchange Bundle",
    price: "£14.99",
    tag: "Reads the official title register",
    desc: "Everything in Premium+, plus the official title register in plain English. The LLC certificate is still a separate GOV.UK item we do not buy.",
  },
];

const FAQS = [
  {
    q: "What does an LLC1 show?",
    a: "An LLC1 is a search of the Local Land Charges register. It can reveal planning conditions, highways agreements, tree preservation orders, conservation areas, listed-building controls and environmental health notices that bind the land.",
  },
  {
    q: "Is an LLC search the same as a CON29?",
    a: "No. LLC1 reads the register of charges on the property. CON29 is a set of enquiries to the council about planning, roads, building control and nearby schemes. Solicitors usually order both as one local authority pack.",
  },
  {
    q: "How much is an LLC search?",
    a: "The personal search on GOV.UK is free. An optional official certificate costs £15. A solicitor's combined LLC1 + CON29 pack typically costs £100 to £250. HomeBuyerCheck Premium is £4.99 and does not purchase the £15 certificate.",
  },
  {
    q: "Can I do an LLC search myself?",
    a: "Yes. Use the official free personal search at gov.uk/search-local-land-charges. Not every local authority has migrated onto the HM Land Registry service yet.",
  },
];

export default function LlcSearchPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "LLC search / LLC1", url: "/llc-search" },
          ]),
          faqSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">LLC search / LLC1: what a local land charges search shows</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              An LLC1 is the register search for charges that bind the land. You can run the official personal search
              for <strong>free</strong> on GOV.UK. A Premium HomeBuyerCheck at <strong>£4.99</strong> shows the listed,
              conservation, Article 4 and TPO overlays first so you know what to look for before you offer.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
            <p className="mt-3 text-xs text-slate-500">
              Screen the property on HomeBuyerCheck, then use the free GOV.UK LLC search. We do not buy the £15 certificate.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:py-14">
          <h2 className="text-2xl font-bold text-slate-900">What an LLC1 shows</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Planning conditions and agreements that stay with the property.</li>
            <li>Highways agreements and some road-adoption charges.</li>
            <li>Tree preservation orders.</li>
            <li>Conservation-area and listed-building controls.</li>
            <li>Environmental health notices and some financial charges.</li>
          </ul>
          <p className="mt-3 text-slate-700">
            It is a register search, not a set of questions. The questions (planning history, building control, road
            status, nearby schemes) sit on the CON29, which is the other half of a local authority search.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Free personal search vs the £15 certificate</h2>
          <p className="mt-3 text-slate-700">
            HM Land Registry hosts a personal search of the Local Land Charges register. That search is free:
          </p>
          <p className="mt-3 text-slate-700">
            <a href="https://www.gov.uk/search-local-land-charges" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              Search local land charges on GOV.UK
            </a>
          </p>
          <p className="mt-3 text-slate-700">
            An optional official certificate costs £15. HomeBuyerCheck does not purchase that certificate. Not every
            local authority has migrated onto the HMLR service yet; if yours has not, the council still holds the
            register.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Where Premium £4.99 fits</h2>
          <p className="mt-3 text-slate-700">
            Before you instruct a solicitor, Premium already surfaces the open-data overlays that overlap an LLC1:
            listed building, conservation area, Article 4 and TPO. Plus and Bundle inherit the same section. None of
            those tiers invent register rows or call a paid gateway.
          </p>

          <div id="report-options" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-slate-900">Your report options</h2>
            <p className="mt-3 text-slate-700">
              Same prices as the rest of the site. No separate LLC SKU.
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
              <p className="mt-1 text-xs text-slate-600">Free instant check, then Premium £4.99 if you want the overlays.</p>
              <div className="mt-3"><PostcodeLookup /></div>
            </div>
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
