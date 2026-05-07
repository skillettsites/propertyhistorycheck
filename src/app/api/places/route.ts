import { NextRequest, NextResponse } from "next/server";

function cleanEnv(val: string | undefined): string {
  return (val || "").replace(/\\n/g, "").replace(/\n/g, "").trim();
}

// Google Places Autocomplete (New) proxy. Server-side only.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = cleanEnv(process.env.GOOGLE_PLACES_API_KEY);
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: ["gb"],
        languageCode: "en",
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const rawSuggestions = (data.suggestions || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => {
        const pred = s.placePrediction;
        if (!pred) return null;
        const text = pred.text?.text || "";
        const main = pred.structuredFormat?.mainText?.text || "";
        const secondary = pred.structuredFormat?.secondaryText?.text || "";
        const placeId = pred.placeId || "";
        const pcMatch = text.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
        const postcode = pcMatch ? pcMatch[0].toUpperCase() : "";
        return { text, main, secondary, placeId, postcode };
      })
      .filter(Boolean);

    // For results without postcodes, geocode via place ID to extract postal_code component.
    const suggestions = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawSuggestions.map(async (s: any) => {
        if (s.postcode) return s;
        try {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?place_id=${s.placeId}&key=${apiKey}`,
            { signal: AbortSignal.timeout(2000) }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const result = geoData.results?.[0];
            if (result) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const pcComponent = result.address_components?.find((c: any) =>
                c.types?.includes("postal_code")
              );
              if (pcComponent) s.postcode = pcComponent.long_name.toUpperCase();
            }
          }
        } catch {
          /* swallow */
        }
        return s;
      })
    );

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "public, s-maxage=86400" } }
    );
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
