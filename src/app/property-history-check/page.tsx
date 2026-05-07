import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "UK Property History Check — instant report, before you offer",
  description:
    "How PropertyHistoryCheck works. Free instant postcode-level report covering sales history, EPC, flood, crime, schools, council tax. Paid £14.99 / £29.99 reports add full title register, planning history, and environmental flags.",
  alternates: { canonical: "/property-history-check" },
};

export default function PropertyHistoryCheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">UK property history check &mdash; before you offer</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              A 30-second sanity check on any UK property, built for buyers about to make an offer or instruct a solicitor. Free instant report, paid upgrades for full title and environmental detail.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
            <li>Enter the property&apos;s postcode &mdash; pick the address from the auto-filled list.</li>
            <li>See an instant free report sourced from public government data (HM Land Registry, EPC Register, Environment Agency, Police.uk, DfE, VOA).</li>
            <li>Upgrade to a Standard (£14.99) or Premium (£29.99) report for the full picture, including a live HM Land Registry title register pull on the Premium tier.</li>
            <li>Receive a signed PDF by email within 60 seconds, plus a permanent online report URL you can share with your solicitor or partner.</li>
          </ol>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What buyers actually use it for</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Catching short leases (sub-80 years) before instructing a solicitor.</li>
            <li>Spotting a flood risk early and budgeting for higher insurance premiums.</li>
            <li>Confirming the property isn&apos;t in a coal mining reporting area before an offer.</li>
            <li>Checking for restrictive covenants that block extensions or parking caravans.</li>
            <li>Getting a plain-English summary of issues to send to your conveyancer.</li>
          </ul>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Anchor against the real cost of getting it wrong</p>
            <p className="mt-2 text-sm text-slate-700">A RICS Level 2 HomeBuyer Report costs £400-£900. Solicitor conveyancing searches add another £250-£450. Renegotiating an offer based on findings typically knocks 1-3% off the agreed price &mdash; on a £200,000 home that is £2,000-£6,000. Spending £29.99 to surface the issues first is, frankly, the most leveraged purchase in the buying process.</p>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <h2 className="text-2xl font-bold text-slate-900">Ready to check a property?</h2>
            <div className="mt-4"><PostcodeLookup /></div>
            <p className="mt-4 text-xs text-slate-500">
              Or read our <Link href="/guides/buying-a-house-uk" className="text-blue-700 underline">UK buyer&apos;s guide</Link> first.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
