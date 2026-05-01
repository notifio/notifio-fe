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
//     OEM mask, so the artwork must fit the central 66 %. We render a
//     simplified map + filled N at ~58 % so the design survives every
//     mask shape (circle / squircle / teardrop).
//   • Background can be a solid color (`expo.android.adaptiveIcon
//     .backgroundColor` in app.json) — no PNG needed.
//
// Splash icon — Expo's contain-resize splash uses the icon centered on a
// solid background colour. Export at 1024×1024 with a transparent canvas
// so the splash plugin pads it with `splash.backgroundColor`.
//
// Push notification icons (LOGO-3, audit 1.5.2026):
//   • Android small/status-bar icon: 96×96 PNG, alpha-only silhouette
//     (Android 5.0+ strips RGB and uses the alpha as a mask). The
//     `notification.color` field on the FCM payload tints the silhouette
//     into brand orange in the status bar; expanded notification view
//     can show the same icon in full color.
//   • Android large icon: 192×192 PNG, full color (mirror of the app
//     icon). Optional but Expo plugin ships it as `expo.notification.icon`.
//
// Run: node scripts/generate-icons.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '..', 'assets');

const BRAND = {
  navy: '#0E223F',
  orange: '#FF7A2F',
};

// ── Filled N letter — solid path, no stroke. Same geometry across all
// variants so the brand stays recognizable from a 24dp status-bar icon
// up to a 1024×1024 app icon.
//
// Anchor points:
//   • left bar:  x=260..380, y=240..760  (120×520)
//   • right bar: x=644..764, y=240..760
//   • diagonal stripe: from (380, 240) → (644, 760), inner edges meet at
//     y=380 (left) and y=620 (right), giving the bar a 140-unit width
const FILLED_N_PATH =
  'M 260 240 L 380 240 L 644 620 L 644 240 L 764 240 ' +
  'L 764 760 L 644 760 L 380 380 L 380 760 L 260 760 Z';

// ── Map layer — 30+ streets in three opacity bands. Mix of straight
// segments and quadratic Bezier curves so the texture looks like a real
// city grid pinned over a curved coastline. Coordinates are tuned for
// the 1024×1024 viewBox; the foreground variant scales them down.
//
// Layer 1: arterials (opacity 0.42, width 5, longer curves)
// Layer 2: secondary (opacity 0.32, width 3, shorter)
// Layer 3: small streets (opacity 0.22, width 2, dense grid)
const MAP_LAYERS = [
  // Arterials — 6 long sweeping roads
  { opacity: 0.42, width: 5, paths: [
    'M 0 320 Q 256 280 512 340 T 1024 360',
    'M 0 720 Q 240 680 460 700 T 1024 740',
    'M 180 0 Q 200 240 280 480 T 320 1024',
    'M 740 0 Q 720 280 760 540 T 800 1024',
    'M 0 540 Q 256 520 512 560 T 1024 580',
    'M 60 60 Q 320 320 580 600 T 1000 990',
  ] },
  // Secondary — 12 mid-length roads
  { opacity: 0.32, width: 3, paths: [
    'M 0 220 L 1024 230',
    'M 0 440 Q 320 430 640 445 T 1024 460',
    'M 0 620 L 1024 640',
    'M 0 850 Q 320 830 640 845 T 1024 860',
    'M 90 0 Q 110 320 130 640 T 150 1024',
    'M 380 0 L 380 1024',
    'M 530 0 Q 540 320 560 640 T 580 1024',
    'M 880 0 L 880 1024',
    'M 0 0 Q 320 320 640 640 T 1024 1024',
    'M 1024 0 Q 700 320 380 640 T 0 1024',
    'M 0 80 Q 240 100 480 90 T 1024 100',
    'M 0 940 Q 240 960 480 950 T 1024 960',
  ] },
  // Small streets — 18 short crisscrossing segments
  { opacity: 0.22, width: 2, paths: [
    'M 40 380 L 1024 400',
    'M 0 480 L 1024 500',
    'M 0 660 L 1024 680',
    'M 0 770 L 1024 790',
    'M 220 0 L 220 1024',
    'M 320 0 L 320 1024',
    'M 460 0 L 460 1024',
    'M 620 0 L 620 1024',
    'M 820 0 L 820 1024',
    'M 940 0 L 940 1024',
    'M 0 140 L 1024 150',
    'M 0 280 L 1024 290',
    'M 0 580 L 1024 590',
    'M 0 880 L 1024 890',
    'M 100 0 L 200 1024',
    'M 480 0 L 600 1024',
    'M 700 0 L 880 1024',
    'M 920 0 L 1010 1024',
  ] },
];

function buildMapLayers(scale = 1) {
  return MAP_LAYERS.map(({ opacity, width, paths }) => {
    const scaledPaths = paths.map((p) =>
      p.replace(/-?\d+(\.\d+)?/g, (m) => (Number(m) * scale).toFixed(1)),
    );
    const pathTags = scaledPaths
      .map((d) => `<path d="${d}" />`)
      .join('');
    return `<g stroke="${BRAND.orange}" stroke-width="${(width * scale).toFixed(2)}" opacity="${opacity}" fill="none" stroke-linecap="round">${pathTags}</g>`;
  }).join('');
}

// ── iOS app icon SVG — full-bleed 1024×1024, navy fill, dense map,
// filled N. No rx — Apple applies the mask. We use a clipPath anyway so
// the streets don't visibly poke past the future Apple mask.
const iosSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="rounded">
      <rect width="1024" height="1024" rx="180" />
    </clipPath>
  </defs>
  <rect width="1024" height="1024" fill="${BRAND.navy}"/>
  <g clip-path="url(#rounded)">
    ${buildMapLayers(1)}
  </g>
  <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
</svg>`;

// ── Splash SVG — same artwork as iOS but with rx=180 visible. Splash
// renders centered on a navy background so a hint of rounded corners
// reads correctly.
const splashSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="rounded-splash">
      <rect width="1024" height="1024" rx="180" />
    </clipPath>
  </defs>
  <g clip-path="url(#rounded-splash)">
    <rect width="1024" height="1024" fill="${BRAND.navy}"/>
    ${buildMapLayers(1)}
    <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
  </g>
</svg>`;

// ── Android adaptive foreground — 512×512 transparent canvas with the
// mark scaled to ~58 % so it survives every OEM mask. The map is
// kept (user explicit: brand consistency) but simplified to fewer
// thicker paths so it stays legible at small sizes.
//
// Geometry: shrink everything by 0.55× and center inside the 512 canvas
// (offset = 512 * (1 - 0.55) / 2 = ~115). The scaled N + a thinned
// map layer produces a recognizable mini-icon for the Android home
// screen even after a circle-mask crop.
const ANDROID_FG_SCALE = 0.55;
const ANDROID_FG_OFFSET = (512 - 1024 * ANDROID_FG_SCALE) / 2;
const androidForegroundSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="rounded-android">
      <rect x="${ANDROID_FG_OFFSET}" y="${ANDROID_FG_OFFSET}"
            width="${1024 * ANDROID_FG_SCALE}" height="${1024 * ANDROID_FG_SCALE}"
            rx="${180 * ANDROID_FG_SCALE}" />
    </clipPath>
  </defs>
  <g transform="translate(${ANDROID_FG_OFFSET} ${ANDROID_FG_OFFSET}) scale(${ANDROID_FG_SCALE})">
    <rect width="1024" height="1024" fill="${BRAND.navy}" clip-path="url(#rounded-android)"/>
    <g clip-path="url(#rounded-android-inner)">
      ${buildMapLayers(1)}
    </g>
    <path d="${FILLED_N_PATH}" fill="${BRAND.orange}"/>
  </g>
</svg>`;

// ── Notification small icon — alpha-only silhouette. Android 5.0+
// renders only the alpha channel of small icons in the status bar and
// tints with `notification.color` (`#FF7A2F`). Use the orange N over
// transparent, no map (the silhouette gets clipped to the central area
// anyway and detail would be lost at 24dp).
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
  // iOS: opaque 1024×1024, RGB only — Apple HIG rejects icons with alpha.
  await svgToPng(iosSvg, 'icon.png', {
    size: 1024,
    flatten: true,
    bg: BRAND.navy,
  });
  // Android adaptive foreground: 512×512 with alpha so OEM mask applies.
  await svgToPng(androidForegroundSvg, 'android-icon-foreground.png', {
    size: 512,
    flatten: false,
  });
  // Splash: 1024×1024 transparent — Expo pads with splash.backgroundColor.
  await svgToPng(splashSvg, 'splash-icon.png', { size: 1024, flatten: false });
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
