"use client";

import { useEffect, useState } from "react";

const BANDS: Array<{ letter: string; range: string; bg: string; text: string; hint: string }> = [
  { letter: "A", range: "92+", bg: "#16a34a", text: "white", hint: "Most efficient, bills around £700/yr for a typical home." },
  { letter: "B", range: "81-91", bg: "#22c55e", text: "white", hint: "Very efficient, well-insulated and modern." },
  { letter: "C", range: "69-80", bg: "#84cc16", text: "white", hint: "Good, UK average for newer/recently-improved homes." },
  { letter: "D", range: "55-68", bg: "#eab308", text: "black", hint: "Average, typical Victorian home with some upgrades." },
  { letter: "E", range: "39-54", bg: "#f59e0b", text: "white", hint: "Below average, minimum legal level for landlords." },
  { letter: "F", range: "21-38", bg: "#f97316", text: "white", hint: "Poor, high running costs, restricted to rent without exemption." },
  { letter: "G", range: "1-20", bg: "#dc2626", text: "white", hint: "Worst rating, can't be let to new tenants without an exemption." },
];

export default function EpcLadder({ current, potential }: { current?: string; potential?: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className="space-y-1 relative">
      {BANDS.map((b, i) => {
        const isCurrent = current === b.letter;
        const isPotential = potential === b.letter && potential !== current;
        const isActive = isCurrent || isPotential;
        const isHover = hover === b.letter;
        const dim = !isActive && !isHover;
        return (
          <button
            type="button"
            key={b.letter}
            onMouseEnter={() => setHover(b.letter)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(b.letter)}
            onBlur={() => setHover(null)}
            className={`relative w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
              dim ? "opacity-30 hover:opacity-70" : ""
            } ${isHover && !isActive ? "scale-[1.02]" : ""} ${isActive ? "shadow-md" : ""}`}
            style={{
              background: b.bg,
              color: b.text,
              transform: mounted ? "translateX(0)" : "translateX(-12px)",
              opacity: mounted ? (dim ? 0.3 : 1) : 0,
              transitionDelay: mounted ? `${i * 30}ms` : "0ms",
            }}
          >
            <span className="w-5 text-center">{b.letter}</span>
            <span className="opacity-70">{b.range}</span>
            <span className="ml-auto text-[10px] uppercase tracking-wider">
              {isCurrent && "Current"}
              {isPotential && "Potential"}
            </span>
          </button>
        );
      })}
      {hover ? (
        <div className="mt-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed shadow-lg animate-fade-in">
          <span className="font-bold">Band {hover}:</span>{" "}
          <span className="text-slate-200">{BANDS.find((b) => b.letter === hover)!.hint}</span>
        </div>
      ) : null}
    </div>
  );
}
