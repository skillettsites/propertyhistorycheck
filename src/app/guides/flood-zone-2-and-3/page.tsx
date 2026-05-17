import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "How to read a UK flood zone map",
  description: "Flood Zones 1, 2, 3a and 3b explained. Surface water vs rivers and sea, climate projections, Flood Re eligibility, insurance premium hikes and lender attitudes.",
  alternates: { canonical: "/guides/flood-zone-2-and-3" },
};

export default function FloodZoneGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/flood-zone-2-and-3";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "How to read a UK flood zone map",
            description: "Zone 1, 2, 3a, 3b, surface water risk, Flood Re, insurance and lender attitudes for UK buyers.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "UK flood zones", url: "/guides/flood-zone-2-and-3" },
          ]),
          faqSchema([
            { q: "What does Flood Zone 2 mean?", a: "Flood Zone 2 is medium probability of river or sea flooding — between 1 in 1,000 (0.1%) and 1 in 100 (1%) annual chance for rivers, or between 1 in 1,000 and 1 in 200 (0.5%) for the sea, in any given year, ignoring defences." },
            { q: "What does Flood Zone 3 mean?", a: "Flood Zone 3a is high probability — 1% or greater annual chance from rivers, 0.5% or greater from the sea. Zone 3b is the functional floodplain where flooding is expected most years (5% annual chance or greater)." },
            { q: "Will I get insurance in Zone 3?", a: "Yes, via the Flood Re scheme for properties built before 1 January 2009. Flood Re caps the flood element of buildings insurance at around £210-£540 per year depending on council tax band. Properties built after 2009 are excluded and rely on the open market." },
            { q: "Will lenders mortgage a Zone 3 property?", a: "Most mainstream lenders will, provided buildings insurance with full flood cover is in place at completion. They usually require a written quote from the insurer before issuing the mortgage offer. Some lenders refuse Zone 3b functional floodplain entirely." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">How to read a UK flood zone map</h1>
          <p className="mt-4">Around 5.7 million UK properties are at some level of flood risk, and the Environment Agency expects that to rise to 7 million by 2050 under current climate projections. The flood zone map is freely available, but it&apos;s easy to misread &mdash; especially the difference between river/sea flooding and surface water, which most buyers don&apos;t realise are mapped separately.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">The four zones</h2>
          <p>Flood Zone 1 is low probability &mdash; less than 1 in 1,000 (0.1%) annual chance of flooding from rivers or the sea. About 90% of England sits in Zone 1. Insurance is standard, lenders don&apos;t care, no special requirements.</p>
          <p>Flood Zone 2 is medium probability &mdash; between 1 in 1,000 and 1 in 100 (1%) annual chance from rivers, or between 1 in 1,000 and 1 in 200 (0.5%) from the sea. Insurance premiums tend to load 20-50% versus equivalent Zone 1 stock. Lenders are usually fine.</p>
          <p>Flood Zone 3a is high probability &mdash; 1% or greater annual chance from rivers, 0.5% from the sea. Insurance loads 50-200% if you&apos;re outside Flood Re; mainstream lenders want to see a flood-cover quote before issuing the offer.</p>
          <p>Flood Zone 3b is the functional floodplain &mdash; land expected to flood with at least a 5% annual chance, or where water is stored in time of flood. Some lenders refuse Zone 3b outright, and new development is heavily restricted under the National Planning Policy Framework.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Surface water flooding is the hidden one</h2>
          <p>The Environment Agency map you usually see covers rivers and the sea. Surface water (also called pluvial) flooding &mdash; where heavy rainfall overwhelms drainage &mdash; is mapped separately and affects roughly 3.4 million properties. It&apos;s the most common cause of flood claims in England, and a property can be Zone 1 for rivers and sea while being High Risk for surface water. Always check both layers; the official mapping is at check-long-term-flood-risk.service.gov.uk and we surface both in our paid reports.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What climate projections add</h2>
          <p>The Environment Agency publishes a separate "Risk of Flooding from Rivers and Sea, Including Climate Change" layer projecting risk to the 2050s and 2080s under different warming scenarios. A Zone 2 property today can become Zone 3 by 2080 under a 4-degree scenario. Insurers don&apos;t price this yet, but lenders are starting to think about it for 30-year mortgages, and resale buyers will look up the projection on their phone during the viewing.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Flood Re &mdash; the safety net</h2>
          <p>Flood Re is a reinsurance scheme that lets insurers pass the flood element of high-risk policies to a state-backed pool, capped at £180m claims a year. The cap on the buyer&apos;s flood premium (excluding general buildings cover) is tied to council tax band: roughly £210 for Band A, rising to around £540 for Band G, and unlimited for Band H. The scheme runs to 2039. Critical eligibility rule: properties built after 1 January 2009 are excluded, and so are most blocks of flats, leasehold properties with absent freeholders, and properties used commercially. Always confirm eligibility before exchange.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Real-world insurance premiums</h2>
          <p>For a 3-bed semi at £350,000 rebuild, a Zone 1 standard policy is roughly £250-£400 a year. Zone 2 with no claim history pushes that to £400-£700. Zone 3a outside Flood Re, with claim history, can run £1,200-£3,000. Zone 3b properties built post-2009 sometimes can&apos;t get cover at all from mainstream insurers, and require specialist underwriters at £4,000-£8,000 a year. These numbers move quickly after named storms; check live quotes before you exchange, not just the seller&apos;s last renewal.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What to do if the property is in Zone 2 or 3</h2>
          <p>Get an actual insurance quote in writing before you exchange &mdash; not a guideline, an actual policy quote with the address and claim history. Ask the seller for the last five years of insurance renewals and any claim correspondence. Check property elevation against ground level &mdash; a 60cm step up can move a property out of practical risk even in a flood zone. Check whether flood-resilient measures (air brick covers, non-return valves, raised electrics) are installed. Consider a Property Flood Resilience grant up to £5,000 from the local authority post-flood event.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check before you offer</h2>
          <p>Flood risk is one of the biggest reasons to renegotiate after searches return, but it&apos;s also one you can know about for free in 60 seconds before you offer. See our dedicated <Link href="/flood-risk-check" className="text-blue-700 underline">flood risk check</Link> page for what we surface, including surface water, river, sea and climate-projected layers.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check flood risk on any UK property free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
