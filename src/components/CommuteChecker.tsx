"use client";

import { useState } from "react";
import type { CommuteResult } from "@/lib/types";

interface Props {
  fromPostcode: string;
}

export default function CommuteChecker({ fromPostcode }: Props) {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CommuteResult | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = destination.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/commute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPostcode, to: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "destination_not_found") {
          throw new Error("Couldn't resolve that postcode. Try the destination's full postcode (e.g. EC2A 4DS).");
        }
        throw new Error("Lookup failed. Try again.");
      }
      const data: CommuteResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={check} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase())}
          placeholder="Destination postcode (e.g. EC2A 4DS)"
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !destination.trim()}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? "Checking…" : "Check commute"}
        </button>
      </form>
      <p className="mt-1 text-[10px] text-gray-500">From {fromPostcode}. Try your office, your kid&apos;s school, the gym — any UK postcode.</p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
            From {fromPostcode} → {result.destinationPostcode}
          </p>
          <ModeRow
            icon="🚗"
            label="Driving"
            time={result.drivingMinutes}
            distance={result.drivingMiles ? `${result.drivingMiles} mi` : undefined}
            cost={result.drivingFuelCost ? `~£${result.drivingFuelCost.toFixed(2)} fuel` : undefined}
            tone="blue"
          />
          {result.publicTransportMinutes != null ? (
            <ModeRow
              icon="🚆"
              label="Public transport"
              time={result.publicTransportMinutes}
              note={result.publicTransportNote}
              tone="emerald"
            />
          ) : null}
          {result.cyclingMinutes != null ? (
            <ModeRow icon="🚲" label="Cycling" time={result.cyclingMinutes} tone="amber" />
          ) : null}
          {result.walkingMinutes != null ? (
            <ModeRow icon="🚶" label="Walking" time={result.walkingMinutes} distance={result.walkingMiles ? `${result.walkingMiles} mi` : undefined} tone="gray" />
          ) : null}
          <p className="mt-2 text-[10px] text-gray-500 leading-relaxed">
            Driving / cycling / walking via OSRM (open data, road network). Public transport via {result.publicTransportProvider === "TfL" ? "TfL Journey Planner" : "an estimate based on average UK rail door-to-door speed (50 km/h including waits)"}. Times are typical off-peak; rush-hour driving in London or major cities is usually 30-50% longer.
          </p>
        </div>
      )}
    </div>
  );
}

function ModeRow({ icon, label, time, distance, cost, note, tone }: {
  icon: string;
  label: string;
  time: number | undefined;
  distance?: string;
  cost?: string;
  note?: string;
  tone: "blue" | "emerald" | "amber" | "gray";
}) {
  const bg =
    tone === "emerald" ? "bg-emerald-50 border-emerald-200"
    : tone === "blue" ? "bg-blue-50 border-blue-200"
    : tone === "amber" ? "bg-amber-50 border-amber-200"
    : "bg-gray-50 border-gray-200";
  if (time == null) return null;
  const hours = Math.floor(time / 60);
  const mins = time % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  return (
    <div className={`rounded-xl border ${bg} px-3 py-2.5 flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-extrabold text-gray-900">{timeLabel}</p>
          {note ? <p className="text-[10px] text-gray-500 leading-tight">{note}</p> : null}
        </div>
      </div>
      <div className="text-right text-xs text-gray-600 shrink-0">
        {distance ? <p>{distance}</p> : null}
        {cost ? <p className="text-gray-500">{cost}</p> : null}
      </div>
    </div>
  );
}
