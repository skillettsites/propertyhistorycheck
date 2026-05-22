import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Buying a property with Japanese knotweed nearby, risk and remediation",
  description: "How to identify Japanese knotweed, the 7-metre rule, mortgage impact, treatment costs, insurance-backed warranties and the TA6 disclosure obligation post-Davies v Bridgend.",
  alternates: { canonical: "/guides/japanese-knotweed-property" },
};

export default function JapaneseKnotweedGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/japanese-knotweed-property";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Buying a property with Japanese knotweed nearby, risk and remediation",
            description: "Identification, the 7-metre rule, treatment cost, insurance-backed warranties, neighbour disputes and TA6 disclosure post-Davies v Bridgend.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Japanese knotweed", url: "/guides/japanese-knotweed-property" },
          ]),
          faqSchema([
            { q: "What is the 7-metre rule?", a: "The RICS Information Paper on Japanese knotweed (revised 2022) sets a 3-metre management category and a 7-metre material consideration distance. Knotweed within 7 metres of a habitable structure is generally treated as a material risk requiring management; within 3 metres is typically treated as urgent." },
            { q: "How much does knotweed treatment cost?", a: "Glyphosate-based herbicide treatment over 3-5 years costs £2,000-£5,000 for a typical residential infestation, with insurance-backed guarantees adding £200-£800. Excavation and removal costs £5,000-£20,000 but completes in weeks rather than years. Most lenders accept either approach if backed by a 5-10 year insurance-backed warranty from a Property Care Association member." },
            { q: "Will I get a mortgage if knotweed is identified?", a: "Most mainstream lenders (Halifax, Nationwide, Santander, NatWest) will lend, but they typically require an active management plan from a PCA-accredited contractor with an insurance-backed guarantee transferable to future owners. A handful of lenders refuse outright if the knotweed is on the property itself within 3 metres of the building." },
            { q: "Does the seller have to disclose knotweed?", a: "Yes. Question 7.8 of the TA6 Property Information Form asks specifically about knotweed. After Davies v Bridgend County Borough Council [2024] UKSC 15 and earlier Supreme Court decisions, knowingly answering 'no' or 'not known' when knotweed is present is misrepresentation and can be the basis for a damages claim after completion." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying a property with Japanese knotweed nearby &mdash; risk and remediation</h1>
          <p className="mt-4">Japanese knotweed has acquired a reputation that exceeds the actual structural risk. It will not crack a modern foundation; it will grow through tarmac and lift block paving, and it will travel through cracks in old masonry. The real damage is to property value, mortgage availability, and neighbour relations. Once identified, it&apos;s manageable. The trick is to identify it correctly, price the management plan into the offer, and not panic.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">Identifying knotweed</h2>
          <p>Mature knotweed has hollow, bamboo-like stems with purple-red speckles, growing 2-3 metres tall in summer. Leaves are heart-shaped or shovel-shaped, alternating along the stem in a clear zigzag pattern. White flower spikes appear in late summer. Spring growth is asparagus-like red shoots emerging from established crowns at ground level. The plant dies back to brown canes in winter, which look dead but conceal an active rhizome network metres deep. Misidentification is common; russian vine, bindweed, lilac suckers and dogwood are all routinely mistaken for it. Get a Property Care Association surveyor (£150-£400) to confirm before you panic.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The 7-metre rule and RICS guidance</h2>
          <p>The 2022 revision of the RICS Information Paper on Japanese knotweed introduced a category-based assessment. Category A is knotweed visible on the property within 7 metres of a habitable structure. Category B is on the property but more than 7 metres away. Category C is on a neighbour&apos;s land within 7 metres of the boundary. Category D is on a neighbour&apos;s land more than 7 metres away. Categories A and C are material; B and D are usually noted but don&apos;t require immediate action. A surveyor&apos;s report following this framework is what your lender and insurer will want to see.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Mortgage and insurance impact</h2>
          <p>Most mainstream lenders will lend on a knotweed-affected property if there&apos;s an active management plan from a PCA-accredited contractor with an insurance-backed guarantee (IBG) covering 5-10 years and transferable to future owners. Without an IBG, expect refusals from Halifax, Nationwide and several others. Buildings insurance is rarely affected; knotweed isn&apos;t usually a covered peril, so insurers don&apos;t price for it directly, but they will exclude knotweed-related claims from accidental damage cover.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Treatment options and cost</h2>
          <p>Two real options. Herbicide treatment over 3-5 years costs £2,000-£5,000 plus £200-£800 for the IBG, lets the rhizome die in situ, and is the cheapest route. The downside is that you can&apos;t build over the affected ground until treatment is verified complete. Excavation costs £5,000-£20,000, removes the rhizome physically, and lets construction begin within weeks. Excavation is the right choice if the affected area is where you plan to extend or landscape; herbicide is right for everywhere else. Avoid contractors without PCA accreditation; an IBG from a non-accredited firm is worth nothing to a lender.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Neighbour disputes</h2>
          <p>If knotweed crosses a boundary from a neighbour&apos;s land onto yours, you have a private nuisance claim under <em>Williams v Network Rail [2018] EWCA Civ 1514</em>, which confirmed that knotweed presence within 7 metres of a property is an actionable nuisance even before physical damage occurs. The 2024 Davies v Bridgend Supreme Court ruling clarified the limitation period and damages calculation. If the neighbour is a council, Network Rail, the Highways Agency or a housing association, they typically settle within 6-18 months for treatment cost plus residual diminution in value (£3,000-£15,000 range). Private neighbour disputes are messier and slower.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The TA6 disclosure obligation</h2>
          <p>The TA6 Property Information Form has a specific question (7.8 in the current version) asking whether the property is or has been affected by Japanese knotweed. Sellers must answer truthfully. After the 2020 case of <em>Henderson v Dorset Healthcare</em> and a string of misrepresentation claims, the practical answer is that &ldquo;no&rdquo; or &ldquo;not known&rdquo; when there are obvious bamboo-like canes in the corner of the garden is misrepresentation, and buyers regularly recover damages of £10,000-£50,000 plus treatment costs after completion. As a buyer, ask for the answer in writing, walk the boundaries before exchange, and photograph what you see.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">How to handle a knotweed-affected purchase</h2>
          <p>Get a PCA surveyor to confirm identification and produce a management plan with cost and IBG quote. Use that figure to renegotiate; sellers expect this and many will accept a price reduction equal to treatment cost plus 10-20% diminution. Insist on the IBG being in place at completion, with the policy assigned to you. Add a contractual obligation for the seller to disclose any treatment history and any prior surveyor reports. If the knotweed is on a neighbour&apos;s land, factor in the legal route as a contingency rather than expecting the neighbour to act.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check before you offer</h2>
          <p>Knotweed itself doesn&apos;t show up on official searches, but the surrounding ground risks (flood zones, contaminated land, council enforcement notices) often correlate with affected sites. Our free postcode check flags ground risks instantly, and the paid Premium report includes the surrounding risk picture. See the <Link href="/property-history-check" className="text-blue-700 underline">free property check</Link> page for the data we surface, and the <Link href="/flood-risk-check" className="text-blue-700 underline">flood risk page</Link> for related ground-water indicators.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check the property&apos;s ground risks free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
