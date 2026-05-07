"use client";

interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
}

export default function MiniBarChart({
  bars,
  height = 90,
  formatValue,
  emptyMessage = "No data",
}: {
  bars: Bar[];
  height?: number;
  formatValue?: (v: number) => string;
  emptyMessage?: string;
}) {
  if (!bars.length) return <p className="text-xs text-gray-500 italic">{emptyMessage}</p>;
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end gap-1 h-full">
        {bars.map((b, i) => {
          const h = (b.value / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${b.label}: ${formatValue ? formatValue(b.value) : b.value}`}>
              <div
                className={`w-full rounded-t transition-all ${b.highlight ? "bg-gradient-to-t from-blue-600 to-cyan-400" : "bg-blue-200 hover:bg-blue-300"}`}
                style={{ height: `${Math.max(h, 4)}%` }}
              />
              <span className="text-[9px] text-gray-500 mt-1 truncate w-full text-center">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
