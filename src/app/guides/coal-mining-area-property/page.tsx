import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Buying a property in a coal mining area",
  description: "CON29M coal mining searches, subsidence, mine entries, insurance refusals and how to read a Coal Authority report before you offer.",
  alternates: { canonical: "/guides/coal-mining-area-property" },
};

export default function CoalMiningGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/coal-mining-area-property";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Buying a property in a coal mining area",
            description: "How to read a CON29M, what subsidence and mine entries mean for insurance, and where the real risks sit.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Coal mining areas", url: "/guides/coal-mining-area-property" },
          ]),
          faqSchema([
            { q: "Do I need a coal mining search?", a: "If the property sits in a Coal Authority reporting area (around 25% of England, mostly the Midlands, North East, North West, Yorkshire, Kent and parts of Wales and Scotland), yes, your solicitor will order a CON29M as standard. It costs around £60." },
            { q: "What does 'mine entry within 20 metres' actually mean?", a: "It means there's a recorded shaft, adit or treatment site close to the property. The Coal Authority assesses whether it's been capped, treated or remains a hazard. A treated shaft within 20m of a house often still gets mortgage approval; an untreated one usually doesn't." },
            { q: "Will I get insurance?", a: "Most mainstream insurers will cover properties in coal mining areas, but premiums can be 20-40% higher and subsidence excesses often jump from £1,000 to £2,500-£5,000. If the report flags active issues, you'll need a specialist." },
            { q: "Can I make a subsidence claim against the Coal Authority?", a: "Yes, the Coal Authority is liable under the Coal Mining Subsidence Act 1991 for damage caused by past coal workings. Claims are free to lodge and typically settled within 6-12 months for confirmed cases." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying a property in a coal mining area</h1>
          <p className="mt-4">Around 8% of UK homes sit above former coal workings, and roughly a quarter of England falls inside a Coal Authority reporting area. Most of these properties are completely fine to buy &mdash; but the ones that aren&apos;t can be very, very not fine, and the warning signs are buried in a search report most buyers never read.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">What the CON29M actually checks</h2>
          <p>If a property is in a Coal Authority reporting area, your solicitor will order a CON29M coal mining search as standard. It costs around £60 and arrives within 5-7 working days. The report covers ten things: past underground workings, present underground workings, future underground workings, mine entries within 20 metres, coal mining geology, subsidence claims and damage notices, opencast workings (past, present, future), withdrawal of support, working facilities orders, and emergency surface hazards.</p>
          <p>What you actually want to know boils down to three questions: is there a mine entry near the house, is there a recorded subsidence claim, and has support ever been formally withdrawn. Anything else is mostly background.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Mine entries: the dealbreaker</h2>
          <p>A mine entry is a shaft, adit or drift &mdash; a vertical or sloping access into the workings. There are around 175,000 recorded mine entries in Britain, and the actual number is higher because pre-1872 records are patchy. A mine entry within 20 metres of the property triggers the Coal Authority to assess current condition. If it&apos;s capped, grouted and treated, lenders are usually happy. If it&apos;s untreated or condition is unknown, expect mortgage refusals from mainstream lenders and insurance premiums 50-100% higher.</p>
          <p>The unrecorded ones are scarier. Pre-1872 shafts often appear without warning &mdash; literally, as garden collapses. The Coal Authority funds emergency stabilisation, but the disruption (months of investigation, restricted access, possible relocation) is real.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Subsidence history</h2>
          <p>A previous subsidence damage notice on the property is not necessarily a dealbreaker &mdash; if the Coal Authority has accepted liability and remediated, the structure is now better understood than most. But it does flag insurance complications. Subsidence excesses on a previously claimed property are typically £2,500-£5,000 versus £1,000 standard. Future buyers will see the same record and ask the same questions.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Where coal mining areas sit</h2>
          <p>The big regions are South Yorkshire, West Yorkshire, Nottinghamshire, Derbyshire, Staffordshire, Durham, Northumberland, South Lancashire, Cumbria, Kent (East Kent coalfield), South Wales, central Scotland (Lothian, Fife, Lanarkshire) and Ayrshire. Towns like Doncaster, Barnsley, Rotherham, Mansfield, Stoke, Wigan, Sunderland, Merthyr Tydfil and Cowdenbeath are heavily affected. House prices already reflect this, which is why postcodes that look cheap relative to surrounding areas often sit on coal.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Insurance refusals</h2>
          <p>The properties that struggle to get standard buildings insurance are the ones with active subsidence claims, untreated mine entries within 50m, or previous structural movement. Specialist insurers (Adrian Flux, Towergate, Premier Property) will quote, but at 2-3x mainstream premiums and with restricted excesses. If insurance is unavailable, the mortgage falls through; this is the route most coal-affected sales actually collapse along.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">How this affects resale</h2>
          <p>A clear CON29M with no entries, no claims and no withdrawn support has zero impact on resale. A flagged report stays in the title and search history forever; future buyers will pay for their own CON29M and see the same flags. Price the discount in at purchase rather than expecting to recover it later.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check before you offer</h2>
          <p>Coal Authority reporting area status, plus other ground risks (radon, landslip, contaminated land), should be checked before you instruct searches. Our free postcode check flags coal mining areas instantly; the paid Premium report layers in subsidence indicators alongside flooding. The <Link href="/flood-risk-check" className="text-blue-700 underline">flood risk page</Link> covers the related ground-water risks.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check the property&apos;s mining and ground risks free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
