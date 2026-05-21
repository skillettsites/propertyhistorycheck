import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { deriveReportToken } from "@/lib/report-token";
import CheckoutProgress from "./CheckoutProgress";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; postcode?: string; tier?: string; upgrade_token?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  // For upgrades, the existing token IS the report URL — the new Stripe
  // session id is throwaway. For new purchases, derive token from session id.
  const isUpgrade = params.tier === "standard_plus_upgrade";
  const token = isUpgrade ? (params.upgrade_token ?? null) : deriveReportToken(sessionId);

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <CheckoutProgress token={token} postcode={params.postcode ?? ""} isUpgrade={isUpgrade} />
      </main>
      <Footer />
    </>
  );
}
