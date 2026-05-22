"use client";

import { epcAnnualEnergyCost, UK_AVG_ENERGY_BILL } from "@/lib/financial";

interface Props {
  epc: {
    rating?: string;
    totalFloorArea?: number;
    mainHeating?: string;
  };
}

const RATING_TONE: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-emerald-600", text: "text-white" },
  B: { bg: "bg-emerald-500", text: "text-white" },
  C: { bg: "bg-lime-500", text: "text-white" },
  D: { bg: "bg-yellow-400", text: "text-black" },
  E: { bg: "bg-orange-500", text: "text-white" },
  F: { bg: "bg-orange-600", text: "text-white" },
  G: { bg: "bg-rose-600", text: "text-white" },
};

export default function EnergyBillEstimate({ epc }: Props) {
  const rating = epc.rating?.toUpperCase();
  const annual = epcAnnualEnergyCost(rating, epc.totalFloorArea);
  const monthly = Math.round(annual / 12);
  const diffVsAvg = annual - UK_AVG_ENERGY_BILL;
  const diffPct = (diffVsAvg / UK_AVG_ENERGY_BILL) * 100;

  const ratingChip = rating ? RATING_TONE[rating] ?? { bg: "bg-gray-300", text: "text-gray-900" } : null;

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-900 text-white px-4 py-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
          Estimated annual energy bill
        </p>
        <p className="text-4xl font-extrabold mt-0.5">£{annual.toLocaleString()}</p>
        <p className="text-sm text-emerald-100 mt-1">
          ≈ £{monthly.toLocaleString()}/month
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">EPC rating</p>
          <div className="mt-1 flex items-center gap-2">
            {rating && ratingChip ? (
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-extrabold text-base ${ratingChip.bg} ${ratingChip.text}`}
              >
                {rating}
              </span>
            ) : (
              <span className="text-base font-bold text-gray-500">-</span>
            )}
            {epc.totalFloorArea ? (
              <span className="text-xs text-gray-600">{epc.totalFloorArea} m²</span>
            ) : null}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">vs UK average</p>
          <p className="text-base font-extrabold mt-1">
            {diffVsAvg === 0 ? (
              <span className="text-gray-700">on par</span>
            ) : diffVsAvg > 0 ? (
              <span className="text-rose-600">+£{Math.abs(diffVsAvg).toLocaleString()}</span>
            ) : (
              <span className="text-emerald-600">-£{Math.abs(diffVsAvg).toLocaleString()}</span>
            )}
            <span className="text-xs font-semibold text-gray-500 ml-1">
              ({diffPct >= 0 ? "+" : ""}
              {diffPct.toFixed(0)}%)
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 mb-3">
        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">UK average benchmark</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">
          £{UK_AVG_ENERGY_BILL.toLocaleString()}/yr
          <span className="text-xs font-semibold text-gray-500"> (Ofgem 2026 default tariff cap, dual fuel)</span>
        </p>
        {epc.mainHeating ? (
          <p className="text-[11px] text-gray-700 mt-1">
            Heating: <span className="font-semibold">{epc.mainHeating}</span>
          </p>
        ) : null}
      </div>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Estimate based on EPC band scaled to floor area. Real bills depend on usage, occupants, tariff,
        and how warm you keep the home. Informational only.
      </p>
    </div>
  );
}
