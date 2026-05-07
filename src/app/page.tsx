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
            description: "Free postcode-level UK property report. Sales history, EPC, flood, crime, schools, council tax. Paid Standard (£14.99) and Premium (£29.99) reports add live HM Land Registry title register pulls.",
            url: "/",
            priceFrom: 0,
            priceTo: 29.99,
          }),
          howToSchema({
            name: "How to check a UK property before making an offer",
            description: "Run a free instant property check by postcode or address before committing to a solicitor or survey.",
            steps: [
              { name: "Enter the postcode or address", text: "Type any UK postcode or full address into the search bar. Google Places auto-completes UK addresses; postcodes.io auto-completes postcodes." },
              { name: "Pick the address", text: "Choose the exact address from the list of results for that postcode. Most postcodes return 5-30 addresses." },
              { name: "View the free report", text: "Sales history, EPC, flood, crime, schools and council tax populate instantly from official UK government APIs." },
              { name: "Upgrade if the property warrants it", text: "Standard (£14.99) adds full flood and environmental flags; Premium (£29.99) pulls a live HM Land Registry title register and adds the AI buyer's verdict." },
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
              Type the property&apos;s address to see sales history, EPC, flood risk, planning, crime, schools and broadband &mdash; instant and free.
              Premium adds the live HM Land Registry title register, lease analysis and environmental flags.
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
              <p className="mt-2 text-base text-gray-500 max-w-lg mx-auto">
                A solicitor&apos;s conveyancing searches alone cost £250-£450. Our reports start at £14.99.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <FeatureCard tone="blue" icon="📜" title="Full HM Land Registry title" body="Live pull of the title register with plain-English summary of tenure, charges and restrictive covenants." />
              <FeatureCard tone="amber" icon="🏚️" title="Lease length analysis" body="Sub-80-year leases trigger marriage value and harder mortgage approvals. Catch it before you instruct a solicitor." />
              <FeatureCard tone="red" icon="🌊" title="Surface water + climate flood" body="Free tier shows rivers and sea risk. Premium adds surface water and 2050 climate-projected risk." />
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value="£14.99" label="Standard report" sub="vs £250+ in solicitor searches" />
              <StatCard value="£29.99" label="Premium with live title" sub="HM Land Registry direct" />
              <StatCard value="30 sec" label="Free instant check" sub="Just enter a postcode or address" />
              <StatCard value="Instant" label="PDF report delivery" sub="Email + permanent online URL" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
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
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">STANDARD</span>
                <p className="mt-3 text-3xl font-extrabold text-gray-900">£14.99</p>
                <p className="text-xs text-gray-500 mt-0.5">One-time, signed PDF</p>
                <ul className="mt-4 space-y-1.5">
                  {STANDARD_LIST.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 text-xs mt-1">&#9733;</span>{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300 shadow-md relative">
                <span className="absolute -top-3 right-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Most popular</span>
                <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-xs font-bold">PREMIUM</span>
                <p className="mt-3 text-3xl font-extrabold text-gray-900">£29.99</p>
                <p className="text-xs text-gray-500 mt-0.5">Live HMLR title register</p>
                <ul className="mt-4 space-y-1.5">
                  {PREMIUM_LIST.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-800">
                      <span className="text-blue-500 text-xs mt-1">&#9733;</span>{i}
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
                Findings from due diligence routinely knock 1-3% off agreed prices. £29 to potentially knock thousands off the asking.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SCENARIOS.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
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

        {/* Browse by region — internal linking for SEO */}
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

function FeatureCard({ tone, icon, title, body }: { tone: "red" | "blue" | "amber"; icon: string; title: string; body: string }) {
  const toneClass = tone === "red" ? "bg-red-50" : tone === "amber" ? "bg-amber-50" : "bg-blue-50";
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full ${toneClass} flex items-center justify-center mx-auto mb-3 text-2xl`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
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
  "Crime stats (12 months)",
  "Council tax authority",
  "5 closest schools",
  "Broadband + 4G/5G coverage",
];

const STANDARD_LIST = [
  "Everything in Free",
  "Full flood risk (rivers / sea / surface water)",
  "Listed building + conservation flags",
  "Restrictive covenants flag",
  "Coal mining reporting area flag",
  "Signed PDF + permanent online URL",
];

const PREMIUM_LIST = [
  "Everything in Standard",
  "Live HM Land Registry title register",
  "Lease length + tenure analysis",
  "Climate-projected flood (2050)",
  "Radon / subsidence flags",
  "AI buyer's verdict & recommendations",
];

const SCENARIOS = [
  { title: "Lease length surprises", body: "Sub-80-year leases trigger marriage value and are harder to mortgage. Find this BEFORE you instruct a solicitor and waste £1,500 of conveyancing fees." },
  { title: "Hidden flood risk", body: "Insurers hike premiums 2-5x for properties in known flood zones. Better to discover this before you fall in love with a kitchen." },
  { title: "Past mining activity", body: "Coal Authority reporting areas often need a £60 CON29M search. We flag the area for free so you can plan." },
  { title: "Restrictive covenants", body: "Some titles ban running a business from home, parking caravans, or extending. Spot it on the title register before exchange." },
];

const STEPS = [
  { title: "Enter a UK postcode or address", body: "Use our Google-powered autocomplete to type any UK address or postcode." },
  { title: "See the free instant report", body: "Sales history, EPC, flood, crime, schools and council tax — sourced directly from public government data." },
  { title: "Upgrade if the property is worth a closer look", body: "Standard (£14.99) adds full flood + environmental flags. Premium (£29.99) pulls a live HM Land Registry title register and adds the AI buyer's verdict." },
];

const FAQ = [
  { q: "Is this a substitute for a solicitor's conveyancing searches?", a: "No. This is informational and designed to be used BEFORE you instruct a solicitor — to help you decide whether to proceed and what to ask. Conveyancing searches remain essential before exchange." },
  { q: "Where does the data come from?", a: "Sales history is HM Land Registry. EPC is Open Data Communities. Flood is the Environment Agency. Crime is data.police.uk. Schools is GIAS / Ofsted. Council tax is the VOA. All under the Open Government Licence v3.0." },
  { q: "How fast is the report delivered?", a: "The free postcode-level report is instant. Paid Standard and Premium reports are delivered by email within 60 seconds, with a signed PDF and a permanent online report URL." },
  { q: "How is this different from buying a £7 title register from gov.uk?", a: "HM Land Registry sells the raw PDF for £7. We add a plain-English summary, an automated lease-length analysis, and cross-reference against flood, planning, listed-building and mining datasets so the title sits in context. We also bundle a signed PDF you can use to renegotiate the offer." },
  { q: "Does it cover Scotland and Northern Ireland?", a: "England and Wales for now. Scotland and Northern Ireland use separate land registries — both on the roadmap." },
];
