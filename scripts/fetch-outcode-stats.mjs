// One-off / refreshable: fetch real per-outcode stats (avg sold price, crime,
// flood at the district centre) for every outcode in src/lib/seo/outcodes.ts,
// cache to src/data/outcode-stats.json. The /area/[outcode] page renders these
// with graceful fallback. Run: node scripts/fetch-outcode-stats.mjs
import { readFileSync, writeFileSync } from "fs";
import https from "https";

const get = (url) => new Promise((res) => {
  const r = https.get(url, { headers: { "User-Agent": "HomeBuyerCheck/1.0", Accept: "application/json" } }, (x) => {
    let d = ""; x.on("data", (c) => (d += c)); x.on("end", () => res({ status: x.statusCode, body: d }));
  });
  r.on("error", () => res({ status: 0, body: "" }));
  r.setTimeout(28000, () => { r.destroy(); res({ status: 0, body: "" }); });
});
const post = (host, path, body, headers) => new Promise((res) => {
  const r = https.request({ hostname: host, path, method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(body) } }, (x) => {
    let d = ""; x.on("data", (c) => (d += c)); x.on("end", () => res({ status: x.statusCode, body: d }));
  });
  r.on("error", () => res({ status: 0, body: "" }));
  r.setTimeout(28000, () => { r.destroy(); res({ status: 0, body: "" }); });
  r.write(body); r.end();
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Extract outcode list from the TS source
const ocSrc = readFileSync(new URL("../src/lib/seo/outcodes.ts", import.meta.url));
const codes = [...ocSrc.toString().matchAll(/code:\s*"([A-Z0-9]+)"/g)].map((m) => m[1]);
console.log("outcodes:", codes.length);

const FMP = "https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services/Flood_Map_for_Planning/FeatureServer";

async function floodAt(lat, lng) {
  for (const layer of [1, 2]) { // 1=FZ3, 2=FZ2
    const u = `${FMP}/${layer}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnCountOnly=true&f=json`;
    const r = await get(u);
    try { const j = JSON.parse(r.body); if (typeof j.count === "number" && j.count > 0) return layer === 1 ? "3" : "2"; } catch {}
  }
  return "none";
}
async function soldPrice(code) {
  const q = `PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/> PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> SELECT (AVG(?amt) AS ?avg)(COUNT(*) AS ?n) WHERE { ?t lrppi:pricePaid ?amt ; lrppi:transactionDate ?d ; lrppi:propertyAddress ?a . ?a lrcommon:postcode ?pc . FILTER(STRSTARTS(?pc,"${code} ")) FILTER(?d>="2023-01-01"^^xsd:date) }`;
  const r = await post("landregistry.data.gov.uk", "/landregistry/query", "query=" + encodeURIComponent(q), { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/sparql-results+json" });
  try { const b = JSON.parse(r.body).results.bindings[0]; const n = Number(b.n?.value || 0); return n > 0 ? { avgPrice: Math.round(Number(b.avg.value)), salesCount: n } : null; } catch { return null; }
}

const out = {};
for (const code of codes) {
  const stat = { code };
  const oc = await get(`https://api.postcodes.io/outcodes/${encodeURIComponent(code)}`);
  let lat, lng;
  try { const r = JSON.parse(oc.body).result; lat = r.latitude; lng = r.longitude; stat.district = r.admin_district?.[0]; } catch {}
  stat.sold = await soldPrice(code);
  if (lat && lng) {
    const cr = await get(`https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`);
    try { const arr = JSON.parse(cr.body); if (Array.isArray(arr)) { const cats = {}; arr.forEach((x) => (cats[x.category] = (cats[x.category] || 0) + 1)); const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]; stat.crime = { total: arr.length, topCategory: top ? top[0].replace(/-/g, " ") : null }; } } catch {}
    stat.floodZone = await floodAt(lat, lng);
  }
  out[code] = stat;
  console.log(code, "price=" + (stat.sold ? "£" + stat.sold.avgPrice + "/" + stat.sold.salesCount : "-"), "crime=" + (stat.crime?.total ?? "-"), "flood=" + (stat.floodZone ?? "-"));
  await sleep(400);
}
writeFileSync(new URL("../src/data/outcode-stats.json", import.meta.url), JSON.stringify(out, null, 2));
console.log("wrote src/data/outcode-stats.json with", Object.keys(out).length, "outcodes");
