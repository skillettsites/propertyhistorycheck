"use client";

const BANDS: Array<{ letter: string; range: string; bg: string; text: string }> = [
  { letter: "A", range: "92+", bg: "#16a34a", text: "white" },
  { letter: "B", range: "81-91", bg: "#22c55e", text: "white" },
  { letter: "C", range: "69-80", bg: "#84cc16", text: "white" },
  { letter: "D", range: "55-68", bg: "#eab308", text: "black" },
  { letter: "E", range: "39-54", bg: "#f59e0b", text: "white" },
  { letter: "F", range: "21-38", bg: "#f97316", text: "white" },
  { letter: "G", range: "1-20", bg: "#dc2626", text: "white" },
];

export default function EpcLadder({ current, potential }: { current?: string; potential?: string }) {
  return (
    <div className="space-y-1">
      {BANDS.map((b) => {
        const isCurrent = current === b.letter;
        const isPotential = potential === b.letter && potential !== current;
        const dim = !isCurrent && !isPotential;
        return (
          <div
            key={b.letter}
            className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold transition-all ${dim ? "opacity-30" : ""}`}
            style={{ background: b.bg, color: b.text }}
          >
            <span className="w-5 text-center">{b.letter}</span>
            <span className="opacity-70">{b.range}</span>
            <span className="ml-auto text-[10px] uppercase">
              {isCurrent && "Current"}
              {isPotential && "Potential"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
