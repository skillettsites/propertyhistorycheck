import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";
import { FaqSchema, SpeakableSchema, type FaqItem } from "@/components/SeoSchema";

const SITE = "https://www.homebuyercheck.co.uk";
const URL = `${SITE}/blog/title-register-download-cost-uk`;

export const metadata = {
  title: "UK title register download cost · £7 direct from HMLR (2026) + what you actually get",
  description:
    "A UK title register costs £7 from HM Land Registry, or £14 with the title plan. See what each register shows, how to read it, and what it leaves out.",
  alternates: { canonical: "/blog/title-register-download-cost-uk" },
};

const FAQ: FaqItem[] = [
  {
    question: "How much does it cost to download a UK title register?",
    answer:
      "£7 per title register direct from HM Land Registry. £7 for the title plan (the map). £14 for both. You order them at HMLR's FindAProperty service. You get a PDF of the official register, Property Register, Proprietorship Register, Charges Register. You don't get any analysis, plain-English summary, or surrounding data sources.",
  },
  {
    question: "What's the difference between the title register and the title plan?",
    answer:
      "The title register (£7) is the text document, it lists the property address, the registered owner, any charges (mortgages, restrictions), covenants, and easements. The title plan (£7) is the map, it shows the property boundary as registered. Most buyers need both for a meaningful read; you can order them together for £14.",
  },
  {
    question: "Can I read a title register myself?",
    answer:
      "Yes, with a guide. The Property Register identifies the address and tenure (freehold or leasehold). The Proprietorship Register names the owner and price paid + any restrictions (e.g. Form A restriction for joint ownership; Form B for trust). The Charges Register lists mortgages, restrictive covenants, easements, leases. The terminology is dense, HomeBuyerCheck's £4.99 Premium tier reads it for you and surfaces the actionable items.",
  },
  {
    question: "Is the £7 HMLR download enough due diligence before offering?",
    answer:
      "No. The title register tells you ownership + charges + covenants for that specific title. It doesn't tell you about: flood risk, ground stability, BSR Higher-Risk Building register status, Property Chamber tribunal history, planning applications nearby, EPC, school proximity, crime, or anything beyond the legal title. For pre-offer due diligence you need the title PLUS the surrounding data, which is what HomeBuyerCheck's £4.99 Premium tier delivers in one report.",
  },
  {
    question: "Why don't I just download the £7 register and skip HomeBuyerCheck?",
    answer:
      "You can. They're different products. The £7 download is the legal title document. HomeBuyerCheck at £4.99 surfaces the ownership flag (UK or overseas company) automatically against the live HMLR CCOD/OCOD registers (which is what an offshore company show in the title), plus the BSR HRB status, Companies House owner check, ground risk, Property Chamber tribunal, flood, planning. If you only need the title text, the £7 download is fine. If you want to know whether to offer at all, the £4.99 report is more useful.",
  },
  {
    question: "Does HomeBuyerCheck include the title register PDF?",
    answer:
      "The £4.99 Premium and £6.99 Premium+ tiers extract and surface the key data points from the HMLR registers (ownership entity, charges count, tenure, last sale price) but currently don't ship the raw PDF. If you need the raw legal document, order it separately from HMLR for £7. The HomeBuyerCheck report is the analytical layer on top.",
  },
];

export default function Page() {
  return (
    <>
      <FaqSchema items={FAQ} />
      <SpeakableSchema url={URL} headline="UK title register download cost" selectors={["#tldr", ".speakable-summary"]} />
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16 text-slate-700">
          <header>
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Cost guide · 2026</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              UK title register download cost · £7 direct from HMLR + what you actually get
            </h1>
            <p id="tldr" className="speakable-summary mt-4 text-base sm:text-lg leading-relaxed">
              <strong>A UK title register costs £7 to download directly from HM Land Registry.</strong>{" "}
              The title plan is £7 (£14 for both). You get the official register PDF, Property, Proprietorship and Charges registers. No analysis, no surrounding context. HomeBuyerCheck at £4.99 surfaces the key items from the registers automatically (ownership entity, charge count, tenure) and adds 20+ other data sources + AI analysis. For raw legal text, go to HMLR; for pre-offer due diligence, go to HomeBuyerCheck.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-900">Free property check (no card)</p>
            <div className="mt-3"><PostcodeLookup size="md" /></div>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">How to download a UK title register</h2>
          <p className="mt-3">
            Go to <a href="https://eservices.landregistry.gov.uk/eservices/FindAProperty" className="text-blue-700 underline-offset-2 hover:underline" target="_blank" rel="noopener">HMLR FindAProperty</a>. Search by address, select the property, and pay £7 for the register or £14 for register + plan. PDFs are delivered to your account immediately. You don&apos;t need a solicitor; anyone can order any UK title register.
          </p>
          <p className="mt-3">
            The £7 is a one-off you pay yourself, and it is nothing to do with the conveyancing search pack your solicitor orders later, which runs to £250 to £450 on top of the legal fee. To see where the searches, the Land Registry registration fee and the legal fee land for your purchase price, use the{" "}
            <Link href="/conveyancing-cost-calculator" className="text-blue-700 underline-offset-2 hover:underline">conveyancing cost calculator</Link>.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What&apos;s in a UK title register</h2>

          <h3 className="mt-6 text-lg font-bold text-slate-900">Property Register</h3>
          <p className="mt-2">
            Identifies the property: postal address, tenure (freehold, leasehold, or commonhold), and the title number. Includes any easements, rights of way, or other rights granted with the title. Short, typically 1-2 short paragraphs.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">Proprietorship Register</h3>
          <p className="mt-2">
            Lists the registered owner(s). Shows the price paid (if registered after 2000 and disclosed) and the date of registration. Includes any restrictions on the title, most commonly Form A (joint ownership requires both proprietors to sign) or Form B (trust restriction). For company ownership, lists the company number and registered office address.
          </p>
          <p className="mt-2">
            If the proprietor is an overseas company, this register names the company and the country of incorporation. Critically, post-2022 it should reference the company&apos;s Register of Overseas Entities (ROE) number; if missing, your conveyancer cannot complete the transfer.
          </p>

          <h3 className="mt-6 text-lg font-bold text-slate-900">Charges Register</h3>
          <p className="mt-2">
            Lists every charge currently registered against the title: mortgages, restrictive covenants, easements granting rights to neighbours, leases (if freehold with leasehold flats), positive covenants. Each entry has a date and a reference. Charges run with the land, if you buy, you inherit them.
          </p>
          <p className="mt-2">
            Restrictive covenants are the most common cause of post-exchange disputes (&quot;you cannot build a wall above 2 metres&quot;, &quot;you cannot run a business from this address&quot;). They&apos;re often decades or centuries old; some are enforceable, many aren&apos;t. Your conveyancer will judge each one.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">What the £4.99 HomeBuyerCheck adds to the £7 raw register</h2>
          <p className="mt-3">
            The £7 download gives you the raw legal document. The £4.99 Premium tier adds:
          </p>
          <ul className="mt-3 space-y-1.5 list-disc pl-5">
            <li><strong>Live ownership flag</strong>, automatic match against HMLR CCOD (UK companies) and OCOD (overseas companies). You see the company status (active, dissolved, in liquidation) directly.</li>
            <li><strong>Companies House owner check</strong>, outstanding charges on the company, insolvency cases, disqualified directors matched on name.</li>
            <li><strong>BSR Higher-Risk Building register</strong>, the post-Grenfell register isn&apos;t on the title register but matters for mortgageability.</li>
            <li><strong>Property Chamber tribunal history</strong>, published decisions at the building or postcode.</li>
            <li><strong>Ground-risk + flood + planning + EPC + crime</strong>, 20+ data sources beyond the title.</li>
            <li><strong>AI buyer&apos;s verdict</strong>, plain-English summary of what the data means for your offer.</li>
          </ul>
          <p className="mt-3">
            For a raw legal title document, the £7 HMLR download is the cheapest option. For pre-offer due diligence, the £4.99 HomeBuyerCheck Premium tier is the better product.{" "}
            <Link href="/sample" className="text-blue-700 underline-offset-2 hover:underline">See a sample Premium report</Link>.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {FAQ.map((q) => (
              <div key={q.question}>
                <dt className="font-bold text-slate-900">{q.question}</dt>
                <dd className="mt-1.5">{q.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-bold text-slate-900">Run the free check on the property you&apos;re considering</p>
            <div className="mt-4"><PostcodeLookup size="md" /></div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Related</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link href="/compare" className="text-blue-700 underline-offset-2 hover:underline">HomeBuyerCheck vs all UK property checks · comparison</Link></li>
              <li><Link href="/blog/cheapest-property-check-uk" className="text-blue-700 underline-offset-2 hover:underline">Cheapest UK property check · ranked</Link></li>
              <li><Link href="/blog/conveyancing-searches-cost-uk-2026" className="text-blue-700 underline-offset-2 hover:underline">UK conveyancing search costs · 2026</Link></li>
              <li><Link href="/guides/freehold-vs-leasehold" className="text-blue-700 underline-offset-2 hover:underline">Freehold vs leasehold explained</Link></li>
              <li><Link href="/guides/restrictive-covenants-explained" className="text-blue-700 underline-offset-2 hover:underline">Restrictive covenants explained</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
