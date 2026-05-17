import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import type { PaidReport } from "@/lib/types";
import LeaseAddOnUpsell from "./LeaseAddOnUpsell";
import Ews1AddOnUpsell from "./Ews1AddOnUpsell";

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
  const free = report.free;
  const address = free.property.fullAddress || free.property.postcode;
  const isPremium = row.tier === "premium";

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">{isPremium ? "Premium" : "Standard"} report</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-200">{free.property.postcode}</span>
              {isPremium && report.title?.titleNumber ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">Title {report.title.titleNumber}</span>
              ) : null}
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-white tracking-tight">{address}</h1>
            <p className="mt-1.5 text-xs text-gray-400">Generated {new Date(report.generatedAt).toLocaleString("en-GB")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`/api/r/${token}/pdf`}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-bold shadow hover:bg-slate-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Download buyer&apos;s PDF
              </a>
              {isPremium ? (
                <a
                  href={`/api/r/${token}/solicitor-pdf`}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 text-slate-900 px-4 py-2 text-sm font-bold shadow hover:bg-cyan-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Solicitor handover pack
                </a>
              ) : null}
              <a href={`/r/${token}#title`} className="inline-flex items-center gap-2 rounded-lg bg-white/10 text-white border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/15">
                {isPremium ? "Jump to Title register" : "Jump to flags"}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">
          {report.buyersVerdict && (
            <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Buyer&apos;s verdict</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">{report.buyersVerdict}</p>
            </div>
          )}

          {isPremium && report.title && (
            <Section id="title" title="Title register" subtitle="HM Land Registry">
              <div className="grid gap-3 md:grid-cols-2">
                <Row label="Title number" value={report.title.titleNumber ?? "—"} />
                <Row label="Tenure" value={report.title.tenure ?? "—"} />
                {report.title.tenure === "leasehold" && (
                  <>
                    <Row label="Lease term" value={`${report.title.leaseTermYears ?? "—"} yrs`} />
                    <Row label="Years remaining" value={`${report.title.leaseRemainingYears ?? "—"}`} />
                    {report.title.leaseStartDate ? <Row label="Lease start" value={new Date(report.title.leaseStartDate).getFullYear().toString()} /> : null}
                  </>
                )}
                <Row label="Charges registered" value={`${report.title.charges ?? 0}`} />
                <Row label="Restrictions" value={`${report.title.restrictions ?? 0}`} />
                <Row label="Cautions" value={`${report.title.cautions ?? 0}`} />
                <Row label="Restrictive covenants" value={report.title.hasRestrictiveCovenants ? "Yes" : "No"} />
                {report.title.registeredOwners?.length ? (
                  <Row label="Registered owners" value={report.title.registeredOwners.join(", ")} />
                ) : null}
                {report.title.registeredOn ? <Row label="Registered" value={new Date(report.title.registeredOn).toLocaleDateString("en-GB")} /> : null}
                {report.title.pricePaid ? <Row label="Price paid (LR)" value={`£${report.title.pricePaid.amount.toLocaleString()} on ${new Date(report.title.pricePaid.date).getFullYear()}`} /> : null}
              </div>
            </Section>
          )}

          {isPremium && report.titlePlan ? (
            <Section title="Title plan" subtitle="HM Land Registry">
              <p className="text-sm text-slate-700 mb-3">
                Boundary diagram for the registered title. Confirms exactly what land is included in the sale.
              </p>
              <a
                href={report.titlePlan.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7M12 4v16" />
                </svg>
                Download title plan PDF
              </a>
              {report.titlePlan.orderRef ? (
                <p className="mt-2 text-[11px] text-slate-500">Order ref: {report.titlePlan.orderRef}. Link valid 6 months.</p>
              ) : null}
            </Section>
          ) : null}

          {isPremium && !report.lease && /flat|maisonette/i.test(free.epc?.propertyType ?? "") ? (
            <LeaseAddOnUpsell token={token} postcode={free.property.postcode} fullAddress={free.property.fullAddress ?? ""} />
          ) : null}
          {isPremium && report.lease ? (
            <Section title="Lease document (OC2)" subtitle="HM Land Registry">
              {report.lease.status === "ready" && report.lease.documentUrl ? (
                <>
                  <p className="text-sm text-slate-700 mb-3">
                    The registered lease for this property. Read for ground rent escalation, service-charge methodology, restrictive covenants, and lease term details.
                  </p>
                  <a
                    href={report.lease.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7M12 4v16" />
                    </svg>
                    Download lease PDF
                  </a>
                  {report.lease.fulfilledAt ? (
                    <p className="mt-2 text-[11px] text-slate-500">Delivered {new Date(report.lease.fulfilledAt).toLocaleString("en-GB")}.</p>
                  ) : null}
                </>
              ) : report.lease.status === "failed" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">Lease unavailable from HM Land Registry</p>
                  <p className="mt-1 text-xs text-red-700">
                    Some older leases aren&apos;t scanned digitally and need to be ordered by post (3-5 working days).
                    We&apos;ve refunded your add-on and emailed you the original document order form.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-sm font-bold text-amber-900">Lease document — pending</p>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Ordered from HM Land Registry at {new Date(report.lease.orderedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {new Date(report.lease.orderedAt).toLocaleDateString("en-GB")}.
                    <strong> Delivered within 48 hours</strong> (most arrive same-day). We&apos;ll email you the moment it&apos;s ready, and this section will update automatically.
                  </p>
                  {report.lease.note ? (
                    <p className="mt-2 text-[11px] text-amber-800 italic">{report.lease.note}</p>
                  ) : null}
                </div>
              )}
            </Section>
          ) : null}

          {/* EWS1 cladding check (flats only). Mirrors lease pattern. */}
          {isPremium && !report.ews1 && /flat|maisonette/i.test(free.epc?.propertyType ?? "") ? (
            <Ews1AddOnUpsell token={token} postcode={free.property.postcode} fullAddress={free.property.fullAddress ?? ""} />
          ) : null}
          {isPremium && report.ews1 ? (
            <Section title="EWS1 cladding check" subtitle="BSR / FIA / Building Safety Portal">
              {report.ews1.status === "ready" ? (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {report.ews1.hrbRegistered != null ? (
                      <Row label="BSR Higher-Risk Building" value={report.ews1.hrbRegistered ? "Yes — registered" : "No — not registered"} />
                    ) : null}
                    {report.ews1.rating ? <Row label="EWS1 rating" value={report.ews1.rating} /> : <Row label="EWS1 rating" value="Not found on public registers" />}
                    {report.ews1.assessedOn ? <Row label="Assessed on" value={new Date(report.ews1.assessedOn).toLocaleDateString("en-GB")} /> : null}
                    {report.ews1.assessor ? <Row label="Assessor" value={report.ews1.assessor} /> : null}
                  </div>
                  {report.ews1.notes ? (
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{report.ews1.notes}</p>
                  ) : null}
                  {report.ews1.documentUrl ? (
                    <a href={report.ews1.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold">
                      Download EWS1 form (PDF) &rarr;
                    </a>
                  ) : null}
                  {report.ews1.fulfilledAt ? (
                    <p className="mt-3 text-[11px] text-slate-500">Delivered {new Date(report.ews1.fulfilledAt).toLocaleString("en-GB")}.</p>
                  ) : null}
                </>
              ) : report.ews1.status === "failed" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">EWS1 check could not be completed</p>
                  <p className="mt-1 text-xs text-red-700">We&apos;ve refunded your add-on. Please contact us if you need a manual lookup.</p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-sm font-bold text-amber-900">EWS1 cladding check — pending</p>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Ordered at {new Date(report.ews1.orderedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {new Date(report.ews1.orderedAt).toLocaleDateString("en-GB")}.
                    Our team is cross-referencing the BSR Higher-Risk Building register, FIA EWS1 portal, and Building Safety Portal.
                    <strong> Delivered within 48 hours</strong>. We&apos;ll email you when findings are posted, and this section will update automatically.
                  </p>
                  {report.ews1.notes ? (
                    <p className="mt-2 text-[11px] text-amber-800 italic">{report.ews1.notes}</p>
                  ) : null}
                </div>
              )}
            </Section>
          ) : null}

          {isPremium && report.companyOwner ? (
            <Section title="Registered owner — company check" subtitle="Companies House">
              <div className="grid gap-3 md:grid-cols-2">
                <Row label="Company" value={`${report.companyOwner.companyName} (${report.companyOwner.companyNumber})`} />
                <Row label="Status" value={report.companyOwner.status.charAt(0).toUpperCase() + report.companyOwner.status.slice(1)} />
                {report.companyOwner.incorporatedOn ? <Row label="Incorporated" value={new Date(report.companyOwner.incorporatedOn).toLocaleDateString("en-GB")} /> : null}
                {report.companyOwner.officersCount != null ? <Row label="Active officers" value={String(report.companyOwner.officersCount)} /> : null}
                {report.companyOwner.outstandingCharges != null ? <Row label="Outstanding charges" value={String(report.companyOwner.outstandingCharges)} /> : null}
                {report.companyOwner.registeredAddress ? <Row label="Registered address" value={report.companyOwner.registeredAddress} /> : null}
              </div>
              {report.companyOwner.riskNote ? (
                <p className={`mt-3 text-sm font-semibold ${report.companyOwner.status === "active" ? "text-slate-700" : "text-red-700"}`}>
                  {report.companyOwner.riskNote}
                </p>
              ) : null}
              <a href={report.companyOwner.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900">
                View on Companies House &rarr;
              </a>
            </Section>
          ) : null}

          {isPremium && report.sellerQuestions && report.sellerQuestions.length > 0 ? (
            <Section title="Questions to ask the seller" subtitle="AI-generated from this property's flags">
              <ul className="space-y-3">
                {report.sellerQuestions.map((q, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mt-0.5 ${q.priority === "high" ? "bg-red-50 text-red-700 border border-red-200" : q.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                        {q.priority}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question}</p>
                        <p className="text-xs text-slate-600 mt-1 italic">→ ask the {q.audience.replace("-", " ")}: {q.rationale}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-slate-500 italic">
                Generated by AI from the data points found on this property. Not legal advice — your solicitor will use these as a starting point for formal pre-contract enquiries.
              </p>
            </Section>
          ) : null}

          {isPremium && /flat|maisonette/i.test(free.epc?.propertyType ?? "") ? (
            <Section title="EWS1 cladding enquiry" subtitle="Send this to the seller's solicitor">
              <p className="text-sm text-slate-700 mb-3">
                Since 2020, every flat purchase needs to confirm the External Wall System status. Without an EWS1, mortgages can be refused. Copy the enquiry below into the email when you instruct your solicitor:
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line">
{`Subject: EWS1 / external wall system enquiry — ${free.property.fullAddress}

Please confirm with the freeholder / managing agent:

1. Does the building have a current EWS1 form? If yes, please supply a copy with: rating (A1, A2, A3, B1, B2), assessor name and qualifications, date of assessment, and PAS9980 compliance status.

2. If no EWS1 exists, has the freeholder commissioned a Fire Risk Appraisal of External Walls (FRAEW)? Provide the date completed.

3. Are there any cladding remediation works planned, in progress, or applied for under the Building Safety Fund or Cladding Safety Scheme?

4. For buildings ≥18m or ≥7 storeys: confirm registration with the Building Safety Regulator (BSR) under the Higher-Risk Buildings regime, and provide the Principal Accountable Person's name.

5. Has the building had any insurance loadings, mortgage refusals, or sale fall-throughs in the past 24 months attributed to fire-safety issues?`}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <a href="https://www.register-high-rise-building.service.gov.uk/public-register/search" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                  BSR HRB register &rarr;
                </a>
                <a href="https://www.fia.uk.com/ews1.html" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                  FIA EWS1 portal &rarr;
                </a>
                <a href="https://buildingsafetyportal.co.uk/search_forms" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                  Building Safety Portal &rarr;
                </a>
              </div>
            </Section>
          ) : null}

          <Section id="flags" title="Premium flags" subtitle="Listed, conservation, mining, radon">
            <div className="grid gap-3 md:grid-cols-2">
              <Row label="Listed building" value={report.flags.listedBuilding?.listed ? `Listed (${report.flags.listedBuilding.grade ?? "grade unknown"})` : "Not listed"} />
              <Row label="Conservation area" value={report.flags.conservationArea?.inArea ? (report.flags.conservationArea.name ?? "Yes") : "No"} />
              <Row label="Tree preservation order" value={report.flags.treePreservationOrder?.affected ? "Affected" : "Not affected"} />
              <Row label="Coal mining reporting area" value={report.flags.coalReportingArea ? "Yes — CON29M (£60) recommended" : "No"} />
              <Row label="Contaminated land" value={report.flags.contaminatedLand ? "Risk indicated" : "No flag"} />
              <Row label="Radon risk band" value={report.flags.radonRiskBand ? `Band ${report.flags.radonRiskBand}` : "Unknown"} />
              <Row label="AONB" value={report.flags.aonb ? "Yes" : "No"} />
            </div>
          </Section>

          <Section title="Sales history" subtitle="HM Land Registry Price Paid">
            {free.priceHistory?.sales?.length ? (
              <ul className="divide-y divide-slate-100">
                {free.priceHistory.sales.slice(0, 12).map((s, i) => (
                  <li key={i} className="flex justify-between py-2 text-sm">
                    <span className="text-slate-700">{new Date(s.date).toLocaleDateString("en-GB")}</span>
                    <span className="font-bold text-slate-900">£{s.price.toLocaleString("en-GB")}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No recorded sales for this address since 1995.</p>}
            {free.priceHistory?.similarSales?.length ? (
              <p className="mt-3 text-xs text-slate-500">{free.priceHistory.similarSales.length} similar properties sold in this postcode (see free report for details).</p>
            ) : null}
          </Section>

          <Section title="Energy &amp; running costs" subtitle="EPC + council tax">
            <div className="grid gap-3 md:grid-cols-2">
              {free.epc ? (
                <>
                  <Row label="EPC rating (current)" value={free.epc.rating ?? "—"} />
                  <Row label="EPC potential" value={free.epc.potentialRating ?? "—"} />
                  <Row label="Property type" value={free.epc.propertyType ?? "—"} />
                  <Row label="Build year" value={free.epc.buildYear ? String(free.epc.buildYear) : "—"} />
                  <Row label="Floor area" value={free.epc.totalFloorArea ? `${free.epc.totalFloorArea} m²` : "—"} />
                  <Row label="Main heating" value={free.epc.mainHeating ?? "—"} />
                </>
              ) : <p className="text-sm text-slate-500">No EPC certificate available.</p>}
              {free.councilTax?.band ? (
                <>
                  <Row label="Council tax band" value={free.councilTax.band} />
                  <Row label="Annual cost" value={free.councilTax.estimatedAnnualCost ? `£${free.councilTax.estimatedAnnualCost.toLocaleString()}` : "—"} />
                  <Row label="Local authority" value={free.councilTax.authority ?? "—"} />
                </>
              ) : null}
            </div>
          </Section>

          <Section title="Risks &amp; constraints" subtitle="Flood, ground, air, planning">
            <div className="grid gap-3 md:grid-cols-2">
              {free.flood ? <Row label="Flood risk" value={`${free.flood.riskLevel}${free.flood.inFloodZone3 ? " (Zone 3)" : free.flood.inFloodZone2 ? " (Zone 2)" : ""}`} /> : null}
              {free.groundRisk && free.groundRisk.shrinkSwell !== "unknown" ? <Row label="Shrink-swell" value={free.groundRisk.shrinkSwell} /> : null}
              {free.airQuality?.daqiCategory ? <Row label="Air quality (DAQI)" value={`${free.airQuality.daqiCategory}${free.airQuality.daqiBand ? ` (${free.airQuality.daqiBand}/10)` : ""}`} /> : null}
              {free.airQuality?.no2 != null ? <Row label="NO₂ (µg/m³)" value={free.airQuality.no2.toFixed(1)} /> : null}
              {free.airQuality?.pm25 != null ? <Row label="PM2.5 (µg/m³)" value={free.airQuality.pm25.toFixed(1)} /> : null}
              {free.crime ? <Row label="Crime (12 mo, ~1 mile)" value={`${free.crime.totalIncidents} incidents`} /> : null}
              {free.planning ? <Row label="Planning apps (12 mo)" value={`${free.planning.totalApps12m}`} /> : null}
              {free.planning?.nearListedBuildings != null ? <Row label="Listed buildings nearby" value={`${free.planning.nearListedBuildings}`} /> : null}
            </div>
          </Section>

          <Section title="Area profile" subtitle="Demographics &amp; deprivation">
            <div className="grid gap-3 md:grid-cols-2">
              {free.demographics ? (
                <>
                  <Row label="Local population (LSOA)" value={free.demographics.population.toLocaleString()} />
                  {free.demographics.medianAge != null ? <Row label="Median age" value={`${free.demographics.medianAge}`} /> : null}
                  {free.demographics.medianHouseholdIncome != null ? <Row label="Median household income" value={`£${free.demographics.medianHouseholdIncome.toLocaleString()}`} /> : null}
                  {free.demographics.tenure ? (
                    <>
                      <Row label="Owner-occupied" value={`${free.demographics.tenure.ownerOccupiedPct}%`} />
                      <Row label="Private rent" value={`${free.demographics.tenure.privateRentPct}%`} />
                      <Row label="Social rent" value={`${free.demographics.tenure.socialRentPct}%`} />
                    </>
                  ) : null}
                </>
              ) : null}
              {free.imd ? <Row label="IMD decile (national)" value={`${free.imd.decile} / 10`} /> : null}
              {free.walkScore ? <Row label="Walkability" value={`${free.walkScore.score} / 100 (${free.walkScore.band})`} /> : null}
            </div>
          </Section>

          <Section title="Schools (closest 5)" subtitle="GIAS / Ofsted">
            {(free.schools ?? []).slice(0, 5).map((s) => (
              <Row key={s.urn ?? s.name} label={s.name} value={`${s.distance.toFixed(1)} km · ${s.rating ?? "—"}`} />
            ))}
            {(free.schools ?? []).length === 0 ? <p className="text-sm text-slate-500">No schools data available.</p> : null}
          </Section>

          <Section title="Connectivity" subtitle="Broadband &amp; mobile">
            <div className="grid gap-3 md:grid-cols-2">
              {free.broadband?.averageDownload ? <Row label="Average broadband" value={`${Math.round(free.broadband.averageDownload)} Mbps`} /> : null}
              {free.broadband ? <Row label="Full fibre (FTTP)" value={free.broadband.fullFibre ? "Available" : "Not available"} /> : null}
              {free.mobile?.operators?.length ? <Row label="Mobile operators with 4G" value={`${free.mobile.operators.filter((o) => o.outdoor4g || o.indoor4g).length} / 4`} /> : null}
              {free.evCharging?.count ? <Row label="EV chargers (within 2 mi)" value={`${free.evCharging.count} (${free.evCharging.rapidChargers} rapid, ${free.evCharging.fastChargers} fast)`} /> : null}
            </div>
          </Section>

          <p className="mt-10 text-xs text-slate-500 leading-relaxed">
            Contains HM Land Registry data &copy; Crown copyright and database right. This report is informational only and not a substitute for formal conveyancing searches conducted by a qualified solicitor.
            Save this URL — your report stays accessible at <span className="font-mono text-slate-700">/r/{token}</span>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-20">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h2 className="text-base font-extrabold text-slate-900" dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle ? <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 font-semibold text-right">{value}</span>
    </div>
  );
}
