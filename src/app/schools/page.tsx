import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import townsData from "@/data/towns.json";
import townOutcodes from "@/data/town-outcodes.json";

export const revalidate = 86400;

type Town = { slug: string; name: string; region: string; postcodes: string[] };
const towns = townsData as Town[];
const outcodeMap = townOutcodes as Record<string, string[]>;

const schoolTowns = towns
  .filter((t) => (outcodeMap[t.slug] || []).length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

export const metadata: Metadata = {
  title: "Schools in UK Towns: Ofsted Ratings by Area",
  description: `Browse schools with Ofsted ratings across ${schoolTowns.length} UK towns. Compare primary and secondary schools by area, then run a free property check on any address before you buy.`,
  alternates: { canonical: "/schools" },
};

export default function SchoolsHub() {
  const byRegion: Record<string, Town[]> = {};
  for (const t of schoolTowns) (byRegion[t.region] ||= []).push(t);
  const regions = Object.keys(byRegion).sort();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Schools by town", url: "/schools" },
      ])} />
      <Header />
      <main className="min-h-screen bg-white">
        <section className="py-12 max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Schools by area</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-gray-900">Schools in UK towns: Ofsted ratings by area</h1>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            School catchment is one of the biggest drivers of UK house prices, homes near an Outstanding or Good school often carry a 5-15% premium. Pick a town below to see its primary and secondary schools with Ofsted ratings, or run a free HomeBuyerCheck report on a specific address to see the nearest schools alongside flood, crime and sales history.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-6">
            <p className="text-sm font-semibold text-gray-900">Check schools near a specific address</p>
            <div className="mt-3"><PostcodeLookup size="md" placeholder="Postcode or address..." /></div>
          </div>

          {regions.map((region) => (
            <div key={region} className="mt-10">
              <h2 className="text-lg font-bold text-gray-900">{region}</h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                {byRegion[region].map((t) => (
                  <Link key={t.slug} href={`/schools/${t.slug}`} className="text-blue-600 hover:underline">
                    Schools in {t.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
