import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "How to read a UK Land Registry title register, line by line",
  description: "The Property, Proprietorship and Charges Registers explained. What restrictions, easements, registered owner, price paid memo and covenants look like, with a redacted example.",
  alternates: { canonical: "/guides/title-register-uk-explained" },
};

export default function TitleRegisterGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/title-register-uk-explained";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "How to read a UK Land Registry title register, line by line",
            description: "What each section of the official copy of register entries means, including restrictions, easements, charges and price paid memos.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Title register explained", url: "/guides/title-register-uk-explained" },
          ]),
          faqSchema([
            { q: "How do I get a copy of a property's title register?", a: "Order it directly from HM Land Registry at gov.uk/search-property-information-land-registry for £3 per document. You'll get the title register and, separately, the title plan (also £3). Most properties in England and Wales are registered; about 13% remain unregistered, mostly in the hands of long-term owners." },
            { q: "What's the difference between the title register and the title plan?", a: "The register is the textual record of who owns the property, what charges and covenants apply, and what restrictions are noted. The plan is the map showing the boundary outlined in red and any rights of way coloured in. The register references the plan but doesn't reproduce it." },
            { q: "Does the title register show the exact boundary?", a: "No. HM Land Registry plans show 'general boundaries' under section 60 of the Land Registration Act 2002, the red line is indicative, not legally precise. The actual boundary is determined by the original deed plans, physical features on the ground, and adverse possession history. Boundary disputes are resolved by the First-tier Tribunal (Property Chamber), not by reading off the title plan." },
            { q: "Can I see what the previous owner paid?", a: "Yes, for any sale registered after 1 April 2000. The Proprietorship Register includes a 'price paid' entry showing the consideration paid by the current registered proprietor when they bought it. Earlier sales aren't recorded on the register but can be looked up via the Land Registry's Price Paid Data dataset for sales since 1995." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">How to read a UK Land Registry title register &mdash; line by line</h1>
          <p className="mt-4">The official copy of register entries is the legal record of who owns a property, what they paid, what they owe, and what restrictions sit on the title. It costs £3 from HM Land Registry, takes about an hour to order, and tells you more about the property than the estate agent will in a month. Almost no buyers read one before offering. The ones who do save themselves a lot of money.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">The three sections</h2>
          <p>Every register has the same three parts, in order: A, B and C. Section A is the Property Register, which describes what you&apos;re buying. Section B is the Proprietorship Register, which says who owns it and what they paid. Section C is the Charges Register, which lists everything that limits the owner&apos;s rights, from mortgages to restrictive covenants to easements granted in favour of someone else.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Section A: the Property Register</h2>
          <p>This is the description. Address, county, postcode, and the title number (a unique identifier like NK123456 for Norfolk or LN789012 for Lincolnshire). It also says whether the title is freehold or leasehold (and if leasehold, the date and term of the lease). It often references the title plan (&ldquo;the land shown edged with red on the plan of the above title filed at the Registry&rdquo;), and it can include rights of way granted <em>in favour</em> of the property over neighbouring land.</p>
          <p>The bit to read carefully: any easements <em>benefiting</em> the property, like a right of way across a neighbour&apos;s drive, or a right to use a shared sewer. These are valuable and you want to know they exist. They&apos;re usually phrased as &ldquo;together with the right for the registered proprietor and successors in title to pass and repass with or without vehicles over the land coloured brown on the plan.&rdquo;</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Section B: the Proprietorship Register</h2>
          <p>The legal owner&apos;s name, address, and (since 2000) the price paid for the property when they bought it. There&apos;s also the Class of Title: <em>Absolute</em> is the gold standard and what almost every modern title is. <em>Possessory</em> means the owner has occupied without producing the original deeds and is more limited; <em>Qualified</em> is rare and indicates a flaw the Registrar has noted. <em>Good Leasehold</em> applies where the lease is registered but the underlying freehold isn&apos;t.</p>
          <p>This section can also include <strong>restrictions</strong>, which are entries that prevent certain transactions without specific consent. The most common is the Form A restriction (used when the property is held jointly as tenants in common), the Form N restriction (used when a mortgage is in place and a deed of covenant must be executed before sale), and bespoke restrictions imposed by parents who gifted a deposit or by trustees. A restriction is not a problem in itself, but it&apos;s a problem if the seller doesn&apos;t mention it and you find out at exchange.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Section C: the Charges Register</h2>
          <p>The most important section for a buyer. It lists everything that burdens the title. In order of seriousness:</p>
          <p><strong>The mortgage charge</strong> in favour of the lender (usually the first or second entry). The seller must redeem this on completion; your solicitor handles the discharge. <strong>Restrictive covenants</strong>, often quoting deeds from the 1880s to 1960s, restricting use, building, parking, livestock, paint colour, fence height. <strong>Easements granted to others</strong>, like a neighbour&apos;s right of way across your drive, or a utility company&apos;s right to maintain pipes. <strong>Notices and cautions</strong>, including chancel repair notices, registered leases of garages or parts of the property, and overage agreements (where the seller of land retains a share of any future development uplift).</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">A redacted example</h2>
          <p>Imagine the register opens with: &ldquo;Title Number: ZZ123456. The Freehold land shown edged with red on the plan of the above title filed at the Registry being 14 Acacia Avenue, Sometown, AB1 2CD.&rdquo; That&apos;s Section A.</p>
          <p>Then Section B: &ldquo;1. (07.06.2018) Proprietor: ALICE EXAMPLE and BENJAMIN EXAMPLE of 14 Acacia Avenue. 2. (07.06.2018) The price stated to have been paid on 1 June 2018 was £325,000. 3. (07.06.2018) RESTRICTION: No disposition by a sole proprietor of the registered estate is to be registered except under an order of the court.&rdquo; That tells you they bought it in 2018 for £325,000, hold as tenants in common, and the surviving spouse can&apos;t sell without sorting probate.</p>
          <p>Then Section C: &ldquo;1. A Conveyance dated 23 March 1923 contains the following covenants: not to use the said premises for any trade business or manufacture, not to erect any additional building thereon without the consent in writing of the Vendor or his successors. 2. (07.06.2018) REGISTERED CHARGE in favour of NATIONWIDE BUILDING SOCIETY.&rdquo; That tells you there&apos;s a 1923 covenant against business use and against extensions, and there&apos;s a current mortgage with Nationwide.</p>
          <p>Three pieces of information from £3, before you offer. The 1923 covenant might block your loft conversion plans (or at least demand indemnity insurance). The £325,000 price paid in 2018 helps you anchor your offer against the asking price in 2026. The mortgage tells you the seller has a chain dependency.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Where boundaries actually live</h2>
          <p>Not on the register. The title plan shows the &ldquo;general boundary&rdquo; under section 60 of the Land Registration Act 2002, which is indicative only. Disputes are resolved by examining original deeds, physical features (walls, hedges, fences), and adverse possession history. If you suspect a boundary problem, ask the seller for the original conveyance plan, not just the title plan. The First-tier Tribunal (Property Chamber) is where boundary disputes go, not the High Court.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Pull the title before you offer</h2>
          <p>£3 from HM Land Registry directly, or it&apos;s included in our paid reports with a plain-English summary of every entry. See the <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> for what we surface, and the <Link href="/property-history-check" className="text-blue-700 underline">free property check</Link> page for the wider risk picture.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check the property&apos;s title and history free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
