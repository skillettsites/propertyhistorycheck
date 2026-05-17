"use client";

import { useMemo, useState, useRef } from "react";
import { forecastPrice } from "@/lib/financial";
import type { PriceHistory } from "@/lib/types";

interface Props {
  currentValue: number;
  priceHistory?: PriceHistory;
  region?: string;
}

interface Point {
  year: number;
  value: number;
  forecast?: boolean;
}

export default function PriceForecast({ currentValue, priceHistory, region }: Props) {
  const forecast = useMemo(
    () => forecastPrice(currentValue, priceHistory?.sales, region),
    [currentValue, priceHistory, region],
  );

  // Build the chart data: historical sales (postcode if needed) + forecast points
  const chart = useMemo<Point[]>(() => {
    const points: Point[] = [];
    const sales = priceHistory?.sales ?? [];

    // Group by year, average
    if (sales.length > 0) {
      const byYear = new Map<number, number[]>();
      for (const s of sales) {
        const y = new Date(s.date).getFullYear();
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y)!.push(s.price);
      }
      const yearlyAvg = Array.from(byYear.entries())
        .map(([year, prices]) => ({
          year,
          value: prices.reduce((a, b) => a + b, 0) / prices.length,
        }))
        .sort((a, b) => a.year - b.year);
      points.push(...yearlyAvg);
    }

    const today = new Date().getFullYear();
    // Make sure the "today" point is on the line
    if (points.length === 0 || points[points.length - 1].year < today) {
      points.push({ year: today, value: currentValue });
    }

    // Forecast points
    points.push({ year: today + 1, value: forecast.y1, forecast: true });
    points.push({ year: today + 3, value: forecast.y3, forecast: true });
    points.push({ year: today + 5, value: forecast.y5, forecast: true });

    return points;
  }, [priceHistory, currentValue, forecast]);

  // SVG geometry
  const W = 320;
  const H = 120;
  const PAD_X = 8;
  const PAD_Y = 12;
  const minYear = chart[0].year;
  const maxYear = chart[chart.length - 1].year;
  const minVal = Math.min(...chart.map((p) => p.value));
  const maxVal = Math.max(...chart.map((p) => p.value));
  // Pad value range a touch for nicer aspect
  const valSpread = Math.max(maxVal - minVal, 1);
  const yMin = minVal - valSpread * 0.1;
  const yMax = maxVal + valSpread * 0.1;
  const xSpread = Math.max(maxYear - minYear, 1);

  const xFor = (year: number) => PAD_X + ((year - minYear) / xSpread) * (W - PAD_X * 2);
  const yFor = (val: number) => H - PAD_Y - ((val - yMin) / (yMax - yMin)) * (H - PAD_Y * 2);

  // Split into historical and forecast paths so we can dash the future
  const historicalPoints = chart.filter((p) => !p.forecast);
  const firstForecastIdx = chart.findIndex((p) => p.forecast);
  const forecastPoints = firstForecastIdx > 0
    ? [chart[firstForecastIdx - 1], ...chart.filter((p) => p.forecast)]
    : chart.filter((p) => p.forecast);

  const histPath = historicalPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.year).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(" ");
  const forePath = forecastPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.year).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(" ");

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 text-white px-4 py-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">
          Forecast — annual growth rate
        </p>
        <p className="text-4xl font-extrabold mt-0.5">
          {(forecast.growthRate * 100).toFixed(1)}%
          <span className="text-sm font-semibold text-purple-100"> /yr</span>
        </p>
        <p className="text-xs text-purple-100 mt-1">{forecast.source}</p>
      </div>

      <PriceLineChart
        chart={chart}
        W={W}
        H={H}
        PAD_X={PAD_X}
        PAD_Y={PAD_Y}
        xFor={xFor}
        yFor={yFor}
        histPath={histPath}
        forePath={forePath}
        minYear={minYear}
        maxYear={maxYear}
      />

      <div className="grid grid-cols-3 gap-2 mb-3">
        <ForecastTile label="In 1 year" value={forecast.y1} delta={forecast.y1 - currentValue} />
        <ForecastTile label="In 3 years" value={forecast.y3} delta={forecast.y3 - currentValue} />
        <ForecastTile label="In 5 years" value={forecast.y5} delta={forecast.y5 - currentValue} />
      </div>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Simple linear extrapolation from public Land Registry sales (where available) or regional HPI
        averages. Not a regulated valuation. House prices can fall as well as rise — use as a rough
        guide only.
      </p>
    </div>
  );
}

function PriceLineChart({
  chart, W, H, PAD_X, PAD_Y, xFor, yFor, histPath, forePath, minYear, maxYear,
}: {
  chart: Point[];
  W: number; H: number; PAD_X: number; PAD_Y: number;
  xFor: (year: number) => number;
  yFor: (val: number) => number;
  histPath: string;
  forePath: string;
  minYear: number;
  maxYear: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    // Find nearest point by x
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < chart.length; i++) {
      const d = Math.abs(xFor(chart[i].year) - local.x);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    setHover(bestIdx);
  };

  const hoverPt = hover != null ? chart[hover] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 mb-3 relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto cursor-crosshair touch-none"
        role="img"
        aria-label="Price history and forecast"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <line x1={PAD_X} y1={H - PAD_Y} x2={W - PAD_X} y2={H - PAD_Y} stroke="#e5e7eb" strokeWidth={1} />
        {hoverPt ? (
          <line
            x1={xFor(hoverPt.year)}
            y1={PAD_Y}
            x2={xFor(hoverPt.year)}
            y2={H - PAD_Y}
            stroke="#a78bfa"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        ) : null}
        {histPath ? (
          <path d={histPath} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ) : null}
        {forePath ? (
          <path d={forePath} fill="none" stroke="#a78bfa" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />
        ) : null}
        {chart.map((p, i) => {
          const isHover = hover === i;
          return (
            <g key={i}>
              {isHover ? (
                <circle
                  cx={xFor(p.year)}
                  cy={yFor(p.value)}
                  r={7}
                  fill={p.forecast ? "#a78bfa" : "#7c3aed"}
                  fillOpacity={0.2}
                />
              ) : null}
              <circle
                cx={xFor(p.year)}
                cy={yFor(p.value)}
                r={isHover ? 4 : p.forecast ? 2.5 : 3}
                fill={p.forecast ? "#a78bfa" : "#7c3aed"}
                stroke={isHover ? "#fff" : "none"}
                strokeWidth={isHover ? 2 : 0}
                style={{ transition: "r 120ms ease, stroke-width 120ms ease" }}
              />
            </g>
          );
        })}
      </svg>
      {hoverPt ? (
        <div
          className="pointer-events-none absolute z-10 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white shadow-xl whitespace-nowrap animate-tooltip-in"
          style={{
            left: `${(xFor(hoverPt.year) / W) * 100}%`,
            top: 4,
          }}
        >
          <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
            {hoverPt.forecast ? "Forecast" : "Sold"}
          </div>
          <div className="text-xs font-extrabold leading-tight">£{Math.round(hoverPt.value).toLocaleString()}</div>
          <div className="text-[10px] text-slate-300">{hoverPt.year}</div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
        </div>
      ) : null}
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{minYear}</span>
        <span>now</span>
        <span>{maxYear}</span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-purple-600" /> Sold
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t-2 border-dashed border-purple-400" /> Forecast
        </span>
        <span className="ml-auto text-gray-400 italic">Hover for detail</span>
      </div>
    </div>
  );
}

function ForecastTile({ label, value, delta }: { label: string; value: number; delta: number }) {
  const positive = delta >= 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</p>
      <p className="text-base font-extrabold text-gray-900 mt-0.5">£{value.toLocaleString()}</p>
      <p className={`text-[11px] font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
        {positive ? "+" : "-"}£{Math.abs(delta).toLocaleString()}
      </p>
    </div>
  );
}
