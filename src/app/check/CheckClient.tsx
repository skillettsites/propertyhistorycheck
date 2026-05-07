"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttribution, getAttribution } from "@/lib/tracking";
import PostcodeLookup from "@/components/PostcodeLookup";
import PropertyMap from "@/components/PropertyMapClient";
import MiniBarChart from "@/components/MiniBarChart";
import EpcLadder from "@/components/EpcLadder";
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
      let lat: number | undefined, lng: number | undefined;
      let town: string | undefined, region: string | undefined, country: string | undefined;
      let adminDistrictCode: string | undefined, adminDistrictName: string | undefined;
      let lsoa: string | undefined, msoa: string | undefined;
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        const r = data.result;
        if (r) {
          lat = r.latitude; lng = r.longitude;
          town = r.admin_district; region = r.region; country = r.country;
          adminDistrictCode = r.codes?.admin_district;
          adminDistrictName = r.admin_district;
          lsoa = r.codes?.lsoa; msoa = r.codes?.msoa;
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
        const valid = (data.addresses ?? []).filter((a) => a && a.trim().length > 2);
        if (valid.length > 0) {
          setPickerAddresses(valid);
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
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">Pick the exact address</h1>
        <p className="mt-2 text-sm text-gray-600">{pickerAddresses.length} addresses found in this postcode.</p>
        <ul className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {pickerAddresses.slice(0, 50).map((addr) => (
            <li key={addr}>
              <button className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}&address=${encodeURIComponent(addr)}`)}>
                {addr}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <button onClick={() => { setPickerAddresses(null); setResolvedAddress({ fullAddress: postcodeParam, postcode: postcodeParam }); }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            My address isn&apos;t listed — show postcode-level report instead &rarr;
          </button>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Or search a different address:</p>
          <PostcodeLookup size="md" />
        </div>
      </div>
    );
  }
  if (!resolvedAddress) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-600">Loading address…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ReportHeader address={resolvedAddress} onChange={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}`)} />
      {loadingReport && <Skeleton />}
      {report && (
        <>
          <FlagsBar report={report} />
          <PremiumUpsell postcode={postcodeParam} address={resolvedAddress} alertsCount={countAlerts(report)} />
          <PropertyEssentials report={report} />
          <RisksSection report={report} />
          <LocalContextSection report={report} />
          <DataSourcesNote />
        </>
      )}
    </div>
  );
}

function ReportHeader({ address, onChange }: { address: PostcodeAddress; onChange: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Free property report</p>
          <h1 className="mt-1 text-xl md:text-2xl font-extrabold text-gray-900">{address.fullAddress}</h1>
          <p className="mt-1 text-xs text-gray-500">
            {address.adminDistrictName ?? ""}{address.region ? ` · ${address.region}` : ""}{address.country ? ` · ${address.country}` : ""}
          </p>
        </div>
        <button onClick={onChange} className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto">
          Change address
        </button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
      <svg className="mx-auto h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="mt-3 text-sm text-gray-600">Building your free report from official UK government sources…</p>
    </div>
  );
}

function FlagsBar({ report }: { report: FreeReport }) {
  const flags: Array<{ tone: "red" | "amber" | "blue" | "green"; label: string }> = [];
  if (report.flood?.riskLevel === "high") flags.push({ tone: "red", label: "High flood risk" });
  else if (report.flood?.riskLevel === "medium") flags.push({ tone: "amber", label: "Medium flood risk" });
  if (report.epc?.rating && ["E", "F", "G"].includes(report.epc.rating)) flags.push({ tone: "amber", label: `EPC ${report.epc.rating} (low)` });
  if (report.planning?.inConservationArea) flags.push({ tone: "blue", label: "Conservation area" });
  if (report.planning?.hasArticle4) flags.push({ tone: "blue", label: "Article 4 direction" });
  if ((report.planning?.nearListedBuildings ?? 0) > 0) flags.push({ tone: "blue", label: `${report.planning!.nearListedBuildings} listed building${report.planning!.nearListedBuildings === 1 ? "" : "s"} nearby` });
  if (report.planning?.hasTPO) flags.push({ tone: "blue", label: "Tree preservation order" });
  if ((report.planning?.totalApps12m ?? 0) > 5) flags.push({ tone: "amber", label: `${report.planning!.totalApps12m} planning apps in 12 months` });
  if (report.crime && report.crime.totalIncidents > 3000) flags.push({ tone: "amber", label: "High crime volume" });
  if (report.broadband?.fullFibre) flags.push({ tone: "green", label: "Full fibre available" });
  if (report.epc?.rating && ["A", "B"].includes(report.epc.rating)) flags.push({ tone: "green", label: `EPC ${report.epc.rating} (excellent)` });
  if (flags.length === 0) return null;
  const toneClass = (t: string) =>
    t === "red" ? "bg-red-50 text-red-700 border-red-200"
    : t === "amber" ? "bg-amber-50 text-amber-700 border-amber-200"
    : t === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key findings</p>
      <div className="flex flex-wrap gap-2">
        {flags.map((f) => (
          <span key={f.label} className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${toneClass(f.tone)}`}>
            {f.tone === "red" || f.tone === "amber" ? "⚠ " : ""}{f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function countAlerts(report: FreeReport): number {
  let count = 0;
  if (report.flood?.riskLevel === "high" || report.flood?.riskLevel === "medium") count++;
  if (report.epc?.rating && ["E", "F", "G"].includes(report.epc.rating)) count++;
  if (report.planning?.inConservationArea) count++;
  if (report.planning?.hasArticle4) count++;
  if ((report.planning?.nearListedBuildings ?? 0) > 0) count++;
  if ((report.planning?.totalApps12m ?? 0) > 5) count++;
  if (report.crime && report.crime.totalIncidents > 3000) count++;
  return count;
}

function PremiumUpsell({ postcode, address, alertsCount }: { postcode: string; address: PostcodeAddress; alertsCount: number }) {
  const [loading, setLoading] = useState<"standard" | "premium" | null>(null);
  async function buy(tier: "standard" | "premium") {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, postcode, uprn: address.uprn, fullAddress: address.fullAddress, attribution: getAttribution() ?? {} }),
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-5 py-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Unlock the full report</p>
        <p className="text-base font-bold mt-1">
          {alertsCount > 0
            ? `We found ${alertsCount} item${alertsCount === 1 ? "" : "s"} worth investigating in depth.`
            : "Everything else your solicitor would charge £250+ to surface."}
        </p>
      </div>
      <div className="p-5">
        {alertsCount > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-600 text-sm flex-shrink-0">⚠</span>
            <p className="text-xs text-gray-700">
              <span className="font-bold">Why upgrade for this property:</span>{" "}
              we&apos;ve flagged {alertsCount} risk{alertsCount === 1 ? "" : "s"} above. The Premium report runs the live HM Land Registry title pull, full title-plan analysis, and an AI-generated red-flag narrative for this address.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <button onClick={() => buy("standard")} disabled={!!loading}
              className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading === "standard" ? "Redirecting…" : "Get Standard · £14.99"}
            </button>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 relative">
            <span className="absolute -top-2 right-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">Most popular</span>
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
            <button onClick={() => buy("premium")} disabled={!!loading}
              className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
              {loading === "premium" ? "Redirecting…" : "Get Premium · £29.99"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyEssentials({ report }: { report: FreeReport }) {
  return (
    <Section title="Property essentials" subtitle="Sales, energy &amp; tax">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {report.priceHistory?.sales?.length ? <SalesCard history={report.priceHistory} /> : null}
        {report.epc ? <EpcCard epc={report.epc} /> : null}
        {report.councilTax?.authority ? <CouncilTaxCard ct={report.councilTax} /> : null}
      </div>
    </Section>
  );
}

function RisksSection({ report }: { report: FreeReport }) {
  const lat = report.property.lat;
  const lng = report.property.lng;
  if (!lat || !lng) return null;
  return (
    <Section title="Risks &amp; constraints" subtitle="Flood, planning, crime">
      <div className="grid gap-4 lg:grid-cols-2">
        {report.flood ? <FloodCard flood={report.flood} lat={lat} lng={lng} /> : null}
        {report.crime ? <CrimeCard crime={report.crime} lat={lat} lng={lng} /> : null}
        {report.planning && (report.planning.constraints.length > 0 || report.planning.totalApps12m > 0) ? (
          <PlanningCard planning={report.planning} />
        ) : null}
      </div>
    </Section>
  );
}

function LocalContextSection({ report }: { report: FreeReport }) {
  const lat = report.property.lat;
  const lng = report.property.lng;
  return (
    <Section title="Local context" subtitle="Schools, amenities, connectivity">
      <div className="grid gap-4 lg:grid-cols-2">
        {report.schools && report.schools.length > 0 && lat && lng ? <SchoolsCard schools={report.schools} lat={lat} lng={lng} /> : null}
        {report.amenities && report.amenities.nearestSupermarket ? <AmenitiesCard amenities={report.amenities} /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {report.broadband ? <BroadbandCard broadband={report.broadband} /> : null}
        {report.mobile && report.mobile.operators.length > 0 ? <MobileCard mobile={report.mobile} /> : null}
        {report.transport ? <TransportCard transport={report.transport} /> : null}
      </div>
    </Section>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm ${className}`}>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {subtitle ? <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SalesCard({ history }: { history: NonNullable<FreeReport["priceHistory"]> }) {
  const sortedAsc = [...history.sales].sort((a, b) => a.date.localeCompare(b.date));
  const bars = sortedAsc.slice(-12).map((s, i, arr) => ({
    label: new Date(s.date).getFullYear().toString(),
    value: s.price,
    highlight: i === arr.length - 1,
  }));
  const latest = sortedAsc[sortedAsc.length - 1];
  return (
    <Card title="Sales history" subtitle="HM Land Registry">
      {latest ? (
        <>
          <p className="text-3xl font-extrabold text-gray-900">£{latest.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mb-3">last sold {new Date(latest.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          <MiniBarChart bars={bars} formatValue={(v) => `£${v.toLocaleString()}`} height={70} />
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            {history.sales.slice(0, 5).map((s, i) => (
              <li key={i} className="flex justify-between">
                <span>{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                <span className="font-semibold text-gray-700">£{s.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {history.postcodeMedian ? (
            <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Postcode median: <span className="font-semibold text-gray-700">£{history.postcodeMedian.toLocaleString()}</span> ({history.postcodeSampleSize} sales)
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

function EpcCard({ epc }: { epc: NonNullable<FreeReport["epc"]> }) {
  return (
    <Card title="Energy performance" subtitle="EPC Register">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Current</p>
          <p className="text-2xl font-extrabold text-gray-900">{epc.rating ?? "—"}</p>
        </div>
        {epc.potentialRating ? (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Potential</p>
            <p className="text-2xl font-extrabold text-gray-900">{epc.potentialRating}</p>
          </div>
        ) : null}
      </div>
      <EpcLadder current={epc.rating} potential={epc.potentialRating} />
      <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
        {epc.buildYear ? <li className="flex justify-between"><span>Build year</span><span className="font-semibold text-gray-700">{epc.buildYear}</span></li> : null}
        {epc.totalFloorArea ? <li className="flex justify-between"><span>Floor area</span><span className="font-semibold text-gray-700">{epc.totalFloorArea} m²</span></li> : null}
        {epc.mainHeating ? <li className="flex justify-between"><span>Heating</span><span className="font-semibold text-gray-700 truncate ml-2">{epc.mainHeating}</span></li> : null}
        {epc.inspectionDate ? <li className="flex justify-between"><span>Inspected</span><span className="font-semibold text-gray-700">{new Date(epc.inspectionDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span></li> : null}
      </ul>
    </Card>
  );
}

function CouncilTaxCard({ ct }: { ct: NonNullable<FreeReport["councilTax"]> }) {
  return (
    <Card title="Council tax" subtitle="MHCLG 2026/27">
      {ct.band ? <p className="text-3xl font-extrabold text-gray-900">Band {ct.band}</p> : null}
      {ct.estimatedAnnualCost ? (
        <p className="text-sm text-gray-700 mt-1"><span className="font-bold">£{ct.estimatedAnnualCost.toLocaleString()}</span><span className="text-gray-500"> / year</span></p>
      ) : null}
      {ct.monthlyAmount ? <p className="text-xs text-gray-500">~£{ct.monthlyAmount} / month</p> : null}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <p className="text-gray-700 font-semibold">{ct.authority}</p>
        {ct.source ? <p className="mt-1 text-gray-500">{ct.source}</p> : null}
      </div>
    </Card>
  );
}

function FloodCard({ flood, lat, lng }: { flood: NonNullable<FreeReport["flood"]>; lat: number; lng: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [polygons, setPolygons] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/flood-polygons?lat=${lat}&lng=${lng}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPolygons(d))
      .catch(() => undefined);
  }, [lat, lng]);
  const tone =
    flood.riskLevel === "high" ? "bg-red-50 border-red-200 text-red-700"
    : flood.riskLevel === "medium" ? "bg-amber-50 border-amber-200 text-amber-700"
    : flood.riskLevel === "low" ? "bg-yellow-50 border-yellow-200 text-yellow-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";
  const label =
    flood.riskLevel === "very-low" ? "Very low risk"
    : flood.riskLevel === "low" ? "Low risk"
    : flood.riskLevel === "medium" ? "Medium risk"
    : flood.riskLevel === "high" ? "High risk" : "Unknown";
  return (
    <Card title="Flood risk" subtitle="Environment Agency">
      <div className="flex items-center gap-3 mb-3">
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${tone}`}>{label}</span>
        {flood.inFloodZone3 ? <span className="text-xs text-red-700 font-semibold">Flood Zone 3</span>
        : flood.inFloodZone2 ? <span className="text-xs text-amber-700 font-semibold">Flood Zone 2</span> : null}
      </div>
      <PropertyMap lat={lat} lng={lng} zoom={14} height={220}
        geojson={polygons?.features?.length ? polygons : undefined}
        geojsonStyle={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.35 }} />
      {flood.nearbyWarnings.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">Active warnings within 5km</p>
          <ul className="space-y-1 text-xs text-gray-600">
            {flood.nearbyWarnings.slice(0, 3).map((w) => <li key={w.id}>• {w.description || w.message}</li>)}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-gray-500">Surface water, groundwater + 2050 climate-projected flood risk in the Standard report.</p>
    </Card>
  );
}

function CrimeCard({ crime, lat, lng }: { crime: NonNullable<FreeReport["crime"]>; lat: number; lng: number }) {
  const top6 = crime.byCategory.slice(0, 6);
  const bars = top6.map((c) => ({ label: c.category.split(" ")[0].slice(0, 8), value: c.count }));
  return (
    <Card title="Crime (12 months)" subtitle="data.police.uk">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-extrabold text-gray-900">{crime.totalIncidents.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mb-3">incidents within ~1 mile</p>
          <ul className="space-y-1 text-xs text-gray-600">
            {top6.slice(0, 5).map((c) => (
              <li key={c.category} className="flex justify-between">
                <span className="truncate pr-2">{c.category}</span>
                <span className="font-semibold text-gray-700">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <PropertyMap lat={lat} lng={lng} zoom={14} height={180} radius={1609} />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-700 mb-2">Breakdown by category</p>
        <MiniBarChart bars={bars} height={50} />
      </div>
    </Card>
  );
}

function PlanningCard({ planning }: { planning: NonNullable<FreeReport["planning"]> }) {
  return (
    <Card title="Planning &amp; constraints" subtitle="planning.data.gov.uk">
      {planning.constraints.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {planning.inConservationArea && <Pill tone="blue">Conservation area</Pill>}
          {planning.inGreenBelt && <Pill tone="emerald">Green belt</Pill>}
          {planning.hasArticle4 && <Pill tone="blue">Article 4 direction</Pill>}
          {planning.hasTPO && <Pill tone="blue">TPO applies</Pill>}
          {planning.nearListedBuildings > 0 && <Pill tone="amber">{planning.nearListedBuildings} listed nearby</Pill>}
        </div>
      ) : null}
      {planning.totalApps12m > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <Stat n={planning.approvedApps} label="Permitted" tone="emerald" />
            <Stat n={planning.pendingApps} label="Pending" tone="amber" />
            <Stat n={planning.rejectedApps} label="Rejected" tone="red" />
          </div>
          <p className="text-xs text-gray-500 mb-2">{planning.totalApps12m} applications within 500m, last 12 months</p>
          <ul className="space-y-1.5 text-xs text-gray-700 max-h-48 overflow-auto pr-1">
            {planning.applications.slice(0, 8).map((a) => (
              <li key={a.reference} className="border-b border-gray-100 pb-1.5 last:border-0">
                <p className="font-semibold text-gray-800 truncate">{a.address || a.reference}</p>
                <p className="text-[11px] text-gray-600 line-clamp-2">{a.description}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  <span className={statusToneClass(a.status)}>{a.status}</span> · {a.distance}m · {a.dateReceived}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-xs text-gray-500">No planning applications in the last 12 months within 500m.</p>
      )}
    </Card>
  );
}

function SchoolsCard({ schools, lat, lng }: { schools: NonNullable<FreeReport["schools"]>; lat: number; lng: number }) {
  const pins = schools.filter((s) => s.latitude && s.longitude).map((s) => ({
    name: s.name, lat: s.latitude!, lng: s.longitude!,
    rating: s.rating, phase: s.phase, distance: s.distance,
  }));
  return (
    <Card title="Schools nearby" subtitle="GIAS / Ofsted">
      <PropertyMap lat={lat} lng={lng} zoom={13} height={220} schools={pins.slice(0, 12)} />
      <ul className="mt-3 space-y-1.5 text-sm max-h-56 overflow-auto pr-1">
        {schools.slice(0, 8).map((s) => (
          <li key={s.urn ?? s.name} className="flex justify-between gap-2 border-b border-gray-100 pb-1.5 last:border-0">
            <div className="min-w-0">
              <span className="block truncate text-gray-800 font-medium text-xs">{s.name}</span>
              <span className="block text-[11px] text-gray-500">{s.phase}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-[11px] text-gray-500">{s.distance.toFixed(1)} km</span>
              <span className={`block text-[11px] ${ratingTone(s.rating)}`}>{s.rating}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AmenitiesCard({ amenities }: { amenities: NonNullable<FreeReport["amenities"]> }) {
  return (
    <Card title="Local amenities" subtitle="OpenStreetMap">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-2xl font-extrabold text-gray-900">{amenities.amenityScore}</p>
        <p className="text-xs text-gray-500">amenity score</p>
      </div>
      {amenities.nearestSupermarket ? (
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest supermarket</p>
          <p className="text-sm text-gray-800 font-semibold">{amenities.nearestSupermarket.name}</p>
          <p className="text-xs text-gray-500">{(amenities.nearestSupermarket.distance * 1000).toFixed(0)}m away</p>
        </div>
      ) : null}
      <ul className="text-xs text-gray-700 space-y-1">
        <li className="flex justify-between"><span>Supermarkets &lt; 1.5 km</span><span className="font-semibold">{amenities.supermarkets.length}</span></li>
        <li className="flex justify-between"><span>Convenience stores &lt; 500 m</span><span className="font-semibold">{amenities.convenienceStores}</span></li>
      </ul>
      {amenities.supermarkets.length > 0 ? (
        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
          {amenities.supermarkets.slice(0, 5).map((s) => (
            <li key={s.name} className="flex justify-between">
              <span className="truncate pr-2">{s.name}</span>
              <span className="text-gray-500 shrink-0">{(s.distance * 1000).toFixed(0)}m</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

function BroadbandCard({ broadband }: { broadband: NonNullable<FreeReport["broadband"]> }) {
  return (
    <Card title="Broadband" subtitle="Ofcom">
      <p className="text-3xl font-extrabold text-gray-900">{broadband.averageDownload}<span className="text-base font-bold text-gray-500"> Mbps</span></p>
      <p className="text-xs text-gray-500 mb-2">Average download · {broadband.averageUpload} Mbps up</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {broadband.fullFibre && <Pill tone="emerald">Full fibre</Pill>}
        {broadband.ultrafast && !broadband.fullFibre && <Pill tone="emerald">Ultrafast</Pill>}
        {broadband.superfast && !broadband.ultrafast && <Pill tone="blue">Superfast</Pill>}
      </div>
      {broadband.providers.length > 0 ? (
        <ul className="text-xs space-y-1 mt-2 pt-3 border-t border-gray-100">
          {broadband.providers.slice(0, 6).map((p) => (
            <li key={p.name} className="flex justify-between">
              <span className="text-gray-700">{p.name}</span>
              <span className="text-gray-500">{p.maxDownload} Mbps {p.fibre ? "FTTP" : p.cable ? "Cable" : ""}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

function MobileCard({ mobile }: { mobile: NonNullable<FreeReport["mobile"]> }) {
  return (
    <Card title="Mobile coverage" subtitle="Ofcom">
      <p className="text-3xl font-extrabold text-gray-900">{mobile.overallScore}<span className="text-base font-bold text-gray-500"> /100</span></p>
      <p className="text-xs text-gray-500 mb-3">overall coverage score</p>
      <ul className="space-y-1.5 text-sm">
        {mobile.operators.map((m) => (
          <li key={m.name} className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">{m.name}</span>
            <div className="flex gap-1">
              {m.indoor4g && <Pill tone="blue">4G in</Pill>}
              {m.outdoor4g && !m.indoor4g && <Pill tone="blue">4G out</Pill>}
              {m.data5g && <Pill tone="emerald">5G</Pill>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TransportCard({ transport }: { transport: NonNullable<FreeReport["transport"]> }) {
  const verdict =
    transport.connectivityScore >= 75 ? "Excellent connectivity"
    : transport.connectivityScore >= 50 ? "Good connectivity"
    : transport.connectivityScore >= 25 ? "Moderate connectivity"
    : "Limited connectivity";
  return (
    <Card title="Transport" subtitle="DfT 2025">
      <p className="text-3xl font-extrabold text-gray-900">{transport.connectivityScore}<span className="text-base font-bold text-gray-500"> /100</span></p>
      <p className="text-xs text-gray-500 mb-3">DfT connectivity score</p>
      <p className="text-xs text-gray-700">{verdict}</p>
      <p className="text-[10px] text-gray-400 mt-2">LSOA {transport.lsoa}</p>
    </Card>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "blue" | "emerald" | "amber" | "red" | "gray" }) {
  const map: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[tone]}`}>{children}</span>;
}

function Stat({ n, label, tone }: { n: number; label: string; tone: "emerald" | "amber" | "red" }) {
  const colour = tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-red-700";
  return (
    <div className="rounded-lg bg-gray-50 py-2">
      <p className={`text-base font-extrabold ${colour}`}>{n}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function statusToneClass(status: string): string {
  if (status === "Permitted") return "text-emerald-700 font-semibold";
  if (status === "Rejected") return "text-red-700 font-semibold";
  if (status === "Pending") return "text-amber-700 font-semibold";
  return "text-gray-600 font-semibold";
}

function ratingTone(rating: string | undefined): string {
  if (!rating) return "text-gray-500";
  if (rating === "Outstanding") return "text-emerald-700 font-semibold";
  if (rating === "Good") return "text-blue-700 font-semibold";
  if (rating === "Requires Improvement") return "text-amber-700 font-semibold";
  if (rating === "Inadequate") return "text-red-700 font-semibold";
  return "text-gray-500";
}

function DataSourcesNote() {
  return (
    <p className="mt-6 text-xs text-gray-500 leading-relaxed">
      This free report is informational only and is not a substitute for formal conveyancing searches by a qualified solicitor. Contains HM Land Registry data &copy; Crown copyright and database right. Powered by data.police.uk, Environment Agency, MHCLG, planning.data.gov.uk, GIAS, Ofcom and OpenStreetMap under the Open Government Licence v3.0.
    </p>
  );
}
