import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { deriveReportToken } from "@/lib/report-token";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; tier?: string; postcode?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const token = deriveReportToken(sessionId);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Payment received</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Your report is being prepared</h1>
            <p className="mt-3 text-sm text-slate-600">
              Thanks for your purchase. We&apos;re building your {params.tier === "premium" ? "Premium" : "Standard"} report now and will email it to you within 60 seconds, including a signed PDF.
            </p>
            {token ? (
              <Link href={`/r/${token}`} className="mt-6 inline-block rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                View your report online
              </Link>
            ) : null}
            <p className="mt-6 text-xs text-slate-500">If your email doesn&apos;t arrive within 5 minutes, check your spam folder or email <a href="mailto:support@propertyhistorycheck.co.uk" className="text-blue-700 underline">support@propertyhistorycheck.co.uk</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
