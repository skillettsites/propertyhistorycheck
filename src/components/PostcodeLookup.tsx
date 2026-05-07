"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  size?: "lg" | "md";
  placeholder?: string;
  variant?: "light" | "dark";
}

interface Suggestion {
  label: string;
  postcode: string;
  type: "postcode" | "address";
}

const POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const PARTIAL_POSTCODE_REGEX = /^[A-Z]{1,2}\d/i;

export default function PostcodeLookup({
  size = "lg",
  placeholder = "Enter a postcode or address (e.g. 10 Downing Street, SW1A 2AA)",
  variant = "light",
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useCallback(
    (postcode: string, address?: string) => {
      const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, "");
      if (!cleaned) return;
      setLoading(true);
      setShowDropdown(false);
      setSuggestions([]);
      const params = new URLSearchParams({ postcode: cleaned });
      if (address) params.set("address", address);
      router.push(`/check?${params.toString()}`);
    },
    [router]
  );

  const fetchSuggestions = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setFetching(true);
    setError("");
    try {
      if (POSTCODE_REGEX.test(trimmed)) {
        const res = await fetch(`/api/addresses?postcode=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const postcode = data.postcode || trimmed.toUpperCase();
          const items: Suggestion[] = [
            { label: `${postcode} (all properties)`, postcode, type: "postcode" },
          ];
          if (Array.isArray(data.addresses)) {
            for (const addr of data.addresses.slice(0, 20)) {
              items.push({ label: addr, postcode, type: "address" });
            }
          }
          setSuggestions(items);
          setShowDropdown(items.length > 0);
          setHighlightIndex(-1);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } else if (PARTIAL_POSTCODE_REGEX.test(trimmed)) {
        const encoded = encodeURIComponent(trimmed);
        const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}/autocomplete`);
        if (res.ok) {
          const json = await res.json();
          const results: string[] = json.result ?? [];
          const items: Suggestion[] = results.map((pc) => ({ label: pc, postcode: pc, type: "postcode" }));
          setSuggestions(items);
          setShowDropdown(items.length > 0);
          setHighlightIndex(-1);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } else if (trimmed.length >= 3) {
        const encoded = encodeURIComponent(trimmed);
        const res = await fetch(`/api/places?q=${encoded}`);
        if (res.ok) {
          const data = await res.json();
          const items: Suggestion[] = (data.suggestions || []).map(
            (s: { text: string; main: string; secondary: string; postcode?: string }) => {
              const pcMatch = s.text.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
              const postcode =
                s.postcode || (pcMatch ? pcMatch[0].toUpperCase().replace(/\s+/g, "") : "");
              return {
                label: s.text,
                postcode: postcode || s.main,
                type: "address" as const,
              };
            }
          );
          setSuggestions(items.slice(0, 8));
          setShowDropdown(items.length > 0);
          setHighlightIndex(-1);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      setError("");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    },
    [fetchSuggestions]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        const s = suggestions[highlightIndex];
        navigate(s.postcode, s.type === "address" ? s.label : undefined);
        return;
      }
      if (POSTCODE_REGEX.test(trimmed)) {
        navigate(trimmed);
        return;
      }
      if (suggestions.length > 0 && suggestions[0].postcode) {
        const s = suggestions[0];
        navigate(s.postcode, s.type === "address" ? s.label : undefined);
        return;
      }
      setError("Enter a UK postcode or address to check");
    },
    [query, highlightIndex, suggestions, navigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || suggestions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1));
      } else if (e.key === "Escape") {
        setShowDropdown(false);
        setHighlightIndex(-1);
      }
    },
    [showDropdown, suggestions.length]
  );

  const onSuggestionClick = useCallback(
    (s: Suggestion) => {
      setQuery(s.label);
      navigate(s.postcode, s.type === "address" ? s.label : undefined);
    },
    [navigate]
  );

  const isLg = size === "lg";
  const inputCls = isLg
    ? `w-full border bg-white text-gray-900 outline-none transition-all duration-200 pl-12 rounded-2xl pr-32 py-5 text-lg shadow-2xl focus:ring-4 ${
        variant === "dark" ? "border-white/20 shadow-black/20 focus:border-blue-400 focus:ring-blue-400/20" : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
      }`
    : `w-full border bg-white text-gray-900 outline-none transition-all duration-200 pl-12 rounded-xl border-gray-200 pr-24 py-3 text-sm shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100`;

  const buttonCls = isLg
    ? "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 rounded-xl px-7 py-3 text-base cursor-pointer"
    : "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 rounded-lg px-4 py-2 text-sm cursor-pointer";

  return (
    <div ref={wrapperRef} className={`relative w-full ${isLg ? "max-w-2xl" : "max-w-xl"}`} style={{ zIndex: 50 }}>
      {showDropdown && suggestions.length > 0 && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998, backgroundColor: "transparent" }}
          onMouseDown={() => setShowDropdown(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="relative" style={{ zIndex: showDropdown ? 9999 : "auto" }}>
        <div className="relative">
          {fetching ? (
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          )}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
            placeholder={placeholder}
            className={inputCls}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-label="Search by UK postcode or address"
          />
          <button type="submit" disabled={loading || !query.trim()} className={buttonCls}>
            {loading ? "Searching..." : "Search"}
          </button>
          {showDropdown && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-[9999] top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 shadow-2xl max-h-80 overflow-y-auto"
              style={{ backgroundColor: "#ffffff", isolation: "isolate", opacity: 1 }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.type}-${s.label}-${i}`}
                  role="option"
                  aria-selected={i === highlightIndex}
                  className={`flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ${
                    i === highlightIndex ? "bg-blue-50 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${i > 0 ? "border-t border-gray-100" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); onSuggestionClick(s); }}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  {s.type === "postcode" ? (
                    <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  )}
                  <div className="min-w-0">
                    <span className={`block truncate ${s.type === "postcode" ? "font-semibold" : ""}`}>
                      {s.label}
                    </span>
                    {s.type === "address" && s.postcode && (
                      <span className="block text-xs text-gray-400 truncate">{s.postcode}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
      {error && <p className="absolute mt-2 text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
}
