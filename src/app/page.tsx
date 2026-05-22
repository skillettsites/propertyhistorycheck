import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { organisationSchema, websiteSchema, faqSchema, serviceSchema, howToSchema } from "@/lib/seo/schema";

export default function HomePage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          organisationSchema(),
          websiteSchema(),
          serviceSchema({
            name: "UK property history check",
            description: "Free postcode-level UK property report covering sales history, EPC, flood, crime, schools, council tax and broadband. £4.99 Premium adds the full ground-risk panel (radon, mining, shrink-swell, landslide), listed/conservation overlays, BSR Higher-Risk Building register status, ownership flag, Companies House owner check, Property Chamber tribunal history and an AI buyer's verdict. £6.99 Premium+ adds three AI briefs (Solicitor, Surveyor, Mortgage broker) and an on-demand Negotiation Report.",
            url: "/",
            priceFrom: 0,
            priceTo: 6.99,
          }),
          howToSchema({
            name: "How to check a UK property before making an offer",
            description: "Run a free instant property check by postcode or address before committing to a solicitor or survey.",
            steps: [
              { name: "Enter the postcode or address", text: "Type any UK postcode or full address into the search bar. Google Places auto-completes UK addresses; postcodes.io auto-completes postcodes." },
              { name: "Pick the address", text: "Choose the exact address from the list of results for that postcode. Most postcodes return 5-30 addresses." },
              { name: "View the free report", text: "Sales history, EPC, flood, crime, schools and council tax populate instantly from official UK government APIs." },
              { name: "Upgrade if the property warrants it", text: "Upgrade to £4.99 Premium for the full ground-risk panel, BSR Higher-Risk Building register, ownership and Companies House owner check, Property Chamber tribunal history and AI buyer's verdict. Or go straight to £6.99 Premium+ to add the AI Solicitor, Surveyor and Mortgage briefs plus an on-demand Negotiation Report." },
            ],
          }),
          faqSchema(FAQ),
        ]}
      />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium">
              The UK&apos;s most thorough pre-offer property check
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Check Any UK Property{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                In 30 Seconds.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-7 max-w-xl mx-auto">
              Run a free instant check on any UK property using official Land Registry, government and Companies House data, before you make an offer.
            </p>
            <div className="flex justify-center">
              <PostcodeLookup variant="dark" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Tick /> Official HM Land Registry &amp; gov data
              </span>
              <span className="flex items-center gap-1.5">
                <Tick /> Cheaper than a single solicitor search
              </span>
              <span className="flex items-center gap-1.5">
                <Tick /> No sign-up needed
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full block">
              <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Why upgrade to a paid report?
              </h2>
              <p className="mt-2 text-base text-gray-500 max-w-2xl mx-auto">
                The free report covers basic sales + risk data anyone can find. The £4.99 Premium tier adds the data that breaks deals; £6.99 Premium+ turns each flag into an action, and typically saves buyers £3,000-£15,000 on the offer.
              </p>
            </div>
            <p className="text-center text-xs font-bold uppercase tracking-wider text-blue-700 mt-6 mb-3">Premium £4.99 adds</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <FeatureCard tone="blue" icon="🏢" title="Companies House owner check" body="If the registered owner is a company, we pull live insolvency, outstanding charges and disqualified-director records before you offer. Live HMLR CCOD/OCOD match for UK + overseas company ownership." />
              <FeatureCard tone="amber" icon="⚖️" title="Property Chamber tribunal history" body="Has the building or freeholder been to the First-tier Tribunal? See every published service-charge dispute, leasehold case, EWS1 challenge and decision, ingested fresh from gov.uk daily." />
              <FeatureCard tone="red" icon="🏗️" title="BSR Higher-Risk Building register" body="Post-Grenfell cladding regime: every building over 18m or 7 storeys is registered. Lenders refuse without EWS1 A or B1. We tell you instantly so you can ask the freeholder before offering." />
              <FeatureCard tone="emerald" icon="🌍" title="Full ground-risk panel" body="British Geological Survey radon (1-6), shrink-swell clay (1-5), landslide, ground stability. Coal Authority reporting areas. UKHSA radon mapping. The flags that drive insurance premiums + survey scope." />
              <FeatureCard tone="amber" icon="🏛️" title="Listed / conservation / Article 4" body="Listed Building grade I/II*/II from Historic England. Conservation area + Article 4 directions + TPO. Restricts what you can alter, material to extension plans, paint colours, even satellite dishes." />
              <FeatureCard tone="blue" icon="🧠" title="AI buyer's verdict + seller-question pack" body="Anthropic Claude reads every flag and writes 8-12 specific, lawyer-style questions to ask the seller. Tailored to THIS property, not a generic list. Forwarded to your conveyancer it saves 1-2 weeks of email back-and-forth." />
            </div>

            <p className="text-center text-xs font-bold uppercase tracking-wider text-indigo-700 mt-10 mb-3">Premium+ £6.99 adds (or £2 upgrade)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FeatureCard tone="indigo" icon="🎯" title="AI Negotiation Report, typically saves £3,000-£15,000" body="Enter the asking price and we model a defensible offer range from comparable sales + Bank of England Bank Rate + Land Registry UKHPI for the local authority + every risk flag found. AI rationale paragraph + affordability sketch + buying-agent voice you can forward to the estate agent." />
              <FeatureCard tone="blue" icon="📋" title="AI Solicitor brief, pre-exchange enquiries ready to forward" body="One-page TA6-style enquiry list formatted for your conveyancer. Catches the obscure flags (overseas owner without ROE compliance, BSR HRB without EWS1, tribunal-active leasehold) that take weeks to surface through normal conveyancing." />
              <FeatureCard tone="amber" icon="🔍" title="AI Surveyor brief, what to flag to your RICS surveyor" body="Translates the data flags into specific things a surveyor can physically inspect. 'Shrink-swell band 4 → look for diagonal cracking at corner returns.' Stops you paying £750 for a generic Level 2 that misses the local-specific issues." />
              <FeatureCard tone="emerald" icon="🏦" title="AI Mortgage broker brief, lending-friction flags up front" body="The flags that trigger lender underwriting (BSR HRB, Flood Zone 3, listed, non-standard construction). Verify mortgageability BEFORE applying. Stops the 40% of UK chains that fall through on mortgage refusal." />
            </div>

            <div className="text-center mt-8">
              <Link href="/sample" className="text-sm font-bold text-blue-700 hover:underline mr-5">See a sample £4.99 Premium report →</Link>
              <Link href="/sample-plus" className="text-sm font-bold text-indigo-700 hover:underline">See a sample £6.99 Premium+ report →</Link>
            </div>
          </div>
        </section>

        {/* See it in action, sample report links section */}
        <section className="py-14 md:py-16 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-700">See exactly what you get</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Sample reports, worked examples
              </h2>
              <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
                Every section walked through on a realistic London flat fixture. No card needed.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/sample" className="group bg-white rounded-2xl p-5 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Premium · £4.99</span>
                <p className="mt-3 font-bold text-gray-900">Full £4.99 Premium walk-through</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">Every section: ground risk, ownership, BSR HRB, tribunal history, Companies House check, AI buyer&apos;s verdict, seller questions. Realistic fictional fixture.</p>
                <p className="mt-3 text-xs font-bold text-blue-700">Open sample →</p>
              </Link>
              <Link href="/sample-plus" className="group bg-white rounded-2xl p-5 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Premium+ · £6.99</span>
                <p className="mt-3 font-bold text-gray-900">Premium+ overview, all four add-ons</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">The Negotiation Report + three AI briefs (Solicitor / Surveyor / Mortgage broker) at a glance. Links into each detailed sample.</p>
                <p className="mt-3 text-xs font-bold text-indigo-700">Open overview →</p>
              </Link>
              <Link href="/sample-negotiation" className="group bg-white rounded-2xl p-5 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Most popular</span>
                <p className="mt-3 font-bold text-gray-900">Negotiation Report, £3k-£15k savings</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">Modelled offer range. Comparable sales + BoE Bank Rate + UKHPI + flag adjustments + AI rationale. Worked example with the full maths shown.</p>
                <p className="mt-3 text-xs font-bold text-purple-700">Open Negotiation sample →</p>
              </Link>
              <Link href="/sample-solicitor" className="group bg-white rounded-2xl p-5 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Premium+</span>
                <p className="mt-3 font-bold text-gray-900">AI Solicitor brief</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">TA6-style pre-exchange enquiry list ready to forward to your conveyancer. Each item tied to a public-record source.</p>
                <p className="mt-3 text-xs font-bold text-emerald-700">Open Solicitor sample →</p>
              </Link>
              <Link href="/sample-surveyor" className="group bg-white rounded-2xl p-5 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Premium+</span>
                <p className="mt-3 font-bold text-gray-900">AI Surveyor brief</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">Property-specific list of things to flag to your RICS surveyor. Targeted inspection prompts that catch what generic Level 2 reports miss.</p>
                <p className="mt-3 text-xs font-bold text-amber-700">Open Surveyor sample →</p>
              </Link>
              <Link href="/sample-mortgage" className="group bg-white rounded-2xl p-5 border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg transition-all">
                <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Premium+</span>
                <p className="mt-3 font-bold text-gray-900">AI Mortgage broker brief</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">Lending-friction flags before you apply: BSR HRB, flood band high, listed, non-standard construction. Stops mortgage refusal chains from collapsing late.</p>
                <p className="mt-3 text-xs font-bold text-rose-700">Open Mortgage sample →</p>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link href="/property-history-check" className="text-sm font-bold text-blue-700 hover:underline">Read the full how-it-works guide →</Link>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value="Free" label="Postcode-level report" sub="No sign-up needed" />
              <StatCard value="£4.99" label="Address-level paid report" sub="vs £250+ in solicitor searches" />
              <StatCard value="30 sec" label="Free instant check" sub="Just enter a postcode or address" />
              <StatCard value="Instant" label="Online report delivery" sub="Email link + permanent online URL" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                What&apos;s in each tier
              </h2>
              <p className="mt-2 text-base text-gray-500 max-w-lg mx-auto">
                Start free. Upgrade only if the property is worth a closer look.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200">
                <span className="inline-block px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">FREE</span>
                <p className="mt-3 text-3xl font-extrabold text-gray-900">£0</p>
                <p className="text-xs text-gray-500 mt-0.5">No sign-up needed</p>
                <ul className="mt-4 space-y-1.5">
                  {FREE_LIST.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 text-xs mt-1">&#10003;</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 sm:p-6 border-2 border-blue-300 shadow-md relative">
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">PREMIUM</span>
                <p className="mt-3 text-3xl font-extrabold text-gray-900">£4.99</p>
                <p className="text-xs text-gray-500 mt-0.5">One-time, instant online report</p>
                <ul className="mt-4 space-y-1.5">
                  {PREMIUM_LIST.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-800">
                      <span className="text-blue-500 text-xs mt-1">&#9733;</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 sm:p-6 border-2 border-indigo-300 shadow-md relative">
                <span className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Best value</span>
                <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">PREMIUM+</span>
                <p className="mt-3 text-3xl font-extrabold text-gray-900">£6.99</p>
                <p className="text-xs text-gray-500 mt-0.5">Or £2 upgrade if you already have Premium</p>
                <ul className="mt-4 space-y-1.5">
                  {PREMIUM_PLUS_LIST.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-800">
                      <span className="text-indigo-500 text-xs mt-1">&#9733;</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Why check before you offer?
              </h2>
              <p className="mt-2 text-base text-gray-500 max-w-lg mx-auto">
                Findings from due diligence routinely knock 1-3% off agreed prices. £4.99-£6.99 to potentially knock thousands off the asking.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SCENARIOS.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold text-gray-900">{s.title}</p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">How it works</h2>
            </div>
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{s.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mt-1">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQ.map((q) => (
                <details key={q.q} className="group bg-white rounded-xl border border-gray-200 p-5">
                  <summary className="font-semibold text-sm text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {q.q}
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform text-xs">&#9660;</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{q.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/check" className="inline-block bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all">
                Check a UK property &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison + cheapest landing pages, internal linking for SEO */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-3">
              How HomeBuyerCheck compares
            </h2>
            <p className="text-center text-sm text-slate-600 max-w-xl mx-auto">
              We&apos;re the cheapest UK property check that includes ownership, ground risk, BSR Higher-Risk Building register, Property Chamber tribunal history and AI analysis. Read the full comparison.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3">
              <li><Link href="/compare" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">Full comparison table →</span><span className="block text-sm text-slate-600 mt-1">HomeBuyerCheck vs CheckMyFile, HMLR, solicitor searches, RICS surveys.</span></Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">Cheapest UK property check ranked →</span><span className="block text-sm text-slate-600 mt-1">£3 to £450, what each price actually buys you.</span></Link></li>
              <li><Link href="/blog/best-checkmyfile-alternative-uk" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">CheckMyFile alternative →</span><span className="block text-sm text-slate-600 mt-1">£4.99 HomeBuyerCheck vs £19.99 CheckMyFile, side-by-side.</span></Link></li>
              <li><Link href="/blog/property-due-diligence-cost-uk" className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300"><span className="font-bold text-slate-900">Total UK due-diligence cost 2026 →</span><span className="block text-sm text-slate-600 mt-1">£1,685-£3,650 from offer to exchange. Where every pound goes.</span></Link></li>
            </ul>
          </div>
        </section>

        {/* Browse by region, internal linking for SEO */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
              Browse property checks by region
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol",
                "Cambridge", "Oxford", "Brighton", "Reading", "Bath", "Cardiff",
              ].map((t) => (
                <Link key={t} href={`/town/${t.toLowerCase()}`} className="text-sm text-blue-600 hover:underline">{t}</Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/town" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Browse all towns &rarr;</Link>
              <span className="mx-3 text-gray-300">·</span>
              <Link href="/area" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Browse all postcode areas &rarr;</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Tick() {
  return (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FeatureCard({ tone, icon, title, body }: { tone: "red" | "blue" | "amber" | "emerald" | "indigo" | "purple" | "rose"; icon: string; title: string; body: string }) {
  const toneClass: Record<string, string> = {
    red: "bg-red-50",
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    indigo: "bg-indigo-50",
    purple: "bg-purple-50",
    rose: "bg-rose-50",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full ${toneClass[tone]} flex items-center justify-center mb-3 text-2xl`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 font-semibold">{label}</p>
      <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>
    </div>
  );
}

const FREE_LIST = [
  "Sales history (since 1995)",
  "EPC rating + build year",
  "Flood risk band (rivers, sea, surface water)",
  "Crime stats (12 months)",
  "Council tax authority + band",
  "5 closest schools with Ofsted",
  "Broadband + 4G/5G coverage by carrier",
  "Air quality, noise and ground-risk score",
];

const PREMIUM_LIST = [
  "Everything in Free",
  "Full BGS ground-risk panel (shrink-swell, landslide, mining, etc.)",
  "Radon Affected Area band 1-6",
  "Listed building grade + name + Article 4 + conservation area overlay",
  "BSR Higher-Risk Building register status (high-rise residential)",
  "Ownership flag (UK / overseas company) via HMLR CCOD/OCOD",
  "Companies House owner check (insolvency, outstanding charges, disqualified directors when corporate)",
  "Property Chamber tribunal history at this building + postcode",
  "AI buyer's verdict and AI seller-question pack",
  "Permanent online URL to share with your solicitor",
];

const PREMIUM_PLUS_LIST = [
  "Everything in Premium",
  "AI Solicitor brief, TA6-style pre-exchange enquiries for your conveyancer",
  "AI Surveyor brief, what to flag to your RICS surveyor at THIS property",
  "AI Mortgage broker brief, lending-friction flags before you apply",
  "Negotiation Report, modelled offer range from comps + BoE Bank Rate + UKHPI + every flag found",
  "Higher priority support",
];

const SCENARIOS = [
  { title: "Corporate owner with red flags", body: "If the registered proprietor is a company, we pull live Companies House records, outstanding charges, recent insolvency events, disqualified directors. Vital before you commit." },
  { title: "Tribunal history at the building", body: "Has the freeholder or building been to the First-tier Property Chamber? See service-charge disputes and decisions before you commit, especially on flats." },
  { title: "Hidden flood and ground risk", body: "Insurers hike premiums 2-5x for properties in known flood or shrink-swell zones. Better to discover this before you fall in love with a kitchen." },
  { title: "Past mining and radon", body: "Coal Authority reporting areas often need a £32 CON29M search. UKHSA radon bands 4-6 warrant a £30 test. We flag both before you spend." },
];

const STEPS = [
  { title: "Enter a UK postcode or address", body: "Use our Google-powered autocomplete to type any UK address or postcode." },
  { title: "See the free instant report", body: "Sales history, EPC, flood, crime, schools and council tax, sourced directly from public government data." },
  { title: "Upgrade if the property is worth a closer look", body: "£4.99 Premium adds the full BGS hazard panel, listed/conservation overlays, BSR Higher-Risk Building register, ownership and Companies House checks, Property Chamber tribunal history and the AI buyer's verdict. £6.99 Premium+ adds three AI briefs (Solicitor / Surveyor / Mortgage broker) and an on-demand Negotiation Report, or upgrade for £2 if you've already bought Premium." },
];

const FAQ = [
  { q: "Is this a substitute for a solicitor's conveyancing searches?", a: "No. This is informational and designed to be used BEFORE you instruct a solicitor, to help you decide whether to proceed and what to ask. Conveyancing searches remain essential before exchange." },
  { q: "Where does the data come from?", a: "Sales history is HM Land Registry. EPC is the new MHCLG endpoint (with legacy fallback). Flood is the Environment Agency. Crime is data.police.uk. Schools is GIAS / Ofsted. Council tax is the VOA. Ground risk and radon come from BGS and UKHSA. Ownership data is HMLR CCOD/OCOD. Tribunal cases are gov.uk Property Chamber. All under the Open Government Licence v3.0." },
  { q: "How fast is the report delivered?", a: "The free postcode-level report is instant. The £4.99 Premium and £6.99 Premium+ reports are delivered by email within 60 seconds with a permanent online report URL." },
  { q: "What's in £4.99 Premium that isn't in the free report?", a: "Full BGS ground-risk panel (shrink-swell, landslide, mining bands), Radon Affected Area band 1-6, listed-building grade and conservation-area / Article 4 overlay detail, BSR Higher-Risk Building register status, ownership flag with Companies House check on corporate owners, Property Chamber tribunal history at the building and postcode, and an AI buyer's verdict tailored to the flags found. All from free, official UK data." },
  { q: "What's in £6.99 Premium+ that isn't in Premium?", a: "Three AI audience-specific briefs grounded on every flag found: (1) AI Solicitor brief, TA6-style pre-exchange enquiries formatted for your conveyancer; (2) AI Surveyor brief, specific items to flag to your RICS surveyor; (3) AI Mortgage broker brief, lending-friction flags. Plus an on-demand Negotiation Report that models a defensible offer range from comparable sales + Bank of England Bank Rate + Land Registry UKHPI + every risk flag. If you've already bought Premium, you can upgrade in-place for £2." },
  { q: "Does it cover Scotland and Northern Ireland?", a: "England and Wales for now. Scotland and Northern Ireland use separate land registries, both on the roadmap." },
];
