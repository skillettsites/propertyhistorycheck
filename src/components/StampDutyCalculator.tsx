"use client";

import { useMemo, useState } from "react";
import { calculateSdlt } from "@/lib/stampDuty";

interface Props {
  defaultPrice: number;
}

export default function StampDutyCalculator({ defaultPrice }: Props) {
  const [price, setPrice] = useState<number>(defaultPrice);
  const [ftb, setFtb] = useState(false);
  const [btl, setBtl] = useState(false);

  const result = useMemo(() => calculateSdlt({
    price,
    firstTimeBuyer: ftb,
    additionalProperty: btl,
  }), [price, ftb, btl]);

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Purchase price</label>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-gray-700">£</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
          step={5000}
          min={0}
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-base font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={ftb} onChange={(e) => { setFtb(e.target.checked); if (e.target.checked) setBtl(false); }} className="rounded text-blue-600" />
          <span className="text-gray-700">First-time buyer</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={btl} onChange={(e) => { setBtl(e.target.checked); if (e.target.checked) setFtb(false); }} className="rounded text-blue-600" />
          <span className="text-gray-700">Second home / BTL</span>
        </label>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4">
        <p className="text-xs uppercase tracking-wider text-cyan-300 font-bold">SDLT due</p>
        <p className="text-3xl font-extrabold mt-0.5">£{result.total.toLocaleString()}</p>
        <p className="text-xs text-cyan-100 mt-0.5">{(result.effectiveRate * 100).toFixed(2)}% effective rate</p>
      </div>
      {result.breakdown.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Tax band breakdown</p>
          <ul className="space-y-0.5 text-xs text-gray-600">
            {result.breakdown.map((b, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-gray-500">{b.band} @ {b.rate}</span>
                <span className="font-semibold text-gray-700">£{b.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.notes.length > 0 && (
        <p className="mt-2 text-[10px] text-gray-500 leading-relaxed">{result.notes.join(" ")}</p>
      )}
      <p className="mt-2 text-[10px] text-gray-400">England &amp; NI 2026/27 rates. Scotland uses LBTT and Wales uses LTT — different bands.</p>
    </div>
  );
}
