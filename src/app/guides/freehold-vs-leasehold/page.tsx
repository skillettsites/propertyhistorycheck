import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Freehold vs leasehold, what UK buyers need to know in 2026",
  description: "Definitions, the Leasehold and Freehold Reform Act 2024, commonhold, share of freehold, lease extension cost, service charges, and what mortgage lenders look for.",
  alternates: { canonical: "/guides/freehold-vs-leasehold" },
};

export default function FreeholdVsLeaseholdGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/freehold-vs-leasehold";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Freehold vs leasehold, what UK buyers need to know in 2026",
            description: "Practical guide to UK tenure: ground rent reform, commonhold, share of freehold, lease extension costs and what lenders care about.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Freehold vs leasehold", url: "/guides/freehold-vs-leasehold" },
          ]),
          faqSchema([
            { q: "Is freehold always better than leasehold?", a: "For houses, almost always yes, there's no rational reason to buy a leasehold house in 2026 unless the discount is enormous. For flats, leasehold or share of freehold is the norm because someone has to maintain the shared structure. Share of freehold is generally preferable to plain leasehold because the leaseholders collectively control the freehold." },
            { q: "Did the 2024 Reform Act abolish ground rent?", a: "Not quite. The Leasehold Reform (Ground Rent) Act 2022 already capped ground rent at a peppercorn for new leases granted after June 2022. The Leasehold and Freehold Reform Act 2024 made statutory lease extensions cheaper and longer (990 years rather than 90), abolished marriage value for lease extensions, and made it easier for leaseholders to buy the freehold. Some commencement provisions are still being phased in through 2025-2026." },
            { q: "What's commonhold?", a: "A tenure where each flat is owned freehold, and the shared structure is owned collectively by a Commonhold Association made up of all the flat owners. It's existed since 2004 but has been used on fewer than 20 schemes. The 2024 Act and a planned Commonhold Bill aim to make commonhold the default for new flats from 2026 onwards." },
            { q: "How much does a lease extension cost in 2026?", a: "Statutory extensions under the post-2024 reforms typically run £4,000-£15,000 for a £300,000 flat with 80-95 years remaining, plus £2,000-£4,000 in fees. Below 80 years was a cliff edge under the old marriage value rules; the 2024 Act abolished marriage value, so the old 80-year panic is partly gone, but premiums still rise as the term shortens." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Freehold vs leasehold &mdash; what UK buyers need to know in 2026</h1>
          <p className="mt-4">UK property tenure is a mess by international standards. Most countries handle apartment ownership through condominium or strata title, where each unit is owned outright and the shared parts are co-owned. England and Wales mostly do it through leasehold, where you own a long-term tenancy and someone else (the freeholder) owns the building. The 2024 Act has started fixing this, but the reform is partial, and the difference between tenures still affects what you can buy, what it costs to own, and what it sells for later.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">Freehold in plain terms</h2>
          <p>Freehold means you own the property and the land it sits on, in perpetuity. Nobody can charge you ground rent, nobody can refuse permission to extend or alter (subject to planning), and nobody else has a stake in the structure. For houses this is the default and the right answer. The only complication is when houses are sold leasehold (the so-called &ldquo;leasehold house&rdquo; scandal of 2010-2017, which the 2022 Act largely killed for new builds). If you&apos;re looking at a leasehold house, walk away unless the discount is significant or you can buy the freehold quickly.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Leasehold in plain terms</h2>
          <p>You buy the right to occupy a property for a fixed term, typically 99, 125, 250 or 999 years from when the lease was first granted. The freeholder owns the building and the land. You pay ground rent (now capped on new leases, but still charged on older ones) and a service charge for maintenance of shared parts. You typically need the freeholder&apos;s consent for alterations, subletting, and pets. The lease is the contract that governs all of this, and it varies wildly between blocks.</p>
          <p>Why are blocks of flats almost always leasehold? Because someone has to be responsible for the roof, the lift, the corridors and the foundations, and English freehold law doesn&apos;t have a clean way to make multiple freeholders share that responsibility. Leasehold is the bodge that solves it. Commonhold is the alternative, and Scotland uses tenement law that works on similar collective principles.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Share of freehold</h2>
          <p>The middle ground. The leaseholders in a block jointly own the freehold (usually through a company in which each flat owns a share) and grant themselves long leases. You still technically have a lease, but the freeholder is you and your neighbours, so ground rent is nominal, service charges are at cost, and lease extensions are free other than legal fees. It&apos;s strictly better than plain leasehold. If you&apos;re comparing two equivalent flats, the share-of-freehold one is worth roughly 5-10% more.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The Leasehold and Freehold Reform Act 2024</h2>
          <p>The biggest change to leasehold law in a generation. Three pieces matter for buyers: lease extensions are now 990 years rather than 90, marriage value below 80 years has been abolished (the old cliff edge), and the cost of buying the freehold collectively (enfranchisement) has been simplified and capped. Some provisions commenced in 2024, others are being phased in through 2025-2026. Always confirm with your solicitor which sections apply at the date of your purchase.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Service charges and the sinking fund</h2>
          <p>Service charges cover communal maintenance: cleaning, lighting, insurance, lift servicing, decoration, and reserves. £1,500-£4,000 a year is normal for a flat in a low-rise block, £3,000-£8,000 for a portered or amenity-heavy building. Always ask for three years of accounts before you offer. A sudden jump from £1,800 to £3,200 usually signals a major works project (Section 20 consultation), and that bill lands on whoever owns the flat when it&apos;s billed, not whoever was there when the work was decided. The sinking fund (or reserve fund) is the long-term savings pot for big-ticket items like roof or lift replacement; a healthy one is 5-10% of recent annual service charge income, growing.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What mortgage lenders look for</h2>
          <p>Lease term remaining at the end of the mortgage (most lenders want 30-40 years left after the mortgage ends), ground rent terms (no doubling clauses, no escalators tied to RPI without caps), reasonable service charge history, and EWS1 cladding clearance for blocks built post-2000 and over 11 metres. Halifax, Nationwide and Santander all publish thresholds; your broker will check before submitting. If the lease is short or the ground rent escalates, the buyer pool collapses to cash and specialist lenders.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check the title before you offer</h2>
          <p>The lease and the title register tell you everything. Years remaining, ground rent terms, restrictions on use, and the freeholder&apos;s identity all show up on the official copy. The £7 spend before offering is usually the best money you&apos;ll spend on a flat purchase. See our <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> and the <Link href="/guides/short-lease-buying-a-flat" className="text-blue-700 underline">short lease guide</Link> for what to watch for.</p>

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
