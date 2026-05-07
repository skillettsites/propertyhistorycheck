import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
          <p className="text-sm text-slate-500">Last updated: 2026-05-07</p>
          <p className="mt-6">We use a minimal set of cookies and similar technologies:</p>
          <ul className="mt-2 list-disc pl-6">
            <li><strong>Strictly necessary:</strong> Stripe checkout, Supabase auth (when you have an account).</li>
            <li><strong>Analytics:</strong> Vercel Analytics, Google Analytics 4 (anonymised).</li>
            <li><strong>Attribution:</strong> a sessionStorage entry to remember UTM parameters across the buy flow.</li>
          </ul>
          <p className="mt-4">No third-party advertising cookies are set on this site.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
