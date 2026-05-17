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
  { slug: "short-lease-buying-a-flat", title: "Buying a flat with a short lease (under 80 years) — what to know", excerpt: "Marriage value, lender thresholds, ground rent traps, and how to use a short lease to renegotiate the price." },
  { slug: "conservation-area-buyers-guide", title: "Buying in a conservation area — what changes", excerpt: "Article 4 directions, window restrictions, paint colours, satellite dishes, insurance, and the resale premium." },
  { slug: "coal-mining-area-property", title: "Buying a property in a coal mining area", excerpt: "CON29M searches, mine entries, subsidence history and what flags lead to insurance refusals." },
  { slug: "listed-building-grades", title: "Listed building grades I, II*, II — what each means for a buyer", excerpt: "Listed Building Consent, what's actually protected inside the home, unauthorised work penalties, and ownership cost." },
  { slug: "flood-zone-2-and-3", title: "How to read a UK flood zone map", excerpt: "Flood Zone 1, 2, 3a and 3b explained, surface water risk, Flood Re eligibility and real-world insurance premium hikes." },
  { slug: "restrictive-covenants-explained", title: "Restrictive covenants on UK property — what they are and how to handle them", excerpt: "Common covenant types, when they're enforceable, Lands Tribunal applications, indemnity insurance and what to ask your solicitor." },
  { slug: "freehold-vs-leasehold", title: "Freehold vs leasehold — what UK buyers need to know in 2026", excerpt: "Tenure definitions, the 2024 Reform Act, commonhold, share of freehold, lease extension cost and what mortgage lenders look for." },
  { slug: "japanese-knotweed-property", title: "Buying a property with Japanese knotweed nearby — risk and remediation", excerpt: "The 7-metre rule, mortgage impact, treatment cost, insurance-backed warranties and the TA6 disclosure obligation post-Davies v Bridgend." },
  { slug: "title-register-uk-explained", title: "How to read a UK Land Registry title register — line by line", excerpt: "The Property, Proprietorship and Charges Registers explained, with a redacted example showing what each entry means." },
  { slug: "buying-a-flat-checklist", title: "Buying a flat in the UK — a buyer's pre-offer checklist", excerpt: "Lease length, ground rent, service charge history, sinking fund, EWS1, share of freehold, Section 20, LPE1 and covenants." },
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
