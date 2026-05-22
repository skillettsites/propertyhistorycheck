"use client";

import { useMemo, useState } from "react";
import { maxMortgage } from "@/lib/financial";

interface Props {
  defaultPrice: number;
}

const ASSUMED_DEPOSIT = 0.10; // 10% standard

/** Income required to afford the given property at 4.5x with a 10% deposit, rounded up to nearest £1k. */
function incomeNeededFor(price: number): number {
  if (!price || price <= 0) return 50_000;
  const required = (price * (1 - ASSUMED_DEPOSIT)) / 4.5;
  return Math.ceil(required / 1_000) * 1_000;
}

export default function AffordabilityCheck({ defaultPrice }: Props) {
  const initialPrice = defaultPrice || 300_000;
  const [income, setIncome] = useState<number>(incomeNeededFor(initialPrice));
  const [debts, setDebts] = useState<number>(0);
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);

  const result = useMemo(() => {
    // Annual debt servicing, knock 30x monthly debt off effective income (rough underwriter heuristic)
    const adjustedIncome = Math.max(0, income - debts * 30);
    const max = maxMortgage(adjustedIncome, 4.5);
    // Assume buyer can put down 10%, affordable price = max mortgage / (1 - deposit pct)
    const affordablePrice = Math.round(max / (1 - ASSUMED_DEPOSIT));
    const gap = affordablePrice - propertyPrice;
    const gapPct = propertyPrice > 0 ? gap / propertyPrice : 0;

    let verdict: "green" | "amber" | "red";
    let label: string;
    let summary: string;
    if (gapPct >= -0.10) {
      // Affordable when within 10% under or above
      verdict = "green";
      label = "Likely affordable";
      summary = gap >= 0
        ? `You could borrow up to £${affordablePrice.toLocaleString()}, comfortably above this property.`
        : `You're within 10% of this property's price. Most lenders will look at it.`;
    } else if (gapPct >= -0.20) {
      verdict = "amber";
      label = "Stretch";
      summary = `You're £${Math.abs(gap).toLocaleString()} short on a 4.5x multiple. Possible with a higher deposit or joint income.`;
    } else {
      verdict = "red";
      label = "Out of reach";
      summary = `On 4.5x income you'd be £${Math.abs(gap).toLocaleString()} short, over 20% below this property.`;
    }

    return {
      adjustedIncome,
      max,
      affordablePrice,
      gap,
      gapPct,
      verdict,
      label,
      summary,
    };
  }, [income, debts, propertyPrice]);

  const chip =
    result.verdict === "green"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : result.verdict === "amber"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-rose-50 border-rose-200 text-rose-700";

  const bigBg =
    result.verdict === "green"
      ? "bg-gradient-to-br from-emerald-600 to-emerald-800"
      : result.verdict === "amber"
      ? "bg-gradient-to-br from-amber-500 to-amber-700"
      : "bg-gradient-to-br from-rose-600 to-rose-800";

  return (
    <div>
      <div className={`${bigBg} text-white rounded-2xl px-4 py-4 mb-4`}>
        <p className="text-[10px] uppercase tracking-wider text-white/80 font-bold">Affordability verdict</p>
        <p className="text-2xl font-extrabold mt-0.5">{result.label}</p>
        <p className="text-xs text-white/90 mt-1">{result.summary}</p>
      </div>

      <div className="space-y-3 mb-4">
        <NumberInput
          label="Household annual income"
          prefix="£"
          value={income}
          step={1_000}
          onChange={setIncome}
        />
        <NumberInput
          label="Other monthly debts (loans, credit cards)"
          prefix="£"
          value={debts}
          step={50}
          onChange={setDebts}
          hint="Lenders treat ~£1 of monthly debt as ~£30 less you can borrow."
        />
        <NumberInput
          label="Property price"
          prefix="£"
          value={propertyPrice}
          step={5_000}
          onChange={setPropertyPrice}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatBox label="Max mortgage (4.5x)" value={`£${result.max.toLocaleString()}`} />
        <StatBox label="Max property price" value={`£${result.affordablePrice.toLocaleString()}`} />
        <StatBox
          label="Gap vs this property"
          value={`${result.gap >= 0 ? "+" : "-"}£${Math.abs(result.gap).toLocaleString()}`}
          tone={result.verdict === "green" ? "good" : result.verdict === "amber" ? "warn" : "bad"}
        />
        <div className={`rounded-xl border px-3 py-2 ${chip}`}>
          <p className="text-[10px] uppercase tracking-wider font-bold">As % of price</p>
          <p className="text-base font-extrabold">{(result.gapPct * 100).toFixed(0)}%</p>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
        Based on the standard UK 4.5x income multiple, Bank of England's flow limit means lenders cap
        most mortgages here. Assumes a 10% deposit. Lender stress tests, credit history, and outgoings
        all affect real offers.
      </p>
    </div>
  );
}

function NumberInput({
  label,
  prefix,
  value,
  step,
  onChange,
  hint,
}: {
  label: string;
  prefix?: string;
  value: number;
  step: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  // Use a text input with formatted display so users see commas (£50,000) instead
  // of the raw integer (50000) that <input type="number"> renders. We keep numeric
  // semantics via inputMode="numeric" and a digit-only filter in onChange.
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
        <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
          {prefix ? <span className="text-sm font-semibold text-gray-500">{prefix}</span> : null}
          <input
            type="text"
            inputMode="numeric"
            value={value.toLocaleString("en-GB")}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              if (!digits) { onChange(0); return; }
              const n = Number(digits);
              if (Number.isFinite(n)) onChange(Math.max(0, n));
            }}
            onBlur={() => {
              // snap to step on blur (e.g. £1,000 increments)
              if (step > 1) onChange(Math.round(value / step) * step);
            }}
            className="w-32 text-right text-sm font-semibold focus:outline-none tabular-nums"
            aria-label={label}
          />
        </div>
      </div>
      {hint ? <p className="text-[10px] text-gray-400">{hint}</p> : null}
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}) {
  const bg =
    tone === "good"
      ? "bg-emerald-50 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 border-amber-200"
      : tone === "bad"
      ? "bg-rose-50 border-rose-200"
      : "bg-gray-50 border-gray-200";
  return (
    <div className={`rounded-xl border px-3 py-2 ${bg}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</p>
      <p className="text-base font-extrabold text-gray-900">{value}</p>
    </div>
  );
}
