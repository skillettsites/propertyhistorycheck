#!/usr/bin/env node
/**
 * HomeBuyerCheck purchases report.
 *
 * HBC's Stripe secret key is marked Sensitive in Vercel and can't be pulled to
 * the CLI, so this reads the authoritative purchase record instead: the Supabase
 * `reports` table, which the Stripe webhook writes on every paid order. Real
 * customer purchases carry a live Stripe session id (cs_live_*); QA/test rows
 * from the admin qa-run endpoint use qa_test_* / qatest* ids and are excluded.
 *
 * Credentials come from commandcenter/.env.local (the shared Supabase project
 * HBC writes to). NB: values in those env files often carry a trailing literal
 * "\n" — we strip it.
 *
 * Usage:
 *   node scripts/check-purchases.mjs            # all-time
 *   node scripts/check-purchases.mjs --days 7   # last 7 days (UK)
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- args ---
const argv = process.argv.slice(2);
const daysArg = argv.indexOf("--days");
const days = daysArg !== -1 ? parseInt(argv[daysArg + 1], 10) : null;

// --- credentials (shared Supabase, from commandcenter/.env.local) ---
function loadEnv() {
  const candidates = [
    resolve(__dirname, "../../commandcenter/.env.local"),
    resolve(__dirname, "../.env.local"),
    resolve(__dirname, "../.env.production.local"),
  ];
  for (const path of candidates) {
    let raw;
    try { raw = readFileSync(path, "utf8"); } catch { continue; }
    const url = (raw.match(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m) || [""])[0].match(/https:\/\/[a-z0-9.-]+\.supabase\.co/)?.[0];
    const key = (raw.match(/^SUPABASE_SERVICE_ROLE_KEY=.*$/m) || [""])[0].match(/eyJ[A-Za-z0-9_.-]+/)?.[0];
    if (url && key) return { url, key, from: path };
  }
  throw new Error("Could not find Supabase URL + service role key in commandcenter/.env.local or HBC env files");
}

const { url, key } = loadEnv();
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function sb(pathAndQuery) {
  const res = await fetch(`${url}/rest/v1/${pathAndQuery}`, { headers });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

// --- time window ---
let sinceIso = null;
if (days != null && !Number.isNaN(days)) {
  // UK day boundary ~ 23:00 UTC the day before; good enough for a coarse window.
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  sinceIso = since.toISOString();
}

const TIERS = {
  standard: { label: "Premium", price: "£4.99" },
  standard_plus: { label: "Premium+", price: "£6.99" },
  standard_plus_upgrade: { label: "Premium+ upgrade", price: "£2.00" },
};

function fmtTime(iso) {
  const d = new Date(iso);
  // BST window 2026: 29 Mar – 25 Oct. Coarse month check is fine for display.
  const m = d.getUTCMonth(); // 0-11
  const bst = m > 2 && m < 9; // Apr–Sep solidly BST; edge months close enough
  const off = bst ? 1 : 0;
  const local = new Date(d.getTime() + off * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(local.getUTCDate())}/${pad(local.getUTCMonth() + 1)} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())} ${bst ? "BST" : "GMT"}`;
}

async function main() {
  // Real purchases only: live Stripe session ids.
  let q = "reports?select=created_at,tier,amount_paid,customer_email,status,email_sent,stripe_session_id,addr:data->free->property->>fullAddress,pc:data->free->property->>postcode&stripe_session_id=like.cs_live*&order=created_at.asc";
  if (sinceIso) q += `&created_at=gte.${sinceIso}`;
  const rows = await sb(q);

  // Duplicate-fulfilment detector: count paid_report_completed events per session.
  const dupCounts = {};
  try {
    const evs = await sb("conversion_events?select=metadata->>session_id&site_id=eq.homebuyercheck&event_type=eq.paid_report_completed&limit=1000");
    for (const e of evs) { const s = e.session_id; if (s) dupCounts[s] = (dupCounts[s] || 0) + 1; }
  } catch { /* conversion_events optional */ }

  const window = days ? `last ${days} day(s)` : "all time";
  if (rows.length === 0) {
    console.log(`\nHomeBuyerCheck — no real purchases (${window}).\n`);
    return;
  }

  let gross = 0;
  console.log(`\nHomeBuyerCheck purchases — ${window}\n`);
  console.log("| # | Time | Buyer | Product | £ | Postcode | Report | Email | Runs |");
  console.log("|---|------|-------|---------|---|----------|--------|-------|------|");
  rows.forEach((r, i) => {
    const t = TIERS[r.tier] || { label: r.tier, price: "?" };
    const amt = (r.amount_paid ?? 0) / 100;
    gross += amt;
    const runs = dupCounts[r.stripe_session_id] || 1;
    console.log(
      `| ${i + 1} | ${fmtTime(r.created_at)} | ${r.customer_email} | ${t.label} | £${amt.toFixed(2)} | ${r.pc || "?"} | ${r.status} | ${r.email_sent ? "✅" : "❌"} | ${runs > 1 ? `⚠ ${runs}×` : "1"} |`
    );
  });

  console.log(`\n${rows.length} paid · £${gross.toFixed(2)} gross`);

  // By product
  const byTier = {};
  for (const r of rows) { const l = (TIERS[r.tier] || {}).label || r.tier; byTier[l] = byTier[l] || { n: 0, rev: 0 }; byTier[l].n++; byTier[l].rev += (r.amount_paid ?? 0) / 100; }
  console.log("\nBy product:");
  for (const [l, v] of Object.entries(byTier)) console.log(`  ${l}: ${v.n} · £${v.rev.toFixed(2)}`);

  // Issues
  const undelivered = rows.filter((r) => !r.email_sent);
  const failed = rows.filter((r) => r.status !== "ready");
  const dupes = rows.filter((r) => (dupCounts[r.stripe_session_id] || 1) > 1);
  if (undelivered.length || failed.length || dupes.length) {
    console.log("\n⚠ Issues:");
    undelivered.forEach((r) => console.log(`  - Email NOT delivered: ${r.customer_email} (${r.pc})`));
    failed.forEach((r) => console.log(`  - Report status ${r.status}: ${r.customer_email} (${r.pc})`));
    dupes.forEach((r) => console.log(`  - Fulfilled ${dupCounts[r.stripe_session_id]}× (duplicate webhook): ${r.customer_email} — buyer likely got that many report emails`));
  } else {
    console.log("\nNo delivery or duplication issues.");
  }
  console.log("");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
