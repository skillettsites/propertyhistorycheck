import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckClient from "./CheckClient";

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
