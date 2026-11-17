// scripts/generate_sport25_brand.cjs
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const sharp = require('sharp');

const BRAND_PURPLE = '#7C4CE5';
const BRAND_WHITE = '#FFFFFF';
const BRAND_DARK = '#0A0A0C';
const BRAND_DARK_SLATE = '#0F172A';

const ttfPath = '/tmp/montserrat.ttf';
if (!fs.existsSync(ttfPath)) {
  console.error('Montserrat font not found at', ttfPath);
  process.exit(1);
}

const font = opentype.parse(fs.readFileSync(ttfPath).buffer);
console.log('Loaded Montserrat Black font successfully.');

// Helper to convert an opentype.Path to SVG path data (d="...")
function pathToD(otPath) {
  return otPath.toPathData(2);
}

// -------------------------------------------------------------
// 1. PRIMARY LOGO: SPORT25 (Horizontal Uppercase)
// -------------------------------------------------------------
function buildPrimaryLogoSvg({
  textColor = BRAND_WHITE,
  numColor = BRAND_PURPLE,
  slant = 0,
  includeDomain = false,
  casing = 'upper'
}) {
  const fontSize = 120;
  const word = casing === 'upper' ? 'SPORT' : 'sport';
  const num = '25';

  // Measure word
  const sportGlyphs = font.stringToGlyphs(word);
  let sportWidth = 0;
  for (let i = 0; i < sportGlyphs.length; i++) {
    const glyph = sportGlyphs[i];
    sportWidth += (glyph.advanceWidth || 0) * (fontSize / font.unitsPerEm);
    if (i < sportGlyphs.length - 1) {
      const kerning = font.getKerningValue(glyph, sportGlyphs[i + 1]);
      sportWidth += kerning * (fontSize / font.unitsPerEm);
    }
  }

  // Gap between word and number
  const gap = 12;

  // Paths
  const sportPath = font.getPath(word, 0, fontSize, fontSize);
  const numPath = font.getPath(num, sportWidth + gap, fontSize, fontSize);

  let domainSvg = '';
  let totalWidth = sportWidth + gap;

  // Measure num width
  const numGlyphs = font.stringToGlyphs(num);
  let numWidth = 0;
  for (let i = 0; i < numGlyphs.length; i++) {
    const glyph = numGlyphs[i];
    numWidth += (glyph.advanceWidth || 0) * (fontSize / font.unitsPerEm);
    if (i < numGlyphs.length - 1) {
      const kerning = font.getKerningValue(glyph, numGlyphs[i + 1]);
      numWidth += kerning * (fontSize / font.unitsPerEm);
    }
  }
  totalWidth += numWidth;

  if (includeDomain) {
    const domainFontSize = 38;
    const domainWord = '.NEWS';
    const domainX = totalWidth + 14;
    const domainY = fontSize - 4;
    const domainPath = font.getPath(domainWord, domainX, domainY, domainFontSize);
    const domainGlyphs = font.stringToGlyphs(domainWord);
    let dWidth = 0;
    for (let i = 0; i < domainGlyphs.length; i++) {
      const glyph = domainGlyphs[i];
      dWidth += (glyph.advanceWidth || 0) * (domainFontSize / font.unitsPerEm);
    }
    totalWidth = domainX + dWidth;
    domainSvg = `<path d="${pathToD(domainPath)}" fill="#94A3B8" />`;
  }

  const paddingX = 20;
  const paddingY = 20;
  const viewBoxWidth = Math.ceil(totalWidth + paddingX * 2);
  const viewBoxHeight = Math.ceil(fontSize + paddingY * 2);

  const transformAttr = slant !== 0 
    ? `transform="translate(${paddingX}, ${paddingY}) skewX(${slant})"` 
    : `transform="translate(${paddingX}, ${paddingY})"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="${viewBoxWidth}" height="${viewBoxHeight}">
  <g ${transformAttr}>
    <path d="${pathToD(sportPath)}" fill="${textColor}" />
    <path d="${pathToD(numPath)}" fill="${numColor}" />
    ${domainSvg}
  </g>
</svg>`;
}

// -------------------------------------------------------------
// 2. WEBSITE ICON: ONLY 25
// -------------------------------------------------------------
function buildIcon25Svg({ color = BRAND_PURPLE, size = 512, withBadge = false }) {
  const fontSize = 340;
  const num = '25';

  const numGlyphs = font.stringToGlyphs(num);
  let numWidth = 0;
  for (let i = 0; i < numGlyphs.length; i++) {
    const glyph = numGlyphs[i];
    numWidth += (glyph.advanceWidth || 0) * (fontSize / font.unitsPerEm);
    if (i < numGlyphs.length - 1) {
      const kerning = font.getKerningValue(glyph, numGlyphs[i + 1]);
      numWidth += kerning * (fontSize / font.unitsPerEm);
    }
  }

  const otPath = font.getPath(num, 0, fontSize, fontSize);
  const bbox = otPath.getBoundingBox();

  const actualWidth = bbox.x2 - bbox.x1;
  const actualHeight = bbox.y2 - bbox.y1;

  // Center inside 'size' x 'size'
  const offsetX = (size - actualWidth) / 2 - bbox.x1;
  const offsetY = (size - actualHeight) / 2 - bbox.y1;

  let badgeMarkup = '';
  if (withBadge) {
    const rx = Math.round(size * 0.22);
    badgeMarkup = `
    <!-- Dark App Squircle Tile -->
    <rect width="${size}" height="${size}" rx="${rx}" fill="${BRAND_DARK}" />
    <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${rx - 2}" stroke="${BRAND_PURPLE}" stroke-opacity="0.25" stroke-width="3" fill="none" />
    <!-- Subtle Ambient Glow -->
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="${BRAND_PURPLE}" fill-opacity="0.12" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${badgeMarkup}
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})">
    <path d="${pathToD(otPath)}" fill="${color}" />
  </g>
</svg>`;
}

// -------------------------------------------------------------
// MAIN GENERATOR
// -------------------------------------------------------------
async function main() {
  const brandingDir = path.join(__dirname, '..', 'public', 'branding', 'sport25');
  const publicDir = path.join(__dirname, '..', 'public');
  fs.mkdirSync(brandingDir, { recursive: true });

  console.log('Generating SVG files...');

  // Option 1: Primary Flagship Uppercase SPORT25
  const primarySvg = buildPrimaryLogoSvg({ textColor: BRAND_WHITE, numColor: BRAND_PURPLE });
  fs.writeFileSync(path.join(brandingDir, 'sport25_logo_primary.svg'), primarySvg);
  fs.writeFileSync(path.join(publicDir, 'sport25_logo.svg'), primarySvg);

  // Option 1 Light: SPORT25 on Light backgrounds (Slate/Black SPORT + Purple 25)
  const primaryLightSvg = buildPrimaryLogoSvg({ textColor: BRAND_DARK_SLATE, numColor: BRAND_PURPLE });
  fs.writeFileSync(path.join(brandingDir, 'sport25_logo_light.svg'), primaryLightSvg);

  // Option 2: Athletic Slanted SPORT25 (Dynamic Speed, -8 deg)
  const slantedSvg = buildPrimaryLogoSvg({ textColor: BRAND_WHITE, numColor: BRAND_PURPLE, slant: -8 });
  fs.writeFileSync(path.join(brandingDir, 'sport25_logo_slanted.svg'), slantedSvg);

  // Option 3: Full Domain SPORT25.news
  const domainSvg = buildPrimaryLogoSvg({ textColor: BRAND_WHITE, numColor: BRAND_PURPLE, includeDomain: true });
  fs.writeFileSync(path.join(brandingDir, 'sport25_logo_domain.svg'), domainSvg);

  // Option 4: Lowercase sport25
  const lowerSvg = buildPrimaryLogoSvg({ textColor: BRAND_WHITE, numColor: BRAND_PURPLE, casing: 'lower' });
  fs.writeFileSync(path.join(brandingDir, 'sport25_logo_lowercase.svg'), lowerSvg);

  // Website Icon: Transparent standalone 25
  const iconSvg = buildIcon25Svg({ color: BRAND_PURPLE, size: 512, withBadge: false });
  fs.writeFileSync(path.join(brandingDir, 'sport25_icon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'sport25_icon.svg'), iconSvg);

  // Website Icon: App Squircle Badge 25
  const iconBadgeSvg = buildIcon25Svg({ color: BRAND_PURPLE, size: 512, withBadge: true });
  fs.writeFileSync(path.join(brandingDir, 'sport25_icon_badge.svg'), iconBadgeSvg);

  console.log('Rasterizing PNG assets with Sharp...');

  // Render PNGs for all variants
  await sharp(Buffer.from(primarySvg)).png().toFile(path.join(brandingDir, 'sport25_logo_primary.png'));
  await sharp(Buffer.from(primarySvg)).png().toFile(path.join(publicDir, 'sport25_logo.png'));

  await sharp(Buffer.from(primaryLightSvg)).png().toFile(path.join(brandingDir, 'sport25_logo_light.png'));
  await sharp(Buffer.from(slantedSvg)).png().toFile(path.join(brandingDir, 'sport25_logo_slanted.png'));
  await sharp(Buffer.from(domainSvg)).png().toFile(path.join(brandingDir, 'sport25_logo_domain.png'));
  await sharp(Buffer.from(lowerSvg)).png().toFile(path.join(brandingDir, 'sport25_logo_lowercase.png'));

  // Render Icon PNGs
  await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(path.join(brandingDir, 'sport25_icon_512.png'));
  await sharp(Buffer.from(iconSvg)).resize(192, 192).png().toFile(path.join(brandingDir, 'sport25_icon_192.png'));
  await sharp(Buffer.from(iconSvg)).resize(32, 32).png().toFile(path.join(brandingDir, 'sport25_icon_32.png'));

  await sharp(Buffer.from(iconBadgeSvg)).resize(512, 512).png().toFile(path.join(brandingDir, 'sport25_icon_badge_512.png'));
  await sharp(Buffer.from(iconBadgeSvg)).resize(180, 180).png().toFile(path.join(brandingDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(iconBadgeSvg)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicons in public/
  await sharp(Buffer.from(iconBadgeSvg)).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(Buffer.from(iconBadgeSvg)).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.png'));
  await sharp(Buffer.from(iconBadgeSvg)).resize(32, 32).toFile(path.join(publicDir, 'favicon.ico'));

  // Update wildwest_logo.svg and wildwest_icon.svg with the new SPORT25 branding
  // so existing code immediately shows the new logo smoothly!
  fs.copyFileSync(path.join(publicDir, 'sport25_logo.svg'), path.join(publicDir, 'wildwest_logo.svg'));
  fs.copyFileSync(path.join(publicDir, 'sport25_logo.png'), path.join(publicDir, 'wildwest_logo.png'));
  fs.copyFileSync(path.join(publicDir, 'sport25_icon.svg'), path.join(publicDir, 'wildwest_icon.svg'));

  console.log('Successfully generated all SPORT25 branding assets!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
