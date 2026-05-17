import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
          <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
          <p className="mt-6">Email <a href="mailto:hello@homebuyercheck.co.uk" className="text-blue-700 underline">hello@homebuyercheck.co.uk</a> for general questions, or <a href="mailto:support@homebuyercheck.co.uk" className="text-blue-700 underline">support@homebuyercheck.co.uk</a> for help with a report.</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
