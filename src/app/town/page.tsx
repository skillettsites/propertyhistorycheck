import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { TOP_TOWNS } from "@/lib/seo/towns";

export const metadata = {
  title: "UK towns — property history checks A to Z",
  description: "Property history checks for every major UK town. Free postcode-level reports, premium upgrade for live HM Land Registry title register.",
  alternates: { canonical: "/town" },
};

export default function TownsIndex() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="relative max-w-4xl mx-auto px-4 py-14 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">UK property history checks by town</h1>
            <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">Browse the towns we cover or search any UK address directly.</p>
            <div className="mt-6 flex justify-center"><PostcodeLookup variant="dark" /></div>
          </div>
        </section>
        <section className="max-w-5xl mx-auto px-4 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOP_TOWNS.map((t) => (
              <Link key={t.slug} href={`/town/${t.slug}`} className="rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-blue-300 hover:shadow-md transition-all">
                <p className="text-base font-bold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.region} · {t.outcode}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
