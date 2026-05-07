"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttribution, getAttribution } from "@/lib/tracking";
import PostcodeLookup from "@/components/PostcodeLookup";
import PropertyMap from "@/components/PropertyMapClient";
import MiniBarChart from "@/components/MiniBarChart";
import EpcLadder from "@/components/EpcLadder";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import { buildInitialAssessment } from "@/lib/verdict";
import { estimatePropertyValue } from "@/lib/estimateValue";
import type { FreeReport, PostcodeAddress } from "@/lib/types";

interface AddressesResponse { postcode: string; addresses: string[]; }

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

  useEffect(() => { captureAttribution(); }, []);

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
        if (valid.length > 0) { setPickerAddresses(valid); return; }
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
      method: "POST", headers: { "Content-Type": "application/json" },
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
  if (!resolvedAddress) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-600">Loading address…</div>;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
      {loadingReport && <Skeleton />}
      {report && (
        <>
          <CompactUpsell
            postcode={postcodeParam}
            address={resolvedAddress}
            alertsCount={countAlerts(report)}
            onChangeAddress={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}`)}
          />
          <InitialAssessment report={report} />
          <FlagsBar report={report} />
          <PropertyEssentials report={report} />
          <RisksSection report={report} />
          <AreaSection report={report} />
          <LocalContextSection report={report} />
          <ConnectivitySection report={report} />
          <DataSourcesNote />
        </>
      )}
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

// =====================================================================
// COMPACT CCC-STYLE UPSELL AT TOP + MODAL
// =====================================================================
function CompactUpsell({ postcode, address, alertsCount, onChangeAddress }: { postcode: string; address: PostcodeAddress; alertsCount: number; onChangeAddress: () => void }) {
  const [loading, setLoading] = useState<"standard" | "premium" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <>
      {/* Dark slate hero — CCC pattern */}
      <div className="-mx-3 sm:-mx-4 -mt-6 sm:-mt-8 mb-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">

          {/* Address */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300">Property report</span>
              <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/40" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300">{address.postcode}</span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words leading-tight">
              {address.fullAddress}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-400 break-words">
              {address.adminDistrictName ?? ""}{address.region ? ` · ${address.region}` : ""}{address.country ? ` · ${address.country}` : ""}
            </p>

            {/* Change address dropdown */}
            <div className="relative inline-block mt-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Change address
                <svg className={`w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-xl border border-slate-700 bg-slate-800 shadow-xl z-50 py-1.5 text-left">
                    <button
                      onClick={() => { setMenuOpen(false); onChangeAddress(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Pick a different address in {postcode}
                    </button>
                    <a
                      href="/check"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Search a new postcode
                    </a>
                    <a
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Back to homepage
                    </a>
                  </div>
                </>
              )}
            </div>

            {alertsCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-200">
                ⚠ {alertsCount} {alertsCount === 1 ? "risk" : "risks"} flagged in the free report
              </div>
            )}
          </div>

          {/* Three tier cards */}
          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <TierCard
              tone="current"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Free Basic Report"
              priceLine="You're viewing this"
              features={["Sales history", "EPC + council tax", "Crime + schools", "Initial assessment"]}
              disabled
            />
            <TierCard
              tone="standard"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Standard Report"
              price="£4.99"
              features={["Full risks &amp; environmental", "Restrictive covenants flag", "Mining / radon / subsidence", "Signed PDF"]}
              onClick={() => buy("standard")}
              loading={loading === "standard"}
              disabled={!!loading}
            />
            <TierCard
              tone="premium"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Premium Report"
              price="£14.99"
              features={["Live HM Land Registry title", "Lease analysis", "AI buyer's verdict", "Climate-projected flood"]}
              onClick={() => buy("premium")}
              loading={loading === "premium"}
              disabled={!!loading}
              mostPopular
            />
          </div>

          {/* What's included link */}
          <div className="text-center mt-4">
            <button onClick={() => setModalOpen(true)} className="text-xs text-cyan-300 hover:text-white font-semibold underline-offset-4 hover:underline">
              See full feature comparison &rarr;
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Secure Stripe checkout
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Live UK government data
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Instant PDF delivery
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <UpsellModal onClose={() => setModalOpen(false)} onBuy={buy} loading={loading} alertsCount={alertsCount} />
      )}
    </>
  );
}

function TierCard({
  tone, icon, title, price, priceLine, features, mostPopular, onClick, disabled, loading,
}: {
  tone: "current" | "standard" | "premium";
  icon: React.ReactNode;
  title: string;
  price?: string;
  priceLine?: string;
  features: string[];
  mostPopular?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const cardClass =
    tone === "premium"
      ? "bg-gradient-to-br from-blue-600/20 to-cyan-500/15 border-cyan-400/40 shadow-lg shadow-cyan-500/10"
      : tone === "standard"
      ? "bg-slate-800/60 border-slate-700 hover:border-cyan-400/40 hover:bg-slate-800"
      : "bg-slate-900/40 border-slate-700/60 opacity-70";
  const iconClass =
    tone === "premium" ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
    : tone === "standard" ? "bg-blue-500/15 text-blue-300"
    : "bg-slate-700/60 text-gray-400";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left rounded-2xl border p-4 sm:p-5 transition-all ${cardClass} ${onClick ? "cursor-pointer" : "cursor-default"} ${disabled && !onClick ? "" : disabled ? "opacity-60" : ""}`}
    >
      {mostPopular && (
        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow">Most popular</span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{tone === "current" ? "Free" : tone === "premium" ? "Premium" : "Standard"}</p>
          <p className="text-sm font-bold text-white leading-tight">{title}</p>
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-white">{price ?? priceLine}</p>
      {price && <p className="text-[11px] text-gray-400">one-time, instant delivery</p>}
      <ul className="mt-3 space-y-1 text-[11px] sm:text-xs text-gray-300">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <span className={`mt-1 inline-block w-1 h-1 rounded-full shrink-0 ${tone === "premium" ? "bg-cyan-400" : tone === "standard" ? "bg-blue-400" : "bg-gray-500"}`} />
            <span dangerouslySetInnerHTML={{ __html: f }} />
          </li>
        ))}
      </ul>
      {loading && (
        <p className="mt-3 text-[10px] text-cyan-300 font-semibold">Redirecting…</p>
      )}
    </button>
  );
}

function UpsellModal({ onClose, onBuy, loading, alertsCount }: {
  onClose: () => void;
  onBuy: (tier: "standard" | "premium") => void;
  loading: "standard" | "premium" | null;
  alertsCount: number;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-5 py-4 sm:px-6 sm:py-5 rounded-t-2xl flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-cyan-300">Premium property reports</p>
            <h2 className="mt-1 text-base sm:text-xl font-extrabold text-white leading-tight">Everything your solicitor would charge £250+ to surface — for £4.99 / £14.99</h2>
            {alertsCount > 0 && (
              <p className="mt-2 text-xs sm:text-sm text-cyan-100">⚠ We found {alertsCount} risk{alertsCount === 1 ? "" : "s"} on the free report. The Premium upgrade tells you exactly what they mean for THIS property.</p>
            )}
          </div>
          <button onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto">

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard */}
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">STANDARD</span>
                <p className="text-2xl font-extrabold text-gray-900">£4.99</p>
              </div>
              <p className="text-sm text-gray-600 mb-3">Full pre-offer due diligence without the title pull.</p>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {STANDARD_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-blue-500 text-xs mt-1">★</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onBuy("standard")} disabled={!!loading}
                className="mt-5 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
                {loading === "standard" ? "Redirecting…" : "Get Standard · £4.99"}
              </button>
            </div>
            {/* Premium */}
            <div className="rounded-2xl border-2 border-cyan-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 relative shadow-md">
              <span className="absolute -top-3 right-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow">Most popular</span>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-xs font-bold">PREMIUM</span>
                <p className="text-2xl font-extrabold text-gray-900">£14.99</p>
              </div>
              <p className="text-sm text-gray-700 mb-3 font-medium">Standard plus the live HM Land Registry title and AI verdict.</p>
              <ul className="space-y-1.5 text-sm text-gray-800 font-medium">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-blue-500 text-xs mt-1">★</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onBuy("premium")} disabled={!!loading}
                className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                {loading === "premium" ? "Redirecting…" : "Get Premium · £14.99"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              <strong>Why these matter:</strong> Solicitor conveyancing searches alone cost £250-£450 — and only happen AFTER you instruct. A RICS Level 2 survey is £400-£900. PropertyHistoryCheck reports run BEFORE you commit, so you can decide whether to walk away or use the findings to renegotiate (typical price reduction 1-3% on findings).
            </p>
          </div>
          <p className="mt-3 text-[10px] text-gray-500 text-center">Reports delivered by email within 60 seconds, with signed PDF and a permanent online URL you can share with your solicitor.</p>
        </div>
        </div>
      </div>
    </div>
  );
}

const STANDARD_FEATURES = [
  "Full planning application history within 250m, last 5 years",
  "Restrictive covenants flag (HMLR Use Land &amp; Property Data)",
  "Coal mining + radon + subsidence flags",
  "Detailed flood: surface water, groundwater, reservoirs",
  "Air quality (NO₂, PM2.5, DAQI)",
  "Sold comparables + price growth trend",
  "Listed building grade + conservation area + Article 4 detail",
  "Signed PDF + permanent online URL",
];
const PREMIUM_FEATURES = [
  "Everything in Standard, plus...",
  "★ Live HM Land Registry title register pull",
  "★ Lease length + tenure analysis (if leasehold)",
  "★ Climate-projected flood risk to 2050",
  "★ AI buyer's verdict + red-flag narrative",
  "★ Solar PV potential + estimated payback",
  "★ 5-year price forecast",
  "★ Adjacent-land development risk (within 500m)",
];

// =====================================================================
// FLAGS BAR
// =====================================================================
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
  if (report.imd && report.imd.decile <= 3) flags.push({ tone: "amber", label: `IMD decile ${report.imd.decile} (deprived)` });
  if (report.broadband?.fullFibre) flags.push({ tone: "green", label: "Full fibre available" });
  if (report.epc?.rating && ["A", "B"].includes(report.epc.rating)) flags.push({ tone: "green", label: `EPC ${report.epc.rating} (excellent)` });
  if (report.imd && report.imd.decile >= 8) flags.push({ tone: "green", label: `IMD decile ${report.imd.decile} (low deprivation)` });

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
  if (report.imd && report.imd.decile <= 3) count++;
  return count;
}

// =====================================================================
// SECTIONS
// =====================================================================
function PropertyEssentials({ report }: { report: FreeReport }) {
  const estimate = estimatePropertyValue(report);
  const defaultPrice = estimate?.estimate ?? report.priceHistory?.sales?.[0]?.price ?? 350_000;
  return (
    <Section title="Property essentials" subtitle="Sales, energy, tax &amp; SDLT">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {report.priceHistory?.sales?.length ? <SalesCard history={report.priceHistory} estimate={estimate} /> : null}
        {report.epc ? <EpcCard epc={report.epc} /> : null}
        {report.epc && (report.epc.propertyType || report.epc.builtForm || report.epc.totalFloorArea) ? <CharacteristicsCard epc={report.epc} /> : null}
        {report.councilTax?.authority ? <CouncilTaxCard ct={report.councilTax} /> : null}
        {report.solar ? <SolarCard solar={report.solar} /> : null}
        <StampDutyCard defaultPrice={defaultPrice} estimate={estimate} />
      </div>
    </Section>
  );
}

function InitialAssessment({ report }: { report: FreeReport }) {
  const v = buildInitialAssessment(report);
  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-md p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow">PHC</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-blue-700 font-bold">Initial assessment</p>
          <p className="text-base font-extrabold text-gray-900 mt-0.5">{v.headline}</p>
          {v.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-gray-700 leading-relaxed mt-2">{p}</p>
          ))}
          {(v.positives.length > 0 || v.cautions.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2 mt-3 pt-3 border-t border-gray-100">
              {v.positives.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1">✓ Positives</p>
                  <ul className="space-y-0.5 text-xs text-gray-700">
                    {v.positives.map((p, i) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
              )}
              {v.cautions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Watch out for</p>
                  <ul className="space-y-0.5 text-xs text-gray-700">
                    {v.cautions.map((p, i) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-3">Generated from public datasets. The Premium report adds an AI-written narrative tailored to this address using the live HM Land Registry title.</p>
        </div>
      </div>
    </div>
  );
}

function CharacteristicsCard({ epc }: { epc: NonNullable<FreeReport["epc"]> }) {
  return (
    <Card title="Property type" subtitle="EPC Register">
      <div className="space-y-1.5 text-sm">
        {epc.propertyType ? <Row label="Type" value={epc.propertyType} /> : null}
        {epc.builtForm ? <Row label="Form" value={epc.builtForm} /> : null}
        {epc.buildYear ? <Row label="Build year" value={String(epc.buildYear)} /> : null}
        {epc.totalFloorArea ? <Row label="Floor area" value={`${epc.totalFloorArea} m²`} /> : null}
        {epc.mainHeating ? <Row label="Heating" value={epc.mainHeating} /> : null}
      </div>
      <p className="mt-3 text-[10px] text-gray-400">Source: latest EPC certificate. Bedroom count and floor plans are not in the public EPC dataset; available via paid surveyors.</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 min-w-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 font-semibold truncate text-right">{value}</span>
    </div>
  );
}

function StampDutyCard({ defaultPrice, estimate }: { defaultPrice: number; estimate: ReturnType<typeof estimatePropertyValue> }) {
  return (
    <Card title="Stamp duty calculator" subtitle="HMRC SDLT 2026/27" className="lg:col-span-2">
      <StampDutyCalculator defaultPrice={defaultPrice} estimate={estimate} />
    </Card>
  );
}

function RisksSection({ report }: { report: FreeReport }) {
  const lat = report.property.lat, lng = report.property.lng;
  if (!lat || !lng) return null;
  return (
    <Section title="Risks &amp; constraints" subtitle="Flood, planning, crime">
      <div className="grid gap-4 lg:grid-cols-2 min-w-0">
        {report.flood ? <FloodCard flood={report.flood} lat={lat} lng={lng} /> : null}
        {report.crime ? <CrimeCard crime={report.crime} lat={lat} lng={lng} /> : null}
        {report.planning && (report.planning.constraints.length > 0 || report.planning.totalApps12m > 0) ? (
          <PlanningCard planning={report.planning} lat={lat} lng={lng} />
        ) : null}
      </div>
    </Section>
  );
}

function AreaSection({ report }: { report: FreeReport }) {
  const hasContent = report.imd || report.demographics;
  if (!hasContent) return null;
  return (
    <Section title="Area profile" subtitle="Deprivation &amp; demographics">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {report.imd ? <ImdCard imd={report.imd} /> : null}
        {report.demographics ? <DemographicsCard demo={report.demographics} /> : null}
      </div>
    </Section>
  );
}

function LocalContextSection({ report }: { report: FreeReport }) {
  const lat = report.property.lat, lng = report.property.lng;
  return (
    <Section title="Local context" subtitle="Schools, healthcare, amenities">
      <div className="grid gap-4 lg:grid-cols-2 min-w-0">
        {report.schools && report.schools.length > 0 && lat && lng ? <SchoolsCard schools={report.schools} lat={lat} lng={lng} /> : null}
        {report.healthcare ? <HealthcareCard healthcare={report.healthcare} /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {report.amenities && report.amenities.nearestSupermarket ? <AmenitiesCard amenities={report.amenities} /> : null}
        {report.greenspace ? <GreenspaceCard greenspace={report.greenspace} /> : null}
        {report.transportNearby ? <TransportNearbyCard t={report.transportNearby} /> : null}
      </div>
    </Section>
  );
}

function ConnectivitySection({ report }: { report: FreeReport }) {
  return (
    <Section title="Connectivity" subtitle="Broadband, mobile, transport">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
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
    <div className={`bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
        {subtitle ? <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold shrink-0">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

// =====================================================================
// CARDS
// =====================================================================
function SalesCard({ history, estimate }: { history: NonNullable<FreeReport["priceHistory"]>; estimate: ReturnType<typeof estimatePropertyValue> }) {
  const sortedAsc = [...history.sales].sort((a, b) => a.date.localeCompare(b.date));
  const bars = sortedAsc.slice(-12).map((s, i, arr) => ({
    label: new Date(s.date).getFullYear().toString(),
    value: s.price,
    highlight: i === arr.length - 1,
  }));
  const latest = sortedAsc[sortedAsc.length - 1];
  const earliest = sortedAsc[0];
  let growthPct: number | undefined;
  let yearsBetween: number | undefined;
  if (earliest && latest && earliest !== latest) {
    yearsBetween = (new Date(latest.date).getTime() - new Date(earliest.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    growthPct = Math.round(((latest.price / earliest.price - 1) * 100));
  }
  return (
    <Card title="Sales history &amp; value" subtitle="HM Land Registry">
      {estimate ? (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-3 mb-3">
          <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Estimated value today</p>
          <p className="text-2xl font-extrabold text-gray-900">£{estimate.estimate.toLocaleString()}</p>
          <p className="text-xs text-gray-600">£{estimate.lowEnd.toLocaleString()} – £{estimate.highEnd.toLocaleString()} · {estimate.confidence} confidence</p>
        </div>
      ) : null}
      {latest ? (
        <>
          <p className="text-xs text-gray-500 mb-1">Last sold</p>
          <p className="text-xl font-extrabold text-gray-900">£{latest.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mb-3">{new Date(latest.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          <MiniBarChart bars={bars} formatValue={(v) => `£${v.toLocaleString()}`} height={70} />
          {growthPct !== undefined && yearsBetween !== undefined && yearsBetween > 1 ? (
            <p className="mt-2 text-xs">
              <span className={growthPct >= 0 ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                {growthPct >= 0 ? "+" : ""}{growthPct}%
              </span>
              <span className="text-gray-500"> over {yearsBetween.toFixed(0)} years ({(growthPct / yearsBetween).toFixed(1)}%/yr)</span>
            </p>
          ) : null}
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            {history.sales.slice(0, 4).map((s, i) => (
              <li key={i} className="flex justify-between">
                <span>{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                <span className="font-semibold text-gray-700">£{s.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {history.postcodeMedian ? (
            <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Postcode median <span className="font-semibold text-gray-700">£{history.postcodeMedian.toLocaleString()}</span> ({history.postcodeSampleSize} sales)
            </p>
          ) : null}
          {estimate?.sources?.length ? (
            <details className="mt-2 text-[10px] text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">Estimate sources</summary>
              <ul className="mt-1 space-y-0.5">
                {estimate.sources.map((s, i) => <li key={i}>• {s.label}</li>)}
              </ul>
            </details>
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

function SolarCard({ solar }: { solar: NonNullable<FreeReport["solar"]> }) {
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const bars = solar.monthlyAverage.map((v, i) => ({ label: months[i], value: v }));
  return (
    <Card title="Solar potential" subtitle="EU JRC PVGIS">
      <p className="text-3xl font-extrabold text-gray-900">{solar.estimatedAnnualKwh.toLocaleString()}<span className="text-base font-bold text-gray-500"> kWh/yr</span></p>
      <p className="text-xs text-gray-500 mb-3">Estimated for a {solar.estimatedSystemKwp} kWp roof system</p>
      <MiniBarChart bars={bars} height={50} />
      <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700">
        Could save <span className="font-bold text-emerald-700">~£{solar.estimatedAnnualSavings.toLocaleString()}/yr</span> at current electricity prices.
      </p>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = polygons?.features ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zoneCounts = { z2: 0, z3: 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features.forEach((f: any) => {
    if (f?.properties?.zone === 3) zoneCounts.z3++;
    else zoneCounts.z2++;
  });
  return (
    <Card title="Flood risk" subtitle="Environment Agency">
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${tone}`}>{label}</span>
        {flood.inFloodZone3 ? <span className="text-xs text-red-700 font-semibold">Property in Flood Zone 3</span>
        : flood.inFloodZone2 ? <span className="text-xs text-amber-700 font-semibold">Property in Flood Zone 2</span> : null}
        {zoneCounts.z3 + zoneCounts.z2 > 0 ? (
          <span className="text-xs text-gray-600">
            {zoneCounts.z2 ? `${zoneCounts.z2} Zone 2 ` : ""}{zoneCounts.z3 ? `· ${zoneCounts.z3} Zone 3 ` : ""}within 3 km
          </span>
        ) : null}
      </div>
      <PropertyMap
        lat={lat}
        lng={lng}
        zoom={features.length ? 13 : 14}
        height={300}
        geojson={features.length ? polygons : undefined}
        floodZoneStyle
        fitBounds={features.length > 0}
        legend={[
          { colour: "#dc2626", label: "Flood Zone 3 (high)" },
          { colour: "#f59e0b", label: "Flood Zone 2 (medium)" },
          { colour: "#1d4ed8", label: "This property" },
        ]}
      />
      {features.length === 0 && (
        <p className="mt-2 text-xs text-emerald-700 font-semibold">✓ No mapped flood zones within 3 km of this property.</p>
      )}
      {flood.nearbyWarnings.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">Active warnings within 5km</p>
          <ul className="space-y-1 text-xs text-gray-600">
            {flood.nearbyWarnings.slice(0, 3).map((w) => <li key={w.id}>• {w.description || w.message}</li>)}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-gray-500">Zone definitions from EA NaFRA: Zone 3 = 1 in 100 (rivers) or 1 in 200 (sea) annual probability; Zone 2 = 1 in 1,000. Surface water, groundwater + 2050 climate-projected risk in the Standard report.</p>
    </Card>
  );
}

function CrimeCard({ crime, lat, lng }: { crime: NonNullable<FreeReport["crime"]>; lat: number; lng: number }) {
  const top6 = crime.byCategory.slice(0, 6);
  const bars = top6.map((c) => ({ label: c.category.split(" ")[0].slice(0, 8), value: c.count }));
  const pins = (crime.recentIncidents ?? []).map((i) => ({
    lat: i.lat, lng: i.lng, categorySlug: i.categorySlug, category: i.category, street: i.street,
  }));
  // Build legend from top categories actually present in pins
  const slugCount: Record<string, { slug: string; label: string; count: number; colour: string }> = {};
  for (const p of pins) {
    const colour = ({
      "violent-crime": "#dc2626",
      "anti-social-behaviour": "#f97316",
      "burglary": "#7c3aed",
      "robbery": "#dc2626",
      "vehicle-crime": "#0891b2",
      "criminal-damage-arson": "#d97706",
      "shoplifting": "#0284c7",
      "theft-from-the-person": "#be185d",
      "other-theft": "#0284c7",
      "drugs": "#16a34a",
      "public-order": "#ea580c",
    } as Record<string, string>)[p.categorySlug] ?? "#64748b";
    if (!slugCount[p.categorySlug]) slugCount[p.categorySlug] = { slug: p.categorySlug, label: p.category, count: 0, colour };
    slugCount[p.categorySlug].count++;
  }
  const legend = Object.values(slugCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((c) => ({ colour: c.colour, label: c.label }));

  return (
    <Card title="Crime (12 months)" subtitle="data.police.uk">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-3xl font-extrabold text-gray-900">{crime.totalIncidents.toLocaleString()}</p>
        <p className="text-xs text-gray-500">incidents within ~1 mile</p>
      </div>
      <PropertyMap
        lat={lat} lng={lng} zoom={15} height={300}
        radius={1609}
        crimePins={pins}
        legend={legend}
      />
      {pins.length > 0 ? (
        <p className="mt-2 text-xs text-gray-500">Each dot = one reported incident in the last 2 months. Total includes all 12 months.</p>
      ) : null}
      <div className="mt-3 grid sm:grid-cols-2 gap-4 min-w-0">
        <ul className="space-y-1 text-xs text-gray-600 min-w-0">
          {top6.slice(0, 6).map((c) => (
            <li key={c.category} className="flex justify-between gap-2 min-w-0">
              <span className="truncate pr-2 min-w-0">{c.category}</span>
              <span className="font-semibold text-gray-700 shrink-0">{c.count}</span>
            </li>
          ))}
        </ul>
        <div className="min-w-0 overflow-hidden">
          <p className="text-xs font-semibold text-gray-700 mb-1">Breakdown by category</p>
          <MiniBarChart bars={bars} height={70} />
        </div>
      </div>
    </Card>
  );
}

function PlanningCard({ planning, lat, lng }: { planning: NonNullable<FreeReport["planning"]>; lat: number; lng: number }) {
  const appPins = planning.applications
    .filter((a) => a.lat && a.lng)
    .map((a) => ({
      name: a.address || a.reference,
      description: a.description,
      lat: a.lat!, lng: a.lng!,
      status: a.status,
    }));
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
          {appPins.length > 0 ? (
            <PropertyMap
              lat={lat} lng={lng} zoom={16} height={240}
              appPins={appPins}
              radius={500}
              legend={[
                { colour: "#059669", label: "Permitted" },
                { colour: "#d97706", label: "Pending" },
                { colour: "#dc2626", label: "Rejected" },
              ]}
            />
          ) : null}
          <p className="text-xs text-gray-500 mt-3 mb-2">{planning.totalApps12m} applications within 500m, last 12 months</p>
          <ul className="space-y-1.5 text-xs text-gray-700 max-h-48 overflow-y-auto overflow-x-hidden pr-1 min-w-0">
            {planning.applications.slice(0, 8).map((a) => (
              <li key={a.reference} className="border-b border-gray-100 pb-1.5 last:border-0 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{a.address || a.reference}</p>
                <p className="text-[11px] text-gray-600 line-clamp-2 break-words">{a.description}</p>
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

function ImdCard({ imd }: { imd: NonNullable<FreeReport["imd"]> }) {
  const decileTone =
    imd.decile >= 8 ? "text-emerald-700" : imd.decile >= 5 ? "text-blue-700" : imd.decile >= 3 ? "text-amber-700" : "text-red-700";
  const decileLabel =
    imd.decile >= 8 ? "Low deprivation" : imd.decile >= 5 ? "Below average" : imd.decile >= 3 ? "Above average" : "High deprivation";
  return (
    <Card title="Deprivation (IMD)" subtitle="MHCLG IMD 2025">
      <p className={`text-3xl font-extrabold ${decileTone}`}>{imd.decile}<span className="text-base font-bold text-gray-500"> / 10</span></p>
      <p className={`text-xs font-semibold ${decileTone}`}>{decileLabel}</p>
      <p className="text-xs text-gray-500 mb-3 mt-1">10 = least deprived</p>
      <div className="space-y-1 text-xs">
        {[
          { k: "Income", v: imd.domains.income },
          { k: "Employment", v: imd.domains.employment },
          { k: "Education", v: imd.domains.education },
          { k: "Health", v: imd.domains.health },
          { k: "Crime", v: imd.domains.crime },
          { k: "Housing access", v: imd.domains.barriers },
          { k: "Living environment", v: imd.domains.livingEnvironment },
        ].map((d) => (
          <div key={d.k} className="flex items-center gap-2">
            <span className="text-gray-600 w-32 shrink-0">{d.k}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${d.v >= 7 ? "bg-emerald-500" : d.v >= 4 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${d.v * 10}%` }} />
            </div>
            <span className="text-gray-700 font-semibold w-6 text-right">{d.v}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DemographicsCard({ demo }: { demo: NonNullable<FreeReport["demographics"]> }) {
  return (
    <Card title="Local population" subtitle={demo.source}>
      <p className="text-3xl font-extrabold text-gray-900">{demo.population.toLocaleString()}</p>
      <p className="text-xs text-gray-500">Usual residents (LSOA)</p>
      <p className="mt-3 text-xs text-gray-600">
        Smaller statistical area, ~1,500 residents on average. Used for IMD and Census 2021 stats.
      </p>
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
      <PropertyMap
        lat={lat} lng={lng} zoom={13} height={300}
        schools={pins.slice(0, 12)}
        legend={[
          { colour: "#059669", label: "Outstanding" },
          { colour: "#2563eb", label: "Good" },
          { colour: "#d97706", label: "Requires Improvement" },
          { colour: "#dc2626", label: "Inadequate" },
        ]}
      />
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

function HealthcareCard({ healthcare }: { healthcare: NonNullable<FreeReport["healthcare"]> }) {
  return (
    <Card title="Healthcare nearby" subtitle="OpenStreetMap">
      <ul className="space-y-2.5 text-sm">
        {healthcare.nearestGp ? (
          <li>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest GP</p>
            <p className="text-gray-800 font-semibold">{healthcare.nearestGp.name ?? "GP surgery"}</p>
            <p className="text-xs text-gray-500">{(healthcare.nearestGp.distanceM / 1000).toFixed(1)} km away</p>
          </li>
        ) : null}
        {healthcare.nearestPharmacy ? (
          <li>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest pharmacy</p>
            <p className="text-gray-800 font-semibold">{healthcare.nearestPharmacy.name ?? "Pharmacy"}</p>
            <p className="text-xs text-gray-500">{(healthcare.nearestPharmacy.distanceM / 1000).toFixed(1)} km away</p>
          </li>
        ) : null}
        {healthcare.nearestHospital ? (
          <li>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest hospital</p>
            <p className="text-gray-800 font-semibold">{healthcare.nearestHospital.name ?? "Hospital"}</p>
            <p className="text-xs text-gray-500">{(healthcare.nearestHospital.distanceM / 1000).toFixed(1)} km away</p>
          </li>
        ) : null}
      </ul>
      <ul className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700 space-y-1">
        <li className="flex justify-between"><span>GPs &lt; 2 km</span><span className="font-semibold">{healthcare.gps.length}</span></li>
        <li className="flex justify-between"><span>Pharmacies &lt; 1.5 km</span><span className="font-semibold">{healthcare.pharmacies.length}</span></li>
        <li className="flex justify-between"><span>Dentists &lt; 2.5 km</span><span className="font-semibold">{healthcare.dentists.length}</span></li>
        <li className="flex justify-between"><span>Hospitals &lt; 5 km</span><span className="font-semibold">{healthcare.hospitals.length}</span></li>
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
    </Card>
  );
}

function GreenspaceCard({ greenspace }: { greenspace: NonNullable<FreeReport["greenspace"]> }) {
  return (
    <Card title="Greenspace" subtitle="OpenStreetMap">
      {greenspace.nearestPark ? (
        <>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest park</p>
          <p className="text-sm text-gray-800 font-semibold">{greenspace.nearestPark.name ?? "Unnamed park"}</p>
          <p className="text-xs text-gray-500 mb-3">{(greenspace.nearestPark.distanceM / 1000).toFixed(1)} km away</p>
        </>
      ) : null}
      <ul className="text-xs text-gray-700 space-y-1">
        <li className="flex justify-between"><span>Parks &lt; 1.5 km</span><span className="font-semibold">{greenspace.parks.length}</span></li>
        <li className="flex justify-between"><span>Woodland &lt; 3 km</span><span className="font-semibold">{greenspace.woodland.length}</span></li>
      </ul>
    </Card>
  );
}

function TransportNearbyCard({ t }: { t: NonNullable<FreeReport["transportNearby"]> }) {
  return (
    <Card title="Transport nearby" subtitle="OpenStreetMap">
      {t.nearestStation ? (
        <div className="mb-2">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest train station</p>
          <p className="text-sm text-gray-800 font-semibold">{t.nearestStation.name ?? "Rail station"}</p>
          <p className="text-xs text-gray-500">{(t.nearestStation.distanceM / 1000).toFixed(1)} km away</p>
        </div>
      ) : null}
      {t.nearestTube ? (
        <div className="mb-2">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Nearest tube/metro</p>
          <p className="text-sm text-gray-800 font-semibold">{t.nearestTube.name ?? "Tube station"}</p>
          <p className="text-xs text-gray-500">{(t.nearestTube.distanceM / 1000).toFixed(1)} km away</p>
        </div>
      ) : null}
      {t.nearestBus ? (
        <p className="mt-2 text-xs text-gray-700">Nearest bus stop: <span className="font-semibold">{t.nearestBus.distanceM} m</span></p>
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
    <Card title="Transport score" subtitle="DfT 2025">
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
      This free report is informational only and is not a substitute for formal conveyancing searches by a qualified solicitor. Contains HM Land Registry data &copy; Crown copyright and database right. Powered by data.police.uk, Environment Agency, MHCLG, planning.data.gov.uk, GIAS, Ofcom, ONS, EU JRC PVGIS and OpenStreetMap under the Open Government Licence v3.0.
    </p>
  );
}
