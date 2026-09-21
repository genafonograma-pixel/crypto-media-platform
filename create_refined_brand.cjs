// create_refined_brand.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, 'public', 'refined_brand');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Exact 5-point star mathematical coordinates
// Center: (0, 0)
// Outer Radius R = 150, Inner Radius r = 68
function getSheriffStarPoints(R = 150, r = 68) {
  const points = [];
  // 5 tips at: -90°, -18°, 54°, 126°, 198°
  // 5 valleys at: -54°, 18°, 90°, 162°, 234°
  for (let i = 0; i < 10; i++) {
    const angleDeg = -90 + i * 36;
    const rad = (angleDeg * Math.PI) / 180;
    const radius = (i % 2 === 0) ? R : r;
    points.push({
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
      isOuter: (i % 2 === 0),
      angleDeg
    });
  }
  return points;
}

function generateStarSvg(R = 148, r = 68) {
  const pts = getSheriffStarPoints(R, r);
  let svg = '';
  
  // Faceted 3D shading
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const isLit = (i % 2 === 0);
    const fill = isLit ? 'url(#starFacetLit)' : 'url(#starFacetDark)';
    svg += `      <polygon points="0,0 ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}" fill="${fill}" />\n`;
  }

  // Outer rim
  const polyString = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  svg += `      <polygon points="${polyString}" fill="none" stroke="#784112" stroke-width="2.5" stroke-linejoin="round" />\n`;

  // Ball finials on the 5 outer tips
  const ballRadius = R * 0.115;
  for (const p of pts.filter(p => p.isOuter)) {
    svg += `      <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${ballRadius.toFixed(2)}" fill="url(#sphereGrad)" filter="url(#dropShadowBall)" />\n`;
    svg += `      <circle cx="${(p.x - ballRadius*0.25).toFixed(2)}" cy="${(p.y - ballRadius*0.25).toFixed(2)}" r="${(ballRadius*0.35).toFixed(2)}" fill="#FFFBEB" opacity="0.9" />\n`;
  }
  
  return svg;
}

// Generate the Bitcoin 'B' perfectly centered at (0, 8)
function generateBitcoinSvg() {
  return `
    <g id="bitcoin-symbol" filter="url(#dropShadowBtc)">
      <!-- Top Double Vertical Hashes -->
      <rect x="-17" y="-96" width="13" height="30" rx="3.5" fill="url(#btcGrad)" stroke="url(#btcOutline)" stroke-width="3" />
      <rect x="13" y="-96" width="13" height="30" rx="3.5" fill="url(#btcGrad)" stroke="url(#btcOutline)" stroke-width="3" />

      <!-- Bottom Double Vertical Hashes -->
      <rect x="-17" y="78" width="13" height="30" rx="3.5" fill="url(#btcGrad)" stroke="url(#btcOutline)" stroke-width="3" />
      <rect x="13" y="78" width="13" height="30" rx="3.5" fill="url(#btcGrad)" stroke="url(#btcOutline)" stroke-width="3" />

      <!-- Main 'B' Body (Balanced, centered at x=0, y=5) -->
      <!-- Width: ~140, Height: ~160 -->
      <path d="
        M -50 -74
        L 22 -74
        C 55 -74, 76 -54, 76 -28
        C 76 -6, 60 8, 38 14
        C 65 20, 82 42, 82 72
        C 82 104, 56 122, 18 122
        L -50 122
        L -50 92
        L -22 92
        L -22 -44
        L -50 -44
        Z
        M 8 -44
        L 22 -44
        C 36 -44, 46 -37, 46 -28
        C 46 -19, 36 -12, 22 -12
        L 8 -12
        Z
        M 8 16
        L 24 16
        C 39 16, 49 25, 49 37
        C 49 49, 39 58, 24 58
        L 8 58
        Z
      " fill="url(#btcGrad)" fill-rule="evenodd" stroke="url(#btcOutline)" stroke-width="4.5" />

      <!-- Crisp Inner Highlight Strokes -->
      <path d="M -20 -42 L 20 -42 C 42 -42, 60 -26, 60 -28" fill="none" stroke="#FFF7E0" stroke-width="2.5" opacity="0.65" stroke-linecap="round" />
      <path d="M -20 18 L 22 18 C 50 18, 66 38, 66 65" fill="none" stroke="#FFF7E0" stroke-width="2.5" opacity="0.65" stroke-linecap="round" />
    </g>
  `;
}

// Cowboy Hat perched directly on top arch of 'B'
function generateHatSvg() {
  // Center of hat perched around (2, -82) with -7deg tilt
  return `
    <g id="cowboy-hat" transform="translate(2, -80) rotate(-7)" filter="url(#dropShadowHat)">
      <!-- Hat Crown -->
      <path d="
        M -46 16
        C -44 -20, -34 -48, -16 -44
        C -6 -40, -2 -28, 0 -28
        C 2 -28, 6 -40, 16 -44
        C 34 -48, 44 -20, 46 16
        Z
      " fill="url(#hatCrownGrad)" stroke="url(#btcOutline)" stroke-width="3.5" />

      <!-- Center Cattleman Pinch Crease -->
      <path d="
        M -10 -42
        C -3 -24, -1 -4, 0 6
        C 1 -4, 3 -24, 10 -42
        Z
      " fill="#3D1D04" opacity="0.85" />

      <!-- Dimples -->
      <path d="M -28 -24 Q -16 -8, -22 12" fill="none" stroke="#683408" stroke-width="3" stroke-linecap="round" opacity="0.5" />
      <path d="M 28 -24 Q 16 -8, 22 12" fill="none" stroke="#683408" stroke-width="3" stroke-linecap="round" opacity="0.5" />

      <!-- Hat Band -->
      <path d="
        M -47 12
        Q 0 22 47 12
        L 48 21
        Q 0 31 -48 21
        Z
      " fill="#18110B" stroke="#4D2706" stroke-width="1.5" />
      <rect x="-8" y="13" width="16" height="11" rx="2" fill="none" stroke="#FCE5B2" stroke-width="2" />

      <!-- Hat Brim (Curved Western Upturned Profile) -->
      <path d="
        M -94 12
        C -60 -12, -45 26, 0 26
        C 45 26, 60 -12, 94 12
        C 72 42, 36 46, 0 46
        C -36 46, -72 42, -94 12
        Z
      " fill="url(#hatBrimGrad)" stroke="url(#btcOutline)" stroke-width="4" />

      <!-- Brim Rolled Edge Highlight -->
      <path d="
        M -88 15
        C -55 -6, -40 28, 0 28
        C 40 28, 55 -6, 88 15
      " fill="none" stroke="#FFF7E0" stroke-width="2.5" opacity="0.85" />
    </g>
  `;
}

// Common Gradients
function getDefs() {
  return `
    <defs>
      <!-- Background: Deep Saddle Leatherette / Charcoal -->
      <radialGradient id="tileBg" cx="50%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#261A14" />
        <stop offset="60%" stop-color="#160F0C" />
        <stop offset="100%" stop-color="#0C0806" />
      </radialGradient>

      <linearGradient id="tileBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#99602E" stop-opacity="0.7" />
        <stop offset="50%" stop-color="#47260D" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#99602E" stop-opacity="0.5" />
      </linearGradient>

      <!-- Star Metal -->
      <linearGradient id="starFacetLit" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F2C785" />
        <stop offset="50%" stop-color="#CD9046" />
        <stop offset="100%" stop-color="#A26622" />
      </linearGradient>

      <linearGradient id="starFacetDark" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#5E330B" />
        <stop offset="50%" stop-color="#884E18" />
        <stop offset="100%" stop-color="#B87730" />
      </linearGradient>

      <!-- Bitcoin 'B' -->
      <linearGradient id="btcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE8BE" />
        <stop offset="35%" stop-color="#E8AC56" />
        <stop offset="75%" stop-color="#BD7A2B" />
        <stop offset="100%" stop-color="#8A5114" />
      </linearGradient>

      <linearGradient id="btcOutline" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFEBC4" />
        <stop offset="50%" stop-color="#A2621A" />
        <stop offset="100%" stop-color="#4E2704" />
      </linearGradient>

      <!-- Cowboy Hat -->
      <linearGradient id="hatCrownGrad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#ECC07F" />
        <stop offset="45%" stop-color="#C7873B" />
        <stop offset="100%" stop-color="#7C4813" />
      </linearGradient>

      <linearGradient id="hatBrimGrad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#9E5D1B" />
        <stop offset="20%" stop-color="#F0C788" />
        <stop offset="50%" stop-color="#C7873B" />
        <stop offset="80%" stop-color="#F0C788" />
        <stop offset="100%" stop-color="#9E5D1B" />
      </linearGradient>

      <!-- Sphere Finials -->
      <radialGradient id="sphereGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFF2D6" />
        <stop offset="30%" stop-color="#EAB46C" />
        <stop offset="75%" stop-color="#9E611E" />
        <stop offset="100%" stop-color="#562F07" />
      </radialGradient>

      <!-- Filters -->
      <filter id="dropShadowStar" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
      </filter>

      <filter id="dropShadowBtc" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
      </filter>

      <filter id="dropShadowHat" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.85" />
      </filter>

      <filter id="dropShadowBall" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.75" />
      </filter>
    </defs>
  `;
}

// 1. App Icon (Square Squircle 512x512)
function generateIconSvg(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  ${getDefs()}

  <!-- Squircle Base -->
  <rect x="20" y="20" width="472" height="472" rx="108" fill="url(#tileBg)" stroke="url(#tileBorder)" stroke-width="3.5" />
  <rect x="30" y="30" width="452" height="452" rx="98" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5" />

  <!-- Emblem Group (Center: x=256, y=268) -->
  <g id="brand-mark" transform="translate(256, 268)">
    <g id="star" filter="url(#dropShadowStar)">
${generateStarSvg(146, 68)}
    </g>
${generateBitcoinSvg()}
${generateHatSvg()}
  </g>
</svg>`;
}

// 2. Horizontal Logo on Pure Dark Background (820x220)
function generateLogoDarkSvg(width = 820, height = 220) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 220" width="${width}" height="${height}" fill="none">
  ${getDefs()}

  <!-- Pure Dark Canvas -->
  <rect width="820" height="220" fill="#000000" />

  <!-- App Icon Squircle on Left (x=24, y=20, size=180) -->
  <rect x="24" y="20" width="180" height="180" rx="42" fill="url(#tileBg)" stroke="url(#tileBorder)" stroke-width="2.5" />
  <rect x="30" y="26" width="168" height="168" rx="36" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5" />

  <!-- Scaled Emblem inside squircle (center: 114, 114, scale: 0.47) -->
  <g transform="translate(114, 115) scale(0.47)">
    <g id="star" filter="url(#dropShadowStar)">
${generateStarSvg(146, 68)}
    </g>
${generateBitcoinSvg()}
${generateHatSvg()}
  </g>

  <!-- Typography: Pure Bold Modern Geometric Sans -->
  <!-- Line 1: wildwest -->
  <text
    x="236"
    y="106"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    font-size="78"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <!-- Line 2: crypto show -->
  <text
    x="238"
    y="168"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    font-size="62"
    font-weight="800"
    letter-spacing="-0.03em"
    fill="#FFFFFF"
  >crypto show</text>
</svg>`;
}

// 3. Navbar Logo (Transparent, Horizontal, optimized for site header: 480x120)
function generateNavbarLogoSvg(width = 480, height = 120) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="${width}" height="${height}" fill="none">
  ${getDefs()}

  <!-- Standalone Badge (Center: 60, 64, scale: 0.32) -->
  <g transform="translate(60, 64) scale(0.32)">
    <g id="star" filter="url(#dropShadowStar)">
${generateStarSvg(146, 68)}
    </g>
${generateBitcoinSvg()}
${generateHatSvg()}
  </g>

  <!-- Typography -->
  <text
    x="132"
    y="60"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    font-size="46"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="134"
    y="98"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    font-size="36"
    font-weight="800"
    letter-spacing="-0.03em"
    fill="#FFFFFF"
  >crypto show</text>
</svg>`;
}

async function renderBrand() {
  // SVGs
  fs.writeFileSync(path.join(outputDir, 'wildwest_icon.svg'), generateIconSvg());
  fs.writeFileSync(path.join(outputDir, 'wildwest_logo.svg'), generateLogoDarkSvg());
  fs.writeFileSync(path.join(outputDir, 'wildwest_header_logo.svg'), generateNavbarLogoSvg());

  // PNGs
  await sharp(path.join(outputDir, 'wildwest_icon.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'wildwest_icon.png'));

  await sharp(path.join(outputDir, 'wildwest_icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'wildwest_icon_1024.png'));

  await sharp(path.join(outputDir, 'wildwest_logo.svg'))
    .resize(1640, 440)
    .png()
    .toFile(path.join(outputDir, 'wildwest_logo.png'));

  await sharp(path.join(outputDir, 'wildwest_header_logo.svg'))
    .resize(960, 240)
    .png()
    .toFile(path.join(outputDir, 'wildwest_header_logo.png'));

  await sharp(path.join(outputDir, 'wildwest_icon.svg'))
    .resize(64, 64)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));

  // Also copy directly to public/ so the app can use them immediately
  fs.copyFileSync(path.join(outputDir, 'wildwest_icon.svg'), path.join(__dirname, 'public', 'wildwest_icon.svg'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_icon.png'), path.join(__dirname, 'public', 'wildwest_icon.png'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_logo.svg'), path.join(__dirname, 'public', 'wildwest_logo.svg'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_logo.png'), path.join(__dirname, 'public', 'wildwest_logo.png'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_header_logo.svg'), path.join(__dirname, 'public', 'wildwest_header_logo.svg'));
  fs.copyFileSync(path.join(outputDir, 'favicon.png'), path.join(__dirname, 'public', 'favicon.png'));

  console.log('Production vector brand assets successfully created and copied to public/ !');
}

renderBrand().catch(console.error);
