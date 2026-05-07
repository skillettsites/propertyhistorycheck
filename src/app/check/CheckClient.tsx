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

  // Resolve postcode + address into a PostcodeAddress with lat/lng
  useEffect(() => {
    if (!postcodeParam) return;
    setError(null);

    const formatPostcode = (pc: string) => {
      const c = pc.replace(/\s+/g, "").toUpperCase();
      if (c.length < 5) return c;
      return `${c.slice(0, -3)} ${c.slice(-3)}`;
    };

    async function load() {
      // Geocode postcode → lat/lng + admin district via postcodes.io
      const lookupRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcodeParam.replace(/\s+/g, ""))}`);
      let lat: number | undefined;
      let lng: number | undefined;
      let town: string | undefined;
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        lat = data.result?.latitude;
        lng = data.result?.longitude;
        town = data.result?.admin_district;
      }

      if (addressParam) {
        // Address came from Google Places or address picker — use it directly
        const paonMatch = addressParam.match(/^(\d+[A-Z]?|\w+\s+House|Flat\s+\d+)/i);
        setResolvedAddress({
          fullAddress: addressParam,
          paon: paonMatch ? paonMatch[0] : undefined,
          postcode: formatPostcode(postcodeParam),
          lat, lng, town,
        });
        return;
      }

      // Fetch address list for picker
      const addrRes = await fetch(`/api/addresses?postcode=${encodeURIComponent(postcodeParam)}`);
      if (addrRes.ok) {
        const data: AddressesResponse = await addrRes.json();
        if (data.addresses && data.addresses.length > 0) {
          setPickerAddresses(data.addresses);
          return;
        }
      }
      // No addresses — proceed with postcode only
      setResolvedAddress({
        fullAddress: formatPostcode(postcodeParam),
        postcode: formatPostcode(postcodeParam),
        lat, lng, town,
      });
    }
    load().catch(() => setError("We couldn't look up that postcode. Try another one."));
  }, [postcodeParam, addressParam]);

  // Once address resolved, build free report
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

  // No postcode in URL: prompt for one
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

  // Show address picker
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
      {/* Headline panel */}
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
          <p className="mt-3 text-sm text-gray-600">Building your free report from 6 official UK sources…</p>
        </div>
      )}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard title="Sales history" subtitle="HM Land Registry">
              {report.priceHistory?.sales?.length ? (
                <ul className="space-y-1.5 text-sm">
                  {report.priceHistory.sales.slice(0, 5).map((s, i) => (
                    <li key={i} className="flex justify-between text-gray-700">
                      <span>{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      <span className="font-bold text-gray-900">£{s.price.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No recorded sales for this postcode since 1995.</Empty>
              )}
              {report.priceHistory?.postcodeMedian ? (
                <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Postcode median: <span className="font-semibold text-gray-700">£{report.priceHistory.postcodeMedian.toLocaleString()}</span> ({report.priceHistory.postcodeSampleSize} sales)
                </p>
              ) : null}
            </ReportCard>

            <ReportCard title="Energy performance" subtitle="EPC Register">
              {report.epc ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <RatingBadge rating={report.epc.rating} />
                    {report.epc.potentialRating && report.epc.potentialRating !== report.epc.rating && (
                      <span className="text-xs text-gray-500">→ potential {report.epc.potentialRating}</span>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {report.epc.buildYear && <li>Build year: <span className="font-semibold">{report.epc.buildYear}</span></li>}
                    {report.epc.mainHeating && <li>Heating: {report.epc.mainHeating}</li>}
                    {report.epc.totalFloorArea && <li>Floor area: {report.epc.totalFloorArea} m²</li>}
                  </ul>
                </>
              ) : (
                <Empty>No EPC certificate found.</Empty>
              )}
            </ReportCard>

            <ReportCard title="Council tax" subtitle="VOA / authority">
              {report.councilTax?.authority ? (
                <>
                  {report.councilTax.band ? (
                    <p className="text-2xl font-extrabold text-gray-900">Band {report.councilTax.band}</p>
                  ) : (
                    <p className="text-sm text-gray-700"><span className="font-semibold">{report.councilTax.authority}</span></p>
                  )}
                  {report.councilTax.estimatedAnnualCost ? (
                    <p className="text-sm text-gray-600">Approx. <span className="font-semibold">£{report.councilTax.estimatedAnnualCost.toLocaleString()}</span> / year</p>
                  ) : null}
                  {!report.councilTax.band && (
                    <p className="text-xs text-gray-500 mt-2">
                      <a className="text-blue-600 hover:underline" href="https://www.gov.uk/council-tax-bands" target="_blank" rel="noreferrer">Check exact band at gov.uk →</a>
                    </p>
                  )}
                </>
              ) : (
                <Empty>Council tax data unavailable.</Empty>
              )}
            </ReportCard>

            <ReportCard title="Flood risk" subtitle="Environment Agency">
              {report.flood ? (
                <>
                  <FloodBand label="Rivers and sea" band={report.flood.riversAndSea} />
                  <FloodBand label="Surface water" band={report.flood.surfaceWater} />
                  <p className="mt-3 text-xs text-gray-500">Premium adds 2050 climate-projected risk.</p>
                </>
              ) : (
                <>
                  <Empty>Detailed flood band is in the Standard report.</Empty>
                  <p className="text-xs text-gray-500 mt-2">
                    <a className="text-blue-600 hover:underline" href={`https://check-long-term-flood-risk.service.gov.uk/postcode?postcode=${encodeURIComponent(postcodeParam)}`} target="_blank" rel="noreferrer">Check long-term flood risk →</a>
                  </p>
                </>
              )}
            </ReportCard>

            <ReportCard title="Crime (12 months)" subtitle="data.police.uk">
              {report.crime ? (
                <>
                  <p className="text-3xl font-extrabold text-gray-900">{report.crime.totalIncidents}</p>
                  <p className="text-xs text-gray-500 mb-3">incidents within ~1 mile</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {report.crime.byCategory.slice(0, 4).map((c) => (
                      <li key={c.category} className="flex justify-between">
                        <span>{c.category}</span>
                        <span className="font-semibold text-gray-700">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Empty>Crime data unavailable.</Empty>
              )}
            </ReportCard>

            <ReportCard title="Closest schools" subtitle="GIAS / Ofsted">
              {report.schools && report.schools.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {report.schools.slice(0, 4).map((s) => (
                    <li key={s.urn ?? s.name} className="flex justify-between gap-2">
                      <span className="truncate text-gray-800">{s.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{s.distanceMiles}mi {s.ofstedRating ? `· ${s.ofstedRating.charAt(0)}` : ""}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <Empty>School data is in the Standard report.</Empty>
                  <p className="text-xs text-gray-500 mt-2">
                    <a className="text-blue-600 hover:underline" href={`https://www.get-information-schools.service.gov.uk/Search?SelectedTab=Establishments&SearchType=ByLocation&Postcode=${encodeURIComponent(postcodeParam)}`} target="_blank" rel="noreferrer">Search GIAS for {postcodeParam} →</a>
                  </p>
                </>
              )}
            </ReportCard>

            <ReportCard title="Broadband" subtitle="Ofcom">
              {report.broadband ? (
                <>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {report.broadband.maxDownloadMbps?.toLocaleString() ?? "—"}<span className="text-base font-bold text-gray-500"> Mbps</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-2">Max download available</p>
                  {report.broadband.fttpAvailable && (
                    <p className="text-xs text-emerald-600 font-semibold">✓ FTTP available</p>
                  )}
                </>
              ) : (
                <>
                  <Empty>Broadband detail is in the Standard report.</Empty>
                  <p className="text-xs text-gray-500 mt-2">
                    <a className="text-blue-600 hover:underline" href={`https://checker.ofcom.org.uk/en-gb/broadband-coverage/results?pc=${encodeURIComponent(postcodeParam)}`} target="_blank" rel="noreferrer">Check at Ofcom →</a>
                  </p>
                </>
              )}
            </ReportCard>

            <ReportCard title="Mobile coverage" subtitle="Ofcom">
              {report.mobile && report.mobile.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {report.mobile.map((m) => (
                    <li key={m.network} className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{m.network}</span>
                      <span className="text-xs text-gray-500">{m.data5g === "good" ? "5G" : m.data4g === "good" ? "4G ✓" : "limited"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <Empty>Mobile coverage detail is in the Standard report.</Empty>
                  <p className="text-xs text-gray-500 mt-2">
                    <a className="text-blue-600 hover:underline" href={`https://checker.ofcom.org.uk/en-gb/mobile-coverage/results?pc=${encodeURIComponent(postcodeParam)}`} target="_blank" rel="noreferrer">Check at Ofcom →</a>
                  </p>
                </>
              )}
            </ReportCard>
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

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 italic">{children}</p>;
}

function RatingBadge({ rating }: { rating?: string }) {
  if (!rating) return null;
  const colors: Record<string, string> = {
    A: "bg-green-600",
    B: "bg-green-500",
    C: "bg-lime-500",
    D: "bg-yellow-500",
    E: "bg-orange-500",
    F: "bg-orange-600",
    G: "bg-red-600",
  };
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-white font-extrabold text-lg ${colors[rating] ?? "bg-gray-400"}`}>
      {rating}
    </span>
  );
}

function FloodBand({ label, band }: { label: string; band: string }) {
  const tone =
    band === "high" ? "text-red-700 bg-red-50 border-red-200"
    : band === "medium" ? "text-amber-700 bg-amber-50 border-amber-200"
    : band === "low" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : band === "very_low" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : "text-gray-700 bg-gray-50 border-gray-200";
  const labelText = band === "very_low" ? "Very low" : band === "unknown" ? "Unknown" : band.charAt(0).toUpperCase() + band.slice(1);
  return (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-gray-700">{label}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tone}`}>{labelText}</span>
    </div>
  );
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
              <li>✓ Full flood risk (rivers/sea/surface)</li>
              <li>✓ Listed building + conservation flags</li>
              <li>✓ Restrictive covenants flag</li>
              <li>✓ Mining + radon flags</li>
              <li>✓ Signed PDF + permanent online URL</li>
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
              <li>★ AI buyer&apos;s verdict</li>
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
        <p className="text-xs text-gray-500 text-center">14-day refund guarantee. Premium tier&apos;s live HMLR title (£7 wholesale) is non-refundable once ordered; everything else is fully refundable.</p>
      </div>
    </div>
  );
}
