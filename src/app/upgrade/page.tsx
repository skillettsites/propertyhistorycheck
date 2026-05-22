import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import UpgradeButton from "./UpgradeButton";

export const dynamic = "force-dynamic";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token || !isValidReportToken(token)) notFound();

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("reports")
    .select("id, tier, status, customer_email, data")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) notFound();
  // Premium+ buyers don't need to upgrade, send them back to their report.
  if (row.tier === "standard_plus") redirect(`/r/${token}`);
  if (row.status !== "ready") {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50">
          <div className="mx-auto max-w-2xl px-4 py-16">
            <h1 className="text-2xl font-bold text-slate-900">Report still being prepared</h1>
            <p className="mt-3 text-sm text-slate-600">Come back in a minute, then you can upgrade.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const data = row.data as { free?: { property?: { fullAddress?: string } } } | null;
  const address = data?.free?.property?.fullAddress ?? "your property";

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Upgrade your report</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Add the three AI briefs for {address}
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Your Premium report is unlocked. The £2 upgrade adds three AI-generated, audience-specific briefs grounded on your actual report data:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><span className="text-blue-600">✓</span> <span><strong>Solicitor brief</strong>, TA6-style follow-up enquiries formatted for your conveyancer.</span></li>
              <li className="flex gap-2"><span className="text-blue-600">✓</span> <span><strong>Surveyor brief</strong>, exactly what to flag to your RICS surveyor, by priority.</span></li>
              <li className="flex gap-2"><span className="text-blue-600">✓</span> <span><strong>Mortgage broker brief</strong>, lending-friction items to raise before applying.</span></li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Same online URL, you'll get a fresh email when the upgraded report is ready (under a minute).
            </p>
            <div className="mt-6">
              <UpgradeButton token={token} />
              <p className="mt-2 text-[11px] text-slate-500 text-center">Secure payment via Stripe. £2.00. No subscription.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
