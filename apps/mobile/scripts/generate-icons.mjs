// Generate Expo app icons + push notification icons from one master SVG.
//
// Apple HIG (iOS) — https://developer.apple.com/design/human-interface-guidelines/app-icons:
//   • 1024×1024 PNG, RGB (no alpha), full-bleed square. Apple applies the
//     rounded-rect mask on the springboard, so we DON'T draw rounded
//     corners into the artwork — the navy fills every pixel.
//   • Solid background — translucent icons render with iOS's white default
//     fill and the mark becomes unreadable.
//
// Android adaptive icons — https://developer.android.com/develop/ui/views/launch/icon_design_adaptive:
//   • Foreground PNG: 512×512 at xxxhdpi. Outer 33 % gets clipped by the
//     OEM mask, so the LOGO must fit the central 66 % (safe zone). Our
//     filled N spans x:222-802 in the 1024 reference, ~56 % of canvas
//     width — comfortably inside the 66 % safe zone.
//   • IMPORTANT: the BACKGROUND (navy + map) still fills the full 512
//     canvas so the OEM mask reveals brand-consistent texture all the
//     way to whatever shape (circle/squircle/teardrop) it carves. The
//     previous version shrank the entire artwork to 55 % which left big
//     transparent borders and looked broken on most devices.
//   • Background can also be a solid color in app.json
//     (`expo.android.adaptiveIcon.backgroundColor`) — kept as fallback.
//
// Splash icon — Expo's contain-resize splash uses the icon centered on a
// solid background colour. Export at 1024×1024 with a transparent canvas
// so the splash plugin pads it with `splash.backgroundColor`.
//
// Push notification icons (LOGO-3, audit 1.5.2026):
//   • Android small/status-bar icon: 96×96 PNG, alpha-only silhouette
//     (Android 5.0+ strips RGB and uses the alpha as a mask). The
//     `notification.color` field on the FCM payload tints the silhouette
//     into brand orange in the status bar.
//
// Background map — REAL Bratislava OSM data (LOGO-4 redesign 1.5.2026):
//   The street network and Danube come from Overpass API. The selected
//   crop covers Petržalka + the Danube bend at Most SNP + Staré Mesto
//   so the river silhouette is unmistakable. See osm-bratislava.mjs for
//   bbox + cache details.
//
// Run: node scripts/generate-icons.mjs

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { getBratislavaMapInner } from './osm-bratislava.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '..', 'assets');

const BRAND = {
  navy: '#0E223F',
  orange: '#FF7A2F',
};

// ── Filled N letter — bold, chunky stems sized to read clearly over
// the dense OSM background.
//
// Geometry (1024 viewBox):
//   • left stem:  x=222..402, y=240..760  (180×520)
//   • right stem: x=622..802, y=240..760  (180×520)
//   • diagonal: from (402, 240) → (622, 580) [top edge]
//               and (402, 420) → (622, 760) [bottom edge]
//     → 180-unit vertical thickness, slope 1.55 (slightly steeper
//       than a thin N to keep the diagonal feeling chunky too)
//   • total: 580 wide × 520 tall, centered on (512, 500)
//
// Stems are 50 % thicker than the v1 design (was 120 wide). The bolder
// weight survives both small thumbnails and the busy street texture
// behind it.
const FILLED_N_PATH =
  'M 222 240 L 402 240 L 622 580 L 622 240 L 802 240 ' +
  'L 802 760 L 622 760 L 402 420 L 402 760 L 222 760 Z';

// ── SVG composition helpers ──────────────────────────────────────────

function buildIosSvg(mapInner) {
  // 1024×1024, opaque navy, map clipped to rounded rect (defensive — so
  // streets don't poke past Apple's mask if it differs slightly from
  // ours), filled N on top.
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="rounded">
        <rect width="1024" height="1024" rx="180" />
      </clipPath>
    </defs>
    <rect width="1024" height="1024" fill="${BRAND.navy}"/>
    <g clip-path="url(#rounded)">
      ${mapInner}
    </g>
    <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
  </svg>`;
}

function buildSplashSvg(mapInner) {
  // 1024×1024 transparent outside rounded rect — Expo pads with
  // splash.backgroundColor so the corners read as navy too.
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="rounded-splash">
        <rect width="1024" height="1024" rx="180" />
      </clipPath>
    </defs>
    <g clip-path="url(#rounded-splash)">
      <rect width="1024" height="1024" fill="${BRAND.navy}"/>
      ${mapInner}
      <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
    </g>
  </svg>`;
}

function buildAndroidForegroundSvg(mapInner) {
  // 512×512 full-canvas opaque foreground. The OEM mask carves the
  // final shape (circle/squircle/teardrop), so we keep the navy + map
  // edge-to-edge — every shape variant reveals brand texture, not a
  // padded mini-icon. The N itself sits inside the 66 % safe zone:
  // x:222..802 in 1024 viewBox = 222..802 / 2 = 111..401 in 512 px,
  // which is well within the safe-zone band 86..426.
  return `<svg width="512" height="512" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${BRAND.navy}"/>
    ${mapInner}
    <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
  </svg>`;
}

// Notification small icon — alpha-only N silhouette. Android 5.0+
// renders only the alpha channel of small icons in the status bar and
// tints with `notification.color` (`#FF7A2F`). No map texture (would
// be lost at 24dp anyway) — just the orange N over transparent.
const notificationSmallSvg = `<svg width="96" height="96" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
</svg>`;

async function svgToPng(svg, outName, { size, flatten = true, bg = BRAND.navy } = {}) {
  const buf = Buffer.from(svg);
  let pipeline = sharp(buf, { density: 600 }).resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (flatten) {
    pipeline = pipeline.flatten({ background: bg });
  }
  const out = resolve(ASSETS, outName);
  await pipeline.png().toFile(out);
  const meta = await sharp(out).metadata();
  console.log(
    `  ${outName.padEnd(36)} ${meta.width}×${meta.height} (${meta.channels} ch, alpha=${meta.hasAlpha})`,
  );
}

async function main() {
  console.log('Generating Notifio app icons → apps/mobile/assets/');
  console.log('Loading Bratislava OSM map (cached after first fetch)...');

  // Two stroke variants:
  //   - 1024-px output: native widths (residential 1.2 px etc.)
  //   - 512-px output: 2× widths so the thin residential layer doesn't
  //     fall below 1 device pixel and disappear during downsample.
  const map1024 = await getBratislavaMapInner({ strokeScale: 1 });
  const map512 = await getBratislavaMapInner({ strokeScale: 2 });

  // iOS: opaque 1024×1024 RGB only — Apple HIG rejects icons with alpha.
  await svgToPng(buildIosSvg(map1024), 'icon.png', {
    size: 1024,
    flatten: true,
    bg: BRAND.navy,
  });
  // Android adaptive foreground: 512×512, full-canvas navy + map + N.
  await svgToPng(buildAndroidForegroundSvg(map512), 'android-icon-foreground.png', {
    size: 512,
    flatten: false,
  });
  // Splash: 1024×1024 transparent — Expo pads with splash.backgroundColor.
  await svgToPng(buildSplashSvg(map1024), 'splash-icon.png', {
    size: 1024,
    flatten: false,
  });
  // Push notification small icon: 96×96, alpha-only silhouette.
  await svgToPng(notificationSmallSvg, 'notification-icon.png', {
    size: 96,
    flatten: false,
  });
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
