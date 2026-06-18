import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Restrictive covenants on UK property, what they are and how to handle them",
  description: "What restrictive covenants are, common types, when they're enforceable vs unenforceable, Lands Tribunal applications, indemnity insurance and what to ask your solicitor.",
  alternates: { canonical: "/guides/restrictive-covenants-explained" },
};

export default function RestrictiveCovenantsGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/restrictive-covenants-explained";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Restrictive covenants on UK property, what they are and how to handle them",
            description: "Common covenant types, enforceability, Lands Tribunal applications, indemnity insurance and the right questions for your solicitor.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Restrictive covenants", url: "/guides/restrictive-covenants-explained" },
          ]),
          faqSchema([
            { q: "Are old restrictive covenants still enforceable?", a: "Sometimes. A covenant binds a successor in title only if it was properly registered, the burden was intended to run with the land, and someone with the benefit can be identified. Pre-1925 covenants without a clear beneficiary are often unenforceable in practice, but proving that costs money. Indemnity insurance is usually cheaper." },
            { q: "How much does covenant indemnity insurance cost?", a: "Typically £80-£400 as a one-off premium for a residential property, depending on the breach and the property value. The policy runs in perpetuity and transfers to future owners. Cover includes legal costs, demolition costs and any reduction in value if enforcement succeeds." },
            { q: "Can a covenant be removed?", a: "Yes, via the Upper Tribunal (Lands Chamber) under section 84 of the Law of Property Act 1925, which can modify or discharge covenants that are obsolete, that impede reasonable use, or where the beneficiary agrees. Applications cost £880 to file and often £5,000-£15,000 in legal and surveyor fees, so most buyers use indemnity insurance instead." },
            { q: "Where do I find the covenants on a property?", a: "They sit in the Charges Register (Section C) of the official copy of register entries from HM Land Registry. Anyone can buy a copy for £3 at gov.uk/search-property-information-land-registry, or your solicitor will pull one as part of conveyancing." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Restrictive covenants on UK property &mdash; what they are and how to handle them</h1>
          <p className="mt-4">A restrictive covenant is a clause in the title deeds that limits what you can do with the property. Most UK homes have at least one, and most owners never run into them. The trouble starts when you want to build an extension, run a business from home, park a caravan on the drive, or paint the front door a colour the original developer didn&apos;t list. Then the 1923 deed of covenant becomes very real.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">What a covenant actually is</h2>
          <p>It&apos;s a binding promise made by an earlier owner that runs with the land. The original promisor (the covenantor) and the original beneficiary (the covenantee) are long dead in most cases, but the covenant still appears in the Charges Register because it was registered against the title. Section C of the official copy is where you&apos;ll find it, usually as a paragraph quoting the 1890s, 1920s or 1960s deed that created it.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The common types</h2>
          <p>The covenants you actually run into on residential property fall into a handful of categories. <em>No business or trade use</em> is the most common, originating from estates that wanted to stay residential. <em>No additional buildings or extensions without consent</em> is next, often paired with a requirement to submit plans to a named (and usually defunct) developer. <em>Parking restrictions</em> typically ban caravans, lorries, commercial vehicles or boats from being kept on the drive. <em>Approved colours, materials or window styles</em> appear on newer estates and on conservation-aware developments. <em>No livestock</em>, <em>no fences over a certain height</em>, and <em>maintain the boundary on the western side</em> are the also-rans you see in old village covenants.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">When covenants are enforceable</h2>
          <p>Three things have to be true for a successor in title to be bound. First, the covenant must have been registered properly, which for post-1925 covenants means it appears on the title and was notified to the buyer at the time. Second, the burden must have been intended to run with the land rather than be a personal promise. Third, someone with the benefit must still be identifiable and willing to enforce. That last point is where most old covenants fall down. If the original beneficiary was a Victorian developer whose company was dissolved a century ago and whose estate was sold off plot by plot, there&apos;s often nobody left to sue you.</p>
          <p>That doesn&apos;t mean you can ignore the covenant. A neighbour who can prove they were a successor to the original benefit (because they bought a plot from the same estate) can sometimes enforce, and lenders and future buyers will see the covenant on your title and ask questions. Unenforceable covenants still depress resale unless dealt with formally.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Indemnity insurance: the usual answer</h2>
          <p>For most breaches, the standard fix is restrictive covenant indemnity insurance. A specialist provider (DUAL Asset, Countrywide Legal Indemnities, GCS) issues a one-off policy that pays out if anyone with the benefit ever enforces. Premiums are typically £80-£400 for a residential breach worth under £500,000 of property value, the policy lasts forever, and cover transfers to future owners. Mortgage lenders accept it without fuss.</p>
          <p>Two practical points. The policy must be in place <em>before</em> any approach is made to the original beneficiary, because asking blows the cover (it puts the beneficiary on notice and removes the insurer&apos;s risk). And the policy only covers existing breaches; if you build a new extension after completion that breaches a covenant, that&apos;s a fresh problem.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The Lands Tribunal route</h2>
          <p>For genuinely obsolete covenants, an application to the Upper Tribunal (Lands Chamber) under section 84 of the Law of Property Act 1925 can modify or discharge them. Grounds include obsolescence, that the covenant impedes reasonable use, that the beneficiary consents (or has been notified and not objected), or that no injury would be caused. Filing fee is £880, but legal and surveyor fees usually run £5,000-£15,000 and the case takes 9-18 months. Most residential buyers don&apos;t bother and rely on indemnity insurance instead. Tribunal is the right route if you&apos;re a developer and the covenant is blocking a meaningful change of use.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What to ask your solicitor</h2>
          <p>Three questions, in order. First: are there any restrictive covenants on the title, and what do they say? Second: are there any visible breaches of those covenants on the property today (an obvious extension, a business sign, a non-conforming front door)? Third: if there are breaches, is indemnity insurance available, and at what premium? Don&apos;t accept "the covenants are old, they&apos;re probably unenforceable" as the answer. Get the indemnity policy, or get the tribunal route costed, before you exchange.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check the title before you offer</h2>
          <p>The Charges Register is where covenants live. Pull the official copy for £3 from HM Land Registry directly to read every covenant in full. Our paid reports don&apos;t reproduce that document, they synthesise tenure, ownership and sale history from public data and point you to the £3 copy for the covenant detail. See the <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> for what else surfaces, and the <Link href="/property-history-check" className="text-blue-700 underline">free property check</Link> to scan the property before you commit.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check the property&apos;s covenants and title free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
