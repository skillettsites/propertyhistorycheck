"use client";

import { useMemo, useState } from "react";
import { calculateSdlt } from "@/lib/stampDuty";
import { estimateConveyancing } from "@/lib/conveyancing";

const SLIDER_MIN = 50_000;
const SLIDER_MAX = 1_500_000;
const SLIDER_STEP = 5_000;
const ABSOLUTE_MAX = 50_000_000;

type Survey = "none" | "level2" | "level3";

function fmt(n: number) { return `£${Math.round(n).toLocaleString("en-GB")}`; }

// Mid-point survey fee by price band (matches the survey calculator ranges).
function surveyFee(price: number, level: Survey): number {
  if (level === "none") return 0;
  const bands: Record<"level2" | "level3", [number, number][]> = {
    level2: [[250_000, 525], [500_000, 650], [750_000, 825], [1_000_000, 1000], [Infinity, 1300]],
    level3: [[250_000, 775], [500_000, 975], [750_000, 1225], [1_000_000, 1550], [Infinity, 2000]],
  };
  const row = bands[level].find(([cap]) => price <= cap)!;
  return row[1];
}

// Removals rough cost, scales loosely with property size (price as a proxy).
function removalsFee(price: number): number {
  if (price <= 200_000) return 450;
  if (price <= 400_000) return 700;
  if (price <= 700_000) return 1000;
  return 1400;
}

export default function CostOfBuyingCalculator() {
  const [price, setPrice] = useState(300_000);
  const [depositPct, setDepositPct] = useState(10);
  const [ftb, setFtb] = useState(true);
  const [leasehold, setLeasehold] = useState(false);
  const [survey, setSurvey] = useState<Survey>("level2");

  const calc = useMemo(() => {
    const deposit = Math.round(price * (depositPct / 100));
    const sdlt = calculateSdlt({ price, firstTimeBuyer: ftb, additionalProperty: false }).total;
    const conv = estimateConveyancing({ price, leasehold, mortgage: depositPct < 100, newBuild: false, coalArea: false });
    const conveyancing = Math.round((conv.totalLow + conv.totalHigh) / 2);
    const surv = surveyFee(price, survey);
    const mortgageFees = depositPct < 100 ? 700 : 0; // arrangement + valuation, mid
    const removals = removalsFee(price);
    const upfront = deposit + sdlt + conveyancing + surv + mortgageFees + removals;
    return { deposit, sdlt, conveyancing, surv, mortgageFees, removals, upfront };
  }, [price, depositPct, ftb, leasehold, survey]);

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
                const d = e.target.value.replace(/[^\d]/g, "");
                const n = d ? Number(d) : 0;
                if (Number.isFinite(n)) setPrice(Math.max(0, Math.min(ABSOLUTE_MAX, n)));
              }}
              className="w-32 text-right text-sm font-semibold tabular-nums focus:outline-none"
              aria-label="Purchase price"
            />
          </div>
        </div>
        <p className="mb-2 text-2xl font-extrabold text-gray-900">{fmt(price)}</p>
        <input
          type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={SLIDER_STEP}
          value={Math.min(price, SLIDER_MAX)}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{ background: `linear-gradient(to right,#2563eb 0%,#2563eb ${pct}%,#e5e7eb ${pct}%,#e5e7eb 100%)`, WebkitAppearance: "none" }}
          aria-label="Purchase price slider"
        />
      </div>

      {/* Deposit % */}
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deposit</label>
          <span className="text-sm font-bold text-slate-900">{depositPct}% · {fmt(price * depositPct / 100)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[5, 10, 15, 20, 25, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDepositPct(p)}
              className={`rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition ${
                depositPct === p ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {p === 100 ? "Cash" : `${p}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Toggle label="First-time buyer" sub="SDLT relief" on={ftb} set={setFtb} />
        <Toggle label="Leasehold" sub="extra legal work" on={leasehold} set={setLeasehold} />
      </div>

      {/* Survey level */}
      <div className="mb-5">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Survey</label>
        <div className="flex gap-1.5">
          {([["none", "None"], ["level2", "Level 2"], ["level3", "Level 3"]] as [Survey, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSurvey(id)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[12px] font-semibold transition ${
                survey === id ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 px-4 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Total cash needed up front</p>
        <p className="mt-0.5 text-3xl font-extrabold">{fmt(calc.upfront)}</p>
        <p className="mt-1 text-[11px] text-cyan-100">Deposit + tax + fees. Excludes monthly mortgage payments.</p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2">
        <Row label="Deposit" value={fmt(calc.deposit)} note={`${depositPct}% of price`} />
        <Row label="Stamp Duty (SDLT)" value={fmt(calc.sdlt)} note={ftb ? "first-time buyer rates" : "standard rates"} />
        <Row label="Conveyancing (legal + searches)" value={fmt(calc.conveyancing)} note={leasehold ? "leasehold" : "freehold"} />
        {survey !== "none" ? <Row label="Survey" value={fmt(calc.surv)} note={survey === "level3" ? "RICS Level 3" : "RICS Level 2"} /> : null}
        {calc.mortgageFees ? <Row label="Mortgage fees" value={fmt(calc.mortgageFees)} note="arrangement + valuation (mid)" /> : null}
        <Row label="Removals" value={fmt(calc.removals)} note="estimate by size" />
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        Indicative 2026 figures for England &amp; NI, not a quote. Survey and conveyancing use mid-point estimates; mortgage
        arrangement fees vary widely and some can be added to the loan. Monthly mortgage repayments are not included here.
      </p>
    </div>
  );
}

function Toggle({ label, sub, on, set }: { label: string; sub: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button" onClick={() => set(!on)} aria-pressed={on}
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

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        {note ? <p className="mt-0.5 text-[10px] text-slate-500">{note}</p> : null}
      </div>
      <p className="shrink-0 text-[13px] font-semibold tabular-nums text-slate-700">{value}</p>
    </div>
  );
}
