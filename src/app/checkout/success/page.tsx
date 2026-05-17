import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { deriveReportToken } from "@/lib/report-token";
import CheckoutProgress from "./CheckoutProgress";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; tier?: string; postcode?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const token = deriveReportToken(sessionId);
  const tier = (params.tier === "premium" ? "premium" : "standard") as "premium" | "standard";

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <CheckoutProgress token={token} tier={tier} postcode={params.postcode ?? ""} />
      </main>
      <Footer />
    </>
  );
}
