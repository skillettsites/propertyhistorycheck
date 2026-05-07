import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Refund Policy</h1>
          <p className="text-sm text-slate-500">Last updated: 2026-05-07</p>
          <p className="mt-6">If your report fails to generate or contains incorrect data, we will refund you in full within 14 days of purchase &mdash; no questions asked. Email <a href="mailto:support@propertyhistorycheck.co.uk" className="text-blue-700 underline">support@propertyhistorycheck.co.uk</a> with your session ID and we&apos;ll process the refund the same working day.</p>
          <p className="mt-4">For Premium tier reports, once the live HM Land Registry title register has been ordered we cannot recover that wholesale cost (£7) and so refunds for that document are partial. Everything else in the report is fully refundable.</p>
          <p className="mt-4">Statutory rights are not affected by this policy.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
