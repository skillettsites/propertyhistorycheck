import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "UK Property Buying Calculators (2026) | HomeBuyerCheck",
  description:
    "Free UK property buying calculators for 2026: total cost of buying a house, stamp duty, conveyancing cost and survey cost. Work out every up-front cost, then check the property itself from £4.99.",
  alternates: { canonical: "/calculators" },
};

const TOOLS: { href: string; name: string; blurb: string; accent: string }[] = [
  {
    href: "/cost-of-buying-a-house-calculator",
    name: "Cost of Buying a House",
    blurb: "Total cash needed up front: deposit, stamp duty, conveyancing, survey, mortgage fees and removals in one figure.",
    accent: "from-blue-600 to-cyan-500",
  },
  {
    href: "/stamp-duty-calculator",
    name: "Stamp Duty Calculator",
    blurb: "SDLT for a standard buyer, first-time buyer or second home / buy-to-let. England & NI, 2026 rates.",
    accent: "from-indigo-600 to-blue-500",
  },
  {
    href: "/conveyancing-cost-calculator",
    name: "Conveyancing Cost Calculator",
    blurb: "Legal fee plus searches, HM Land Registry and leasehold disbursements, the full conveyancing bill.",
    accent: "from-emerald-600 to-teal-500",
  },
  {
    href: "/property-survey-cost-calculator",
    name: "Survey Cost Calculator",
    blurb: "Compare RICS Level 1, 2 and 3 survey fees by property value and type, and see which you need.",
    accent: "from-amber-600 to-orange-500",
  },
];

export default function CalculatorsHubPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Calculators", url: "/calculators" },
          ]),
        ]}
      />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">UK Property Buying Calculators</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-700">
              Free 2026 calculators for every cost of buying a home, from the headline total down to each individual fee. Work
              out the numbers, then check the property itself, the risks that let you negotiate, from £4.99.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
              >
                <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${t.accent} text-white`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>
                </span>
                <span className="text-base font-bold text-slate-900 group-hover:text-blue-700">{t.name}</span>
                <span className="mt-1 text-[13px] leading-relaxed text-slate-600">{t.blurb}</span>
                <span className="mt-3 text-[13px] font-semibold text-blue-600">Open calculator →</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
            <p className="text-sm font-semibold text-slate-900">The calculators tell you what buying costs. We tell you what the property hides.</p>
            <p className="mt-1 text-xs text-slate-600">
              Free instant check on any UK address. Premium from £4.99 adds ground risk, flood, ownership, tribunal history and
              an AI buyer&apos;s verdict, the evidence buyers use to negotiate the price down.
            </p>
            <div className="mt-3"><PostcodeLookup /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
