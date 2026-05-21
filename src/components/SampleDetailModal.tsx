"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Shared modal used by the /sample-* pages to show "View full details" popups
 * with evidence, methodology, data sources and (where relevant) maps. Each
 * sample page wraps its sections with <DetailButton title="..." label="...">
 * and the button + modal render automatically.
 *
 * Pure client component, no external deps. Backdrop click + Escape to close.
 */
export function DetailButton({
  title,
  label = "View full details",
  accent = "blue",
  children,
}: {
  title: string;
  label?: string;
  accent?: "blue" | "purple" | "indigo" | "emerald" | "amber" | "slate";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const accentClass =
    accent === "purple" ? "text-purple-700 hover:text-purple-900 ring-purple-200"
    : accent === "indigo" ? "text-indigo-700 hover:text-indigo-900 ring-indigo-200"
    : accent === "emerald" ? "text-emerald-700 hover:text-emerald-900 ring-emerald-200"
    : accent === "amber" ? "text-amber-700 hover:text-amber-900 ring-amber-200"
    : accent === "slate" ? "text-slate-700 hover:text-slate-900 ring-slate-200"
    : "text-blue-700 hover:text-blue-900 ring-blue-200";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-current ring-1 ring-transparent hover:ring-2 transition ${accentClass}`}
      >
        {label}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center pt-20 sm:pt-12 pb-4 px-4 sm:px-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-6rem)] sm:max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 w-9 h-9 -mt-1 -mr-2 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6 text-sm leading-relaxed text-slate-700 space-y-4">
              {children}
            </div>
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
