/**
 * AI-generated "questions to ask the seller" for the paid premium report.
 *
 * Given the full property data (free report + title register pull + paid flags),
 * we condense the most material findings into a brief and ask Claude Sonnet
 * to draft 8-12 sharp, specific, lawyer-style questions a first-time buyer
 * should raise with the seller, their estate agent, or their conveyancing
 * solicitor.
 *
 * Cost: ~£0.01 per report (1.5k tokens at Sonnet 4.6 list price). Runs once
 * per paid purchase, so we don't bother caching across requests.
 *
 * Failure mode: if the API key is missing, the request times out, the model
 * returns malformed JSON, or anything else goes wrong, we return undefined
 * and the caller falls back to the static heuristic checklist.
 */
import type { PaidReport } from "../types";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const TIMEOUT_MS = 60_000;

export interface SellerQuestion {
  /** One-line question. Direct, sharp, no fluff. */
  question: string;
  /** Why we asked this — references the data point that triggered it. */
  rationale: string;
  /** Where to put the question: "seller" | "solicitor" | "estate-agent" */
  audience: "seller" | "solicitor" | "estate-agent";
  /** Priority: red flags first */
  priority: "high" | "medium" | "low";
}

const PRIORITY_ORDER: Record<SellerQuestion["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const VALID_AUDIENCES: ReadonlySet<string> = new Set([
  "seller",
  "solicitor",
  "estate-agent",
]);
const VALID_PRIORITIES: ReadonlySet<string> = new Set([
  "high",
  "medium",
  "low",
]);

const SYSTEM_PROMPT = `You are a senior UK residential conveyancer briefing a first-time buyer.
Your job is to read a structured summary of a property's public-record flags
and draft the questions the buyer should put to the seller, the estate agent,
or their own solicitor before exchanging contracts.

Rules for every question you produce:
- Be SPECIFIC. Quote the number, date, name, or value from the data. Generic
  conveyancing checklist items ("is there gas central heating?", "any disputes
  with neighbours?") are forbidden.
- Be SHARP. One sentence. No hedging. No "you might want to consider".
- Be ACTIONABLE. The seller / agent / solicitor must be able to answer with a
  document, a date, or a yes/no.
- Pick the right AUDIENCE:
  * "seller" — facts only the owner knows (flooding history, neighbour disputes,
    works carried out, why they sold cheap).
  * "estate-agent" — marketing claims and chain status.
  * "solicitor" — anything that needs a legal document (charges register,
    EWS1, lease accounts, restrictive covenants, planning permissions).
- Set PRIORITY honestly:
  * "high" — would change the offer price or kill the deal (undischarged charge,
    short lease, flood zone 3, EWS1 missing on a tall flat block, mining,
    suspicious ownership flips).
  * "medium" — material but not deal-breaking (medium flood risk, listed
    status, conservation area, EPC F/G, planning apps near).
  * "low" — worth confirming for completeness.

Output STRICT JSON ONLY in this exact shape, no commentary:
{
  "questions": [
    {
      "question": "...",
      "rationale": "...",
      "audience": "seller" | "solicitor" | "estate-agent",
      "priority": "high" | "medium" | "low"
    }
  ]
}
Produce 8 to 12 questions. High-priority items first.`;

export async function generateSellerQuestions(
  report: PaidReport
): Promise<SellerQuestion[] | undefined> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.warn("ANTHROPIC_API_KEY not set; AI seller questions unavailable");
    return undefined;
  }

  try {
    const userPrompt = buildUserPrompt(report);

    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        "Anthropic seller-questions failed",
        res.status,
        await safeText(res)
      );
      return undefined;
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const block = data?.content?.find((b) => b.type === "text");
    const content = block?.text;
    if (!content || typeof content !== "string") return undefined;

    // Claude sometimes wraps JSON in prose or ```json fences. Extract the
    // first balanced { … } object.
    const jsonText = extractJson(content);
    if (!jsonText) return undefined;

    const parsed = safeParse(jsonText);
    if (!parsed) return undefined;

    const raw = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions = raw
      .map((q) => normalise(q))
      .filter((q): q is SellerQuestion => q !== undefined);

    if (questions.length === 0) return undefined;

    questions.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

    return questions;
  } catch (err) {
    console.error("generateSellerQuestions failed", err);
    return undefined;
  }
}

function extractJson(s: string): string | undefined {
  // Strip ```json fences if present
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : s;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return undefined;
  return candidate.slice(start, end + 1).trim();
}

function buildUserPrompt(report: PaidReport): string {
  const lines: string[] = [];
  const free = report.free;
  const property = free.property;
  const title = report.title;
  const flags = report.flags;

  lines.push("PROPERTY");
  lines.push(`- Address: ${property.fullAddress}`);
  if (property.adminDistrictName) lines.push(`- Local authority: ${property.adminDistrictName}`);
  if (property.region) lines.push(`- Region: ${property.region}`);
  if (free.epc?.propertyType) {
    const built = free.epc.builtForm ? `, ${free.epc.builtForm}` : "";
    lines.push(`- Type: ${free.epc.propertyType}${built}`);
  }
  if (free.epc?.buildYear) lines.push(`- Build year: ${free.epc.buildYear}`);
  if (free.epc?.totalFloorArea) lines.push(`- Floor area: ${free.epc.totalFloorArea} m²`);
  if (free.epc?.habitableRooms) lines.push(`- Habitable rooms: ${free.epc.habitableRooms}`);

  // Sales history: look for unusual jumps, recent flips, mismatched pricing.
  if (free.priceHistory?.sales?.length) {
    lines.push("");
    lines.push("SALES HISTORY (this exact property)");
    for (const s of free.priceHistory.sales) {
      const tenure = s.tenure === "L" ? "leasehold" : s.tenure === "F" ? "freehold" : "";
      lines.push(`- ${s.date}: £${s.price.toLocaleString()}${tenure ? ` (${tenure})` : ""}`);
    }
    const sorted = [...free.priceHistory.sales].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    if (sorted.length >= 2) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first && last) {
        const yrs =
          (new Date(last.date).getTime() - new Date(first.date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);
        if (yrs > 0) {
          const totalChange = ((last.price - first.price) / first.price) * 100;
          lines.push(
            `- Net change: ${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(1)}% over ${yrs.toFixed(1)} years`
          );
        }
      }
      // Flag any single-step jumps over 50% in <4 years.
      for (let i = 1; i < sorted.length; i++) {
        const a = sorted[i - 1];
        const b = sorted[i];
        if (!a || !b) continue;
        const span =
          (new Date(b.date).getTime() - new Date(a.date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);
        if (span <= 0) continue;
        const pct = ((b.price - a.price) / a.price) * 100;
        if (Math.abs(pct) >= 50 && span < 4) {
          lines.push(
            `- ANOMALY: ${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% (${a.date} £${a.price.toLocaleString()} -> ${b.date} £${b.price.toLocaleString()}) in ${span.toFixed(1)} yrs`
          );
        }
      }
    }
    if (free.priceHistory.postcodeMedian) {
      lines.push(`- Postcode median sale: £${free.priceHistory.postcodeMedian.toLocaleString()}`);
    }
  }

  // Title register — most material conveyancing data.
  if (title) {
    lines.push("");
    lines.push("HM LAND REGISTRY TITLE");
    if (title.titleNumber) lines.push(`- Title number: ${title.titleNumber}`);
    if (title.tenure) lines.push(`- Tenure: ${title.tenure}`);
    if (title.registeredOwners?.length) {
      lines.push(`- Registered owners: ${title.registeredOwners.join("; ")}`);
      const corporate = title.registeredOwners.filter((o) =>
        /\b(ltd|limited|llp|plc|inc|gmbh|trust|holdings)\b/i.test(o)
      );
      if (corporate.length > 0) {
        lines.push(`- COMPANY-OWNED: ${corporate.join("; ")}`);
      }
    }
    if (title.registeredOn) lines.push(`- Date of last registration: ${title.registeredOn}`);
    if (title.pricePaid) {
      lines.push(`- Price paid on register: £${title.pricePaid.amount.toLocaleString()} on ${title.pricePaid.date}`);
    }
    if (typeof title.charges === "number") {
      lines.push(`- Charges on register: ${title.charges}${title.charges > 0 ? " (CHECK each is discharged)" : ""}`);
    }
    if (typeof title.restrictions === "number" && title.restrictions > 0) {
      lines.push(`- Restrictions: ${title.restrictions}`);
    }
    if (typeof title.cautions === "number" && title.cautions > 0) {
      lines.push(`- Cautions: ${title.cautions}`);
    }
    if (title.hasRestrictiveCovenants) {
      lines.push(`- Restrictive covenants: YES`);
    }
    if (title.tenure === "leasehold") {
      if (title.leaseTermYears) lines.push(`- Lease original term: ${title.leaseTermYears} years`);
      if (title.leaseStartDate) lines.push(`- Lease start: ${title.leaseStartDate}`);
      if (typeof title.leaseRemainingYears === "number") {
        const note =
          title.leaseRemainingYears < 80
            ? " (UNDER 80 — marriage value applies, mortgage problems)"
            : title.leaseRemainingYears < 125
              ? " (short-ish, factor in extension cost)"
              : "";
        lines.push(`- Lease remaining: ${title.leaseRemainingYears} years${note}`);
      }
    }
  }

  // Risk flags — flood, crime, planning, ground, listed, conservation, mining, radon.
  const risks: string[] = [];
  if (free.flood) {
    risks.push(`Flood risk: ${free.flood.riskLevel}${free.flood.inFloodZone3 ? ", IN FLOOD ZONE 3" : free.flood.inFloodZone2 ? ", in flood zone 2" : ""}`);
    if (free.flood.nearbyWarnings.length) {
      risks.push(`Active flood warnings nearby: ${free.flood.nearbyWarnings.length}`);
    }
  }
  if (free.crime) {
    const months = free.crime.monthsCovered || 12;
    risks.push(`Crime: ${free.crime.totalIncidents} incidents in ${months} months within ~1 mile`);
    if (free.crime.nationalAverage) {
      const ratio = free.crime.totalIncidents / free.crime.nationalAverage;
      if (ratio > 1.3) risks.push(`Crime ${(ratio * 100 - 100).toFixed(0)}% ABOVE national average`);
    }
  }
  if (free.planning) {
    if (free.planning.totalApps12m > 0) {
      risks.push(`${free.planning.totalApps12m} planning applications within 500m in last 12 months (${free.planning.pendingApps} pending)`);
    }
    if (free.planning.inConservationArea) risks.push(`Conservation area: YES`);
    if (free.planning.hasArticle4) risks.push(`Article 4 direction: YES`);
    if (free.planning.hasTPO) risks.push(`Tree preservation order: YES`);
    if (free.planning.nearListedBuildings > 0) {
      risks.push(`${free.planning.nearListedBuildings} listed buildings nearby`);
    }
  }
  if (free.groundRisk?.shrinkSwell && free.groundRisk.shrinkSwell !== "unknown" && free.groundRisk.shrinkSwell !== "very-low" && free.groundRisk.shrinkSwell !== "low") {
    risks.push(`Ground shrink-swell risk: ${free.groundRisk.shrinkSwell}`);
  }
  if (free.listedBuilding?.listed) {
    risks.push(`Listed building: grade ${free.listedBuilding.grade ?? "?"}${free.listedBuilding.name ? ` (${free.listedBuilding.name})` : ""}`);
  }
  if (flags.miningArea) risks.push(`Recorded non-coal mining activity nearby`);
  if (flags.coalReportingArea) risks.push(`In a coal mining reporting area — CON29M (£32.40) recommended`);
  if (typeof flags.radonRiskBand === "number" && flags.radonRiskBand >= 4) {
    risks.push(`Radon band ${flags.radonRiskBand}/6 (HIGH — radon test/sump may be needed)`);
  }
  if (typeof flags.shrinkSwellBand === "number" && flags.shrinkSwellBand >= 3) {
    risks.push(`Shrink-swell clay band ${flags.shrinkSwellBand}/5 (${flags.shrinkSwellLabel ?? "significant"}) — subsidence risk`);
  }
  if (typeof flags.landslideBand === "number" && flags.landslideBand >= 3) {
    risks.push(`Landslide hazard band ${flags.landslideBand}/5 — investigate ground stability`);
  }
  if (flags.aonb?.inArea) risks.push(`Area of Outstanding Natural Beauty${flags.aonb.name ? ` (${flags.aonb.name})` : ""}`);
  if (flags.greenBelt) risks.push(`Green belt`);
  if (flags.conservationArea?.inArea) {
    risks.push(`Conservation area${flags.conservationArea.name ? `: ${flags.conservationArea.name}` : ""}`);
  }
  if (flags.article4?.affected) risks.push(`Article 4 direction — permitted development rights restricted`);
  if (flags.scheduledMonument?.affected) risks.push(`Scheduled monument flag${flags.scheduledMonument.name ? ` (${flags.scheduledMonument.name})` : ""}`);
  if (flags.worldHeritageSite?.inArea) risks.push(`World Heritage Site buffer/core zone`);
  if (risks.length) {
    lines.push("");
    lines.push("RISK FLAGS");
    for (const r of risks) lines.push(`- ${r}`);
  }

  // EPC oddities.
  if (free.epc) {
    const epcNotes: string[] = [];
    if (free.epc.rating === "F" || free.epc.rating === "G") {
      epcNotes.push(`EPC ${free.epc.rating} — below rental minimum, retrofit needed`);
    }
    if (free.epc.totalFloorArea && free.epc.totalFloorArea < 35) {
      epcNotes.push(`Very small floor area (${free.epc.totalFloorArea} m²) — mortgage lenders may refuse below 30 m²`);
    }
    if (free.epc.inspectionDate) {
      const yrs =
        (Date.now() - new Date(free.epc.inspectionDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);
      if (yrs > 9) epcNotes.push(`EPC inspected ${yrs.toFixed(0)} years ago — likely expired (10-yr validity)`);
    }
    if (epcNotes.length) {
      lines.push("");
      lines.push("EPC ODDITIES");
      for (const e of epcNotes) lines.push(`- ${e}`);
    }
  }

  // Demographics anomalies — useful for flat blocks.
  if (free.demographics?.tenure) {
    const t = free.demographics.tenure;
    const demoNotes: string[] = [];
    if (typeof t.socialRentPct === "number" && t.socialRentPct >= 60) {
      demoNotes.push(`Social rent ${t.socialRentPct}% of LSOA — predominantly social-housing area`);
    }
    if (typeof t.privateRentPct === "number" && t.privateRentPct >= 60) {
      demoNotes.push(`Private rent ${t.privateRentPct}% of LSOA — predominantly let area, owner-occupier resale may be slow`);
    }
    if (demoNotes.length) {
      lines.push("");
      lines.push("DEMOGRAPHIC ANOMALIES");
      for (const d of demoNotes) lines.push(`- ${d}`);
    }
  }

  // High-rise / EWS1 trigger: if it's a flat AND build year suggests modern AND there are multiple flats in postcode.
  const isFlat =
    free.epc?.propertyType?.toLowerCase().includes("flat") ||
    free.epc?.propertyType?.toLowerCase().includes("maisonette");
  if (isFlat) {
    lines.push("");
    lines.push("BUILDING TYPE NOTES");
    lines.push(`- Flat / maisonette — consider EWS1, cladding, service charge, ground rent escalation, building insurance, reserve fund`);
    if (free.epc?.buildYear && free.epc.buildYear >= 2000) {
      lines.push(`- Built ${free.epc.buildYear} — post-2000 blocks frequently caught by cladding remediation`);
    }
  }

  lines.push("");
  lines.push("Now produce the JSON object as instructed.");
  return lines.join("\n");
}

function safeParse(content: string): { questions?: unknown } | undefined {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed as { questions?: unknown };
    return undefined;
  } catch {
    return undefined;
  }
}

function normalise(raw: unknown): SellerQuestion | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const question = typeof r.question === "string" ? r.question.trim() : "";
  const rationale = typeof r.rationale === "string" ? r.rationale.trim() : "";
  const audience = typeof r.audience === "string" ? r.audience.trim().toLowerCase() : "";
  const priority = typeof r.priority === "string" ? r.priority.trim().toLowerCase() : "";
  if (!question || !rationale) return undefined;
  if (!VALID_AUDIENCES.has(audience)) return undefined;
  if (!VALID_PRIORITIES.has(priority)) return undefined;
  return {
    question,
    rationale,
    audience: audience as SellerQuestion["audience"],
    priority: priority as SellerQuestion["priority"],
  };
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<unreadable body>";
  }
}
