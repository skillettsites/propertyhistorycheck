/**
 * Ingest ONS "Income estimates for small areas in England and Wales".
 *
 * Source: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/smallareaincomeestimatesformiddlelayersuperoutputareasenglandandwales
 * Vintage: financial year ending March 2023 (published 10 December 2025)
 *
 * We use the "Net annual income" sheet (unequivalised disposable household
 * income in £). This is the most intuitive number for property buyers —
 * raw take-home pay per household, after tax/NI/council tax/pension.
 *
 * Output: src/data/msoa-income.json — { [msoaCode]: medianIncomeRoundedTo100 }.
 */

import * as XLSX from "xlsx";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xlsxPath = path.join(__dirname, "..", "tmp", "ons-income.xlsx");
const outPath = path.join(__dirname, "..", "src", "data", "msoa-income.json");

const buf = fs.readFileSync(xlsxPath);
const wb = XLSX.read(buf, { type: "buffer" });

const sheetName = "Net annual income";
const ws = wb.Sheets[sheetName];
if (!ws) throw new Error(`Sheet "${sheetName}" not found`);

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

// Header row is at index 3:
// ["MSOA code","MSOA name","Local authority code","Local authority name","Region code","Region name","Disposable (net) annual income (£)", ...]
const header = rows[3];
const msoaCodeIdx = header.indexOf("MSOA code");
const incomeIdx = header.indexOf("Disposable (net) annual income (£)");
if (msoaCodeIdx === -1 || incomeIdx === -1) {
  throw new Error(`Header columns not found: ${JSON.stringify(header)}`);
}

const out = {};
let parsed = 0;
let skipped = 0;
for (let i = 4; i < rows.length; i++) {
  const row = rows[i];
  if (!row) continue;
  const code = row[msoaCodeIdx];
  const value = row[incomeIdx];
  if (typeof code !== "string" || !/^[EW]\d{8}$/.test(code)) {
    skipped++;
    continue;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    skipped++;
    continue;
  }
  // Round to nearest £100.
  out[code] = Math.round(num / 100) * 100;
  parsed++;
}

// Sort keys alphabetically for stable diffs.
const sorted = {};
for (const k of Object.keys(out).sort()) sorted[k] = out[k];

fs.writeFileSync(outPath, JSON.stringify(sorted));

const values = Object.values(sorted);
const min = Math.min(...values);
const max = Math.max(...values);
const mean = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

console.log(`Parsed ${parsed} MSOAs, skipped ${skipped} rows.`);
console.log(`Range: £${min.toLocaleString()} – £${max.toLocaleString()}, mean £${mean.toLocaleString()}.`);
console.log(`Wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB).`);

// Spot-check samples.
const samples = [
  ["E02000001", "City of London 001"],
  ["E02000977", "Westminster (central)"],
  ["E02001729", "Newcastle/Tyneside example"],
  ["E02002483", "Hartlepool 001"],
];
console.log("\nSpot-checks:");
for (const [code, label] of samples) {
  console.log(`  ${code} (${label}): £${(sorted[code] ?? "—").toLocaleString?.() ?? sorted[code] ?? "—"}`);
}
