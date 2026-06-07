import sharp from "sharp";

/**
 * Server-side static map renderer for the PDF report.
 *
 * The online report uses interactive Leaflet over OpenStreetMap raster tiles.
 * A PDF can't host an interactive map, so here we stitch the same OSM tiles into
 * a single PNG around the property coordinate, overlay a property pin, an optional
 * catchment circle and optional point markers, and return a base64 data URI that
 * @react-pdf/renderer's <Image> can embed directly.
 *
 * Free + keyless: tiles come from tile.openstreetmap.org with a descriptive
 * User-Agent, at low (per-report) volume. If any tile fails the whole call
 * returns null and the caller falls back to a text note.
 */

const TILE = 256;
const UA = "HomeBuyerCheck/1.0 (+https://www.homebuyercheck.co.uk; property report PDF)";

function lonToTileX(lon: number, z: number): number {
  return ((lon + 180) / 360) * 2 ** z;
}
function latToTileY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
}

export interface MapMarker {
  lat: number;
  lng: number;
  color?: string; // fill for the dot
  r?: number; // radius px
}

export interface StaticMapOptions {
  lat: number;
  lng: number;
  zoom: number;
  width?: number;
  height?: number;
  circleRadiusMeters?: number; // draws a translucent catchment circle centred on the property
  circleColor?: string;
  markers?: MapMarker[];
}

async function fetchTile(z: number, x: number, y: number): Promise<Buffer | null> {
  const max = 2 ** z;
  // wrap x, clamp y
  const tx = ((x % max) + max) % max;
  if (y < 0 || y >= max) return null;
  const sub = ["a", "b", "c"][(tx + y) % 3];
  const url = `https://${sub}.tile.openstreetmap.org/${z}/${tx}/${y}.png`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://www.homebuyercheck.co.uk/" } });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/** Returns a `data:image/png;base64,...` string, or null on failure. */
export async function staticMapDataUri(opts: StaticMapOptions): Promise<string | null> {
  const { lat, lng, zoom: z } = opts;
  const W = opts.width ?? 720;
  const H = opts.height ?? 420;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    // Global pixel coordinates of the centre.
    const cx = lonToTileX(lng, z) * TILE;
    const cy = latToTileY(lat, z) * TILE;
    const left = cx - W / 2; // global px of the output's left edge
    const top = cy - H / 2;

    const minTx = Math.floor(left / TILE);
    const maxTx = Math.floor((left + W - 1) / TILE);
    const minTy = Math.floor(top / TILE);
    const maxTy = Math.floor((top + H - 1) / TILE);

    const canvasW = (maxTx - minTx + 1) * TILE;
    const canvasH = (maxTy - minTy + 1) * TILE;

    // Fetch every tile in the grid concurrently.
    const jobs: Array<Promise<{ x: number; y: number; buf: Buffer | null }>> = [];
    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        jobs.push(fetchTile(z, tx, ty).then((buf) => ({ x: tx, y: ty, buf })));
      }
    }
    const tiles = await Promise.all(jobs);
    if (tiles.some((t) => !t.buf)) return null; // any gap -> fall back to note

    const composites: sharp.OverlayOptions[] = tiles.map((t) => ({
      input: t.buf as Buffer,
      left: (t.x - minTx) * TILE,
      top: (t.y - minTy) * TILE,
    }));

    let canvas = sharp({
      create: { width: canvasW, height: canvasH, channels: 3, background: { r: 233, g: 233, b: 233 } },
    }).composite(composites);

    // Flatten the tile grid, then extract the exact WxH window.
    const stitched = await canvas.png().toBuffer();
    const extractLeft = Math.round(left - minTx * TILE);
    const extractTop = Math.round(top - minTy * TILE);
    const cropped = await sharp(stitched)
      .extract({ left: extractLeft, top: extractTop, width: W, height: H })
      .png()
      .toBuffer();

    // Build an SVG overlay (circle + markers + property pin) in output-pixel space.
    const toPx = (plat: number, plng: number) => ({
      x: lonToTileX(plng, z) * TILE - left,
      y: latToTileY(plat, z) * TILE - top,
    });

    let svgInner = "";

    if (opts.circleRadiusMeters && opts.circleRadiusMeters > 0) {
      const mpp = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z;
      const rPx = opts.circleRadiusMeters / mpp;
      const c = opts.circleColor ?? "#2563eb";
      svgInner += `<circle cx="${W / 2}" cy="${H / 2}" r="${rPx.toFixed(1)}" fill="${c}" fill-opacity="0.10" stroke="${c}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="6 4" />`;
    }

    for (const m of opts.markers ?? []) {
      const p = toPx(m.lat, m.lng);
      if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) continue;
      const r = m.r ?? 5;
      svgInner += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${m.color ?? "#0ea5e9"}" stroke="#ffffff" stroke-width="1.5" />`;
    }

    // Property pin, last so it sits on top.
    const pin = toPx(lat, lng);
    svgInner += `<g transform="translate(${pin.x.toFixed(1)}, ${pin.y.toFixed(1)})">
      <path d="M0 2 C -9 2 -13 -6 -13 -12 C -13 -20 -6 -26 0 -26 C 6 -26 13 -20 13 -12 C 13 -6 9 2 0 2 Z" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
      <circle cx="0" cy="-13" r="4.5" fill="#ffffff" />
    </g>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgInner}</svg>`;

    const out = await sharp(cropped)
      .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
      .png()
      .toBuffer();

    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}
