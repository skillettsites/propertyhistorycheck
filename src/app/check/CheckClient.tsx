"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { captureAttribution, getAttribution } from "@/lib/tracking";
import PostcodeLookup from "@/components/PostcodeLookup";
import type { FreeReport, PostcodeAddress } from "@/lib/types";

type AddressesResponse = {
  addresses: PostcodeAddress[];
  lookup?: { lat: number; lng: number; admin_district?: string } | null;
};

export default function CheckClient() {
  const params = useSearchParams();
  const router = useRouter();
  const postcode = (params.get("postcode") || "").toUpperCase();
  const uprn = params.get("uprn") || "";

  const [addresses, setAddresses] = useState<PostcodeAddress[] | null>(null);
  const [selected, setSelected] = useState<PostcodeAddress | null>(null);
  const [report, setReport] = useState<FreeReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  // Resolve addresses for postcode
  useEffect(() => {
    if (!postcode) return;
    setError(null);
    fetch(`/api/postcode/addresses?postcode=${encodeURIComponent(postcode)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: AddressesResponse) => {
        setAddresses(data.addresses ?? []);
        if (uprn) {
          const found = data.addresses?.find((a) => a.uprn === uprn);
          if (found) setSelected(found);
        } else if (data.addresses?.length === 1) {
          setSelected(data.addresses[0]);
        }
      })
      .catch(() => setError("We couldn't look up that postcode. Try another one."));
  }, [postcode, uprn]);

  // Load free report once an address is selected
  useEffect(() => {
    if (!selected) return;
    setLoadingReport(true);
    fetch("/api/free-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: selected }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: { report: FreeReport }) => setReport(data.report))
      .catch(() => setError("Free report build failed. Try refreshing."))
      .finally(() => setLoadingReport(false));
  }, [selected]);

  if (!postcode) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Enter a UK postcode to start</h1>
        <div className="mt-6"><PostcodeLookup /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">{error}</h1>
        <div className="mt-6"><PostcodeLookup /></div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-800">Postcode {postcode}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Pick the address</h1>
        {addresses === null ? (
          <p className="mt-4 text-slate-600">Loading addresses…</p>
        ) : addresses.length === 0 ? (
          <p className="mt-4 text-slate-600">No addresses found for this postcode. Try a different postcode.</p>
        ) : (
          <ul className="mt-6 divide-y rounded-2xl border border-slate-200 bg-white">
            {addresses.map((a) => (
              <li key={a.uprn ?? a.fullAddress}>
                <button
                  className="w-full px-5 py-3 text-left hover:bg-slate-50"
                  onClick={() => {
                    setSelected(a);
                    if (a.uprn) router.replace(`/check?postcode=${encodeURIComponent(postcode)}&uprn=${a.uprn}`);
                  }}
                >
                  <span className="text-sm text-slate-900">{a.fullAddress}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8">
          <PostcodeLookup size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Free report</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{selected.fullAddress}</h1>
        </div>
        <button
          onClick={() => {
            setSelected(null);
            setReport(null);
            router.replace(`/check?postcode=${encodeURIComponent(postcode)}`);
          }}
          className="text-sm text-blue-700 hover:underline"
        >
          Change address
        </button>
      </div>

      {loadingReport && <p className="mt-6 text-slate-600">Building report…</p>}

      {report && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ReportCard title="Sales history" subtitle="HM Land Registry">
              {report.priceHistory?.sales?.length ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {report.priceHistory.sales.slice(0, 5).map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{new Date(s.date).toLocaleDateString("en-GB")}</span>
                      <span className="font-semibold">£{s.price.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No recorded sales for this address since 1995.</p>
              )}
            </ReportCard>

            <ReportCard title="Energy performance" subtitle="EPC Register">
              {report.epc ? (
                <div className="text-sm text-slate-700">
                  <p>Current rating: <span className="font-semibold">{report.epc.rating ?? "—"}</span></p>
                  <p>Potential: {report.epc.potentialRating ?? "—"}</p>
                  <p>Build year: {report.epc.buildYear ?? "—"}</p>
                  <p>Heating: {report.epc.mainHeating ?? "—"}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No EPC certificate found for this property.</p>
              )}
            </ReportCard>

            <ReportCard title="Council tax" subtitle="VOA / local authority">
              {report.councilTax?.band ? (
                <div className="text-sm text-slate-700">
                  <p>Band <span className="font-semibold">{report.councilTax.band}</span></p>
                  {report.councilTax.estimatedAnnualCost && <p>Approx. £{report.councilTax.estimatedAnnualCost.toLocaleString()} / year</p>}
                  <p className="text-xs text-slate-500">{report.councilTax.authority}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Council tax band unknown for this address.</p>
              )}
            </ReportCard>

            <ReportCard title="Flood risk" subtitle="Environment Agency">
              {report.flood ? (
                <div className="text-sm text-slate-700">
                  <p>Rivers &amp; sea: <span className="font-semibold uppercase">{report.flood.riversAndSea}</span></p>
                  <p className="text-xs text-slate-500 mt-1">Surface water and climate-projected flood risk are included in the Standard and Premium reports.</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Flood risk data unavailable.</p>
              )}
            </ReportCard>

            <ReportCard title="Crime (12 months)" subtitle="data.police.uk">
              {report.crime ? (
                <div className="text-sm text-slate-700">
                  <p><span className="font-semibold">{report.crime.totalIncidents}</span> incidents within ~1 mile</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                    {report.crime.byCategory.slice(0, 3).map((c) => (
                      <li key={c.category}>{c.category}: {c.count}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Crime data unavailable for this location.</p>
              )}
            </ReportCard>

            <ReportCard title="Schools (closest)" subtitle="GIAS / Ofsted">
              {report.schools && report.schools.length ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {report.schools.slice(0, 4).map((s) => (
                    <li key={s.urn ?? s.name} className="flex justify-between">
                      <span className="truncate pr-2">{s.name}</span>
                      <span className="text-xs text-slate-500">{s.distanceMiles} mi · {s.ofstedRating ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No nearby schools found.</p>
              )}
            </ReportCard>
          </div>

          <UpsellCard postcode={postcode} address={selected} />

          <p className="mt-6 text-xs text-slate-500">
            This free report is informational only and is not a substitute for formal conveyancing searches by a qualified solicitor.
          </p>
        </>
      )}
    </div>
  );
}

function ReportCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-[11px] uppercase tracking-wider text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function UpsellCard({ postcode, address }: { postcode: string; address: PostcodeAddress }) {
  const [loading, setLoading] = useState<"standard" | "premium" | null>(null);

  async function buy(tier: "standard" | "premium") {
    setLoading(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          postcode,
          uprn: address.uprn,
          fullAddress: address.fullAddress,
          attribution: getAttribution() ?? {},
        }),
      });
      if (!res.ok) throw new Error("checkout_failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border-2 border-blue-700 bg-white p-6 shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Unlock the full report</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">See everything your solicitor would charge £250+ to surface</h2>
      <p className="mt-2 text-sm text-slate-600">Title register, restrictive covenants, full flood detail, planning history, listed building &amp; conservation flags, mining/radon/subsidence and AI buyer&apos;s verdict.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => buy("standard")}
          disabled={!!loading}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-left hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Standard</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">£14.99</p>
          <p className="mt-1 text-xs text-slate-600">Full flood risk, environmental flags, signed PDF</p>
        </button>
        <button
          onClick={() => buy("premium")}
          disabled={!!loading}
          className="rounded-xl border-2 border-blue-700 bg-blue-50 px-5 py-3 text-left hover:bg-blue-100 disabled:opacity-50"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">Premium · Most popular</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">£29.99</p>
          <p className="mt-1 text-xs text-slate-600">Standard + live HM Land Registry title register + lease analysis + AI verdict</p>
        </button>
      </div>
      <p className="mt-4 text-xs text-slate-500">Refund within 14 days if the report fails or is incorrect. Premium tier includes a live HMLR title pull (£7 wholesale) and is non-refundable once that document has been ordered.</p>
      {loading && <p className="mt-3 text-xs text-slate-600">Redirecting to secure checkout…</p>}
    </div>
  );
}
