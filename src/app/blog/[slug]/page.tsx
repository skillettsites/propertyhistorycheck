import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { CTA_HOOKS, TOOL_HOOKS } from "@/lib/blog/ctaHooks";

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, url: `/blog/${post.slug}`, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `/blog/${post.slug}`;
  const related = (post.related ?? [])
    .map((s) => getPost(s))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 4);

  return (
    <>
      <Header />
      <JsonLd data={[
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.h1, url },
        ]),
        articleSchema({
          headline: post.title,
          description: post.description,
          url,
          datePublished: post.datePublished,
          dateModified: post.dateModified ?? post.datePublished,
        }),
        faqSchema(post.faqs.map((f) => ({ q: f.q, a: f.a }))),
      ]} />
      <main className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {post.category === "cost" ? "Costs guide" : post.category === "comparison" ? "Comparison" : post.category === "data-story" ? "Data study" : "Buyer guide"}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{post.h1}</h1>
          <p className="mt-2 text-xs text-gray-400">
            Updated {new Date(post.dateModified ?? post.datePublished).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* Citable short-answer box */}
          <div className="mt-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50/70 p-5">
            <p className="text-[15px] leading-relaxed text-gray-900 font-medium">{post.shortAnswer}</p>
          </div>

          {post.table ? (
            <div className="mt-8 overflow-x-auto">
              {post.table.caption ? <p className="text-sm font-bold text-gray-900 mb-2">{post.table.caption}</p> : null}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left">
                    {post.table.columns.map((c) => (
                      <th key={c} className="py-2 pr-4 font-bold text-gray-900">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {post.table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-100">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 pr-4 text-gray-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="mt-8 space-y-8">
            {post.sections.map((s, i) => (
              <section key={i}>
                {s.heading ? <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{s.heading}</h2> : null}
                {s.paras?.map((p, pi) => (
                  <p key={pi} className="mt-3 text-[15px] text-gray-700 leading-relaxed">{p}</p>
                ))}
                {s.bullets?.length ? (
                  <ul className="mt-3 space-y-2 text-[15px] text-gray-700 list-disc pl-6">
                    {s.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {/* CTA — contextual hook per post where available, else generic */}
          <div className="mt-10 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-6">
            <p className="text-[15px] font-semibold text-gray-900">
              {CTA_HOOKS[post.slug] ?? "Check any UK property before you offer."}
            </p>
            <p className="mt-1.5 text-xs text-gray-600">
              Free instant check; Premium from £4.99 adds ownership, ground risk and an AI buyer&apos;s verdict. No subscription.
            </p>
            <div className="mt-3"><PostcodeLookup size="md" placeholder="Postcode or address..." /></div>
            {TOOL_HOOKS[post.slug] ? (
              <p className="mt-3 text-sm">
                <Link href={TOOL_HOOKS[post.slug].href} className="font-semibold text-blue-700 hover:underline">
                  Or work out the numbers: {TOOL_HOOKS[post.slug].label} →
                </Link>
              </p>
            ) : null}
          </div>

          {/* FAQ */}
          {post.faqs.length ? (
            <section className="mt-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Frequently asked questions</h2>
              <div className="mt-4 space-y-4">
                {post.faqs.map((f, i) => (
                  <div key={i}>
                    <p className="font-bold text-gray-900">{f.q}</p>
                    <p className="mt-1 text-[15px] text-gray-700 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {related.length ? (
            <section className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-900">Related</p>
              <ul className="mt-2 space-y-1.5">
                {related.map((r) => (
                  <li key={r.slug}><Link href={`/blog/${r.slug}`} className="text-blue-600 hover:underline text-sm">{r.h1}</Link></li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Keyword-anchored internal links to the core tools (passes authority to money pages) */}
          <section className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-900">Check a property before you buy</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/free-property-check" className="text-blue-600 hover:underline">Run a free property check on any UK address</Link></li>
              <li><Link href="/check" className="text-blue-600 hover:underline">Get a full pre-purchase property report from £4.99</Link></li>
              <li><Link href="/flood-risk-check" className="text-blue-600 hover:underline">Check a property&apos;s flood risk by postcode</Link></li>
              <li><Link href="/title-register-check" className="text-blue-600 hover:underline">Find out who owns a property (title register)</Link></li>
              <li><Link href="/compare" className="text-blue-600 hover:underline">Compare UK property check tools and prices</Link></li>
              <li><Link href="/calculators" className="text-blue-600 hover:underline">UK property buying cost calculators</Link></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
