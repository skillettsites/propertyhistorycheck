import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckClient from "@/app/check/CheckClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import type { PaidReport, PostcodeAddress } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Override the root layout's default description (which pitches the £4.99
 * upsell to free visitors). Paid buyers' /r/{token} pages should reflect
 * their tier in the meta description so social-share previews + crawler-
 * facing strings stop offering them something they've already bought.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  if (!isValidReportToken(token)) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from("reports")
    .select("tier, data")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tier = (data?.tier ?? "standard") as string;
  const fullAddress =
    (data?.data as { free?: { property?: { fullAddress?: string } } } | null)?.free?.property?.fullAddress ?? "your property";

  const title =
    tier === "standard_plus"
      ? `Premium+ property report · ${fullAddress}`
      : `Premium property report · ${fullAddress}`;
  const description =
    tier === "standard_plus"
      ? `Your Premium+ report for ${fullAddress}: ownership, ground risk, tribunal history, plus AI Solicitor, Surveyor and Mortgage briefs and an on-demand Negotiation Report.`
      : `Your Premium report for ${fullAddress}: ownership, ground risk, BSR Higher-Risk Building register, Property Chamber tribunal history and an AI buyer's verdict.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
    },
  };
}

type DbTier = "standard" | "standard_plus" | "standard-plus-lease" | "premium" | "lease-only";

interface ReportRow {
  id: string;
  // Live tiers: "standard" (£4.99 Premium) + "standard_plus" (£6.99 Premium+).
  // Legacy tier strings preserved so old purchase tokens still load, coerced
  // to "standard" for rendering since the data shape is a superset.
  tier: DbTier;
  status: string;
  data: PaidReport | null;
  created_at: string;
}

function coercePaidTier(t: DbTier): "standard" | "standard_plus" {
  return t === "standard_plus" ? "standard_plus" : "standard";
}

export default async function ReportTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isValidReportToken(token)) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select("id, tier, status, data, created_at")
    .ilike("stripe_session_id", `%${token}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as ReportRow;
  if (row.status !== "ready" || !row.data) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50">
          <div className="mx-auto max-w-2xl px-4 py-16">
            <h1 className="text-2xl font-bold text-slate-900">Report still being prepared</h1>
            <p className="mt-3 text-sm text-slate-600">Your report should be ready within 60 seconds of payment. Refresh this page in a minute.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const paid = row.data;
  // Reconstruct PostcodeAddress from the report's free.property block so
  // CheckClient renders the maps, calculators and address-aware sections.
  const address: PostcodeAddress = {
    fullAddress: paid.free.property.fullAddress,
    paon: paid.free.property.paon,
    saon: paid.free.property.saon,
    street: paid.free.property.street,
    town: paid.free.property.town,
    postcode: paid.free.property.postcode,
    lat: paid.free.property.lat,
    lng: paid.free.property.lng,
    region: paid.free.property.region,
    adminDistrictCode: paid.free.property.adminDistrictCode,
    adminDistrictName: paid.free.property.adminDistrictName,
    country: paid.free.property.country,
    lsoa: paid.free.property.lsoa,
    msoa: paid.free.property.msoa,
    uprn: paid.free.property.uprn,
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <CheckClient
          initialReport={paid.free}
          initialAddress={address}
          paidReport={paid}
          paidTier={coercePaidTier(row.tier)}
          paidToken={token}
        />
      </main>
      <Footer />
    </>
  );
}
