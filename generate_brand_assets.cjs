// generate_brand_assets.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Brand Colors
const GOLD_LIGHT = '#FDE68A';
const GOLD_PRIMARY = '#F59E0B';
const GOLD_RICH = '#D97706';
const GOLD_DARK = '#92400E';
const GOLD_DEEP = '#78350F';
const CHARCOAL_DARK = '#090A0D';
const CHARCOAL_CARD = '#121419';

// Mathematical Star generation
function getStarPoints(cx, cy, outerR, innerR, points = 6, startAngleDeg = -90) {
  const pts = [];
  const step = (Math.PI * 2) / (points * 2);
  let angle = (startAngleDeg * Math.PI) / 180;
  
  for (let i = 0; i < points * 2; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      isOuter: (i % 2 === 0),
      angle: angle
    });
    angle += step;
  }
  return pts;
}

// Generate Faceted Star SVG Paths (gives clean metallic 3D vector shading)
function generateFacetedStar(cx, cy, outerR, innerR, points = 6, startAngleDeg = -90) {
  const pts = getStarPoints(cx, cy, outerR, innerR, points, startAngleDeg);
  let svg = '';
  
  const finials = [];
  const ballRadius = outerR * 0.13;

  // Faceted triangles: from center (cx, cy) to inner and outer points
  for (let i = 0; i < pts.length; i++) {
    const pCurrent = pts[i];
    const pNext = pts[(i + 1) % pts.length];
    
    const isLit = (i % 2 === 0);
    const fill = isLit ? 'url(#goldFacetLit)' : 'url(#goldFacetDark)';
    
    svg += `    <polygon points="${cx},${cy} ${pCurrent.x.toFixed(2)},${pCurrent.y.toFixed(2)} ${pNext.x.toFixed(2)},${pNext.y.toFixed(2)}" fill="${fill}" />\n`;
    
    if (pCurrent.isOuter) {
      finials.push(pCurrent);
    }
  }
  
  // Outer subtle star border outline
  const outerPolygonPts = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  svg += `    <polygon points="${outerPolygonPts}" fill="none" stroke="url(#goldBorderStroke)" stroke-width="2" />\n`;

  // Ball finials
  svg += '    <!-- Ball finials -->\n';
  for (const f of finials) {
    svg += `    <circle cx="${f.x.toFixed(2)}" cy="${f.y.toFixed(2)}" r="${ballRadius.toFixed(2)}" fill="url(#goldSphere)" filter="url(#dropShadowSoft)" />\n`;
    svg += `    <circle cx="${(f.x - ballRadius*0.22).toFixed(2)}" cy="${(f.y - ballRadius*0.25).toFixed(2)}" r="${(ballRadius*0.35).toFixed(2)}" fill="#FFFBEB" opacity="0.85" />\n`;
  }
  
  return { svg, finials };
}

// Cowboy Hat vector paths (customized, stylish western cowboy hat)
function generateCowboyHat(cx, topY, width, height, tiltDeg = -4) {
  const crownW = width * 0.54;
  const crownH = height * 0.62;
  const brimW = width;
  
  return `
    <!-- Cowboy Hat Group -->
    <g id="cowboy-hat" transform="rotate(${tiltDeg} ${cx} ${topY + height*0.7})" filter="url(#dropShadowHard)">
      <!-- Hat Crown -->
      <path d="
        M ${cx - crownW*0.48} ${topY + crownH*0.75}
        C ${cx - crownW*0.46} ${topY + crownH*0.22}, ${cx - crownW*0.34} ${topY + 6}, ${cx - crownW*0.16} ${topY + 12}
        C ${cx - crownW*0.06} ${topY + 18}, ${cx + crownW*0.06} ${topY + 18}, ${cx + crownW*0.16} ${topY + 12}
        C ${cx + crownW*0.34} ${topY + 6}, ${cx + crownW*0.46} ${topY + crownH*0.22}, ${cx + crownW*0.48} ${topY + crownH*0.75}
        Z"
        fill="url(#goldCrownGradient)"
        stroke="url(#goldBorderStroke)"
        stroke-width="3"
      />
      
      <!-- Crown Cattleman Pinch Crease -->
      <path d="
        M ${cx - crownW*0.12} ${topY + 14}
        C ${cx - crownW*0.06} ${topY + crownH*0.45}, ${cx - crownW*0.04} ${topY + crownH*0.62}, ${cx} ${topY + crownH*0.72}
        C ${cx + crownW*0.04} ${topY + crownH*0.62}, ${cx + crownW*0.06} ${topY + crownH*0.45}, ${cx + crownW*0.12} ${topY + 14}
        C ${cx + crownW*0.06} ${topY + 20}, ${cx - crownW*0.06} ${topY + 20}, ${cx - crownW*0.12} ${topY + 14}
        Z"
        fill="url(#crownCreaseShadow)"
        opacity="0.8"
      />

      <!-- Crown Left/Right Dimple Creases -->
      <path d="
        M ${cx - crownW*0.35} ${topY + crownH*0.35}
        Q ${cx - crownW*0.22} ${topY + crownH*0.5}, ${cx - crownW*0.25} ${topY + crownH*0.7}
      " fill="none" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" opacity="0.4" />
      <path d="
        M ${cx + crownW*0.35} ${topY + crownH*0.35}
        Q ${cx + crownW*0.22} ${topY + crownH*0.5}, ${cx + crownW*0.25} ${topY + crownH*0.7}
      " fill="none" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" opacity="0.4" />
      
      <!-- Hat Band (Dark Leather with Gold Stitch/Buckle) -->
      <path d="
        M ${cx - crownW*0.49} ${topY + crownH*0.72}
        C ${cx - crownW*0.25} ${topY + crownH*0.82}, ${cx + crownW*0.25} ${topY + crownH*0.82}, ${cx + crownW*0.49} ${topY + crownH*0.72}
        L ${cx + crownW*0.50} ${topY + crownH*0.84}
        C ${cx + crownW*0.25} ${topY + crownH*0.94}, ${cx - crownW*0.25} ${topY + crownH*0.94}, ${cx - crownW*0.50} ${topY + crownH*0.84}
        Z"
        fill="#14161C"
        stroke="url(#goldBorderStroke)"
        stroke-width="1.5"
      />
      <!-- Mini Buckle -->
      <rect x="${cx - crownW*0.14}" y="${topY + crownH*0.74}" width="${crownW*0.28}" height="${crownH*0.13}" rx="2" fill="none" stroke="#FDE68A" stroke-width="1.5" />
      
      <!-- Hat Brim (Curved Western Upturned Brim) -->
      <path d="
        M ${cx - brimW*0.5} ${topY + crownH*0.68}
        C ${cx - brimW*0.36} ${topY + crownH*0.42}, ${cx - brimW*0.26} ${topY + crownH*0.86}, ${cx} ${topY + crownH*0.96}
        C ${cx + brimW*0.26} ${topY + crownH*0.86}, ${cx + brimW*0.36} ${topY + crownH*0.42}, ${cx + brimW*0.5} ${topY + crownH*0.68}
        C ${cx + brimW*0.44} ${topY + crownH*1.22}, ${cx + brimW*0.25} ${topY + crownH*1.32}, ${cx} ${topY + crownH*1.32}
        C ${cx - brimW*0.25} ${topY + crownH*1.32}, ${cx - brimW*0.44} ${topY + crownH*1.22}, ${cx - brimW*0.5} ${topY + crownH*0.68}
        Z"
        fill="url(#goldBrimGradient)"
        stroke="url(#goldBorderStroke)"
        stroke-width="3"
      />

      <!-- Brim Inner Rolled Edge Highlight -->
      <path d="
        M ${cx - brimW*0.46} ${topY + crownH*0.72}
        C ${cx - brimW*0.24} ${topY + crownH*1.26}, ${cx + brimW*0.24} ${topY + crownH*1.26}, ${cx + brimW*0.46} ${topY + crownH*0.72}
      "
      fill="none"
      stroke="#FFFBEB"
      stroke-width="2.5"
      opacity="0.85"
      />
    </g>
  `;
}

// Bitcoin Monogram
function generateBitcoinMonogram(cx, cy, size) {
  const scale = size / 100;
  return `
    <!-- Bitcoin Monogram Group -->
    <g id="bitcoin-monogram" transform="translate(${cx}, ${cy}) scale(${scale})">
      <!-- Outer Medallion Plate -->
      <circle cx="0" cy="0" r="54" fill="url(#discGradient)" stroke="url(#goldBorderStroke)" stroke-width="3" filter="url(#dropShadowSoft)" />
      
      <!-- Inner circular engraved groove -->
      <circle cx="0" cy="0" r="48" fill="none" stroke="#F59E0B" stroke-opacity="0.25" stroke-dasharray="3 3" stroke-width="1.5" />

      <!-- Top and Bottom vertical ticks -->
      <path d="
        M -6 -48 L 6 -48 L 6 -32 L -6 -32 Z
        M 14 -48 L 26 -48 L 26 -32 L 14 -32 Z
        M -6 32 L 6 32 L 6 48 L -6 48 Z
        M 14 32 L 26 32 L 26 48 L 14 48 Z
      " fill="url(#goldTextGradient)" filter="url(#dropShadowMark)" />

      <!-- Main Body of 'B' -->
      <path d="
        M -26 -32
        L 18 -32
        C 29 -32, 38 -24, 38 -14
        C 38 -5, 30 1, 22 2
        C 32 3, 42 12, 42 22
        C 42 33, 31 40, 16 40
        L -26 40
        L -26 28
        L -14 28
        L -14 -20
        L -26 -20
        Z
        M 0 -21
        L 15 -21
        C 21 -21, 26 -18, 26 -14
        C 26 -9, 21 -6, 15 -6
        L 0 -6
        Z
        M 0 5
        L 17 5
        C 24 5, 29 9, 29 15
        C 29 21, 24 25, 17 25
        L 0 25
        Z
      " fill="url(#goldTextGradient)" fill-rule="evenodd" filter="url(#dropShadowMark)" />

      <!-- Bevel Highlights on 'B' -->
      <path d="
        M -13 -19 L 13 -19 C 18 -19, 23 -16, 23 -14
      " fill="none" stroke="#FFFDF0" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
      <path d="
        M -13 7 L 15 7 C 21 7, 26 10, 26 15
      " fill="none" stroke="#FFFDF0" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
    </g>
  `;
}

// Common Gradients and Filters
function getCommonDefs() {
  return `
    <defs>
      <!-- Gold Facet Gradients -->
      <linearGradient id="goldFacetLit" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF3B0" />
        <stop offset="35%" stop-color="#FBBF24" />
        <stop offset="70%" stop-color="#D97706" />
        <stop offset="100%" stop-color="#B45309" />
      </linearGradient>
      
      <linearGradient id="goldFacetDark" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#78350F" />
        <stop offset="45%" stop-color="#92400E" />
        <stop offset="85%" stop-color="#B45309" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>

      <!-- Spherical Ball Finials -->
      <radialGradient id="goldSphere" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFFBEB" />
        <stop offset="25%" stop-color="#FDE68A" />
        <stop offset="60%" stop-color="#F59E0B" />
        <stop offset="85%" stop-color="#B45309" />
        <stop offset="100%" stop-color="#78350F" />
      </radialGradient>
      
      <!-- Cowboy Hat Gradients -->
      <linearGradient id="goldCrownGradient" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stop-color="#FFF0A0" />
        <stop offset="25%" stop-color="#F59E0B" />
        <stop offset="70%" stop-color="#B45309" />
        <stop offset="100%" stop-color="#78350F" />
      </linearGradient>

      <linearGradient id="goldBrimGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#B45309" />
        <stop offset="15%" stop-color="#FDE68A" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="85%" stop-color="#FDE68A" />
        <stop offset="100%" stop-color="#92400E" />
      </linearGradient>

      <linearGradient id="goldBorderStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF0A0" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#78350F" />
      </linearGradient>

      <linearGradient id="crownCreaseShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#451A03" />
        <stop offset="100%" stop-color="#78350F" />
      </linearGradient>

      <radialGradient id="discGradient" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#222631" />
        <stop offset="65%" stop-color="#111318" />
        <stop offset="100%" stop-color="#08090C" />
      </radialGradient>

      <linearGradient id="goldTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF5C0" />
        <stop offset="35%" stop-color="#FBBF24" />
        <stop offset="75%" stop-color="#D97706" />
        <stop offset="100%" stop-color="#92400E" />
      </linearGradient>

      <!-- Card Backgrounds -->
      <radialGradient id="cardGlow" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#222735" stop-opacity="0.95" />
        <stop offset="55%" stop-color="#12141A" stop-opacity="0.98" />
        <stop offset="100%" stop-color="#08090C" stop-opacity="1" />
      </radialGradient>

      <linearGradient id="cardRimStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.75" />
        <stop offset="50%" stop-color="#78350F" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.4" />
      </linearGradient>

      <!-- Drop Shadows & Filters -->
      <filter id="dropShadowSoft" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.55" />
      </filter>

      <filter id="dropShadowHard" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.75" />
      </filter>

      <filter id="dropShadowMark" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
      </filter>

      <filter id="ambientGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="14" />
        <feOffset dx="0" dy="0" />
        <feComponentTransfer><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;
}

// 1. App Icon (Square Squircle 512x512)
// Hat snugly resting on the Bitcoin symbol & star!
function generateIconSvg() {
  const cx = 256;
  const cy = 296;
  const starRadius = 136;
  const innerStarRadius = 76;
  
  const star = generateFacetedStar(cx, cy, starRadius, innerStarRadius, 6, -90);
  // Hat perched directly atop Bitcoin medallion
  const hat = generateCowboyHat(cx + 2, 126, 192, 128, -4);
  const btc = generateBitcoinMonogram(cx, cy, 98);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  ${getCommonDefs()}
  
  <!-- Outer Rounded Squircle Base -->
  <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#cardGlow)" />
  <rect x="20" y="20" width="472" height="472" rx="112" stroke="url(#cardRimStroke)" stroke-width="3.5" />
  
  <!-- Subtle Inner Border Accent -->
  <rect x="30" y="30" width="452" height="452" rx="102" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5" />

  <!-- Badge Emblem Group -->
  <g id="badge-emblem" filter="url(#ambientGoldGlow)">
    <!-- Star Group -->
    <g id="sheriff-star" filter="url(#dropShadowHard)">
${star.svg}
    </g>

    <!-- Bitcoin Monogram -->
${btc}

    <!-- Cowboy Hat perched on top of B -->
${hat}
  </g>
</svg>
`;
}

// 2. Full Horizontal Brand Logo (Dark Mode Presentation with container/canvas: 720x200)
function generateHorizontalLogoDarkSvg() {
  const cx = 100;
  const cy = 114;
  const starRadius = 58;
  const innerStarRadius = 32;

  const star = generateFacetedStar(cx, cy, starRadius, innerStarRadius, 6, -90);
  const hat = generateCowboyHat(cx + 1, 40, 82, 54, -4);
  const btc = generateBitcoinMonogram(cx, cy, 42);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200" fill="none">
  ${getCommonDefs()}

  <!-- Dark Background Canvas -->
  <rect width="720" height="200" rx="24" fill="#08090C" />
  <rect width="720" height="200" rx="24" stroke="#1E222D" stroke-width="2" />

  <!-- Icon Squircle Tile -->
  <rect x="20" y="20" width="160" height="160" rx="38" fill="url(#cardGlow)" stroke="url(#cardRimStroke)" stroke-width="2" />
  <rect x="26" y="26" width="148" height="148" rx="32" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1" />

  <!-- Emblem -->
  <g id="brand-mark">
    <g id="sheriff-star" filter="url(#dropShadowSoft)">
${star.svg}
    </g>
${btc}
${hat}
  </g>

  <!-- Typography: Clean, Modern, Geometric Sans-Serif -->
  <text
    x="210"
    y="98"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="64"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="212"
    y="154"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="52"
    font-weight="700"
    letter-spacing="-0.03em"
    fill="#F59E0B"
  >crypto <tspan fill="#F3F4F6" font-weight="600">show</tspan></text>
</svg>
`;
}

// 3. Clean Header Logo (Transparent background, perfect for navbars & headers: 520x130)
function generateNavbarLogoSvg() {
  const cx = 58;
  const cy = 74;
  const starRadius = 40;
  const innerStarRadius = 22;

  const star = generateFacetedStar(cx, cy, starRadius, innerStarRadius, 6, -90);
  const hat = generateCowboyHat(cx + 1, 23, 58, 38, -4);
  const btc = generateBitcoinMonogram(cx, cy, 29);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 130" width="460" height="130" fill="none">
  ${getCommonDefs()}

  <!-- Standalone Transparent Mark -->
  <g id="brand-mark" filter="url(#dropShadowSoft)">
    <g id="sheriff-star">
${star.svg}
    </g>
${btc}
${hat}
  </g>

  <!-- Typography: Pure White + Gold Accent -->
  <text
    x="122"
    y="66"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="46"
    font-weight="900"
    letter-spacing="-0.035em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="124"
    y="108"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="36"
    font-weight="700"
    letter-spacing="-0.025em"
    fill="#F59E0B"
  >crypto <tspan fill="#FFFFFF" font-weight="600">show</tspan></text>
</svg>
`;
}

// 4. Light Mode Logo (For light paper/docs/light theme: 720x200)
function generateHorizontalLogoLightSvg() {
  const cx = 100;
  const cy = 114;
  const starRadius = 58;
  const innerStarRadius = 32;

  const star = generateFacetedStar(cx, cy, starRadius, innerStarRadius, 6, -90);
  const hat = generateCowboyHat(cx + 1, 40, 82, 54, -4);
  const btc = generateBitcoinMonogram(cx, cy, 42);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200" fill="none">
  ${getCommonDefs()}

  <!-- Light Background Canvas -->
  <rect width="720" height="200" rx="24" fill="#F8FAFC" />
  <rect width="720" height="200" rx="24" stroke="#E2E8F0" stroke-width="2" />

  <!-- Icon Squircle Tile -->
  <rect x="20" y="20" width="160" height="160" rx="38" fill="#0F172A" stroke="url(#cardRimStroke)" stroke-width="2" />

  <!-- Emblem -->
  <g id="brand-mark">
    <g id="sheriff-star" filter="url(#dropShadowSoft)">
${star.svg}
    </g>
${btc}
${hat}
  </g>

  <!-- Typography: Dark Slate + Amber -->
  <text
    x="210"
    y="98"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="64"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#0F172A"
  >wildwest</text>

  <text
    x="212"
    y="154"
    font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="52"
    font-weight="700"
    letter-spacing="-0.03em"
    fill="#D97706"
  >crypto <tspan fill="#334155" font-weight="600">show</tspan></text>
</svg>
`;
}

// 5. Favicon (64x64 SVG)
function generateFaviconSvg() {
  const cx = 32;
  const cy = 37;
  const starRadius = 18;
  const innerStarRadius = 10;

  const star = generateFacetedStar(cx, cy, starRadius, innerStarRadius, 6, -90);
  const hat = generateCowboyHat(cx + 1, 14, 26, 17, -4);
  const btc = generateBitcoinMonogram(cx, cy, 13);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  ${getCommonDefs()}
  <rect width="64" height="64" rx="16" fill="#0C0E13" />
  <rect width="64" height="64" rx="16" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.5" />
  <g id="favicon-mark">
${star.svg}
${btc}
${hat}
  </g>
</svg>
`;
}

// Generate files
async function buildAssets() {
  const publicDir = path.join(__dirname, 'public');
  
  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'wildwest_icon.svg'), generateIconSvg());
  fs.writeFileSync(path.join(publicDir, 'wildwest_logo.svg'), generateHorizontalLogoDarkSvg());
  fs.writeFileSync(path.join(publicDir, 'wildwest_header_logo.svg'), generateNavbarLogoSvg());
  fs.writeFileSync(path.join(publicDir, 'wildwest_logo_light.svg'), generateHorizontalLogoLightSvg());
  fs.writeFileSync(path.join(publicDir, 'wildwest_favicon.svg'), generateFaviconSvg());

  console.log('SVGs generated. Now rendering PNGs via sharp...');

  // High-Resolution PNGs
  await sharp(path.join(publicDir, 'wildwest_icon.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'wildwest_icon.png'));

  await sharp(path.join(publicDir, 'wildwest_icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(publicDir, 'wildwest_icon_1024.png'));

  await sharp(path.join(publicDir, 'wildwest_logo.svg'))
    .resize(1440, 400)
    .png()
    .toFile(path.join(publicDir, 'wildwest_logo.png'));

  await sharp(path.join(publicDir, 'wildwest_header_logo.svg'))
    .resize(920, 260)
    .png()
    .toFile(path.join(publicDir, 'wildwest_header_logo.png'));

  await sharp(path.join(publicDir, 'wildwest_logo_light.svg'))
    .resize(1440, 400)
    .png()
    .toFile(path.join(publicDir, 'wildwest_logo_light.png'));

  await sharp(path.join(publicDir, 'wildwest_favicon.svg'))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(path.join(publicDir, 'wildwest_favicon.svg'))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  console.log('All SVG and PNG assets successfully built!');
}

buildAssets().catch(console.error);
