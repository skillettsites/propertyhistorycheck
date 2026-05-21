import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "How to order an HM Land Registry title register — UK guide",
  description:
    "How to order an official HM Land Registry title register for any UK property. £3 direct from gov.uk. What it contains, when to order one, and what to look for as a homebuyer.",
  alternates: { canonical: "/title-register-check" },
};

export default function TitleRegisterCheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">How to check the HM Land Registry title register</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              The official title register for any registered UK property costs £3 direct from HM Land Registry via gov.uk. Below: what&apos;s in it, when to order one, and what to look for as a buyer.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
            <p className="mt-3 text-xs text-slate-500">Or run our free property check first to spot issues before you spend.</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">What&apos;s in a title register</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li><strong>Property register</strong> — description, plan reference, tenure (freehold/leasehold), and any rights of way or easements.</li>
            <li><strong>Proprietorship register</strong> — current registered owners, price paid (if registered after April 2000), and any restrictions on selling.</li>
            <li><strong>Charges register</strong> — mortgages, restrictive covenants, third-party rights, deeds of variation.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Where to order it</h2>
          <p className="mt-3 text-slate-700">
            HM Land Registry sells the title register direct via gov.uk for £3. The title plan (boundary diagram) is a separate £3 order. Both are PDFs, delivered immediately.
          </p>
          <p className="mt-3 text-slate-700">
            <a href="https://www.gov.uk/search-property-information-land-registry" target="_blank" rel="noopener" className="text-blue-700 underline">Order from gov.uk — Search property information from HM Land Registry</a>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            We don&apos;t resell title registers. The bulk dataset requires HM Land Registry&apos;s £5,000+VAT/yr Commercial licence, which doesn&apos;t fit our £4.99 Premium margin. Direct from gov.uk is the cheapest and most reliable route.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What to look for as a buyer</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li><strong>Tenure</strong> — freehold or leasehold. If leasehold, what is the lease term remaining and the ground rent clause? Sub-80 years triggers marriage value; some lenders won&apos;t lend below 75 years.</li>
            <li><strong>Registered owner</strong> — does it match the seller you&apos;re dealing with? Any unexpected company entity or overseas owner?</li>
            <li><strong>Restrictions</strong> — Form A or other restrictions that require consent before transfer? Common with shared-ownership or properties held in trust.</li>
            <li><strong>Charges</strong> — existing mortgages or third-party rights. These must be discharged or accepted before completion.</li>
            <li><strong>Restrictive covenants</strong> — some titles ban running a business from home, parking caravans on the front garden, or extending without consent.</li>
            <li><strong>Easements / rights of way</strong> — neighbours&apos; rights to cross your land, shared drives, shared sewers.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">When the £4.99 HomeBuyerCheck report still helps</h2>
          <p className="mt-3 text-slate-700">
            The title register tells you what the legal owner has agreed to. It does not tell you about the building, the ground beneath, the neighbourhood, or who controls the freeholder. Our £4.99 Premium adds:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Ownership flag (UK / overseas company) from HMLR CCOD/OCOD, with Companies House owner check (insolvency, outstanding charges, disqualified directors) when the proprietor is corporate.</li>
            <li>BSR Higher-Risk Building register status (high-rise residential).</li>
            <li>Property Chamber tribunal history at the building and postcode (service charge disputes, leasehold cases).</li>
            <li>Full BGS ground-risk panel (shrink-swell, landslide, mining), Radon Affected Area band, listed building grade, conservation area and Article 4 overlay.</li>
            <li>AI buyer&apos;s verdict tied to the specific flags found, plus a tailored seller-question pack.</li>
          </ul>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Sensible workflow</p>
            <p className="mt-2 text-sm text-slate-700">
              Run our free address check first. If anything flags, run £4.99 Premium. If anything in the paid report is concerning enough to push toward an offer or walk-away decision, order the £3 title register direct from gov.uk and review with your solicitor.
            </p>
            <div className="mt-4"><PostcodeLookup /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
