import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import townsData from "@/data/towns.json";
import townOutcodes from "@/data/town-outcodes.json";
import schoolsData from "@/data/schools.json";

export const dynamicParams = false;
export const revalidate = 86400;

type Town = { slug: string; name: string; region: string; postcodes: string[] };
type RawSchool = { u: number; n: string; p: string; pc: string; la: number; lo: number; r?: string };

const towns = townsData as Town[];
const outcodeMap = townOutcodes as Record<string, string[]>;
const schools = schoolsData as RawSchool[];

const RATING_LABEL: Record<string, string> = { O: "Outstanding", G: "Good", R: "Requires improvement", I: "Inadequate" };
const RATING_RANK: Record<string, number> = { O: 0, G: 1, R: 2, I: 3 };

function outcodeOf(pc: string): string {
  return (pc || "").trim().split(" ")[0].toUpperCase();
}
function townSchools(slug: string): RawSchool[] {
  const set = new Set(outcodeMap[slug] || []);
  return schools.filter((s) => set.has(outcodeOf(s.pc)));
}

export function generateStaticParams() {
  return towns.filter((t) => (outcodeMap[t.slug] || []).length > 0).map((t) => ({ town: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ town: string }> }): Promise<Metadata> {
  const { town: slug } = await params;
  const town = towns.find((t) => t.slug === slug);
  if (!town) return { title: "Town not found" };
  const list = townSchools(slug);
  const goodPlus = list.filter((s) => s.r === "O" || s.r === "G").length;
  const pct = list.length ? Math.round((goodPlus / list.length) * 100) : 0;
  return {
    title: `Schools in ${town.name}: Ofsted Ratings & Best Schools (2026) | HomeBuyerCheck`,
    description: `${list.length} schools in ${town.name} with Ofsted ratings — ${pct}% rated Good or Outstanding. Compare primary and secondary schools, then run a free property check on any ${town.name} address before you buy.`,
    alternates: { canonical: `/schools/${slug}` },
  };
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
      <p className="text-3xl font-extrabold text-blue-600">{value}</p>
      <p className="text-sm font-bold text-gray-900 mt-1">{label}</p>
      {sub ? <p className="text-xs text-gray-400 mt-1">{sub}</p> : null}
    </div>
  );
}
function RatingPill({ r }: { r?: string }) {
  const label = r ? RATING_LABEL[r] ?? "Not yet rated" : "Not yet rated";
  const cls =
    r === "O" ? "bg-emerald-100 text-emerald-800"
      : r === "G" ? "bg-blue-100 text-blue-800"
      : r === "R" ? "bg-amber-100 text-amber-800"
      : r === "I" ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-500";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}
function SchoolTable({ rows }: { rows: RawSchool[] }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500">No schools of this type found in the area.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left font-semibold px-4 py-3">School</th>
            <th className="text-left font-semibold px-4 py-3">Postcode</th>
            <th className="text-left font-semibold px-4 py-3">Ofsted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((s) => (
            <tr key={s.u} className="bg-white">
              <td className="px-4 py-3 font-medium text-gray-900">{s.n}</td>
              <td className="px-4 py-3 text-gray-500">{s.pc}</td>
              <td className="px-4 py-3"><RatingPill r={s.r} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function TownSchoolsPage({ params }: { params: Promise<{ town: string }> }) {
  const { town: slug } = await params;
  const town = towns.find((t) => t.slug === slug);
  if (!town) notFound();

  const list = townSchools(slug);
  const sortByRating = (a: RawSchool, b: RawSchool) =>
    (RATING_RANK[a.r ?? ""] ?? 4) - (RATING_RANK[b.r ?? ""] ?? 4) || a.n.localeCompare(b.n);
  const primary = list.filter((s) => s.p === "P").sort(sortByRating);
  const secondary = list.filter((s) => s.p === "S").sort(sortByRating);
  const outstanding = list.filter((s) => s.r === "O").length;
  const good = list.filter((s) => s.r === "G").length;
  const goodPlus = outstanding + good;
  const pct = list.length ? Math.round((goodPlus / list.length) * 100) : 0;
  const topPrimary = primary.slice(0, 25);
  const topSecondary = secondary.slice(0, 25);

  const faqs = [
    { q: `How many schools are there in ${town.name}?`, a: `There are ${list.length} registered schools in ${town.name} on the latest Ofsted/GIAS data — ${primary.length} primary and ${secondary.length} secondary. ${pct}% are rated Good or Outstanding.` },
    { q: `What is the best-rated school in ${town.name}?`, a: `${outstanding} school${outstanding === 1 ? " is" : "s are"} rated Outstanding by Ofsted in ${town.name}, with ${good} more rated Good. Outstanding schools are often oversubscribed, so the property's distance to the school usually decides admission.` },
    { q: `How do school ratings affect ${town.name} house prices?`, a: `Homes inside the catchment of an Outstanding or Good school typically carry a 5-15% premium. Before offering on a ${town.name} property, run a free HomeBuyerCheck report to see the schools near that exact address alongside flood, crime and sales history.` },
    { q: `How do I check schools near a specific ${town.name} address?`, a: `Enter the postcode or address into HomeBuyerCheck. The free report lists nearby schools with Ofsted ratings; the £4.99 Premium adds ground-risk, ownership, BSR Higher-Risk Building register and Property Chamber tribunal history.` },
  ];

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top-rated schools in ${town.name}`,
    itemListElement: [...topPrimary, ...topSecondary].slice(0, 20).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.n })),
  };

  const otherTowns = towns.filter((t) => t.slug !== slug && (outcodeMap[t.slug] || []).length > 0).slice(0, 12);

  return (
    <>
      <Header />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Schools", url: "/schools" },
            { name: `Schools in ${town.name}`, url: `/schools/${slug}` },
          ]),
          faqSchema(faqs),
          itemList,
        ]}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
            <nav className="mb-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-300">Schools in {town.name}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
              Schools in {town.name}: Ofsted Ratings (2026)
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
              {list.length} registered schools in {town.name}, {town.region}. {pct}% are rated Good or Outstanding by Ofsted.
              Browse the best primary and secondary schools below, then run a free property check before you make an offer.
            </p>
            <div className="mt-8">
              <PostcodeLookup size="lg" variant="dark" placeholder={`Check a ${town.name} address before you buy...`} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value={String(list.length)} label="Schools total" sub={`${primary.length} primary · ${secondary.length} secondary`} />
              <StatCard value={`${pct}%`} label="Good or Outstanding" sub={`${goodPlus} of ${list.length}`} />
              <StatCard value={String(outstanding)} label="Rated Outstanding" />
              <StatCard value={String(good)} label="Rated Good" />
            </div>
          </div>
        </section>

        {/* Primary */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Best primary schools in {town.name}</h2>
            <p className="text-gray-500 mb-6 max-w-3xl">{primary.length} primary schools, sorted by Ofsted rating (Outstanding first). Showing the top {topPrimary.length}.</p>
            <SchoolTable rows={topPrimary} />
          </div>
        </section>

        {/* Secondary */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Best secondary schools in {town.name}</h2>
            <p className="text-gray-500 mb-6 max-w-3xl">{secondary.length} secondary schools, sorted by Ofsted rating. Showing the top {topSecondary.length}.</p>
            <SchoolTable rows={topSecondary} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Buying near a good {town.name} school?</h2>
            <p className="text-gray-500 mb-6">
              Ofsted ratings show which schools are strong, but admission depends on distance — and the property itself can have hidden risks.
              Run a free HomeBuyerCheck report on any {town.name} address for schools, flood, crime and sales history, then add the £4.99 Premium
              for ground-risk, ownership and title detail before you offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/check" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Check a {town.name} property</Link>
              <Link href={`/town/${slug}`} className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">{town.name} property guide</Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Schools in {town.name}: FAQ</h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other towns */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">Schools in other areas</h2>
            <div className="flex flex-wrap gap-2">
              {otherTowns.map((t) => (
                <Link key={t.slug} href={`/schools/${t.slug}`} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors">
                  Schools in {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
