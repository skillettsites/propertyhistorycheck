import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20 lg:pt-24">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                Free UK property history check
              </span>
              <h1 className="mt-6 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Check any UK property&apos;s history in 30 seconds
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Free instant report with sales history, EPC, flood, crime, schools and council tax. Premium upgrade for full title register, planning history and environmental detail. Used by buyers before they instruct a solicitor.
              </p>
              <div className="mt-8 w-full">
                <PostcodeLookup />
              </div>
              <p className="mt-3 text-xs text-slate-500">No signup required for the free check.</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Powered by</span>
                <span className="font-medium text-slate-700">HM Land Registry</span>
                <span className="font-medium text-slate-700">Environment Agency</span>
                <span className="font-medium text-slate-700">Police.uk</span>
                <span className="font-medium text-slate-700">EPC Register</span>
                <span className="font-medium text-slate-700">Ofcom</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">What you&apos;ll see in your free check</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FREE_CARDS.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                <p className="mt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-bold text-slate-900">Solicitor searches £250+ vs our reports</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">£0</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  <li>Sales history (since 1995)</li>
                  <li>EPC rating + build age</li>
                  <li>Crime + schools</li>
                  <li>Broadband + council tax</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Standard</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">£14.99</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  <li>Everything in Free</li>
                  <li>Full flood risk (rivers/sea/surface)</li>
                  <li>Listed building &amp; conservation flags</li>
                  <li>Restrictive covenants flag</li>
                  <li>Signed PDF + email delivery</li>
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-blue-700 bg-white p-5 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Premium</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">£29.99</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  <li>Everything in Standard</li>
                  <li>Live HM Land Registry title register</li>
                  <li>Lease length analysis (if leasehold)</li>
                  <li>Climate-projected flood risk</li>
                  <li>Coal mining, radon, subsidence flags</li>
                  <li>AI buyer&apos;s verdict</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-slate-600">
              Solicitor conveyancing searches alone cost £250-£450. A RICS Level 2 HomeBuyer Report is £400-£900. Our reports are designed to run BEFORE you spend on either &mdash; small spend to de-risk a huge spend.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">Why check before you offer?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SCENARIOS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((q) => (
                <details key={q.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">{q.q}</summary>
                  <p className="mt-2 text-sm text-slate-600">{q.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/check" className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                Check a UK property now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const FREE_CARDS = [
  { title: "Sales history since 1995", body: "Every recorded sale and price for the address, sourced direct from HM Land Registry." },
  { title: "EPC rating & build year", body: "Current and potential rating, main heating type, and an estimate of when the property was built." },
  { title: "Flood risk summary", body: "Rivers and sea risk band sourced from the Environment Agency. Premium adds surface water and 2050 climate projection." },
  { title: "Crime overview", body: "12-month crime stats sourced from data.police.uk, broken down by category." },
  { title: "Schools nearby", body: "Five closest schools with Ofsted ratings and straight-line distance from the property." },
  { title: "Connectivity & council tax", body: "Best available broadband speed and 4G/5G coverage by network, plus council tax band and estimated annual cost." },
];

const SCENARIOS = [
  { title: "Lease length surprises", body: "Sub-80-year leases trigger marriage value and are harder to mortgage. Find this BEFORE you instruct a solicitor." },
  { title: "Hidden flood risk", body: "Insurers hike premiums for properties in known flood zones. Better to discover this before you fall in love with a kitchen." },
  { title: "Past mining activity", body: "Coal Authority reporting areas often need a £60 CON29M search. Catch it early." },
  { title: "Restrictive covenants", body: "Some titles ban running a business from home, parking caravans, or extending. Spot it on the title register before exchange." },
];

const FAQ = [
  { q: "Is this a substitute for a solicitor's conveyancing searches?", a: "No. This is informational only and designed to be used BEFORE you instruct a solicitor — it helps you decide whether to proceed at all and what to ask your solicitor about. Conveyancing searches remain essential before exchange." },
  { q: "Where does the data come from?", a: "Sales history is HM Land Registry. EPC is the Open Data Communities API. Flood risk is the Environment Agency. Crime is data.police.uk. Schools are the Department for Education's GIAS register. Council tax is the VOA. All under the Open Government Licence." },
  { q: "How fast is the report delivered?", a: "The free postcode-level report is instant. The Standard and Premium paid reports are delivered by email within 60 seconds of payment." },
  { q: "Can I get a refund?", a: "Yes. Full refund within 14 days if the report fails to generate or contains incorrect data. Once a live HM Land Registry title register has been ordered for a Premium tier, refunds are partial because we can't recover that wholesale cost." },
  { q: "Do you cover Scotland and Northern Ireland?", a: "England and Wales for now. Scotland uses a separate land registry; Northern Ireland's Land and Property Services is also separate. Both are on the roadmap." },
];
