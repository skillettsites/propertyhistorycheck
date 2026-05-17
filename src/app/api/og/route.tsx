import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = (searchParams.get("address") ?? searchParams.get("postcode") ?? "Any UK address").slice(0, 80);
  const tagline = searchParams.get("tagline") ?? "Free pre-offer property check";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%", width: "100%", display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
          padding: 64, color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: "white",
          }}>
            ★
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
            <span style={{ color: "white" }}>Home</span>
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #67e8f9)", WebkitBackgroundClip: "text", color: "transparent" }}>Buyer</span>
            <span style={{ color: "white" }}>Check</span>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <p style={{
            margin: 0, fontSize: 20, color: "#67e8f9",
            textTransform: "uppercase", letterSpacing: 3, fontWeight: 700,
          }}>{tagline}</p>
          <p style={{
            margin: "12px 0 0", fontSize: 64, fontWeight: 900, lineHeight: 1.1,
            color: "white", maxWidth: 1000,
          }}>{address}</p>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            "Land Registry sales",
            "EPC",
            "Flood map",
            "Crime",
            "Schools",
            "Planning history",
          ].map((label) => (
            <div key={label} style={{
              fontSize: 16, padding: "8px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.08)", color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>{label}</div>
          ))}
        </div>

        <p style={{ marginTop: 24, fontSize: 16, color: "#94a3b8" }}>
          homebuyercheck.co.uk · Free instant report · £4.99 / £14.99 paid tiers
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
