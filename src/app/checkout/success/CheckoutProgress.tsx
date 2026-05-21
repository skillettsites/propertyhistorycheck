"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SOURCES: Array<{ name: string; tag: string }> = [
  { name: "HM Land Registry — Price Paid", tag: "Sales history (1995+)" },
  { name: "HMLR CCOD / OCOD", tag: "Ownership flag (UK / overseas company)" },
  { name: "Companies House", tag: "Corporate owner check (insolvency, charges, directors)" },
  { name: "EPC Register (MHCLG)", tag: "Energy rating + floor area" },
  { name: "Environment Agency", tag: "Flood risk + Zone 2/3" },
  { name: "Police.uk", tag: "Crime by category, 12 months" },
  { name: "DEFRA UK-AIR", tag: "NO₂, PM2.5, DAQI" },
  { name: "DEFRA Noise Mapping", tag: "Road + rail dB" },
  { name: "Coal Authority", tag: "Mining reporting area" },
  { name: "BGS — Ground Risk", tag: "Subsidence + shrink-swell + landslide" },
  { name: "UKHSA Radon Map", tag: "Radon band 1-6" },
  { name: "Historic England", tag: "Listed building grade" },
  { name: "Planning Data (DLUHC)", tag: "Conservation, TPO, Article 4" },
  { name: "Building Safety Regulator", tag: "Higher-Risk Building register" },
  { name: "Property Chamber (gov.uk)", tag: "Tribunal decision history" },
  { name: "Ofcom Connected Nations", tag: "Broadband + 4G/5G by carrier" },
  { name: "GIAS / Ofsted", tag: "Schools + ratings" },
  { name: "NHS Service Finder", tag: "GPs, pharmacies, hospitals" },
  { name: "OS Places + OSM Overpass", tag: "Amenities + greenspace" },
  { name: "ONS Census 2021", tag: "Demographics + tenure" },
  { name: "PVGIS (EU JRC)", tag: "Solar potential" },
  { name: "Anthropic Claude", tag: "AI buyer's verdict + seller-question pack" },
];

export default function CheckoutProgress({ token, postcode, isUpgrade }: { token: string | null; tier?: string; postcode: string; isUpgrade?: boolean }) {
  const router = useRouter();
  const activeSources = SOURCES;
  const [progress, setProgress] = useState(0);
  const [completedIndex, setCompletedIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const startRef = useRef<number>(Date.now());

  // Smooth animation through the source list (cosmetic), capped at 95% until report ready.
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // Reach 95% at ~45s — typical webhook completion. Cap until poll confirms ready.
      const target = Math.min(95, (elapsed / 45) * 95);
      setProgress((p) => Math.max(p, target));
      const idx = Math.min(activeSources.length - 1, Math.floor((target / 95) * activeSources.length));
      setCompletedIndex(idx);
    }, 250);
    return () => clearInterval(tick);
  }, [activeSources.length]);

  // Poll Supabase via a thin status endpoint.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/r/${token}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        if (j.status === "ready") {
          if (cancelled) return;
          setProgress(100);
          setCompletedIndex(activeSources.length);
          setReady(true);
          setTimeout(() => router.push(`/r/${token}`), 800);
        } else if (j.status === "failed") {
          if (cancelled) return;
          setReady(true); // stop polling
        }
      } catch {
        // network blip, swallow + retry on interval
      }
      if (!cancelled) setPollAttempts((n) => n + 1);
    }
    const interval = setInterval(poll, 2500);
    poll();
    return () => { cancelled = true; clearInterval(interval); };
  }, [token, activeSources.length, router]);

  const elapsedSec = Math.floor((Date.now() - startRef.current) / 1000);
  const elapsedShown = pollAttempts > 0 ? elapsedSec : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Payment received</p>
            <h1 className="mt-1 text-xl md:text-2xl font-extrabold text-slate-900">
              {isUpgrade ? "Upgrading your report to Premium+" : "Building your Premium report"}
              {postcode ? <span className="text-slate-500 font-bold"> · {postcode}</span> : null}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {isUpgrade
                ? "Generating the three AI briefs against your existing report. Usually 30-60 seconds."
                : `Pulling live data from ${activeSources.length} sources. Usually 30-60 seconds.`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-blue-700">{Math.floor(progress)}<span className="text-base font-bold text-slate-500">%</span></p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{elapsedShown > 0 ? `${elapsedShown}s elapsed` : "Starting…"}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Source list */}
        <ul className="mt-6 grid gap-1.5 md:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
          {activeSources.map((s, i) => {
            const done = i < completedIndex;
            const inProgress = i === completedIndex && !ready;
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
                <span className="min-w-0">
                  <span className={`font-semibold ${done ? "text-emerald-900" : inProgress ? "text-blue-900" : "text-slate-700"}`}>{s.name}</span>
                  <br />
                  <span className={`text-[10px] ${done ? "text-emerald-700" : "text-slate-500"}`}>{s.tag}</span>
                </span>
              </li>
            );
          })}
        </ul>

        {ready && token ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-emerald-700">Done. Opening your report…</p>
          </div>
        ) : (
          <p className="mt-6 text-[11px] text-slate-500 text-center">If this takes longer than 2 minutes, your report is still safe — refresh or check your email. The page link <span className="font-mono">/r/{token}</span> is permanent.</p>
        )}
      </div>

      {/* What's next */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-700">
        <p className="font-bold text-slate-900">While you wait</p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>You&apos;ll receive an email with a permanent link to your report.</li>
          <li>The web report is canonical — bookmark it. We&apos;ll update it live as add-ons (e.g. lease document) arrive.</li>
          <li>Need help? <a href="mailto:support@homebuyercheck.co.uk" className="text-blue-700 underline">support@homebuyercheck.co.uk</a></li>
        </ul>
      </div>
    </div>
  );
}
