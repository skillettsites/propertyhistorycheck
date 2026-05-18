/**
 * HMLR bulk dataset ingest.
 *
 * Downloads the latest FULL snapshot from use-land-property-data.service.gov.uk
 * (the API returns a signed S3 URL valid for 10 seconds), streams the ZIP'd
 * CSV through unzipper + csv-parser, parses rows, batched upserts into
 * Supabase via the REST API.
 *
 * Designed to run inside GitHub Actions monthly. Auth via:
 *   HMLR_API_KEY                  (free, from use-land-property-data.service.gov.uk)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY     (service role, bypasses RLS)
 *
 * Usage:
 *   node scripts/hmlr-ingest.mjs leases
 *   node scripts/hmlr-ingest.mjs ccod
 *   node scripts/hmlr-ingest.mjs ocod
 */

import fetch from "node-fetch";
import unzipper from "unzipper";
import csvParser from "csv-parser";

const DATASET = process.argv[2];
if (!DATASET || !["ccod", "ocod"].includes(DATASET)) {
  console.error("Usage: node hmlr-ingest.mjs <ccod|ocod>");
  console.error("(Leases dataset removed — requires £5,000/yr Commercial licence)");
  process.exit(1);
}

const HMLR_KEY = process.env.HMLR_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!HMLR_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env: HMLR_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const HMLR_API = "https://use-land-property-data.service.gov.uk/api/v1";
const BATCH_SIZE = 1000;
const TABLE = DATASET === "ccod" ? "hmlr_ccod" : "hmlr_ocod";

console.log(`[${new Date().toISOString()}] Ingest start: ${DATASET} → ${TABLE}`);

async function logIngest(startedAt, processed, upserted, deleted, fileName, error) {
  await fetch(`${SUPABASE_URL}/rest/v1/hmlr_ingest_log`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify([{
      dataset: DATASET,
      file_name: fileName ?? "(unknown)",
      rows_processed: processed,
      rows_upserted: upserted,
      rows_deleted: deleted,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      error: error ?? null,
    }]),
  });
}

async function listFiles() {
  const res = await fetch(`${HMLR_API}/datasets/${DATASET}`, {
    headers: { Authorization: HMLR_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HMLR list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  // The real CCOD/OCOD file list lives under `result.resources` (verified live 2026-05-18).
  // `public_resources` only contains the tiny "example.csv" preview, not the FULL snapshot.
  // `private_resources` is the legacy field name and may be empty on current API responses.
  return data.result?.resources ?? data.result?.private_resources ?? data.result?.public_resources ?? [];
}

async function resolveDownloadUrl(fileName) {
  const res = await fetch(`${HMLR_API}/datasets/${DATASET}/${encodeURIComponent(fileName)}`, {
    headers: { Authorization: HMLR_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HMLR resolve failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.result?.download_url;
}

async function supabaseUpsert(rows) {
  if (rows.length === 0) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?on_conflict=title_number`, {
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
    const body = await res.text();
    throw new Error(`Supabase upsert failed ${res.status}: ${body.slice(0, 400)}`);
  }
}

async function supabaseDelete(titleNumbers) {
  if (titleNumbers.length === 0) return;
  // delete in batches of 100 to avoid URL length limits
  for (let i = 0; i < titleNumbers.length; i += 100) {
    const batch = titleNumbers.slice(i, i + 100);
    const inList = batch.map((t) => `"${t}"`).join(",");
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?title_number=in.(${encodeURIComponent(inList)})`;
    await fetch(url, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=minimal" },
    });
  }
}

// Parsers for each dataset
function normalisePostcode(s) {
  return (s ?? "").replace(/\s+/g, "").toUpperCase();
}

const UK_POSTCODE_RX = /([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})/i;
function extractPostcode(text) {
  if (!text) return "";
  const m = String(text).match(UK_POSTCODE_RX);
  return m ? `${m[1].toUpperCase()}${m[2].toUpperCase()}` : "";
}

function parseTerm(termText) {
  if (!termText) return { years: null, startDate: null };
  const yearsMatch = String(termText).match(/(\d+)\s*(?:years?|yrs?)/i);
  const dateMatch = String(termText).match(/from\s+(\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : null;
  let startDate = null;
  if (dateMatch) {
    const d = new Date(dateMatch[1].replace(/(\d{1,2})\s+(\w+)\s+(\d{4})/, "$2 $1, $3"));
    if (!isNaN(d.getTime())) startDate = d.toISOString().slice(0, 10);
  }
  return { years, startDate };
}

function parsePaonSaon(propertyDescription) {
  if (!propertyDescription) return { paon: null, saon: null };
  const text = String(propertyDescription).trim();
  const flatMatch = text.match(/^(?:apartment|apt|flat|unit|suite|maisonette|penthouse|studio)\s+(\S+)/i);
  let saon = null;
  let rest = text;
  if (flatMatch) {
    saon = flatMatch[1].toUpperCase();
    rest = text.slice(flatMatch[0].length).replace(/^[\s,]+/, "");
  }
  const segments = rest.split(",").map((s) => s.trim());
  const paonSeg = segments[0] ?? "";
  const numMatch = paonSeg.match(/^(\d+[A-Z]?)\b/i);
  const paon = numMatch ? numMatch[1].toUpperCase() : (paonSeg || null);
  return { paon, saon };
}

function transformLeasesRow(row) {
  const change = row["Change Indicator"] ?? "";
  const titleNumber = row["Unique Identifier"] || row["Title Number"];
  if (!titleNumber) return null;
  if (change === "D") return { _delete: true, title_number: titleNumber };

  const description = row["Register Property Description"] ?? "";
  const postcode = normalisePostcode(extractPostcode(description));
  const { paon, saon } = parsePaonSaon(description);
  const termRaw = row["Term"] ?? null;
  const { years, startDate } = parseTerm(termRaw);
  let leaseStartDate = startDate;
  if (!leaseStartDate && row["Date of Lease"]) {
    const m = String(row["Date of Lease"]).match(/(\d{2})-(\d{2})-(\d{4})/);
    if (m) leaseStartDate = `${m[3]}-${m[2]}-${m[1]}`;
  }
  return {
    title_number: titleNumber,
    postcode_normalised: postcode,
    property_description: description.slice(0, 500),
    paon,
    saon,
    term_raw: termRaw ? String(termRaw).slice(0, 200) : null,
    term_years: years,
    lease_start_date: leaseStartDate,
    last_refreshed: new Date().toISOString(),
  };
}

function transformOwnershipRow(row, isOcod) {
  const change = row["Change Indicator"] ?? "";
  const titleNumber = row["Title Number"];
  if (!titleNumber) return null;
  if (change === "D") return { _delete: true, title_number: titleNumber };

  const out = {
    title_number: titleNumber,
    postcode_normalised: normalisePostcode(row["Postcode"]),
    property_address: (row["Property Address"] ?? "").slice(0, 500),
    tenure: row["Tenure"] ?? null,
    proprietor_name: row["Proprietor Name (1)"] ?? row["Proprietor Name 1"] ?? null,
    company_registration_no: row["Company Registration No. (1)"] ?? row["Company Registration No 1"] ?? null,
    last_refreshed: new Date().toISOString(),
  };
  if (isOcod) {
    out.country_incorporated = row["Country Incorporated (1)"] ?? row["Country Incorporated 1"] ?? null;
  }
  return out;
}

async function ingest() {
  const startedAt = new Date().toISOString();
  let processed = 0, upserted = 0, deletedCount = 0;
  let fileName = "(unknown)";
  try {
    const files = await listFiles();
    // Pick the most recent FULL file for this dataset. The HMLR API uses
    // `file_name` like "CCOD_FULL_2026_05.zip" (YYYY_MM suffix sorts naturally).
    // Some payload variants use `name` like "Full File" — fall back to that.
    const fullFiles = files.filter((f) => /FULL/i.test(f.file_name ?? f.name ?? ""));
    const sorted = fullFiles.sort((a, b) => String(b.file_name ?? b.name).localeCompare(String(a.file_name ?? a.name)));
    const latest = sorted[0];
    if (!latest) throw new Error("No FULL snapshot found in dataset listing");
    fileName = latest.file_name ?? latest.name;
    console.log(`Latest file: ${fileName}`);

    const downloadUrl = await resolveDownloadUrl(fileName);
    if (!downloadUrl) throw new Error("HMLR API returned no download_url");
    console.log("Got signed URL, starting stream…");

    const zipRes = await fetch(downloadUrl);
    if (!zipRes.ok) throw new Error(`Download failed: ${zipRes.status}`);

    const batch = [];
    const deletes = [];

    await new Promise((resolve, reject) => {
      zipRes.body
        .pipe(unzipper.ParseOne())
        .pipe(csvParser())
        .on("data", (row) => {
          let r;
          r = transformOwnershipRow(row, DATASET === "ocod");
          if (!r) return;
          processed += 1;
          if (r._delete) {
            deletes.push(r.title_number);
          } else {
            batch.push(r);
          }
          // Flush batch when full (async — pause stream while we flush)
          // Note: csv-parser pauses internally during await of on('data')
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Flush remaining batches in chunks
    console.log(`Total rows parsed: ${processed}. Upserting in batches of ${BATCH_SIZE}…`);
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE);
      await supabaseUpsert(chunk);
      upserted += chunk.length;
      if ((i / BATCH_SIZE) % 10 === 0) console.log(`  upserted ${upserted}/${batch.length}`);
    }
    if (deletes.length > 0) {
      console.log(`Deleting ${deletes.length} rows…`);
      await supabaseDelete(deletes);
      deletedCount = deletes.length;
    }

    console.log(`Done. processed=${processed} upserted=${upserted} deleted=${deletedCount}`);
    await logIngest(startedAt, processed, upserted, deletedCount, fileName, null);
  } catch (err) {
    console.error("Ingest failed:", err);
    await logIngest(startedAt, processed, upserted, deletedCount, fileName, String(err.message ?? err));
    process.exit(1);
  }
}

ingest();
