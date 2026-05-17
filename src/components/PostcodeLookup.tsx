"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface Props {
  size?: "lg" | "md";
  placeholder?: string;
  variant?: "light" | "dark";
}

interface Suggestion {
  label: string;
  postcode: string;
  type: "postcode" | "address" | "use-typed";
  rawAddress?: string;
}

const POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const PARTIAL_POSTCODE_REGEX = /^[A-Z]{1,2}\d/i;
// Matches when the input contains a UK postcode at the END preceded by other text.
// Group 1 = address text (e.g. "604 Binnacle House"), Group 2 = postcode.
const ADDRESS_WITH_POSTCODE_REGEX = /^(.+?)[\s,]+([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\s*$/i;

function extractAddressAndPostcode(input: string): { address: string; postcode: string } | null {
  const m = input.trim().match(ADDRESS_WITH_POSTCODE_REGEX);
  if (!m) return null;
  const address = m[1].replace(/[,\s]+$/g, "").trim();
  const postcode = m[2].toUpperCase().replace(/\s+/g, "");
  if (address.length < 2) return null;
  return { address, postcode };
}

// Pulls a flat/unit prefix off the start of typed input.
// Matches "604 ", "Flat 5 ", "Apartment 12B, ", "Unit 4 ", "12A " etc.
function extractFlatPrefix(input: string): string | null {
  const m = input.trim().match(/^((?:flat|apartment|apt|unit|suite|maisonette)?\s*\d+[A-Z]?)\b/i);
  if (!m) return null;
  const prefix = m[1].trim();
  // Reject if it's already a full UK postcode pattern
  if (/^[A-Z]{1,2}\d[A-Z\d]?$/i.test(prefix)) return null;
  return prefix.replace(/\s+/g, " ");
}

function formatPostcodeDisplay(p: string): string {
  const c = p.replace(/\s+/g, "").toUpperCase();
  if (c.length < 5) return c;
  return `${c.slice(0, -3)} ${c.slice(-3)}`;
}

// Strips a trailing UK postcode from a Google Places text.
function stripTrailingPostcode(text: string): string {
  return text.replace(/,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, "").trim();
}

// Strips a trailing ", UK" or ", United Kingdom".
function stripCountrySuffix(text: string): string {
  return text.replace(/,\s*(United Kingdom|UK|England|Wales|Scotland|Northern Ireland)\s*$/i, "").trim();
}

export default function PostcodeLookup({
  size = "lg",
  placeholder = "Enter a UK address (e.g. 10 Downing Street, London)",
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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inWrapper = wrapperRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inWrapper && !inDropdown) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recompute dropdown position whenever it's shown, the input moves, or window resizes/scrolls.
  useEffect(() => {
    if (!showDropdown || !inputRef.current) return;
    function compute() {
      if (!inputRef.current) return;
      const r = inputRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 8, left: r.left, width: r.width });
    }
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [showDropdown]);

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

    // Prepend a "Use as typed" suggestion if the input contains an
    // address followed by a postcode (e.g. "604 Binnacle House E1W 3AR").
    // This guarantees the user can submit their exact typed text even if
    // Google Places doesn't return individual flats.
    const parsed = extractAddressAndPostcode(trimmed);
    const prepend: Suggestion[] = parsed
      ? [
          {
            label: `${parsed.address}, ${parsed.postcode.replace(/(.{2,4})(\d[A-Z]{2})/i, "$1 $2")}`,
            postcode: parsed.postcode,
            type: "use-typed",
            rawAddress: parsed.address,
          },
        ]
      : [];

    try {
      if (POSTCODE_REGEX.test(trimmed)) {
        const res = await fetch(`/api/addresses?postcode=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const postcode = data.postcode || trimmed.toUpperCase();
          const totalAddresses = Array.isArray(data.addresses) ? data.addresses.length : 0;
          const items: Suggestion[] = [
            {
              label: totalAddresses > 0
                ? `${postcode} — see all ${totalAddresses} addresses`
                : `${postcode} (all properties)`,
              postcode,
              type: "postcode",
            },
          ];
          if (Array.isArray(data.addresses)) {
            // Show up to 100 in the dropdown so big buildings of flats aren't truncated.
            for (const addr of data.addresses.slice(0, 100)) {
              items.push({ label: addr, postcode, type: "address" });
            }
          }
          setSuggestions([...prepend, ...items]);
          setShowDropdown([...prepend, ...items].length > 0);
          setHighlightIndex(-1);
        } else {
          setSuggestions(prepend);
          setShowDropdown(prepend.length > 0);
        }
      } else if (PARTIAL_POSTCODE_REGEX.test(trimmed)) {
        const encoded = encodeURIComponent(trimmed);
        const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}/autocomplete`);
        if (res.ok) {
          const json = await res.json();
          const results: string[] = json.result ?? [];
          const items: Suggestion[] = results.map((pc) => ({ label: pc, postcode: pc, type: "postcode" }));
          setSuggestions([...prepend, ...items]);
          setShowDropdown([...prepend, ...items].length > 0);
          setHighlightIndex(-1);
        } else {
          setSuggestions(prepend);
          setShowDropdown(prepend.length > 0);
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

          // If the user's input has a flat/unit prefix that the top Google
          // result doesn't include, synthesise a "Use this address" entry that
          // combines the flat number with Google's building + postcode.
          const flatPrefix = extractFlatPrefix(trimmed);
          const synthesised: Suggestion[] = [];
          for (const it of items.slice(0, 3)) {
            if (!it.postcode || !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(it.postcode.replace(/\s+/g, ""))) continue;
            if (flatPrefix && !it.label.toLowerCase().includes(flatPrefix.toLowerCase().replace(/\s+/g, " "))) {
              const buildingText = stripCountrySuffix(stripTrailingPostcode(it.label));
              const combined = `${flatPrefix} ${buildingText}`;
              synthesised.push({
                label: `${combined}, ${formatPostcodeDisplay(it.postcode)}`,
                postcode: it.postcode,
                type: "use-typed",
                rawAddress: combined,
              });
              break; // only one synthesised entry, from the best Google hit
            }
          }
          const merged = [...prepend, ...synthesised, ...items.slice(0, 8)];
          setSuggestions(merged);
          setShowDropdown(merged.length > 0);
          setHighlightIndex(-1);
        }
      } else {
        setSuggestions(prepend);
        setShowDropdown(prepend.length > 0);
      }
    } catch {
      setSuggestions(prepend);
      setShowDropdown(prepend.length > 0);
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

  const submitSuggestion = useCallback(
    (s: Suggestion) => {
      const addressForUrl =
        s.type === "use-typed" ? s.rawAddress : s.type === "address" ? s.label : undefined;
      navigate(s.postcode, addressForUrl);
    },
    [navigate]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        submitSuggestion(suggestions[highlightIndex]);
        return;
      }
      // 1. Pure postcode → address picker
      if (POSTCODE_REGEX.test(trimmed)) {
        navigate(trimmed);
        return;
      }
      // 2. Address text containing a postcode → use as typed
      const parsed = extractAddressAndPostcode(trimmed);
      if (parsed) {
        navigate(parsed.postcode, parsed.address);
        return;
      }
      // 3. Otherwise pick the first suggestion if any
      if (suggestions.length > 0 && suggestions[0].postcode) {
        submitSuggestion(suggestions[0]);
        return;
      }
      setError("Type your address with the postcode (e.g. '604 Binnacle House E1W 3HZ') to check this property");
    },
    [query, highlightIndex, suggestions, navigate, submitSuggestion]
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
      submitSuggestion(s);
    },
    [submitSuggestion]
  );

  const isLg = size === "lg";
  const inputCls = isLg
    ? `w-full border bg-white text-gray-900 outline-none transition-all duration-200 pl-11 sm:pl-12 rounded-2xl pr-24 sm:pr-32 py-3.5 sm:py-5 text-base sm:text-lg shadow-2xl focus:ring-4 ${
        variant === "dark" ? "border-white/20 shadow-black/20 focus:border-blue-400 focus:ring-blue-400/20" : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
      }`
    : `w-full border bg-white text-gray-900 outline-none transition-all duration-200 pl-12 rounded-xl border-gray-200 pr-24 py-3 text-sm shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100`;

  const buttonCls = isLg
    ? "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 rounded-xl px-4 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base cursor-pointer"
    : "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 rounded-lg px-4 py-2 text-sm cursor-pointer";

  return (
    <div ref={wrapperRef} className={`relative w-full ${isLg ? "max-w-2xl" : "max-w-xl"}`}>
      <form onSubmit={handleSubmit} className="relative">
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
            ref={inputRef}
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
          {mounted && showDropdown && suggestions.length > 0 && dropdownPos && createPortal(
            <ul
              ref={dropdownRef}
              role="listbox"
              className="rounded-xl border border-gray-200 shadow-2xl max-h-80 overflow-y-auto"
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                zIndex: 99999,
                backgroundColor: "#ffffff",
                isolation: "isolate",
                opacity: 1,
              }}
            >
              {suggestions.map((s, i) => {
                const isUseTyped = s.type === "use-typed";
                return (
                  <li
                    key={`${s.type}-${s.label}-${i}`}
                    role="option"
                    aria-selected={i === highlightIndex}
                    className={`flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ${
                      i === highlightIndex
                        ? "bg-blue-50 text-blue-700"
                        : isUseTyped
                        ? "bg-blue-50/60 text-blue-700 hover:bg-blue-50"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } ${i > 0 ? "border-t border-gray-100" : ""}`}
                    onMouseDown={(e) => { e.preventDefault(); onSuggestionClick(s); }}
                    onMouseEnter={() => setHighlightIndex(i)}
                  >
                    {isUseTyped ? (
                      <svg className="h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : s.type === "postcode" ? (
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
                      {isUseTyped && (
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-blue-600">Use this address</span>
                      )}
                      <span className={`block truncate ${isUseTyped || s.type === "postcode" ? "font-semibold" : ""}`}>
                        {s.label}
                      </span>
                      {s.type === "address" && s.postcode && (
                        <span className="block text-xs text-gray-400 truncate">{s.postcode}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>,
            document.body
          )}
        </div>
      </form>
      {error && <p className="absolute mt-2 text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
}
