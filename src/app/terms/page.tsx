import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="prose mx-auto max-w-3xl px-4 py-12 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: 2026-05-07</p>
          <h2 className="mt-8 text-xl font-bold text-slate-900">1. Informational use only</h2>
          <p>PropertyHistoryCheck.co.uk provides automated property reports for informational purposes only. The service is not a regulated legal service and is not a substitute for formal conveyancing searches conducted by a qualified solicitor.</p>
          <h2 className="mt-6 text-xl font-bold text-slate-900">2. Data sources</h2>
          <p>Title information is sourced directly from HM Land Registry under their Business Gateway or via approved resellers. Environmental, flood, crime, EPC, council tax, schools and broadband data is sourced from public government APIs under the Open Government Licence v3.0.</p>
          <h2 className="mt-6 text-xl font-bold text-slate-900">3. Limitation of liability</h2>
          <p>To the maximum extent permitted by law, PropertyHistoryCheck&apos;s liability for any claim arising from a report is limited to the price paid for that report. We do not accept liability for decisions made on the basis of report data without independent verification by a qualified professional.</p>
          <h2 className="mt-6 text-xl font-bold text-slate-900">4. Governing law</h2>
          <p>These terms are governed by the laws of England and Wales.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
