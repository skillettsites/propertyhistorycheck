"use client";

import { useState } from "react";

interface Current {
  hrbRegistered: boolean | null;
  rating: string | null;
  assessedOn: string | null;
  assessor: string | null;
  documentUrl: string | null;
  notes: string | null;
  status: "pending" | "ready" | "failed";
}

export default function Ews1UpdateForm({
  sessionId,
  adminKey,
  current,
}: {
  sessionId: string;
  adminKey: string;
  current: Current;
}) {
  const [hrb, setHrb] = useState<"yes" | "no" | "unknown">(
    current.hrbRegistered === true ? "yes" : current.hrbRegistered === false ? "no" : "unknown"
  );
  const [rating, setRating] = useState<string>(current.rating ?? "");
  const [assessedOn, setAssessedOn] = useState<string>(current.assessedOn ?? "");
  const [assessor, setAssessor] = useState<string>(current.assessor ?? "");
  const [documentUrl, setDocumentUrl] = useState<string>(current.documentUrl ?? "");
  const [notes, setNotes] = useState<string>(current.notes ?? "");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/ews1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey,
          sessionId,
          hrbRegistered: hrb === "yes" ? true : hrb === "no" ? false : null,
          rating: rating || null,
          assessedOn: assessedOn || null,
          assessor: assessor || null,
          documentUrl: documentUrl || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setMsg("Posted. Buyer email firing. /r/[token] now shows the findings.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">HRB-registered?</span>
          <select value={hrb} onChange={(e) => setHrb(e.target.value as typeof hrb)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="unknown">Unknown (building &lt; 18m / not listed)</option>
            <option value="yes">Yes — registered in BSR</option>
            <option value="no">No — searched, not found</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">EWS1 rating</span>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">— Not found on portals —</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="A3">A3</option>
            <option value="B1">B1</option>
            <option value="B2">B2 (fire-safety remediation needed)</option>
            <option value="Unknown">Unknown / inconclusive</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Assessed on (if rating found)</span>
          <input type="date" value={assessedOn} onChange={(e) => setAssessedOn(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700">Assessor / fire engineer</span>
          <input type="text" value={assessor} onChange={(e) => setAssessor(e.target.value)} placeholder="e.g. Allianz Engineering" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-slate-700">EWS1 PDF link (if available)</span>
        <input type="url" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-700">Notes for the buyer</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Plain-English summary. Mention remediation status, BSF/CSS application progress, anything else relevant." className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-bold">
        {busy ? "Posting…" : current.status === "ready" ? "Update findings + re-notify buyer" : "Post findings + mark ready + email buyer"}
      </button>
      {msg ? <p className="text-xs text-emerald-700">{msg}</p> : null}
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
    </form>
  );
}
