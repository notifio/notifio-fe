// Generate Expo app icons from the Notifio SVG mark.
//
// Apple HIG (iOS) — https://developer.apple.com/design/human-interface-guidelines/app-icons:
//   • 1024×1024 PNG, RGB (no alpha), full-bleed square. Apple applies the
//     rounded-rect mask on the springboard, so we DON'T draw rounded corners
//     into the artwork; that gets clipped at smaller sizes anyway.
//   • Solid background — translucent icons render with iOS's white default
//     fill, which makes the mark unreadable.
//
// Android adaptive icons — https://developer.android.com/develop/ui/views/launch/icon_design_adaptive:
//   • Foreground PNG: 432dp safe inner area on a 108×108dp asset, exported
//     at xxxhdpi as 512×512 PNG. Outer 33% gets clipped by the OEM mask, so
//     we scale the artwork to ~66% of the canvas to keep it visible across
//     circular / squircle / teardrop masks.
//   • Background can be a solid color (set in `expo.android.adaptiveIcon
//     .backgroundColor` in app.json) — no PNG needed.
//
// Splash icon — Expo's contain-resize splash uses the icon centered on a
// solid background colour. We export it on a transparent canvas at 1024×1024
// so the splash plugin pads it according to its own backgroundColor field.
//
// Run: node scripts/generate-icons.mjs
//
// Sharp ships transitively via Next.js, so no new dep is added.

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

// SVG used for the iOS full-bleed icon (1024×1024). Square — no rx — so the
// navy fills every pixel; Apple rounds it on render. The decorative map
// lines are kept at the same 0.10 opacity as the web Logo for parity.
const iosSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${BRAND.navy}"/>
  <g stroke="${BRAND.orange}" stroke-width="6" opacity="0.1" fill="none">
    <path d="M100 300 L900 300"/>
    <path d="M200 100 L800 900"/>
    <path d="M100 700 L900 500"/>
    <path d="M300 100 L300 900"/>
    <path d="M700 100 L700 900"/>
    <path d="M100 500 L900 800"/>
  </g>
  <path d="M300 750 V250 L750 750 V250"
        stroke="${BRAND.orange}"
        stroke-width="140"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;

// Android adaptive foreground (512×512). Transparent canvas, mark scaled to
// ~66% of the visible area so it sits comfortably inside any OEM mask.
// The N is shifted into a 512-unit box centered with ~104px of padding on
// each side — that puts the artwork inside the inner 264dp safe region.
const androidForegroundSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M180 358 V154 L332 358 V154"
        stroke="${BRAND.orange}"
        stroke-width="56"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;

// Splash icon (1024×1024). Transparent background; Expo's splash plugin
// fills the screen with `splash.backgroundColor` and centers the icon.
const splashSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <path d="M362 716 V308 L662 716 V308"
        stroke="${BRAND.orange}"
        stroke-width="112"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;

async function svgToPng(svg, outName, { size, flatten = true, bg = BRAND.navy } = {}) {
  const buf = Buffer.from(svg);
  // Render the SVG at high density first so curves stay smooth, then
  // downscale to the target pixel dimensions sharp's PNG encoder needs.
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
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
