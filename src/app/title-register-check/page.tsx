import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Title Register Check — live HM Land Registry pull, plain-English summary",
  description:
    "Order a live HM Land Registry title register for any UK property. £29.99 with a buyer-readable summary covering tenure, lease length, registered owners, charges, restrictions and restrictive covenants.",
  alternates: { canonical: "/title-register-check" },
};

export default function TitleRegisterCheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">UK title register check &mdash; live HMLR pull</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              Order an official HM Land Registry title register and get a buyer-readable summary in the same report. Tenure, lease length, registered owners, charges, restrictions, restrictive covenants &mdash; all in plain English.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">What&apos;s in a title register?</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li><strong>Property register</strong> &mdash; description, plan reference, tenure (freehold/leasehold), and any rights of way.</li>
            <li><strong>Proprietorship register</strong> &mdash; current registered owners, price paid (if registered after April 2000), and any restrictions on selling.</li>
            <li><strong>Charges register</strong> &mdash; mortgages, restrictive covenants, easements, and other third-party rights.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">How is this different from buying it from gov.uk for £7?</h2>
          <p className="mt-3 text-slate-700">
            HM Land Registry sells the raw PDF for £7. We add four things buyers actually need:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>A plain-English summary translating legal language into "what this means for you".</li>
            <li>An automated lease-length analysis with traffic-light warnings (sub-80 years = serious).</li>
            <li>Cross-referencing against flood, planning, listed-building, and coal mining datasets so the title sits in context.</li>
            <li>A signed PDF you can send to your solicitor or use to renegotiate the offer.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
