import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Buying a flat with a short lease (under 80 years) — what to know",
  description: "Why a sub-80-year lease is a financial cliff edge: marriage value, lender refusals, £10k-£40k extension costs, and how to use it to renegotiate.",
  alternates: { canonical: "/guides/short-lease-buying-a-flat" },
};

export default function ShortLeaseGuide() {
  const url = "https://www.propertyhistorycheck.co.uk/guides/short-lease-buying-a-flat";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Buying a flat with a short lease (under 80 years) — what to know",
            description: "Marriage value, lender thresholds, ground rent traps, and how to negotiate a short-lease flat.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Short lease flats", url: "/guides/short-lease-buying-a-flat" },
          ]),
          faqSchema([
            { q: "What counts as a short lease?", a: "Anything under 80 years is the danger zone because of marriage value. Most lenders won't lend on leases under 70 years, and several won't go below 85 at the start of a 25-year mortgage." },
            { q: "How much does a lease extension cost?", a: "Statutory extensions typically run £10,000 to £40,000 for a flat in a normal market, plus £3,000-£5,000 in legal and valuation fees. The cost rises sharply once the lease drops below 80 years." },
            { q: "Can I extend the lease straight after buying?", a: "Yes, but only if the seller has owned the flat for at least two years (the right transfers via a section 42 notice). If they haven't, you'll either wait two years yourself or ask the seller to serve notice and assign the benefit on completion." },
            { q: "What is a peppercorn ground rent?", a: "A nominal ground rent (effectively zero) that protects the leasehold from being treated as an assured tenancy. Modern statutory extensions reset ground rent to a peppercorn for 90 extra years on top of the existing term." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying a flat with a short lease (under 80 years) &mdash; what to know</h1>
          <p className="mt-4">A short lease is the single biggest reason flats sell below market value, and the single biggest trap for first-time buyers chasing what looks like a bargain. If the lease has fewer than 80 years left, you are not really negotiating on the flat &mdash; you are negotiating on the lease.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">The 80-year cliff</h2>
          <p>UK leasehold law has a quirk called <em>marriage value</em>. Once a lease drops below 80 years, the freeholder is legally entitled to half of the uplift in value created by extending it. In practice this can add £15,000-£30,000 to the cost of an extension overnight. A flat with 81 years left and an identical flat with 79 years left can have completely different price tags, and most sellers don&apos;t mention it.</p>
          <p>If you&apos;re buying a flat with 82-85 years remaining, you should still extend soon. Lenders look at the lease term <em>at the end</em> of the mortgage, not the start. A 25-year mortgage on an 84-year lease leaves 59 years at the back end, which makes resale a problem.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Where lenders draw the line</h2>
          <p>Most high-street lenders refuse to lend on a lease with fewer than 70 years remaining, and several won&apos;t go below 85 at the point of application. Halifax, Nationwide and Santander all have published thresholds that a broker can confirm. If the lease is short, the buyer pool shrinks to cash buyers and specialist lenders, which is exactly why these flats sit on the market.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What an extension actually costs</h2>
          <p>You have a statutory right to a 90-year extension (added to the existing term) at peppercorn ground rent under the Leasehold Reform, Housing and Urban Development Act 1993. The premium &mdash; the lump sum paid to the freeholder &mdash; depends on the flat value, ground rent, and years remaining. As a rough guide:</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Ballpark extension premiums</h3>
          <p>For a £300,000 flat in an average area: 95 years left costs around £4,000-£7,000. 81 years left costs around £8,000-£12,000. 78 years left jumps to £15,000-£25,000. 65 years left can be £30,000-£45,000+. Add £3,000-£5,000 for surveyor and solicitor fees on both sides, because under the 1993 Act you pay the freeholder&apos;s reasonable costs as well as your own.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Ground rent traps</h2>
          <p>Older leases sometimes contain ground rent doubling clauses (every 10, 15 or 25 years), or escalators tied to RPI. A doubling clause that takes ground rent to £8,000 a year by year 50 is a property nobody will buy or lend on. The Leasehold Reform (Ground Rent) Act 2022 abolished ground rent on <em>new</em> leases granted after June 2022, but it does not retroactively fix existing leases. Read the lease itself, not the estate agent&apos;s summary.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">How to use the short lease in your offer</h2>
          <p>The cleanest play is: get a formal valuation of the extension premium from a specialist surveyor (a free desktop estimate from somewhere like LEASE or the Association of Leasehold Enfranchisement Practitioners is enough at offer stage). Then offer the asking price <em>minus</em> the full extension cost, including fees. Sellers of short-lease flats already know the maths; they just hope you don&apos;t. Many will accept.</p>
          <p>Even better, ask the seller to serve a section 42 notice <em>before</em> exchange and assign the benefit to you on completion. That way you can extend immediately on day one rather than waiting two years to qualify. Your solicitor handles the wording.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check the lease before you offer</h2>
          <p>Years remaining, ground rent terms, service charge history and any deeds of variation all show up on the title register. Pulling the official copy is £3 from HM Land Registry direct, or it&apos;s included in our paid reports along with a plain-English summary. See the <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> for what shows up.</p>

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
