"use client";

import { useState } from "react";

export default function LeaseUploadForm({
  sessionId,
  adminKey,
  currentDocumentUrl,
  currentStatus,
}: {
  sessionId: string;
  adminKey: string;
  currentDocumentUrl: string | null;
  currentStatus: "pending" | "ready" | "failed";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("sessionId", sessionId);
      fd.append("adminKey", adminKey);
      const res = await fetch("/api/admin/lease/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setMsg(`Uploaded. Buyer will receive email shortly. PDF: ${j.documentUrl}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      {currentDocumentUrl ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 mb-3 text-xs">
          Current PDF: <a href={currentDocumentUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-emerald-800 underline break-all">{currentDocumentUrl}</a>
        </div>
      ) : null}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
      />
      <button
        type="submit"
        disabled={!file || busy}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-bold"
      >
        {busy ? "Uploading…" : currentStatus === "ready" ? "Replace PDF + re-notify buyer" : "Upload + mark ready + email buyer"}
      </button>
      {msg ? <p className="mt-3 text-xs text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-xs text-red-700">{err}</p> : null}
    </form>
  );
}
