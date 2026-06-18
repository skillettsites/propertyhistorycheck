import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { TOP_OUTCODES, getOutcode } from "@/lib/seo/outcodes";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/seo/schema";
import outcodeStats from "@/data/outcode-stats.json";

type OutcodeStat = {
  district?: string;
  sold?: { avgPrice: number; salesCount: number } | null;
  crime?: { total: number; topCategory: string | null } | null;
  floodZone?: string;
};
const ALL_STATS = outcodeStats as Record<string, OutcodeStat>;

export const dynamicParams = false;
export const revalidate = 2592000; // ISR: 30 days (slow-changing area data)

export function generateStaticParams() {
  return TOP_OUTCODES.map((o) => ({ outcode: o.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ outcode: string }> }) {
  const { outcode } = await params;
  const meta = getOutcode(outcode);
  if (!meta) return { title: "Postcode area not found" };
  const url = `/area/${meta.code.toLowerCase()}`;
  return {
    title: `${meta.code} property history check (${meta.name}, ${meta.region})`,
    description: `Free property history check for ${meta.code} (${meta.name}, ${meta.region}). Sales history, EPC, flood, crime, schools and council tax. £4.99 Premium adds ownership, ground risk, BSR Higher-Risk Building register and Property Chamber tribunal history.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${meta.code} property history check`,
      description: `Free property reports for any ${meta.name} (${meta.code}) address.`,
      url,
    },
  };
}

export default async function OutcodePage({ params }: { params: Promise<{ outcode: string }> }) {
  const { outcode } = await params;
  const meta = getOutcode(outcode);
  if (!meta) notFound();
  const stats = ALL_STATS[meta.code];

  // Region-aware internal linking: same-region areas first (topical cluster +
  // even link distribution), then a sample from other regions.
  const others = TOP_OUTCODES.filter((o) => o.code !== meta.code);
  const sameRegion = others.filter((o) => o.region === meta.region);
  const otherRegions = others.filter((o) => o.region !== meta.region).slice(0, 18);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Postcode areas", url: "/area" },
    { name: `${meta.code} (${meta.name})`, url: `/area/${meta.code.toLowerCase()}` },
  ]);

  const service = serviceSchema({
    name: `Property history check in ${meta.code}`,
    description: `Free instant property report for any ${meta.name} (${meta.code}) postcode in ${meta.region}.`,
    url: `/area/${meta.code.toLowerCase()}`,
    priceFrom: 0,
    priceTo: 4.99,
  });

  const faq = faqSchema([
    {
      q: `How do I check a ${meta.code} property?`,
      a: `Type a ${meta.code} postcode or full address into our search. You'll get an instant free report including sales history, EPC, flood, crime, schools and council tax, all sourced from official UK government APIs.`,
    },
    {
      q: `Is the ${meta.code} flood risk data accurate?`,
      a: `Yes, flood risk in ${meta.name} is sourced directly from the Environment Agency's Risk of Flooding from Rivers and Sea + Surface Water datasets, the same data your solicitor's environmental search uses.`,
    },
    {
      q: `What does the ${meta.code} £4.99 Premium report add?`,
      a: `On top of the free postcode-level report, the £4.99 Premium report adds: full BGS ground-risk panel (shrink-swell, landslide, mining), Radon Affected Area band, listed-building grade, conservation area and Article 4 overlay, BSR Higher-Risk Building register status, HMLR CCOD/OCOD ownership flag, Companies House owner check when corporate, and Property Chamber tribunal history at the building and ${meta.code} postcode. To order an HM Land Registry title register directly, use gov.uk for £7.`,
    },
  ]);

  return (
    <>
      <Header />
      <JsonLd data={[breadcrumb, service, faq]} />
      <main>
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="relative max-w-4xl mx-auto px-4 py-14 md:py-20 text-center">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium">
              {meta.region} · {meta.code}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {meta.code} property history check ({meta.name})
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">
              Free instant property report for any {meta.name} address. Sales history, EPC, flood, crime, schools, council tax. The £4.99 Premium adds ownership, ground risk, BSR Higher-Risk Building register and tribunal history.
            </p>
            <div className="mt-7 flex justify-center">
              <PostcodeLookup variant="dark" placeholder={`Enter a ${meta.code} postcode or address...`} />
            </div>
          </div>
        </section>

        <section className="py-14 max-w-3xl mx-auto px-4">
          {stats && (stats.sold || (stats.crime && stats.crime.total >= 40) || stats.floodZone) ? (
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900">{meta.code} area data</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.sold ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-2xl font-extrabold text-gray-900">£{stats.sold.avgPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">average sold price ({stats.sold.salesCount.toLocaleString()} sales since 2023)</p>
                  </div>
                ) : null}
                {stats.crime && stats.crime.total >= 40 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-2xl font-extrabold text-gray-900">{stats.crime.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">crimes last month near the {meta.name} centre{stats.crime.topCategory ? `, mostly ${stats.crime.topCategory}` : ""}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-2xl font-extrabold text-gray-900">{stats.floodZone && stats.floodZone !== "none" ? `Zone ${stats.floodZone}` : "Not in zone"}</p>
                  <p className="text-xs text-gray-500 mt-1">Environment Agency flood zone at the {meta.name} centre</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Sold prices: HM Land Registry Price Paid (2023 to date). Crime: Police.uk (latest published month, ~1 mile radius){stats.crime && stats.crime.total < 40 ? "; some forces report limited data so local counts can understate" : ""}. Flood zone shown is for the {meta.code} district centre point, your exact address may differ, check the free report below.
              </p>
            </div>
          ) : null}
          <h2 className="text-2xl font-extrabold text-gray-900">What&apos;s covered for {meta.code} properties</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc pl-6">
            <li><strong>Sales history</strong> from HM Land Registry Price Paid Data (every recorded sale since 1995).</li>
            <li><strong>Energy Performance Certificate (EPC)</strong> rating and build year from the Open Data Communities API.</li>
            <li><strong>Flood risk</strong> band (rivers/sea + surface water) from the Environment Agency NaFRA2 dataset.</li>
            <li><strong>Crime data</strong> for the past 12 months from data.police.uk.</li>
            <li><strong>Closest schools</strong> with Ofsted ratings from the GIAS register.</li>
            <li><strong>Council tax</strong> authority and Band D estimate.</li>
            <li><strong>Broadband + 4G/5G coverage</strong> from Ofcom's coverage checker.</li>
          </ul>

          <h2 className="mt-10 text-2xl font-extrabold text-gray-900">Why buyers in {meta.name} use this</h2>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            Average UK conveyancing searches cost £250-£450; a RICS Level 2 HomeBuyer Report is £400-£900. Our reports run before you instruct any of them, so you can decide whether the {meta.code} property you&apos;re viewing is worth the £1,500+ in solicitor and survey fees, and what to ask if it is.
          </p>

          <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6">
            <p className="text-sm font-semibold text-gray-900">Check a {meta.code} property now</p>
            <div className="mt-3"><PostcodeLookup size="md" placeholder={`${meta.code} postcode or address...`} /></div>
          </div>

          <h2 className="mt-12 text-2xl font-extrabold text-gray-900">Buying guides</h2>
          <ul className="mt-4 space-y-1.5 text-sm list-disc pl-6">
            <li><Link href="/blog/what-checks-before-buying-a-house" className="text-blue-600 hover:underline">What checks should I do before buying a house?</Link></li>
            <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-600 hover:underline">How much do conveyancing searches cost?</Link></li>
            <li><Link href="/blog/how-to-check-a-property-before-buying" className="text-blue-600 hover:underline">How to check a property before buying</Link></li>
            <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-600 hover:underline">Cheapest property check in the UK, compared</Link></li>
            <li><Link href="/compare" className="text-blue-600 hover:underline">Compare property check tools</Link></li>
          </ul>

          {sameRegion.length > 0 ? (
            <>
              <h2 className="mt-12 text-2xl font-extrabold text-gray-900">Other {meta.region} postcode areas</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sameRegion.map((o) => (
                  <Link
                    key={o.code}
                    href={`/area/${o.code.toLowerCase()}`}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {o.code}, {o.name}
                  </Link>
                ))}
              </div>
            </>
          ) : null}

          <h2 className="mt-12 text-2xl font-extrabold text-gray-900">Browse more postcode areas</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {otherRegions.map((o) => (
              <Link
                key={o.code}
                href={`/area/${o.code.toLowerCase()}`}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {o.code}, {o.name}
              </Link>
            ))}
            <Link href="/area" className="text-sm font-semibold text-blue-600 hover:underline">All postcode areas →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
