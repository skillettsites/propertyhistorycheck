import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Property checks before buying a UK house — full pre-offer checklist",
  description:
    "Every pre-offer check a UK home buyer should run, in order. Sold history, lease length, flood risk, planning, restrictive covenants, mining, conservation, EPC. Free check at the bottom.",
  alternates: { canonical: "/property-checks-before-buying" },
};

const CHECKS = [
  { title: "Confirm the asking price is sane", body: "Pull the sales history. If the property has tripled in 5 years with no extension, ask why." },
  { title: "Check tenure (freehold vs leasehold)", body: "If leasehold, confirm years remaining. Sub-80 years is a deal-breaker for most lenders." },
  { title: "Check the flood band", body: "Even a Medium banding will cost you on insurance. High triggers Flood Re and serious lender questions." },
  { title: "Check coal mining reporting area", body: "If yes, plan for a £60 CON29M before exchange." },
  { title: "Check restrictive covenants", body: "Look for clauses that ban running a business from home or building extensions." },
  { title: "Check listed building status", body: "Listed = consent required for ANY alteration. Factor in the cost and friction." },
  { title: "Check conservation area", body: "Restricts windows, signage, paint colours, parking and trees." },
  { title: "Check EPC rating", body: "F or G triggers retrofit obligations for landlords from 2030. Buyers price this in." },
  { title: "Check crime profile", body: "Don't only look at totals — look at the categories. ASB and burglary at scale matter for resale." },
  { title: "Check planning history within 250m", body: "A pending tower-block consent next door changes the maths." },
];

export default function ChecksPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Property checks to do before buying a UK house</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">A pre-offer checklist that takes 5 minutes per property. Most are free; the paid ones are tiny against the cost of getting any of them wrong.</p>
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 py-12">
          <ol className="space-y-4">
            {CHECKS.map((c, i) => (
              <li key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step {i + 1}</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{c.title}</p>
                <p className="mt-2 text-sm text-slate-700">{c.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <PostcodeLookup />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
