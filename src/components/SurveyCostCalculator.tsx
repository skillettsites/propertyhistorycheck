"use client";

import { useMemo, useState } from "react";

const SLIDER_MIN = 50_000;
const SLIDER_MAX = 1_500_000;
const SLIDER_STEP = 5_000;
const ABSOLUTE_MAX = 50_000_000;

type Level = "level1" | "level2" | "level3";

const LEVELS: { id: Level; name: string; tag: string; blurb: string }[] = [
  { id: "level1", name: "RICS Level 1", tag: "Condition Report", blurb: "Newer, conventional homes in good order. Traffic-light condition ratings, no advice or valuation." },
  { id: "level2", name: "RICS Level 2", tag: "HomeBuyer Report", blurb: "The popular mid-level survey for standard properties. Defects, advice, optional valuation." },
  { id: "level3", name: "RICS Level 3", tag: "Building Survey", blurb: "Older, larger, altered or unusual properties. The most thorough structural inspection." },
];

// Typical 2026 UK ranges by purchase-price band, [low, high] per level.
function bandFees(price: number): Record<Level, [number, number]> {
  if (price <= 250_000) return { level1: [300, 500], level2: [400, 650], level3: [600, 950] };
  if (price <= 500_000) return { level1: [400, 600], level2: [500, 800], level3: [750, 1200] };
  if (price <= 750_000) return { level1: [500, 700], level2: [650, 1000], level3: [950, 1500] };
  if (price <= 1_000_000) return { level1: [600, 850], level2: [800, 1200], level3: [1200, 1900] };
  return { level1: [700, 1000], level2: [1000, 1600], level3: [1500, 2500] };
}

function fmt(n: number) { return `£${Math.round(n).toLocaleString("en-GB")}`; }
function range(lo: number, hi: number) { return `${fmt(lo)} – ${fmt(hi)}`; }

export default function SurveyCostCalculator() {
  const [price, setPrice] = useState(300_000);
  const [level, setLevel] = useState<Level>("level3");
  const [olderProperty, setOlder] = useState(false);
  const [listed, setListed] = useState(false);
  const [large, setLarge] = useState(false);

  const fees = useMemo(() => {
    const base = bandFees(price);
    const mult = 1 + (olderProperty ? 0.15 : 0) + (listed ? 0.2 : 0) + (large ? 0.15 : 0);
    const out = {} as Record<Level, [number, number]>;
    (Object.keys(base) as Level[]).forEach((k) => { out[k] = [base[k][0] * mult, base[k][1] * mult]; });
    return out;
  }, [price, olderProperty, listed, large]);

  const selected = fees[level];
  const pct = Math.max(0, Math.min(100, ((Math.min(price, SLIDER_MAX) - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Price */}
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Property value</label>
          <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
            <span className="text-sm font-semibold text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              value={price.toLocaleString("en-GB")}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, "");
                const n = digits ? Number(digits) : 0;
                if (Number.isFinite(n)) setPrice(Math.max(0, Math.min(ABSOLUTE_MAX, n)));
              }}
              className="w-32 text-right text-sm font-semibold tabular-nums focus:outline-none"
              aria-label="Property value"
            />
          </div>
        </div>
        <p className="mb-2 text-2xl font-extrabold text-gray-900">{fmt(price)}</p>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={Math.min(price, SLIDER_MAX)}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{ background: `linear-gradient(to right,#2563eb 0%,#2563eb ${pct}%,#e5e7eb ${pct}%,#e5e7eb 100%)`, WebkitAppearance: "none" }}
          aria-label="Property value slider"
        />
      </div>

      {/* Level selector */}
      <div className="mb-4 space-y-2">
        {LEVELS.map((l) => {
          const on = level === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              aria-pressed={on}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                on ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900">{l.name} <span className="font-medium text-slate-500">· {l.tag}</span></p>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{l.blurb}</p>
              </div>
              <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-slate-900">{range(fees[l.id][0], fees[l.id][1])}</span>
            </button>
          );
        })}
      </div>

      {/* Toggles */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Toggle label="Period / older" on={olderProperty} set={setOlder} />
        <Toggle label="Listed" on={listed} set={setListed} />
        <Toggle label="Large (4+ bed)" on={large} set={setLarge} />
      </div>

      {/* Selected total */}
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 px-4 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          {LEVELS.find((l) => l.id === level)!.name} estimated cost
        </p>
        <p className="mt-0.5 text-3xl font-extrabold">{range(selected[0], selected[1])}</p>
        <p className="mt-1 text-[11px] text-cyan-100">Typical 2026 UK fee for a property at this value and type.</p>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        Indicative 2026 ranges, not a quote. Surveyor fees vary by firm, region and access. Older, listed and larger
        properties cost more because they take longer to inspect. A valuation-only report is cheaper than all three survey
        levels.
      </p>
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold transition ${
        on ? "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-200" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      <span className={`inline-block h-3 w-3 rounded-full border ${on ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`} />
      {label}
    </button>
  );
}
