"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { DetailButton } from "@/components/SampleDetailModal";
import LeaseholdCalculator from "@/components/LeaseholdCalculator";
import { buildInitialAssessment } from "@/lib/verdict";
import { estimatePropertyValue } from "@/lib/estimateValue";
import { buildSellerEmail } from "@/lib/seller-email";
import { fullReportSupported, resolveJurisdiction } from "@/lib/jurisdiction";
import type { FreeReport, PostcodeAddress, PaidReport } from "@/lib/types";

interface AddressesResponse { postcode: string; addresses: string[]; }

interface CheckClientProps {
  /** Pre-populated free report, when provided, skips the client-side fetch. */
  initialReport?: FreeReport;
  /** Pre-populated resolved address, when provided, skips the lookup. */
  initialAddress?: PostcodeAddress;
  /** Full paid-report data. When provided, switches into paid render mode (no upsell, unlocked sections). */
  paidReport?: PaidReport;
  /** Paid tier, surfaces the paid-report badge in the hero. */
  paidTier?: "standard" | "standard_plus" | "bundle";
  /** Stripe session token, used to build the permanent /r/{token} URL hint. */
  paidToken?: string;
}

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

export default function CheckClient({ initialReport, initialAddress, paidReport, paidTier, paidToken }: CheckClientProps = {}) {
  const params = useSearchParams();
  const router = useRouter();
  const postcodeParam = (params.get("postcode") || initialAddress?.postcode || "").toUpperCase();
  const addressParam = params.get("address") || initialAddress?.fullAddress || "";
  const isPaid = Boolean(paidReport);

  const [resolvedAddress, setResolvedAddress] = useState<PostcodeAddress | null>(initialAddress ?? null);
  const [pickerAddresses, setPickerAddresses] = useState<string[] | null>(null);
  const [report, setReport] = useState<FreeReport | null>(initialReport ?? null);
  const [loadingReport, setLoadingReport] = useState(false);
  // True while the fast "core" report is shown but the full report (crime, local
  // context, synthesised verdict) is still loading. Deferred sections show a
  // "loading…" placeholder until this clears.
  const [slowPending, setSlowPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { captureAttribution(); }, []);

  useEffect(() => {
    // In paid mode the data is pre-populated server-side, skip address + report fetches.
    if (isPaid) return;
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
  }, [postcodeParam, addressParam, isPaid]);

  useEffect(() => {
    if (isPaid) return;
    if (!resolvedAddress) return;
    setLoadingReport(true);
    setReport(null);
    setSlowPending(true);
    setError(null);

    let cancelled = false;
    let fullArrived = false; // the full report supersedes the fast one
    let gotReport = false; // any report rendered (fast or full)
    const addr = resolvedAddress;

    const fetchReport = (fast: boolean) =>
      fetch("/api/free-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, fast }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`status_${r.status}`);
        return (await r.json()) as { report: FreeReport };
      });

    // FAST core report, best-effort. Paints the page in a fraction of the time;
    // the deferred sections show "loading…" until the full report lands. If it
    // fails we simply wait for the full report below.
    (async () => {
      try {
        const data = await fetchReport(true);
        if (cancelled || fullArrived) return;
        gotReport = true;
        setReport(data.report);
        setLoadingReport(false);
      } catch {
        /* ignore, the full request is authoritative */
      }
    })();

    // FULL report, authoritative, with retries. The first hit can land on a cold
    // serverless function with empty data caches and time out, so retry with a
    // short backoff before giving up, the page self-heals without a refresh.
    (async () => {
      const MAX_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const data = await fetchReport(false);
          if (cancelled) return;
          fullArrived = true;
          gotReport = true;
          setReport(data.report);
          setSlowPending(false);
          setLoadingReport(false);
          return;
        } catch {
          if (cancelled) return;
          if (attempt < MAX_ATTEMPTS) {
            await new Promise((res) => setTimeout(res, attempt * 700));
            continue;
          }
          // Full report failed for good. Stop the deferred-section spinners.
          fullArrived = true;
          setSlowPending(false);
          setLoadingReport(false);
          // Only surface a hard error if we have nothing at all to show.
          if (!gotReport) setError("Free report build failed. Try refreshing.");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [resolvedAddress, isPaid]);

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
          <Skeleton postcode={resolvedAddress?.postcode ?? postcodeParam} />
        </div>
      )}
      {report && (
        <>
          {isPaid && paidReport ? (
            <PaidHero report={report} paidReport={paidReport} address={resolvedAddress!} tier={paidTier ?? "standard"} token={paidToken} />
          ) : (
            <CompactUpsell
              postcode={postcodeParam}
              address={resolvedAddress!}
              alertsCount={countAlerts(report)}
              onChangeAddress={() => router.replace(`/check?postcode=${encodeURIComponent(postcodeParam)}`)}
            />
          )}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <NavPills isPaid={!!(isPaid && paidReport)} hasSellerEmail={!!paidReport?.sellerQuestions?.length} />
            {isPaid && paidReport && paidToken ? (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3.5">
                <p className="text-sm text-slate-700">Want a copy for your solicitor or your records?</p>
                <a
                  href={`/api/r/${paidToken}/download`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 shadow-sm shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  Download complete report (PDF)
                </a>
              </div>
            ) : null}
            {isPaid && paidReport ? <PaidPremiumExtras paidReport={paidReport} paidToken={paidToken} /> : null}
            {/* The verdict blends every risk signal, so it waits for the full report. */}
            {slowPending ? (
              <VerdictLoading />
            ) : (
              <InitialAssessment report={report} paidTier={paidTier} paidToken={paidToken} address={resolvedAddress} />
            )}
            <FlagsBar report={report} />
            <ValuationSection report={report} />
            <PropertyEssentials report={report} paidReport={paidReport} />
            <RisksSection report={report} paidReport={paidReport} slowPending={slowPending} />
            <LocalContextSection report={report} slowPending={slowPending} />
            <FinanceSection report={report} />
            <AreaSection report={report} slowPending={slowPending} />
            <ConnectivitySection report={report} />
            {!isPaid ? <PremiumToolkitSection /> : null}
            <DataSourcesNote />
          </div>
        </>
      )}
    </div>
  );
}


const FREE_REPORT_SOURCES: Array<{ name: string; tag: string }> = [
  { name: "HM Land Registry, Price Paid", tag: "Sales history (postcode + similar)" },
  { name: "EPC Register (MHCLG)", tag: "Energy rating + floor area" },
  { name: "Environment Agency", tag: "Flood risk + Zone 2/3" },
  { name: "Police.uk", tag: "Crime by category, 12 months" },
  { name: "DEFRA UK-AIR", tag: "NO₂, PM2.5, DAQI" },
  { name: "DEFRA Noise Mapping", tag: "Road + rail noise dB" },
  { name: "Historic England", tag: "Listed buildings nearby" },
  { name: "Planning Data (DLUHC)", tag: "Conservation, TPO, Article 4" },
  { name: "Ofcom Connected Nations", tag: "Broadband + 4G/5G coverage" },
  { name: "GIAS / Ofsted", tag: "Schools + ratings" },
  { name: "NHS Service Finder", tag: "GPs, pharmacies, hospitals" },
  { name: "OS Places + OSM Overpass", tag: "Amenities + greenspace" },
  { name: "ONS Census 2021", tag: "Demographics + tenure" },
  { name: "PVGIS (EU JRC)", tag: "Solar potential" },
  { name: "BGS Ground Risk", tag: "Subsidence + shrink-swell" },
  { name: "UKHSA Radon Map", tag: "Radon risk band" },
];

function Skeleton({ postcode }: { postcode: string }) {
  const [progress, setProgress] = useState(0);
  const [completedIndex, setCompletedIndex] = useState(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // Reach ~95% at 8s, the typical warm free-report fetch time now that solar
      // runs in the parallel batch. The skeleton unmounts the moment the report
      // arrives, so this only controls how briskly the bar fills.
      const target = Math.min(95, (elapsed / 8) * 95);
      setProgress((p) => Math.max(p, target));
      const idx = Math.min(FREE_REPORT_SOURCES.length - 1, Math.floor((target / 95) * FREE_REPORT_SOURCES.length));
      setCompletedIndex(idx);
    }, 200);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Building your free report</p>
          <h2 className="mt-1 text-lg md:text-xl font-extrabold text-slate-900">{postcode || "Loading…"}</h2>
          <p className="mt-1 text-xs text-slate-600">Pulling live data from {FREE_REPORT_SOURCES.length} official UK government sources</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-blue-700">{Math.floor(progress)}<span className="text-sm font-bold text-slate-500">%</span></p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul className="mt-4 grid gap-1.5 md:grid-cols-2 max-h-72 overflow-y-auto pr-1">
        {FREE_REPORT_SOURCES.map((s, i) => {
          const done = i < completedIndex;
          const inProgress = i === completedIndex;
          return (
            <li key={s.name} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${done ? "bg-emerald-50" : inProgress ? "bg-blue-50" : "bg-slate-50"}`}>
              <span className="mt-0.5 shrink-0 w-4 h-4 inline-flex items-center justify-center">
                {done ? (
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : inProgress ? (
                  <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </span>
              <span className="min-w-0 leading-snug">
                <span className={`font-semibold ${done ? "text-emerald-900" : inProgress ? "text-blue-900" : "text-slate-700"}`}>{s.name}</span>
                <br />
                <span className={`text-[10px] ${done ? "text-emerald-700" : "text-slate-500"}`}>{s.tag}</span>
              </span>
            </li>
          );
        })}
      </ul>
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
            placeholder="Filter, try the flat number or building name…"
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
          Or skip, show postcode-level report instead &rarr;
        </button>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Search a different postcode:</p>
        <PostcodeLookup size="md" />
      </div>
    </div>
  );
}

type PaidTier = "standard" | "standard_plus" | "bundle";

function CompactUpsell({ postcode, address, alertsCount, onChangeAddress }: { postcode: string; address: PostcodeAddress; alertsCount: number; onChangeAddress: () => void }) {
  const [loading, setLoading] = useState<PaidTier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nearbyAddresses, setNearbyAddresses] = useState<string[] | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // A "specific address" is anything more than the bare postcode.
  const normalisedAddr = (address.fullAddress ?? "").replace(/\s+/g, "").toUpperCase();
  const normalisedPc = (address.postcode ?? postcode ?? "").replace(/\s+/g, "").toUpperCase();
  const hasSpecificAddress = Boolean(address.fullAddress && normalisedAddr !== normalisedPc);
  const reportSupported = fullReportSupported(address.country, postcode);
  const isLeasehold = isLikelyLeaseholdHint(address);

  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener("phc-open-upsell", open);
    return () => window.removeEventListener("phc-open-upsell", open);
  }, []);

  async function buy(tier: PaidTier) {
    if (!hasSpecificAddress) {
      alert("Please pick the specific property in your postcode before buying, we need the building/flat number to deliver accurate flags.");
      onChangeAddress();
      return;
    }
    if (!reportSupported) {
      alert("Full paid reports currently cover England and Wales only. This address is in Scotland or Northern Ireland, which use separate registers we don't yet include, so sold prices, EPC, crime and school data aren't available. The free summary above shows what we can provide for this area.");
      return;
    }
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          postcode,
          country: address.country,
          uprn: address.uprn,
          fullAddress: address.fullAddress,
          attribution: getAttribution() ?? {},
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (j.error === "address_required_for_paid_report") {
          alert("Please pick the specific property in your postcode before purchasing.");
          onChangeAddress();
          return;
        }
        throw new Error("checkout_failed");
      }
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
      {/* Full-bleed dark hero, CCC pattern */}
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

            {/* Change address dropdown, lazy-loads same-postcode addresses */}
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

          {!reportSupported && (
            <div className="mt-7 max-w-3xl mx-auto rounded-2xl border-2 border-amber-300/40 bg-amber-500/10 p-5 text-left">
              <p className="text-sm font-bold text-amber-100">Full paid reports currently cover England and Wales only</p>
              <p className="mt-1.5 text-xs text-amber-100/80 leading-relaxed">
                This address is in {resolveJurisdiction(address.country, postcode) === "northern-ireland" ? "Northern Ireland" : "Scotland"}, which uses separate registers (Registers of Scotland / Land &amp; Property Services, plus separate EPC and school data). Sold prices, EPC, crime and school data aren&apos;t available here yet, so we don&apos;t charge for a report we can&apos;t fully populate. The free summary above shows what we can provide for this area.
              </p>
            </div>
          )}

          {/* Tier buttons, the free report is already on this page below. */}
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 max-w-3xl mx-auto items-stretch">
            <TierCard
              tone="standard"
              title="Risk & Title Synthesis"
              price="£4.99"
              features={[
                "<strong>Title &amp; tenure</strong> read in plain English",
                "Radon + coal mining + ground stability bands",
                "Listed / conservation / TPO / Article 4 flags",
                "UK + overseas owner flag (HMLR CCOD/OCOD)",
                "Companies House owner check (insolvency, charges, disqualified directors)",
                "BSR Higher-Risk Building register status",
                "Property Chamber tribunal history",
                "AI buyer's verdict + tailored seller questions",
              ]}
              ctaLabel="Get it"
              sampleHref="/sample"
              onClick={() => buy("standard")}
              loading={loading === "standard"}
              disabled={!!loading || !reportSupported}
            />
            <TierCard
              tone="premium"
              title="Pre-Exchange Brief"
              price="£6.99"
              features={[
                "🎯 <strong>Negotiation Report</strong>, save £5-25k with a data-backed offer",
                "<strong>AI Solicitor brief</strong>, pre-exchange enquiries ready for your conveyancer",
                "<strong>AI Surveyor brief</strong>, exactly what to flag to your RICS surveyor",
                "<strong>AI Mortgage broker brief</strong>, lending-friction flags up front",
                "<strong>Leasehold extension</strong> cost calculator",
                "Everything in Risk &amp; Title Synthesis",
              ]}
              featuresExpanded={[
                "🎯 <strong>Negotiation Report</strong>, enter the asking price and we model a defensible offer range from comparable sales, Bank of England base rate, Land Registry HPI and every risk flag found. Buyers routinely save £5,000-£25,000 with grounded, data-backed negotiation rather than offering blind.",
                "<strong>AI Solicitor brief</strong>, your conveyancer&apos;s pre-exchange enquiry list, formatted in TA6 language and ready to forward. Saves 1-2 emails and catches the obscure flags (tribunal history, overseas owner, BSR HRB).",
                "<strong>AI Surveyor brief</strong>, the precise things to flag to your RICS surveyor for THIS property. Stops you paying £750 for a generic survey that misses the shrink-swell band 4, coal mining area, or listed-building specifics.",
                "<strong>AI Mortgage broker brief</strong>, the lending-friction flags (flood band, BSR, listed, non-standard construction) so you can verify mortgageability with your broker before applying. Avoids the 40% of UK chains that fall through on mortgage refusal.",
                "Everything in Premium, plus higher priority support",
              ]}
              ctaLabel="Get it"
              sampleHref="/sample-plus"
              onClick={() => buy("standard_plus")}
              loading={loading === "standard_plus"}
              disabled={!!loading || !reportSupported}
              mostPopular
            />
          </div>

          {/* Top tier: full-width bundle card */}
          <div className="mt-3 max-w-3xl mx-auto">
            <div className="relative rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-5">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow whitespace-nowrap">Complete pack &middot; best for your solicitor</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="sm:flex-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Pre-Exchange Bundle</span>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">£14.99</span>
                    <span className="text-[10px] text-gray-500">one-time, instant</span>
                  </p>
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-700">
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">★</span><span>Everything in Premium+</span></li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">★</span><span><strong>Title &amp; tenure synthesis</strong> from the official register</span></li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">★</span><span><strong>Leasehold extension cost calculator</strong></span></li>
                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">★</span><span>The full pre-offer pack to hand your solicitor</span></li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => buy("bundle")}
                  disabled={!!loading || !reportSupported}
                  className="shrink-0 w-full sm:w-auto sm:px-6 sm:self-center py-2.5 px-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25"
                >
                  {loading === "bundle" ? "Redirecting…" : "Get the Bundle · £14.99"}
                </button>
              </div>
            </div>
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
          isLeasehold={isLeasehold}
          hasSpecificAddress={hasSpecificAddress}
          onPickAddress={onChangeAddress}
        />
      )}
    </>
  );
}

function TierCard({
  tone, title, price, priceLine, features, featuresExpanded, mostPopular, onClick, disabled, loading, ctaLabel, hideOnMobile, sampleHref,
}: {
  tone: "current" | "standard" | "premium";
  title: string;
  price?: string;
  priceLine?: string;
  features: string[];
  featuresExpanded?: string[];
  mostPopular?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  ctaLabel?: string;
  hideOnMobile?: boolean;
  sampleHref?: string;
}) {
  const [showFull, setShowFull] = useState(false);
  // CCC-style compact card: show a few features collapsed, with an "& more…"
  // toggle. Expanded shows the full detail list (or the full feature list).
  const COLLAPSED = 3;
  const fullFeatures = featuresExpanded ?? features;
  const displayFeatures = showFull ? fullFeatures : features.slice(0, COLLAPSED);
  const hasMore = fullFeatures.length > COLLAPSED || Boolean(featuresExpanded);
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
          {tone === "current" ? "Free" : tone === "premium" ? "Premium+" : "Premium"}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{title}</p>
      <p className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">{price ?? priceLine}</p>
      {price && <p className="text-[9px] sm:text-[10px] text-gray-500">one-time, instant</p>}
      <ul className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-gray-700 flex-1">
        {displayFeatures.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 leading-snug">
            <span className={`mt-0 text-[10px] sm:text-xs shrink-0 ${tone === "premium" ? "text-blue-500" : tone === "standard" ? "text-blue-400" : "text-gray-400"}`}>{tone === "current" ? "✓" : "★"}</span>
            <span dangerouslySetInnerHTML={{ __html: f }} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setShowFull((v) => !v)}
          className={`mt-1.5 text-[10px] sm:text-xs font-semibold self-start ${tone === "premium" ? "text-blue-700 hover:text-blue-800" : "text-blue-600 hover:text-blue-700"}`}
        >
          {showFull ? "Show less ↑" : "& more…"}
        </button>
      ) : null}
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
          {loading ? "Redirecting…" : ctaLabel}
        </button>
      )}
      {sampleHref ? (
        <a
          href={sampleHref}
          target="_blank"
          rel="noopener"
          className={`mt-2 block text-center text-[10px] sm:text-xs font-semibold underline-offset-2 hover:underline ${tone === "premium" ? "text-blue-700" : "text-blue-600"}`}
        >
          See a sample {tone === "premium" ? "Premium+" : "Premium"} report &rarr;
        </a>
      ) : null}
    </div>
  );
}

function isLikelyLeaseholdHint(address: PostcodeAddress): boolean {
  // Best-effort hint from the address alone, flats almost always start with
  // "FLAT" or "APARTMENT" in the SAON. Houses won't match, freehold houses
  // won't see the toggle.
  const s = (address.saon ?? "").toUpperCase();
  return /^(FLAT|APARTMENT|UNIT|MAISONETTE|STUDIO)\b/.test(s);
}

function UpsellModal({ onClose, onBuy, loading, alertsCount, isLeasehold, hasSpecificAddress, onPickAddress }: {
  onClose: () => void;
  onBuy: (tier: PaidTier) => void;
  loading: PaidTier | null;
  alertsCount: number;
  isLeasehold: boolean;
  hasSpecificAddress: boolean;
  onPickAddress: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-5 py-4 sm:px-6 sm:py-5 rounded-t-2xl flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-cyan-300">Get the full picture before you offer</p>
            <h2 className="mt-1 text-base sm:text-xl font-extrabold text-white leading-tight">From £4.99, instant report with the flags your solicitor charges £250-£450 to surface.</h2>
            {alertsCount > 0 && (
              <p className="mt-2 text-xs sm:text-sm text-cyan-100">⚠ {alertsCount} risk{alertsCount === 1 ? "" : "s"} flagged on the free report. The paid report tells you which ones matter for THIS specific property.</p>
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

        <div className="overflow-y-auto p-6">

          {!hasSpecificAddress && (
            <div className="mb-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-900">Pick the specific property first</p>
              <p className="mt-1 text-xs text-amber-900 leading-relaxed">We deliver paid reports by building / flat number, a postcode alone isn&apos;t enough.</p>
              <button onClick={() => { onPickAddress(); onClose(); }}
                className="mt-3 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm">
                Pick your address &rarr;
              </button>
            </div>
          )}

          {/* Premium tier (internal id: "standard") */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5 mb-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">PREMIUM &middot; £4.99</span>
              <p className="text-xs text-gray-600">One-off · instant · permanent URL</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-700">
              {STANDARD_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-blue-500 text-xs mt-1">★</span>
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
            <button onClick={() => onBuy("standard")} disabled={!!loading || !hasSpecificAddress}
              className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors">
              {loading === "standard" ? "Redirecting…" : "Get Premium · £4.99"}
            </button>
          </div>

          {/* Standard + Leasehold tier, only show for likely leasehold properties */}
          {/* Single £4.99 Premium tier */}

          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              <strong>Why this matters:</strong> Solicitor conveyancing searches alone cost £250-£450, and only happen AFTER you instruct. A RICS Level 2 survey is £400-£900. HomeBuyerCheck reports run BEFORE you commit, so you can walk away or use findings to renegotiate (typical price reduction 1-3% on findings).
            </p>
          </div>
          <p className="mt-3 text-[10px] text-gray-500 text-center">Delivered by email within 60 seconds with a permanent online URL to share with your solicitor.</p>
        </div>
      </div>
    </div>
  );
}

const STANDARD_FEATURES = [
  "Live planning data: conservation area / TPO / Article 4 / AONB / green belt",
  "Radon affected area + ground stability (BGS GeoSure 6-hazard panel)",
  "Coal mining reporting area flag",
  "Listed building grade + Historic England link",
  "UK + overseas company owner flag (HMLR CCOD/OCOD)",
  "Companies House owner verification (when corporate)",
  "AI buyer's verdict tailored to this property's flags",
  "10 AI-generated seller questions for your solicitor",
  "Solicitor handover PDF + permanent shareable URL",
];

// =====================================================================
// PAID-MODE: hero + premium-only extras
// =====================================================================
function PaidHero({ report, paidReport, address, tier, token }: {
  report: FreeReport;
  paidReport: PaidReport;
  address: PostcodeAddress;
  tier: "standard" | "standard_plus" | "bundle";
  token?: string;
}) {
  const alertsCount = countAlerts(report);
  const tierLabel = tier === "bundle" ? "Pre-Exchange Bundle" : tier === "standard_plus" ? "Premium+" : "Premium";
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">✓ Paid &middot; {tierLabel}</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-200">{address.postcode}</span>
            {paidReport.title?.titleNumber ? (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">Title {paidReport.title.titleNumber}</span>
            ) : null}
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight break-words leading-tight">
            {address.fullAddress || address.postcode}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-400">
            Generated {new Date(paidReport.generatedAt).toLocaleString("en-GB")}
            {token ? <> &middot; permanent link: <span className="font-mono text-cyan-300">/r/{token}</span></> : null}
          </p>
          {alertsCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-200">
              ⚠ {alertsCount} {alertsCount === 1 ? "risk" : "risks"} flagged
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TitleSynthesisCard({ title }: { title: NonNullable<PaidReport["title"]> }) {
  const tenureLabel = title.tenure === "leasehold" ? "Leasehold" : title.tenure === "freehold" ? "Freehold" : "Not confirmed";
  const narrative =
    title.tenure === "leasehold"
      ? "This is a leasehold property: you own the flat/house for a fixed term, not the land. Your solicitor must check the lease length, ground rent, service charges and any onerous clauses. Use the leasehold calculator below to estimate any extension cost."
      : title.tenure === "freehold"
      ? "This is a freehold property: you own the building and the land outright, with no lease, ground rent or service charge to a freeholder."
      : "Tenure could not be confirmed from the public sales record. Your solicitor will confirm it from the official title register.";
  return (
    <div className="mb-5 rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 shadow-sm">
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">HM Land Registry</span>
      <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">Title &amp; tenure synthesis</h2>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <Row label="Tenure" value={tenureLabel} />
        {title.pricePaid ? <Row label="Last sold" value={`£${title.pricePaid.amount.toLocaleString()} (${new Date(title.pricePaid.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })})`} /> : null}
        {title.registeredOwners && title.registeredOwners.length > 0 ? <Row label="Registered owner" value={title.registeredOwners.join(", ")} /> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{narrative}</p>
      <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
        Full covenants, easements and charges are held in the official HM Land Registry copy (£7). We can order it for your solicitor on request; the tenure, ownership and sale history above are synthesised from the public register.
      </p>
    </div>
  );
}

function PaidPremiumExtras({ paidReport, paidToken }: { paidReport: PaidReport; paidToken?: string | null }) {
  const isPlus = !!(paidReport.solicitorBrief || paidReport.surveyorBrief || paidReport.mortgageBrief);
  // Pre-fill the negotiation asking price with the same "Estimated value today"
  // shown in the Sales card below, so the two figures are consistent.
  const valueEstimate = estimatePropertyValue(paidReport.free);
  return (
    <div id="section-premium" className="mb-2 scroll-mt-20">
      {paidReport.buyersVerdict ? (
        <div className="mb-5 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Buyer&rsquo;s verdict</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{paidReport.buyersVerdict}</p>
        </div>
      ) : null}

      {/* £6.99 Plus tier exclusive: Negotiation Report (interactive) */}
      {isPlus && paidToken ? <NegotiationCard token={paidToken} defaultAsking={valueEstimate?.estimate} /> : null}

      {/* £6.99 Plus tier exclusive: AI briefs */}
      {paidReport.solicitorBrief ? <BriefSection brief={paidReport.solicitorBrief} accent="indigo" titlePrefix="Solicitor brief" subtitle="For your conveyancer, TA6-style follow-up enquiries" /> : null}
      {paidReport.surveyorBrief ? <BriefSection brief={paidReport.surveyorBrief} accent="emerald" titlePrefix="Surveyor brief" subtitle="What to flag to the RICS surveyor" /> : null}
      {paidReport.mortgageBrief ? <BriefSection brief={paidReport.mortgageBrief} accent="amber" titlePrefix="Mortgage broker brief" subtitle="Lending-friction flags, verify with a qualified broker" /> : null}

      {/* Bundle tier exclusive: title & tenure synthesis */}
      {paidReport.title ? <TitleSynthesisCard title={paidReport.title} /> : null}

      {/* £6.99 Plus + Bundle: leasehold extension calculator */}
      {isPlus ? (
        <div className="mb-5">
          <LeaseholdCalculator defaultValue={valueEstimate?.estimate ?? 350000} />
        </div>
      ) : null}

      {paidReport.companyOwner ? (
        <Section title="Registered owner, company check" subtitle="Companies House" panel accent={paidReport.companyOwner.status !== "active" || (paidReport.companyOwner.insolvencyCases?.length ?? 0) > 0 ? "amber" : "slate"}>
          <div className="grid gap-3 md:grid-cols-2">
            <Row label="Company" value={`${paidReport.companyOwner.companyName} (${paidReport.companyOwner.companyNumber})`} />
            <Row label="Status" value={paidReport.companyOwner.status.charAt(0).toUpperCase() + paidReport.companyOwner.status.slice(1)} />
            {paidReport.companyOwner.incorporatedOn ? <Row label="Incorporated" value={new Date(paidReport.companyOwner.incorporatedOn).toLocaleDateString("en-GB")} /> : null}
            {paidReport.companyOwner.officersCount != null ? <Row label="Active officers" value={String(paidReport.companyOwner.officersCount)} /> : null}
            {paidReport.companyOwner.outstandingCharges != null ? <Row label="Outstanding charges" value={String(paidReport.companyOwner.outstandingCharges)} /> : null}
            {paidReport.companyOwner.isOverseasEntity ? <Row label="Overseas Entity" value="Yes (Register of Overseas Entities)" /> : null}
            {paidReport.companyOwner.registeredAddress ? <Row label="Registered address" value={paidReport.companyOwner.registeredAddress} /> : null}
          </div>
          {paidReport.companyOwner.riskNote ? <p className={`mt-3 text-sm font-semibold ${paidReport.companyOwner.status === "active" ? "text-slate-700" : "text-red-700"}`}>{paidReport.companyOwner.riskNote}</p> : null}

          {/* Outstanding charges breakdown */}
          {paidReport.companyOwner.outstandingChargesDetail && paidReport.companyOwner.outstandingChargesDetail.length > 0 ? (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-800 mb-2">Outstanding mortgages / debentures</p>
              <ul className="space-y-1 text-xs">
                {paidReport.companyOwner.outstandingChargesDetail.map((c, i) => (
                  <li key={i} className="text-slate-700">
                    <strong>{c.lenderName ?? "Unknown lender"}</strong>
                    {c.classification ? `, ${c.classification}` : ""}
                    {c.createdOn ? ` (registered ${new Date(c.createdOn).toLocaleDateString("en-GB")})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Insolvency cases */}
          {paidReport.companyOwner.insolvencyCases && paidReport.companyOwner.insolvencyCases.length > 0 ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-[10px] uppercase tracking-wider font-bold text-red-800 mb-2">⚠ Insolvency cases on record</p>
              <ul className="space-y-1 text-xs">
                {paidReport.companyOwner.insolvencyCases.map((c, i) => (
                  <li key={i} className="text-red-900">
                    <strong>{c.type.replace(/-/g, " ")}</strong>
                    {c.dates && c.dates[0]?.date ? `, ${new Date(c.dates[0].date).toLocaleDateString("en-GB")}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <a href={paidReport.companyOwner.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-blue-700 hover:text-blue-900">View on Companies House &rarr;</a>
          <CompanyOwnerDetailButton company={paidReport.companyOwner} />
        </Section>
      ) : paidReport.ownership && !paidReport.ownership.ukCompanyOwned && !paidReport.ownership.overseasOwned ? (
        <Section title="Owner check" subtitle="Insolvency Service signpost" panel>
          <IndividualBankruptcySignpost />
        </Section>
      ) : null}

      {/* Disqualified directors flag */}
      {paidReport.disqualifiedDirectors && paidReport.disqualifiedDirectors.length > 0 ? (
        <Section title="⚠ Disqualified-director hits" subtitle="Companies House, matching director name" panel accent="red">
          <p className="text-xs text-slate-700 mb-3">
            The owner&apos;s name matched {paidReport.disqualifiedDirectors.length} disqualified-director
            record{paidReport.disqualifiedDirectors.length === 1 ? "" : "s"} on Companies House. Disqualification
            usually follows fraud, wrongful trading, or persistent non-compliance, your solicitor should verify
            this is the same person (cross-check DOB) before exchange.
          </p>
          <ul className="space-y-2">
            {paidReport.disqualifiedDirectors.slice(0, 5).map((d) => (
              <li key={d.personId} className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-slate-800">
                <p className="font-bold">{d.name}{d.dateOfBirth ? <span className="ml-2 text-slate-600 font-normal">(DOB {d.dateOfBirth})</span> : null}</p>
                {d.disqualifiedFrom || d.disqualifiedUntil ? (
                  <p className="mt-1 text-slate-700">
                    Disqualified
                    {d.disqualifiedFrom ? ` from ${new Date(d.disqualifiedFrom).toLocaleDateString("en-GB")}` : ""}
                    {d.disqualifiedUntil ? ` until ${new Date(d.disqualifiedUntil).toLocaleDateString("en-GB")}` : ""}
                  </p>
                ) : null}
                {d.caseReason ? <p className="mt-1 italic text-slate-700">{d.caseReason}</p> : null}
                <a href={d.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] font-semibold text-blue-700 hover:text-blue-900">View record →</a>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {paidReport.sellerQuestions?.length ? (
        <Section id="section-seller-email" title="Draft email to the seller or agent" subtitle="Copy, edit and send" panel>
          <SellerEmailBlock address={paidReport.free.property.fullAddress} questions={paidReport.sellerQuestions} />
        </Section>
      ) : null}
    </div>
  );
}
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
  // Free-tier teaser: surface the tenure fact (free from Land Registry); the
  // paid Risk & Title Synthesis interprets covenants, ownership and lease terms.
  {
    const tenure = report.priceHistory?.sales?.[0]?.tenure;
    if (tenure === "L") flags.push({ tone: "blue", label: "Leasehold" });
    else if (tenure === "F") flags.push({ tone: "green", label: "Freehold" });
  }

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
// All valuation content grouped together: the estimate + sales history, price
// per m², a 5-year forecast, and the comparable-sales table.
function ValuationSection({ report }: { report: FreeReport }) {
  const estimate = estimatePropertyValue(report);
  const hasOwnSales = (report.priceHistory?.sales?.length ?? 0) > 0;
  const hasSimilar = (report.priceHistory?.similarSales?.length ?? 0) > 0;
  const defaultPrice = estimate?.estimate
    ?? report.priceHistory?.sales?.[0]?.price
    ?? report.priceHistory?.similarSales?.[0]?.price
    ?? 350_000;
  const showForecast = !!estimate?.estimate || hasOwnSales;
  const hasPricePerSqm = Boolean((estimate?.estimate || hasOwnSales) && report.epc?.totalFloorArea);

  // Nothing to value (no price data at all) → skip the whole section.
  if (!report.priceHistory && !estimate) return null;

  return (
    <Section id="section-valuation" title="Valuation &amp; sold prices" subtitle="Estimate, comparables &amp; forecast">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        <SalesCard history={report.priceHistory} estimate={estimate} hasOwnSales={hasOwnSales} />
        {hasPricePerSqm ? <PricePerSqmCard estimate={estimate} epc={report.epc!} similarSales={report.priceHistory?.similarSales} /> : null}
      </div>
      {showForecast ? (
        <div className="mt-4">
          <Card title="5-year price forecast" subtitle="HPI + comp blend">
            <PriceForecast
              currentValue={estimate?.estimate ?? defaultPrice}
              priceHistory={report.priceHistory}
              region={report.property.region}
            />
          </Card>
        </div>
      ) : null}
      {hasSimilar && report.priceHistory ? (
        <div className="mt-4">
          <SimilarSalesCard history={report.priceHistory} epc={report.epc} />
        </div>
      ) : null}
    </Section>
  );
}

function PropertyEssentials({ report, paidReport }: { report: FreeReport; paidReport?: PaidReport }) {
  const estimate = estimatePropertyValue(report);
  const defaultPrice = estimate?.estimate
    ?? report.priceHistory?.sales?.[0]?.price
    ?? report.priceHistory?.similarSales?.[0]?.price
    ?? 350_000;
  return (
    <Section id="section-property-essentials" title="Property essentials" subtitle="Energy, tax &amp; SDLT">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {report.epc ? <EpcCard epc={report.epc} /> : null}
        {report.epc && (report.epc.propertyType || report.epc.builtForm || report.epc.totalFloorArea) ? <CharacteristicsCard epc={report.epc} /> : null}

        {paidReport?.ownership ? <OwnershipCard ownership={paidReport.ownership} /> : null}
        {paidReport?.bsrHrb ? <BsrHrbCard bsr={paidReport.bsrHrb} /> : null}
        {paidReport?.tribunalHistory ? <TribunalHistoryCard history={paidReport.tribunalHistory} /> : null}

        {/* Free-mode locked teasers, only shown to non-paying visitors */}
        {!paidReport ? (
          <PremiumLockedCard
            title="UK / overseas owner check"
            tag="£4.99"
            tagline="HMLR CCOD + OCOD + Companies House"
            fields={[
              { label: "Owner type", placeholder: "Individual / UK company / Overseas" },
              { label: "Country incorporated", placeholder: "BVI / Jersey / etc." },
              { label: "Companies House status", placeholder: "Active / dissolved / liquidation" },
            ]}
          />
        ) : null}
        {!paidReport ? (
          <PremiumLockedCard
            title="Building Safety Regulator status"
            tag="£4.99"
            tagline="BSR Higher-Risk Building register (≥18m / ≥7 floors)"
            fields={[
              { label: "On HRB register", placeholder: "Yes, registered" },
              { label: "Principal Accountable Person", placeholder: "Building Owner Ltd" },
              { label: "Building height", placeholder: "10 floors / 32m" },
              { label: "Residential units", placeholder: "84 flats" },
            ]}
          />
        ) : null}
        {report.rentalEstimate ? (
          <RentalYieldCard rental={report.rentalEstimate} />
        ) : null}
        {report.councilTax?.authority ? <CouncilTaxCard ct={report.councilTax} /> : null}
        {report.solar ? <SolarCard solar={report.solar} /> : null}
        <StampDutyCard defaultPrice={defaultPrice} estimate={estimate} />
      </div>
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
              ? "Above the typical UK range, premium location."
              : own < typeBenchmark.lo
              ? "Below the typical UK range, possible value or distress signal."
              : "Within the typical UK range for this property type."}
          </p>
        ) : null}
      </div>
      {similarSales && similarSales.length > 0 ? (
        <p className="mt-3 text-[10px] text-gray-400">£/m² for nearby comparables not shown, Land Registry doesn&apos;t hold floor area.</p>
      ) : null}
    </Card>
  );
}

function InitialAssessment({
  report,
  paidTier,
  paidToken,
  address,
}: {
  report: FreeReport;
  paidTier?: "standard" | "standard_plus" | "bundle";
  paidToken?: string;
  address?: PostcodeAddress | null;
}) {
  // The bundle is a superset of Premium+ for assessment purposes.
  const v = buildInitialAssessment(report, paidTier === "bundle" ? "standard_plus" : paidTier);
  const hasCautions = v.cautions.length > 0;
  const isHighRisk = v.cautions.length >= 3;
  const borderColour = isHighRisk ? "border-red-300" : hasCautions ? "border-amber-300" : "border-emerald-300";
  const labelColour = isHighRisk ? "text-red-700" : hasCautions ? "text-amber-700" : "text-emerald-700";
  const headlineColour = isHighRisk ? "text-red-700" : hasCautions ? "text-amber-700" : "text-gray-900";
  const recommendationColour = isHighRisk ? "text-red-700 font-bold" : hasCautions ? "text-amber-800 font-semibold" : "text-gray-700";
  const avatarBg = isHighRisk ? "bg-gradient-to-br from-red-500 to-rose-500" : hasCautions ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-400";
  const openUpsell = () => window.dispatchEvent(new Event("phc-open-upsell"));
  const openUpgrade = () => {
    if (paidToken) window.location.href = `/upgrade?token=${encodeURIComponent(paidToken)}`;
  };
  const summaryStatus = isHighRisk
    ? `${v.cautions.length} risks flagged`
    : hasCautions
    ? `${v.cautions.length} thing${v.cautions.length === 1 ? "" : "s"} to check`
    : "Looking clean";
  const ctaTone = isHighRisk
    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
    : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500";

  // Tier-aware CTA selection:
  // - free (no paidTier): "Unlock the full paid report · £4.99" → upsell modal
  // - Premium (£4.99): "Upgrade to Premium+ · +£2" → £2 upgrade Stripe flow
  // - Premium+ (£6.99): no CTA, no upsell links
  const ctaLabel = paidTier === "standard" ? "Upgrade to Premium+ · +£2" : "Unlock the full paid report · £4.99";
  const ctaOnClick = paidTier === "standard" ? openUpgrade : openUpsell;
  const showCta = paidTier !== "standard_plus";
  const renderText = paidTier === "standard_plus"
    ? (p: string) => p
    : (p: string) => renderWithUpsellLink(p, paidTier === "standard" ? openUpgrade : openUpsell);
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
              {renderText(p)}
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
          emptyText="No standout positives surfaced, that doesn't mean there aren't any, just that the public datasets don't flag them."
        />
        <SummaryColumn
          tone="negative"
          title="Negatives"
          items={v.cautions}
          emptyText="No risks flagged from the free data sources. Standard searches will still apply during conveyancing."
          footer={
            showCta ? (
              <button
                type="button"
                onClick={ctaOnClick}
                className={`mt-2.5 sm:mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.99] ${ctaTone}`}
              >
                {ctaLabel}
              </button>
            ) : null
          }
        />
      </div>
      <InlinePlanningEmbed report={report} address={address} cautions={v.cautions} />
    </div>
  );
}

/**
 * Inline mini-map shown directly under the cautions whenever a planning flag
 * is present. Saves the buyer scrolling to the "Risks & constraints" section
 * for the most-asked-about flag (e.g. "30 applications within 500m"). Renders
 * the same PropertyMap + a compact application count + a "see full breakdown"
 * deep-link to the full PlanningCard.
 */
function InlinePlanningEmbed({
  report,
  address,
  cautions,
}: {
  report: FreeReport;
  address?: PostcodeAddress | null;
  cautions: ReadonlyArray<{ text: string; anchor?: string }>;
}) {
  const planning = report.planning;
  // Only render when there's a planning-related caution + map data available.
  const hasPlanningFlag = cautions.some((c) => /planning applications/i.test(c.text));
  if (!hasPlanningFlag || !planning || planning.totalApps12m === 0) return null;
  if (!address?.lat || !address?.lng) return null;

  const appPins = planning.applications
    .filter((a) => a.lat && a.lng)
    .map((a) => ({
      name: a.address || a.reference,
      description: a.description,
      lat: a.lat!,
      lng: a.lng!,
      status: a.status,
    }));
  if (appPins.length === 0) return null;

  return (
    <div className="mt-3 sm:mt-4 rounded-xl border border-red-200 bg-white p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider font-bold text-red-700">
          Planning activity within 500m · last 12 months
        </p>
        <a
          href="#section-risks"
          className="text-[11px] font-semibold text-blue-700 underline-offset-2 hover:underline"
        >
          See full breakdown →
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <Stat n={planning.approvedApps} label="Permitted" tone="emerald" />
        <Stat n={planning.pendingApps} label="Pending" tone="amber" />
        <Stat n={planning.rejectedApps} label="Rejected" tone="red" />
      </div>
      <PropertyMap
        lat={address.lat}
        lng={address.lng}
        zoom={16}
        height={200}
        appPins={appPins}
        radius={500}
        legend={[
          { colour: "#059669", label: "Permitted" },
          { colour: "#d97706", label: "Pending" },
          { colour: "#dc2626", label: "Rejected" },
        ]}
      />
      <p className="text-[11px] text-gray-500 mt-2">
        {planning.totalApps12m} application{planning.totalApps12m === 1 ? "" : "s"} mapped. Tap the marker pins to see each one.
      </p>
    </div>
  );
}

function SummaryColumn({
  tone, title, items, emptyText, footer,
}: {
  tone: "positive" | "negative";
  title: string;
  // Negatives carry an optional anchor so the bullet deep-links to the
  // section explaining the flag (e.g. the planning map). Positives are
  // plain strings, no destination to jump to.
  items: ReadonlyArray<string | { text: string; anchor?: string }>;
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
          {items.map((p, i) => {
            const text = typeof p === "string" ? p : p.text;
            const anchor = typeof p === "string" ? undefined : p.anchor;
            return (
              <li key={i} className={`flex gap-2 leading-snug ${itemTone}`}>
                <span className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${dotBg} mt-0.5`}>{dot}</span>
                {anchor ? (
                  <a href={`#${anchor}`} className="underline decoration-1 underline-offset-2 hover:no-underline">
                    {text} <span className="text-[10px] opacity-70">→</span>
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </li>
            );
          })}
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

function RisksSection({ report, paidReport, slowPending }: { report: FreeReport; paidReport?: PaidReport; slowPending?: boolean }) {
  const lat = report.property.lat, lng = report.property.lng;
  if (!lat || !lng) return null;
  return (
    <Section id="section-risks" title="Risks &amp; constraints" subtitle="Flood, planning, crime, ground">
      {report.compositeRisk
        ? <CompositeRiskCard risk={report.compositeRisk} />
        : slowPending ? <LoadingCard title="Composite risk score" subtitle="Combining flood, crime, ground stability and air quality into one score…" /> : null}
      <div className="grid gap-4 lg:grid-cols-2 min-w-0 mt-4">
        {report.flood ? <FloodCard flood={report.flood} lat={lat} lng={lng} /> : null}
        {report.crime
          ? <CrimeCard crime={report.crime} lat={lat} lng={lng} />
          : slowPending ? <LoadingCard title="Crime &amp; safety" subtitle="Fetching 12 months of police.uk street-level data…" /> : null}
        {report.planning && (report.planning.constraints.length > 0 || report.planning.totalApps12m > 0) ? (
          <PlanningCard planning={report.planning} lat={lat} lng={lng} />
        ) : null}
        {report.groundRisk && report.groundRisk.shrinkSwell !== "unknown" ? <GroundRiskCard groundRisk={report.groundRisk} /> : null}
        {report.airQuality ? <AirQualityCard aq={report.airQuality} /> : null}
        {report.listedBuilding?.listed ? <ListedBuildingCard lb={report.listedBuilding} /> : null}

        {paidReport ? (
          <PremiumFlagsCard flags={paidReport.flags} />
        ) : (
          <PremiumLockedCard
            title="Environmental flags (paid)"
            tag="£4.99"
            tagline="Listed, conservation, mining, radon"
            fields={[
              { label: "Listed building grade", placeholder: "Grade II" },
              { label: "Conservation area", placeholder: "Wapping CA" },
              { label: "Tree preservation order", placeholder: "Affected" },
              { label: "Coal mining reporting area", placeholder: "Yes, CON29M" },
              { label: "Radon risk band", placeholder: "Band 3 of 6" },
              { label: "Contaminated land flag", placeholder: "No risk indicated" },
            ]}
          />
        )}

        {isFlatType(report) ? <Ews1EnquiryCard postcode={report.property.postcode} address={report.property.fullAddress} /> : null}
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
  return (
    <Section id="section-finance" title="Finance &amp; affordability" subtitle="Mortgage, energy &amp; insurance">
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
        Shrink-swell is the most common cause of UK domestic subsidence, clay-rich soils that swell when wet and shrink when dry, cracking foundations.
        {idx >= 3 ? " A significant or higher rating means insurers will likely ask for a structural survey before quoting." : idx >= 2 ? " Worth getting a Level 2 or Level 3 survey to inspect for any cracking." : " Lower-risk soils make subsidence unlikely from this hazard."}
      </p>
      <p className="mt-2 text-[10px] text-gray-400">Based on British Geological Survey GeoSure dataset (1 km grid).</p>
    </Card>
  );
}

function AreaSection({ report, slowPending }: { report: FreeReport; slowPending?: boolean }) {
  const hasContent = report.imd || report.demographics || report.walkScore || report.lifestyleScores || report.areaTrend || report.noise || slowPending;
  if (!hasContent) return null;
  return (
    <Section id="section-area" title="Area profile" subtitle="Lifestyle, trend, demographics &amp; environment">
      {report.lifestyleScores
        ? <LifestyleScoresCard scores={report.lifestyleScores} />
        : slowPending ? <LoadingCard title="Lifestyle scores" subtitle="Scoring this area for families, first-time buyers, commuters and investors…" /> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-w-0 mt-4">
        {report.areaTrend
          ? <AreaTrendCard trend={report.areaTrend} />
          : slowPending ? <LoadingCard title="Area trend" subtitle="Synthesising crime, planning and price signals…" /> : null}
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

function LocalContextSection({ report, slowPending }: { report: FreeReport; slowPending?: boolean }) {
  const lat = report.property.lat, lng = report.property.lng;
  return (
    <Section id="section-local" title="Local context" subtitle="Schools, healthcare, amenities">
      <div className="grid gap-4 lg:grid-cols-2 min-w-0">
        {report.schools && report.schools.length > 0 && lat && lng
          ? <SchoolsCard schools={report.schools} lat={lat} lng={lng} />
          : <SchoolsUnavailableCard country={report.property.country} />}
        {report.healthcare
          ? <HealthcareCard healthcare={report.healthcare} />
          : slowPending ? <LoadingCard title="Healthcare nearby" subtitle="Finding GPs, pharmacies and hospitals…" /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {report.amenities && report.amenities.nearestSupermarket ? <AmenitiesCard amenities={report.amenities} /> : null}
        {report.greenspace
          ? <GreenspaceCard greenspace={report.greenspace} />
          : slowPending ? <LoadingCard title="Parks &amp; greenspace" subtitle="Mapping nearby parks and open space…" /> : null}
        {report.transportNearby
          ? <TransportNearbyCard t={report.transportNearby} />
          : slowPending ? <LoadingCard title="Stations &amp; stops" subtitle="Locating nearby rail, tube and bus stops…" /> : null}
      </div>
    </Section>
  );
}

function ConnectivitySection({ report }: { report: FreeReport }) {
  return (
    <Section id="section-connectivity" title="Connectivity &amp; commute" subtitle="Broadband, mobile, transport">
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

function NavPills({ isPaid, hasSellerEmail }: { isPaid: boolean; hasSellerEmail: boolean }) {
  const items: { id: string; label: string }[] = [];
  if (isPaid) items.push({ id: "section-premium", label: "Premium insights" });
  items.push(
    { id: "section-valuation", label: "Valuation" },
    { id: "section-property-essentials", label: "Property" },
    { id: "section-risks", label: "Risks" },
    { id: "section-local", label: "Local area" },
    { id: "section-finance", label: "Finance" },
    { id: "section-area", label: "Area profile" },
    { id: "section-connectivity", label: "Connectivity" },
  );
  if (isPaid && hasSellerEmail) items.push({ id: "section-seller-email", label: "Draft email" });

  function jump(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  }

  return (
    <nav aria-label="Jump to a section" className="mb-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          onClick={(e) => jump(e, it.id)}
          className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}

function Section({ title, subtitle, children, id, panel, accent }: { title: string; subtitle: string; children: React.ReactNode; id?: string; panel?: boolean; accent?: "slate" | "amber" | "red" }) {
  const accentClass =
    accent === "red" ? "border-red-200 bg-red-50/60"
    : accent === "amber" ? "border-amber-200 bg-amber-50/60"
    : "border-slate-200 bg-white";
  const barClass =
    accent === "red" ? "border-red-500"
    : accent === "amber" ? "border-amber-500"
    : "border-blue-500";
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <div className={`flex items-baseline justify-between gap-3 mb-3 border-l-4 ${barClass} pl-3`}>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 font-semibold shrink-0 text-right">{subtitle}</p>
      </div>
      {panel ? <div className={`rounded-2xl border ${accentClass} p-4 sm:p-5 shadow-sm`}>{children}</div> : children}
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
 * Placeholder shown in a card slot whose data is still loading (the slow sources:
 * crime, local context, synthesised verdict). Replaced automatically by the real
 * card the moment the full report arrives.
 */
function LoadingCard({ title, subtitle, className = "" }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-blue-600 font-bold shrink-0">
          <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Loading
        </span>
      </div>
      <div className="space-y-2.5 animate-pulse">
        <div className="h-3 rounded bg-slate-100 w-3/4" />
        <div className="h-3 rounded bg-slate-100 w-1/2" />
        <div className="h-3 rounded bg-slate-100 w-2/3" />
        <div className="h-3 rounded bg-slate-100 w-2/5" />
      </div>
      {subtitle ? <p className="mt-4 text-[10px] text-gray-400">{subtitle}</p> : null}
    </div>
  );
}

/** Full-width placeholder for the buyer's verdict while the full report loads. */
function VerdictLoading() {
  return (
    <div className="mb-6 rounded-2xl border-2 border-blue-200 bg-white shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Buyer&apos;s verdict</p>
          <p className="text-sm font-bold text-slate-900">Analysing crime, local context and every risk signal…</p>
        </div>
      </div>
      <div className="mt-5 space-y-2.5 animate-pulse">
        <div className="h-3 rounded bg-slate-100 w-5/6" />
        <div className="h-3 rounded bg-slate-100 w-2/3" />
        <div className="h-3 rounded bg-slate-100 w-3/4" />
      </div>
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
 * The real values arrive after the £4.99 Premium purchase.
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
  // Fast heuristic, any flat is leasehold-by-default in England/Wales, and any
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
                {c.note ? <span className="opacity-80 ml-1">: {c.note}</span> : null}
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
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
        {tag ? (
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0 mt-0.5">
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
          Unlock with Premium · £4.99
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
  // Compact labels so the Type column fits on mobile alongside Address + Price.
  const PROP_TYPE_SHORT: Record<string, string> = {
    D: "Detached", S: "Semi", T: "Terrace", F: "Flat", O: "Other",
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <th className="text-left pr-1.5 py-2">Address</th>
              <th className="text-left px-1.5 py-2">Type</th>
              <th className="text-right px-1.5 py-2 whitespace-nowrap">Rooms</th>
              <th className="text-right px-1.5 py-2 whitespace-nowrap">Price</th>
              <th className="text-right px-2 py-2 hidden sm:table-cell">Sold</th>
              <th className="text-right px-2 py-2 hidden sm:table-cell">Area</th>
              <th className="text-right pl-2 py-2 hidden sm:table-cell">£/m²</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {visible.slice(0, 12).map((s, i) => {
              const addr = [s.saon, s.paon, s.street].filter(Boolean).join(", ");
              const ppsm = s.floorAreaM2 ? Math.round(s.price / s.floorAreaM2) : undefined;
              const soldShort = new Date(s.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
              const isMatch =
                (myRooms != null && s.habitableRooms === myRooms) ||
                (myArea != null && s.floorAreaM2 != null && Math.abs(s.floorAreaM2 - myArea) <= myArea * 0.15);
              return (
                <tr key={i} className={`border-t border-gray-100 hover:bg-gray-50 ${isMatch ? "bg-emerald-50/40" : ""}`}>
                  <td className="pr-1.5 py-2 text-gray-800">
                    <span className="block truncate max-w-[84px] sm:max-w-[200px]">{addr || "-"}</span>
                    {/* Sold date moves under the address on mobile so recency stays visible without a Sold column. */}
                    <span className="sm:hidden block text-[10px] text-gray-400">{soldShort}</span>
                  </td>
                  <td className="px-1.5 py-2 text-gray-600 whitespace-nowrap">
                    <span className="sm:hidden">{s.propertyType ? PROP_TYPE_SHORT[s.propertyType] : "-"}</span>
                    <span className="hidden sm:inline">{s.propertyType ? PROP_TYPE_LABEL[s.propertyType] : "-"}</span>
                  </td>
                  <td className="px-1.5 py-2 text-right text-gray-700 font-semibold">{s.habitableRooms ?? "-"}</td>
                  <td className="px-1.5 py-2 text-right font-bold text-gray-900 whitespace-nowrap">£{s.price.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right text-gray-600 hidden sm:table-cell whitespace-nowrap">{soldShort}</td>
                  <td className="px-2 py-2 text-right text-gray-600 hidden sm:table-cell">{s.floorAreaM2 ? `${s.floorAreaM2} m²` : "-"}</td>
                  <td className="pl-2 py-2 text-right text-gray-500 hidden sm:table-cell">{ppsm ? `£${ppsm.toLocaleString()}` : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] text-gray-400 sm:hidden">Rooms = EPC habitable rooms (bedrooms + living rooms). Public records don&apos;t list bedrooms directly.</p>
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
          <p className="text-2xl font-extrabold text-gray-900">{epc.rating ?? "-"}</p>
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
      {ct.band ? (
        <p className="text-3xl font-extrabold text-gray-900">
          Band {ct.band}
          {ct.isEstimate ? <span className="text-sm font-semibold text-gray-500"> (reference)</span> : null}
        </p>
      ) : null}
      {ct.estimatedAnnualCost ? (
        <p className="text-sm text-gray-700 mt-1"><span className="font-bold">£{ct.estimatedAnnualCost.toLocaleString()}</span><span className="text-gray-500"> / year{ct.isEstimate ? " at Band D" : ""}</span></p>
      ) : null}
      {ct.monthlyAmount ? <p className="text-xs text-gray-500">~£{ct.monthlyAmount} / month</p> : null}
      {ct.isEstimate ? (
        <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-md px-2 py-1.5 leading-snug">
          Band D used as a reference, this property&apos;s actual band isn&apos;t in the free dataset. Confirm it on the <a href="https://www.gov.uk/council-tax-bands" target="_blank" rel="noopener" className="underline">VOA register</a>.
        </p>
      ) : null}
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
      <p className="mt-3 text-xs text-gray-500">Zone definitions from EA NaFRA: Zone 3 = 1 in 100 (rivers) or 1 in 200 (sea) annual probability; Zone 2 = 1 in 1,000. Surface water, groundwater + 2050 climate-projected risk in the Premium report.</p>
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
      {crime.limitedData ? (
        <p className="mb-3 text-[11px] text-amber-700 bg-amber-50 rounded-md px-2 py-1.5 leading-snug">
          This figure looks low because the local police force supplies limited data to data.police.uk (Greater Manchester Police, for example, stopped supplying in 2019). Treat it as incomplete, not as a low-crime signal.
        </p>
      ) : null}
      {trend != null ? (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-full border ${trendTone}`}>
            {trend > 0 ? "▲" : trend < 0 ? "▼" : "•"} {trend > 0 ? "+" : ""}{trend.toFixed(1)}% YoY
          </span>
          <span className="text-[11px] text-gray-500">
            vs {crime.priorTotalIncidents?.toLocaleString() ?? "-"} in prior 12 months
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
          <p className="text-xs font-bold text-gray-900 mb-1">Forward pipeline, major schemes within 1 km</p>
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
    { k: "Health", v: imd.domains.health, hint: "Health outcomes, life expectancy, illness rates." },
    { k: "Crime", v: imd.domains.crime, hint: "Risk of personal/property crime." },
    { k: "Housing access", v: imd.domains.barriers, hint: "Barriers to good housing, affordability, distance to services." },
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

function SchoolsUnavailableCard({ country }: { country?: string }) {
  const j = resolveJurisdiction(country);
  let note: React.ReactNode;
  if (j === "wales") {
    note = <>School ratings come from Get Information About Schools, which covers England only. For Welsh schools see <a href="https://mylocalschool.gov.wales/" target="_blank" rel="noopener" className="text-blue-600 underline">My Local School (Wales)</a> and Estyn reports.</>;
  } else if (j === "scotland") {
    note = <>School ratings come from Get Information About Schools, which covers England only. For Scottish schools see <a href="https://education.gov.scot/" target="_blank" rel="noopener" className="text-blue-600 underline">Education Scotland</a> and Parentzone Scotland.</>;
  } else if (j === "northern-ireland") {
    note = <>School ratings come from Get Information About Schools, which covers England only. For Northern Ireland see the <a href="https://www.eani.org.uk/" target="_blank" rel="noopener" className="text-blue-600 underline">Education Authority NI</a> and ETI reports.</>;
  } else {
    note = <>No schools were found within the search radius of this address.</>;
  }
  return (
    <Card title="Schools" subtitle="Nearest schools, Ofsted">
      <p className="text-sm text-gray-600 leading-relaxed">{note}</p>
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
    <Section title="Paid toolkit" subtitle="Buyer's actions, included with the £4.99 Premium report">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        {/* AI questions teaser */}
        <button
          type="button"
          onClick={open}
          className="group relative bg-white rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-xl shadow-blue-500/10 p-4 sm:p-5 text-left overflow-hidden min-w-0 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-gray-900">AI: questions to ask the seller</p>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0">£4.99</span>
          </div>
          <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(5px)" }} aria-hidden="true">
            <div className="text-xs text-gray-700 italic">"Was the £85k charge from Mary Dixon Ltd on 23/03/2019 ever discharged? Show the deed of release."</div>
            <div className="text-xs text-gray-700 italic">"Why did the property sell for £250k in Nov 2012 then £422.5k in Nov 2016, a 70% rise vs ~25% UK average over the period?"</div>
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
              Unlock with Premium · £4.99
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
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shrink-0">£4.99</span>
          </div>
          <div className="space-y-2 select-none pointer-events-none" style={{ filter: "blur(5px)" }} aria-hidden="true">
            <p className="text-xs font-bold text-gray-900">Critical findings (3)</p>
            <p className="text-[11px] text-gray-600">• Charges register: 2 entries, confirm DS1/E-DS1 on completion</p>
            <p className="text-[11px] text-gray-600">• Restrictive covenants present, review enforceability</p>
            <p className="text-[11px] text-gray-600">• Flood Zone 2, order Environmental search</p>
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
              Unlock with Premium · £4.99
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

// =====================================================================
// £6.99 STANDARD PLUS components, AI briefs + Negotiation Report
// =====================================================================

const BRIEF_ACCENTS = {
  indigo: { border: "border-indigo-300", bg: "bg-gradient-to-br from-indigo-50 to-blue-50", text: "text-indigo-900", labelText: "text-indigo-700", badgeBg: "bg-indigo-100", badgeText: "text-indigo-800", chip: "bg-indigo-100 text-indigo-800" },
  emerald: { border: "border-emerald-300", bg: "bg-gradient-to-br from-emerald-50 to-teal-50", text: "text-emerald-900", labelText: "text-emerald-700", badgeBg: "bg-emerald-100", badgeText: "text-emerald-800", chip: "bg-emerald-100 text-emerald-800" },
  amber: { border: "border-amber-300", bg: "bg-gradient-to-br from-amber-50 to-orange-50", text: "text-amber-900", labelText: "text-amber-700", badgeBg: "bg-amber-100", badgeText: "text-amber-800", chip: "bg-amber-100 text-amber-800" },
} as const;

function BriefSection({
  brief, accent, titlePrefix, subtitle,
}: {
  brief: NonNullable<PaidReport["solicitorBrief"]>;
  accent: keyof typeof BRIEF_ACCENTS;
  titlePrefix: string;
  subtitle: string;
}) {
  const a = BRIEF_ACCENTS[accent];
  const audience = titlePrefix.toLowerCase().includes("solicitor") ? "For your conveyancer"
    : titlePrefix.toLowerCase().includes("surveyor") ? "For your RICS surveyor"
    : titlePrefix.toLowerCase().includes("mortgage") ? "For your mortgage broker"
    : "For your adviser";
  const priorityClass = (p: string) =>
    p === "critical" ? "bg-red-100 text-red-800" :
    p === "high" ? "bg-amber-100 text-amber-800" :
    p === "medium" ? "bg-slate-100 text-slate-800" :
    "bg-slate-50 text-slate-600";
  return (
    <section className="mb-8 scroll-mt-20">
      <div className={`rounded-2xl border-2 ${a.border} ${a.bg} p-5 sm:p-6 shadow-sm`}>
        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${a.chip}`}>{audience}</span>
        <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">{titlePrefix}</h2>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{subtitle}</p>
        <p className={`mt-3 text-sm font-bold ${a.text}`}>{brief.summary}</p>
        <ul className="mt-4 space-y-3">
          {brief.items.map((item, i) => (
            <li key={i} className="rounded-lg border border-white/60 bg-white/70 p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className={`text-xs font-bold uppercase tracking-wider ${a.labelText}`}>{item.heading}</p>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityClass(item.priority)} shrink-0`}>{item.priority}</span>
              </div>
              <p className="text-xs text-slate-800 leading-snug"><strong>Finding.</strong> {item.finding}</p>
              <p className="mt-1 text-xs text-slate-800 leading-snug"><strong>Action.</strong> {item.ask}</p>
            </li>
          ))}
        </ul>
        <p className={`mt-3 text-[11px] italic ${a.labelText} leading-snug`}>{brief.caveat}</p>
        <BriefDetailButton brief={brief} accent={accent} titlePrefix={titlePrefix} />
      </div>
    </section>
  );
}

function BriefDetailButton({
  brief, accent, titlePrefix,
}: {
  brief: NonNullable<PaidReport["solicitorBrief"]>;
  accent: keyof typeof BRIEF_ACCENTS;
  titlePrefix: string;
}) {
  const audience = titlePrefix.toLowerCase().includes("solicitor") ? "conveyancer"
    : titlePrefix.toLowerCase().includes("surveyor") ? "RICS surveyor"
    : titlePrefix.toLowerCase().includes("mortgage") ? "mortgage broker"
    : "professional adviser";
  const purpose = audience === "conveyancer"
    ? "These are pre-contract enquiries (TA6-style) flagged from the public records in your report. Forward them to your conveyancer as the starting point for their formal Seller Property Information Form review."
    : audience === "RICS surveyor"
      ? "These are physical items the property data suggests are worth flagging to your RICS surveyor before the Level 2/3 inspection so they can specifically look for them."
      : audience === "mortgage broker"
        ? "These are lending-friction items (cladding, leasehold, ownership, flood, mining) flagged from the data so your broker can pre-qualify lenders before you make an offer."
        : "These are items flagged from this property's public records for your professional adviser to follow up.";
  return (
    <DetailButton title={`${titlePrefix}, methodology, sources and how to use it`} label="How is this brief generated? →" accent={accent}>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What this brief is for</h4>
        <p>{purpose}</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How the brief is generated</h4>
        <p>The findings list above is generated by Anthropic&apos;s Claude (a large language model) from the structured PaidReport on this property, the same data you can see in every other card on this page. The model is given an explicit system prompt that forbids inventing facts.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">The no-fake-data rule</h4>
        <p>The system prompt instructs the model that:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>It may only narrate fields that are present in the PaidReport payload.</li>
          <li>If a field is missing or null it must say &quot;not assessed&quot; rather than guess.</li>
          <li>It must not cite case law, statute or specific monetary amounts that are not in the payload.</li>
          <li>It must not invent dates, names, lenders, or company numbers.</li>
        </ul>
        <p className="mt-1">Every item above (<span className="tabular-nums">{brief.items.length}</span> in this brief) is mapped back to a real data point in your report.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Sources</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>The brief text:</strong> Anthropic Claude (the LLM that composed it).</li>
          <li><strong>The structured input:</strong> the PaidReport object on this page, HMLR Price Paid, HMLR CCOD/OCOD, Companies House, planning.data.gov.uk, BSR HRB register, EA flood maps, BGS GeoSure, UKHSA radon, FTT Property Chamber decisions, EPC, broadband, crime.</li>
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What to do with it</h4>
        <p>Forward the brief to your {audience}. <strong>Do not substitute the brief for their professional judgement.</strong> They will assess the relevance of each item, raise the appropriate formal enquiries, and combine these with the rest of their professional process (TA6/TA10 enquiries, Level 2/3 survey, lender criteria, etc.).</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Caveat</h4>
        <p className="italic text-slate-700">{brief.caveat}</p>
      </section>
    </DetailButton>
  );
}

function SellerEmailBlock({ address, questions }: { address?: string; questions: NonNullable<PaidReport["sellerQuestions"]> }) {
  const email = useMemo(() => buildSellerEmail(address, questions), [address, questions]);
  const [copied, setCopied] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(`Pre-offer enquiries regarding ${address ?? "the property"}`)}&body=${encodeURIComponent(email.split("\n").slice(2).join("\n"))}`;

  return (
    <div>
      <p className="text-sm text-slate-700 mb-3">
        We&apos;ve turned the flags on this property into a ready-to-send email. Copy it, add your name, and send it to the seller or estate agent before you make an offer.
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-slate-800">{email}</pre>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 shadow-sm"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2v-2" /></svg>
              Copy email
            </>
          )}
        </button>
        <a href={mailto} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2">
          Open in email app
        </a>
        <button type="button" onClick={() => setShowWhy((v) => !v)} className="text-xs font-semibold text-blue-700 hover:text-blue-900 ml-1">
          {showWhy ? "Hide why these questions" : "Why these questions?"}
        </button>
      </div>
      {showWhy ? (
        <ul className="mt-3 space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="rounded-lg border border-slate-200 p-3 text-xs">
              <div className="flex items-start gap-2">
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${q.priority === "high" ? "bg-red-50 text-red-700 border border-red-200" : q.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>{q.priority}</span>
                <span className="min-w-0 flex-1 text-slate-600"><span className="font-semibold text-slate-800">Q{i + 1}.</span> {q.rationale}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-[11px] text-slate-500 italic">Generated by AI from data points found on this property. Not legal advice, your solicitor will use these as a starting point for formal pre-contract enquiries.</p>
    </div>
  );
}

type NegotiationAnalysisShape = NonNullable<PaidReport["negotiationAnalysis"]>;

function NegotiationCard({ token, defaultAsking }: { token: string; defaultAsking?: number }) {
  const [asking, setAsking] = useState<string>(defaultAsking ? Math.round(defaultAsking).toLocaleString() : "");
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<NegotiationAnalysisShape | undefined>();
  const [err, setErr] = useState<string | undefined>();

  async function run() {
    setErr(undefined);
    const n = parseFloat(asking.replace(/[£,]/g, ""));
    if (!Number.isFinite(n) || n < 25_000 || n > 50_000_000) {
      setErr("Enter the asking price (£25,000 – £50,000,000).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/r/${token}/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askingPrice: n }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.message ?? j.error ?? "Negotiation analysis failed.");
        return;
      }
      setAnalysis(j.analysis as NegotiationAnalysisShape);
    } catch (e) {
      setErr(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Negotiation Report" subtitle="Enter the asking price, get a modelled offer range">
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/60 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
          <div className="flex-1">
            <label htmlFor="negotiation-asking" className="block text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">Asking price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">£</span>
              <input
                id="negotiation-asking"
                type="text"
                inputMode="numeric"
                value={asking}
                onChange={(e) => setAsking(e.target.value)}
                placeholder="465,000"
                className="w-full rounded-lg border-2 border-purple-200 bg-white pl-7 pr-3 py-2.5 text-base font-bold text-slate-900 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? "Analysing…" : "Run analysis"}
          </button>
        </div>
        {err ? <p className="mt-3 text-xs font-semibold text-red-700">{err}</p> : null}

        {analysis ? <NegotiationResult analysis={analysis} /> : (
          <p className="mt-4 text-[11px] text-purple-800 leading-snug">
            We&apos;ll compare against same-postcode same-property-type sales (last 36 months), apply the current Bank of England base rate and Land Registry UKHPI for {analysis ? "this LA" : "this local authority"}, then weight by the risk flags found in your report. ~10 seconds.
          </p>
        )}
      </div>
    </Section>
  );
}

function NegotiationResult({ analysis }: { analysis: NegotiationAnalysisShape }) {
  const fmt = (n: number) => `£${n.toLocaleString()}`;
  const deltaLabel = analysis.askingVsModelled === "above"
    ? `${analysis.askingDeltaPct.toFixed(1)}% above modelled fair value`
    : analysis.askingVsModelled === "below"
      ? `${Math.abs(analysis.askingDeltaPct).toFixed(1)}% below modelled fair value`
      : "in line with modelled fair value";
  const deltaColor = analysis.askingVsModelled === "above" ? "text-amber-700"
    : analysis.askingVsModelled === "below" ? "text-emerald-700"
    : "text-slate-700";
  return (
    <div className="mt-5 space-y-4">
      {/* Headline */}
      <div className="rounded-xl border border-purple-300 bg-white p-4">
        <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800">Suggested offer range</p>
        <p className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
          {fmt(analysis.suggestedOfferRange.low)} – {fmt(analysis.suggestedOfferRange.high)}
        </p>
        <p className="text-xs text-slate-600 mt-0.5">Asking <strong className="tabular-nums">{fmt(analysis.askingPrice)}</strong>, <span className={deltaColor + " font-semibold"}>{deltaLabel}</span>. Modelled fair: <strong className="tabular-nums">{fmt(analysis.modelledFairValue)}</strong></p>
      </div>

      {/* Comparables */}
      {analysis.comparables.length > 0 ? (
        <div className="rounded-xl border border-purple-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Comparable sales</p>
          <ul className="space-y-1.5 text-xs">
            {analysis.comparables.slice(0, 6).map((c, i) => (
              <li key={i} className="flex justify-between gap-3 text-slate-800">
                <span className="truncate">{c.address}{c.propertyType ? ` · ${c.propertyType}` : ""}</span>
                <span className="shrink-0 tabular-nums font-semibold">{fmt(c.price)} <span className="text-slate-500 font-normal">({c.date})</span></span>
              </li>
            ))}
          </ul>
          {analysis.medianPricePerSqM ? <p className="mt-2 text-[11px] text-purple-700">Median £/m²: <strong>{fmt(analysis.medianPricePerSqM)}</strong></p> : null}
        </div>
      ) : (
        <p className="text-xs text-slate-600 italic">No recent comparable sales in the same postcode. Suggested range derived from market trend only.</p>
      )}

      {/* Market context */}
      <div className="rounded-xl border border-purple-200 bg-white p-4">
        <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Market context</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {analysis.marketContext.boeBaseRate != null ? (
            <div><p className="text-slate-500">BoE base rate</p><p className="font-bold text-slate-900 tabular-nums">{analysis.marketContext.boeBaseRate}%</p></div>
          ) : null}
          {analysis.marketContext.marketImplied5YRate != null ? (
            <div><p className="text-slate-500">Implied 5Y rate</p><p className="font-bold text-slate-900 tabular-nums">{analysis.marketContext.marketImplied5YRate}%</p></div>
          ) : null}
          {analysis.marketContext.marketImplied20YRate != null ? (
            <div><p className="text-slate-500">Implied 20Y rate</p><p className="font-bold text-slate-900 tabular-nums">{analysis.marketContext.marketImplied20YRate}%</p></div>
          ) : null}
          {analysis.marketContext.ukhpiAnnualChangePct != null ? (
            <div><p className="text-slate-500">UKHPI annual ({analysis.marketContext.localAuthority ?? "LA"})</p><p className={`font-bold tabular-nums ${analysis.marketContext.ukhpiAnnualChangePct >= 0 ? "text-emerald-700" : "text-red-700"}`}>{analysis.marketContext.ukhpiAnnualChangePct >= 0 ? "+" : ""}{analysis.marketContext.ukhpiAnnualChangePct.toFixed(1)}%</p></div>
          ) : null}
        </div>
        {(analysis.marketContext.marketImplied5YRate != null && analysis.marketContext.boeBaseRate != null) ? (
          <p className="mt-3 text-[11px] text-slate-600 leading-snug">
            <span className="font-semibold text-purple-800">Market-implied path:</span> the 5-year UK gilt yield ({analysis.marketContext.marketImplied5YRate}%) is{" "}
            {analysis.marketContext.marketImplied5YRate > analysis.marketContext.boeBaseRate
              ? <>above today&apos;s Bank Rate ({analysis.marketContext.boeBaseRate}%), bond markets are pricing in higher rates over your fix period, so a 5-year fix is the more conservative choice.</>
              : analysis.marketContext.marketImplied5YRate < analysis.marketContext.boeBaseRate
                ? <>below today&apos;s Bank Rate ({analysis.marketContext.boeBaseRate}%), markets expect cuts. A tracker may pay off if you can absorb short-term volatility.</>
                : <>in line with today&apos;s Bank Rate ({analysis.marketContext.boeBaseRate}%), markets expect rates to hold roughly flat.</>}{" "}
            This is the bond market&apos;s pricing, not the Bank of England&apos;s own staff forecast.
          </p>
        ) : null}
        <NegotiationMarketContextDetailButton analysis={analysis} />
      </div>

      {/* Adjustments */}
      {analysis.adjustments.length > 0 ? (
        <div className="rounded-xl border border-purple-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Flag-driven adjustments</p>
          <ul className="space-y-2 text-xs">
            {analysis.adjustments.map((a, i) => (
              <li key={i} className="text-slate-800 leading-snug">
                <span className={`font-bold ${a.direction === "down" ? "text-red-700" : "text-emerald-700"}`}>{a.direction === "down" ? "−" : "+"}{a.pct.toFixed(1)}%</span> · <strong>{a.flag}.</strong> {a.rationale}
              </li>
            ))}
          </ul>
          <NegotiationAdjustmentsDetailButton analysis={analysis} />
        </div>
      ) : null}

      {/* Affordability */}
      {analysis.affordability.monthlyAtAsking ? (
        <div className="rounded-xl border border-purple-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Affordability sketch</p>
          <p className="text-xs text-slate-700 mb-1.5">{analysis.affordability.assumedLtv}% LTV, 25-yr repayment term.</p>

          <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600 mt-3 mb-1">Today, 5-year fix at {analysis.affordability.assumedRate.toFixed(2)}% (BoE base + ~1.5pp)</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-slate-500">Monthly at asking</p><p className="font-bold text-slate-900 tabular-nums">{fmt(analysis.affordability.monthlyAtAsking)}/mo</p></div>
            {analysis.affordability.monthlyAtSuggested ? (
              <div><p className="text-slate-500">Monthly at suggested mid</p><p className="font-bold text-emerald-700 tabular-nums">{fmt(analysis.affordability.monthlyAtSuggested)}/mo</p></div>
            ) : null}
          </div>
          {analysis.affordability.monthlySaving && analysis.affordability.monthlySaving > 0 ? (
            <p className="mt-2 text-xs font-semibold text-emerald-700">Save ~{fmt(analysis.affordability.monthlySaving)}/mo if accepted at suggested mid.</p>
          ) : null}

          {analysis.affordability.monthlyAtAskingFuture && analysis.affordability.futureRate ? (
            <>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-600 mt-4 mb-1">At remortgage in ~5 years, implied {analysis.affordability.futureRate.toFixed(2)}% (5Y gilt + ~1.0pp)</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-slate-500">Monthly at asking</p><p className="font-bold text-slate-900 tabular-nums">{fmt(analysis.affordability.monthlyAtAskingFuture)}/mo</p></div>
                {analysis.affordability.monthlyAtSuggestedFuture ? (
                  <div><p className="text-slate-500">Monthly at suggested mid</p><p className="font-bold text-emerald-700 tabular-nums">{fmt(analysis.affordability.monthlyAtSuggestedFuture)}/mo</p></div>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 italic">If the bond market is right about the path of UK rates. Not a Bank of England forecast.</p>
            </>
          ) : null}
          <NegotiationAffordabilityDetailButton analysis={analysis} />
        </div>
      ) : null}

      {/* AI rationale */}
      {analysis.aiRationale ? (
        <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Buying-agent rationale</p>
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{analysis.aiRationale}</p>
          <NegotiationAiRationaleDetailButton />
        </div>
      ) : null}

      {/* Caveat */}
      <p className="text-[11px] italic text-slate-600 leading-snug">{analysis.caveat}</p>
    </div>
  );
}

// =====================================================================
// Negotiation report, DetailButton popups
// =====================================================================

function NegotiationMarketContextDetailButton({ analysis }: { analysis: NegotiationAnalysisShape }) {
  const m = analysis.marketContext;
  const fmtPct = (n?: number) => (n != null ? `${n}%` : "Not available");
  return (
    <DetailButton title="Market context, methodology, sources and the gilt-yield caveat" label="View full evidence →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Underlying data points</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">BoE Bank Rate</dt>
          <dd className="font-semibold tabular-nums">{fmtPct(m.boeBaseRate)}{m.boeRateAsOf ? <> · as of {new Date(m.boeRateAsOf).toLocaleDateString("en-GB")}</> : null}</dd>
          <dt className="text-slate-500">Implied 5Y rate (gilt)</dt>
          <dd className="font-semibold tabular-nums">{fmtPct(m.marketImplied5YRate)}</dd>
          <dt className="text-slate-500">Implied 20Y rate (gilt)</dt>
          <dd className="font-semibold tabular-nums">{fmtPct(m.marketImplied20YRate)}</dd>
          <dt className="text-slate-500">UKHPI annual change</dt>
          <dd className="font-semibold tabular-nums">{m.ukhpiAnnualChangePct != null ? `${m.ukhpiAnnualChangePct >= 0 ? "+" : ""}${m.ukhpiAnnualChangePct.toFixed(1)}%` : "Not available"}{m.ukhpiAsOf ? <> · {m.ukhpiAsOf}</> : null}</dd>
          <dt className="text-slate-500">Local authority</dt>
          <dd className="font-semibold">{m.localAuthority ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
        </dl>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">BoE Bank Rate, methodology and source</h4>
        <p>The Bank Rate is set by the Monetary Policy Committee, typically 8 times a year. We snapshot the value at the moment your report is generated. It is the floor rate for most tracker mortgages and the principal input to lender SVRs.</p>
        <p className="text-xs"><em><a href="https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate</a></em></p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">UKHPI, methodology and source</h4>
        <p>The UK House Price Index is produced jointly by HM Land Registry, ONS and DLUHC from the universe of completed sales lodged at HMLR (so it captures the actual transacted market, not asking prices). The local-authority series we display is the 12-month change to the latest published month for the LA covering this postcode.</p>
        <p className="text-xs"><em><a href="https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads</a></em></p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">5Y and 20Y gilt yields, the critical caveat</h4>
        <p>The implied rates are <strong>UK nominal zero-coupon gilt yields</strong> from the Bank of England&apos;s Interactive Statistical Database (series IUDSNZC for 5Y, IUDLNZC for 20Y). They represent the bond market&apos;s collective pricing of where short interest rates will average over those horizons, plus a small term premium.</p>
        <p className="mt-1"><strong>What this is not:</strong> a Bank of England staff forecast. The BoE does publish a fan chart in each Monetary Policy Report, that is a different (and often differently shaped) projection.</p>
        <p className="mt-1"><strong>How to read it:</strong> if the 5Y gilt is above today&apos;s Bank Rate, markets are pricing higher rates ahead, a 5-year fix is the more conservative choice. If below, markets expect cuts; a tracker can pay off if you can absorb short-term volatility.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How the affordability mortgage rate is computed</h4>
        <p>The &quot;today&quot; rate used in the affordability sketch is <strong>BoE Bank Rate + ~1.5 percentage points</strong>, a typical headline 5-year fixed rate margin observed in the UK retail mortgage market. The &quot;future&quot; rate at remortgage is <strong>5Y gilt yield + ~1.0pp</strong> (lender funding costs track the gilt curve more closely at longer fixes). These are first-order approximations only; your individual rate depends on LTV, lender, product fees and credit profile.</p>
      </section>
    </DetailButton>
  );
}

function NegotiationAdjustmentsDetailButton({ analysis }: { analysis: NegotiationAnalysisShape }) {
  return (
    <DetailButton title="Flag-driven adjustments, RICS guidance and the heuristic caveat" label="View full evidence →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Adjustments applied to the modelled value</h4>
        <p>Each line below explains exactly how a specific finding from your report has nudged the modelled fair value up or down. The total of all adjustments is reflected in the suggested offer range on this page.</p>
        <ul className="space-y-3 mt-3">
          {analysis.adjustments.map((a, i) => (
            <li key={i} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold">
                <span className={`${a.direction === "down" ? "text-red-700" : "text-emerald-700"} tabular-nums`}>{a.direction === "down" ? "−" : "+"}{a.pct.toFixed(1)}%</span> · {a.flag}
              </p>
              <p className="text-sm mt-1 leading-snug">{a.rationale}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">RICS / surveyor guidance</h4>
        <p>The size and direction of each adjustment is heuristic, these are not RICS Red Book valuations. They are informed by the following published guidance and market practice:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>RICS Red Book Global Standards (current edition), valuation methodology framework.</li>
          <li>RICS Practice Information &quot;Valuation of residential property affected by flood risk&quot; (2017), quantifies typical buyer discounts.</li>
          <li>RICS Practice Statement &quot;EWS1 / cladding&quot; guidance, lender-driven price effects.</li>
          <li>Building Societies Association &quot;Lending into Retirement&quot; and Council of Mortgage Lenders guidance on short-lease properties.</li>
          <li>Land Registry UKHPI sub-regional change percentages for like-for-like trend benchmarks.</li>
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">The heuristic caveat</h4>
        <p>Adjustment percentages are <strong>order-of-magnitude estimates</strong>, they reflect the typical buyer/lender response to each flag in normal market conditions, not a transaction-specific valuation. Treat them as a negotiating starting point, not a defended valuation. Where the suggested offer matters materially (your largest financial decision), commission a RICS Level 2 (or Level 3 for older / unusual / leasehold buildings) survey, the surveyor can attach evidence-backed numbers to your specific property.</p>
      </section>
    </DetailButton>
  );
}

function NegotiationAffordabilityDetailButton({ analysis }: { analysis: NegotiationAnalysisShape }) {
  const fmt = (n: number) => `£${Math.round(n).toLocaleString()}`;
  const ltv = analysis.affordability.assumedLtv;
  const loan = Math.round((analysis.askingPrice * ltv) / 100);
  // Amortisation table: monthly payment + principal/interest decomposition by year (25-year term).
  function amortise(principal: number, annualRatePct: number, years = 25) {
    const r = annualRatePct / 100 / 12;
    const n = years * 12;
    if (r <= 0 || principal <= 0) return null;
    const monthly = (principal * r) / (1 - Math.pow(1 + r, -n));
    let bal = principal;
    const rows: Array<{ year: number; interest: number; principal: number; balance: number; cumulative: number }> = [];
    let cumulativeInterest = 0;
    for (let y = 1; y <= years; y++) {
      let yearInterest = 0;
      let yearPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        const i = bal * r;
        const p = monthly - i;
        bal = Math.max(0, bal - p);
        yearInterest += i;
        yearPrincipal += p;
      }
      cumulativeInterest += yearInterest;
      rows.push({ year: y, interest: yearInterest, principal: yearPrincipal, balance: bal, cumulative: cumulativeInterest });
    }
    return { monthly, rows };
  }
  const today = amortise(loan, analysis.affordability.assumedRate);
  const future = analysis.affordability.futureRate ? amortise(loan, analysis.affordability.futureRate) : null;
  return (
    <DetailButton title="Affordability sketch, 25-year amortisation at today's and implied-future rates" label="View full evidence →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Loan inputs (derived from your asking price)</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">Asking price</dt>
          <dd className="font-semibold tabular-nums">{fmt(analysis.askingPrice)}</dd>
          <dt className="text-slate-500">Assumed LTV</dt>
          <dd className="font-semibold tabular-nums">{ltv}%</dd>
          <dt className="text-slate-500">Loan amount</dt>
          <dd className="font-semibold tabular-nums">{fmt(loan)}</dd>
          <dt className="text-slate-500">Term</dt>
          <dd className="font-semibold tabular-nums">25 years (300 months)</dd>
          <dt className="text-slate-500">Today&apos;s rate</dt>
          <dd className="font-semibold tabular-nums">{analysis.affordability.assumedRate.toFixed(2)}% (BoE + ~1.5pp)</dd>
          <dt className="text-slate-500">Implied future rate</dt>
          <dd className="font-semibold tabular-nums">{analysis.affordability.futureRate != null ? `${analysis.affordability.futureRate.toFixed(2)}% (5Y gilt + ~1.0pp)` : <span className="text-slate-500 italic">Not available</span>}</dd>
        </dl>
      </section>

      {today ? (
        <section>
          <h4 className="font-bold text-slate-900 mb-1">Full 25-year amortisation, today&apos;s rate ({analysis.affordability.assumedRate.toFixed(2)}%)</h4>
          <p>Monthly payment: <strong className="tabular-nums">{fmt(today.monthly)}</strong> · total interest over term: <strong className="tabular-nums">{fmt(today.rows[today.rows.length - 1].cumulative)}</strong></p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-2 py-1">Yr</th>
                  <th className="text-right px-2 py-1">Interest</th>
                  <th className="text-right px-2 py-1">Principal</th>
                  <th className="text-right px-2 py-1">Balance</th>
                  <th className="text-right px-2 py-1">Cum. interest</th>
                </tr>
              </thead>
              <tbody>
                {today.rows.map((r) => (
                  <tr key={r.year} className="border-b border-slate-100">
                    <td className="px-2 py-1 tabular-nums">{r.year}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.interest)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.principal)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.balance)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {future ? (
        <section>
          <h4 className="font-bold text-slate-900 mb-1">Full 25-year amortisation, implied future rate ({analysis.affordability.futureRate?.toFixed(2)}%)</h4>
          <p>If the bond market is right about the path of UK rates, your remortgage in ~5 years lands here. Monthly payment: <strong className="tabular-nums">{fmt(future.monthly)}</strong> · total interest over term: <strong className="tabular-nums">{fmt(future.rows[future.rows.length - 1].cumulative)}</strong></p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-2 py-1">Yr</th>
                  <th className="text-right px-2 py-1">Interest</th>
                  <th className="text-right px-2 py-1">Principal</th>
                  <th className="text-right px-2 py-1">Balance</th>
                  <th className="text-right px-2 py-1">Cum. interest</th>
                </tr>
              </thead>
              <tbody>
                {future.rows.map((r) => (
                  <tr key={r.year} className="border-b border-slate-100">
                    <td className="px-2 py-1 tabular-nums">{r.year}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.interest)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.principal)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.balance)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt(r.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="text-sm italic text-slate-500">Future-rate amortisation not available for this property (no implied 5Y gilt yield in the report).</p>
      )}

      <section>
        <h4 className="font-bold text-slate-900 mb-1">Methodology</h4>
        <p>Standard amortising-mortgage formula. <code>Monthly = P × r / (1 − (1 + r)^−n)</code> where <em>P</em> is the loan, <em>r</em> is the monthly rate, <em>n</em> is the number of monthly payments. Interest and principal are decomposed each month from the running balance.</p>
        <p className="mt-1 text-sm italic text-slate-500">Indicative only, your specific monthly payment depends on the actual product chosen (fix length, fees, redemption charges), your credit profile and LTV. Verify with a qualified mortgage broker before exchange.</p>
      </section>
    </DetailButton>
  );
}

function NegotiationAiRationaleDetailButton() {
  return (
    <DetailButton title="How the AI rationale is grounded, and what it won't do" label="How the AI is grounded →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What the AI does</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>It narrates pre-computed numerical outputs (asking, modelled fair, range, comp prices, BoE Bank Rate, UKHPI, gilt yields, flag-adjustment count).</li>
          <li>It explains <em>why</em> each adjustment was made by referencing the actual flag and the rationale string already computed server-side.</li>
          <li>It composes a 200-400 word negotiation summary suitable for forwarding to a buying agent or solicitor.</li>
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What the AI is forbidden from doing</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Inventing any number that is not in the structured input (no made-up asking prices, made-up comps, made-up rates, made-up flag percentages).</li>
          <li>Citing case law, statute or specific monetary amounts not present in the payload.</li>
          <li>Naming specific lenders, surveyors, solicitors or estate agents.</li>
          <li>Fabricating quoted text purportedly from a document we don&apos;t have.</li>
          <li>Substituting for a Red Book valuation, a Level 2/3 survey, or formal legal advice.</li>
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Source</h4>
        <p>The rationale is composed by Anthropic Claude. The structured input is the same <code>NegotiationAnalysis</code> object every other section on this page reads from, comparables from HMLR Price Paid, market context from BoE/ONS/HMLR, flag adjustments from your report&apos;s findings.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Audit trail</h4>
        <p>Every number in the rationale can be traced back to a specific field in the structured object. If a field is empty the model is instructed to say &quot;insufficient data&quot; rather than guess. The model never sees the buyer&apos;s identity or the seller&apos;s identity, only the property&apos;s public-record findings.</p>
      </section>
    </DetailButton>
  );
}

// =====================================================================
// PAID-MODE CARDS, render unlocked content using PaidReport data.
// =====================================================================
function TitleRegisterCard({ title }: { title: NonNullable<PaidReport["title"]> }) {
  return (
    <Card title="Title register" subtitle="HM Land Registry">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Row label="Title number" value={title.titleNumber ?? "-"} />
        <Row label="Tenure" value={title.tenure ?? "-"} />
        {title.tenure === "leasehold" && title.leaseTermYears != null ? <Row label="Lease term" value={`${title.leaseTermYears} yrs`} /> : null}
        {title.tenure === "leasehold" && title.leaseRemainingYears != null ? <Row label="Years remaining" value={`${title.leaseRemainingYears}`} /> : null}
        <Row label="Charges" value={`${title.charges ?? 0}`} />
        <Row label="Restrictions" value={`${title.restrictions ?? 0}`} />
        <Row label="Cautions" value={`${title.cautions ?? 0}`} />
        <Row label="Restrictive covenants" value={title.hasRestrictiveCovenants ? "Yes" : "No"} />
      </div>
      {title.registeredOwners?.length ? <p className="mt-2 text-xs text-slate-700"><strong>Owners:</strong> {title.registeredOwners.join(", ")}</p> : null}
      {title.pricePaid ? <p className="mt-1 text-xs text-slate-700"><strong>Price paid (LR):</strong> £{title.pricePaid.amount.toLocaleString()} ({new Date(title.pricePaid.date).getFullYear()})</p> : null}
      {title.registeredOn ? <p className="mt-1 text-[11px] text-slate-500">Registered {new Date(title.registeredOn).toLocaleDateString("en-GB")}</p> : null}
    </Card>
  );
}

function TitlePlanCard({ plan }: { plan: NonNullable<PaidReport["titlePlan"]> }) {
  return (
    <Card title="Title plan" subtitle="HM Land Registry boundary diagram">
      <p className="text-xs text-slate-700 leading-relaxed mb-3">Official PDF showing the registered boundary of this title. Confirms exactly what land is included in the sale.</p>
      <a href={plan.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-bold">
        Download title plan PDF &rarr;
      </a>
      {plan.orderRef ? <p className="mt-2 text-[10px] text-slate-500">Order ref: {plan.orderRef} · Link valid 6 months</p> : null}
    </Card>
  );
}

function LeaseCard({ lease }: { lease: NonNullable<PaidReport["lease"]> }) {
  if (lease.status === "ready" && lease.documentUrl) {
    return (
      <Card title="Lease document (OC2)" subtitle="HM Land Registry">
        <p className="text-xs text-slate-700 leading-relaxed mb-3">Full registered lease. Shows ground rent escalation, service charge methodology, restrictive covenants, lease term.</p>
        <a href={lease.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-bold">
          Download lease PDF &rarr;
        </a>
        {lease.fulfilledAt ? <p className="mt-2 text-[10px] text-slate-500">Delivered {new Date(lease.fulfilledAt).toLocaleString("en-GB")}</p> : null}
      </Card>
    );
  }
  if (lease.status === "failed") {
    return (
      <Card title="Lease document (OC2)" subtitle="HM Land Registry">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-800">Lease unavailable from HM Land Registry</p>
          <p className="mt-1 text-[11px] text-red-700">Older leases aren&apos;t scanned digitally. We&apos;ve refunded your add-on.</p>
        </div>
      </Card>
    );
  }
  return (
    <Card title="Lease document (OC2)" subtitle="HM Land Registry">
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs font-bold text-amber-900">Pending</p>
        </div>
        <p className="text-[11px] text-amber-900 leading-relaxed">
          Ordered {new Date(lease.orderedAt).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}.
          <strong> Delivered within 48 hours.</strong> We&apos;ll email you when it arrives; this section auto-updates.
        </p>
      </div>
    </Card>
  );
}

function PremiumFlagsCard({ flags }: { flags: PaidReport["flags"] }) {
  return (
    <Card title="Environmental flags (paid)" subtitle="Listed, conservation, ground risk, radon (England only)">
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <Row label="Listed building" value={
          flags.listedBuilding == null ? "Service unavailable"
            : flags.listedBuilding.listed ? `Listed (${flags.listedBuilding.grade ?? "grade unknown"})${flags.listedBuilding.name ? `, ${flags.listedBuilding.name}` : ""}`
            : "Not listed"
        } />
        <Row label="Conservation area" value={
          flags.conservationArea == null ? "Service unavailable"
            : flags.conservationArea.inArea ? (flags.conservationArea.name ?? "Yes")
            : "No"
        } />
        <Row label="Tree preservation order" value={
          flags.treePreservationOrder == null ? "Service unavailable"
            : flags.treePreservationOrder.affected ? `Affected${flags.treePreservationOrder.count ? ` (${flags.treePreservationOrder.count} zone${flags.treePreservationOrder.count === 1 ? "" : "s"})` : ""}`
            : "Not affected"
        } />
        <Row label="Article 4 direction" value={
          flags.article4 == null ? "Service unavailable"
            : flags.article4.affected ? (flags.article4.name ?? "Yes")
            : "No"
        } />
        <Row label="AONB" value={
          flags.aonb == null ? "Service unavailable"
            : flags.aonb.inArea ? (flags.aonb.name ?? "Yes")
            : "No"
        } />
        <Row label="Green belt" value={flags.greenBelt == null ? "Service unavailable" : flags.greenBelt ? "Yes" : "No"} />
        <Row label="Scheduled monument" value={
          flags.scheduledMonument == null ? "Service unavailable"
            : flags.scheduledMonument.affected ? (flags.scheduledMonument.name ?? "Yes")
            : "No"
        } />
        <Row label="World heritage site" value={
          flags.worldHeritageSite == null ? "Service unavailable"
            : flags.worldHeritageSite.inArea ? (flags.worldHeritageSite.name ?? "Yes")
            : "No"
        } />
        <Row label="Brownfield land" value={flags.brownfieldLand == null ? "Service unavailable" : flags.brownfieldLand ? "Yes" : "No"} />
        <Row label="Coal mining reporting area" value={
          flags.coalReportingArea == null ? "Service unavailable"
            : flags.coalReportingArea ? "Yes, CON29M (£32.40) recommended"
            : "No"
        } />
        <Row label="Other mining (non-coal)" value={
          flags.miningArea == null ? "Service unavailable"
            : flags.miningArea ? "Recorded mining activity nearby"
            : "No record"
        } />
        <Row label="Radon (UKHSA atlas)" value={
          flags.radonRiskBand == null ? "Service unavailable"
            : `Band ${flags.radonRiskBand}/6${flags.radonRiskBand >= 3 ? ", testing recommended" : ""}`
        } />
        <Row label="Shrink-swell clay (BGS)" value={
          flags.shrinkSwellBand == null ? "Service unavailable"
            : `Band ${flags.shrinkSwellBand}/5${flags.shrinkSwellLabel ? `, ${flags.shrinkSwellLabel}` : ""}`
        } />
        <Row label="Landslide (BGS)" value={
          flags.landslideBand == null ? "Service unavailable"
            : `Band ${flags.landslideBand}/5${flags.landslideLabel ? `, ${flags.landslideLabel}` : ""}`
        } />
        <Row label="Soluble rocks (BGS)" value={flags.solubleRocksBand == null ? "Service unavailable" : `Band ${flags.solubleRocksBand}/5`} />
        <Row label="Collapsible ground (BGS)" value={flags.collapsibleGroundBand == null ? "Service unavailable" : `Band ${flags.collapsibleGroundBand}/5`} />
        <Row label="Compressible ground (BGS)" value={flags.compressibleGroundBand == null ? "Service unavailable" : `Band ${flags.compressibleGroundBand}/5`} />
        <Row label="Running sand (BGS)" value={flags.runningSandBand == null ? "Service unavailable" : `Band ${flags.runningSandBand}/5`} />
      </div>
      <p className="mt-3 text-[10px] text-slate-500 italic">
        Sources: planning.data.gov.uk (Open Government Licence), Historic England,
        Coal Authority (via BGS WMS), BGS GeoSure 5km hex, UKHSA Radon Atlas. Resolution
        is national-overview, for definitive results before exchange, commission
        site-specific searches.
      </p>
    </Card>
  );
}

function TribunalHistoryCard({ history }: { history: NonNullable<PaidReport["tribunalHistory"]> }) {
  if (history.count === 0) {
    return (
      <Card title="Tribunal history" subtitle="First-tier Tribunal (Property Chamber)">
        <p className="text-xs text-slate-700"><strong>No tribunal cases</strong> matched this address or postcode in our records.</p>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
          We searched the Property Chamber decisions database (16,800+ public cases on gov.uk).
          No tribunal disputes between leaseholders and the freeholder/managing agent for this
          property or postcode. A clean record is a good signal.
        </p>
        <TribunalHistoryDetailButton history={history} />
      </Card>
    );
  }
  const tone = history.count >= 5 ? "red" : history.count >= 2 ? "amber" : "blue";
  const toneClass = tone === "red"
    ? "border-red-200 bg-red-50"
    : tone === "amber" ? "border-amber-200 bg-amber-50"
    : "border-blue-200 bg-blue-50";
  return (
    <Card title={`${history.count >= 2 ? "⚠ " : ""}Tribunal history, ${history.count} case${history.count === 1 ? "" : "s"}`} subtitle="First-tier Tribunal (Property Chamber)">
      <div className={`rounded-lg border p-3 ${toneClass}`}>
        <p className="text-xs text-slate-900">
          {history.count} Property Chamber decision{history.count === 1 ? "" : "s"} matched this address or postcode.
          {history.topCategory ? <> Most common category: <strong>{history.topCategory}</strong>.</> : null}
        </p>
        {Object.keys(history.byCategory).length > 1 ? (
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-700">
            {Object.entries(history.byCategory).slice(0, 8).map(([cat, n]) => (
              <li key={cat}><strong>{n}</strong> {cat}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2 text-[11px] text-slate-700 leading-relaxed">
          Repeat tribunal disputes are a strong signal of difficult freeholder/managing-agent
          relationships. Ask your solicitor to review the most relevant decisions before exchange.
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {history.recent.slice(0, 5).map((d) => (
          <li key={d.slug} className="rounded-lg border border-slate-200 p-3 text-xs">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{d.caseReference ?? d.slug}</p>
                {d.category ? <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{d.category}</p> : null}
                {d.propertyAddress ? <p className="text-[11px] text-slate-700 mt-1">{d.propertyAddress}</p> : null}
                {d.respondentName ? <p className="text-[11px] text-slate-600 mt-0.5"><strong>Respondent:</strong> {d.respondentName}</p> : null}
                {d.decisionSummary ? <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{d.decisionSummary}</p> : null}
              </div>
              <div className="shrink-0 text-right">
                {d.decisionDate ? <p className="text-[10px] text-slate-500">{new Date(d.decisionDate).toLocaleDateString("en-GB")}</p> : null}
                <a href={d.govUkUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-700 hover:text-blue-900">View decision →</a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-slate-500">Source: First-tier Tribunal (Property Chamber) decisions on gov.uk. Open Government Licence v3.0.</p>
      <TribunalHistoryDetailButton history={history} />
    </Card>
  );
}

function TribunalHistoryDetailButton({ history }: { history: NonNullable<PaidReport["tribunalHistory"]> }) {
  const byCategoryEntries = Object.entries(history.byCategory);
  return (
    <DetailButton title="Tribunal history, evidence, methodology, sources" label="View full evidence →" accent="amber">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Underlying data for this address</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">Total matching cases</dt>
          <dd className="font-semibold tabular-nums">{history.count}</dd>
          <dt className="text-slate-500">Top category</dt>
          <dd className="font-semibold">{history.topCategory ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
        </dl>
        {byCategoryEntries.length > 0 ? (
          <div className="mt-2">
            <p className="font-semibold text-slate-900 text-sm mb-1">Breakdown by category</p>
            <ul className="text-sm space-y-0.5">
              {byCategoryEntries.map(([cat, n]) => (
                <li key={cat}><span className="tabular-nums font-semibold">{n}</span> &middot; {cat}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm italic text-slate-500 mt-2">No category breakdown available for this property.</p>
        )}
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Recent decisions (up to 5 most recent)</h4>
        {history.recent.length === 0 ? (
          <p className="italic text-slate-500 text-sm">No recent decisions available for this property.</p>
        ) : (
          <ul className="space-y-3">
            {history.recent.slice(0, 5).map((d) => (
              <li key={d.slug} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">{d.caseReference ?? d.slug}</p>
                {d.decisionDate ? <p className="text-xs text-slate-500 tabular-nums">{new Date(d.decisionDate).toLocaleDateString("en-GB")}</p> : null}
                {d.category ? <p className="text-xs uppercase tracking-wider text-slate-500 mt-0.5">{d.category}</p> : null}
                {d.propertyAddress ? <p className="text-xs mt-1"><strong>Address:</strong> {d.propertyAddress}</p> : null}
                {d.respondentName ? <p className="text-xs mt-0.5"><strong>Respondent:</strong> {d.respondentName}</p> : null}
                {d.decisionSummary ? <p className="text-xs mt-1 leading-relaxed">{d.decisionSummary}</p> : null}
                <a href={d.govUkUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-amber-700 hover:text-amber-900 mt-1 inline-block">View on gov.uk →</a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Data source</h4>
        <p>First-tier Tribunal (Property Chamber), Residential Property decisions, published in full on gov.uk. Indexed by us daily via the gov.uk Search API.</p>
        <p className="text-xs"><em><a href="https://www.gov.uk/residential-property-tribunal-decisions" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900">https://www.gov.uk/residential-property-tribunal-decisions</a></em></p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Methodology</h4>
        <p>Cases are matched on postcode first (a strong key), then via trigram-fuzzy matching on the building name and property address text extracted from each decision. Up to 5 most recent matches are returned per report.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What this means for your purchase</h4>
        {history.count >= 2 ? (
          <p>Multiple tribunal cases against the same freeholder or managing agent is a strong pattern signal, service-charge disputes in particular tend to recur. Ask your solicitor to request the service-charge accounts and Section 20 consultation correspondence for the last three years, and review the most relevant decisions before exchange.</p>
        ) : history.count === 1 ? (
          <p>A single tribunal case is not unusual, but it&apos;s worth understanding the outcome. Ask your solicitor to review the decision PDF above and check whether the underlying dispute has been resolved.</p>
        ) : (
          <p>No tribunal disputes recorded against this property or postcode is a positive signal, but absence of evidence is not evidence of absence. A clean record over the last ~5 years is a reasonable comfort, especially combined with recent service-charge accounts from the seller.</p>
        )}
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How to verify</h4>
        <p>Every decision above links directly to the original gov.uk page, open and read the full decision PDF.</p>
        <p className="mt-1"><strong>Cost to verify:</strong> Free. All Property Chamber decisions are published in full on gov.uk under the Open Government Licence v3.0.</p>
      </section>
    </DetailButton>
  );
}

function BsrHrbCard({ bsr }: { bsr: NonNullable<PaidReport["bsrHrb"]> }) {
  if (!bsr.registered) {
    return (
      <Card title="Building Safety Regulator status" subtitle="BSR Higher-Risk Building register">
        <p className="text-xs text-slate-700">Building is <strong>not</strong> on the BSR Higher-Risk Building register.</p>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
          The register covers blocks ≥18m or ≥7 storeys with at least 2 residential units.
          A house, low-rise flat or small building won&apos;t appear here, that&apos;s
          a useful negative answer, not a gap. For high-rise flats, registration is
          mandatory under the Building Safety Act 2022.
        </p>
        <BsrHrbDetailButton bsr={bsr} />
      </Card>
    );
  }
  return (
    <Card title="⚠ Building Safety Regulator, Higher-Risk Building" subtitle="BSR Higher-Risk Building register">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold text-amber-900">
          {bsr.buildingName ?? "This building"} is registered as a Higher-Risk Building (HRB).
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          {bsr.heightMetres != null ? <Row label="Height" value={`${bsr.heightMetres} m`} /> : null}
          {bsr.numberOfFloors != null ? <Row label="Floors" value={`${bsr.numberOfFloors}`} /> : null}
          {bsr.residentialUnits != null ? <Row label="Residential units" value={`${bsr.residentialUnits}`} /> : null}
          {bsr.yearCompleted != null ? <Row label="Completed" value={`${bsr.yearCompleted}`} /> : null}
          {bsr.principalAccountablePerson ? <Row label="Principal Accountable Person" value={bsr.principalAccountablePerson} /> : null}
        </div>
        <p className="mt-2 text-[11px] text-amber-900 leading-relaxed">
          <strong>What this means for your purchase:</strong> the freeholder is legally
          responsible for fire + structural safety. Get the EWS1 (or equivalent FRAEW),
          confirm cladding remediation status, and check the building&apos;s Safety Case
          Report before exchange, mortgages can be refused without these.
        </p>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">Source: Building Safety Regulator public register (gov.uk).</p>
      <BsrHrbDetailButton bsr={bsr} />
    </Card>
  );
}

function BsrHrbDetailButton({ bsr }: { bsr: NonNullable<PaidReport["bsrHrb"]> }) {
  return (
    <DetailButton title="Building Safety Regulator, evidence, methodology, sources" label="View full evidence →" accent="amber">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Underlying data for this building</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">Registered as HRB</dt>
          <dd className="font-semibold">{bsr.registered ? "Yes" : "No"}</dd>
          <dt className="text-slate-500">Building name</dt>
          <dd className="font-semibold">{bsr.buildingName ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Height (metres)</dt>
          <dd className="font-semibold tabular-nums">{bsr.heightMetres != null ? `${bsr.heightMetres} m` : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Number of floors</dt>
          <dd className="font-semibold tabular-nums">{bsr.numberOfFloors != null ? bsr.numberOfFloors : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Residential units</dt>
          <dd className="font-semibold tabular-nums">{bsr.residentialUnits != null ? bsr.residentialUnits : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Year completed</dt>
          <dd className="font-semibold tabular-nums">{bsr.yearCompleted != null ? bsr.yearCompleted : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Principal Accountable Person</dt>
          <dd className="font-semibold">{bsr.principalAccountablePerson ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
        </dl>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Data source</h4>
        <p>Building Safety Regulator, Higher-Risk Building register (statutory register maintained under the Building Safety Act 2022).</p>
        <p className="text-xs"><em><a href="https://www.register-high-rise-building.service.gov.uk/public-register/search" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900">https://www.register-high-rise-building.service.gov.uk/public-register/search</a></em></p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Methodology</h4>
        <p>Per-postcode and building-name live lookup at the moment your report was generated. The register is the legal source of truth; we do not cache stale entries.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What this means for your purchase</h4>
        {bsr.registered ? (
          <p>All mainstream UK lenders require an EWS1 form (rating A1, A2, A3 or B1, never B2) before issuing a mortgage offer on a Higher-Risk Building. The form is held by the freeholder/managing agent and is typically valid for five years. <strong>Request a copy in writing before making an offer if mortgage finance is required.</strong> Without it, your offer is at risk and survey/legal fees can be spent in vain.</p>
        ) : (
          <p>This building is not on the HRB register, so the EWS1 rules below do not automatically apply. The register covers blocks of 18 m or higher (or 7+ storeys) with at least two residential units. For lower-rise blocks, lenders may still ask for an EWS1 on a case-by-case basis if cladding is visible.</p>
        )}
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How to verify</h4>
        <p>The BSR register above is free and authoritative. The EWS1 itself is obtained from the freeholder or managing agent, there is no centralised public EWS1 database.</p>
        <p className="mt-1"><strong>Cost to verify:</strong> Free. EWS1 should be supplied at no cost by the freeholder/managing agent.</p>
      </section>
    </DetailButton>
  );
}

function CompanyOwnerDetailButton({ company }: { company: NonNullable<PaidReport["companyOwner"]> }) {
  const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString("en-GB") : null);
  return (
    <DetailButton title="Companies House owner check, evidence, methodology, sources" label="View full evidence →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Underlying company data</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">Company name</dt>
          <dd className="font-semibold">{company.companyName}</dd>
          <dt className="text-slate-500">Company number</dt>
          <dd className="font-semibold tabular-nums">{company.companyNumber}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd className="font-semibold">{company.status.charAt(0).toUpperCase() + company.status.slice(1)}</dd>
          <dt className="text-slate-500">Incorporated</dt>
          <dd className="font-semibold tabular-nums">{fmtDate(company.incorporatedOn) ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Registered address</dt>
          <dd className="font-semibold">{company.registeredAddress ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">SIC codes</dt>
          <dd className="font-semibold tabular-nums">{company.sicCodes?.length ? company.sicCodes.join(", ") : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Active officers</dt>
          <dd className="font-semibold tabular-nums">{company.officersCount != null ? company.officersCount : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Outstanding charges</dt>
          <dd className="font-semibold tabular-nums">{company.outstandingCharges != null ? company.outstandingCharges : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Overseas Entity (ROE)</dt>
          <dd className="font-semibold">{company.isOverseasEntity ? "Yes" : "No"}</dd>
        </dl>
      </section>
      {company.outstandingChargesDetail && company.outstandingChargesDetail.length > 0 ? (
        <section>
          <h4 className="font-bold text-slate-900 mb-1">Outstanding charges (mortgages / debentures)</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {company.outstandingChargesDetail.map((c, i) => (
              <li key={i}>
                <strong>{c.lenderName ?? "Unknown lender"}</strong>
                {c.classification ? `, ${c.classification}` : ""}
                {c.createdOn ? <> · registered <span className="tabular-nums">{fmtDate(c.createdOn)}</span></> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {company.insolvencyCases && company.insolvencyCases.length > 0 ? (
        <section>
          <h4 className="font-bold text-slate-900 mb-1">Insolvency cases on record</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {company.insolvencyCases.map((c, i) => (
              <li key={i}>
                <strong>{c.type.replace(/-/g, " ")}</strong>
                {c.dates && c.dates[0]?.date ? <>, <span className="tabular-nums">{fmtDate(c.dates[0].date)}</span></> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {company.riskNote ? (
        <section>
          <h4 className="font-bold text-slate-900 mb-1">Our risk note</h4>
          <p className={company.status === "active" ? "" : "text-red-700 font-semibold"}>{company.riskNote}</p>
        </section>
      ) : null}
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Data source</h4>
        <p>Companies House Public Data API, the statutory UK companies register.</p>
        <p className="text-xs"><em><a href="https://api.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://api.company-information.service.gov.uk</a></em></p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Methodology</h4>
        <p>Triggered when the HMLR CCOD/OCOD ownership lookup returns a corporate proprietor name matching a limited-company suffix (LTD, LIMITED, LLP, LP, PLC, COMPANY, etc.). We then call <code>/company/{`{number}`}</code>, <code>/charges</code>, <code>/insolvency</code> and <code>/disqualified-officers</code> in parallel and join the results into the company record above.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What this means for your purchase</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {(company.outstandingCharges ?? 0) > 0 ? (
            <li><strong>Outstanding charges</strong> are mortgages or debentures registered against the seller. They <em>must</em> be discharged on completion, your solicitor will confirm via undertaking from the seller&apos;s solicitor that funds will redeem the charge on the day.</li>
          ) : null}
          {company.insolvencyCases && company.insolvencyCases.length > 0 ? (
            <li><strong>Insolvency on the entity is a critical flag.</strong> A liquidator or administrator may need to authorise the sale, and transfers from an insolvent company can sometimes be set aside. Your solicitor must verify the appointed officeholder, the disposal authority and the price reasonableness before exchange.</li>
          ) : null}
          {company.isOverseasEntity ? (
            <li><strong>Overseas Entity:</strong> the company must be on the Register of Overseas Entities and hold a valid OE number (ECTEA 2022). HMLR will refuse to register a transfer otherwise, your solicitor should obtain the OE number and ROE registration certificate before exchange.</li>
          ) : null}
          {company.status !== "active" ? (
            <li>Status is <strong>{company.status}</strong>. Active is the normal state for trading. Other statuses change the parties able to sign on the seller&apos;s side and must be reviewed.</li>
          ) : null}
          {(company.outstandingCharges ?? 0) === 0 && (!company.insolvencyCases || company.insolvencyCases.length === 0) && !company.isOverseasEntity && company.status === "active" ? (
            <li>No outstanding charges, no insolvency cases, active status and not an overseas entity, a clean corporate-owner record. Your solicitor will still verify by ordering a Companies House search at exchange.</li>
          ) : null}
        </ul>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How to verify</h4>
        <p>The full Companies House profile (charges, filings, officers, accounts) is available free here:</p>
        <p className="text-xs"><em><a href={company.profileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">{company.profileUrl}</a></em></p>
        <p className="mt-1"><strong>Cost to verify:</strong> Free. The full filing history is publicly available.</p>
      </section>
    </DetailButton>
  );
}

function IndividualBankruptcySignpost() {
  return (
    <Card title="Individual bankruptcy / insolvency check" subtitle="Owner appears individual, recommend manual check">
      <p className="text-xs text-slate-700 leading-relaxed">
        The registered owner appears to be an individual (or no corporate proprietor was
        found in HMLR&apos;s CCOD/OCOD data). The Insolvency Service runs a free public
        register where you can search for bankruptcies, IVAs, and debt relief orders.
      </p>
      <a href="https://www.gov.uk/search-bankruptcy-insolvency-register" target="_blank" rel="noopener noreferrer"
         className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold">
        Search the Insolvency Service register →
      </a>
      <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
        Search using the seller&apos;s full name. A buying a property from a bankrupt
        individual can be set aside in certain circumstances, so this is worth a
        quick check before exchange.
      </p>
    </Card>
  );
}

function OwnershipCard({ ownership }: { ownership: NonNullable<PaidReport["ownership"]> }) {
  if (!ownership.ukCompanyOwned && !ownership.overseasOwned) {
    return (
      <Card title="Registered owner type" subtitle="HM Land Registry CCOD + OCOD">
        <p className="text-xs text-slate-700">No corporate proprietor found for this address, likely individually owned.</p>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
          Cross-referenced against HMLR&apos;s monthly CCOD (UK companies) and OCOD
          (overseas companies) datasets. Individual ownership is by far the most
          common pattern.
        </p>
        <OwnershipDetailButton ownership={ownership} />
      </Card>
    );
  }
  const tone = ownership.overseasOwned ? "amber" : "blue";
  return (
    <Card title={ownership.overseasOwned ? "⚠ Overseas company owner" : "UK company owner"} subtitle="HM Land Registry CCOD + OCOD">
      <div className={`rounded-lg border p-3 ${tone === "amber" ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
        {ownership.proprietors?.length ? (
          <p className="text-xs font-semibold text-slate-900">{ownership.proprietors.join(" + ")}</p>
        ) : null}
        {ownership.countryIncorporated ? (
          <p className="mt-1 text-xs text-slate-700"><strong>Country of incorporation:</strong> {ownership.countryIncorporated}</p>
        ) : null}
        <p className="mt-2 text-[11px] text-slate-700 leading-relaxed">
          {ownership.overseasOwned
            ? "Overseas corporate ownership flagged, your solicitor should run beneficial-ownership and Register of Overseas Entities checks."
            : "Corporate ownership flagged, your solicitor should verify Companies House status, charges, and beneficial ownership."}
        </p>
      </div>
      <OwnershipDetailButton ownership={ownership} />
    </Card>
  );
}

function OwnershipDetailButton({ ownership }: { ownership: NonNullable<PaidReport["ownership"]> }) {
  const noCorporate = !ownership.ukCompanyOwned && !ownership.overseasOwned;
  return (
    <DetailButton title="Registered ownership, evidence, methodology, sources" label="View full evidence →" accent="purple">
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Underlying data for this address</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-slate-500">UK company owned</dt>
          <dd className="font-semibold tabular-nums">{ownership.ukCompanyOwned ? "Yes" : "No"}</dd>
          <dt className="text-slate-500">Overseas company owned</dt>
          <dd className="font-semibold tabular-nums">{ownership.overseasOwned ? "Yes" : "No"}</dd>
          <dt className="text-slate-500">Country of incorporation</dt>
          <dd className="font-semibold">{ownership.countryIncorporated ?? <span className="text-slate-500 italic">Not available for this property</span>}</dd>
          <dt className="text-slate-500">Registered proprietors</dt>
          <dd className="font-semibold">{ownership.proprietors?.length ? ownership.proprietors.join(" + ") : <span className="text-slate-500 italic">Not available for this property</span>}</dd>
        </dl>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Data source</h4>
        <p>HMLR CCOD/OCOD bulk dataset, published monthly under the Open Government Licence.</p>
        <p className="text-xs"><em><a href="https://use-land-property-data.service.gov.uk/datasets/ccod" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://use-land-property-data.service.gov.uk/datasets/ccod</a></em> (UK companies, CCOD)<br />
          <em><a href="https://use-land-property-data.service.gov.uk/datasets/ocod" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://use-land-property-data.service.gov.uk/datasets/ocod</a></em> (overseas, OCOD)</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">Methodology</h4>
        <p>Address postcode + PAON/SAON are matched against the latest monthly HMLR CCOD (UK companies) and OCOD (overseas) snapshots. Refresh cadence: monthly. If no corporate proprietor appears in either snapshot the registered owner is most likely an individual.</p>
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">What this means for your purchase</h4>
        {ownership.overseasOwned ? (
          <p>Overseas corporate ownership engages the Economic Crime (Transparency and Enforcement) Act 2022. Before exchange, verify the entity is on the Register of Overseas Entities (ROE) and holds a valid OE number, HMLR will refuse to register a transfer otherwise. Your solicitor should also request beneficial-ownership disclosure.</p>
        ) : ownership.ukCompanyOwned ? (
          <p>The seller is a UK company. Your solicitor should verify the company is active on Companies House, review charges (mortgages/debentures that must be discharged on completion), and confirm there are no winding-up petitions or insolvency proceedings on record.</p>
        ) : (
          <p>No corporate proprietor was found, so the registered owner is most likely an individual. This is the majority pattern, but your solicitor should still confirm by reviewing the official title register (entry A: Proprietorship Register).</p>
        )}
      </section>
      <section>
        <h4 className="font-bold text-slate-900 mb-1">How to verify</h4>
        <p>Order the Official Copy of Register of Title from HM Land Registry, <em><a href="https://www.gov.uk/search-property-information-land-registry" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900">https://www.gov.uk/search-property-information-land-registry</a></em></p>
        <p className="mt-1"><strong>Cost to verify:</strong> £3 from gov.uk; instant download.</p>
      </section>
      {noCorporate ? (
        <p className="text-xs italic text-slate-500">This popup reflects the live data on file for this address, no corporate proprietor was returned, so the company-specific fields above are intentionally blank.</p>
      ) : null}
    </DetailButton>
  );
}

function Ews1EnquiryCard({ postcode, address }: { postcode: string; address?: string }) {
  return (
    <Card title="EWS1 cladding enquiry" subtitle="Send to seller's solicitor">
      <p className="text-xs text-slate-700 mb-2">Most EWS1 forms aren&apos;t public, your solicitor must request from the freeholder. Use this enquiry template:</p>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-800 leading-relaxed font-mono whitespace-pre-line max-h-48 overflow-y-auto">
{`Subject: EWS1 enquiry, ${address ?? postcode}

Please confirm with freeholder/managing agent:
1. Current EWS1 form? Supply with rating (A1-B2), assessor, date, PAS9980 status.
2. If no EWS1, FRAEW commissioned?
3. Cladding remediation works planned/in progress?
4. ≥18m or ≥7 storeys: confirm BSR HRB registration.
5. Past insurance loadings/mortgage refusals re fire safety?`}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        <a href="https://www.register-high-rise-building.service.gov.uk/public-register/search" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">BSR HRB &rarr;</a>
        <a href="https://www.fia.uk.com/ews1.html" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">FIA &rarr;</a>
        <a href="https://buildingsafetyportal.co.uk/search_forms" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-900">Building Safety Portal &rarr;</a>
      </div>
    </Card>
  );
}
