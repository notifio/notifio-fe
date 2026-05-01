// Bratislava OSM map renderer.
//
// Fetches real Bratislava streets + Danube from Overpass API and renders
// them as SVG inner content (water + road network at multiple weights).
// The fetch is cached to scripts/osm-cache/city.json so subsequent runs
// (icon regen, design tweaks) are instant — only the first invocation
// hits the network.
//
// Used by:
//   - propose-icons-v4.mjs   (during design exploration)
//   - generate-icons.mjs     (final asset pipeline)
//
// The selected bbox covers Petržalka + the Danube bend at Most SNP +
// Staré Mesto + Nové Mesto. That crop was chosen because:
//   1. The Danube's S-bend in the lower-left is the silhouette people
//      recognise as Bratislava.
//   2. Street density on both banks is balanced — neither bank looks
//      empty at thumbnail size.
//   3. The N (centered, 56% of canvas width) lands cleanly over the
//      densest north-bank fabric without obscuring the river.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'osm-cache');
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// [south, west, north, east] — selected "city" crop
export const BRATISLAVA_BBOX = [48.105, 17.06, 48.18, 17.175];

const COLORS = {
  orange: '#FF7A2F',
  river: '#2A4870',
};

// Per-class stroke width and opacity, in 1024 viewBox units. Hierarchy
// matches OSM rendering conventions: residential thin and faint,
// motorway thick and bright.
const ROAD_LAYERS = [
  { key: 'residential', width: 1.2, opacity: 0.20 },
  { key: 'tertiary', width: 2.0, opacity: 0.32 },
  { key: 'secondary', width: 3.2, opacity: 0.45 },
  { key: 'primary', width: 4.4, opacity: 0.58 },
  { key: 'motorway', width: 5.6, opacity: 0.7 },
];

const RIVER_STROKE_1024 = 65; // Danube centerline stroked as a wide line

// ── OSM fetch with on-disk cache ──────────────────────────────────────
export async function fetchBratislavaOSM() {
  const cachePath = resolve(CACHE_DIR, 'city.json');
  try {
    const cached = await readFile(cachePath, 'utf-8');
    return JSON.parse(cached);
  } catch {}

  const query = `
    [out:json][timeout:90];
    (
      way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian)$"](${BRATISLAVA_BBOX.join(',')});
      way["waterway"="river"](${BRATISLAVA_BBOX.join(',')});
      way["natural"="water"](${BRATISLAVA_BBOX.join(',')});
    );
    (._;>;);
    out;
  `;
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'User-Agent': 'notifio-icon-generator/1.0',
      Accept: 'application/json',
    },
    body: query,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cachePath, JSON.stringify(data));
  return data;
}

// ── Equirectangular projection with cos-lat correction ────────────────
// Maps [lon, lat] → [x, y] inside a {canvas}×{canvas} pixel grid using
// "cover" semantics (longest dimension fills the canvas, the shorter
// one extends past — gets clipped by the icon's rounded rect).
function makeProjector(bbox, canvas) {
  const [s, west, n, east] = bbox;
  const midLat = (s + n) / 2;
  const lonScale = Math.cos((midLat * Math.PI) / 180);
  const widthDeg = (east - west) * lonScale;
  const heightDeg = n - s;
  const scale = Math.max(canvas / widthDeg, canvas / heightDeg);
  const xOff = (canvas - widthDeg * scale) / 2;
  const yOff = (canvas - heightDeg * scale) / 2;
  return (lon, lat) => [
    xOff + (lon - west) * lonScale * scale,
    yOff + (n - lat) * scale,
  ];
}

function categorizeWays(osm, project) {
  const nodes = {};
  for (const el of osm.elements) {
    if (el.type === 'node') nodes[el.id] = [el.lon, el.lat];
  }
  const cats = {
    waterPolygons: [],
    waterLines: [],
    motorway: [],
    primary: [],
    secondary: [],
    tertiary: [],
    residential: [],
  };
  for (const el of osm.elements) {
    if (el.type !== 'way') continue;
    const pts = el.nodes
      .map((id) => nodes[id])
      .filter(Boolean)
      .map(([lon, lat]) => project(lon, lat));
    if (pts.length < 2) continue;
    const t = el.tags || {};
    const closed =
      el.nodes.length >= 3 && el.nodes[0] === el.nodes[el.nodes.length - 1];
    if (t.natural === 'water' && closed) {
      cats.waterPolygons.push(pts);
      continue;
    }
    if (t.waterway === 'river' || t.natural === 'water') {
      cats.waterLines.push(pts);
      continue;
    }
    const hw = t.highway;
    if (!hw) continue;
    if (hw === 'motorway' || hw === 'trunk') cats.motorway.push(pts);
    else if (hw === 'primary') cats.primary.push(pts);
    else if (hw === 'secondary') cats.secondary.push(pts);
    else if (hw === 'tertiary') cats.tertiary.push(pts);
    else cats.residential.push(pts);
  }
  return cats;
}

const lineToPath = (pts) =>
  'M ' + pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L ');
const polyToPath = (pts) => lineToPath(pts) + ' Z';

const renderRoads = (lines, width, opacity) =>
  lines
    .map(
      (pts) =>
        `<path d="${lineToPath(pts)}" stroke="${COLORS.orange}" stroke-width="${width}" opacity="${opacity}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');

/**
 * Returns the inner SVG content (water + roads) for the Bratislava
 * map. The geometry uses a 1024×1024 coordinate system so callers can
 * embed it inside any outer `<svg viewBox="0 0 1024 1024">`.
 *
 * `strokeScale` lets callers bump stroke widths when the SVG will be
 * downsampled below 1024 px (otherwise the thin residential layer
 * becomes sub-pixel and disappears). Use 1 for 1024-px output, 2 for
 * 512-px output, etc.
 */
export async function getBratislavaMapInner({ strokeScale = 1 } = {}) {
  const osm = await fetchBratislavaOSM();
  const project = makeProjector(BRATISLAVA_BBOX, 1024);
  const cats = categorizeWays(osm, project);

  const waterFills = cats.waterPolygons
    .map((pts) => `<path d="${polyToPath(pts)}" fill="${COLORS.river}" opacity="1"/>`)
    .join('');
  const waterStrokes = cats.waterLines
    .map(
      (pts) =>
        `<path d="${lineToPath(pts)}" stroke="${COLORS.river}" stroke-width="${RIVER_STROKE_1024 * strokeScale}" opacity="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');

  const roads = ROAD_LAYERS
    .map(({ key, width, opacity }) =>
      renderRoads(cats[key], width * strokeScale, opacity),
    )
    .join('');

  return waterStrokes + waterFills + roads;
}
