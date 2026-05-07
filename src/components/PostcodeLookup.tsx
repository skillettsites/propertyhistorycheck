"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PostcodeLookup({ size = "lg" }: { size?: "lg" | "md" }) {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!postcode || postcode.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/postcode/autocomplete?q=${encodeURIComponent(postcode)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 6) : []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [postcode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = postcode.trim().toUpperCase();
    if (!clean) {
      setError("Enter a UK postcode to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    router.push(`/check?postcode=${encodeURIComponent(clean)}`);
  }

  const inputCls =
    size === "lg"
      ? "w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-lg shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
      : "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

  const buttonCls =
    size === "lg"
      ? "rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-blue-800 disabled:bg-slate-400"
      : "rounded-lg bg-blue-700 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:bg-slate-400";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="Enter a UK postcode (e.g. OX11 0AA)"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            className={inputCls}
            aria-label="UK postcode"
          />
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      setPostcode(s);
                      setSuggestions([]);
                    }}
                    className="block w-full px-5 py-3 text-left text-base hover:bg-slate-50"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" disabled={loading} className={buttonCls}>
          {loading ? "Loading…" : "Get Free Report"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
