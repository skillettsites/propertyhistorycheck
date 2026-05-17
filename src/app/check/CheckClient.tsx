"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttribution, getAttribution } from "@/lib/tracking";
import PostcodeLookup from "@/components/PostcodeLookup";
import PropertyMap from "@/components/PropertyMapClient";
import MiniBarChart from "@/components/MiniBarChart";
import EpcLadder from "@/components/EpcLadder";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import CommuteChecker from "@/components/CommuteChecker";
import MortgageCalculator from "@/components/MortgageCalculator";
import AffordabilityCheck from "@/components/AffordabilityCheck";
import EnergyBillEstimate from "@/components/EnergyBillEstimate";
import InsuranceCostEstimate from "@/components/InsuranceCostEstimate";
import PriceForecast from "@/components/PriceForecast";
import { buildInitialAssessment } from "@/lib/verdict";
import { estimatePropertyValue } from "@/lib/estimateValue";
import type { FreeReport, PostcodeAddress } from "@/lib/types";

interface AddressesResponse { postcode: string; addresses: string[]; }

/**
 * Parse a UK address string into PAON + SAON for HMLR matching.
 *
 * Examples:
 *  "Apartment 604, Binnacle House, 10 Cobblestone Square, London"
 *    → { saon: "604", paon: "Binnacle House" }
 *  "Flat 12, Acacia Court, Kingsley Mews"
 *    → { saon: "12", paon: "Acacia Court" }
 *  "26 Parsons Close, Newbury"
 *    → { paon: "26" }
 */
function parseAddressParts(input: string): { saon?: string; paon?: string } {
  const trimmed = input.trim();
  // Flat-prefix: extract flat number as SAON
  const flatMatch = trimmed.match(/^(?:apartment|apt|flat|unit|suite|maisonette)\s+(\d+[A-Z]?)/i);
  if (flatMatch) {
    const saon = flatMatch[1].toUpperCase();
    // PAON = the next comma-separated part if it looks like a building name
    const afterFlat = trimmed.slice(flatMatch[0].length).replace(/^[,\s]+/, "");
    const buildingMatch = afterFlat.match(/^([^,]+?)(?:,|$)/);
    const paon = buildingMatch ? buildingMatch[1].trim() : undefined;
    return { saon, paon };
  }
  // Number-prefix: PAON = number
  const numMatch = trimmed.match(/^(\d+[A-Z]?)\b/);
  if (numMatch) {
    return { paon: numMatch[1].toUpperCase() };
  }
  return {};
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
        const parts = parseAddressParts(addressParam);
        setResolvedAddress({
          fullAddress: addressParam,
          paon: parts.paon,
          saon: parts.saon,
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
      <AddressPicker
        postcode={postcodeParam}
        addresses={pickerAddresses}
        onSelect={(addr) => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}&address=${encodeURIComponent(addr)}`)}
        onSkip={() => { setPickerAddresses(null); setResolvedAddress({ fullAddress: postcodeParam, postcode: postcodeParam }); }}
      />
    );
  }
  if (!resolvedAddress) return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-600">Loading address…</div>;

  return (
    <div className="overflow-x-hidden">
      {loadingReport && (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <Skeleton />
        </div>
      )}
      {report && (
        <>
          {/* Full-bleed dark hero */}
          <CompactUpsell
            postcode={postcodeParam}
            address={resolvedAddress}
            alertsCount={countAlerts(report)}
            onChangeAddress={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}`)}
          />
          {/* Constrained content below */}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <InitialAssessment report={report} />
            <FlagsBar report={report} />
            <PropertyEssentials report={report} />
            <RisksSection report={report} />
            <LocalContextSection report={report} />
            <FinanceSection report={report} />
            <AreaSection report={report} />
            <ConnectivitySection report={report} />
            <PremiumToolkitSection />
            <DataSourcesNote />
          </div>
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
function AddressPicker({ postcode, addresses, onSelect, onSkip }: {
  postcode: string;
  addresses: string[];
  onSelect: (addr: string) => void;
  onSkip: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const filtered = filter
    ? addresses.filter((a) => a.toLowerCase().includes(filter.toLowerCase()))
    : addresses;

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const v = manualValue.trim();
    if (v.length < 3) return;
    onSelect(v);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Postcode {postcode}</p>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">Pick the exact address</h1>
      <p className="mt-2 text-sm text-gray-600">
        {addresses.length} address{addresses.length === 1 ? "" : "es"} found.
        {addresses.length > 8 ? " Type to filter the list." : ""}
      </p>

      {addresses.length > 8 && (
        <div className="mt-4 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Filter — try the flat number or building name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            autoFocus
          />
        </div>
      )}

      <ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden max-h-[480px] overflow-y-auto">
        {filtered.slice(0, 100).map((addr) => (
          <li key={addr}>
            <button
              className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={() => onSelect(addr)}
            >
              {addr}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-4 text-sm text-gray-500 italic">No matches. Try the manual entry below.</li>
        )}
      </ul>

      <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-4">
        <p className="text-sm font-bold text-gray-900">Can&apos;t find your address?</p>
        <p className="text-xs text-gray-600 mt-1">
          Some flats and recent builds aren&apos;t in the public address registers we use. Type your exact address (including flat number) and we&apos;ll build the report from postcode-level data.
        </p>
        {!manualOpen ? (
          <button onClick={() => setManualOpen(true)} className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900">
            Enter my address manually &rarr;
          </button>
        ) : (
          <form onSubmit={submitManual} className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              autoFocus
              placeholder="e.g. 604 Binnacle House"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={manualValue.trim().length < 3}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use this address
            </button>
          </form>
        )}
      </div>

      <div className="mt-3">
        <button onClick={onSkip} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          Or skip — show postcode-level report instead &rarr;
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Search a different postcode:</p>
        <PostcodeLookup size="md" />
      </div>
    </div>
  );
}

function CompactUpsell({ postcode, address, alertsCount, onChangeAddress }: { postcode: string; address: PostcodeAddress; alertsCount: number; onChangeAddress: () => void }) {
  const [loading, setLoading] = useState<"standard" | "premium" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nearbyAddresses, setNearbyAddresses] = useState<string[] | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [leaseAddon, setLeaseAddon] = useState(false);
  const [ews1Addon, setEws1Addon] = useState(false);

  // Listen for "open upsell modal" events from sibling components (e.g. the
  // InitialAssessment "live HM Land Registry title" link).
  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener("phc-open-upsell", open);
    return () => window.removeEventListener("phc-open-upsell", open);
  }, []);

  async function buy(tier: "standard" | "premium") {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          postcode,
          uprn: address.uprn,
          fullAddress: address.fullAddress,
          attribution: getAttribution() ?? {},
          leaseAddon: tier === "premium" && leaseAddon,
          ews1Addon: tier === "premium" && ews1Addon,
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

  // Lazy-load addresses when dropdown opens
  async function openMenu() {
    setMenuOpen(true);
    if (nearbyAddresses === null && !loadingAddresses) {
      setLoadingAddresses(true);
      try {
        const res = await fetch(`/api/addresses?postcode=${encodeURIComponent(postcode)}`);
        if (res.ok) {
          const data = await res.json();
          const valid = (data.addresses ?? []).filter((a: string) => a && a.trim().length > 2 && a !== address.fullAddress);
          setNearbyAddresses(valid);
        } else {
          setNearbyAddresses([]);
        }
      } catch {
        setNearbyAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    }
  }

  return (
    <>
      {/* Full-bleed dark hero — CCC pattern */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">

          {/* Address */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">Property report</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-200">{address.postcode}</span>
            </div>
            <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words leading-tight">
              {address.fullAddress}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-400 break-words">
              {address.adminDistrictName ?? ""}{address.region ? ` · ${address.region}` : ""}{address.country ? ` · ${address.country}` : ""}
            </p>

            {/* Change address dropdown — lazy-loads same-postcode addresses */}
            <div className="relative inline-block mt-3">
              <button
                onClick={() => menuOpen ? setMenuOpen(false) : openMenu()}
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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 sm:w-80 rounded-xl border border-slate-700 bg-slate-800 shadow-2xl z-50 text-left overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-700 bg-slate-900/40">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">Other addresses in {postcode}</p>
                    </div>
                    {loadingAddresses ? (
                      <div className="px-4 py-3 text-xs text-gray-400">Loading addresses…</div>
                    ) : nearbyAddresses && nearbyAddresses.length > 0 ? (
                      <ul className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                        {nearbyAddresses.slice(0, 30).map((addr) => (
                          <li key={addr}>
                            <a
                              href={`/check?postcode=${encodeURIComponent(postcode)}&address=${encodeURIComponent(addr)}`}
                              className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors truncate"
                              title={addr}
                            >
                              {addr}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-400">No other addresses found in this postcode.</div>
                    )}
                    <div className="border-t border-slate-700 bg-slate-900/40">
                      <a
                        href="/check"
                        className="block px-4 py-2 text-xs text-cyan-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
                      >
                        ↗ Search a new postcode
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            {alertsCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-200">
                ⚠ {alertsCount} {alertsCount === 1 ? "risk" : "risks"} flagged in the free report
              </div>
            )}
          </div>

          {/* Tier cards: Standard + Premium (the free report is already on this page below). */}
          <div className="mt-7 grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
            <TierCard
              tone="standard"
              title="Standard Report"
              price="£4.99"
              features={["Full risks &amp; environmental", "Restrictive covenants flag", "Mining / radon / subsidence", "Permanent online report URL"]}
              ctaLabel="Get Standard"
              onClick={() => buy("standard")}
              loading={loading === "standard"}
              disabled={!!loading}
            />
            <TierCard
              tone="premium"
              title="Premium Report"
              price="£14.99"
              features={["Live HM Land Registry title", "Lease analysis", "AI buyer's verdict", "Climate-projected flood"]}
              ctaLabel="See what's included"
              onClick={() => setModalOpen(true)}
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
              Instant online report
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <UpsellModal
          onClose={() => setModalOpen(false)}
          onBuy={buy}
          loading={loading}
          alertsCount={alertsCount}
          leaseAddon={leaseAddon}
          setLeaseAddon={setLeaseAddon}
          ews1Addon={ews1Addon}
          setEws1Addon={setEws1Addon}
          isLeasehold={isLikelyLeaseholdHint(address)}
          isFlat={isLikelyLeaseholdHint(address)}
        />
      )}
    </>
  );
}

function TierCard({
  tone, title, price, priceLine, features, mostPopular, onClick, disabled, loading, ctaLabel, hideOnMobile,
}: {
  tone: "current" | "standard" | "premium";
  title: string;
  price?: string;
  priceLine?: string;
  features: string[];
  mostPopular?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  ctaLabel?: string;
  hideOnMobile?: boolean;
}) {
  const cardClass =
    tone === "premium"
      ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-300 shadow-md"
    : tone === "standard"
      ? "bg-white border-blue-200 hover:border-blue-400"
      : "bg-gray-50 border-gray-200";
  const labelBg =
    tone === "premium" ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white"
    : tone === "standard" ? "bg-blue-100 text-blue-700"
    : "bg-gray-200 text-gray-600";

  return (
    <div className={`relative rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 flex flex-col ${cardClass} ${hideOnMobile ? "hidden md:flex" : ""}`}>
      {mostPopular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 sm:py-1 rounded-full shadow whitespace-nowrap">Most popular</span>
      )}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase ${labelBg}`}>
          {tone === "current" ? "Free" : tone === "premium" ? "Premium" : "Standard"}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{title}</p>
      <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">{price ?? priceLine}</p>
      {price && <p className="text-[9px] sm:text-[10px] text-gray-500">one-time, instant</p>}
      <ul className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-gray-700 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 leading-snug">
            <span className={`mt-0 text-[10px] sm:text-xs shrink-0 ${tone === "premium" ? "text-blue-500" : tone === "standard" ? "text-blue-400" : "text-gray-400"}`}>{tone === "current" ? "✓" : "★"}</span>
            <span dangerouslySetInnerHTML={{ __html: f }} />
          </li>
        ))}
      </ul>
      {onClick && ctaLabel && (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`mt-3 sm:mt-4 w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-[11px] sm:text-sm transition-all disabled:opacity-50 ${
            tone === "premium"
              ? "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-md shadow-blue-500/25"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Redirecting…" : `${ctaLabel}${price ? ` · ${price}` : ""}`}
        </button>
      )}
    </div>
  );
}

function isLikelyLeaseholdHint(address: PostcodeAddress): boolean {
  // Best-effort hint from the address alone — flats almost always start with
  // "FLAT" or "APARTMENT" in the SAON. Houses won't match, freehold houses
  // won't see the toggle.
  const s = (address.saon ?? "").toUpperCase();
  return /^(FLAT|APARTMENT|UNIT|MAISONETTE|STUDIO)\b/.test(s);
}

function UpsellModal({ onClose, onBuy, loading, alertsCount, leaseAddon, setLeaseAddon, ews1Addon, setEws1Addon, isLeasehold, isFlat }: {
  onClose: () => void;
  onBuy: (tier: "standard" | "premium") => void;
  loading: "standard" | "premium" | null;
  alertsCount: number;
  leaseAddon: boolean;
  setLeaseAddon: (v: boolean) => void;
  ews1Addon: boolean;
  setEws1Addon: (v: boolean) => void;
  isLeasehold: boolean;
  isFlat: boolean;
}) {
  const addonsTotal = (leaseAddon ? 9.99 : 0) + (ews1Addon ? 4.99 : 0);
  const totalLabel = addonsTotal > 0
    ? `Get Premium + extras · £${(14.99 + addonsTotal).toFixed(2)}`
    : "Get the Premium report · £14.99";
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-5 py-4 sm:px-6 sm:py-5 rounded-t-2xl flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-cyan-300">Premium report &middot; £14.99</p>
            <h2 className="mt-1 text-base sm:text-xl font-extrabold text-white leading-tight">See the live HM Land Registry title before you offer.</h2>
            {alertsCount > 0 && (
              <p className="mt-2 text-xs sm:text-sm text-cyan-100">⚠ {alertsCount} risk{alertsCount === 1 ? "" : "s"} flagged on the free report. The title register confirms what they mean for THIS property.</p>
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
          {/* What is the title register, and why it matters */}
          <div className="rounded-2xl border-2 border-cyan-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-5 mb-5">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-blue-700">What you get</p>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-gray-900">The official HM Land Registry title register, pulled live for this address.</p>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-800">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span><span><strong>Owner names &amp; price paid</strong> — confirms who legally owns it and what they paid.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span><span><strong>Restrictive covenants</strong> — hidden rules on what you can build, extend, or use the property for.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span><span><strong>Charges &amp; mortgages</strong> — outstanding lender claims that could complicate a purchase.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span><span><strong>Lease length &amp; tenure</strong> — critical for flats; short leases tank value and need £20k+ extensions.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">★</span><span><strong>AI buyer&rsquo;s verdict</strong> — plain-English red-flag narrative, generated for THIS property.</span></li>
            </ul>
            <p className="mt-3 text-xs text-gray-700"><strong>Why before you offer?</strong> Your solicitor only pulls the title <em>after</em> you instruct (£250-£450 in searches). By then you&rsquo;re committed and legal fees have started. £14.99 now means you can walk away or renegotiate with the facts in hand.</p>

            <label className="mt-4 flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-white p-3 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={leaseAddon}
                onChange={(e) => setLeaseAddon(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  Add the registered lease document <span className="text-blue-700">+£9.99</span>
                  {isLeasehold ? <span className="ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 align-middle">Recommended for flats</span> : null}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                  The full OC2 lease PDF from HM Land Registry. Shows ground rent escalation, service charge methodology, and every covenant.
                  Only relevant for leasehold properties (most flats; very few houses). <strong>Delivered within 48 hours</strong> (most same-day) — we order from HMLR on your behalf.
                </p>
              </div>
            </label>

            <label className="mt-3 flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-white p-3 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={ews1Addon}
                onChange={(e) => setEws1Addon(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  Add an EWS1 cladding check <span className="text-blue-700">+£4.99</span>
                  {isFlat ? <span className="ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 align-middle">Recommended for flats</span> : null}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                  Cross-references the building against the BSR Higher-Risk Building register, FIA EWS1 portal, and Building Safety Portal.
                  Returns: HRB status, EWS1 rating (A1-B2), assessor, date. Crucial for any flat — mortgages can be refused without it.
                  <strong> Delivered within 48 hours</strong> by a real human on our team.
                </p>
              </div>
            </label>

            <button onClick={() => onBuy("premium")} disabled={!!loading}
              className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
              {loading === "premium" ? "Redirecting…" : totalLabel}
            </button>
          </div>

          <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Don&rsquo;t need the title register?</p>
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">STANDARD &middot; £4.99</span>
              <p className="text-sm text-gray-600">Full pre-offer due diligence without the title pull.</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-700">
              {STANDARD_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-blue-500 text-xs mt-1">★</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => onBuy("standard")} disabled={!!loading}
              className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading === "standard" ? "Redirecting…" : "Get Standard · £4.99"}
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              <strong>Why these matter:</strong> Solicitor conveyancing searches alone cost £250-£450 — and only happen AFTER you instruct. A RICS Level 2 survey is £400-£900. HomeBuyerCheck reports run BEFORE you commit, so you can decide whether to walk away or use the findings to renegotiate (typical price reduction 1-3% on findings).
            </p>
          </div>
          <p className="mt-3 text-[10px] text-gray-500 text-center">Reports delivered by email within 60 seconds with a permanent online URL you can share with your solicitor.</p>
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
  "Permanent online URL to share with your solicitor",
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
      <div className="flex flex-wrap gap-x-3 gap-y-2.5">
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
  const defaultPrice = estimate?.estimate
    ?? report.priceHistory?.sales?.[0]?.price
    ?? report.priceHistory?.similarSales?.[0]?.price
    ?? 350_000;
  const hasOwnSales = (report.priceHistory?.sales?.length ?? 0) > 0;
  const hasSimilar = (report.priceHistory?.similarSales?.length ?? 0) > 0;
  return (
    <Section title="Property essentials" subtitle="Sales, energy, tax &amp; SDLT">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        <SalesCard history={report.priceHistory} estimate={estimate} hasOwnSales={hasOwnSales} />
        {report.epc ? <EpcCard epc={report.epc} /> : null}
        {report.epc && (report.epc.propertyType || report.epc.builtForm || report.epc.totalFloorArea) ? <CharacteristicsCard epc={report.epc} /> : null}
        <PremiumLockedCard
          title="Title register"
          tag="Premium"
          tagline="Live HM Land Registry pull"
          fields={titleRegisterTeaserFields(report)}
        />
        <PremiumLockedCard
          title="Title plan"
          tag="Premium"
          tagline="Official boundary diagram from HMLR"
          fields={[
            { label: "Boundary plan", placeholder: "PDF map of registered title" },
            { label: "Adjoining property", placeholder: "Yes — verify" },
            { label: "Source", placeholder: "HM Land Registry" },
          ]}
        />
        {isLikelyLeasehold(report) ? (
          <PremiumLockedCard
            title="Lease summary"
            tag="Premium"
            tagline="Ground rent, service charge, escalation clause"
            fields={[
              { label: "Ground rent (current)", placeholder: "£250/yr" },
              { label: "Escalation clause", placeholder: "Doubles every 25 yrs" },
              { label: "Service charge (annual)", placeholder: "£2,400/yr" },
              { label: "Lease covenants", placeholder: "5 restrictions found" },
            ]}
          />
        ) : null}
        {report.rentalEstimate ? (
          <RentalYieldCard rental={report.rentalEstimate} />
        ) : (
          <PremiumLockedCard
            title="Comparable rental yield"
            tag="Premium"
            tagline="What this would rent for + gross yield"
            fields={[
              { label: "Estimated rent", placeholder: "£1,650/mo" },
              { label: "Gross yield", placeholder: "5.4%" },
              { label: "Sample size", placeholder: "23 nearby comps" },
            ]}
          />
        )}
        {(estimate?.estimate || hasOwnSales) && report.epc?.totalFloorArea ? <PricePerSqmCard estimate={estimate} epc={report.epc} similarSales={report.priceHistory?.similarSales} /> : null}
        {report.councilTax?.authority ? <CouncilTaxCard ct={report.councilTax} /> : null}
        {report.solar ? <SolarCard solar={report.solar} /> : null}
        <StampDutyCard defaultPrice={defaultPrice} estimate={estimate} />
      </div>
      {hasSimilar && report.priceHistory ? (
        <div className="mt-4">
          <SimilarSalesCard history={report.priceHistory} epc={report.epc} />
        </div>
      ) : null}
    </Section>
  );
}

function PricePerSqmCard({ estimate, epc, similarSales }: {
  estimate: ReturnType<typeof estimatePropertyValue>;
  epc: NonNullable<FreeReport["epc"]>;
  similarSales: import("@/lib/types").PriceSale[] | undefined;
}) {
  const area = epc.totalFloorArea!;
  const value = estimate?.estimate ?? 0;
  const own = value && area ? Math.round(value / area) : undefined;
  // Postcode comp price/m² requires both price + area; we don't have area for the others, so we
  // fall back to a regional benchmark band based on property type.
  const typeBenchmark =
    /flat|apartment|maisonette/i.test(epc.propertyType ?? "") ? { lo: 5_000, hi: 12_000, label: "UK flat range" }
    : /detached/i.test(epc.builtForm ?? "") ? { lo: 3_500, hi: 7_000, label: "UK detached range" }
    : { lo: 3_500, hi: 8_500, label: "UK average range" };
  return (
    <Card title="Price per m²" subtitle="Estimate / EPC area">
      {own ? (
        <>
          <p className="text-3xl font-extrabold text-gray-900">£{own.toLocaleString()}<span className="text-sm font-bold text-gray-500"> / m²</span></p>
          <p className="text-xs text-gray-500 mb-3">{area} m² floor area</p>
        </>
      ) : (
        <p className="text-xs text-gray-500">Floor area available; value estimate pending.</p>
      )}
      <div className="mt-2 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{typeBenchmark.label}</p>
        <p>£{typeBenchmark.lo.toLocaleString()} – £{typeBenchmark.hi.toLocaleString()} / m²</p>
        {own ? (
          <p className="text-[10px] mt-1">
            {own > typeBenchmark.hi
              ? "Above the typical UK range — premium location."
              : own < typeBenchmark.lo
              ? "Below the typical UK range — possible value or distress signal."
              : "Within the typical UK range for this property type."}
          </p>
        ) : null}
      </div>
      {similarSales && similarSales.length > 0 ? (
        <p className="mt-3 text-[10px] text-gray-400">£/m² for nearby comparables not shown — Land Registry doesn&apos;t hold floor area.</p>
      ) : null}
    </Card>
  );
}

function InitialAssessment({ report }: { report: FreeReport }) {
  const v = buildInitialAssessment(report);
  const hasCautions = v.cautions.length > 0;
  const isHighRisk = v.cautions.length >= 3;
  const borderColour = isHighRisk ? "border-red-300" : hasCautions ? "border-amber-300" : "border-emerald-300";
  const labelColour = isHighRisk ? "text-red-700" : hasCautions ? "text-amber-700" : "text-emerald-700";
  const headlineColour = isHighRisk ? "text-red-700" : hasCautions ? "text-amber-700" : "text-gray-900";
  const recommendationColour = isHighRisk ? "text-red-700 font-bold" : hasCautions ? "text-amber-800 font-semibold" : "text-gray-700";
  const avatarBg = isHighRisk ? "bg-gradient-to-br from-red-500 to-rose-500" : hasCautions ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-400";
  const openUpsell = () => window.dispatchEvent(new Event("phc-open-upsell"));
  const summaryStatus = isHighRisk
    ? `${v.cautions.length} risks flagged`
    : hasCautions
    ? `${v.cautions.length} thing${v.cautions.length === 1 ? "" : "s"} to check`
    : "Looking clean";
  const ctaTone = isHighRisk
    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
    : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500";
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl border-2 ${borderColour} shadow-md p-3.5 sm:p-5 mb-4 sm:mb-6 animate-fade-in`}>
      {/* Header row */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
        <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow`}>
          {isHighRisk ? "⚠" : hasCautions ? "!" : "✓"}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold ${labelColour}`}>Summary</p>
          <p className={`text-sm sm:text-lg font-extrabold leading-snug ${headlineColour}`}>{v.headline}</p>
        </div>
        <span className={`hidden sm:inline-block shrink-0 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isHighRisk ? "bg-red-50 border-red-200 text-red-700" : hasCautions ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          {summaryStatus}
        </span>
      </div>

      {/* Verdict paragraphs */}
      {v.paragraphs.length > 0 ? (
        <div className="mb-3 sm:mb-4">
          {v.paragraphs.map((p, i) => (
            <p key={i} className={`text-xs sm:text-sm leading-relaxed ${recommendationColour} ${i > 0 ? "mt-1.5 sm:mt-2" : ""}`}>
              {renderWithUpsellLink(p, openUpsell)}
            </p>
          ))}
        </div>
      ) : null}

      {/* Two-column positives / negatives */}
      <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
        <SummaryColumn
          tone="positive"
          title="Positives"
          items={v.positives}
          emptyText="No standout positives surfaced — that doesn't mean there aren't any, just that the public datasets don't flag them."
        />
        <SummaryColumn
          tone="negative"
          title="Negatives"
          items={v.cautions}
          emptyText="No risks flagged from the free data sources. Standard searches will still apply during conveyancing."
          footer={
            <button
              type="button"
              onClick={openUpsell}
              className={`mt-2.5 sm:mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.99] ${ctaTone}`}
            >
              See the live HM Land Registry title · £14.99
            </button>
          }
        />
      </div>
    </div>
  );
}

function SummaryColumn({
  tone, title, items, emptyText, footer,
}: {
  tone: "positive" | "negative";
  title: string;
  items: string[];
  emptyText: string;
  footer?: React.ReactNode;
}) {
  const isPositive = tone === "positive";
  const wrap = isPositive
    ? "border-emerald-200 bg-emerald-50/40"
    : "border-red-200 bg-red-50/40";
  const headerTone = isPositive ? "text-emerald-700" : "text-red-700";
  const itemTone = isPositive ? "text-emerald-800" : "text-red-800";
  const dot = isPositive ? "✓" : "⚠";
  const dotBg = isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
  return (
    <div className={`rounded-xl border ${wrap} p-3 sm:p-4 flex flex-col`}>
      <p className={`text-[10px] uppercase tracking-wider font-bold ${headerTone} mb-2`}>{title}</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5 text-sm flex-1">
          {items.map((p, i) => (
            <li key={i} className={`flex gap-2 leading-snug ${itemTone}`}>
              <span className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${dotBg} mt-0.5`}>{dot}</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic flex-1">{emptyText}</p>
      )}
      {footer}
    </div>
  );
}

// Renders a verdict paragraph, turning the literal phrase "live HM Land Registry title"
// into a clickable link that opens the upsell modal.
function renderWithUpsellLink(text: string, onClick: () => void): React.ReactNode {
  const phrase = "live HM Land Registry title";
  const idx = text.toLowerCase().indexOf(phrase);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + phrase.length);
  const after = text.slice(idx + phrase.length);
  return (
    <>
      {before}
      <button
        type="button"
        onClick={onClick}
        className="font-bold underline decoration-2 underline-offset-2 hover:no-underline"
      >
        {match}
      </button>
      {after}
    </>
  );
}

function CharacteristicsCard({ epc }: { epc: NonNullable<FreeReport["epc"]> }) {
  return (
    <Card title="Property type" subtitle="EPC Register">
      <div className="space-y-1.5 text-sm">
        {epc.propertyType ? <Row label="Type" value={epc.propertyType} /> : null}
        {epc.builtForm && !/flat|maisonette/i.test(epc.propertyType ?? "") ? <Row label="Form" value={epc.builtForm} /> : null}
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
    <Section title="Risks &amp; constraints" subtitle="Flood, planning, crime, ground">
      {report.compositeRisk ? <CompositeRiskCard risk={report.compositeRisk} /> : null}
      <div className="grid gap-4 lg:grid-cols-2 min-w-0 mt-4">
        {report.flood ? <FloodCard flood={report.flood} lat={lat} lng={lng} /> : null}
        {report.crime ? <CrimeCard crime={report.crime} lat={lat} lng={lng} /> : null}
        {report.planning && (report.planning.constraints.length > 0 || report.planning.totalApps12m > 0) ? (
          <PlanningCard planning={report.planning} lat={lat} lng={lng} />
        ) : null}
        {report.groundRisk && report.groundRisk.shrinkSwell !== "unknown" ? <GroundRiskCard groundRisk={report.groundRisk} /> : null}
        {report.airQuality ? <AirQualityCard aq={report.airQuality} /> : null}
        {report.listedBuilding?.listed ? <ListedBuildingCard lb={report.listedBuilding} /> : null}
        {isFlatType(report) ? (
          <PremiumLockedCard
            title="EWS1 cladding status"
            tag="Premium"
            tagline="Critical for flat purchases since Grenfell"
            fields={[
              { label: "Building height", placeholder: "10 storeys" },
              { label: "EWS1 form on file", placeholder: "Yes — A1 rating" },
              { label: "Higher-Risk Building", placeholder: "Yes (BSR-registered)" },
              { label: "Assessor", placeholder: "Allianz Engineering" },
              { label: "Last assessed", placeholder: "March 2024" },
            ]}
          />
        ) : null}
        <PremiumLockedCard
          title="Premium environmental flags"
          tag="Premium"
          tagline="Listed, conservation, mining, radon"
          fields={[
            { label: "Listed building grade", placeholder: "Grade II" },
            { label: "Conservation area", placeholder: "Wapping CA" },
            { label: "Tree preservation order", placeholder: "Affected" },
            { label: "Coal mining reporting area", placeholder: "Yes — CON29M" },
            { label: "Radon risk band", placeholder: "Band 3 of 6" },
            { label: "Contaminated land flag", placeholder: "No risk indicated" },
          ]}
        />
      </div>
    </Section>
  );
}

function FinanceSection({ report }: { report: FreeReport }) {
  const estimate = estimatePropertyValue(report);
  const defaultPrice = estimate?.estimate
    ?? report.priceHistory?.sales?.[0]?.price
    ?? report.priceHistory?.similarSales?.[0]?.price
    ?? 350_000;
  const showForecast = !!estimate?.estimate || (report.priceHistory?.sales?.length ?? 0) > 0;
  return (
    <Section title="Finance &amp; affordability" subtitle="Mortgage, energy, insurance, forecast">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        <Card title="Mortgage calculator" subtitle="Indicative monthly payment">
          <MortgageCalculator defaultPrice={defaultPrice} />
        </Card>
        <Card title="Affordability check" subtitle="4.5x income guideline">
          <AffordabilityCheck defaultPrice={defaultPrice} />
        </Card>
        {report.epc?.rating ? (
          <Card title="Energy bill estimate" subtitle="From EPC rating">
            <EnergyBillEstimate epc={{ rating: report.epc.rating, totalFloorArea: report.epc.totalFloorArea, mainHeating: report.epc.mainHeating }} />
          </Card>
        ) : null}
        <Card title="Building insurance estimate" subtitle="Risk-adjusted">
          <InsuranceCostEstimate
            flood={report.flood}
            crime={report.crime}
            groundRisk={report.groundRisk}
            propertyValue={defaultPrice}
          />
        </Card>
        {showForecast ? (
          <Card title="5-year price forecast" subtitle="HPI + comp blend" className="md:col-span-2">
            <PriceForecast
              currentValue={estimate?.estimate ?? defaultPrice}
              priceHistory={report.priceHistory}
              region={report.property.region}
            />
          </Card>
        ) : null}
      </div>
    </Section>
  );
}

function AirQualityCard({ aq }: { aq: NonNullable<FreeReport["airQuality"]> }) {
  const bandTone =
    aq.daqiCategory === "Low" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : aq.daqiCategory === "Moderate" ? "bg-amber-50 border-amber-200 text-amber-700"
    : aq.daqiCategory === "High" ? "bg-orange-50 border-orange-200 text-orange-700"
    : aq.daqiCategory === "Very High" ? "bg-red-50 border-red-200 text-red-700"
    : "bg-gray-50 border-gray-200 text-gray-700";
  return (
    <Card title="Air quality" subtitle={aq.source}>
      {aq.daqiCategory ? (
        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${bandTone}`}>
          {aq.daqiCategory}{aq.daqiBand ? ` (${aq.daqiBand}/10)` : ""}
        </span>
      ) : null}
      <ul className="mt-3 space-y-1 text-xs text-gray-700">
        {aq.no2 != null ? <li className="flex justify-between"><span className="text-gray-500">NO₂</span><span className="font-semibold">{aq.no2.toFixed(1)} µg/m³</span></li> : null}
        {aq.pm25 != null ? <li className="flex justify-between"><span className="text-gray-500">PM2.5</span><span className="font-semibold">{aq.pm25.toFixed(1)} µg/m³</span></li> : null}
      </ul>
      {aq.nearestStation ? (
        <p className="mt-3 text-[10px] text-gray-500">
          Nearest monitoring station: {aq.nearestStation.name} ({aq.nearestStation.distanceKm.toFixed(1)} km away).
        </p>
      ) : null}
      <p className="mt-2 text-[10px] text-gray-400">DAQI = Daily Air Quality Index. WHO 2021 guideline: NO₂ &lt; 10, PM2.5 &lt; 5 µg/m³.</p>
    </Card>
  );
}

function ListedBuildingCard({ lb }: { lb: NonNullable<FreeReport["listedBuilding"]> }) {
  return (
    <Card title="Listed building" subtitle="Historic England">
      <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-50 border-blue-200 text-blue-700">Grade {lb.grade ?? "Listed"}</span>
      {lb.name ? <p className="mt-3 text-sm font-semibold text-gray-900">{lb.name}</p> : null}
      {lb.listDate ? <p className="text-xs text-gray-500">Listed {new Date(lb.listDate).getFullYear()}</p> : null}
      {lb.distance != null ? <p className="text-xs text-gray-500">{lb.distance < 50 ? "On this property" : `${lb.distance} m away`}</p> : null}
      <p className="mt-3 text-xs text-gray-700 leading-relaxed">
        Listed buildings need Listed Building Consent for most external and many internal changes. Higher insurance premiums and stricter renovation rules apply.
      </p>
      {lb.entryUrl ? (
        <a href={lb.entryUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900">
          View listing entry &rarr;
        </a>
      ) : null}
    </Card>
  );
}

function GroundRiskCard({ groundRisk }: { groundRisk: NonNullable<FreeReport["groundRisk"]> }) {
  const ssOrder = ["very-low", "low", "moderate", "significant", "high", "very-high"] as const;
  const idx = ssOrder.indexOf(groundRisk.shrinkSwell as (typeof ssOrder)[number]);
  const label = (
    {"very-low":"Very low","low":"Low","moderate":"Moderate","significant":"Significant","high":"High","very-high":"Very high","unknown":"Unknown"}
  )[groundRisk.shrinkSwell];
  const tone = idx <= 1 ? "emerald" : idx === 2 ? "amber" : "red";
  const toneCls = tone === "red" ? "bg-red-50 border-red-200 text-red-700"
    : tone === "amber" ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";
  return (
    <Card title="Ground / subsidence risk" subtitle="BGS GeoSure">
      <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${toneCls}`}>{label} shrink-swell</span>
      <p className="mt-3 text-xs text-gray-700 leading-relaxed">
        Shrink-swell is the most common cause of UK domestic subsidence — clay-rich soils that swell when wet and shrink when dry, cracking foundations.
        {idx >= 3 ? " A significant or higher rating means insurers will likely ask for a structural survey before quoting." : idx >= 2 ? " Worth getting a Level 2 or Level 3 survey to inspect for any cracking." : " Lower-risk soils make subsidence unlikely from this hazard."}
      </p>
      <p className="mt-2 text-[10px] text-gray-400">Based on British Geological Survey GeoSure dataset (1 km grid).</p>
    </Card>
  );
}

function AreaSection({ report }: { report: FreeReport }) {
  const hasContent = report.imd || report.demographics || report.walkScore || report.lifestyleScores || report.areaTrend || report.noise;
  if (!hasContent) return null;
  return (
    <Section title="Area profile" subtitle="Lifestyle, trend, demographics &amp; environment">
      {report.lifestyleScores ? <LifestyleScoresCard scores={report.lifestyleScores} /> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0 mt-4">
        {report.areaTrend ? <AreaTrendCard trend={report.areaTrend} /> : null}
        {report.imd ? <ImdCard imd={report.imd} /> : null}
        {report.demographics ? <DemographicsCard demo={report.demographics} /> : null}
        {report.demographics?.tenure ? <TenureCard tenure={report.demographics.tenure} /> : null}
        {report.walkScore ? <WalkScoreCard walkScore={report.walkScore} /> : null}
        {report.noise ? <NoiseCard noise={report.noise} /> : null}
      </div>
    </Section>
  );
}

function LifestyleScoresCard({ scores }: { scores: NonNullable<FreeReport["lifestyleScores"]> }) {
  const rows: Array<{ key: keyof Omit<typeof scores, "topPick" | "topPickReason">; label: string; emoji: string }> = [
    { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
    { key: "firstTimeBuyer", label: "First-time buyer", emoji: "🔑" },
    { key: "retiree", label: "Retiree", emoji: "🌳" },
    { key: "commuter", label: "Commuter", emoji: "🚆" },
    { key: "investor", label: "Investor", emoji: "💰" },
  ];
  const mounted = useMounted();
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <p className="text-sm font-bold text-gray-900">Lifestyle scores</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Synthesised from area data</p>
      </div>
      {scores.topPick ? (
        <p className="text-xs text-emerald-700 font-semibold mb-3">
          ★ Strongest fit: {rows.find((r) => r.key === scores.topPick)?.label}.{" "}
          <span className="text-gray-600 font-normal">{scores.topPickReason}</span>
        </p>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {rows.map((r) => {
          const v = scores[r.key];
          const tone = v >= 7 ? "from-emerald-500 to-emerald-600" : v >= 5 ? "from-blue-500 to-cyan-500" : v >= 3 ? "from-amber-500 to-orange-500" : "from-rose-500 to-rose-600";
          return (
            <div key={r.key} className="text-center">
              <p className="text-3xl mb-1">{r.emoji}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold leading-tight">{r.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1 tabular-nums">{v.toFixed(1)}<span className="text-xs text-gray-400">/10</span></p>
              <div className="mt-1 w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${tone} transition-all duration-700 ease-out`} style={{ width: mounted ? `${v * 10}%` : "0%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AreaTrendCard({ trend }: { trend: NonNullable<FreeReport["areaTrend"]> }) {
  const tone = trend.direction === "improving" ? "emerald" : trend.direction === "declining" ? "red" : "gray";
  const cls = tone === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : tone === "red" ? "bg-red-50 border-red-200 text-red-700"
    : "bg-gray-50 border-gray-200 text-gray-700";
  const arrow = trend.direction === "improving" ? "▲" : trend.direction === "declining" ? "▼" : "→";
  return (
    <Card title="Area trend" subtitle="Synthesised signal">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${cls} text-sm font-bold`}>
        {arrow} {trend.direction[0].toUpperCase()}{trend.direction.slice(1)}
      </div>
      <p className="mt-3 text-[10px] text-gray-500">Composite score {trend.score} / 100 (50 = neutral)</p>
      <ul className="mt-3 space-y-1 text-xs text-gray-700">
        {trend.drivers.map((d, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="shrink-0 text-gray-400">·</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">Combines crime YoY trend, IMD decile, approved planning pipeline, and price growth vs UK average.</p>
    </Card>
  );
}

function NoiseCard({ noise }: { noise: NonNullable<FreeReport["noise"]> }) {
  const tone = noise.overallLevel === "very-noisy" ? "text-red-700 bg-red-50 border-red-200"
    : noise.overallLevel === "noisy" ? "text-orange-700 bg-orange-50 border-orange-200"
    : noise.overallLevel === "moderate" ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-emerald-700 bg-emerald-50 border-emerald-200";
  const label = noise.overallLevel === "very-noisy" ? "Very noisy"
    : noise.overallLevel === "noisy" ? "Noisy"
    : noise.overallLevel === "moderate" ? "Moderate"
    : "Quiet";
  return (
    <Card title="Noise" subtitle="Defra Strategic Noise Mapping">
      <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${tone}`}>{label}</span>
      <p className="mt-3 text-xs text-gray-700 leading-relaxed">{noise.verdict}</p>
      <ul className="mt-3 space-y-1 text-xs text-gray-700">
        {noise.roadNoiseLden != null ? <li className="flex justify-between"><span className="text-gray-500">Road noise (Lden)</span><span className="font-semibold tabular-nums">{noise.roadNoiseLden} dB</span></li> : null}
        {noise.roadNoiseLnight != null ? <li className="flex justify-between"><span className="text-gray-500">Road noise (night)</span><span className="font-semibold tabular-nums">{noise.roadNoiseLnight} dB</span></li> : null}
        {noise.railNoiseLden != null ? <li className="flex justify-between"><span className="text-gray-500">Rail noise (Lden)</span><span className="font-semibold tabular-nums">{noise.railNoiseLden} dB</span></li> : null}
      </ul>
      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">Defra Round 4 strategic noise mapping. WHO threshold for sleep disturbance is 45 dB Lnight.</p>
    </Card>
  );
}

function TenureCard({ tenure }: { tenure: NonNullable<NonNullable<FreeReport["demographics"]>["tenure"]> }) {
  const owner = tenure.ownerOccupiedPct ?? 0;
  const social = tenure.socialRentPct ?? 0;
  const priv = tenure.privateRentPct ?? 0;
  const [hover, setHover] = useState<"owner" | "priv" | "social" | null>(null);
  const segments = [
    { key: "owner" as const, label: "Owner-occupied", pct: owner, color: "bg-emerald-500", dot: "bg-emerald-500" },
    { key: "priv" as const, label: "Private rent", pct: priv, color: "bg-amber-400", dot: "bg-amber-400" },
    { key: "social" as const, label: "Social rent", pct: social, color: "bg-blue-400", dot: "bg-blue-400" },
  ];
  const mounted = useMounted();
  return (
    <Card title="Tenure mix" subtitle="ONS Census 2021">
      <p className="text-3xl font-extrabold text-gray-900 transition-all" style={{ animation: mounted ? "count-up 400ms ease-out" : undefined }}>{owner}%</p>
      <p className="text-xs text-gray-500 mb-3">owner-occupied households</p>
      <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-gray-200 group" onMouseLeave={() => setHover(null)}>
        {segments.map((s) => (
          <button
            key={s.key}
            type="button"
            onMouseEnter={() => setHover(s.key)}
            onFocus={() => setHover(s.key)}
            className={`h-full ${s.color} transition-all duration-700 ease-out ${hover && hover !== s.key ? "opacity-50" : ""} ${hover === s.key ? "brightness-110" : ""}`}
            style={{ width: mounted ? `${s.pct}%` : "0%", transitionDelay: `${segments.indexOf(s) * 80}ms` }}
            aria-label={`${s.label}: ${s.pct}%`}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-gray-700">
        {segments.map((s) => (
          <li
            key={s.key}
            className={`flex items-center gap-2 px-1.5 py-0.5 -mx-1.5 rounded transition-colors cursor-default ${hover === s.key ? "bg-gray-100" : ""}`}
            onMouseEnter={() => setHover(s.key)}
            onMouseLeave={() => setHover(null)}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${s.dot}`} /> {s.label} <span className="ml-auto font-bold">{s.pct}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-gray-500">High owner-occupancy usually means more settled neighbours and slower turnover.</p>
    </Card>
  );
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(t); }, []);
  return m;
}

function WalkScoreCard({ walkScore }: { walkScore: NonNullable<FreeReport["walkScore"]> }) {
  const tone = walkScore.score >= 80 ? "text-emerald-700" : walkScore.score >= 60 ? "text-blue-700" : walkScore.score >= 35 ? "text-amber-700" : "text-red-700";
  return (
    <Card title="Walkability" subtitle="OpenStreetMap density">
      <p className={`text-3xl font-extrabold ${tone}`}>{walkScore.score}<span className="text-base font-bold text-gray-500"> / 100</span></p>
      <p className={`text-xs font-semibold ${tone}`}>{walkScore.band}</p>
      <ul className="mt-3 pt-3 border-t border-gray-100 space-y-0.5 text-xs text-gray-700">
        {walkScore.amenities.filter((a) => a.count > 0).slice(0, 7).map((a) => (
          <li key={a.type} className="flex justify-between gap-2">
            <span className="text-gray-600">{a.type}</span>
            <span className="font-semibold">{a.count}{a.nearestM ? ` · ${a.nearestM < 1000 ? `${a.nearestM} m` : `${(a.nearestM / 1000).toFixed(1)} km`}` : ""}</span>
          </li>
        ))}
      </ul>
    </Card>
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
    <Section title="Connectivity &amp; commute" subtitle="Broadband, mobile, transport">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {report.broadband ? <BroadbandCard broadband={report.broadband} /> : null}
        {report.mobile && report.mobile.operators.length > 0 ? <MobileCard mobile={report.mobile} /> : null}
        {report.transport ? <TransportCard transport={report.transport} /> : null}
        {report.evCharging && report.evCharging.count > 0 ? <EvChargingCard ev={report.evCharging} /> : null}
      </div>
      <div className="mt-4 bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-gray-900">Commute checker</p>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold shrink-0">OSRM &amp; TfL</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">Type any UK postcode (work, school, gym) and we&apos;ll calculate driving, public transport, cycling and walking times from this property.</p>
        <CommuteChecker fromPostcode={report.property.postcode} />
      </div>
    </Section>
  );
}

function EvChargingCard({ ev }: { ev: NonNullable<FreeReport["evCharging"]> }) {
  return (
    <Card title="EV charging nearby" subtitle="Open Charge Map">
      <p className="text-3xl font-extrabold text-gray-900">{ev.count}</p>
      <p className="text-xs text-gray-500 mb-3">charging points within 2 miles</p>
      <ul className="space-y-1 text-xs text-gray-700">
        <li className="flex justify-between"><span>Rapid (50+ kW)</span><span className="font-semibold">{ev.rapidChargers}</span></li>
        <li className="flex justify-between"><span>Fast (7-22 kW)</span><span className="font-semibold">{ev.fastChargers}</span></li>
      </ul>
      {ev.nearest ? (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Nearest</p>
          <p className="text-sm text-gray-800 font-semibold truncate">{ev.nearest.name}</p>
          <p className="text-xs text-gray-500">
            {(ev.nearest.distanceM / 1000).toFixed(1)} km
            {ev.nearest.powerKw ? ` · ${ev.nearest.powerKw} kW` : ""}
            {ev.nearest.operator ? ` · ${ev.nearest.operator}` : ""}
          </p>
        </div>
      ) : null}
    </Card>
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

/**
 * Inline premium upsell tile. Renders inside a section grid like a normal Card,
 * but shows blurred placeholder values + a lock + CTA. Click anywhere on the
 * card opens the existing PremiumModal (via the phc-open-upsell event).
 */
function RentalYieldCard({ rental }: { rental: NonNullable<FreeReport["rentalEstimate"]> }) {
  const yieldTone =
    rental.grossYieldPct == null ? "text-gray-700"
    : rental.grossYieldPct >= 5 ? "text-emerald-700"
    : rental.grossYieldPct >= 3 ? "text-amber-700"
    : "text-red-700";
  const yieldLabel =
    rental.grossYieldPct == null ? null
    : rental.grossYieldPct >= 5 ? "Strong yield"
    : rental.grossYieldPct >= 3 ? "Moderate yield"
    : "Weak yield";
  return (
    <Card title="Rental yield estimate" subtitle="PropertyData (Rightmove + Zoopla)">
      <div className="flex items-baseline gap-2 mb-1">
        <p className="text-3xl font-extrabold text-gray-900 tabular-nums">£{rental.monthlyRent.toLocaleString()}</p>
        <p className="text-xs text-gray-500">/ month</p>
      </div>
      {rental.low != null && rental.high != null ? (
        <p className="text-xs text-gray-500 mb-3">Typical range £{rental.low.toLocaleString()} – £{rental.high.toLocaleString()}</p>
      ) : null}
      {rental.grossYieldPct != null ? (
        <div className="mt-2 pt-3 border-t border-gray-100">
          <p className={`text-2xl font-extrabold ${yieldTone}`}>{rental.grossYieldPct}%</p>
          <p className={`text-xs font-semibold ${yieldTone}`}>Gross yield · {yieldLabel}</p>
          <p className="text-[10px] text-gray-500 mt-1">Yield = annual rent ÷ purchase-price estimate.</p>
        </div>
      ) : null}
      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
        Based on {rental.sampleSize ?? "live"} comparable rentals in this {rental.granularity ?? "postcode"}.
        UK landlord profitability rule of thumb: 5%+ gross is investor-grade, 3-5% is moderate, &lt;3% relies on capital appreciation.
      </p>
    </Card>
  );
}

/**
 * Neutral redacted placeholders for the Title register teaser. Values are
 * obfuscated so the card never claims a specific tenure/owner when blurred.
 * The real values arrive after the Premium £14.99 purchase.
 */
function titleRegisterTeaserFields(report: FreeReport): Array<{ label: string; placeholder: string }> {
  const flat = isFlatType(report);
  return [
    { label: "Title number", placeholder: "•••••••" },
    { label: "Tenure", placeholder: flat ? "•••••••••" : "•••••••" },
    ...(flat
      ? [{ label: "Lease years remaining", placeholder: "••• yrs" }]
      : []),
    { label: "Registered owners", placeholder: "•••••••• ••••••••" },
    { label: "Charges (mortgages)", placeholder: "• registered" },
    { label: "Restrictive covenants", placeholder: "• found" },
  ];
}

function isLikelyLeasehold(report: FreeReport): boolean {
  // Fast heuristic — any flat is leasehold-by-default in England/Wales, and any
  // sale record marked leasehold tenure confirms it. Houses can also be leasehold
  // (Northern leasehold houses), surfaced via the same record.
  const t = report.epc?.propertyType?.toLowerCase() ?? "";
  if (t.includes("flat") || t.includes("maisonette")) return true;
  const sales = report.priceHistory?.sales ?? [];
  return sales.some((s) => s.tenure === "L");
}

function isFlatType(report: FreeReport): boolean {
  const t = report.epc?.propertyType?.toLowerCase() ?? "";
  return t.includes("flat") || t.includes("maisonette");
}

function CompositeRiskCard({ risk }: { risk: NonNullable<FreeReport["compositeRisk"]> }) {
  const tone = risk.band === "very-high" ? "from-red-500 to-rose-600 text-white"
    : risk.band === "high" ? "from-orange-500 to-red-500 text-white"
    : risk.band === "moderate" ? "from-amber-400 to-orange-500 text-white"
    : risk.band === "low" ? "from-blue-500 to-cyan-400 text-white"
    : "from-emerald-500 to-teal-400 text-white";
  const bandLabel = risk.band.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
  const mounted = useMounted();
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 sm:p-5 shadow-md`}>
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <p className="text-xs uppercase tracking-wider font-bold opacity-80">Composite risk score</p>
        <p className="text-xs uppercase tracking-wider font-bold opacity-70">Synthesised</p>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-5xl font-extrabold tabular-nums" style={{ animation: mounted ? "count-up 400ms ease-out" : undefined }}>{risk.score}<span className="text-xl font-bold opacity-70">/100</span></p>
        <p className="text-xl font-bold">{bandLabel} risk</p>
      </div>
      {risk.contributors.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-xs">
          {risk.contributors.map((c, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <span className="opacity-70 tabular-nums w-6 shrink-0">+{c.weight}</span>
              <span className="flex-1">
                <span className="font-semibold">{c.label}</span>
                {c.note ? <span className="opacity-80 ml-1">— {c.note}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs opacity-90">No risk flags surfaced by automated checks. Standard conveyancing searches still apply.</p>
      )}
      <p className="mt-3 text-[10px] opacity-70 leading-relaxed">Aggregates flood zone, ground risk, air quality, crime, listed status, and planning churn into a single 0-100 gauge. Lower = safer.</p>
    </div>
  );
}

function PremiumLockedCard({
  title, tag, tagline, fields, className = "",
}: {
  title: string;
  tag?: string;
  tagline?: string;
  fields: Array<{ label: string; placeholder: string }>;
  className?: string;
}) {
  const open = () => window.dispatchEvent(new Event("phc-open-upsell"));
  return (
    <button
      type="button"
      onClick={open}
      className={`group relative bg-white rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-xl shadow-blue-500/10 p-4 sm:p-5 text-left overflow-hidden min-w-0 transition-all duration-300 cursor-pointer ${className}`}
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
        {tag ? (
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0">
            {tag}
          </span>
        ) : null}
      </div>

      {/* Blurred placeholder fields */}
      <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(5px)" }} aria-hidden="true">
        {fields.map((f, i) => (
          <div key={i} className="flex justify-between gap-2 text-sm">
            <span className="text-gray-500">{f.label}</span>
            <span className="font-bold text-gray-900 tabular-nums">{f.placeholder}</span>
          </div>
        ))}
      </div>

      {/* Lock + CTA overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 bg-gradient-to-b from-white/40 via-white/60 to-white/85 group-hover:from-white/30 group-hover:via-white/55 group-hover:to-white/85 transition-all">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c.55 0 1 .45 1 1v3a1 1 0 01-2 0v-3c0-.55.45-1 1-1zm6-3V7a6 6 0 10-12 0v1H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V9a1 1 0 00-1-1h-2zM8 7a4 4 0 118 0v1H8V7z" />
          </svg>
        </div>
        {tagline ? <p className="text-[11px] text-gray-700 font-medium text-center max-w-[260px] leading-snug">{tagline}</p> : null}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:from-blue-600 group-hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
          Unlock with Premium · £14.99
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}

// =====================================================================
// CARDS
// =====================================================================
function SalesCard({ history, estimate, hasOwnSales }: {
  history: FreeReport["priceHistory"];
  estimate: ReturnType<typeof estimatePropertyValue>;
  hasOwnSales: boolean;
}) {
  const sales = history?.sales ?? [];
  const sortedAsc = [...sales].sort((a, b) => a.date.localeCompare(b.date));
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
    <Card title="This property's sales history" subtitle="HM Land Registry">
      {estimate ? (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-3 mb-3">
          <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Estimated value today</p>
          <p className="text-2xl font-extrabold text-gray-900">£{estimate.estimate.toLocaleString()}</p>
          <p className="text-xs text-gray-600">£{estimate.lowEnd.toLocaleString()} – £{estimate.highEnd.toLocaleString()} · {estimate.confidence} confidence</p>
        </div>
      ) : null}
      {hasOwnSales && latest ? (
        <>
          <p className="text-xs text-gray-500 mb-1">Last sold</p>
          <p className="text-xl font-extrabold text-gray-900">£{latest.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mb-3">{new Date(latest.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          {bars.length > 1 ? <MiniBarChart bars={bars} formatValue={(v) => `£${v.toLocaleString()}`} height={70} /> : null}
          {growthPct !== undefined && yearsBetween !== undefined && yearsBetween > 1 ? (
            <p className="mt-2 text-xs">
              <span className={growthPct >= 0 ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                {growthPct >= 0 ? "+" : ""}{growthPct}%
              </span>
              <span className="text-gray-500"> over {yearsBetween.toFixed(0)} years ({(growthPct / yearsBetween).toFixed(1)}%/yr)</span>
            </p>
          ) : null}
          {sales.length > 1 ? (
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {sales.slice(0, 5).map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                  <span className="font-semibold text-gray-700">£{s.price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">No recorded sales for this exact address</p>
          <p>HM Land Registry only holds residential sale prices from 1995 onwards. This property may never have been sold (e.g. original-owner-occupied) or pre-dates the dataset. Comparable sales for similar properties in the same postcode are shown below.</p>
        </div>
      )}
      {history?.postcodeMedian ? (
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
    </Card>
  );
}

function SimilarSalesCard({ history, epc }: {
  history: NonNullable<FreeReport["priceHistory"]>;
  epc: FreeReport["epc"];
}) {
  const all = history.similarSales ?? [];
  const myRooms = epc?.habitableRooms;
  const myArea = epc?.totalFloorArea;
  const [showAll, setShowAll] = useState(false);

  const { matched, matchedBy } = useMemo(() => {
    // Prefer rooms match when both sides have it.
    if (myRooms) {
      const byRooms = all.filter((s) => s.habitableRooms != null && s.habitableRooms === myRooms);
      if (byRooms.length >= 3) return { matched: byRooms, matchedBy: "rooms" as const };
    }
    // Fallback: floor area within ±15% of this property's area.
    if (myArea) {
      const lo = myArea * 0.85, hi = myArea * 1.15;
      const byArea = all.filter((s) => s.floorAreaM2 != null && s.floorAreaM2 >= lo && s.floorAreaM2 <= hi);
      if (byArea.length >= 3) return { matched: byArea, matchedBy: "area" as const };
    }
    return { matched: all, matchedBy: "none" as const };
  }, [all, myRooms, myArea]);

  const visible = showAll || matchedBy === "none" ? all : matched;
  if (visible.length === 0) return null;

  const PROP_TYPE_LABEL: Record<string, string> = {
    D: "Detached", S: "Semi-detached", T: "Terraced", F: "Flat / Maisonette", O: "Other",
  };
  const matchType = epc?.propertyType ? `Same property type as your ${epc.propertyType.toLowerCase()}` : "Similar property type";
  const filterText = !showAll
    ? matchedBy === "rooms" ? ` · same room count (${myRooms} habitable rooms)`
    : matchedBy === "area" ? ` · similar size (${Math.round(myArea! * 0.85)}–${Math.round(myArea! * 1.15)} m²)`
    : ""
    : "";
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className="text-sm font-bold text-gray-900">Similar properties sold nearby</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold shrink-0">HM Land Registry + EPC</p>
      </div>
      <p className="text-xs text-gray-500 mb-3">{matchType}{filterText} · same postcode · most recent first</p>
      <p className="sm:hidden text-[10px] text-gray-400 mb-1.5 italic">Swipe right to see prices &rarr;</p>
      <div className="relative -mx-4 sm:-mx-5">
        <div className="overflow-x-auto pb-1">
          <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <th className="text-left px-4 sm:px-5 py-2">Address</th>
              <th className="text-left px-2 py-2">Type</th>
              <th className="text-right px-2 py-2">Rooms</th>
              <th className="text-right px-2 py-2">Area</th>
              <th className="text-right px-4 sm:px-5 py-2">Sold</th>
              <th className="text-right px-4 sm:px-5 py-2">Price</th>
              <th className="text-right px-4 sm:px-5 py-2">£/m²</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {visible.slice(0, 12).map((s, i) => {
              const addr = [s.saon, s.paon, s.street].filter(Boolean).join(", ");
              const ppsm = s.floorAreaM2 ? Math.round(s.price / s.floorAreaM2) : undefined;
              const isMatch =
                (myRooms != null && s.habitableRooms === myRooms) ||
                (myArea != null && s.floorAreaM2 != null && Math.abs(s.floorAreaM2 - myArea) <= myArea * 0.15);
              return (
                <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${isMatch ? "bg-emerald-50/40" : ""}`}>
                  <td className="px-4 sm:px-5 py-2 text-gray-800 truncate max-w-[200px]">{addr}</td>
                  <td className="px-2 py-2 text-gray-600">{s.propertyType ? PROP_TYPE_LABEL[s.propertyType] : "—"}</td>
                  <td className="px-2 py-2 text-right text-gray-700 font-semibold">{s.habitableRooms ?? "—"}</td>
                  <td className="px-2 py-2 text-right text-gray-600">{s.floorAreaM2 ? `${s.floorAreaM2} m²` : "—"}</td>
                  <td className="px-4 sm:px-5 py-2 text-right text-gray-600">{new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</td>
                  <td className="px-4 sm:px-5 py-2 text-right font-bold text-gray-900">£{s.price.toLocaleString()}</td>
                  <td className="px-4 sm:px-5 py-2 text-right text-gray-500">{ppsm ? `£${ppsm.toLocaleString()}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {/* Right-edge fade hint for horizontal scroll */}
        <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
      </div>
      {matchedBy !== "none" && all.length > matched.length ? (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900"
        >
          {showAll
            ? `Show only matching size (${matched.length})`
            : `Show all nearby sales (${all.length}, including different sizes)`}
          &nbsp;&rarr;
        </button>
      ) : null}
      <p className="mt-3 text-[10px] text-gray-500 leading-relaxed">
        {myArea || myRooms
          ? `Your property: ${myRooms ? `${myRooms} habitable rooms` : ""}${myRooms && myArea ? ", " : ""}${myArea ? `${myArea} m²` : ""}. Filtering by ${matchedBy === "rooms" ? "habitable rooms" : matchedBy === "area" ? "floor area within ±15%" : "no size filter (defaulting to all)"}. Land Registry doesn't expose bedrooms; we cross-reference EPC for habitable rooms (bedrooms + living rooms) and floor area.`
          : "Habitable rooms and floor area shown where the EPC record exists. Land Registry doesn't hold these directly."}
      </p>
    </div>
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
        {epc.habitableRooms ? <li className="flex justify-between"><span>Habitable rooms</span><span className="font-semibold text-gray-700">{epc.habitableRooms}</span></li> : null}
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
  // Use short labels under each bar (full label still surfaces in the hover tooltip
  // via MiniBarChart's `label` field after we pass it through `sublabel`).
  const CRIME_SHORT: Record<string, string> = {
    "Anti Social Behaviour": "Anti-social",
    "Anti-Social Behaviour": "Anti-social",
    "Violent Crime": "Violent",
    "Violence And Sexual Offences": "Violent",
    "Vehicle Crime": "Vehicle",
    "Criminal Damage Arson": "Damage",
    "Other Theft": "Theft",
    "Theft From The Person": "Pickpocket",
    "Public Order": "Public order",
    "Shoplifting": "Shoplifting",
    "Burglary": "Burglary",
    "Bicycle Theft": "Bike theft",
    "Drugs": "Drugs",
    "Robbery": "Robbery",
    "Possession Of Weapons": "Weapons",
    "Other Crime": "Other",
  };
  const bars = top6.map((c) => ({
    label: CRIME_SHORT[c.category] ?? c.category.split(" ").slice(0, 1).join(" "),
    sublabel: c.category,
    value: c.count,
  }));
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

  const trend = crime.trendPct;
  const trendTone =
    trend == null ? "bg-gray-50 border-gray-200 text-gray-700"
    : trend > 10 ? "bg-red-50 border-red-200 text-red-700"
    : trend > 2 ? "bg-amber-50 border-amber-200 text-amber-700"
    : trend < -2 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-gray-50 border-gray-200 text-gray-700";

  return (
    <Card title="Crime (12 months)" subtitle="data.police.uk">
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{crime.totalIncidents.toLocaleString()}</p>
        <p className="text-xs text-gray-500">incidents within ~1 mile</p>
      </div>
      {trend != null ? (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-full border ${trendTone}`}>
            {trend > 0 ? "▲" : trend < 0 ? "▼" : "•"} {trend > 0 ? "+" : ""}{trend.toFixed(1)}% YoY
          </span>
          <span className="text-[11px] text-gray-500">
            vs {crime.priorTotalIncidents?.toLocaleString() ?? "—"} in prior 12 months
          </span>
        </div>
      ) : null}
      {crime.monthlyCounts && crime.monthlyCounts.length >= 12 ? (
        <CrimeSparkline counts={crime.monthlyCounts} />
      ) : null}
      <PropertyMap
        lat={lat} lng={lng} zoom={15} height={300}
        radius={1609}
        crimePins={pins}
        legend={legend}
      />
      {pins.length > 0 ? (
        <p className="mt-2 text-xs text-gray-500">Each dot = one reported incident in the last 2 months. Total includes all 12 months.</p>
      ) : null}
      <div className="mt-3 grid lg:grid-cols-2 gap-4 min-w-0">
        <ul className="space-y-1 text-xs text-gray-600 min-w-0">
          {top6.slice(0, 6).map((c) => (
            <li key={c.category} className="flex items-baseline justify-between gap-3 min-w-0 leading-snug">
              <span className="min-w-0 break-words">{c.category}</span>
              <span className="font-semibold text-gray-700 shrink-0 tabular-nums">{c.count.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 mb-1">Breakdown by category</p>
          <MiniBarChart bars={bars} height={70} />
        </div>
      </div>
    </Card>
  );
}

function CrimeSparkline({ counts }: { counts: { month: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320, H = 60, PAD = 4;
  const max = Math.max(...counts.map((c) => c.count), 1);
  const barW = (W - PAD * 2) / counts.length;
  const halfIdx = Math.floor(counts.length / 2);
  return (
    <div className="mb-3 relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="24-month crime trend">
        {counts.map((c, i) => {
          const h = max > 0 ? (c.count / max) * (H - PAD * 2 - 8) : 0;
          const isPrior = i < halfIdx;
          const isHover = hover === i;
          return (
            <g key={i}>
              <rect
                x={PAD + i * barW + 0.5}
                y={H - PAD - h}
                width={Math.max(barW - 1, 1)}
                height={h}
                fill={isPrior ? "#cbd5e1" : "#475569"}
                opacity={isHover ? 1 : 0.85}
                style={{ transition: "opacity 120ms ease" }}
              />
              <rect
                x={PAD + i * barW}
                y={0}
                width={barW}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
              />
            </g>
          );
        })}
        {/* Divider between prior 12 and current 12 */}
        <line x1={PAD + halfIdx * barW} y1={PAD} x2={PAD + halfIdx * barW} y2={H - PAD} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="2 2" />
      </svg>
      <div className="flex justify-between text-[9px] text-gray-400 -mt-1 px-1">
        <span>{counts[0]?.month ?? ""}</span>
        <span>prior 12 ⟼ current 12</span>
        <span>{counts[counts.length - 1]?.month ?? ""}</span>
      </div>
      {hover != null && counts[hover] ? (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold shadow-xl whitespace-nowrap animate-fade-in"
          style={{
            left: `${((hover + 0.5) / counts.length) * 100}%`,
            top: -2,
            transform: hover < counts.length * 0.15 ? "translate(0, -100%)" : hover > counts.length * 0.85 ? "translate(-100%, -100%)" : "translate(-50%, -100%)",
          }}
        >
          {counts[hover].month}: {counts[hover].count} incidents
        </div>
      ) : null}
    </div>
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
                <p className="font-semibold text-gray-800 line-clamp-2 break-words">{a.address || a.reference}</p>
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
      {planning.pipeline && planning.pipeline.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-900 mb-1">Forward pipeline — major schemes within 1 km</p>
          <p className="text-[11px] text-gray-500 mb-2">
            Permitted in the last 5 years; many will still be under construction or yet to start. Could change views, traffic, or character of the area.
          </p>
          <ul className="space-y-2 text-xs">
            {planning.pipeline.slice(0, 6).map((p) => (
              <li key={p.reference} className="flex items-start gap-2 leading-snug">
                <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mt-0.5">
                  {p.units && p.units > 0 ? p.units : "✓"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 line-clamp-2 break-words">{p.description}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {p.distance != null ? `${p.distance < 1000 ? `${p.distance} m` : `${(p.distance / 1000).toFixed(1)} km`} away` : "nearby"}
                    {p.decisionDate ? ` · permitted ${p.decisionDate.slice(0, 7)}` : ""}
                    {p.units ? ` · ${p.units} unit${p.units === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

function ImdCard({ imd }: { imd: NonNullable<FreeReport["imd"]> }) {
  const decileTone =
    imd.decile >= 8 ? "text-emerald-700" : imd.decile >= 5 ? "text-blue-700" : imd.decile >= 3 ? "text-amber-700" : "text-red-700";
  const decileLabel =
    imd.decile >= 8 ? "Low deprivation" : imd.decile >= 5 ? "Below average" : imd.decile >= 3 ? "Above average" : "High deprivation";
  const mounted = useMounted();
  const [hover, setHover] = useState<string | null>(null);
  const domains = [
    { k: "Income", v: imd.domains.income, hint: "How many households are on low incomes." },
    { k: "Employment", v: imd.domains.employment, hint: "How much of the working-age population is out of work." },
    { k: "Education", v: imd.domains.education, hint: "Skills and qualifications of locals." },
    { k: "Health", v: imd.domains.health, hint: "Health outcomes — life expectancy, illness rates." },
    { k: "Crime", v: imd.domains.crime, hint: "Risk of personal/property crime." },
    { k: "Housing access", v: imd.domains.barriers, hint: "Barriers to good housing — affordability, distance to services." },
    { k: "Living environment", v: imd.domains.livingEnvironment, hint: "Air quality, road safety, housing condition." },
  ];
  return (
    <Card title="Deprivation (IMD)" subtitle="MHCLG IMD 2025">
      <p className={`text-3xl font-extrabold ${decileTone}`} style={{ animation: mounted ? "count-up 400ms ease-out" : undefined }}>{imd.decile}<span className="text-base font-bold text-gray-500"> / 10</span></p>
      <p className={`text-xs font-semibold ${decileTone}`}>{decileLabel}</p>
      <p className="text-xs text-gray-500 mb-3 mt-1">10 = least deprived</p>
      <div className="space-y-1 text-xs">
        {domains.map((d, i) => {
          const tone = d.v >= 7 ? "bg-emerald-500" : d.v >= 4 ? "bg-amber-500" : "bg-red-500";
          const isHover = hover === d.k;
          return (
            <div
              key={d.k}
              className={`relative flex items-center gap-2 px-1 py-1 -mx-1 rounded transition-colors ${isHover ? "bg-gray-50" : ""}`}
              onMouseEnter={() => setHover(d.k)}
              onMouseLeave={() => setHover(null)}
            >
              <span className={`shrink-0 w-32 transition-colors ${isHover ? "text-gray-900 font-semibold" : "text-gray-600"}`}>{d.k}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${tone} transition-all duration-700 ease-out ${isHover ? "brightness-110" : ""}`}
                  style={{ width: mounted ? `${d.v * 10}%` : "0%", transitionDelay: `${i * 60}ms` }}
                />
              </div>
              <span className="w-6 text-right font-semibold text-gray-700">{d.v}</span>
              {isHover ? (
                <div className="absolute left-0 right-0 top-full mt-1 z-10 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] shadow-xl animate-fade-in">
                  {d.hint}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DemographicsCard({ demo }: { demo: NonNullable<FreeReport["demographics"]> }) {
  return (
    <Card title="Local population" subtitle={demo.source}>
      <p className="text-3xl font-extrabold text-gray-900">{demo.population.toLocaleString()}</p>
      <p className="text-xs text-gray-500">Usual residents (LSOA)</p>
      {(demo.medianAge != null || demo.medianHouseholdIncome != null) ? (
        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-700">
          {demo.medianAge != null ? (
            <li className="flex justify-between gap-2">
              <span className="text-gray-500">Median age</span>
              <span className="font-semibold">{demo.medianAge}</span>
            </li>
          ) : null}
          {demo.medianHouseholdIncome != null ? (
            <li className="flex justify-between gap-2">
              <span className="text-gray-500">Median household income</span>
              <span className="font-semibold">£{demo.medianHouseholdIncome.toLocaleString()}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="mt-3 text-xs text-gray-600">
        LSOA area, ~1,500 residents on average. Used for IMD and Census 2021 stats.
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
              <span className="block text-gray-800 font-medium text-xs leading-snug line-clamp-2 break-words">{s.name}</span>
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

function PremiumToolkitSection() {
  const open = () => window.dispatchEvent(new Event("phc-open-upsell"));
  return (
    <Section title="Premium toolkit" subtitle="Buyer's actions, included with the £14.99 paid report">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        {/* AI questions teaser */}
        <button
          type="button"
          onClick={open}
          className="group relative bg-white rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-xl shadow-blue-500/10 p-4 sm:p-5 text-left overflow-hidden min-w-0 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-gray-900">AI: questions to ask the seller</p>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0">Premium</span>
          </div>
          <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(5px)" }} aria-hidden="true">
            <div className="text-xs text-gray-700 italic">"Was the £85k charge from Mary Dixon Ltd on 23/03/2019 ever discharged? Show the deed of release."</div>
            <div className="text-xs text-gray-700 italic">"Why did the property sell for £250k in Nov 2012 then £422.5k in Nov 2016 — a 70% rise vs ~25% UK average over the period?"</div>
            <div className="text-xs text-gray-700 italic">"Confirm the ground rent escalation clause and the most recent service charge accounts (last 3 years)."</div>
            <div className="text-xs text-gray-700 italic">"Has the building been flooded in living memory, and what's the current buildings insurance premium?"</div>
            <div className="text-xs text-gray-400 italic">+ 6-8 more bespoke questions based on this property…</div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 bg-gradient-to-b from-white/40 via-white/60 to-white/85 group-hover:from-white/30 group-hover:via-white/55 group-hover:to-white/85 transition-all">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c.55 0 1 .45 1 1v3a1 1 0 01-2 0v-3c0-.55.45-1 1-1zm6-3V7a6 6 0 10-12 0v1H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V9a1 1 0 00-1-1h-2zM8 7a4 4 0 118 0v1H8V7z" />
              </svg>
            </div>
            <p className="text-[11px] text-gray-700 font-medium text-center max-w-[280px] leading-snug">
              8-12 sharp, lawyer-style questions tailored to THIS property's flags
            </p>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:from-blue-600 group-hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all">
              Unlock with Premium · £14.99
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>

        {/* Solicitor PDF teaser */}
        <button
          type="button"
          onClick={open}
          className="group relative bg-white rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-xl shadow-blue-500/10 p-4 sm:p-5 text-left overflow-hidden min-w-0 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-gray-900">Solicitor handover pack</p>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0">Premium</span>
          </div>
          <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(5px)" }} aria-hidden="true">
            <p className="text-xs font-bold text-gray-900">Critical findings (3)</p>
            <p className="text-[11px] text-gray-600">• Charges register: 2 entries — confirm DS1/E-DS1 on completion</p>
            <p className="text-[11px] text-gray-600">• Restrictive covenants present — review enforceability</p>
            <p className="text-[11px] text-gray-600">• Flood Zone 2 — order Environmental search</p>
            <p className="text-xs font-bold text-gray-900 mt-2">Recommended searches (5)</p>
            <p className="text-[11px] text-gray-600">CON29 + LLC1 · CON29DW · LPE1 · CON29M · OS1</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 bg-gradient-to-b from-white/40 via-white/60 to-white/85 group-hover:from-white/30 group-hover:via-white/55 group-hover:to-white/85 transition-all">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[11px] text-gray-700 font-medium text-center max-w-[280px] leading-snug">
              One-page brief formatted for your conveyancer's instruction email
            </p>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:from-blue-600 group-hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all">
              Unlock with Premium · £14.99
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </Section>
  );
}

function DataSourcesNote() {
  return (
    <p className="mt-6 text-xs text-gray-500 leading-relaxed">
      This free report is informational only and is not a substitute for formal conveyancing searches by a qualified solicitor. Contains HM Land Registry data &copy; Crown copyright and database right. Powered by data.police.uk, Environment Agency, MHCLG, planning.data.gov.uk, GIAS, Ofcom, ONS, EU JRC PVGIS and OpenStreetMap under the Open Government Licence v3.0.
    </p>
  );
}
