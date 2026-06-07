"use client";

import { useMemo, useState } from "react";

/**
 * Leasehold extension cost calculator (statutory 90-year + peppercorn extension).
 *
 * The buyer drives this with their own three inputs (no fetched lease data
 * needed): remaining lease years, current ground rent, and the property's
 * freehold/long-lease value. We model the premium under CURRENT law and give an
 * INDICATIVE post-Leasehold-and-Freehold-Reform-Act-2024 figure.
 *
 * IMPORTANT: this is a simplified indicative model, not a RICS valuation. The
 * 2024 Act's valuation provisions (marriage-value abolition, rate-setting) are
 * not yet in force, so the "after reform" number is a heavily-caveated estimate.
 */

// Deferment + capitalisation rates (Sportelli-style conventional rates).
const DEFERMENT_RATE = 0.05;
const CAPITALISATION_RATE = 0.07;

// Relativity (short-lease value as a % of freehold value) by remaining years.
// Indicative blend of common graphs (Savills/Gerald Eve style). Interpolated.
const RELATIVITY: Array<[years: number, pct: number]> = [
  [25, 0.62], [30, 0.68], [40, 0.79], [50, 0.86], [60, 0.91],
  [70, 0.955], [80, 0.97], [90, 0.99], [99, 0.995], [125, 1.0],
];

function relativity(years: number): number {
  if (years <= RELATIVITY[0][0]) return RELATIVITY[0][1];
  if (years >= RELATIVITY[RELATIVITY.length - 1][0]) return 1;
  for (let i = 0; i < RELATIVITY.length - 1; i++) {
    const [y0, p0] = RELATIVITY[i];
    const [y1, p1] = RELATIVITY[i + 1];
    if (years >= y0 && years <= y1) {
      return p0 + ((p1 - p0) * (years - y0)) / (y1 - y0);
    }
  }
  return 1;
}

function gbp(n: number): string {
  return "£" + Math.round(n).toLocaleString("en-GB");
}

export default function LeaseholdCalculator({
  defaultValue = 350000,
}: { defaultValue?: number }) {
  const [yearsRemaining, setYearsRemaining] = useState(82);
  const [groundRent, setGroundRent] = useState(250);
  const [value, setValue] = useState(defaultValue);

  const result = useMemo(() => {
    const y = Math.max(1, Math.min(199, yearsRemaining));
    const fh = Math.max(10000, value);
    const gr = Math.max(0, groundRent);

    // Term value: present value of the ground rent stream over the unexpired term.
    const termValue = CAPITALISATION_RATE > 0
      ? gr * (1 - Math.pow(1 + CAPITALISATION_RATE, -y)) / CAPITALISATION_RATE
      : gr * y;

    // Reversion: present value of the freehold reverting to the landlord at term end.
    const reversionValue = fh * Math.pow(1 + DEFERMENT_RATE, -y);

    // Existing short-lease value from relativity.
    const shortLeaseValue = fh * relativity(y);

    // Marriage value applies only when the lease is under 80 years (current law).
    // MV = 50% of the uplift in combined value once the lease is extended.
    const landlordBefore = termValue + reversionValue;
    const marriageValue = y < 80
      ? Math.max(0, 0.5 * (fh - shortLeaseValue - landlordBefore))
      : 0;

    const currentPremium = termValue + reversionValue + marriageValue;

    // After the 2024 Act (indicative): marriage value abolished, so the premium
    // is broadly term + reversion only. Rates aren't set yet, so this is a
    // lower-bound estimate, not a promise.
    const reformPremium = termValue + reversionValue;

    return {
      currentPremium,
      reformPremium,
      marriageValue,
      termValue,
      reversionValue,
      underThreshold: y < 80,
      saving: currentPremium - reformPremium,
    };
  }, [yearsRemaining, groundRent, value]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm overflow-hidden min-w-0">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className="text-sm font-bold text-gray-900">Leasehold extension cost</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold shrink-0">Indicative model</p>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Enter your lease details to estimate the premium to extend the lease by 90 years at a peppercorn (zero) ground rent.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-600">Years remaining</span>
          <input
            type="number" inputMode="numeric" min={1} max={199}
            value={yearsRemaining}
            onChange={(e) => setYearsRemaining(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-600">Ground rent / year</span>
          <input
            type="number" inputMode="numeric" min={0}
            value={groundRent}
            onChange={(e) => setGroundRent(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-gray-600">Property value</span>
          <input
            type="number" inputMode="numeric" min={10000} step={1000}
            value={value}
            onChange={(e) => setValue(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Estimated premium, current law</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{gbp(result.currentPremium)}</p>
          <p className="text-[10px] text-gray-500 mt-1">plus your and the freeholder&apos;s legal + valuation fees (typically £2,000-£4,000)</p>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Indicative, after 2024 Act reform</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{gbp(result.reformPremium)}</p>
          <p className="text-[10px] text-gray-500 mt-1">{result.saving > 500 ? `roughly ${gbp(result.saving)} lower (marriage value removed)` : "similar (no marriage value applies)"}</p>
        </div>
      </div>

      {result.underThreshold && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800 leading-snug">
          Under 80 years remaining, so <strong>marriage value</strong> ({gbp(result.marriageValue)}) currently applies and the cost rises sharply each year. Extending sooner is usually cheaper.
        </div>
      )}

      <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
        Indicative only, not a RICS valuation or legal advice. Uses conventional 5% deferment / 7% capitalisation rates and a standard relativity graph; your freeholder&apos;s surveyor may use different figures. The Leasehold and Freehold Reform Act 2024 valuation rules are not yet in force and the prescribed rates are not set, so the &ldquo;after reform&rdquo; figure is a heavily-caveated estimate. Get a formal valuation from a leasehold-extension surveyor before serving notice.
      </p>
    </div>
  );
}
