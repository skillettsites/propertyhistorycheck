import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import type { PaidReport } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ReportRow {
  id: string;
  tier: "standard" | "premium";
  status: string;
  data: PaidReport | null;
  created_at: string;
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

  const report = row.data;
  const address = report.free.property.fullAddress || report.free.property.postcode;

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">{row.tier === "premium" ? "Premium" : "Standard"} property report</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{address}</h1>
          <p className="mt-1 text-sm text-slate-500">Generated {new Date(report.generatedAt).toLocaleString("en-GB")}</p>

          {report.buyersVerdict && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Buyer&apos;s verdict</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">{report.buyersVerdict}</p>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {row.tier === "premium" && report.title && (
              <Section title="Title register">
                <Row label="Title number" value={report.title.titleNumber ?? "—"} />
                <Row label="Tenure" value={report.title.tenure ?? "—"} />
                {report.title.tenure === "leasehold" && (
                  <>
                    <Row label="Lease term" value={`${report.title.leaseTermYears ?? "—"} yrs`} />
                    <Row label="Years remaining" value={`${report.title.leaseRemainingYears ?? "—"}`} />
                  </>
                )}
                <Row label="Charges registered" value={`${report.title.charges ?? 0}`} />
                <Row label="Restrictions" value={`${report.title.restrictions ?? 0}`} />
                <Row label="Restrictive covenants" value={report.title.hasRestrictiveCovenants ? "Yes" : "No"} />
              </Section>
            )}

            <Section title="Sales history">
              {report.free.priceHistory?.sales?.length ? (
                <ul className="space-y-1 text-sm">
                  {report.free.priceHistory.sales.slice(0, 8).map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{new Date(s.date).toLocaleDateString("en-GB")}</span>
                      <span className="font-semibold">£{s.price.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No recorded sales since 1995.</p>}
            </Section>

            <Section title="Premium flags">
              <Row label="Listed building" value={report.flags.listedBuilding?.listed ? `Listed (${report.flags.listedBuilding.grade ?? "grade unknown"})` : "Not listed"} />
              <Row label="Conservation area" value={report.flags.conservationArea?.inArea ? (report.flags.conservationArea.name ?? "Yes") : "No"} />
              <Row label="Tree preservation order" value={report.flags.treePreservationOrder?.affected ? "Affected" : "Not affected"} />
              <Row label="Coal mining reporting area" value={report.flags.coalReportingArea ? "Yes — CON29M (£60) recommended" : "No"} />
              <Row label="Radon risk band" value={report.flags.radonRiskBand ? `Band ${report.flags.radonRiskBand}` : "Unknown"} />
            </Section>

            <Section title="Energy performance">
              {report.free.epc ? (
                <>
                  <Row label="Current rating" value={report.free.epc.rating ?? "—"} />
                  <Row label="Potential rating" value={report.free.epc.potentialRating ?? "—"} />
                  <Row label="Build year" value={`${report.free.epc.buildYear ?? "—"}`} />
                  <Row label="Heating" value={report.free.epc.mainHeating ?? "—"} />
                </>
              ) : <p className="text-sm text-slate-500">No EPC record.</p>}
            </Section>

            <Section title="Crime (12 months)">
              {report.free.crime ? (
                <>
                  <Row label="Total incidents" value={`${report.free.crime.totalIncidents}`} />
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                    {report.free.crime.byCategory.slice(0, 5).map((c) => (
                      <li key={c.category}>{c.category}: {c.count}</li>
                    ))}
                  </ul>
                </>
              ) : <p className="text-sm text-slate-500">Crime data unavailable.</p>}
            </Section>

            <Section title="Schools (closest)">
              {(report.free.schools ?? []).slice(0, 5).map((s) => (
                <Row key={s.urn ?? s.name} label={s.name} value={`${s.distance.toFixed(1)} km · ${s.rating ?? "—"}`} />
              ))}
            </Section>
          </div>

          <p className="mt-10 text-xs text-slate-500">
            Contains HM Land Registry data &copy; Crown copyright and database right. This report is informational only and not a substitute for formal conveyancing searches.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-3 space-y-1.5 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
