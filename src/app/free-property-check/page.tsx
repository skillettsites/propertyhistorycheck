import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostcodeLookup from "@/components/PostcodeLookup";

export const metadata = {
  title: "Free UK Property Check — instant postcode report",
  description:
    "Free instant property check for any UK postcode. Sales history, EPC, flood, crime, schools, council tax, broadband. No signup. Powered by HM Land Registry, Environment Agency and Police.uk.",
  alternates: { canonical: "/free-property-check" },
};

export default function FreePropertyCheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <section className="bg-blue-50">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Free UK property check</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700">
              Postcode-level report on any UK property. Sales history since 1995, EPC, flood, crime, schools, council tax, broadband &mdash; instant, free, no signup.
            </p>
            <div className="mt-6"><PostcodeLookup /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
