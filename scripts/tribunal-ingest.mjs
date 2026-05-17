/**
 * Tribunal Decisions (Property Chamber) ingest.
 *
 * Source: gov.uk Search API (`filter_format=residential_property_tribunal_decision`).
 * Returns JSON, no auth, no API key. Free OGL v3.0.
 *
 * Two modes:
 *   - backfill: paginate the entire archive (~16,800 decisions)
 *   - incremental: poll the last 7 days only (cron-friendly)
 *
 * For each result we fetch the per-decision JSON at /api/content/{slug} which
 * includes `details.metadata.hidden_indexable_content` — the PDF text already
 * extracted server-side. No PDF parsing needed.
 *
 * Output: upserts into Supabase `tribunal_decisions` table.
 *
 * Usage:
 *   node scripts/tribunal-ingest.mjs backfill
 *   node scripts/tribunal-ingest.mjs incremental
 */

import fetch from "node-fetch";

const MODE = process.argv[2];
if (!MODE || !["backfill", "incremental"].includes(MODE)) {
  console.error("Usage: node tribunal-ingest.mjs <backfill|incremental>");
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const GOV_UK = "https://www.gov.uk";
const FILTER = "filter_format=residential_property_tribunal_decision";
const PAGE_SIZE = 100;
const POLITE_DELAY_MS = 1000; // 1 req/sec to be respectful

const UK_POSTCODE_RX = /([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})/i;

function normalisePostcode(s) {
  if (!s) return "";
  const m = String(s).match(UK_POSTCODE_RX);
  return m ? `${m[1].toUpperCase()}${m[2].toUpperCase()}` : "";
}

function extractField(text, label) {
  if (!text) return undefined;
  // Field rows in hidden_indexable_content are tab/colon-separated.
  // Pattern: "Case Reference  :   LON/00AF/LDC/2026/0029"
  const rx = new RegExp(`${label}\\s*[:\\t]+\\s*([^\\n\\r]+?)\\s*(?:\\n|\\r|$)`, "i");
  const m = text.match(rx);
  return m ? m[1].trim() : undefined;
}

function parseBuildingName(propertyAddress) {
  if (!propertyAddress) return undefined;
  // Best-effort: first comma-separated segment, stripped of leading flat/apt prefix.
  const first = propertyAddress.split(",")[0].trim();
  // Remove "Flat 12" / "Apartment 604" prefix to get to the building name
  const stripped = first.replace(/^(?:flat|apartment|apt|unit|suite|maisonette|penthouse)\s+\S+\s*,?\s*/i, "").trim();
  return stripped || first;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchApi(start, count) {
  const url = `${GOV_UK}/api/search.json?${FILTER}&count=${count}&start=${start}&order=-public_timestamp`;
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "HBC-Tribunal-Ingest/1.0" } });
  if (!res.ok) throw new Error(`search.json ${res.status}`);
  return res.json();
}

async function getContent(slug) {
  const url = `${GOV_UK}/api/content/${slug}`;
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "HBC-Tribunal-Ingest/1.0" } });
  if (!res.ok) return null;
  return res.json();
}

async function supabaseUpsert(rows) {
  if (rows.length === 0) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tribunal_decisions?on_conflict=slug`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert failed ${res.status}: ${text.slice(0, 400)}`);
  }
}

async function logIngest(startedAt, fetched, upserted, error) {
  await fetch(`${SUPABASE_URL}/rest/v1/tribunal_ingest_log`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify([{
      mode: MODE,
      decisions_fetched: fetched,
      decisions_upserted: upserted,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      error: error ?? null,
    }]),
  });
}

function buildRow(slugPath, contentJson, listingEntry) {
  // slugPath comes in like "/residential-property-tribunal-decisions/{slug}" — strip the prefix.
  const slug = slugPath.replace(/^.*\//, "");
  const content = contentJson ?? {};
  const meta = content?.details?.metadata ?? {};
  const fullText = meta.hidden_indexable_content ?? listingEntry?.description ?? "";

  const caseRef = extractField(fullText, "Case Reference") ?? extractField(fullText, "Case Ref");
  const propertyAddress = extractField(fullText, "Property")
    ?? extractField(fullText, "Address of property");
  const applicant = extractField(fullText, "Applicant")
    ?? extractField(fullText, "Applicants");
  const respondent = extractField(fullText, "Respondent")
    ?? extractField(fullText, "Respondents");
  const decisionDateRaw = extractField(fullText, "Date of Decision")
    ?? extractField(fullText, "Decision date");
  const decisionType = extractField(fullText, "Type of Application")
    ?? extractField(fullText, "Type of application");

  // Parse decision date — accept "4th May 2026" / "4 May 2026" / "2026-05-04" / "04/05/2026"
  let decisionDate = null;
  if (decisionDateRaw) {
    const cleaned = decisionDateRaw.replace(/(\d+)(st|nd|rd|th)/i, "$1").trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) decisionDate = d.toISOString().slice(0, 10);
  }

  // Category — try the result's tribunal_decision_category field or fall back to URL hint.
  const category = listingEntry?.tribunal_decision_category?.[0]
    ?? content?.details?.tribunal_decision_category?.[0]
    ?? decisionType
    ?? null;

  // PDF URL
  const attachments = content?.details?.attachments ?? [];
  const pdfUrl = attachments[0]?.url ?? null;

  const postcode = normalisePostcode(propertyAddress) || normalisePostcode(fullText);

  // 1-2 sentence outcome summary — just use the description for now.
  const decisionSummary = listingEntry?.description?.slice(0, 500) ?? null;

  return {
    slug,
    case_reference: caseRef ?? null,
    category: category ? String(category).slice(0, 100) : null,
    property_address: propertyAddress ?? null,
    postcode_normalised: postcode || null,
    building_name: parseBuildingName(propertyAddress) ?? null,
    applicant_name: applicant ? applicant.slice(0, 200) : null,
    respondent_name: respondent ? respondent.slice(0, 200) : null,
    decision_date: decisionDate,
    decision_summary: decisionSummary,
    full_text: fullText.slice(0, 50000),
    pdf_url: pdfUrl,
    published_at: listingEntry?.public_timestamp ?? null,
    fetched_at: new Date().toISOString(),
  };
}

async function processBatch(items) {
  const rows = [];
  for (const item of items) {
    const slugPath = item.link;
    if (!slugPath) continue;
    try {
      const content = await getContent(slugPath.replace(/^.*\//, ""));
      const row = buildRow(slugPath, content, item);
      rows.push(row);
    } catch (err) {
      console.error("Failed to fetch", slugPath, err.message);
    }
    await sleep(POLITE_DELAY_MS);
  }
  if (rows.length > 0) await supabaseUpsert(rows);
  return rows.length;
}

async function backfill() {
  const startedAt = new Date().toISOString();
  let totalFetched = 0;
  let totalUpserted = 0;
  try {
    // Get total count first
    const initial = await searchApi(0, 0);
    const total = initial.total ?? 0;
    console.log(`Total decisions: ${total}`);

    for (let start = 0; start < total; start += PAGE_SIZE) {
      const batch = await searchApi(start, PAGE_SIZE);
      const items = batch.results ?? [];
      totalFetched += items.length;
      const upserted = await processBatch(items);
      totalUpserted += upserted;
      console.log(`  upserted ${totalUpserted}/${total}`);
      await sleep(POLITE_DELAY_MS);
    }
    await logIngest(startedAt, totalFetched, totalUpserted, null);
    console.log(`Done. fetched=${totalFetched} upserted=${totalUpserted}`);
  } catch (err) {
    console.error("Backfill failed:", err);
    await logIngest(startedAt, totalFetched, totalUpserted, String(err.message ?? err));
    process.exit(1);
  }
}

async function incremental() {
  const startedAt = new Date().toISOString();
  let totalFetched = 0;
  let totalUpserted = 0;
  try {
    // Pull the last 200 decisions by publish date. That's well over a week
    // of new decisions (~50/day average).
    const batch = await searchApi(0, 200);
    const items = batch.results ?? [];
    totalFetched = items.length;
    const upserted = await processBatch(items);
    totalUpserted = upserted;
    await logIngest(startedAt, totalFetched, totalUpserted, null);
    console.log(`Incremental done. fetched=${totalFetched} upserted=${totalUpserted}`);
  } catch (err) {
    console.error("Incremental failed:", err);
    await logIngest(startedAt, totalFetched, totalUpserted, String(err.message ?? err));
    process.exit(1);
  }
}

if (MODE === "backfill") backfill();
else incremental();
