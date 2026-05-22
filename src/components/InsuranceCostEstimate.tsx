"use client";

import { estimateInsuranceCost } from "@/lib/financial";
import type { CrimeData, FloodRisk, GroundRisk } from "@/lib/types";

interface Props {
  flood?: FloodRisk;
  crime?: CrimeData;
  groundRisk?: GroundRisk;
  propertyValue: number;
}

export default function InsuranceCostEstimate({ flood, crime, groundRisk, propertyValue }: Props) {
  const result = estimateInsuranceCost({ flood, crime, groundRisk, propertyValue });
  const monthly = Math.round(result.estimate / 12);

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white px-4 py-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">
          Estimated home insurance
        </p>
        <p className="text-4xl font-extrabold mt-0.5">£{result.estimate.toLocaleString()}<span className="text-sm font-semibold text-indigo-100"> /yr</span></p>
        <p className="text-sm text-indigo-100 mt-1">
          ≈ £{monthly.toLocaleString()}/mo · range £{result.low.toLocaleString()} – £{result.high.toLocaleString()}
        </p>
      </div>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">
          Risk drivers detected
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.drivers.map((d, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] font-semibold text-amber-700"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <RiskTile
          label="Flood"
          value={
            flood
              ? flood.riskLevel === "very-low"
                ? "Very low"
                : flood.riskLevel === "low"
                ? "Low"
                : flood.riskLevel === "medium"
                ? "Medium"
                : "High"
              : "-"
          }
          tone={
            flood?.riskLevel === "high"
              ? "bad"
              : flood?.riskLevel === "medium"
              ? "warn"
              : flood?.riskLevel === "low"
              ? "warn"
              : "good"
          }
        />
        <RiskTile
          label="Crime"
          value={
            crime
              ? (() => {
                  const annualised =
                    crime.monthsCovered > 0
                      ? Math.round((crime.totalIncidents / crime.monthsCovered) * 12)
                      : crime.totalIncidents;
                  if (annualised > 3000) return "High";
                  if (annualised > 1500) return "Above avg";
                  if (annualised < 500) return "Low";
                  return "Average";
                })()
              : "-"
          }
          tone={
            crime
              ? (() => {
                  const a =
                    crime.monthsCovered > 0
                      ? (crime.totalIncidents / crime.monthsCovered) * 12
                      : crime.totalIncidents;
                  if (a > 3000) return "bad" as const;
                  if (a > 1500) return "warn" as const;
                  return "good" as const;
                })()
              : "neutral"
          }
        />
        <RiskTile
          label="Subsidence"
          value={
            groundRisk
              ? groundRisk.shrinkSwell === "very-low" || groundRisk.shrinkSwell === "low"
                ? "Low"
                : groundRisk.shrinkSwell === "moderate"
                ? "Moderate"
                : groundRisk.shrinkSwell === "unknown"
                ? "Unknown"
                : "High"
              : "-"
          }
          tone={
            groundRisk
              ? groundRisk.shrinkSwell === "high" ||
                groundRisk.shrinkSwell === "very-high" ||
                groundRisk.shrinkSwell === "significant"
                ? "bad"
                : groundRisk.shrinkSwell === "moderate"
                ? "warn"
                : "good"
              : "neutral"
          }
        />
      </div>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Composite estimate from a £200/yr baseline (£300k semi-detached) adjusted for flood, crime,
        subsidence, and rebuild value. Real quotes vary 3-5x based on insurer, claims history, security,
        and policy specifics. Informational only.
      </p>
    </div>
  );
}

function RiskTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const bg =
    tone === "good"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "warn"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : tone === "bad"
      ? "bg-rose-50 border-rose-200 text-rose-700"
      : "bg-gray-50 border-gray-200 text-gray-600";
  return (
    <div className={`rounded-xl border px-3 py-2 ${bg}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">{label}</p>
      <p className="text-sm font-extrabold mt-0.5">{value}</p>
    </div>
  );
}
