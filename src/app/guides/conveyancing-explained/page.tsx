import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Conveyancing explained, what your UK solicitor actually does",
  description: "Plain English breakdown of the conveyancing process: searches, enquiries, contract review, transfer. What your £1,500 buys, and what it doesn't.",
  alternates: { canonical: "/guides/conveyancing-explained" },
};

export default function ConveyancingGuide() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Conveyancing explained &mdash; what your UK solicitor actually does</h1>
          <p className="mt-4">Conveyancing is the legal transfer of property from seller to buyer. UK costs run £1,000-£1,500 plus £200-£450 in disbursements (search fees, Land Registry fee, bank transfer fee).</p>
          <h2 className="mt-8 text-xl font-bold text-slate-900">The four conveyancing searches</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Local authority search:</strong> planning, building regs, road schemes, conservation, listed status. £90-£250.</li>
            <li><strong>Drainage and water search (CON29DW):</strong> sewerage connectivity, water mains location. ~£60.</li>
            <li><strong>Environmental search:</strong> contaminated land, ground stability, flood risk. ~£40.</li>
            <li><strong>Optional: chancel repair, mining (CON29M), radon, EWS1.</strong> Vary by location, £15-£60 each.</li>
          </ul>
          <h2 className="mt-8 text-xl font-bold text-slate-900">What your solicitor doesn&apos;t check</h2>
          <p>The physical condition of the building (that&apos;s the surveyor). The neighbours. The school catchment. Air quality. Crime. These are all on you. HomeBuyerCheck plugs that gap with a buyer-readable summary, before you commit.</p>
          <div className="mt-10"><PostcodeLookup size="md" /></div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">See also</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026 full breakdown</Link></li>
              <li><Link href="/blog/title-register-download-cost-uk" className="text-blue-700 underline-offset-2 hover:underline">UK title register download cost · £7 from HMLR</Link></li>
              <li><Link href="/blog/property-due-diligence-cost-uk" className="text-blue-700 underline-offset-2 hover:underline">UK property due-diligence cost · 2026 ladder</Link></li>
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs CheckMyFile, HMLR, solicitor searches · comparison</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
