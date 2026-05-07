"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttribution, getAttribution } from "@/lib/tracking";
import PostcodeLookup from "@/components/PostcodeLookup";
import type { FreeReport, PostcodeAddress } from "@/lib/types";

interface AddressesResponse {
  postcode: string;
  addresses: string[];
}

export default function CheckClient() {
  const params = useSearchParams();
  const router = useRouter();
  const postcodeParam = (params.get("postcode") || "").toUpperCase();
  const addressParam = params.get("address") || "";

  const [resolvedAddress, setResolvedAddress] = useState<PostcodeAddress | null>(null);
  const [pickerAddresses, setPickerAddresses] = useState<string[] | null>(null);
  const [report, setReport] = useState<FreeReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!postcodeParam) return;
    setError(null);

    const formatPostcode = (pc: string) => {
      const c = pc.replace(/\s+/g, "").toUpperCase();
      if (c.length < 5) return c;
      return `${c.slice(0, -3)} ${c.slice(-3)}`;
    };

    async function load() {
      const lookupRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcodeParam.replace(/\s+/g, ""))}`);
      let lat: number | undefined;
      let lng: number | undefined;
      let town: string | undefined;
      let region: string | undefined;
      let country: string | undefined;
      let adminDistrictCode: string | undefined;
      let adminDistrictName: string | undefined;
      let lsoa: string | undefined;
      let msoa: string | undefined;
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        const r = data.result;
        if (r) {
          lat = r.latitude;
          lng = r.longitude;
          town = r.admin_district;
          region = r.region;
          country = r.country;
          adminDistrictCode = r.codes?.admin_district;
          adminDistrictName = r.admin_district;
          lsoa = r.codes?.lsoa;
          msoa = r.codes?.msoa;
        }
      }

      if (addressParam) {
        const paonMatch = addressParam.match(/^(\d+[A-Z]?|\w+\s+House|Flat\s+\d+)/i);
        setResolvedAddress({
          fullAddress: addressParam,
          paon: paonMatch ? paonMatch[0] : undefined,
          postcode: formatPostcode(postcodeParam),
          lat, lng, town, region, country,
          adminDistrictCode, adminDistrictName, lsoa, msoa,
        });
        return;
      }

      const addrRes = await fetch(`/api/addresses?postcode=${encodeURIComponent(postcodeParam)}`);
      if (addrRes.ok) {
        const data: AddressesResponse = await addrRes.json();
        if (data.addresses && data.addresses.length > 0) {
          setPickerAddresses(data.addresses);
          return;
        }
      }
      setResolvedAddress({
        fullAddress: formatPostcode(postcodeParam),
        postcode: formatPostcode(postcodeParam),
        lat, lng, town, region, country,
        adminDistrictCode, adminDistrictName, lsoa, msoa,
      });
    }
    load().catch(() => setError("We couldn't look up that postcode. Try another one."));
  }, [postcodeParam, addressParam]);

  useEffect(() => {
    if (!resolvedAddress) return;
    setLoadingReport(true);
    setReport(null);
    fetch("/api/free-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: resolvedAddress }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: { report: FreeReport }) => setReport(data.report))
      .catch(() => setError("Free report build failed. Try refreshing."))
      .finally(() => setLoadingReport(false));
  }, [resolvedAddress]);

  if (!postcodeParam) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Enter a UK postcode or address to start</h1>
        <p className="mt-2 text-gray-600">We&apos;ll fetch your free report instantly.</p>
        <div className="mt-6"><PostcodeLookup /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-xl font-bold text-gray-900">{error}</h1>
        <div className="mt-6"><PostcodeLookup /></div>
      </div>
    );
  }

  if (!resolvedAddress && pickerAddresses) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Postcode {postcodeParam}</p>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">Pick the address</h1>
        <ul className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {pickerAddresses.slice(0, 30).map((addr) => (
            <li key={addr}>
              <button
                className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}&address=${encodeURIComponent(addr)}`)}
              >
                {addr}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <PostcodeLookup size="md" />
        </div>
      </div>
    );
  }

  if (!resolvedAddress) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-600">Loading address…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Free property report</p>
            <h1 className="mt-1 text-xl md:text-2xl font-extrabold text-gray-900">{resolvedAddress.fullAddress}</h1>
          </div>
          <button
            onClick={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}`)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
          >
            Change address
          </button>
        </div>
      </div>

      {loadingReport && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <svg className="mx-auto h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-gray-600">Building your free report from official UK government sources…</p>
        </div>
      )}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {report.priceHistory?.sales?.length ? (
              <ReportCard title="Sales history" subtitle="HM Land Registry">
                <ul className="space-y-1.5 text-sm">
                  {report.priceHistory.sales.slice(0, 5).map((s, i) => (
                    <li key={i} className="flex justify-between text-gray-700">
                      <span>{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      <span className="font-bold text-gray-900">£{s.price.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
                {report.priceHistory.postcodeMedian ? (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Postcode median: <span className="font-semibold text-gray-700">£{report.priceHistory.postcodeMedian.toLocaleString()}</span> ({report.priceHistory.postcodeSampleSize} sales)
                  </p>
                ) : null}
              </ReportCard>
            ) : null}

            {report.epc ? (
              <ReportCard title="Energy performance" subtitle="EPC Register">
                <div className="flex items-center gap-2 mb-3">
                  <RatingBadge rating={report.epc.rating} />
                  {report.epc.potentialRating && report.epc.potentialRating !== report.epc.rating && (
                    <span className="text-xs text-gray-500">→ potential {report.epc.potentialRating}</span>
                  )}
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {report.epc.buildYear ? <li>Build year: <span className="font-semibold">{report.epc.buildYear}</span></li> : null}
                  {report.epc.mainHeating ? <li>Heating: {report.epc.mainHeating}</li> : null}
                  {report.epc.totalFloorArea ? <li>Floor area: {report.epc.totalFloorArea} m²</li> : null}
                </ul>
              </ReportCard>
            ) : null}

            {report.councilTax?.authority ? (
              <ReportCard title="Council tax" subtitle="MHCLG 2026/27">
                {report.councilTax.band ? (
                  <p className="text-2xl font-extrabold text-gray-900">Band {report.councilTax.band}</p>
                ) : null}
                {report.councilTax.estimatedAnnualCost ? (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-bold">£{report.councilTax.estimatedAnnualCost.toLocaleString()}</span>
                    <span className="text-gray-500"> / year</span>
                  </p>
                ) : null}
                {report.councilTax.monthlyAmount ? (
                  <p className="text-xs text-gray-500">~£{report.councilTax.monthlyAmount} / month</p>
                ) : null}
                <p className="text-xs text-gray-500 mt-2">{report.councilTax.authority}</p>
              </ReportCard>
            ) : null}

            {report.flood ? (
              <ReportCard title="Flood risk" subtitle="Environment Agency">
                <div className="flex items-center gap-2 mb-2">
                  <FloodPill level={report.flood.riskLevel} />
                </div>
                <ul className="space-y-1 text-xs text-gray-600 mt-2">
                  {report.flood.inFloodZone3 ? <li>• In Flood Zone 3 (high risk)</li> : null}
                  {report.flood.inFloodZone2 && !report.flood.inFloodZone3 ? <li>• In Flood Zone 2 (medium risk)</li> : null}
                  {report.flood.nearbyWarnings.length > 0 ? <li>• {report.flood.nearbyWarnings.length} active warning{report.flood.nearbyWarnings.length === 1 ? "" : "s"} within 5km</li> : null}
                  {report.flood.riskLevel === "very-low" ? <li>• No flood zones or active warnings nearby</li> : null}
                </ul>
              </ReportCard>
            ) : null}

            {report.crime ? (
              <ReportCard title="Crime (12 months)" subtitle="data.police.uk">
                <p className="text-3xl font-extrabold text-gray-900">{report.crime.totalIncidents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mb-3">incidents within ~1 mile</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {report.crime.byCategory.slice(0, 4).map((c) => (
                    <li key={c.category} className="flex justify-between">
                      <span>{c.category}</span>
                      <span className="font-semibold text-gray-700">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </ReportCard>
            ) : null}

            {report.schools && report.schools.length > 0 ? (
              <ReportCard title="Closest schools" subtitle="GIAS / Ofsted">
                <ul className="space-y-1.5 text-sm">
                  {report.schools.slice(0, 5).map((s) => (
                    <li key={s.urn ?? s.name} className="flex flex-col gap-0.5">
                      <div className="flex justify-between gap-2">
                        <span className="truncate text-gray-800 font-medium">{s.name}</span>
                        <span className="text-xs text-gray-500 shrink-0">{s.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{s.phase}</span>
                        <span className={ratingTone(s.rating)}>{s.rating}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </ReportCard>
            ) : null}

            {report.broadband ? (
              <ReportCard title="Broadband" subtitle="Ofcom">
                <p className="text-3xl font-extrabold text-gray-900">
                  {report.broadband.averageDownload}<span className="text-base font-bold text-gray-500"> Mbps</span>
                </p>
                <p className="text-xs text-gray-500 mb-2">Average download</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {report.broadband.fullFibre && <Tag tone="emerald">Full fibre</Tag>}
                  {report.broadband.ultrafast && !report.broadband.fullFibre && <Tag tone="emerald">Ultrafast</Tag>}
                  {report.broadband.superfast && !report.broadband.ultrafast && <Tag tone="blue">Superfast</Tag>}
                </div>
                {report.broadband.providers && report.broadband.providers.length > 0 ? (
                  <p className="mt-3 text-xs text-gray-500">
                    {report.broadband.providers.slice(0, 4).map((p) => p.name).join(" · ")}
                  </p>
                ) : null}
              </ReportCard>
            ) : null}

            {report.mobile && report.mobile.operators.length > 0 ? (
              <ReportCard title="Mobile coverage" subtitle="Ofcom">
                <ul className="space-y-1.5 text-sm">
                  {report.mobile.operators.map((m) => (
                    <li key={m.name} className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{m.name}</span>
                      <div className="flex gap-1">
                        {m.outdoor4g && <Tag tone="blue">4G</Tag>}
                        {m.data5g && <Tag tone="emerald">5G</Tag>}
                      </div>
                    </li>
                  ))}
                </ul>
              </ReportCard>
            ) : null}

            {report.amenities && report.amenities.nearestSupermarket ? (
              <ReportCard title="Local amenities" subtitle="OpenStreetMap">
                <p className="text-base font-bold text-gray-900">{report.amenities.amenityScore}</p>
                <p className="text-xs text-gray-500 mb-2">amenity score</p>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>Nearest supermarket: <span className="font-semibold">{report.amenities.nearestSupermarket.name}</span> ({(report.amenities.nearestSupermarket.distance * 1000).toFixed(0)} m)</li>
                  <li>Convenience stores within 500m: <span className="font-semibold">{report.amenities.convenienceStores}</span></li>
                  <li>Supermarkets within 1.5 km: <span className="font-semibold">{report.amenities.supermarkets.length}</span></li>
                </ul>
              </ReportCard>
            ) : null}

            {report.transport ? (
              <ReportCard title="Transport connectivity" subtitle="DfT 2025">
                <p className="text-3xl font-extrabold text-gray-900">{report.transport.connectivityScore}<span className="text-base font-bold text-gray-500"> / 100</span></p>
                <p className="text-xs text-gray-500 mb-2">DfT connectivity score</p>
                <p className="text-xs text-gray-600 mt-1">
                  {report.transport.connectivityScore >= 75 ? "Excellent connectivity" :
                   report.transport.connectivityScore >= 50 ? "Good connectivity" :
                   report.transport.connectivityScore >= 25 ? "Moderate connectivity" : "Limited connectivity"}
                </p>
              </ReportCard>
            ) : null}

            {report.planning && (report.planning.constraints.length > 0 || report.planning.totalApps12m > 0) ? (
              <ReportCard title="Planning &amp; constraints" subtitle="planning.data.gov.uk">
                <ul className="space-y-1 text-xs text-gray-700">
                  {report.planning.inConservationArea ? <li>• In conservation area</li> : null}
                  {report.planning.inGreenBelt ? <li>• In green belt</li> : null}
                  {report.planning.hasArticle4 ? <li>• Article 4 direction applies</li> : null}
                  {report.planning.hasTPO ? <li>• Tree preservation order(s)</li> : null}
                  {report.planning.nearListedBuildings > 0 ? <li>• {report.planning.nearListedBuildings} listed building{report.planning.nearListedBuildings === 1 ? "" : "s"} nearby</li> : null}
                  {report.planning.totalApps12m > 0 ? (
                    <li>• {report.planning.totalApps12m} planning application{report.planning.totalApps12m === 1 ? "" : "s"} within 500m (12 months)</li>
                  ) : null}
                </ul>
                {report.planning.totalApps12m > 0 ? (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-base font-bold text-emerald-700">{report.planning.approvedApps}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Permitted</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-amber-700">{report.planning.pendingApps}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-red-700">{report.planning.rejectedApps}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rejected</p>
                    </div>
                  </div>
                ) : null}
              </ReportCard>
            ) : null}
          </div>

          <UpsellCard postcode={postcodeParam} address={resolvedAddress} />

          <p className="mt-6 text-xs text-gray-500 leading-relaxed">
            This free report is informational only and is not a substitute for formal conveyancing searches by a qualified solicitor. Contains HM Land Registry data &copy; Crown copyright and database right.
          </p>
        </>
      )}
    </div>
  );
}

function ReportCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function RatingBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const colors: Record<string, string> = {
    A: "bg-green-600", B: "bg-green-500", C: "bg-lime-500", D: "bg-yellow-500",
    E: "bg-orange-500", F: "bg-orange-600", G: "bg-red-600",
  };
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-white font-extrabold text-lg ${colors[rating] ?? "bg-gray-400"}`}>
      {rating}
    </span>
  );
}

function FloodPill({ level }: { level: string }) {
  const tone =
    level === "high" ? "bg-red-100 text-red-800 border-red-200"
    : level === "medium" ? "bg-amber-100 text-amber-800 border-amber-200"
    : level === "low" ? "bg-yellow-100 text-yellow-800 border-yellow-200"
    : "bg-emerald-100 text-emerald-800 border-emerald-200";
  const text =
    level === "very-low" ? "Very low risk"
    : level === "low" ? "Low risk"
    : level === "medium" ? "Medium risk"
    : level === "high" ? "High risk"
    : "Unknown";
  return <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${tone}`}>{text}</span>;
}

function Tag({ children, tone }: { children: React.ReactNode; tone: "blue" | "emerald" | "gray" }) {
  const cls = tone === "emerald"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : tone === "blue"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
  return <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>{children}</span>;
}

function ratingTone(rating: string | undefined): string {
  if (!rating) return "text-gray-500";
  if (rating === "Outstanding") return "text-emerald-700 font-semibold";
  if (rating === "Good") return "text-blue-700 font-semibold";
  if (rating === "Requires Improvement") return "text-amber-700 font-semibold";
  if (rating === "Inadequate") return "text-red-700 font-semibold";
  return "text-gray-500";
}

function UpsellCard({ postcode, address }: { postcode: string; address: PostcodeAddress }) {
  const [loading, setLoading] = useState<"standard" | "premium" | null>(null);

  async function buy(tier: "standard" | "premium") {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          postcode,
          uprn: address.uprn,
          fullAddress: address.fullAddress,
          attribution: getAttribution() ?? {},
        }),
      });
      if (!res.ok) throw new Error("checkout_failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 mt-8">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Unlock the full report</p>
        <p className="text-base font-bold mt-1">See everything your solicitor would charge £250+ to surface</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">STANDARD</span>
            <p className="mt-2 text-2xl font-extrabold text-gray-900">£14.99</p>
            <ul className="mt-3 space-y-1 text-xs text-gray-700">
              <li>★ Full planning history within 250m, last 5 years</li>
              <li>★ Restrictive covenants flag (HMLR)</li>
              <li>★ Coal mining, radon, subsidence flags</li>
              <li>★ Detailed flood: surface water + groundwater</li>
              <li>★ Air quality + noise</li>
              <li>★ Sold comparables &amp; market trend</li>
              <li>★ Signed PDF + permanent online URL</li>
            </ul>
            <button
              onClick={() => buy("standard")}
              disabled={!!loading}
              className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading === "standard" ? "Redirecting…" : "Get Standard · £14.99"}
            </button>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-xs font-bold">PREMIUM</span>
            <p className="mt-2 text-2xl font-extrabold text-gray-900">£29.99</p>
            <ul className="mt-3 space-y-1 text-xs text-gray-800 font-medium">
              <li>★ Standard plus...</li>
              <li>★ Live HM Land Registry title register</li>
              <li>★ Lease length + tenure analysis</li>
              <li>★ Climate-projected flood risk (2050)</li>
              <li>★ AI buyer&apos;s verdict + red-flag narrative</li>
              <li>★ Solar PV potential estimate</li>
              <li>★ 5-year price forecast</li>
            </ul>
            <button
              onClick={() => buy("premium")}
              disabled={!!loading}
              className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {loading === "premium" ? "Redirecting…" : "Get Premium · £29.99"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
