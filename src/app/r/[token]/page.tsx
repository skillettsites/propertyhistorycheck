import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidReportToken } from "@/lib/report-token";
import type { PaidReport } from "@/lib/types";
import LeaseAddOnUpsell from "./LeaseAddOnUpsell";

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
  const isFlat = /flat|maisonette/i.test(free.epc?.propertyType ?? "");

  // Anchor nav targets — only show jumps for sections that actually rendered.
  const jumps: Array<{ id: string; label: string }> = [];
  if (report.buyersVerdict) jumps.push({ id: "verdict", label: "Buyer's verdict" });
  if (isPremium && report.title) jumps.push({ id: "title", label: "Title register" });
  if (isPremium && report.lease) jumps.push({ id: "lease", label: "Lease document" });
  if (isPremium && report.companyOwner) jumps.push({ id: "owner", label: "Owner check" });
  if (isPremium && report.sellerQuestions?.length) jumps.push({ id: "questions", label: "Seller questions" });
  jumps.push({ id: "essentials", label: "Property essentials" });
  jumps.push({ id: "risks", label: "Risks & constraints" });
  jumps.push({ id: "area", label: "Area profile" });
  jumps.push({ id: "flags", label: "Premium flags" });
  jumps.push({ id: "sales", label: "Sales history" });
  jumps.push({ id: "local", label: "Local context" });
  jumps.push({ id: "connectivity", label: "Connectivity" });

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">{isPremium ? "Premium" : "Standard"} report</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-200">{free.property.postcode}</span>
              {isPremium && report.title?.titleNumber ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">Title {report.title.titleNumber}</span>
              ) : null}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">Paid &middot; full access</span>
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-white tracking-tight">{address}</h1>
            <p className="mt-1.5 text-xs text-gray-400">Generated {new Date(report.generatedAt).toLocaleString("en-GB")} &middot; Bookmark this page — it stays accessible at /r/{token}</p>
          </div>
        </div>

        {/* Jump nav */}
        <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-4 py-2 overflow-x-auto">
            <div className="flex gap-2 text-xs whitespace-nowrap">
              {jumps.map((j) => (
                <a key={j.id} href={`#${j.id}`} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold">{j.label}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8">

          {/* Buyer's verdict */}
          {report.buyersVerdict ? (
            <Section id="verdict" title="Buyer's verdict" subtitle="AI synthesis of this property's flags">
              <p className="text-sm leading-relaxed text-slate-800">{report.buyersVerdict}</p>
            </Section>
          ) : null}

          {/* Composite risk */}
          {free.compositeRisk ? (
            <Section title="Composite risk score" subtitle="Aggregated from all checks">
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full font-extrabold text-xl ${riskColor(free.compositeRisk.band)}`}>
                  {free.compositeRisk.score}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{bandLabel(free.compositeRisk.band)}</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
                    {free.compositeRisk.contributors.slice(0, 5).map((c, i) => (
                      <li key={i}>· {c.label}{c.note ? <span className="text-slate-500"> — {c.note}</span> : null}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          ) : null}

          {/* Title register */}
          {isPremium && report.title ? (
            <Section id="title" title="Title register" subtitle="Live from HM Land Registry">
              <div className="grid gap-3 md:grid-cols-2">
                <Row label="Title number" value={report.title.titleNumber ?? "—"} />
                <Row label="Tenure" value={report.title.tenure ?? "—"} />
                {report.title.tenure === "leasehold" && (
                  <>
                    <Row label="Lease term" value={report.title.leaseTermYears ? `${report.title.leaseTermYears} yrs` : "—"} />
                    <Row label="Years remaining" value={report.title.leaseRemainingYears != null ? `${report.title.leaseRemainingYears}` : "—"} />
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
              {report.titlePlan ? (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Title plan (boundary diagram)</p>
                  <a href={report.titlePlan.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold shadow">
                    Download title plan PDF &rarr;
                  </a>
                  {report.titlePlan.orderRef ? <p className="mt-2 text-[11px] text-slate-500">Order ref: {report.titlePlan.orderRef} · Link valid 6 months</p> : null}
                </div>
              ) : null}
            </Section>
          ) : isPremium ? (
            <Section title="Title register" subtitle="HM Land Registry">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Title register not pulled for this purchase</p>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">The title pull needs a specific building/flat number — your purchase used a postcode-only lookup. Contact <a href="mailto:support@homebuyercheck.co.uk" className="underline font-semibold">support@homebuyercheck.co.uk</a> with your address and we&apos;ll run the pull manually and email you the title within 24 hours.</p>
              </div>
            </Section>
          ) : null}

          {/* Lease */}
          {isPremium && !report.lease && /flat|maisonette/i.test(free.epc?.propertyType ?? "") ? (
            <LeaseAddOnUpsell token={token} postcode={free.property.postcode} fullAddress={free.property.fullAddress ?? ""} />
          ) : null}
          {isPremium && report.lease ? (
            <Section id="lease" title="Lease document (OC2)" subtitle="HM Land Registry">
              {report.lease.status === "ready" && report.lease.documentUrl ? (
                <>
                  <p className="text-sm text-slate-700 mb-3">The registered lease for this property. Spells out ground rent escalation, service-charge methodology, restrictive covenants, and lease term details.</p>
                  <a href={report.lease.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-bold">Download lease PDF &rarr;</a>
                  {report.lease.fulfilledAt ? <p className="mt-2 text-[11px] text-slate-500">Delivered {new Date(report.lease.fulfilledAt).toLocaleString("en-GB")}</p> : null}
                </>
              ) : report.lease.status === "failed" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">Lease unavailable from HM Land Registry</p>
                  <p className="mt-1 text-xs text-red-700">Older leases aren&apos;t scanned digitally. We&apos;ve refunded your add-on.</p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-sm font-bold text-amber-900">Lease document — pending</p>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Ordered from HM Land Registry at {new Date(report.lease.orderedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {new Date(report.lease.orderedAt).toLocaleDateString("en-GB")}.
                    <strong> Delivered within 48 hours</strong> (most arrive same-day). We&apos;ll email you and this section auto-updates.
                  </p>
                </div>
              )}
            </Section>
          ) : null}

          {/* Company owner */}
          {isPremium && report.companyOwner ? (
            <Section id="owner" title="Registered owner — company check" subtitle="Companies House">
              <div className="grid gap-3 md:grid-cols-2">
                <Row label="Company" value={`${report.companyOwner.companyName} (${report.companyOwner.companyNumber})`} />
                <Row label="Status" value={capFirst(report.companyOwner.status)} />
                {report.companyOwner.incorporatedOn ? <Row label="Incorporated" value={new Date(report.companyOwner.incorporatedOn).toLocaleDateString("en-GB")} /> : null}
                {report.companyOwner.officersCount != null ? <Row label="Active officers" value={String(report.companyOwner.officersCount)} /> : null}
                {report.companyOwner.outstandingCharges != null ? <Row label="Outstanding charges" value={String(report.companyOwner.outstandingCharges)} /> : null}
                {report.companyOwner.registeredAddress ? <Row label="Registered address" value={report.companyOwner.registeredAddress} /> : null}
              </div>
              {report.companyOwner.riskNote ? <p className={`mt-3 text-sm font-semibold ${report.companyOwner.status === "active" ? "text-slate-700" : "text-red-700"}`}>{report.companyOwner.riskNote}</p> : null}
              <a href={report.companyOwner.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900">View on Companies House &rarr;</a>
            </Section>
          ) : null}

          {/* Seller questions */}
          {isPremium && report.sellerQuestions?.length ? (
            <Section id="questions" title="Questions to ask the seller" subtitle="AI-generated from this property's flags">
              <ul className="space-y-3">
                {report.sellerQuestions.map((q, i) => (
                  <li key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mt-0.5 ${q.priority === "high" ? "bg-red-50 text-red-700 border border-red-200" : q.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{q.priority}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question}</p>
                        <p className="text-xs text-slate-600 mt-1 italic">&rarr; ask the {q.audience.replace("-", " ")}: {q.rationale}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-slate-500 italic">Generated by AI from data points found on this property. Not legal advice — your solicitor will use these as a starting point for formal pre-contract enquiries.</p>
            </Section>
          ) : null}

          {/* Property essentials */}
          <Section id="essentials" title="Property essentials" subtitle="Sales, energy, tax">
            <div className="grid gap-4 md:grid-cols-2">
              {free.epc ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Energy (EPC)</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Row label="Current rating" value={free.epc.rating ?? "—"} />
                    <Row label="Potential rating" value={free.epc.potentialRating ?? "—"} />
                    <Row label="Type" value={free.epc.propertyType ?? "—"} />
                    <Row label="Build year" value={free.epc.buildYear ? String(free.epc.buildYear) : "—"} />
                    <Row label="Floor area" value={free.epc.totalFloorArea ? `${free.epc.totalFloorArea} m²` : "—"} />
                    <Row label="Heating" value={free.epc.mainHeating ?? "—"} />
                  </div>
                  {free.epc.certificateUrl ? <a href={free.epc.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900">View EPC certificate &rarr;</a> : null}
                </div>
              ) : null}

              {free.councilTax?.band ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Council tax</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Row label="Band" value={free.councilTax.band} />
                    <Row label="Annual cost" value={free.councilTax.estimatedAnnualCost ? `£${free.councilTax.estimatedAnnualCost.toLocaleString()}` : "—"} />
                    <Row label="Monthly" value={free.councilTax.monthlyAmount ? `£${free.councilTax.monthlyAmount}` : "—"} />
                    <Row label="Authority" value={free.councilTax.authority ?? "—"} />
                  </div>
                </div>
              ) : null}

              {free.rentalEstimate ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Rental yield estimate</p>
                  <p className="text-2xl font-extrabold text-emerald-700">£{free.rentalEstimate.monthlyRent.toLocaleString()}/mo</p>
                  <p className="text-xs text-slate-600 mt-1">Range: £{(free.rentalEstimate.low ?? 0).toLocaleString()} – £{(free.rentalEstimate.high ?? 0).toLocaleString()}</p>
                  {free.rentalEstimate.grossYieldPct != null ? <p className="text-xs text-slate-800 font-bold mt-1">Gross yield: {free.rentalEstimate.grossYieldPct}%</p> : null}
                  <p className="text-[10px] text-slate-500 mt-1">Source: {free.rentalEstimate.source}</p>
                </div>
              ) : null}

              {free.solar ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Solar potential</p>
                  <Row label="System size" value={`${free.solar.estimatedSystemKwp} kWp`} />
                  <Row label="Annual generation" value={`${free.solar.estimatedAnnualKwh.toLocaleString()} kWh`} />
                  <Row label="Annual savings" value={`£${free.solar.estimatedAnnualSavings.toLocaleString()}`} />
                </div>
              ) : null}
            </div>
          </Section>

          {/* Risks & constraints */}
          <Section id="risks" title="Risks &amp; constraints" subtitle="Flood, planning, crime, ground, air">
            <div className="grid gap-3 md:grid-cols-2">
              {free.flood ? <Row label="Flood risk" value={`${capFirst(free.flood.riskLevel)}${free.flood.inFloodZone3 ? " (Zone 3)" : free.flood.inFloodZone2 ? " (Zone 2)" : ""}`} /> : null}
              {free.groundRisk && free.groundRisk.shrinkSwell !== "unknown" ? <Row label="Shrink-swell" value={capFirst(free.groundRisk.shrinkSwell)} /> : null}
              {free.airQuality?.daqiCategory ? <Row label="Air quality (DAQI)" value={`${free.airQuality.daqiCategory}${free.airQuality.daqiBand ? ` (${free.airQuality.daqiBand}/10)` : ""}`} /> : null}
              {free.airQuality?.no2 != null ? <Row label="NO₂ (µg/m³)" value={free.airQuality.no2.toFixed(1)} /> : null}
              {free.airQuality?.pm25 != null ? <Row label="PM2.5 (µg/m³)" value={free.airQuality.pm25.toFixed(1)} /> : null}
              {free.noise?.overallLevel ? <Row label="Noise (DEFRA)" value={`${capFirst(free.noise.overallLevel)} — road ${free.noise.roadNoiseLden ?? "—"} dB`} /> : null}
              {free.crime ? <Row label="Crime (12 mo, ~1 mile)" value={`${free.crime.totalIncidents.toLocaleString()} incidents${free.crime.trendPct != null ? ` (${free.crime.trendPct > 0 ? "+" : ""}${free.crime.trendPct}% YoY)` : ""}`} /> : null}
              {free.planning ? <Row label="Planning apps (12 mo)" value={`${free.planning.totalApps12m} (${free.planning.approvedApps} approved · ${free.planning.pendingApps} pending)`} /> : null}
              {free.planning?.nearListedBuildings != null ? <Row label="Listed buildings nearby" value={`${free.planning.nearListedBuildings}`} /> : null}
              {free.planning?.inConservationArea ? <Row label="Conservation area" value="Yes" /> : null}
              {free.planning?.inGreenBelt ? <Row label="Green belt" value="Yes" /> : null}
            </div>

            {/* Crime breakdown */}
            {free.crime?.byCategory?.length ? (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">Crime breakdown (12 months)</p>
                <div className="space-y-1.5">
                  {free.crime.byCategory.slice(0, 10).map((c) => {
                    const pct = free.crime!.totalIncidents > 0 ? (c.count / free.crime!.totalIncidents) * 100 : 0;
                    return (
                      <div key={c.category} className="flex items-center gap-2 text-xs">
                        <div className="w-32 text-slate-700 shrink-0">{c.category}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(2, pct)}%` }} />
                        </div>
                        <div className="w-16 text-right font-bold text-slate-900">{c.count.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Section>

          {/* Area profile */}
          <Section id="area" title="Area profile" subtitle="Lifestyle, walkability, demographics">
            <div className="grid gap-4 md:grid-cols-2">
              {free.lifestyleScores ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Lifestyle fit (0-10)</p>
                  <div className="space-y-1">
                    {(["family", "firstTimeBuyer", "retiree", "commuter", "investor"] as const).map((k) => (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        <div className="w-28 text-slate-700">{k === "firstTimeBuyer" ? "First-time buyer" : capFirst(k)}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(free.lifestyleScores![k] / 10) * 100}%` }} />
                        </div>
                        <div className="w-8 text-right font-bold text-slate-900">{free.lifestyleScores![k].toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                  {free.lifestyleScores.topPickReason ? <p className="mt-3 text-xs text-slate-700 italic">{free.lifestyleScores.topPickReason}</p> : null}
                </div>
              ) : null}

              {free.areaTrend ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Area trend</p>
                  <p className={`text-lg font-extrabold ${free.areaTrend.direction === "improving" ? "text-emerald-700" : free.areaTrend.direction === "declining" ? "text-red-700" : "text-slate-700"}`}>{capFirst(free.areaTrend.direction)}</p>
                  <p className="text-xs text-slate-600">Score: {free.areaTrend.score}/100</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-700">
                    {free.areaTrend.drivers.slice(0, 4).map((d, i) => <li key={i}>· {d}</li>)}
                  </ul>
                </div>
              ) : null}

              {free.walkScore ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Walkability</p>
                  <p className="text-3xl font-extrabold text-slate-900">{free.walkScore.score}<span className="text-base font-bold text-slate-500">/100</span></p>
                  <p className="text-sm font-semibold text-slate-700">{free.walkScore.band}</p>
                  {free.walkScore.amenities?.length ? <p className="mt-2 text-xs text-slate-600">{free.walkScore.amenities.slice(0, 3).map((a) => `${a.count} ${a.type}`).join(" · ")}</p> : null}
                </div>
              ) : null}

              {free.imd ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Deprivation (IMD)</p>
                  <Row label="National decile" value={`${free.imd.decile} / 10`} />
                  <p className="text-xs text-slate-600 mt-1">{free.imd.decile <= 3 ? "Among most deprived nationally" : free.imd.decile >= 8 ? "Among least deprived nationally" : "Mid-range"}</p>
                </div>
              ) : null}

              {free.demographics ? (
                <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Demographics (LSOA)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <Row label="Population" value={free.demographics.population.toLocaleString()} />
                    {free.demographics.medianAge != null ? <Row label="Median age" value={`${free.demographics.medianAge}`} /> : null}
                    {free.demographics.medianHouseholdIncome != null ? <Row label="Median income" value={`£${free.demographics.medianHouseholdIncome.toLocaleString()}`} /> : null}
                    {free.demographics.tenure ? <>
                      <Row label="Owner-occupied" value={`${free.demographics.tenure.ownerOccupiedPct}%`} />
                      <Row label="Private rent" value={`${free.demographics.tenure.privateRentPct}%`} />
                      <Row label="Social rent" value={`${free.demographics.tenure.socialRentPct}%`} />
                    </> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </Section>

          {/* Premium flags */}
          <Section id="flags" title="Premium flags" subtitle="Listed, conservation, mining, radon, contaminated">
            <div className="grid gap-3 md:grid-cols-2">
              <Row label="Listed building" value={report.flags.listedBuilding?.listed ? `Listed (${report.flags.listedBuilding.grade ?? "grade unknown"})` : "Not listed"} />
              <Row label="Conservation area" value={report.flags.conservationArea?.inArea ? (report.flags.conservationArea.name ?? "Yes") : "No"} />
              <Row label="Tree preservation order" value={report.flags.treePreservationOrder?.affected ? `Affected${report.flags.treePreservationOrder.count ? ` (${report.flags.treePreservationOrder.count})` : ""}` : "Not affected"} />
              <Row label="Coal mining reporting area" value={report.flags.coalReportingArea ? "Yes — CON29M (£60) recommended" : "No"} />
              <Row label="Contaminated land" value={report.flags.contaminatedLand ? "Risk indicated" : "No flag"} />
              <Row label="Radon risk band" value={report.flags.radonRiskBand ? `Band ${report.flags.radonRiskBand}/5` : "Unknown"} />
              <Row label="Mining area" value={report.flags.miningArea ? "Yes" : "No"} />
              <Row label="AONB" value={report.flags.aonb ? "Yes" : "No"} />
              <Row label="Green belt" value={report.flags.greenBelt ? "Yes" : "No"} />
              <Row label="Article 4 direction" value={report.flags.article4 ? "Yes" : "No"} />
              <Row label="Japanese knotweed risk" value={report.flags.knotweedRisk ? capFirst(report.flags.knotweedRisk) : "Unknown"} />
            </div>
          </Section>

          {/* Sales history */}
          <Section id="sales" title="Sales history" subtitle="HM Land Registry Price Paid">
            {free.priceHistory?.sales?.length ? (
              <ul className="divide-y divide-slate-100">
                {free.priceHistory.sales.slice(0, 12).map((s, i) => (
                  <li key={i} className="flex justify-between py-2 text-sm">
                    <span className="text-slate-700">{new Date(s.date).toLocaleDateString("en-GB")}{s.propertyType ? ` · ${propertyTypeLabel(s.propertyType)}` : ""}{s.tenure ? ` · ${s.tenure === "F" ? "Freehold" : "Leasehold"}` : ""}</span>
                    <span className="font-bold text-slate-900">£{s.price.toLocaleString("en-GB")}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No recorded sales for this exact address since 1995.</p>}
            {free.priceHistory?.postcodeAverage ? (
              <div className="mt-4 pt-4 border-t border-slate-200 grid gap-2 md:grid-cols-3">
                <Row label="Postcode average" value={`£${free.priceHistory.postcodeAverage.toLocaleString()}`} />
                {free.priceHistory.postcodeMedian ? <Row label="Postcode median" value={`£${free.priceHistory.postcodeMedian.toLocaleString()}`} /> : null}
                {free.priceHistory.postcodeSampleSize ? <Row label="Sample size" value={`${free.priceHistory.postcodeSampleSize} sales`} /> : null}
              </div>
            ) : null}
            {free.priceHistory?.similarSales?.length ? (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Similar property sales nearby (latest)</p>
                <ul className="divide-y divide-slate-100">
                  {free.priceHistory.similarSales.slice(0, 8).map((s, i) => (
                    <li key={i} className="flex justify-between py-1.5 text-xs">
                      <span className="text-slate-600">{new Date(s.date).toLocaleDateString("en-GB")}{s.paon ? ` · ${s.paon}` : ""}{s.street ? ` ${s.street}` : ""}</span>
                      <span className="font-semibold text-slate-800">£{s.price.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          {/* Local context */}
          <Section id="local" title="Local context" subtitle="Schools, healthcare, amenities, greenspace">
            <div className="grid gap-4 md:grid-cols-2">
              {free.schools?.length ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Schools (closest 5)</p>
                  <ul className="space-y-1">
                    {free.schools.slice(0, 5).map((s) => (
                      <li key={s.urn ?? s.name} className="flex justify-between gap-2 text-xs">
                        <span className="truncate text-slate-700">{s.name}</span>
                        <span className="shrink-0 text-slate-900 font-semibold">{s.distance.toFixed(1)} km · {s.rating ?? "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {free.healthcare ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Healthcare nearby</p>
                  <Row label="GPs within walking distance" value={`${free.healthcare.gps.length}`} />
                  <Row label="Pharmacies" value={`${free.healthcare.pharmacies.length}`} />
                  <Row label="Dentists" value={`${free.healthcare.dentists.length}`} />
                  <Row label="Hospitals" value={`${free.healthcare.hospitals.length}`} />
                  {free.healthcare.nearestGp ? <p className="text-xs text-slate-600 mt-1">Nearest GP: {(free.healthcare.nearestGp.distanceM / 1000).toFixed(2)} km</p> : null}
                </div>
              ) : null}

              {free.amenities ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Amenities</p>
                  <Row label="Amenity score" value={free.amenities.amenityScore} />
                  <Row label="Supermarkets nearby" value={`${free.amenities.supermarkets.length}`} />
                  <Row label="Convenience stores" value={`${free.amenities.convenienceStores}`} />
                  {free.amenities.nearestSupermarket ? <p className="text-xs text-slate-600 mt-1">Nearest: {free.amenities.nearestSupermarket.name} ({free.amenities.nearestSupermarket.distance.toFixed(1)} km)</p> : null}
                </div>
              ) : null}

              {free.greenspace ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Greenspace</p>
                  <Row label="Parks within 1km" value={`${free.greenspace.parks.length}`} />
                  <Row label="Woodland" value={`${free.greenspace.woodland.length}`} />
                  {free.greenspace.nearestPark ? <p className="text-xs text-slate-600 mt-1">Nearest park: {(free.greenspace.nearestPark.distanceM / 1000).toFixed(2)} km</p> : null}
                </div>
              ) : null}
            </div>
          </Section>

          {/* Connectivity */}
          <Section id="connectivity" title="Connectivity" subtitle="Broadband, mobile, transport">
            <div className="grid gap-4 md:grid-cols-2">
              {free.broadband ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Broadband</p>
                  <Row label="Average speed" value={`${Math.round(free.broadband.averageDownload)} Mbps`} />
                  <Row label="Full fibre (FTTP)" value={free.broadband.fullFibre ? "Available" : "Not available"} />
                  <Row label="Superfast" value={free.broadband.superfast ? "Yes" : "No"} />
                  {free.broadband.providers?.length ? <p className="text-xs text-slate-600 mt-1">{free.broadband.providers.length} providers serve this postcode</p> : null}
                </div>
              ) : null}

              {free.mobile?.operators?.length ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Mobile signal</p>
                  <ul className="space-y-1 text-xs">
                    {free.mobile.operators.map((o) => (
                      <li key={o.name} className="flex justify-between">
                        <span className="text-slate-700">{o.name}</span>
                        <span className="font-semibold text-slate-900">{o.outdoor4g ? "4G outdoor" : ""}{o.indoor4g ? " · 4G indoor" : ""}{o.data5g ? " · 5G" : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {free.transportNearby ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Transport</p>
                  {free.transportNearby.nearestStation ? <p className="text-xs text-slate-700">Nearest station: <strong>{free.transportNearby.nearestStation.name ?? "—"}</strong> ({(free.transportNearby.nearestStation.distanceM / 1000).toFixed(2)} km)</p> : null}
                  {free.transportNearby.nearestTube ? <p className="text-xs text-slate-700 mt-1">Nearest tube: <strong>{free.transportNearby.nearestTube.name ?? "—"}</strong> ({(free.transportNearby.nearestTube.distanceM / 1000).toFixed(2)} km)</p> : null}
                  {free.transportNearby.nearestBus ? <p className="text-xs text-slate-700 mt-1">Nearest bus: <strong>{free.transportNearby.nearestBus.name ?? "—"}</strong> ({(free.transportNearby.nearestBus.distanceM / 1000).toFixed(2)} km)</p> : null}
                </div>
              ) : null}
            </div>
          </Section>

          {/* EWS1 enquiry (free signpost section for flats) */}
          {isFlat ? (
            <Section title="EWS1 cladding enquiry" subtitle="Send this to the seller's solicitor">
              <p className="text-sm text-slate-700 mb-3">Since 2020, every flat purchase needs to confirm the External Wall System status. Without an EWS1, mortgages can be refused. Copy the enquiry below into your solicitor instructions:</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line">
{`Subject: EWS1 / external wall system enquiry — ${address}

Please confirm with the freeholder / managing agent:

1. Does the building have a current EWS1 form? If yes, please supply a copy with rating (A1, A2, A3, B1, B2), assessor name, date, PAS9980 status.

2. If no EWS1, has the freeholder commissioned a Fire Risk Appraisal of External Walls (FRAEW)?

3. Any cladding remediation works planned, in progress, or applied for under Building Safety Fund / Cladding Safety Scheme?

4. For buildings ≥18m or ≥7 storeys: confirm BSR Higher-Risk Building registration + Principal Accountable Person.

5. Any insurance loadings, mortgage refusals, or sale fall-throughs in past 24 months related to fire safety?`}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
                <a href="https://www.register-high-rise-building.service.gov.uk/public-register/search" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">BSR HRB register &rarr;</a>
                <a href="https://www.fia.uk.com/ews1.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">FIA EWS1 portal &rarr;</a>
                <a href="https://buildingsafetyportal.co.uk/search_forms" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">Building Safety Portal &rarr;</a>
              </div>
            </Section>
          ) : null}

          <p className="mt-10 text-xs text-slate-500 leading-relaxed">
            Contains HM Land Registry data &copy; Crown copyright and database right. This report is informational only and not a substitute for formal conveyancing searches by a qualified solicitor.
            Save this URL — your report stays accessible at <span className="font-mono text-slate-700">/r/{token}</span>. Questions? <a href="mailto:support@homebuyercheck.co.uk" className="text-blue-700 underline">support@homebuyercheck.co.uk</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-24">
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

function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function bandLabel(band: string): string {
  return band.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function riskColor(band: string): string {
  switch (band) {
    case "very-low": return "bg-emerald-100 text-emerald-800";
    case "low": return "bg-emerald-50 text-emerald-700";
    case "moderate": return "bg-amber-50 text-amber-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "very-high": return "bg-red-100 text-red-800";
    default: return "bg-slate-100 text-slate-800";
  }
}

function propertyTypeLabel(t: string): string {
  switch (t) {
    case "D": return "Detached";
    case "S": return "Semi";
    case "T": return "Terraced";
    case "F": return "Flat";
    case "O": return "Other";
    default: return t;
  }
}
