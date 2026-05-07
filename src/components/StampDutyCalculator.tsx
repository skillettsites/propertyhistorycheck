"use client";

import { useMemo, useState } from "react";
import { calculateSdlt } from "@/lib/stampDuty";
import type { ValueEstimate } from "@/lib/estimateValue";

interface Props {
  defaultPrice: number;
  estimate?: ValueEstimate | null;
}

const SLIDER_MIN = 50_000;
const SLIDER_MAX = 2_000_000;
const SLIDER_STEP = 5_000;

export default function StampDutyCalculator({ defaultPrice, estimate }: Props) {
  const initial = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, defaultPrice));
  const [price, setPrice] = useState<number>(initial);

  const standard = useMemo(() => calculateSdlt({ price, firstTimeBuyer: false, additionalProperty: false }), [price]);
  const ftb = useMemo(() => calculateSdlt({ price, firstTimeBuyer: true, additionalProperty: false }), [price]);
  const secondHome = useMemo(() => calculateSdlt({ price, firstTimeBuyer: false, additionalProperty: true }), [price]);

  const ftbEligible = price <= 500_000 && ftb.appliedRelief === "first-time-buyer";

  // Slider position as % so we can colour the track
  const pct = ((price - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <div>
      {estimate ? (
        <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Estimated value</p>
            <p className="text-[10px] text-blue-700 font-semibold">{estimate.confidence} confidence</p>
          </div>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">
            £{estimate.estimate.toLocaleString()}
            <span className="text-xs font-semibold text-gray-500"> (£{estimate.lowEnd.toLocaleString()} – £{estimate.highEnd.toLocaleString()})</span>
          </p>
          <button
            type="button"
            onClick={() => setPrice(estimate.estimate)}
            className="mt-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline-offset-2 hover:underline"
          >
            Reset slider to estimate
          </button>
        </div>
      ) : null}

      <div className="mb-2">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Purchase price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, Number(e.target.value) || 0)))}
            step={SLIDER_STEP}
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            className="w-32 text-right rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <p className="text-2xl font-extrabold text-gray-900 mb-2">£{price.toLocaleString()}</p>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
            WebkitAppearance: "none",
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>£{(SLIDER_MIN / 1000).toFixed(0)}k</span>
          <span>£500k</span>
          <span>£1m</span>
          <span>£1.5m</span>
          <span>£{(SLIDER_MAX / 1_000_000).toFixed(1)}m</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <SdltRow
          label="Standard buyer"
          tax={standard.total}
          rate={standard.effectiveRate}
          tone="blue"
          highlight
        />
        {ftbEligible ? (
          <SdltRow
            label="First-time buyer"
            tax={ftb.total}
            rate={ftb.effectiveRate}
            tone="emerald"
            note="Eligible: price under £500k"
          />
        ) : price <= 500_000 ? (
          <SdltRow
            label="First-time buyer"
            tax={ftb.total}
            rate={ftb.effectiveRate}
            tone="emerald"
          />
        ) : (
          <SdltRow
            label="First-time buyer"
            tax={standard.total}
            rate={standard.effectiveRate}
            tone="gray"
            note="No FTB relief above £500k"
          />
        )}
        <SdltRow
          label="Second home / BTL"
          tax={secondHome.total}
          rate={secondHome.effectiveRate}
          tone="amber"
          note="+5% additional surcharge"
        />
      </div>

      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
        England &amp; NI rates 2026/27. Scotland uses LBTT, Wales uses LTT — different bands. Slide to see how SDLT changes with price.
      </p>
    </div>
  );
}

function SdltRow({
  label, tax, rate, tone, highlight, note,
}: { label: string; tax: number; rate: number; tone: "blue" | "emerald" | "amber" | "gray"; highlight?: boolean; note?: string }) {
  const bg = highlight
    ? tone === "blue" ? "bg-gradient-to-br from-slate-900 to-blue-950 text-white"
      : "bg-gray-50"
    : "bg-gray-50";
  const labelColour = highlight ? "text-cyan-300" : "text-gray-500";
  const valueColour = highlight ? "text-white" : "text-gray-900";
  const tagBg =
    tone === "blue" ? "bg-blue-100 text-blue-700"
    : tone === "emerald" ? "bg-emerald-100 text-emerald-700"
    : tone === "amber" ? "bg-amber-100 text-amber-700"
    : "bg-gray-200 text-gray-600";
  return (
    <div className={`rounded-xl px-3 py-2.5 ${bg}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-[10px] uppercase tracking-wider font-bold ${labelColour}`}>{label}</p>
          <p className={`text-2xl font-extrabold ${valueColour}`}>£{tax.toLocaleString()}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${tagBg}`}>
            {(rate * 100).toFixed(2)}%
          </span>
          {note ? <p className={`text-[10px] mt-1 ${highlight ? "text-cyan-100" : "text-gray-500"}`}>{note}</p> : null}
        </div>
      </div>
    </div>
  );
}
