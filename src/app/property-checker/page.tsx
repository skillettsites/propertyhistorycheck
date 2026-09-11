import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { PRODUCTS } from "@/lib/products";
import { breadcrumbSchema, faqSchema, organisationSchema } from "@/lib/seo/schema";

/**
 * /property-checker: the dedicated landing page for the "property checker"
 * query. Answer-first, the same free check form as /free-property-check, the
 * real data sources behind each check (read from src/lib/apis), a comparison
 * against the three sites a searcher for this term also sees, and Product +
 * Offer schema generated from src/lib/products.ts so the prices can never
 * drift from what /check sells.
 */

const SITE = "https://www.homebuyercheck.co.uk";
const PATH = "/property-checker";
const PRICES_CHECKED = "11 September 2026";

export const metadata: Metadata = {
  title: "Property Checker: Check Any UK Property Before You Buy (Free, then £4.99)",
  description:
    "Free online property checker for any address in England and Wales: sales history, EPC, flood, crime, schools, council tax, ground risk and planning constraints in 30 seconds. £4.99 adds ownership, Companies House, BSR register, tribunal history and an AI verdict. Compared with PropertyChecker.co.uk, HouseCheckup and Check Before You Buy.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Property Checker: check any UK property before you buy",
    description:
      "Free instant property check on any address in England and Wales, then £4.99 for ownership, ground risk, BSR register, tribunal history and an AI buyer's verdict.",
    url: PATH,
    type: "website",
  },
};

interface CheckRow {
  check: string;
  tier: "Free" | "Premium £4.99" | "Premium+ £6.99";
  source: string;
}

/** Each row names the data source the code actually calls (see src/lib/apis). */
const CHECKS: CheckRow[] = [
  { check: "Sales history since 1995, with similar sales nearby", tier: "Free", source: "HM Land Registry Price Paid Data (landregistry.data.gov.uk)" },
  { check: "EPC rating, build year and floor area", tier: "Free", source: "MHCLG Energy Performance of Buildings register" },
  { check: "Flood risk from rivers, sea and surface water, plus flood zone", tier: "Free", source: "Environment Agency flood risk and Flood Map for Planning" },
  { check: "Crime in the last 12 months", tier: "Free", source: "data.police.uk" },
  { check: "Nearest schools with Ofsted ratings", tier: "Free", source: "Get Information About Schools (GIAS) and Ofsted" },
  { check: "Council tax band and annual charge", tier: "Free", source: "Valuation Office Agency bands by council" },
  { check: "Broadband speeds and 4G/5G coverage by operator", tier: "Free", source: "Ofcom Connected Nations coverage API" },
  { check: "Planning constraints: conservation area, TPO, Article 4, green belt, AONB", tier: "Free", source: "planning.data.gov.uk" },
  { check: "Ground stability: shrink-swell clay, landslide, compressible ground", tier: "Free", source: "British Geological Survey GeoSure" },
  { check: "Road and rail noise", tier: "Free", source: "DEFRA noise mapping (round 4), via environment.data.gov.uk" },
  { check: "Air quality", tier: "Free", source: "DEFRA UK-AIR" },
  { check: "Listed building status", tier: "Free", source: "Historic England National Heritage List" },
  { check: "Demographics, tenure and deprivation for the neighbourhood", tier: "Free", source: "ONS Census 2021 (Nomis) and the Index of Multiple Deprivation" },
  { check: "EV charging points and solar potential", tier: "Free", source: "Open Charge Map; PVGIS (EU Joint Research Centre)" },
  { check: "Radon band (1 to 6) and coal mining reporting area", tier: "Premium £4.99", source: "UKHSA/BGS radon dataset; Coal Authority reporting areas" },
  { check: "Owner is a UK or overseas company", tier: "Premium £4.99", source: "HM Land Registry CCOD and OCOD datasets" },
  { check: "Company owner check: insolvency, charges, disqualified directors", tier: "Premium £4.99", source: "Companies House API" },
  { check: "Higher-Risk Building register status (post-Grenfell)", tier: "Premium £4.99", source: "Building Safety Regulator public register" },
  { check: "Tribunal decisions at the building and postcode", tier: "Premium £4.99", source: "gov.uk residential property tribunal decisions (First-tier Tribunal, Property Chamber)" },
  { check: "Listed grade, conservation area and Article 4 overlays in detail", tier: "Premium £4.99", source: "Historic England and planning.data.gov.uk" },
  { check: "AI buyer's verdict and a tailored seller-question pack", tier: "Premium £4.99", source: "Anthropic Claude, grounded on the checks above" },
  { check: "AI Solicitor, Surveyor and Mortgage-broker briefs", tier: "Premium+ £6.99", source: "Anthropic Claude, grounded on the checks above" },
  { check: "Negotiation Report: a modelled offer range from comparables, Bank Rate and the flags", tier: "Premium+ £6.99", source: "HM Land Registry comparables and UKHPI; Bank of England IADB" },
];

interface Competitor {
  name: string;
  price: string;
  free: string;
  input: string;
  coverage: string;
  soldPrices: string;
  risk: string;
  ownership: string;
  building: string;
  ai: string;
  delivery: string;
  us?: boolean;
}

/**
 * Competitor facts were read from each site's live pages on PRICES_CHECKED.
 * Where a site's pages do not list a feature the cell says so rather than
 * asserting it is absent.
 */
const COMPETITORS: Competitor[] = [
  {
    name: "HomeBuyerCheck",
    price: `Free, then ${PRODUCTS.standard.priceFormatted} Premium or ${PRODUCTS.standard_plus.priceFormatted} Premium+ (one-off)`,
    free: "Yes, a full address-level report",
    input: "Postcode or address",
    coverage: "England and Wales",
    soldPrices: "Yes, HM Land Registry, with similar sales nearby",
    risk: "Yes: flood, ground stability, radon, coal, noise, air, planning constraints",
    ownership: "Yes (Premium): HM Land Registry CCOD/OCOD plus a Companies House check",
    building: "Yes (Premium): BSR Higher-Risk Building register and tribunal decisions",
    ai: "Yes: AI verdict (Premium), three AI briefs and a Negotiation Report (Premium+)",
    delivery: "Instant online, permanent private URL, PDF by email",
    us: true,
  },
  {
    name: "PropertyChecker.co.uk",
    price: "Free lookups; Land Registry documents ordered for a £4.99 service fee on top of the £7 HM Land Registry fee; copy of a lease £8.99",
    free: "Yes, free sold-price, tenure, EPC and council tax lookups",
    input: "Postcode, then pick the address",
    coverage: "England and Wales",
    soldPrices: "Yes, HM Land Registry price paid since 1995",
    risk: "Not listed on its pages",
    ownership: "Points users to the £7 HM Land Registry title register download",
    building: "Not listed on its pages",
    ai: "No",
    delivery: "Instant lookups; ordered documents by email",
  },
  {
    name: "HouseCheckup",
    price: "Lite £9.99, Complete £24.99 (one-off, VAT included)",
    free: "A postcode-area risk screen; its pricing page says there is no free version of the report",
    input: "Address",
    coverage: "England, Wales and Scotland",
    soldPrices: "Yes, HM Land Registry with UK House Price Index context",
    risk: "Yes: flood, BGS ground hazards, radon, coal, noise, air quality",
    ownership: "Not among the report sections listed on its homepage",
    building: "Not listed on its pages",
    ai: "No; a 0 to 100 score from six factors, report human-checked",
    delivery: "Human-checked PDF by email",
  },
  {
    name: "Check Before You Buy",
    price: "£9.99 Property Due Diligence Report; £99 Premium Plus human-reviewed investigation within 24 hours",
    free: "Yes, a free property snapshot by email",
    input: "A Rightmove listing link",
    coverage: "Properties listed on Rightmove",
    soldPrices: "Listing price, tenure and key listing details",
    risk: "Environmental and flood considerations flagged for further checking",
    ownership: "Not listed on its pages",
    building: "Not listed on its pages",
    ai: "Not stated; Premium Plus is human-reviewed",
    delivery: "Report by email",
  },
];

const COMPARE_ROWS: Array<{ label: string; key: keyof Omit<Competitor, "name" | "us"> }> = [
  { label: "Price", key: "price" },
  { label: "Free option", key: "free" },
  { label: "What you enter", key: "input" },
  { label: "Coverage", key: "coverage" },
  { label: "Sold prices", key: "soldPrices" },
  { label: "Flood and ground risk", key: "risk" },
  { label: "Who owns it", key: "ownership" },
  { label: "Building safety and tribunal history", key: "building" },
  { label: "AI analysis", key: "ai" },
  { label: "Delivery", key: "delivery" },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is a property checker?",
    a: "A property checker is an online tool that pulls the public records held about a property and its area into one report so you can check it before you offer: sales history, EPC, flood risk, crime, schools, council tax, planning constraints and ground risk. HomeBuyerCheck's property checker does that free for any address in England and Wales in about 30 seconds, and for £4.99 adds ownership, a Companies House owner check, the Building Safety Regulator register, tribunal history and an AI buyer's verdict.",
  },
  {
    q: "Is the property checker free?",
    a: "Yes. The free report is a full address-level check with no sign-up: sales history, EPC, flood, crime, schools, council tax, broadband, planning constraints, ground stability, noise, air quality and listed-building status. Premium at £4.99 and Premium+ at £6.99 are optional one-off upgrades.",
  },
  {
    q: "Which properties can I check?",
    a: "Any residential address in England and Wales. The data sources (HM Land Registry, Environment Agency, planning.data.gov.uk, the Building Safety Regulator and the Property Chamber) do not cover Scotland or Northern Ireland, which have separate registers.",
  },
  {
    q: "Is a property check the same as a property search?",
    a: "No. A property check is a pre-offer screen you run yourself from public data. Property searches (local authority, drainage and environmental, typically £250 to £450) are formal enquiries your solicitor orders after you have offered. The check tells you whether the property is worth the search money; it does not replace the searches or a RICS survey.",
  },
  {
    q: "How is HomeBuyerCheck different from propertychecker.co.uk?",
    a: "PropertyChecker.co.uk offers free individual lookups built on HM Land Registry price paid data, such as sold prices and freehold or leasehold at the last sale, plus a paid document-ordering service. HomeBuyerCheck is one report for one address that adds flood, ground, planning, crime and schools free, and ownership, Companies House, BSR register and tribunal history for £4.99. Full comparison in the HomeBuyerCheck vs PropertyChecker.co.uk post.",
  },
  {
    q: "How long does the check take?",
    a: "The free report loads in about 30 seconds. Premium and Premium+ reports are generated within about a minute of payment and delivered to a permanent private URL and by email.",
  },
];

function productSchema() {
  const tiers = [PRODUCTS.standard, PRODUCTS.standard_plus, PRODUCTS.bundle];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "HomeBuyerCheck property report",
    description:
      "Pre-offer property check for any address in England and Wales. Free instant report, with paid tiers adding ownership, Companies House, BSR Higher-Risk Building register, tribunal history, ground risk and AI briefs.",
    brand: { "@type": "Organization", name: "HomeBuyerCheck" },
    url: `${SITE}${PATH}`,
    offers: tiers.map((t) => ({
      "@type": "Offer",
      name: t.name,
      sku: t.id,
      description: t.description,
      price: (t.priceInPence / 100).toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `${SITE}/check`,
      seller: { "@type": "Organization", name: "HomeBuyerCheck" },
    })),
  };
}

const tierBadge: Record<CheckRow["tier"], string> = {
  Free: "bg-emerald-100 text-emerald-800",
  "Premium £4.99": "bg-blue-100 text-blue-800",
  "Premium+ £6.99": "bg-indigo-100 text-indigo-800",
};

export default function PropertyCheckerPage() {
  return (
    <>
      <JsonLd data={[
        organisationSchema(),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Property checker", url: PATH },
        ]),
        faqSchema(FAQ),
        productSchema(),
      ]} />
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero with the free check form */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-300">Free online property checker &middot; England and Wales</p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold leading-tight">Property Checker: check any UK property before you buy</h1>
            <p id="tldr" className="speakable-summary mt-5 max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed">
              Enter a postcode or address and the property checker pulls the public records for that home into one report in about 30 seconds: sales history, EPC, flood risk, crime, schools, council tax, broadband, planning constraints and ground stability, <strong>free and with no sign-up</strong>. If the property is worth a closer look, <strong>{PRODUCTS.standard.priceFormatted}</strong> adds who owns it, a Companies House check on any company owner, the Building Safety Regulator register, tribunal history and an AI buyer&apos;s verdict.
            </p>
            <div className="mt-7 max-w-xl"><PostcodeLookup variant="dark" /></div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <span>&#10003; 20+ official UK data sources</span>
              <span>&#10003; No account, no subscription</span>
              <span>&#10003; Paid tiers are one-off: {PRODUCTS.standard.priceFormatted} or {PRODUCTS.standard_plus.priceFormatted}</span>
            </div>
          </div>
        </section>

        {/* What it checks */}
        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What the property checker checks, and where each answer comes from</h2>
          <p className="mt-3 text-slate-700">
            Every row below is a live lookup the report runs against the named source. Nothing is estimated or typed in by hand. The free tier is a complete report on its own; the paid tiers add the checks that need pre-ingested government datasets or AI analysis.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left">
                  <th className="p-3 font-bold text-slate-900">Check</th>
                  <th className="p-3 font-bold text-slate-900 whitespace-nowrap">Tier</th>
                  <th className="p-3 font-bold text-slate-900">Data source</th>
                </tr>
              </thead>
              <tbody>
                {CHECKS.map((r) => (
                  <tr key={r.check} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="p-3 text-slate-800">{r.check}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tierBadge[r.tier]}`}>{r.tier}</span>
                    </td>
                    <td className="p-3 text-slate-600">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            UK government data is used under the Open Government Licence v3.0. The AI verdict and briefs are written by Anthropic Claude from the checks above and never add facts of their own.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/sample" className="font-semibold text-blue-700 underline-offset-2 hover:underline">See a sample {PRODUCTS.standard.priceFormatted} report &rarr;</Link>
            <Link href="/sample-plus" className="font-semibold text-indigo-700 underline-offset-2 hover:underline">See a sample {PRODUCTS.standard_plus.priceFormatted} report &rarr;</Link>
            <Link href="/property-history-check" className="font-semibold text-slate-700 underline-offset-2 hover:underline">How the report is built &rarr;</Link>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How it compares with other UK property checkers</h2>
            <p className="mt-3 text-slate-700 max-w-3xl">
              Three other sites come up for the same search. Their prices and features below were read from their live pages on <strong>{PRICES_CHECKED}</strong>. Where a site&apos;s pages do not mention a feature, the cell says so rather than claiming it is missing.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left">
                    <th className="p-3 font-bold text-slate-900 w-40"> </th>
                    {COMPETITORS.map((c) => (
                      <th key={c.name} className={`p-3 font-bold ${c.us ? "text-emerald-900" : "text-slate-900"}`}>{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-slate-100 last:border-0 align-top">
                      <th scope="row" className="p-3 text-left font-semibold text-slate-700 whitespace-nowrap">{row.label}</th>
                      {COMPETITORS.map((c) => (
                        <td key={c.name} className={`p-3 ${c.us ? "bg-emerald-50/60 text-emerald-950" : "text-slate-700"}`}>{c[row.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Sources: propertychecker.co.uk homepage, land-registry-documents, get-a-copy-lease and find-property-owner pages; housecheckup.co.uk homepage and pricing page; checkbeforeyoubuy.co.uk homepage, free-report and premium-plus pages. All fetched {PRICES_CHECKED}. Prices can change; check before you buy.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              <li><Link href="/blog/homebuyercheck-vs-propertychecker" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">HomeBuyerCheck vs PropertyChecker.co.uk &rarr;</span><span className="block text-slate-600 mt-1">Free lookups against a full report, with what each site actually offers.</span></Link></li>
              <li><Link href="/blog/homebuyercheck-vs-housecheckup" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">HomeBuyerCheck vs HouseCheckup &rarr;</span><span className="block text-slate-600 mt-1">{PRODUCTS.standard.priceFormatted} against £9.99 and £24.99, report by report.</span></Link></li>
              <li><Link href="/compare" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">Full comparison table &rarr;</span><span className="block text-slate-600 mt-1">CheckMyFile, HM Land Registry direct, solicitor searches and RICS surveys.</span></Link></li>
              <li><Link href="/blog/best-property-check-tools-uk" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">Best property check tools ranked &rarr;</span><span className="block text-slate-600 mt-1">Every option by price and scope.</span></Link></li>
            </ul>
          </div>
        </section>

        {/* Tiers, prices straight from products.ts */}
        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What the paid tiers cost</h2>
          <p className="mt-3 text-slate-700">One-off payments, no subscription. Prices are read from the same product list the checkout uses.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Premium</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{PRODUCTS.standard.priceFormatted}</p>
              <p className="mt-2 text-sm text-slate-700">Ownership and Companies House check, BSR register, tribunal history, radon and coal bands, listed and conservation overlays, AI verdict and seller questions.</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Premium+</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{PRODUCTS.standard_plus.priceFormatted}</p>
              <p className="mt-2 text-sm text-slate-700">Everything in Premium plus the AI Solicitor, Surveyor and Mortgage-broker briefs and the on-demand Negotiation Report.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{PRODUCTS.bundle.name}</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{PRODUCTS.bundle.priceFormatted}</p>
              <p className="mt-2 text-sm text-slate-700">Everything in Premium+ plus the title and tenure synthesis and the leasehold extension calculator.</p>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Start with the free check. Upgrade only if the property is worth it.</p>
            <div className="mt-3"><PostcodeLookup size="md" placeholder="Postcode or address..." /></div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Property checker FAQs</h2>
            <dl className="mt-6 space-y-5">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-bold text-slate-900">{f.q}</dt>
                  <dd className="mt-1.5 text-slate-700 text-[15px] leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-xs text-slate-500">
              HomeBuyerCheck is an information service. It is not a substitute for conveyancing searches by a qualified solicitor or a RICS survey. Verify findings with a professional before you commit.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
