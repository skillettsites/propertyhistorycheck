import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Sample Premium+ Report — What you get for £6.99 | HomeBuyerCheck",
  description:
    "Everything in the £4.99 Premium report plus four add-ons designed to save you £5,000-£25,000 and stop your offer falling through: Negotiation Report, AI Solicitor brief, AI Surveyor brief and AI Mortgage broker brief.",
  alternates: { canonical: "/sample-plus" },
};

const ADDRESS = "Flat 14, Sample Wharf House, 25 Example Quay, London SE16 4ZZ";

export default function SamplePlus() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              Sample Premium+
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Everything in the £6.99 Premium+ tier
            </h1>
            <p className="mt-4 max-w-2xl text-base text-gray-300">
              The £4.99 Premium report plus four interactive add-ons designed to save buyers <span className="text-white font-semibold">£5,000-£25,000</span> on the offer and stop the chain falling through on mortgage refusal or solicitor surprise.
            </p>
            <div className="mt-6">
              <Link
                href="/check"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-bold text-sm shadow hover:bg-slate-100"
              >
                Check a real UK property →
              </Link>
            </div>
          </div>
        </section>
        {/* Illustrative sample banner */}
        <div className="bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-amber-900 flex items-center gap-2">
            <span className="text-amber-700 font-bold uppercase tracking-wider">Illustrative sample</span>
            <span>This is a worked example for a fictional property at Flat 14, Sample Wharf House SE16 4ZZ. All figures are realistic but invented to demonstrate the report. Run a real check for your address from the homepage.</span>
          </div>
        </div>

        {/* Intro */}
        <section className="mx-auto max-w-4xl px-4 pt-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">What you get for £6.99</h2>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              Premium+ is the £4.99 Premium report plus four add-ons. The Premium layer is the same — radon, ground, BSR HRB, listed/conservation, HMLR ownership, Companies House owner check, Property Chamber tribunal history, buyer&apos;s verdict and seller questions. On top of that, the £2 upgrade unlocks four AI-grounded briefs that translate every flag into action — a defensible offer range with a buying-agent rationale, your conveyancer&apos;s enquiry list in TA6 language, your RICS surveyor&apos;s targeted checklist, and your mortgage broker&apos;s lending-friction list.
            </p>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              Sample address used throughout: <span className="font-semibold text-slate-900">{ADDRESS}</span>. Each card below links to a full worked sample.
            </p>
          </div>
        </section>

        {/* Four feature cards */}
        <section className="mx-auto max-w-4xl px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Negotiation Report */}
            <Link
              href="/sample-negotiation"
              className="group rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 transition hover:shadow-lg hover:border-purple-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800">Headline feature</p>
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">Negotiation Report</h3>
              <p className="mt-1 text-sm font-semibold text-purple-900">Save £5,000-£25,000 with a defensible offer.</p>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                Enter the seller&apos;s asking price. We model a fair-value range from same-postcode same-type sales, current BoE base rate and Land Registry HPI, weighted by every risk flag we found, with a 200-300 word buying-agent rationale you can hand to the agent.
              </p>

              <div className="mt-4 rounded-xl border border-purple-300 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800">Sample output</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Range: £420,000 – £448,000</p>
                <p className="text-[11px] text-slate-500">Asking £465,000 — 7.0% above modelled fair value</p>
                <svg viewBox="0 0 200 36" className="w-full h-auto mt-2" role="img" aria-label="Offer range visualisation">
                  <rect x="0" y="14" width="200" height="8" fill="#ede9fe" rx="4" />
                  <rect x="84" y="14" width="56" height="8" fill="#a855f7" rx="4" />
                  <line x1="186" y1="10" x2="186" y2="26" stroke="#b45309" strokeWidth="2" />
                  <text x="6" y="34" fontSize="9" className="fill-slate-600">£400k</text>
                  <text x="108" y="34" fontSize="9" className="fill-purple-800" fontWeight="700">Suggested</text>
                  <text x="170" y="34" fontSize="9" className="fill-amber-700" fontWeight="700">Ask</text>
                </svg>
              </div>

              <p className="mt-4 text-sm font-semibold text-purple-800 group-hover:underline">See sample Negotiation Report →</p>
            </Link>

            {/* AI Solicitor brief */}
            <Link
              href="/sample-solicitor"
              className="group rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-6 transition hover:shadow-lg hover:border-indigo-400"
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-800">For your conveyancer</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">AI Solicitor brief</h3>
              <p className="mt-1 text-sm font-semibold text-indigo-900">TA6-style enquiries, ready to forward.</p>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                Conveyancers charge £30-£60 to draft a pre-exchange enquiry letter. This one is generated in seconds from every flag we surface, in the TA6 language solicitors expect. Catches the obscure stuff a busy conveyancer might miss.
              </p>

              <div className="mt-4 rounded-xl border border-indigo-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">Sample item</p>
                <p className="mt-1 text-xs text-slate-800">
                  <span className="font-bold">Owner of record (priority: critical).</span> Demo Properties Ltd is an overseas company (Guernsey, OCOD). <em>Action:</em> confirm Register of Overseas Entities compliance and request beneficial-ownership disclosure under TA6 1.6 before exchange.
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-indigo-800 group-hover:underline">See sample Solicitor brief →</p>
            </Link>

            {/* AI Surveyor brief */}
            <Link
              href="/sample-surveyor"
              className="group rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-6 transition hover:shadow-lg hover:border-emerald-400"
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">For your RICS surveyor</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">AI Surveyor brief</h3>
              <p className="mt-1 text-sm font-semibold text-emerald-900">Targeted checklist for THIS property.</p>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                A RICS Level 2 HomeBuyer Report costs £400-£900 and is usually generic. This brief tells the surveyor exactly what to inspect at this address — shrink-swell band, BSR cladding, listed-grade specifics, leasehold communal areas.
              </p>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Sample item</p>
                <p className="mt-1 text-xs text-slate-800">
                  <span className="font-bold">Shrink-swell hazard band 3/5.</span> <em>Action:</em> inspect window/door alignment, brick course straightness, and any evidence of past underpinning at flats 1, 2 and 3 of the same stack.
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-emerald-800 group-hover:underline">See sample Surveyor brief →</p>
            </Link>

            {/* AI Mortgage broker brief */}
            <Link
              href="/sample-mortgage"
              className="group rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-6 transition hover:shadow-lg hover:border-amber-400"
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-amber-800">For your mortgage broker</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">AI Mortgage broker brief</h3>
              <p className="mt-1 text-sm font-semibold text-amber-900">Friction flags surfaced before you apply.</p>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                40% of UK property chains fall through, and mortgage refusal is the single biggest cause. This brief identifies every flag we surface that triggers lender-specific underwriting — BSR HRB EWS1, listed grade, flood band, ground stability and ownership type — and tells you what to put to a qualified broker before you apply.
              </p>

              <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Sample item</p>
                <p className="mt-1 text-xs text-slate-800">
                  <span className="font-bold">BSR Higher-Risk Building (priority: critical).</span> All mainstream lenders require an EWS1 form (rating A/B1) before issuing a mortgage offer. Get this from the freeholder BEFORE applying.
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-amber-800 group-hover:underline">See sample Mortgage brief →</p>
            </Link>
          </div>
        </section>

        {/* Honest scope */}
        <section className="mx-auto max-w-4xl px-4 pb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">Honest scope — what these briefs do and don&apos;t do</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 text-emerald-600">+</span>
                <span><strong>The AI rationale never invents numbers.</strong> Every figure cited comes from one of the data sources listed in the Premium report. If something can&apos;t be sourced, the brief says so explicitly.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-emerald-600">+</span>
                <span><strong>The Mortgage broker brief never names specific lenders.</strong> Lender policies change weekly and vary by applicant; we surface the friction flags but always defer the lender choice to your qualified broker.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-emerald-600">+</span>
                <span><strong>The Negotiation Report shows its working.</strong> Every percentage adjustment links back to a public-data flag. No black-box discounts.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-amber-600">−</span>
                <span><strong>Comparable sales are limited by Land Registry coverage.</strong> Rural postcodes with few transactions get wider ranges and a lower-confidence flag. We don&apos;t pretend we&apos;ve seen comps we haven&apos;t.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-amber-600">−</span>
                <span><strong>None of this replaces a solicitor or surveyor.</strong> The briefs are designed to be handed to qualified professionals so they spend their time on the right questions. They are not legal or structural advice.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-amber-600">−</span>
                <span><strong>Real offer success depends on more than data.</strong> Seller motivation, chain status, competing offers and survey findings all matter. Use the report as a starting point with your buying agent.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Ready to check a property?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Free postcode-level report first, then upgrade to £4.99 Premium or £6.99 Premium+ if it&apos;s worth a closer look.
            </p>
            <div className="mt-6 flex justify-center"><PostcodeLookup /></div>
            <p className="mt-6 text-xs text-slate-500">
              Or see the <Link href="/sample" className="text-blue-700 underline">£4.99 Premium sample walk-through</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
