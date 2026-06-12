import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import UpgradeButton from "./UpgradeButton";

export const dynamic = "force-dynamic";
// Transactional utility page: keep it out of the index, and never serve a 404
// for the tokenless view (a bare /upgrade link used to 404, which Google flagged).
export const metadata = { robots: { index: false, follow: false } };

// Shown when there's no valid report token (e.g. Googlebot following a bare
// /upgrade link, or someone landing here directly). A friendly 200, not a 404.
function NoTokenLanding() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">Upgrade your report</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Add the three AI briefs for £2
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              The £2 upgrade adds three AI-generated briefs to a Premium report you have already bought: a solicitor brief, a surveyor brief and a mortgage-broker brief, each grounded on your actual report data.
            </p>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              To upgrade, open your report and use the <strong>Upgrade for £2</strong> button there, or follow the upgrade link in your report email. That keeps the upgrade tied to the right property.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/check" className="inline-flex items-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Check a property</Link>
              <Link href="/property-history-check" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">How it works</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token || !isValidReportToken(token)) return <NoTokenLanding />;

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("reports")
    .select("id, tier, status, customer_email, data")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) return <NoTokenLanding />;
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
