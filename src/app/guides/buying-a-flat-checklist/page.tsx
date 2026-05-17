import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Buying a flat in the UK — a buyer's pre-offer checklist",
  description: "Pre-offer checklist for UK flats: lease length, ground rent, service charges, sinking fund, freeholder, EWS1, share of freehold, Section 20, LPE1 and covenants.",
  alternates: { canonical: "/guides/buying-a-flat-checklist" },
};

export default function FlatChecklistGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/buying-a-flat-checklist";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Buying a flat in the UK — a buyer's pre-offer checklist",
            description: "What to ask, what to read, and what to walk away from before offering on a UK flat.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Buying a flat checklist", url: "/guides/buying-a-flat-checklist" },
          ]),
          faqSchema([
            { q: "What's the minimum lease length I should accept?", a: "Aim for 90+ years remaining at offer, ideally 125+. Below 80 used to be a financial cliff edge because of marriage value, but the Leasehold and Freehold Reform Act 2024 abolished marriage value for statutory extensions. Lender thresholds remain the binding constraint: most won't lend if fewer than 30-40 years remain at the end of the proposed mortgage." },
            { q: "What's an LPE1 form and why does it matter?", a: "The Leasehold Property Enquiries 1 form is a standard pack the freeholder or managing agent fills in for prospective buyers. It covers service charge accounts, sinking fund balance, planned major works, current disputes, and Section 20 consultations in progress. It costs £200-£500 and takes 4-6 weeks. You want it before exchange, not after, and you want to read all of it." },
            { q: "What is EWS1 and when do I need it?", a: "External Wall System form 1 is a fire safety certificate confirming the building's external walls have been assessed for combustible materials. It's required for buildings over 11 metres (roughly 4 storeys plus) by most lenders, and for buildings over 18 metres under the Building Safety Act 2022. A 'fail' EWS1 (rating B2 or anything similar) usually kills the mortgage." },
            { q: "Should I prefer share of freehold over leasehold?", a: "Yes, for two reasons. Service charges tend to be at cost rather than profit-loaded. And lease extensions are essentially free other than legal fees because the leaseholders collectively are the freeholder. A share-of-freehold flat is worth roughly 5-10% more than an equivalent plain leasehold flat in the same block." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying a flat in the UK &mdash; a buyer&apos;s pre-offer checklist</h1>
          <p className="mt-4">A flat is not just a smaller house. The legal structure is different, the ongoing costs are different, and the resale risk is concentrated in things that have nothing to do with the flat itself: the freeholder, the block, the building safety regime, the neighbours, and the management company. Almost every problem you hear about with UK flats comes from skipping the homework before offer. This is the homework.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">1. Lease length and term</h2>
          <p>How many years are remaining on the lease today? Aim for 90+, ideally 125+. The 2024 Reform Act abolished marriage value for statutory extensions, so the old 80-year cliff edge is partly gone, but lender thresholds still bite. Most mainstream lenders want 30-40 years remaining at the end of the mortgage, which means a 25-year mortgage on an 84-year lease leaves 59 years at the back end and is fine, while a 79-year lease at offer on a 25-year mortgage is borderline.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">2. Ground rent terms</h2>
          <p>Read the ground rent clause in the lease itself, not the agent&apos;s summary. Look for: a fixed amount (£0-£250 typical, anything higher is a red flag), an escalator (every 10, 15, 25 years, doubling or RPI-linked), and a cap or review mechanism. Doubling clauses that escalate ground rent past £1,000 a year by year 50 turn the flat into an assured tenancy under section 1 of the Housing Act 1988, which lenders refuse. The 2022 Ground Rent Act capped new leases at peppercorn, but existing leases keep their original terms unless extended.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">3. Service charge history</h2>
          <p>Ask for three years of service charge accounts. A jump from £1,800 to £3,200 between two years usually signals major works (Section 20 consultation). The bill lands on whoever owns the flat when it&apos;s billed, not when the work was decided. If the most recent year is dramatically higher, ask why. If the freeholder won&apos;t share accounts, that&apos;s a red flag in itself.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">4. Sinking fund balance</h2>
          <p>The sinking fund (or reserve fund) is the long-term pot for big-ticket replacements: roof, lift, external decoration. A healthy fund is 5-10% of recent annual service charge income, growing year on year, and clearly accounted. An empty sinking fund means the next major works will be billed direct to leaseholders as a Section 20 special charge, often £5,000-£25,000 per flat. Ask the question. If the answer is &ldquo;there isn&apos;t one&rdquo;, factor that into your offer.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">5. Freeholder and managing agent</h2>
          <p>Who is the freeholder, and who manages the block? Is the freeholder a known portfolio holder (E&amp;J Estates, Long Harbour, Adriatic Land), a small private investor, or the leaseholders collectively (share of freehold)? Search the freeholder online. Tribunal records (the First-tier Tribunal Property Chamber) are public; a freeholder with multiple disputes against leaseholders is a warning sign. The managing agent matters less than the freeholder but is usually the daily contact; a member of ARMA or the Property Mark scheme is a good sign.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">6. EWS1 and cladding status</h2>
          <p>The External Wall System 1 form is required by most lenders for buildings over 11 metres and by the Building Safety Act 2022 regime for buildings over 18 metres. A pass rating (A1 or A2) clears the mortgage. A fail (B2) usually kills it, although the Cladding Safety Scheme and the Developer Pledge are gradually unblocking buildings as remediation completes. Ask for a copy of the current EWS1, and ask whether any remediation is planned, in progress or complete. If the building is pre-2000, low-rise (under 11m), and clearly brick or stone, EWS1 may not apply.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">7. Share of freehold vs straight leasehold</h2>
          <p>If the flat comes with a share of freehold (usually a 1/8 or 1/12 share in a freehold company), that&apos;s strictly better than plain leasehold. Service charges tend to be at cost. Lease extensions are nearly free. Decisions are voted on collectively. The only complication is that you become a director or member of the freehold company on completion, with corresponding administrative duties. Most leaseholders manage fine.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">8. Section 20 consultations</h2>
          <p>If a Section 20 consultation under the Landlord and Tenant Act 1985 is in progress (this is the formal consultation freeholders must run for any works costing more than £250 per leaseholder), find out the scope, expected cost and timeline. The bill lands on whoever owns the flat at the date of billing. Buyers regularly inherit £8,000-£20,000 special charges they didn&apos;t price into their offer. The LPE1 form should disclose this; if it doesn&apos;t and consultation papers are visible in the entrance hall, that&apos;s the warning.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">9. The LPE1 form (the UK&apos;s answer to a Section 32)</h2>
          <p>The Leasehold Property Enquiries 1 is the standard pack the freeholder or managing agent compiles for prospective buyers. It covers service charge accounts, sinking fund, planned works, disputes, insurance, ground rent collection history, and any restrictions on letting or alterations. It costs £200-£500 and takes 4-6 weeks to produce. Australian buyers will recognise this as the equivalent of a Section 32 vendor statement. Read every page; the answers are often telling.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">10. Restrictive covenants in the lease</h2>
          <p>The lease itself contains covenants restricting how you use the flat: no pets, no commercial use, no hanging washing on balconies, no hard flooring in upstairs flats, no subletting without consent. These bind every successor in title. The lease is sometimes 80-150 pages and full of tedious clauses; your solicitor reads it line by line, but you should at least skim the covenants and the alterations section before exchange. See our <Link href="/guides/restrictive-covenants-explained" className="text-blue-700 underline">covenants guide</Link> for the wider picture.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">11. Residents&apos; association</h2>
          <p>An active Recognised Tenants&apos; Association (RTA) signals engaged leaseholders and accountable management. RTA recognition under section 29 of the Landlord and Tenant Act 1985 gives leaseholders formal rights to be consulted, see contracts, and challenge service charges. A block with no association is fine on smaller buildings, suspicious on larger ones. Ask whether one exists and ask to speak to its chair.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check the title before you offer</h2>
          <p>The lease, the title register, the freeholder identity and the price paid by the current owner all show up on the official copy of register entries. £3 from HM Land Registry directly, or it&apos;s included in our paid reports. See the <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> for what we surface, and the <Link href="/guides/freehold-vs-leasehold" className="text-blue-700 underline">freehold vs leasehold guide</Link> for the bigger tenure picture.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Run a free check on the flat you&apos;re viewing</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
