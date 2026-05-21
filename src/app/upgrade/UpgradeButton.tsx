"use client";

import { useState } from "react";

export default function UpgradeButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "standard_plus_upgrade", existing_token: token }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "checkout_failed");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("network_error");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-md bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Upgrade to Premium+ · £2"}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-600 text-center">
          {error === "address_required_for_paid_report"
            ? "Your address needs to be revalidated. Email support@homebuyercheck.co.uk."
            : `Couldn't start checkout (${error}). Please try again.`}
        </p>
      ) : null}
    </>
  );
}
