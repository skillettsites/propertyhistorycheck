import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import JsonLd from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = {
  title: "Buying in a conservation area — what changes",
  description: "Article 4 directions, window restrictions, paint colour rules, satellite dish bans, insurance and the value premium of UK conservation areas.",
  alternates: { canonical: "/guides/conservation-area-buyers-guide" },
};

export default function ConservationAreaGuide() {
  const url = "https://www.homebuyercheck.co.uk/guides/conservation-area-buyers-guide";
  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            headline: "Buying in a conservation area — what changes",
            description: "What restrictions apply, how Article 4 directions work, and the price premium and ownership trade-offs.",
            url,
            datePublished: "2026-05-07",
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/blog" },
            { name: "Conservation areas", url: "/guides/conservation-area-buyers-guide" },
          ]),
          faqSchema([
            { q: "Do I need planning permission to change windows in a conservation area?", a: "Often yes. Conservation area status alone doesn't remove all permitted development rights, but an Article 4 direction usually does. Replacement windows, doors, roofing materials and front-elevation alterations typically need consent." },
            { q: "Can I paint my house any colour?", a: "If there's an Article 4 direction covering the front elevation, painting a previously unpainted brick or stone facade needs consent. In stricter areas, even repainting an already painted facade in a different colour can require approval." },
            { q: "Does a conservation area add value?", a: "Research from the LSE and Historic England puts the average uplift at around 9-23%, depending on location and stock quality. Tighter design control protects the streetscape, which protects long-term resale." },
            { q: "Will my insurance cost more?", a: "Buildings insurance is usually slightly higher because rebuild costs include like-for-like materials (lime mortar, slate, sash windows). Get specialist quotes if the property is also listed." },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-14 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Buying in a conservation area &mdash; what changes</h1>
          <p className="mt-4">There are roughly 10,000 conservation areas in England, covering streets, villages and entire town centres considered to have special architectural or historic interest. Buying inside one is generally good for resale but bad for spontaneous renovation plans. Here is what actually changes the day you get the keys.</p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">Conservation area vs Article 4 direction</h2>
          <p>These two get conflated constantly. Conservation area designation alone restricts demolition and protects trees, but most permitted development rights (the things you can do without applying for planning) still exist. The big change happens when the council adds an <em>Article 4 direction</em>, which removes some or all of those permitted development rights. Most central London boroughs, Bath, Oxford, Brighton, York and the Cotswold areas have layered Article 4 directions on top of conservation status. Always check both.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">What needs consent that wouldn&apos;t elsewhere</h2>
          <p>Where Article 4 is in force, expect to need formal planning permission for changes most homeowners think are routine. Replacement windows (especially uPVC over timber sashes) almost always need consent. Front doors, roof tiles, chimneys, porches, gates, garden walls and boundary railings usually do too. Solar panels on a front-facing roof slope are typically refused; rear and side slopes are easier.</p>
          <p>Side and rear extensions, dormers, and loft conversions are usually still possible but go through full planning rather than permitted development. Budget 8-12 weeks and £600-£1,500 for a planning application including drawings.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Satellite dishes, signs and the small stuff</h2>
          <p>Conservation status restricts satellite dishes on chimneys and front elevations &mdash; rear and side mounting is usually fine. Estate agent boards have time limits (typically 14 days after sale). Outdoor signage, painted advertising, even certain types of CCTV and burglar alarm boxes can need advertisement consent. Councils rarely chase these proactively, but neighbours do, and enforcement can demand removal years later.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Trees are protected by default</h2>
          <p>Every tree over 75mm trunk diameter (measured 1.5m up) in a conservation area has automatic protection equivalent to a Tree Preservation Order. You must give the council six weeks&apos; notice before any work, including pruning. The fine for unauthorised felling is up to £20,000 per tree in a Magistrates&apos; Court, unlimited in the Crown Court. Buyers regularly inherit fines from previous owners&apos; work, so check the title and ask the seller directly.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Paint colours and material choices</h2>
          <p>Bath, Brighton, Hampstead and parts of Edinburgh have published palette guidance. Painting a previously unpainted stone or brick frontage almost always needs consent. Replacing slate with concrete tile, timber sash with uPVC, or lime mortar with cement is the kind of unauthorised work councils <em>do</em> chase, often years later, and the enforcement notice runs with the property.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">The value premium</h2>
          <p>The standard finding from LSE and Historic England research is a 9-23% price premium for conservation area properties versus equivalent stock outside. The premium reflects two things: stricter design control protects the streetscape, and the buyer pool is wealthier and more design-conscious. Resale is usually faster and at firmer prices.</p>

          <h2 className="mt-6 text-xl font-bold text-slate-900">Check before you offer</h2>
          <p>Conservation area status is on the council&apos;s planning portal and shows up on local authority searches during conveyancing. We surface it for free at postcode level so you can see it before instructing a solicitor &mdash; useful if the seller hasn&apos;t mentioned it. See the <Link href="/property-history-check" className="text-blue-700 underline">free property check</Link> to find out instantly.</p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Check the property&apos;s conservation status free</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
