import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: 2026-05-07</p>
          <h2 className="mt-8 text-xl font-bold text-slate-900">What we collect</h2>
          <ul className="mt-2 list-disc pl-6">
            <li>Postcode and address you submit for a property check.</li>
            <li>Email address (only when you purchase a paid report).</li>
            <li>Anonymous analytics: page views, referrers, device type, country/region.</li>
            <li>Payment metadata via Stripe, we never see or store full card details.</li>
          </ul>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Lawful basis</h2>
          <p>Free checks: legitimate interest. Paid reports: contract performance. Marketing email (if you opt in): consent.</p>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Third parties</h2>
          <p>Stripe (payments), Resend (email), Supabase (database hosted in EU), Vercel (web hosting), HM Land Registry (paid title data), Cloudflare (CDN/DDoS).</p>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Your rights</h2>
          <p>Under UK GDPR you can request access, correction, deletion or portability of your data. Email <a href="mailto:privacy@homebuyercheck.co.uk" className="text-blue-700 underline">privacy@homebuyercheck.co.uk</a>.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
