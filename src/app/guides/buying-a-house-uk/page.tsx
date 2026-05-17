import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Buying a house in the UK — the 2026 step-by-step guide",
  description: "Every stage of the UK house-buying process from agreement-in-principle to completion. Includes what to check, what to ask your solicitor, and how to renegotiate.",
  alternates: { canonical: "/guides/buying-a-house-uk" },
};

export default function BuyingGuide() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying a house in the UK &mdash; the 2026 step-by-step guide</h1>
          <p className="mt-4">Buying a UK home in 2026 takes 12-16 weeks on average from offer accepted to keys. The process is genuinely opaque to first-time buyers; this guide is the order in which things happen and what to do at each stage.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">1. Agreement in principle (AiP)</h2>
          <p>Before you start viewing, get a mortgage AiP. Habito, Mojo, and L&amp;C are the easiest free brokers; high-street lenders take longer.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">2. Viewings + offer</h2>
          <p>Aim for 5-10 viewings per offer. Run a free property check before you offer &mdash; sales history, EPC, flood, crime, council tax. <strong>Spending 3 minutes here regularly takes 1-3% off the offer.</strong></p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">3. Offer accepted &mdash; instruct a solicitor</h2>
          <p>You&apos;ll pay £1,000-£1,500 for conveyancing. The solicitor will run local authority searches (£90-£250), drainage searches (~£60), and an environmental search (~£40). Total searches £200-£400.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">4. Instruct a survey</h2>
          <p>RICS Level 2 (HomeBuyer) is £400-£900 for most homes. Level 3 (Building Survey) is £600-£1,500 for older or unusual properties. We strongly recommend Level 3 for anything pre-1930, listed, or extended.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">5. Mortgage application</h2>
          <p>Your broker submits the full application after you&apos;ve had the survey. Lender valuation takes 1-3 weeks. If the property values lower than the offer, expect to renegotiate.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">6. Searches return &mdash; renegotiate if needed</h2>
          <p>Search results often surface flood risk, mining, road schemes, planning, contaminated land. Use this to renegotiate. <strong>Premium HomeBuyerCheck reports surface most of these BEFORE you spend on searches</strong>, so you can renegotiate earlier.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">7. Exchange + completion</h2>
          <p>Exchange = legally binding contract. Completion = keys. Allow 1-2 weeks between for moving logistics.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Run a free check on the property you&apos;re viewing</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
