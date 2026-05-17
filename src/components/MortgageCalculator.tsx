"use client";

import { useMemo, useState } from "react";
import { monthlyMortgagePayment } from "@/lib/financial";

interface Props {
  defaultPrice: number;
}

const PRICE_MIN = 50_000;
const PRICE_STEP = 5_000;

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}m`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return n.toLocaleString();
}

function roundToStep(n: number, step: number) {
  return Math.round(n / step) * step;
}

export default function MortgageCalculator({ defaultPrice }: Props) {
  const sliderMax = Math.max(750_000, roundToStep(Math.round(defaultPrice * 2), PRICE_STEP));
  const initialPrice = roundToStep(
    Math.max(PRICE_MIN, Math.min(sliderMax, defaultPrice || 300_000)),
    PRICE_STEP,
  );

  const [price, setPrice] = useState<number>(initialPrice);
  const [depositPct, setDepositPct] = useState<number>(10);
  const [rate, setRate] = useState<number>(4.75);
  const [term, setTerm] = useState<number>(25);

  const results = useMemo(() => {
    const deposit = Math.round(price * (depositPct / 100));
    const principal = price - deposit;
    const monthly = monthlyMortgagePayment(principal, rate, term);
    const totalPaid = monthly * term * 12;
    const totalInterest = totalPaid - principal;
    const ltv = principal / Math.max(price, 1);
    return {
      deposit,
      principal,
      monthly,
      totalInterest: Math.max(0, totalInterest),
      ltv,
    };
  }, [price, depositPct, rate, term]);

  const pricePct = Math.max(0, Math.min(100, ((price - PRICE_MIN) / (sliderMax - PRICE_MIN)) * 100));
  const depositPctTrack = Math.max(0, Math.min(100, (depositPct / 50) * 100));
  const termPct = Math.max(0, Math.min(100, ((term - 5) / (40 - 5)) * 100));

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white px-4 py-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">Estimated monthly payment</p>
        <p className="text-4xl font-extrabold mt-0.5">
          £{Math.round(results.monthly).toLocaleString()}
          <span className="text-sm font-semibold text-cyan-100"> /mo</span>
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div>
            <p className="text-cyan-200 text-[10px] uppercase tracking-wider font-bold">Loan</p>
            <p className="font-bold">£{results.principal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-cyan-200 text-[10px] uppercase tracking-wider font-bold">LTV</p>
            <p className="font-bold">{(results.ltv * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-cyan-200 text-[10px] uppercase tracking-wider font-bold">Total interest</p>
            <p className="font-bold">£{Math.round(results.totalInterest).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SliderRow
          label="House price"
          value={`£${price.toLocaleString()}`}
          min={PRICE_MIN}
          max={sliderMax}
          step={PRICE_STEP}
          current={price}
          pct={pricePct}
          onChange={setPrice}
          tickLabels={[
            `£${formatPrice(PRICE_MIN)}`,
            `£${formatPrice(sliderMax * 0.5)}`,
            `£${formatPrice(sliderMax)}`,
          ]}
        />

        <SliderRow
          label="Deposit"
          value={`${depositPct}% (£${results.deposit.toLocaleString()})`}
          min={0}
          max={50}
          step={1}
          current={depositPct}
          pct={depositPctTrack}
          onChange={setDepositPct}
          tickLabels={["0%", "25%", "50%"]}
        />

        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Interest rate</label>
            <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
              <input
                type="number"
                inputMode="decimal"
                value={rate}
                step={0.05}
                min={0}
                max={15}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  if (!Number.isFinite(raw)) return;
                  setRate(Math.max(0, Math.min(15, raw)));
                }}
                className="w-16 text-right text-sm font-semibold focus:outline-none"
              />
              <span className="text-sm font-semibold text-gray-500">%</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">UK average 5-yr fixed is ~4.5-5.0% (2026).</p>
        </div>

        <SliderRow
          label="Term"
          value={`${term} years`}
          min={5}
          max={40}
          step={1}
          current={term}
          pct={termPct}
          onChange={setTerm}
          tickLabels={["5y", "25y", "40y"]}
        />
      </div>

      <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
        Standard repayment mortgage formula. Real lender quotes depend on credit, income, product fees,
        and stress-test rules. Not financial advice.
      </p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  pct,
  onChange,
  tickLabels,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  pct: number;
  onChange: (n: number) => void;
  tickLabels: string[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(current, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
        style={{
          background: `linear-gradient(to right, #2563eb 0%, #2563eb ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          WebkitAppearance: "none",
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        {tickLabels.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
