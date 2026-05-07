import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Property buying guides",
  description: "UK property buying guides covering title register reading, flood risk, leasehold, EPC, conveyancing searches and more.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  { slug: "buying-a-house-uk", title: "Buying a house in the UK — the 2026 step-by-step guide", excerpt: "Every stage of the UK house-buying process, from offer to exchange to completion." },
  { slug: "conveyancing-explained", title: "Conveyancing explained — what your solicitor actually does", excerpt: "What the £1,500 you're about to spend on a solicitor actually buys you, and what they don't check." },
];

export default function BlogIndex() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-3xl font-bold text-slate-900">Property buying guides</h1>
          <ul className="mt-8 space-y-6">
            {POSTS.map((p) => (
              <li key={p.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Link href={`/guides/${p.slug}`} className="text-lg font-semibold text-slate-900 hover:text-blue-700">{p.title}</Link>
                <p className="mt-2 text-sm text-slate-700">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
