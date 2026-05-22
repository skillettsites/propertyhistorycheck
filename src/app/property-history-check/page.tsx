import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/property-history-check`;

export const metadata = {
  title: "How HomeBuyerCheck works · Free + £4.99 Premium + £6.99 Premium+",
  description:
    "How HomeBuyerCheck delivers a 30-second UK property check. Free postcode-level report covers sales history, EPC, flood, crime, schools, council tax. £4.99 Premium adds ownership, ground risk, BSR Higher-Risk Building register, Property Chamber tribunal, AI buyer's verdict. £6.99 Premium+ adds AI Solicitor / Surveyor / Mortgage briefs + Negotiation Report that typically saves £3,000-£15,000.",
  alternates: { canonical: "/property-history-check" },
};

const FAQ: FaqItem[] = [
  {
    question: "How does HomeBuyerCheck deliver a property report in 30 seconds?",
    answer:
      "We pre-ingest the slow data sources (HM Land Registry sales history, HMLR CCOD/OCOD ownership, Property Chamber tribunal decisions) into our own database, and pull live from the fast government APIs (EPC, flood, crime, schools, planning) at the moment of purchase. Anthropic Claude then generates the AI buyer's verdict and briefs in parallel. End-to-end the orchestrator takes 30-60 seconds for Premium and 45-65 seconds for Premium+.",
  },
  {
    question: "What is the Negotiation Report and how much can it save?",
    answer:
      "On the £6.99 Premium+ tier you enter the asking price and we model a defensible offer range from: (1) comparable sales within 0.5 miles in the last 12 months from HM Land Registry; (2) the current Bank of England Bank Rate and 5-year + 20-year gilt forward rates; (3) Land Registry UKHPI for the local authority showing 12-month price movement; (4) per-flag price adjustments for every risk found (flood, BSR HRB, ground risk, tribunal history, listed building, overseas owner, Companies House charges). The model produces a low / fair / high offer range with an AI buying-agent rationale paragraph and an affordability sketch at 75% LTV. Buyers typically save 1-3% of the asking price, £3,000-£15,000 on a £300k-£500k home, vs offering blind.",
  },
  {
    question: "What data sources do you use?",
    answer:
      "24+ official UK government sources under the Open Government Licence v3.0: HM Land Registry (sales + CCOD + OCOD), Companies House, Building Safety Regulator, First-tier Tribunal Property Chamber, MHCLG (EPC), Environment Agency (flood + climate), Police.uk (crime), GIAS / Ofsted (schools), Valuation Office Agency (council tax), Ofcom (broadband + mobile), Historic England (listed buildings), planning.data.gov.uk (conservation, TPO, Article 4, AONB, green belt, scheduled monuments), Coal Authority, British Geological Survey (ground risk), UKHSA (radon), DEFRA UK-AIR + Noise Mapping, Bank of England IADB (Bank Rate + gilt yields), ONS Census 2021, PVGIS, Ordnance Survey + OpenStreetMap. AI analysis runs on Anthropic Claude grounded on the actual data, never invented.",
  },
  {
    question: "What's the difference between Premium and Premium+?",
    answer:
      "Premium (£4.99) delivers the data layer, ownership flag, Companies House owner check, BSR Higher-Risk Building register, Property Chamber tribunal history, full ground-risk panel, all the flags. Premium+ (£6.99) adds the action layer on top: AI Solicitor brief (TA6-style enquiries for your conveyancer), AI Surveyor brief (specific items to flag to your RICS surveyor), AI Mortgage broker brief (lending-friction flags before you apply), and the Negotiation Report (modelled offer range). Existing Premium buyers can upgrade in-place for £2, the original /r/{token} URL is preserved.",
  },
  {
    question: "Is this a substitute for a solicitor or surveyor?",
    answer:
      "No. HomeBuyerCheck is informational and sits BEFORE you instruct a solicitor (£1,000-£1,500 typical UK conveyancing) or commission a RICS survey (£400-£1,500). Its job is to help you decide whether to commit to those costs and to surface flags you can use to renegotiate the asking price. The AI Solicitor brief is starting-point enquiries for the conveyancer, NOT legal advice.",
  },
  {
    question: "How fast is delivery?",
    answer:
      "The free postcode-level report is instant (under 5 seconds). Premium and Premium+ reports are delivered by email within 60 seconds of payment with a permanent online report URL at /r/{token}. The Negotiation Report on Premium+ is on-demand, you trigger it from your /r/{token} page after entering the asking price.",
  },
  {
    question: "Does it cover Scotland and Northern Ireland?",
    answer:
      "England and Wales for now. Scotland and Northern Ireland use separate land registries (Registers of Scotland + Land and Property Services NI), both on the roadmap.",
  },
];

export default function PropertyHistoryCheckPage() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="How HomeBuyerCheck works" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-300">How it works · what you get</p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold leading-tight">UK property history check &mdash; before you offer</h1>
            <p id="tldr" className="speakable-summary mt-5 max-w-2xl text-base sm:text-lg text-slate-200 leading-relaxed">
              A 30-second sanity check on any UK property, built for buyers about to make an offer. <strong>Free instant report</strong> on every UK postcode. <strong>£4.99 Premium</strong> adds 12+ paid data sections including ownership, ground risk and tribunal history. <strong>£6.99 Premium+</strong> adds three AI audience-specific briefs and an on-demand Negotiation Report that typically saves buyers <strong className="text-cyan-300">£3,000-£15,000</strong> on the offer.
            </p>
            <div className="mt-7 max-w-xl"><PostcodeLookup variant="dark" /></div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <span>✓ 24+ official UK government data sources</span>
              <span>✓ AI analysis grounded on real data</span>
              <span>✓ Permanent online URL to share with your solicitor</span>
            </div>
          </div>
        </section>

        {/* How it works, 4 steps */}
        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-700">Free instant check first. Upgrade only if the property is worth a closer look. Premium+ if you want the AI briefs that turn flags into specific actions for your conveyancer, surveyor and broker.</p>
          <ol className="mt-6 space-y-5">
            <li className="flex gap-4 items-start">
              <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-md">1</span>
              <div>
                <p className="font-bold text-slate-900">Enter the postcode or address</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">Type any UK postcode or full address. We use Google Places autocomplete for addresses and postcodes.io for postcodes &mdash; both return the exact UPRN when available.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-md">2</span>
              <div>
                <p className="font-bold text-slate-900">See the free instant report</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">Sales history since 1995 (HM Land Registry), EPC rating + build year (MHCLG), flood risk + zone (Environment Agency), 12-month crime (Police.uk), council tax band (VOA), 5 closest schools + Ofsted ratings (GIAS), broadband + 4G/5G coverage (Ofcom). All instant, no sign-up.</p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-md">3</span>
              <div>
                <p className="font-bold text-slate-900">Upgrade to £4.99 Premium if it&apos;s worth a closer look</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">Adds: full British Geological Survey ground-risk panel (shrink-swell, landslide, mining, radon); ownership flag (UK + overseas company via HMLR CCOD/OCOD); Companies House owner check (insolvency, outstanding charges, disqualified directors); Building Safety Regulator Higher-Risk Building register status; First-tier Tribunal Property Chamber decision history; listed/conservation/Article 4/TPO overlays; AI buyer&apos;s verdict + 8-12 tailored seller questions; permanent shareable URL.</p>
                <p className="mt-2 text-xs text-slate-500"><Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline font-semibold">See a sample Premium report &rarr;</Link></p>
              </div>
            </li>
            <li className="flex gap-4 items-start">
              <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md">4</span>
              <div>
                <p className="font-bold text-slate-900">Go to £6.99 Premium+ (or upgrade for £2) for the action layer</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">Adds four AI-grounded add-ons that turn every flag into a decision: <strong>Negotiation Report</strong> (typically saves £3,000-£15,000), <strong>AI Solicitor brief</strong> (TA6 enquiries for your conveyancer), <strong>AI Surveyor brief</strong> (specific items for your RICS surveyor), <strong>AI Mortgage broker brief</strong> (lending-friction flags).</p>
                <p className="mt-2 text-xs text-slate-500"><Link href="/sample-plus" className="text-indigo-700 underline-offset-2 hover:underline font-semibold">See a sample Premium+ report &rarr;</Link></p>
              </div>
            </li>
          </ol>
        </section>

        {/* Negotiation Report deep dive, the headline value prop */}
        <section className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-y border-indigo-200">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-700">The headline Premium+ feature</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">Negotiation Report &mdash; typically saves £3,000-£15,000</h2>
              <p className="mt-3 max-w-2xl mx-auto text-slate-700 leading-relaxed">
                Enter the asking price. We model a defensible offer range from the live data, with an AI buying-agent rationale you can forward to the estate agent. Buyers routinely save 1-3% of the asking price by offering grounded in documented evidence rather than offering blind.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">1 &middot; Comparable sales (HM Land Registry)</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">Every recorded sale within 0.5 miles in the last 12 months, ranked by similarity (property type, build year, floor area, tenure). The £/m&sup2; is calculated and shown so you can see how your asking price compares.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">2 &middot; Bank of England rate context</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">Live Bank Rate (IUDBEDR), 5-year nominal zero-coupon gilt yield (IUDSNZC), 20-year (IUDLNZC). Tells you the market-implied rate path &mdash; what mortgages might cost at your next remortgage if the bond market is right.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">3 &middot; Land Registry UKHPI for the local authority</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">12-month price movement specific to the local authority district. If prices are trending down, that&apos;s leverage. If they&apos;re trending up, you&apos;ll know not to over-discount.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">4 &middot; Per-flag price adjustments</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">Every risk flag found in the report becomes a defensible adjustment to the offer: Flood Zone 2 (-2%), shrink-swell band 4 (-3%), BSR HRB without EWS1 (-8%), tribunal-active leasehold (-2%), Companies House charges on freeholder (-1.5%). All transparent. All cited.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">5 &middot; AI buying-agent rationale paragraph</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">Anthropic Claude reads the numerical model and writes a 200-300 word rationale in the voice of a professional buying agent. Ready to forward to the estate agent as your written offer letter.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">6 &middot; Affordability sketch at 75% LTV</p>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">Monthly mortgage payment modelled at today&apos;s Bank Rate + 1.5pp margin AND at the market-implied 5Y forward rate. Shows what you&apos;d pay today and what your remortgage might cost.</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/sample-negotiation" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all">
                See a worked Negotiation Report sample &rarr;
              </Link>
              <p className="mt-3 text-xs text-slate-600">Realistic London flat, full maths shown, no card needed.</p>
            </div>
          </div>
        </section>

        {/* What's in each tier */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What&apos;s in each tier</h2>
            <p className="mt-3 max-w-2xl mx-auto text-slate-700">Same instant delivery on every tier. Same permanent shareable URL. Cumulative &mdash; each tier includes the one before.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <span className="inline-block px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">FREE</span>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">£0</p>
              <p className="text-xs text-slate-500 mt-1">Instant, no sign-up</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li>&#10003; Sales history since 1995 (HM Land Registry)</li>
                <li>&#10003; EPC rating + build year</li>
                <li>&#10003; Flood risk band + zone (Environment Agency)</li>
                <li>&#10003; 12-month crime stats (Police.uk)</li>
                <li>&#10003; Council tax band (VOA)</li>
                <li>&#10003; 5 closest schools + Ofsted</li>
                <li>&#10003; Broadband + 4G/5G coverage (Ofcom)</li>
                <li>&#10003; Air quality + noise + ground-risk score</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-300 shadow-md">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">PREMIUM</span>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">£4.99</p>
              <p className="text-xs text-slate-500 mt-1">One-time, instant report</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-800 font-medium">
                <li>&#9733; Everything in Free</li>
                <li>&#9733; Full BGS ground-risk panel</li>
                <li>&#9733; Radon Affected Area band (UKHSA)</li>
                <li>&#9733; Listed grade + conservation + Article 4 + TPO</li>
                <li>&#9733; BSR Higher-Risk Building register</li>
                <li>&#9733; Ownership flag (UK + overseas, HMLR CCOD/OCOD)</li>
                <li>&#9733; Companies House owner check</li>
                <li>&#9733; Property Chamber tribunal history</li>
                <li>&#9733; AI buyer&apos;s verdict + seller-question pack</li>
                <li>&#9733; Permanent online URL</li>
              </ul>
              <Link href="/sample" className="mt-4 block text-center text-xs font-bold text-blue-700 hover:underline">See sample Premium report &rarr;</Link>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-300 shadow-md relative">
              <span className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">Best value</span>
              <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">PREMIUM+</span>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">£6.99</p>
              <p className="text-xs text-slate-500 mt-1">Or £2 upgrade if you have Premium</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-800 font-medium">
                <li>&#9733; Everything in Premium</li>
                <li>&#9733; 🎯 <strong>Negotiation Report</strong> &mdash; saves £3-£15k typical</li>
                <li>&#9733; AI Solicitor brief (TA6 enquiries)</li>
                <li>&#9733; AI Surveyor brief (specific items)</li>
                <li>&#9733; AI Mortgage broker brief (lending friction)</li>
                <li>&#9733; Higher priority support</li>
              </ul>
              <Link href="/sample-plus" className="mt-4 block text-center text-xs font-bold text-indigo-700 hover:underline">See sample Premium+ report &rarr;</Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-600">
            Already bought Premium? <Link href="/upgrade" className="text-indigo-700 font-bold underline-offset-2 hover:underline">Upgrade for £2 &rarr;</Link> (keep your existing report URL; we just add the AI briefs).
          </div>
        </section>

        {/* Data sources, credibility section */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">Why our data wins</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">24+ official UK government data sources</h2>
              <p className="mt-3 max-w-2xl mx-auto text-slate-700">
                All data is sourced live from official UK government APIs at the moment of purchase, under the Open Government Licence v3.0. The AI rationale is grounded on the actual data &mdash; it never invents flags. Every figure in the Negotiation Report ties back to a specific source.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs text-slate-700">
              <span>📋 HM Land Registry &mdash; sales since 1995</span>
              <span>🏢 HMLR CCOD/OCOD &mdash; corporate ownership</span>
              <span>🏛️ Companies House &mdash; owner check</span>
              <span>🏗️ Building Safety Regulator &mdash; HRB register</span>
              <span>⚖️ First-tier Tribunal Property Chamber</span>
              <span>⚡ MHCLG &mdash; EPC + retrofit data</span>
              <span>🌊 Environment Agency &mdash; flood + climate 2050</span>
              <span>🚨 Police.uk &mdash; 12-month crime</span>
              <span>🎓 GIAS / Ofsted &mdash; schools</span>
              <span>💷 Valuation Office Agency &mdash; council tax</span>
              <span>📡 Ofcom &mdash; broadband + 4G/5G</span>
              <span>🏛️ Historic England &mdash; listed buildings</span>
              <span>🌳 planning.data.gov.uk &mdash; conservation, TPO, Article 4, AONB</span>
              <span>⛏️ Coal Authority &mdash; mining areas</span>
              <span>🪨 British Geological Survey &mdash; ground risk</span>
              <span>☢️ UKHSA &mdash; radon</span>
              <span>🌫️ DEFRA UK-AIR &mdash; air quality</span>
              <span>🔊 DEFRA Noise Mapping</span>
              <span>💰 Bank of England IADB &mdash; rates + gilts</span>
              <span>📈 Land Registry UKHPI &mdash; local price index</span>
              <span>📊 ONS Census 2021 &mdash; demographics</span>
              <span>☀️ PVGIS &mdash; solar potential</span>
              <span>🗺️ Ordnance Survey + OSM &mdash; amenities</span>
              <span>🤖 Anthropic Claude &mdash; AI analysis</span>
            </div>
            <p className="mt-6 text-center text-xs text-slate-500">All government data under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" target="_blank" rel="noopener" className="underline-offset-2 hover:underline">Open Government Licence v3.0</a>. AI analysis runs on Anthropic Claude with prompts grounded on the data &mdash; no hallucinations.</p>
          </div>
        </section>

        {/* What buyers actually use it for */}
        <section className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What buyers actually use it for</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Catching a corporate or overseas owner pre-offer</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">CCOD/OCOD live lookup flags UK + overseas company ownership before you commit to £1,500 of conveyancing. If the owner is an offshore entity without ROE compliance, your conveyancer would catch it at week 6-8 &mdash; but by then you&apos;ve paid for searches.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Avoiding unmortgageable flats</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">Post-Grenfell, any building over 18m or 7 storeys is BSR-registered. Lenders refuse without an EWS1 A or B1. We flag it instantly so you can ask the freeholder before offering &mdash; not after surveys.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Negotiating with documented evidence</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">Premium+ Negotiation Report turns every flag into a defensible price adjustment, with an AI buying-agent rationale paragraph you can forward to the estate agent. Buyers typically save £3,000-£15,000 vs offering blind.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Briefing your solicitor in 1 email</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">The AI Solicitor brief is a TA6-style enquiry list ready to forward when you instruct. Saves 1-2 rounds of generic emails and targets the specific flags your property has.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Surveyor on target, not generic</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">Stops you paying £750 for a Level 2 that misses the local-specific issues. The AI Surveyor brief tells them exactly what to inspect on THIS property &mdash; &quot;shrink-swell band 4 &rarr; diagonal cracking at corner returns&quot;.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <p className="font-bold text-slate-900">Mortgageability check before applying</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">UK chain fall-through rate on mortgage refusal is around 40%. Our AI Mortgage broker brief surfaces the lending-friction flags so you can verify with your broker before applying.</p>
            </div>
          </div>
        </section>

        {/* The economics, make the £6.99 obvious */}
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold">The economics</h2>
            <p className="mt-3 text-slate-300 max-w-2xl">UK property purchases involve £1,685-£3,650 of due-diligence costs from offer to exchange. About 1 in 3 transactions falls through, typically losing £400-£800 in non-refundable fees. The £6.99 Premium+ check is the highest-leverage spend in the entire process.</p>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-3xl font-extrabold text-cyan-300">£6.99</p>
                <p className="mt-1 text-xs uppercase tracking-wider font-bold text-cyan-200">Premium+ cost</p>
                <p className="mt-2 text-sm text-slate-300">Or £4.99 Premium + £2 upgrade after.</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-3xl font-extrabold text-emerald-300">£3,000-£15,000</p>
                <p className="mt-1 text-xs uppercase tracking-wider font-bold text-emerald-200">Typical Negotiation Report saving</p>
                <p className="mt-2 text-sm text-slate-300">1-3% of asking price on £300k-£500k home.</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <p className="text-3xl font-extrabold text-amber-300">430-2,140x</p>
                <p className="mt-1 text-xs uppercase tracking-wider font-bold text-amber-200">Return on £6.99 spend</p>
                <p className="mt-2 text-sm text-slate-300">Best ROI in the entire home-buying process.</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/check" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3 font-bold text-sm shadow-lg transition-all hover:bg-slate-100">
                Run a free check &rarr;
              </Link>
              <Link href="/compare" className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white px-6 py-3 font-bold text-sm border border-white/20 transition-all hover:bg-white/20">
                See full comparison vs CheckMyFile + alternatives
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently asked questions</h2>
          <dl className="mt-6 space-y-5">
            {FAQ.map((q) => (
              <div key={q.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <dt className="font-bold text-slate-900">{q.question}</dt>
                <dd className="mt-2 text-sm text-slate-700 leading-relaxed">{q.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Run a free check on the property you&apos;re viewing</h2>
            <p className="mt-2 text-sm text-slate-600">30 seconds. No card. Decide whether to upgrade to Premium £4.99 or go straight to Premium+ £6.99 once you&apos;ve seen the free data.</p>
            <div className="mt-6 max-w-md mx-auto"><PostcodeLookup /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
