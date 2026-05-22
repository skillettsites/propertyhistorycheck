/**
 * AI-generated pre-exchange briefs for the £6.99 Premium+ tier.
 *
 * Three audiences, three system prompts, one shared parser:
 *   - Solicitor brief: TA6-style follow-up enquiries for the conveyancer
 *   - Surveyor brief: what to ask the RICS L3 surveyor about this property
 *   - Mortgage broker brief: lending-friction flags, NO lender-specific claims
 *
 * Each is grounded on the actual PaidReport data (free + paid flags + tribunal
 * + ownership + BSR + Companies House). The model formats, doesn't invent.
 *
 * Cost: ~£0.05 per brief, ~£0.15 total for three. Failure mode: any one brief
 * that errors returns undefined and the orchestrator continues, the report
 * still ships without that section. Loud server-side log, no swallowed errors.
 */
import type { PaidReport, PreExchangeBrief, BriefItem } from "../types";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const TIMEOUT_MS = 60_000;

const VALID_PRIORITIES: ReadonlySet<string> = new Set(["critical", "high", "medium", "low"]);
const PRIORITY_ORDER: Record<BriefItem["priority"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ---------------------------------------------------------------------------
// System prompts, one per audience.
// ---------------------------------------------------------------------------

const SOLICITOR_PROMPT = `You are a senior UK residential conveyancer drafting a one-page brief for
the buyer to forward to their own conveyancing solicitor BEFORE exchange.

You are given a structured summary of public-record flags on a UK property.
You must format these as concrete, actionable follow-up enquiries the
conveyancer should add to the file. You DO NOT invent flags. If a fact isn't
in the data, don't reference it.

Rules:
- Be SPECIFIC. Quote the number, date, name, ownership entity, tribunal case
  reference, BSR registration etc. from the data verbatim.
- Frame each item as something the conveyancer can act on with a documented
  request (TA6 form question, charges register check, restriction enquiry).
- Set PRIORITY honestly:
  * critical = would invalidate the offer or block exchange (active charges,
    overseas owner without Register of Overseas Entities compliance, BSR HRB
    building with no EWS1)
  * high = needs explicit answer before exchange (tribunal cases, multiple
    charges, contested boundary)
  * medium = standard pre-exchange enquiry that should be on the file
  * low = worth confirming for completeness
- "summary" must be one sentence, suitable as an email subject like
  "Pre-exchange enquiries for [address], 3 critical items"
- "caveat" must remind the buyer this is not legal advice, the conveyancer
  is the authority on title and conveyancing, and any of these items may
  already be covered by the conveyancer's standard searches.

Output STRICT JSON ONLY:
{
  "summary": "...",
  "items": [
    { "heading": "...", "finding": "...", "ask": "...", "priority": "critical" | "high" | "medium" | "low" }
  ],
  "caveat": "..."
}

Produce between 3 and 8 items, ranked critical → low. If the data is clean,
produce 2-3 medium/low items and a summary stating "no critical findings".`;

const SURVEYOR_PROMPT = `You are a senior RICS surveyor briefing a buyer on what to flag to the
surveyor they instruct (Level 2 HomeBuyer or Level 3 Building Survey).

You are given a structured summary of public-record flags on a UK property.
Translate the physical-data flags (ground risk, radon, listed building grade,
EPC walls/roof/floor description, build year, property type) into specific
things the surveyor should examine and comment on.

Rules:
- Be SPECIFIC. "Shrink-swell hazard band 4/5" not "ground risk".
- Each item should be something a surveyor can physically inspect or comment
  on (cracks, settlement, alignment, materials, alterations, condition).
- Audience knows ZERO surveying jargon, explain why each matters in plain
  English (e.g. "ask whether the cavity wall ties show corrosion").
- Set PRIORITY honestly:
  * critical = signs of structural risk that warrant Level 3 specifically
    (high shrink-swell + listed + clay subsidence + flood)
  * high = the typical L2 should still address these but flag explicitly
  * medium = standard L2 coverage; just make sure it's in the report
  * low = nice to confirm
- "summary" must be one sentence, recommends L2 vs L3 vs specialist survey
  depending on findings.
- "caveat" must note the surveyor's report is the authoritative document.

Output STRICT JSON ONLY:
{
  "summary": "...",
  "items": [
    { "heading": "...", "finding": "...", "ask": "...", "priority": "critical" | "high" | "medium" | "low" }
  ],
  "caveat": "..."
}

Produce 3-8 items. If no physical risk flags, produce 2-3 medium/low items.`;

const MORTGAGE_PROMPT = `You are an independent UK mortgage broker drafting a brief on this property
for the buyer to discuss with their broker BEFORE applying.

You are given a structured summary of public-record flags. Identify the items
that typically generate lender friction in 2026: listed buildings, EWS1 /
BSR Higher-Risk Building register, flood band high or Flood Zone 3, lease
remaining under 80 years (only if shown, DO NOT assume), non-standard
construction from EPC walls description, large balcony / studio under 30m²,
ex-local-authority signals from CCOD if council-owned, high crime areas in
some lender appetite criteria.

CRITICAL, DO NOT make lender-specific claims. NEVER say "X bank will lend"
or "Y won't lend". Lender policies change weekly and your training data is
months stale. Instead frame as "the type of issue that may trigger lender-
specific underwriting" or "common lender requirements include...". The brief
must repeatedly remind the buyer to verify with a qualified broker.

Rules:
- Be SPECIFIC about which finding triggers concern.
- For each item, describe the TYPE of friction without naming lenders.
- Set PRIORITY honestly:
  * critical = high-rise on BSR HRB with no EWS1, almost no lender lends
    without EWS1 A or B1 in 2026.
  * high = flood band high + listed + non-standard construction, needs
    broker discussion before application.
  * medium = standard underwriting questions.
  * low = unlikely to affect outcome.
- "summary" must be one sentence framing the overall lendability picture.
- "caveat" MUST emphasise this is not financial advice; verify every claim
  with a qualified mortgage broker before applying.

Output STRICT JSON ONLY:
{
  "summary": "...",
  "items": [
    { "heading": "...", "finding": "...", "ask": "...", "priority": "critical" | "high" | "medium" | "low" }
  ],
  "caveat": "..."
}

Produce 3-8 items. If clean, produce 2-3 low items and an "appears mortgageable
on standard criteria" summary with the usual broker-verification caveat.`;

// ---------------------------------------------------------------------------
// Public API, three audiences, three exported functions.
// ---------------------------------------------------------------------------

export function generateSolicitorBrief(report: PaidReport): Promise<PreExchangeBrief | undefined> {
  return runBrief("solicitor", SOLICITOR_PROMPT, report);
}

export function generateSurveyorBrief(report: PaidReport): Promise<PreExchangeBrief | undefined> {
  return runBrief("surveyor", SURVEYOR_PROMPT, report);
}

export function generateMortgageBrief(report: PaidReport): Promise<PreExchangeBrief | undefined> {
  return runBrief("mortgage_broker", MORTGAGE_PROMPT, report);
}

// ---------------------------------------------------------------------------
// Internals.
// ---------------------------------------------------------------------------

async function runBrief(
  audience: PreExchangeBrief["audience"],
  systemPrompt: string,
  report: PaidReport,
): Promise<PreExchangeBrief | undefined> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.warn(`ANTHROPIC_API_KEY not set; ${audience} brief unavailable`);
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
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`Anthropic ${audience} brief failed`, res.status, await safeText(res));
      return undefined;
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const block = data?.content?.find((b) => b.type === "text");
    const content = block?.text;
    if (!content) return undefined;

    const jsonText = extractJson(content);
    if (!jsonText) return undefined;

    const parsed = safeParse(jsonText);
    if (!parsed) return undefined;

    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const caveat = typeof parsed.caveat === "string" ? parsed.caveat.trim() : "";
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const items = rawItems
      .map((i) => normaliseItem(i))
      .filter((i): i is BriefItem => i !== undefined);

    if (!summary || !caveat || items.length === 0) return undefined;

    items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    return { audience, summary, items, caveat };
  } catch (err) {
    console.error(`${audience} brief threw`, err);
    return undefined;
  }
}

function buildUserPrompt(report: PaidReport): string {
  const lines: string[] = [];
  const free = report.free;
  const property = free.property;
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

  // Sales history
  if (free.priceHistory?.sales?.length) {
    lines.push("");
    lines.push("SALES HISTORY");
    for (const s of free.priceHistory.sales) {
      const tenure = s.tenure === "L" ? "leasehold" : s.tenure === "F" ? "freehold" : "";
      lines.push(`- ${s.date}: £${s.price.toLocaleString()}${tenure ? ` (${tenure})` : ""}`);
    }
  }

  // Ownership
  if (report.ownership) {
    lines.push("");
    lines.push("OWNERSHIP (HMLR CCOD/OCOD)");
    if (report.ownership.overseasOwned) {
      lines.push(`- Overseas company registered in ${report.ownership.countryIncorporated ?? "unknown country"}`);
    } else if (report.ownership.ukCompanyOwned) {
      lines.push(`- UK company`);
    }
    if (report.ownership.proprietors?.length) {
      lines.push(`- Proprietor(s): ${report.ownership.proprietors.join("; ")}`);
    }
  }

  // Companies House
  if (report.companyOwner) {
    lines.push("");
    lines.push("COMPANIES HOUSE (proprietor)");
    lines.push(`- Status: ${report.companyOwner.status ?? "?"}`);
    if (report.companyOwner.companyNumber) lines.push(`- Company number: ${report.companyOwner.companyNumber}`);
    if (typeof report.companyOwner.outstandingCharges === "number") {
      lines.push(`- Outstanding charges: ${report.companyOwner.outstandingCharges}`);
    }
    if (report.companyOwner.outstandingChargesDetail?.length) {
      for (const c of report.companyOwner.outstandingChargesDetail.slice(0, 5)) {
        lines.push(`  · ${c.classification ?? "charge"} in favour of ${c.lenderName ?? "?"} (${c.createdOn ?? "date unknown"})`);
      }
    }
    if (report.companyOwner.insolvencyCases?.length) {
      lines.push(`- Insolvency cases: ${report.companyOwner.insolvencyCases.length}`);
      for (const c of report.companyOwner.insolvencyCases.slice(0, 3)) {
        lines.push(`  · ${c.type} (${c.dates?.[0]?.date ?? "date unknown"})`);
      }
    }
  }

  if (report.disqualifiedDirectors?.length) {
    lines.push("");
    lines.push("DISQUALIFIED DIRECTORS (matched on proprietor name)");
    for (const d of report.disqualifiedDirectors.slice(0, 5)) {
      lines.push(`- ${d.name}, ${d.caseReason ?? "?"} until ${d.disqualifiedUntil ?? "?"}`);
    }
  }

  // BSR HRB
  if (report.bsrHrb?.registered) {
    lines.push("");
    lines.push("BSR HIGHER-RISK BUILDING (high-rise residential)");
    lines.push(`- On register: YES`);
    if (report.bsrHrb.heightMetres) lines.push(`- Height: ${report.bsrHrb.heightMetres}m`);
    if (report.bsrHrb.numberOfFloors) lines.push(`- Floors: ${report.bsrHrb.numberOfFloors}`);
    if (report.bsrHrb.residentialUnits) lines.push(`- Residential units: ${report.bsrHrb.residentialUnits}`);
    if (report.bsrHrb.principalAccountablePerson) lines.push(`- PAP: ${report.bsrHrb.principalAccountablePerson}`);
  }

  // Tribunal history
  if (report.tribunalHistory && report.tribunalHistory.count > 0) {
    lines.push("");
    lines.push("PROPERTY CHAMBER TRIBUNAL HISTORY");
    lines.push(`- Cases at building/postcode: ${report.tribunalHistory.count}`);
    if (report.tribunalHistory.topCategory) lines.push(`- Most common: ${report.tribunalHistory.topCategory}`);
    if (report.tribunalHistory.recent?.length) {
      for (const r of report.tribunalHistory.recent.slice(0, 3)) {
        lines.push(`  · ${r.caseReference ?? r.slug} (${r.decisionDate ?? "?"}): ${r.category ?? ""}`);
      }
    }
  }

  // Risk flags
  const risks: string[] = [];
  if (free.flood) {
    risks.push(`Flood risk: ${free.flood.riskLevel}${free.flood.inFloodZone3 ? ", IN FLOOD ZONE 3" : free.flood.inFloodZone2 ? ", in flood zone 2" : ""}`);
  }
  if (flags.coalReportingArea) risks.push("Coal Authority reporting area");
  if (flags.miningArea) risks.push("Non-coal mining activity nearby");
  if (typeof flags.radonRiskBand === "number" && flags.radonRiskBand >= 3) {
    risks.push(`Radon band ${flags.radonRiskBand}/6`);
  }
  if (typeof flags.shrinkSwellBand === "number" && flags.shrinkSwellBand >= 3) {
    risks.push(`Shrink-swell clay band ${flags.shrinkSwellBand}/5 (${flags.shrinkSwellLabel ?? "significant"})`);
  }
  if (typeof flags.landslideBand === "number" && flags.landslideBand >= 3) {
    risks.push(`Landslide hazard band ${flags.landslideBand}/5`);
  }
  if (flags.listedBuilding?.listed) {
    risks.push(`Listed building grade ${flags.listedBuilding.grade ?? "?"}${flags.listedBuilding.name ? ` (${flags.listedBuilding.name})` : ""}`);
  }
  if (flags.conservationArea?.inArea) {
    risks.push(`Conservation area${flags.conservationArea.name ? `: ${flags.conservationArea.name}` : ""}`);
  }
  if (flags.article4?.affected) risks.push("Article 4 direction (permitted development rights restricted)");
  if (flags.aonb?.inArea) risks.push(`AONB${flags.aonb.name ? ` (${flags.aonb.name})` : ""}`);
  if (flags.greenBelt) risks.push("Green belt");
  if (flags.scheduledMonument?.affected) risks.push(`Scheduled monument${flags.scheduledMonument.name ? ` (${flags.scheduledMonument.name})` : ""}`);
  if (flags.worldHeritageSite?.inArea) risks.push("World Heritage Site");
  if (flags.brownfieldLand) risks.push("Brownfield land");
  if (free.crime) {
    const months = free.crime.monthsCovered || 12;
    risks.push(`Crime: ${free.crime.totalIncidents} incidents in ${months} months within ~1 mile`);
  }
  if (risks.length) {
    lines.push("");
    lines.push("RISK FLAGS");
    for (const r of risks) lines.push(`- ${r}`);
  }

  // EPC details, relevant for surveyor + mortgage briefs
  if (free.epc) {
    lines.push("");
    lines.push("EPC DATA");
    if (free.epc.rating) lines.push(`- Current rating: ${free.epc.rating}`);
    if (free.epc.potentialRating) lines.push(`- Potential rating: ${free.epc.potentialRating}`);
    if (free.epc.mainHeating) lines.push(`- Heating: ${free.epc.mainHeating}`);
    if (free.epc.inspectionDate) lines.push(`- Inspected: ${free.epc.inspectionDate}`);
  }

  lines.push("");
  lines.push("Now produce the JSON object as instructed.");
  return lines.join("\n");
}

function normaliseItem(raw: unknown): BriefItem | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const heading = typeof r.heading === "string" ? r.heading.trim() : "";
  const finding = typeof r.finding === "string" ? r.finding.trim() : "";
  const ask = typeof r.ask === "string" ? r.ask.trim() : "";
  const priority = typeof r.priority === "string" ? r.priority.trim().toLowerCase() : "";
  if (!heading || !finding || !ask) return undefined;
  if (!VALID_PRIORITIES.has(priority)) return undefined;
  return { heading, finding, ask, priority: priority as BriefItem["priority"] };
}

function extractJson(s: string): string | undefined {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : s;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return undefined;
  return candidate.slice(start, end + 1).trim();
}

function safeParse(content: string): { summary?: unknown; items?: unknown; caveat?: unknown } | undefined {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed as { summary?: unknown; items?: unknown; caveat?: unknown };
    return undefined;
  } catch {
    return undefined;
  }
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return "<unreadable body>"; }
}
