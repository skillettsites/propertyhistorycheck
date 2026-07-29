import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckClient from "./CheckClient";

// /check is the interactive property checker, a distinct page from the
// marketing homepage and the main conversion step, so it gets a self
// canonical. It also collapses the ?postcode= / ?address= query variants
// onto one indexable URL.
export const metadata: Metadata = {
  title: "Check a UK Property",
  description:
    "Run a free instant check on any UK property. Enter a postcode to see flood risk, ground stability, EPC, local sold prices and area data, then upgrade for the full report.",
  alternates: { canonical: "/check" },
};

export const dynamic = "force-dynamic";

export default function CheckPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-12 text-slate-600">Loading…</div>}>
          <CheckClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
