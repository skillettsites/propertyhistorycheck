/**
 * Solar PV potential, EU JRC PVGIS API.
 * Free, no key. Returns annual kWh estimate per kWp installed.
 */

export interface SolarData {
  annualKwhPerKwp: number;
  estimatedSystemKwp: number; // sized from EPC floor area (rough heuristic)
  estimatedAnnualKwh: number;
  estimatedAnnualSavings: number; // £
  monthlyAverage: number[]; // kWh by month
}

const PVGIS_BASE = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";
const ELECTRICITY_PRICE_PER_KWH = 0.245; // 2026 UK average price-cap unit rate

export async function getSolarPotential(
  lat: number,
  lng: number,
  floorAreaM2?: number
): Promise<SolarData | undefined> {
  // Heuristic: assume ~50% of floor area is south-facing roof, ~150 W/m² panels
  // Floor area unknown → assume 4 kWp typical UK domestic system.
  const peakKw = floorAreaM2 ? Math.max(2, Math.min(8, Math.round((floorAreaM2 * 0.5 * 0.15) * 10) / 10)) : 4;

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    peakpower: String(peakKw),
    loss: "14",
    outputformat: "json",
    angle: "35",
    aspect: "0",
  });

  try {
    const res = await fetch(`${PVGIS_BASE}?${params}`, {
      next: { revalidate: 86400 * 90 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const monthly: Array<{ month: number; "E_m": number }> = data?.outputs?.monthly?.fixed ?? [];
    if (monthly.length === 0) return undefined;
    const totalAnnual = Math.round(monthly.reduce((a, m) => a + m.E_m, 0));
    return {
      annualKwhPerKwp: Math.round(totalAnnual / peakKw),
      estimatedSystemKwp: peakKw,
      estimatedAnnualKwh: totalAnnual,
      estimatedAnnualSavings: Math.round(totalAnnual * ELECTRICITY_PRICE_PER_KWH),
      monthlyAverage: monthly.map((m) => Math.round(m.E_m)),
    };
  } catch {
    return undefined;
  }
}
