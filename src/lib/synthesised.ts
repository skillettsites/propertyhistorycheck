/**
 * Synthesised data: composite scores derived from existing free-tier signals.
 *
 * - Lifestyle scores (family / first-time buyer / retiree / commuter / investor)
 * - Area trend (improving / stable / declining)
 * - Composite risk score
 *
 * Pure functions. No API calls. Run AFTER all parallel adapters resolve.
 */

import type {
  AreaTrend,
  CompositeRiskScore,
  CrimeData,
  Demographics,
  EpcData,
  FloodRisk,
  GreenspaceData,
  GroundRisk,
  HealthcareData,
  IMDScore,
  LifestyleScores,
  PlanningData,
  PriceHistory,
  RentalEstimate,
  School,
  TransportNearby,
  WalkScore,
  ListedBuildingDetail,
  AirQualityData,
} from "./types";

interface SignalInput {
  schools?: School[];
  imd?: IMDScore;
  crime?: CrimeData;
  flood?: FloodRisk;
  groundRisk?: GroundRisk;
  airQuality?: AirQualityData;
  walkScore?: WalkScore;
  transportNearby?: TransportNearby;
  healthcare?: HealthcareData;
  greenspace?: GreenspaceData;
  planning?: PlanningData;
  demographics?: Demographics;
  epc?: EpcData;
  priceHistory?: PriceHistory;
  rentalEstimate?: RentalEstimate;
  listedBuilding?: ListedBuildingDetail;
}

/** Clamp helper. */
const clamp = (n: number, lo = 0, hi = 10): number => Math.max(lo, Math.min(hi, n));

/** Convert IMD decile (1=most deprived, 10=least) to a 0-10 desirability score. */
function imdToScore(d?: IMDScore): number | undefined {
  if (!d?.decile) return undefined;
  return d.decile; // already 1-10, higher=better
}

/** Schools 0-10: Outstanding within 1.6km worth 3, Good worth 1.5, capped at 10. */
function schoolsScore(s?: School[]): number | undefined {
  if (!s?.length) return undefined;
  const near = s.filter((sch) => sch.distance <= 1.6);
  if (!near.length) return 0;
  const value = near.reduce((acc, sc) => {
    if (/outstanding/i.test(sc.rating ?? "")) return acc + 3;
    if (/^good$/i.test(sc.rating ?? "")) return acc + 1.5;
    return acc;
  }, 0);
  return clamp(value);
}

/** Crime 0-10: invert total incidents around a typical UK average of ~1,200/12mo within 1mi. */
function crimeScore(c?: CrimeData): number | undefined {
  if (!c) return undefined;
  const baseline = 1200;
  // 0 incidents = 10; baseline = 5; double baseline = 0
  const ratio = c.totalIncidents / baseline;
  return clamp(10 - ratio * 5);
}

/** Flood 0-10: high-zone = 0, medium = 4, low = 8, very-low = 10. */
function floodScore(f?: FloodRisk): number | undefined {
  if (!f) return undefined;
  if (f.inFloodZone3) return 0;
  if (f.inFloodZone2) return 4;
  if (f.riskLevel === "high") return 0;
  if (f.riskLevel === "medium") return 4;
  if (f.riskLevel === "low") return 8;
  return 10;
}

function groundScore(g?: GroundRisk): number | undefined {
  if (!g || g.shrinkSwell === "unknown") return undefined;
  const order: Record<string, number> = {
    "very-low": 10, low: 9, moderate: 6, significant: 4, high: 2, "very-high": 0,
  };
  return order[g.shrinkSwell] ?? undefined;
}

function airScore(a?: AirQualityData): number | undefined {
  if (!a) return undefined;
  if (a.daqiBand == null) return undefined;
  return clamp(10 - (a.daqiBand - 1));
}

function walkabilityScore(w?: WalkScore): number | undefined {
  if (!w) return undefined;
  return w.score / 10;
}

function publicTransportScore(t?: TransportNearby): number | undefined {
  if (!t) return undefined;
  let score = 0;
  if (t.nearestStation) {
    const d = t.nearestStation.distanceM ?? 5000;
    score += d <= 500 ? 4 : d <= 1000 ? 3 : d <= 2000 ? 2 : 1;
  }
  if (t.nearestTube) {
    const d = t.nearestTube.distanceM ?? 5000;
    score += d <= 500 ? 4 : d <= 1000 ? 3 : d <= 2000 ? 1.5 : 0.5;
  }
  if (t.nearestBus) {
    const d = t.nearestBus.distanceM ?? 5000;
    score += d <= 300 ? 2 : d <= 800 ? 1 : 0;
  }
  return clamp(score);
}

function healthcareScore(h?: HealthcareData): number | undefined {
  if (!h?.nearestGp) return undefined;
  const d = h.nearestGp.distanceM ?? 5000;
  if (d <= 500) return 10;
  if (d <= 1000) return 8;
  if (d <= 2000) return 6;
  if (d <= 3000) return 4;
  if (d <= 5000) return 2;
  return 0;
}

function greenspaceScore(g?: GreenspaceData): number | undefined {
  if (!g?.nearestPark) return undefined;
  const d = g.nearestPark.distanceM ?? 5000;
  if (d <= 200) return 10;
  if (d <= 500) return 8;
  if (d <= 1000) return 6;
  if (d <= 2000) return 4;
  return 2;
}

function tenureFamilyScore(d?: Demographics): number | undefined {
  if (!d?.tenure) return undefined;
  // Family areas skew owner-occupied
  return clamp((d.tenure.ownerOccupiedPct ?? 0) / 10);
}

function priceAffordabilityScore(ph?: PriceHistory): number | undefined {
  if (!ph?.postcodeMedian) return undefined;
  // FTB cap historically £300k; £200k median → 10, £500k → 4, £700k → 0
  const m = ph.postcodeMedian;
  if (m <= 200_000) return 10;
  if (m <= 300_000) return 8;
  if (m <= 400_000) return 6;
  if (m <= 500_000) return 4;
  if (m <= 700_000) return 2;
  return 0;
}

function yieldScore(r?: RentalEstimate): number | undefined {
  if (!r?.grossYieldPct) return undefined;
  // 7%+ = 10, 5% = 7, 3% = 4, <2% = 0
  return clamp(r.grossYieldPct * 1.4);
}

function weightedAverage(parts: Array<{ score?: number; weight: number }>): number {
  let totalScore = 0, totalWeight = 0;
  for (const p of parts) {
    if (p.score == null) continue;
    totalScore += p.score * p.weight;
    totalWeight += p.weight;
  }
  if (totalWeight === 0) return 5; // neutral default
  return Math.round((totalScore / totalWeight) * 10) / 10;
}

export function computeLifestyleScores(s: SignalInput): LifestyleScores | undefined {
  const schoolsS = schoolsScore(s.schools);
  const crimeS = crimeScore(s.crime);
  const greenS = greenspaceScore(s.greenspace);
  const tenureS = tenureFamilyScore(s.demographics);
  const imdS = imdToScore(s.imd);
  const walkS = walkabilityScore(s.walkScore);
  const transS = publicTransportScore(s.transportNearby);
  const healthS = healthcareScore(s.healthcare);
  const floodS = floodScore(s.flood);
  const airS = airScore(s.airQuality);
  const priceS = priceAffordabilityScore(s.priceHistory);
  const yieldS = yieldScore(s.rentalEstimate);

  // No source data at all → bail
  const anySignal = [schoolsS, crimeS, greenS, imdS, walkS, transS, healthS, floodS, airS].some((x) => x != null);
  if (!anySignal) return undefined;

  const family = weightedAverage([
    { score: schoolsS, weight: 3 },
    { score: crimeS, weight: 2 },
    { score: greenS, weight: 1.5 },
    { score: tenureS, weight: 1 },
    { score: floodS, weight: 1 },
    { score: airS, weight: 1 },
  ]);

  const firstTimeBuyer = weightedAverage([
    { score: priceS, weight: 3 },
    { score: imdS, weight: 1.5 },
    { score: crimeS, weight: 1 },
    { score: walkS, weight: 1 },
    { score: transS, weight: 1 },
  ]);

  const retiree = weightedAverage([
    { score: crimeS, weight: 2 },
    { score: healthS, weight: 2 },
    { score: greenS, weight: 1.5 },
    { score: airS, weight: 1.5 },
    { score: imdS, weight: 1 },
    { score: floodS, weight: 1 },
  ]);

  const commuter = weightedAverage([
    { score: transS, weight: 3 },
    { score: walkS, weight: 1.5 },
    { score: crimeS, weight: 1 },
    { score: imdS, weight: 1 },
  ]);

  const investor = weightedAverage([
    { score: yieldS, weight: 3 },
    { score: priceS, weight: 1.5 },
    { score: transS, weight: 1.5 },
    { score: crimeS, weight: 1 },
    { score: imdS, weight: 1 },
  ]);

  const scores: Array<["family" | "firstTimeBuyer" | "retiree" | "commuter" | "investor", number]> = [
    ["family", family], ["firstTimeBuyer", firstTimeBuyer], ["retiree", retiree],
    ["commuter", commuter], ["investor", investor],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  const top = scores[0];

  const topReason: Record<typeof scores[0][0], string> = {
    family: "Schools, low crime, greenspace, and owner-occupied neighbours score well here.",
    firstTimeBuyer: "Property prices are accessible and the area scores well on deprivation and walkability.",
    retiree: "Quiet, well-served by healthcare, with greenspace and clean air nearby.",
    commuter: "Strong public-transport access and walkability, easy to get into central London / regional hubs.",
    investor: "Rental yield, prices, and transport access combine well for buy-to-let economics.",
  };

  return {
    family, firstTimeBuyer, retiree, commuter, investor,
    topPick: top[1] >= 6 ? top[0] : undefined,
    topPickReason: top[1] >= 6 ? topReason[top[0]] : undefined,
  };
}

/**
 * Area trend: combines crime YoY trend (police.uk), price trend (HPI), and IMD direction.
 * Returns improving/declining/stable.
 */
export function computeAreaTrend(s: SignalInput): AreaTrend | undefined {
  const drivers: string[] = [];
  let directionScore = 50; // neutral

  // 1. Crime YoY
  if (s.crime?.trendPct != null) {
    const t = s.crime.trendPct;
    if (t <= -5) { directionScore += 15; drivers.push(`Crime down ${Math.abs(t).toFixed(1)}% year on year`); }
    else if (t >= 10) { directionScore -= 15; drivers.push(`Crime up ${t.toFixed(1)}% year on year`); }
    else if (t >= 5) { directionScore -= 8; drivers.push(`Crime up ${t.toFixed(1)}% year on year`); }
  }

  // 2. IMD: high decile = improving area
  if (s.imd?.decile != null) {
    if (s.imd.decile >= 8) { directionScore += 10; drivers.push(`Low deprivation (decile ${s.imd.decile}/10)`); }
    else if (s.imd.decile <= 3) { directionScore -= 10; drivers.push(`High deprivation (decile ${s.imd.decile}/10)`); }
  }

  // 3. Planning pipeline, building permitted means investment incoming
  const pipeline = s.planning?.pipeline ?? [];
  const totalUnits = pipeline.reduce((acc, p) => acc + (p.units ?? 0), 0);
  if (totalUnits >= 100) { directionScore += 10; drivers.push(`${totalUnits} new homes permitted within 1 km, area regenerating`); }
  else if (totalUnits >= 30) { directionScore += 5; drivers.push(`${totalUnits} new homes permitted nearby, gradual change`); }

  // 4. Price history: recent sales price growth above 5%/yr is positive signal
  const sales = s.priceHistory?.sales ?? [];
  if (sales.length >= 2) {
    const sorted = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0], last = sorted[sorted.length - 1];
    const yrs = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365.25 * 86400 * 1000);
    if (yrs > 1) {
      const annualGrowth = (Math.pow(last.price / first.price, 1 / yrs) - 1) * 100;
      if (annualGrowth >= 6) { directionScore += 8; drivers.push(`Property prices growing ${annualGrowth.toFixed(1)}% / yr (above UK average)`); }
      else if (annualGrowth <= 0) { directionScore -= 5; drivers.push(`Property prices flat or falling (${annualGrowth.toFixed(1)}% / yr)`); }
    }
  }

  if (drivers.length === 0) return undefined;
  const score = Math.max(0, Math.min(100, directionScore));
  const direction = score >= 60 ? "improving" : score <= 40 ? "declining" : "stable";
  return { direction, score, drivers: drivers.slice(0, 4) };
}

/**
 * Composite risk score: 0-100 (higher = more risk). Aggregates flood + ground + air + listed +
 * planning saturation + listed building. Useful as a single risk gauge.
 */
export function computeCompositeRisk(s: SignalInput): CompositeRiskScore | undefined {
  const contributors: Array<{ label: string; weight: number; note?: string }> = [];
  let total = 0;

  if (s.flood?.inFloodZone3) {
    contributors.push({ label: "Flood Zone 3", weight: 25, note: "1 in 100 (rivers) or 1 in 200 (sea) annual probability" });
    total += 25;
  } else if (s.flood?.inFloodZone2) {
    contributors.push({ label: "Flood Zone 2", weight: 12, note: "1 in 1,000 annual probability" });
    total += 12;
  }

  if (s.groundRisk?.shrinkSwell === "very-high") {
    contributors.push({ label: "Very high shrink-swell", weight: 20, note: "Subsidence risk, survey + insurance scrutiny" });
    total += 20;
  } else if (s.groundRisk?.shrinkSwell === "high") {
    contributors.push({ label: "High shrink-swell", weight: 12 });
    total += 12;
  } else if (s.groundRisk?.shrinkSwell === "significant") {
    contributors.push({ label: "Significant shrink-swell", weight: 6 });
    total += 6;
  }

  if (s.airQuality?.daqiBand != null && s.airQuality.daqiBand >= 7) {
    contributors.push({ label: `Air quality DAQI ${s.airQuality.daqiBand}/10`, weight: 8 });
    total += 8;
  } else if (s.airQuality?.daqiBand != null && s.airQuality.daqiBand >= 4) {
    contributors.push({ label: `Air quality DAQI ${s.airQuality.daqiBand}/10`, weight: 3 });
    total += 3;
  }

  if (s.crime && s.crime.totalIncidents > 2500) {
    contributors.push({ label: "Above-average crime", weight: 10, note: `${s.crime.totalIncidents.toLocaleString()} incidents in 12 mo within 1 mile` });
    total += 10;
  } else if (s.crime && s.crime.totalIncidents > 1500) {
    contributors.push({ label: "Elevated crime", weight: 5 });
    total += 5;
  }

  if (s.listedBuilding?.listed) {
    contributors.push({ label: `Listed building${s.listedBuilding.grade ? ` (Grade ${s.listedBuilding.grade})` : ""}`, weight: 10, note: "Restricted alterations + higher insurance" });
    total += 10;
  }

  if ((s.planning?.totalApps12m ?? 0) >= 25) {
    contributors.push({ label: `${s.planning?.totalApps12m} planning apps in 12 mo`, weight: 5, note: "High area-churn risk" });
    total += 5;
  }

  if (contributors.length === 0) return { score: 5, band: "very-low", contributors: [] };
  const score = Math.min(100, total);
  const band: CompositeRiskScore["band"] =
    score >= 60 ? "very-high"
    : score >= 40 ? "high"
    : score >= 20 ? "moderate"
    : score >= 10 ? "low"
    : "very-low";

  return { score, band, contributors };
}
