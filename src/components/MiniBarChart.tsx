"use client";

import { useEffect, useRef, useState } from "react";

interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
  /** Optional secondary line shown under the value in the tooltip. */
  sublabel?: string;
}

export default function MiniBarChart({
  bars,
  height = 64,
  formatValue,
  emptyMessage = "No data",
}: {
  bars: Bar[];
  height?: number;
  formatValue?: (v: number) => string;
  emptyMessage?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!bars.length) return <p className="text-xs text-gray-500 italic">{emptyMessage}</p>;
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-end gap-1" style={{ height }}>
        {bars.map((b, i) => {
          const h = (b.value / max) * 100;
          const isHover = hover === i;
          const isAnyHover = hover !== null;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              className="group flex-1 flex flex-col items-center justify-end h-full focus:outline-none"
              aria-label={`${b.label}: ${formatValue ? formatValue(b.value) : b.value.toLocaleString()}`}
            >
              <div
                className={`w-full rounded-t transition-all duration-500 ease-out ${
                  b.highlight
                    ? "bg-gradient-to-t from-blue-600 to-cyan-400 shadow-blue-500/30"
                    : "bg-gradient-to-t from-blue-300 to-blue-200"
                } ${isHover ? "shadow-lg scale-y-[1.02] origin-bottom" : isAnyHover ? "opacity-60" : ""} group-hover:from-blue-500 group-hover:to-cyan-300`}
                style={{
                  height: mounted ? `${Math.max(h, 4)}%` : "0%",
                  transitionDelay: mounted ? `${i * 30}ms` : "0ms",
                }}
              />
              <span
                className={`text-[9px] mt-1 w-full text-center leading-tight break-words hyphens-auto px-0.5 transition-colors ${isHover ? "text-gray-900 font-bold" : "text-gray-500"}`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {b.label}
              </span>
            </button>
          );
        })}
      </div>

      {hover !== null ? (() => {
        // Position tooltip centered above the hovered bar, but clamp so it never
        // overflows the container. We use percent-based left and adjust origin
        // (transform translateX) by how close to either edge we are.
        const fracPosition = (hover + 0.5) / bars.length;
        // Margin from edges (in % of container width). Past these, we shift the
        // tooltip's anchor to right or left so the box fits inside.
        const edgeBuffer = 0.15;
        let translateX: string;
        if (fracPosition < edgeBuffer) {
          translateX = "0%"; // tooltip anchored from its left edge
        } else if (fracPosition > 1 - edgeBuffer) {
          translateX = "-100%"; // tooltip anchored from its right edge
        } else {
          translateX = "-50%"; // centered
        }
        const arrowLeft = fracPosition < edgeBuffer
          ? "16px"
          : fracPosition > 1 - edgeBuffer
          ? "calc(100% - 16px)"
          : "50%";
        return (
          <div
            className="pointer-events-none absolute z-10 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xl whitespace-nowrap animate-fade-in"
            style={{
              left: `${fracPosition * 100}%`,
              top: -4,
              transform: `translate(${translateX}, -100%)`,
              maxWidth: "min(220px, 90vw)",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">{bars[hover].label}</div>
            <div className="text-sm font-extrabold">{formatValue ? formatValue(bars[hover].value) : bars[hover].value.toLocaleString()}</div>
            {bars[hover].sublabel ? <div className="text-[10px] text-slate-300">{bars[hover].sublabel}</div> : null}
            <div
              className="absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"
              style={{ left: arrowLeft, transform: "translateX(-50%)" }}
            />
          </div>
        );
      })() : null}
    </div>
  );
}
