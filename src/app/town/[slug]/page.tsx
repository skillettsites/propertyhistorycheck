import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { TOP_TOWNS, getTown } from "@/lib/seo/towns";
import { breadcrumbSchema, serviceSchema, faqSchema } from "@/lib/seo/schema";

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return TOP_TOWNS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) return { title: "Town not found" };
  const url = `/town/${town.slug}`;
  return {
    title: `${town.name} property history check — free instant report`,
    description: `Free property history check for any ${town.name} (${town.region}) address. Sales history, EPC, flood, crime, schools, council tax. £4.99 Premium adds ownership, ground risk, BSR Higher-Risk Building register and Property Chamber tribunal history.`,
    alternates: { canonical: url },
  };
}

export default async function TownPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) notFound();

  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Towns", url: "/town" },
            { name: town.name, url: `/town/${town.slug}` },
          ]),
          serviceSchema({
            name: `${town.name} property history check`,
            description: `Free instant property report for any ${town.name} address.`,
            url: `/town/${town.slug}`,
            priceFrom: 0,
            priceTo: 4.99,
          }),
          faqSchema([
            {
              q: `How do I check a ${town.name} property's history?`,
              a: `Enter the postcode or address into our search. We pull sales history from HM Land Registry, EPC from Open Data Communities, flood risk from the Environment Agency, and crime data from data.police.uk to give you an instant report.`,
            },
            {
              q: `Are ${town.name} properties at flood risk?`,
              a: `Some ${town.name} (${town.outcode}) properties are in identified flood-risk zones. Our free check shows the rivers and sea risk band; the £4.99 Premium adds ground-risk (shrink-swell, landslide), Radon Affected Area band, BSR Higher-Risk Building register status and Property Chamber tribunal history.`,
            },
          ]),
        ]}
      />
      <main>
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="relative max-w-4xl mx-auto px-4 py-14 md:py-20 text-center">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium">
              {town.region} · {town.outcode}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {town.name} property history check
            </h1>
            <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">
              Free instant property report for any {town.name} address. The £4.99 Premium adds ownership, ground risk, BSR Higher-Risk Building register and Property Chamber tribunal history.
            </p>
            <div className="mt-7 flex justify-center">
              <PostcodeLookup variant="dark" placeholder={`Enter a ${town.name} postcode or address...`} />
            </div>
          </div>
        </section>
        <section className="py-14 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900">{town.name} buyers run this report before they offer</h2>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            UK conveyancing searches cost £250-£450; a RICS Level 2 survey is £400-£900. Our reports start at £4.99 and run before either, so you can decide whether the {town.name} property you&apos;re viewing is worth the £1,500+ in fees.
          </p>
          <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-6">
            <p className="text-sm font-semibold text-gray-900">Check a {town.name} property now</p>
            <div className="mt-3"><PostcodeLookup size="md" placeholder={`${town.name} postcode or address...`} /></div>
          </div>
          <h2 className="mt-12 text-2xl font-extrabold text-gray-900">Other UK towns</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {TOP_TOWNS.filter((t) => t.slug !== town.slug).slice(0, 18).map((t) => (
              <Link key={t.slug} href={`/town/${t.slug}`} className="text-blue-600 hover:underline">
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
