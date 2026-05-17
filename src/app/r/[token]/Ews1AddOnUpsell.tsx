"use client";

import { useState } from "react";

export default function Ews1AddOnUpsell({
  token,
  postcode,
  fullAddress,
}: {
  token: string;
  postcode: string;
  fullAddress: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "ews1-only",
          postcode,
          fullAddress,
          parentToken: token,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 6.317 18.91 8.582 18 11.5 18 13a5 5 0 01-1.343 5.657z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-extrabold text-slate-900">Add an EWS1 cladding check</p>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold">£4.99 add-on</span>
          </div>
          <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
            Without an EWS1 form, mortgages on flats can be refused. Our team cross-references the building against the BSR Higher-Risk Building register, FIA EWS1 portal, and Building Safety Portal — then writes a plain-English summary of what your solicitor needs to know.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-700">
            <li className="flex items-start gap-1.5"><span className="text-orange-600">★</span><span>HRB registration status (mandatory register for ≥18m buildings)</span></li>
            <li className="flex items-start gap-1.5"><span className="text-orange-600">★</span><span>EWS1 rating (A1-B2) where available + assessor + date</span></li>
            <li className="flex items-start gap-1.5"><span className="text-orange-600">★</span><span>Cladding remediation status if known</span></li>
            <li className="flex items-start gap-1.5"><span className="text-orange-600">★</span><span>Plain-English summary for your solicitor</span></li>
          </ul>
          <p className="mt-3 text-xs text-slate-600 italic">
            <strong>Delivered within 48 hours</strong> by a real human on our team. We&apos;ll email you the moment findings are posted.
          </p>
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/25 disabled:opacity-50 transition-all"
          >
            {busy ? "Redirecting…" : "Add EWS1 cladding check — £4.99"}
            {!busy ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : null}
          </button>
          {err ? <p className="mt-2 text-xs text-red-700">{err}</p> : null}
        </div>
      </div>
    </section>
  );
}
