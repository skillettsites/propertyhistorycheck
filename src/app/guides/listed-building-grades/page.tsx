import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Listed building grades I, II*, II, what each means for a buyer",
  description: "Listed Building Consent for any alteration, what's protected (windows, fireplaces, plasterwork), unauthorised works penalties, insurance and mortgage availability.",
  alternates: { canonical: "/guides/listed-building-grades" },
};

export default function ListedBuildingGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/listed-building-grades";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Listed building grades I, II*, II, what each means for a buyer",
            description: "What gets protected, what consent looks like in practice, and the long-term ownership cost of buying a listed home.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Listed building grades", url: "/guides/listed-building-grades" },
          ]),
          faqSchema([
            { q: "What is the difference between Grade I, II* and II?", a: "Grade I is exceptional interest (about 2.5% of listings, includes castles, cathedrals, major country houses). Grade II* is particularly important (about 5.8%, includes the best country houses and major town houses). Grade II is nationally important (about 91.7%, includes most ordinary listed homes). Consent rules are the same across all grades." },
            { q: "Do I need consent for internal changes?", a: "Yes. Listed Building Consent applies to internal and external work that affects the character of the building. That includes removing fireplaces, panelling, staircases, plasterwork, internal doors and original floorboards. Repainting is usually fine; replastering with gypsum over lime is usually not." },
            { q: "What's the penalty for unauthorised work?", a: "Carrying out works without Listed Building Consent is a criminal offence under section 9 of the Planning (Listed Buildings and Conservation Areas) Act 1990. Maximum penalty is two years' imprisonment and an unlimited fine. The council can also serve an enforcement notice forcing reversal at the owner's cost, even if the work was done by a previous owner." },
            { q: "Can I get a mortgage on a listed building?", a: "Yes, most mainstream lenders will lend, but they often require a Level 3 RICS Building Survey rather than a Level 2, and may want evidence of specialist insurance in place at completion." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Listed building grades I, II*, II &mdash; what each means for a buyer</h1>
          <p className="mt-4">There are around 400,000 listed buildings in England on the National Heritage List. Most are Grade II terraced or semi-detached homes that look entirely ordinary from the outside. The shock for buyers is that the listing is not just about the facade &mdash; it covers the whole building, inside and out, including features you might not even have noticed at the viewing.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">What the three grades actually mean</h2>
          <p>Grade I covers buildings of exceptional interest &mdash; about 2.5% of listings. Think Westminster Abbey, Chatsworth, Blenheim. As a buyer of a normal home, you will almost never encounter one. Grade II* (pronounced "two star") covers particularly important buildings of more than special interest, around 5.8% of listings. These tend to be the best country houses, significant churches and major townhouses. Grade II covers nationally important buildings of special interest, about 91.7% of listings &mdash; this is the bracket almost every listed home falls into.</p>
          <p>Critically, the consent rules are identical across all three grades. The grade affects grant eligibility, scrutiny level and resale market, but a Grade II terrace and a Grade I cathedral need the same Listed Building Consent for the same kind of alterations.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What is actually protected</h2>
          <p>The list description on the National Heritage List for England (Historic England&apos;s NHLE) tells you what the listing inspector noted, but legally the listing covers the entire building including any object or structure fixed to it, plus any object or structure within the curtilage that pre-dates 1 July 1948. That includes:</p>
          <p>Original windows (especially Georgian sashes and Victorian crown glass), staircases and balustrades, fireplaces and chimneypieces, panelling and shutters, lath-and-plaster ceilings and cornices, original doors and door furniture, flagstone floors, structural timbers, exterior render and historic mortars, garden walls and outbuildings. Removing or replacing any of these without consent is the offence, regardless of whether it&apos;s mentioned in the list description.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Unauthorised work runs with the property</h2>
          <p>This is the bit that catches buyers cold. If a previous owner replaced original sashes with uPVC, ripped out a Victorian fireplace, or installed concrete render over lime, that is your problem now. The council can serve an enforcement notice on the current owner requiring reversal at the owner&apos;s expense, regardless of who did the work. Enforcement is unlimited in time for criminal liability, and there is no statute of limitations on Listed Building Consent enforcement.</p>
          <p>Practical defence: ask the seller for copies of every Listed Building Consent granted on the property, and for indemnity insurance if any unconsented work is suspected. Indemnity policies are cheap (£50-£300 one-off) and cover enforcement costs if the council ever acts.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Insurance and rebuild costs</h2>
          <p>Buildings insurance for a listed property must use specialist underwriters &mdash; Lycetts, NFU Mutual, Hiscox, Ecclesiastical, Adrian Flux. Premiums run 30-80% higher than equivalent unlisted stock because rebuild values are higher (lime mortar, hand-cut stone, oak frames) and total losses can require like-for-like reconstruction. Get a specialist rebuild valuation; the BCIS standard tables underestimate listed builds by 20-40%.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Long-term ownership cost</h2>
          <p>Lime pointing every 50-80 years, sash window restoration every 30-40 years, slate roof every 80-120 years, lead flashings every 60 years &mdash; the maintenance cycle on a listed home is longer but more expensive per intervention than modern materials. Budget 1.5-2.5% of property value annually for upkeep, versus the 1% rule of thumb for unlisted stock. Heritage tax reliefs (Conditional Exemption, Maintenance Funds) apply only to a tiny number of Grade I and Grade II* properties.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check the listing before you offer</h2>
          <p>Look up the property on the National Heritage List for England (search by address). Read the full list description &mdash; not just the headline. Cross-reference what&apos;s described against what you saw at the viewing. Any discrepancy is a question for the seller and your solicitor. Our free postcode check flags listed status instantly, and the paid reports include the NHLE entry summary alongside a title &amp; tenure synthesis (the official title document is a separate £7 HMLR download). See the <Link href="/title-register-check" className="text-blue-700 underline">title register check page</Link> for what else turns up.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check listed building status free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
