"use client";

import { useMemo, useState } from "react";
import { estimateConveyancing } from "@/lib/conveyancing";

const SLIDER_MIN = 50_000;
const SLIDER_MAX = 1_500_000;
const SLIDER_STEP = 5_000;
const ABSOLUTE_MAX = 50_000_000;

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}
function range(low: number, high: number) {
  return low === high ? fmt(low) : `${fmt(low)} – ${fmt(high)}`;
}

export default function ConveyancingCostCalculator() {
  const [price, setPrice] = useState(300_000);
  const [leasehold, setLeasehold] = useState(false);
  const [mortgage, setMortgage] = useState(true);
  const [newBuild, setNewBuild] = useState(false);
  const [coalArea, setCoalArea] = useState(false);

  const result = useMemo(
    () => estimateConveyancing({ price, leasehold, mortgage, newBuild, coalArea }),
    [price, leasehold, mortgage, newBuild, coalArea]
  );

  const pct = Math.max(0, Math.min(100, ((Math.min(price, SLIDER_MAX) - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Price */}
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Purchase price</label>
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
              aria-label="Purchase price"
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
          aria-label="Purchase price slider"
        />
      </div>

      {/* Toggles */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        <Toggle label="Leasehold" sub="flat / leasehold house" on={leasehold} set={setLeasehold} />
        <Toggle label="With a mortgage" sub="solicitor acts for lender" on={mortgage} set={setMortgage} />
        <Toggle label="New build" sub="extra developer paperwork" on={newBuild} set={setNewBuild} />
        <Toggle label="Coal mining area" sub="adds CON29M search" on={coalArea} set={setCoalArea} />
      </div>

      {/* Total */}
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 px-4 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Estimated total conveyancing cost</p>
        <p className="mt-0.5 text-3xl font-extrabold">{range(result.totalLow, result.totalHigh)}</p>
        <p className="mt-1 text-[11px] text-cyan-100">Legal fee + disbursements. Excludes Stamp Duty (a separate tax).</p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2">
        <Row label={result.legalFee.label} value={range(result.legalFee.low, result.legalFee.high)} note={result.legalFee.note} strong />
        {result.disbursements.map((d) => (
          <Row key={d.label} label={d.label} value={range(d.low, d.high)} note={d.note} />
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        Typical 2026 UK ranges for a purchase in England &amp; Wales, not a quote. Legal fees vary by firm; leasehold notice
        and management-pack fees are set by the freeholder. {result.sdltSeparateNote}
      </p>
    </div>
  );
}

function Toggle({ label, sub, on, set }: { label: string; sub: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
        on ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
        <span className={`inline-block h-3.5 w-3.5 rounded-full border ${on ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`} />
        {label}
      </span>
      <span className="mt-0.5 text-[10px] text-slate-500">{sub}</span>
    </button>
  );
}

function Row({ label, value, note, strong }: { label: string; value: string; note?: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <div className="min-w-0">
        <p className={`text-[13px] ${strong ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>{label}</p>
        {note ? <p className="mt-0.5 text-[10px] text-slate-500">{note}</p> : null}
      </div>
      <p className={`shrink-0 tabular-nums ${strong ? "text-[15px] font-extrabold text-slate-900" : "text-[13px] font-semibold text-slate-700"}`}>{value}</p>
    </div>
  );
}
