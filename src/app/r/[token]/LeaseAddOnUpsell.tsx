"use client";

import { useState } from "react";

export default function LeaseAddOnUpsell({
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
          tier: "lease-only",
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
    <section className="mb-6 rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-sm">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-extrabold text-slate-900">Add the registered lease document</p>
            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold">£9.99 add-on</span>
          </div>
          <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
            Pull the full registered lease (OC2) for this property from HM Land Registry. The lease document spells out your ground rent escalation clause, service-charge methodology, and every restrictive covenant in the original wording.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-700">
            <li className="flex items-start gap-1.5"><span className="text-blue-600">★</span><span>Ground rent: starting amount + escalation clause (every 25 yrs? RPI-linked? doubling?)</span></li>
            <li className="flex items-start gap-1.5"><span className="text-blue-600">★</span><span>Service charge methodology and any historical disputes</span></li>
            <li className="flex items-start gap-1.5"><span className="text-blue-600">★</span><span>Restrictive covenants (no pets, no business use, alteration consent rules)</span></li>
            <li className="flex items-start gap-1.5"><span className="text-blue-600">★</span><span>Lease term, start date, exact remaining years</span></li>
          </ul>
          <p className="mt-3 text-xs text-slate-600 italic">
            Ordered from HM Land Registry within minutes. PDF appears on this page <strong>within 48 hours</strong> (most arrive same-day) and we&apos;ll email you the moment it&apos;s ready.
          </p>
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
          >
            {busy ? "Redirecting…" : "Add lease document — £9.99"}
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
