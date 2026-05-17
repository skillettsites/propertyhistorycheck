"use client";

import { useMemo, useState } from "react";
import { calculateSdlt } from "@/lib/stampDuty";
import type { ValueEstimate } from "@/lib/estimateValue";

interface Props {
  defaultPrice: number;
  estimate?: ValueEstimate | null;
}

const SLIDER_MIN = 50_000;
const SLIDER_STEP = 5_000;
const ABSOLUTE_MAX = 50_000_000;

function roundToStep(n: number, step: number) {
  return Math.round(n / step) * step;
}

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString();
}

export default function StampDutyCalculator({ defaultPrice, estimate }: Props) {
  // Slider max scales to ~2x the estimate (or defaultPrice fallback) so the
  // slider has useful headroom above the default. Floor of £750k so cheap
  // properties still have a sensible range.
  const baseline = estimate?.estimate ?? defaultPrice;
  // Slider headroom: 2x the estimate so buyer can model a 2x offer if they want.
  const sliderMax = Math.max(750_000, roundToStep(Math.round(baseline * 2), SLIDER_STEP));
  // Default the slider value to the property's current estimated value.
  const initial = roundToStep(Math.max(SLIDER_MIN, Math.min(sliderMax, Math.round(baseline))), SLIDER_STEP);
  const [price, setPrice] = useState<number>(initial);

  const standard = useMemo(() => calculateSdlt({ price, firstTimeBuyer: false, additionalProperty: false }), [price]);
  const ftb = useMemo(() => calculateSdlt({ price, firstTimeBuyer: true, additionalProperty: false }), [price]);
  const secondHome = useMemo(() => calculateSdlt({ price, firstTimeBuyer: false, additionalProperty: true }), [price]);

  const ftbEligible = price <= 500_000 && ftb.appliedRelief === "first-time-buyer";

  // Slider position as % so we can colour the track. If the user types a value
  // beyond the slider max the bar pegs at 100%.
  const pct = Math.max(0, Math.min(100, ((price - SLIDER_MIN) / (sliderMax - SLIDER_MIN)) * 100));

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
          <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
            <span className="text-sm font-semibold text-gray-500">£</span>
            <input
              type="text"
              inputMode="numeric"
              value={price.toLocaleString("en-GB")}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, "");
                if (!digits) { setPrice(0); return; }
                const n = Number(digits);
                if (Number.isFinite(n)) setPrice(Math.max(0, Math.min(ABSOLUTE_MAX, n)));
              }}
              className="w-32 text-right text-sm font-semibold focus:outline-none tabular-nums"
              aria-label="Purchase price"
            />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-gray-900 mb-2">£{price.toLocaleString()}</p>
        <input
          type="range"
          min={SLIDER_MIN}
          max={sliderMax}
          step={SLIDER_STEP}
          value={Math.min(price, sliderMax)}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
            WebkitAppearance: "none",
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>£{(SLIDER_MIN / 1000).toFixed(0)}k</span>
          <span>£{formatPrice(sliderMax * 0.25)}</span>
          <span>£{formatPrice(sliderMax * 0.5)}</span>
          <span>£{formatPrice(sliderMax * 0.75)}</span>
          <span>£{formatPrice(sliderMax)}</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Type any figure in the box for properties above the slider range.</p>
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
