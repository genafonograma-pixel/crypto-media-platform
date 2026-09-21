#!/usr/bin/env node
/**
 * create_pixel_art_logos.cjs  v4
 * - Renders on a dark bg to correctly trim, then composites transparent final
 * - Three-color text: "WILD WEST" white, "CRYPTO" orange, "SHOW" muted cream
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MARK_PATH = path.join(__dirname, 'public/wildwest_mark_trimmed.png');
const OUT_DIR   = path.join(__dirname, 'public');

const ORANGE = '#F4A917';
const WHITE  = '#FFFFFF';
const CREAM  = '#B8A890';
const DARK   = '#1A0F00';

async function makeNavbarLogo() {
  const H = 96;
  const markH = H - 8;

  const markBuf = await sharp(MARK_PATH)
    .resize({ height: markH, fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png()
    .toBuffer();
  const markMeta = await sharp(markBuf).metadata();
  const markW = markMeta.width;

  const GAP = 14;
  const textX = markW + GAP;

  const FS1 = 32;
  const FS2 = 19;
  const LS1 = 1;
  const LS2 = 3;

  const LINE_GAP = 7;
  const blockH = FS1 + LINE_GAP + FS2;
  const baseY = Math.floor((H - blockH) / 2);
  const y1 = baseY + FS1;
  const y2 = y1 + LINE_GAP + FS2;

  // Estimate CRYPTO width to place SHOW correctly
  const charW2 = FS2 * 0.55;
  const cryptoW = 'CRYPTO'.length * charW2 + ('CRYPTO'.length - 1) * LS2;
  const showX = textX + Math.ceil(cryptoW) + Math.ceil(charW2 * 0.7);

  // Estimate full text width to know where to end the canvas
  const showW = 'SHOW'.length * charW2 + ('SHOW'.length - 1) * LS2;
  const wildwestW = 'WILD WEST'.length * (FS1 * 0.55) + ('WILD WEST'.length - 1) * LS1;
  const maxTextRight = textX + Math.max(wildwestW, cryptoW + charW2 * 0.7 + showW) + 16;
  const CANVAS_W = Math.ceil(maxTextRight) + 10;

  const svgText = Buffer.from(`<svg width="${CANVAS_W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${textX}" y="${y1}"
    font-family="Impact, 'Arial Black', Haettenschweiler, sans-serif"
    font-size="${FS1}" font-weight="900" fill="${WHITE}" letter-spacing="${LS1}">WILD WEST</text>
  <text x="${textX}" y="${y2}"
    font-family="Impact, 'Arial Black', Haettenschweiler, sans-serif"
    font-size="${FS2}" font-weight="900" fill="${ORANGE}" letter-spacing="${LS2}">CRYPTO</text>
  <text x="${showX}" y="${y2}"
    font-family="Impact, 'Arial Black', Haettenschweiler, sans-serif"
    font-size="${FS2}" font-weight="900" fill="${CREAM}" letter-spacing="${LS2}">SHOW</text>
</svg>`);

  // Composite onto TRANSPARENT canvas
  const finalBuf = await sharp({
    create: { width: CANVAS_W, height: H, channels: 4, background: { r:0,g:0,b:0,alpha:0 } }
  })
  .composite([
    { input: markBuf, left: 0, top: Math.floor((H - markH) / 2) },
    { input: svgText, left: 0, top: 0 }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(OUT_DIR, 'wildwest_logo.png'), finalBuf);
  console.log(`✓ wildwest_logo.png  (${CANVAS_W}×${H})`);
  return { totalW: CANVAS_W, H };
}

async function makeAppIcon() {
  const SIZE = 512;
  const PADDING = 44;
  const MARK_SIZE = SIZE - PADDING * 2;

  const markBuf = await sharp(MARK_PATH)
    .resize({ width: MARK_SIZE, height: MARK_SIZE, fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png()
    .toBuffer();
  const markMeta = await sharp(markBuf).metadata();
  const left = Math.floor((SIZE - markMeta.width) / 2);
  const top  = Math.floor((SIZE - markMeta.height) / 2);

  const R = 112;
  const bgSvg = Buffer.from(`<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SIZE}" height="${SIZE}" rx="${R}" ry="${R}" fill="${DARK}"/>
  <radialGradient id="vig" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="#3D2200" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
  </radialGradient>
  <rect width="${SIZE}" height="${SIZE}" rx="${R}" ry="${R}" fill="url(#vig)"/>
</svg>`);

  const result = await sharp(bgSvg)
    .composite([{ input: markBuf, left, top }])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(OUT_DIR, 'wildwest_icon.png'), result);
  console.log(`✓ wildwest_icon.png  (512×512)`);

  const favicon = await sharp(result).resize(64, 64).png().toBuffer();
  fs.writeFileSync(path.join(OUT_DIR, 'favicon.png'), favicon);
  console.log(`✓ favicon.png  (64×64)`);
}

async function makeSvgWrappers(logoW, logoH) {
  const logoPng = fs.readFileSync(path.join(OUT_DIR, 'wildwest_logo.png'));
  const logoB64 = logoPng.toString('base64');
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${logoW} ${logoH}" width="${logoW}" height="${logoH}">
  <image href="data:image/png;base64,${logoB64}" width="${logoW}" height="${logoH}"/>
</svg>`;
  ['wildwest_logo.svg', 'wildwest_logo_light.svg', 'crypton_logo.svg'].forEach(f => {
    fs.writeFileSync(path.join(OUT_DIR, f), logoSvg);
  });
  console.log(`✓ SVG wrappers written (${logoW}×${logoH})`);

  const iconPng = fs.readFileSync(path.join(OUT_DIR, 'wildwest_icon.png'));
  const iconB64 = iconPng.toString('base64');
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${iconB64}" width="512" height="512"/>
</svg>`;
  fs.writeFileSync(path.join(OUT_DIR, 'wildwest_icon.svg'), iconSvg);
}

(async () => {
  console.log('Generating Wild West pixel art logos v4…\n');
  try {
    const { totalW, H } = await makeNavbarLogo();
    await makeAppIcon();
    await makeSvgWrappers(totalW, H);
    console.log('\n✅ Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
