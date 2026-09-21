// create_modern_vector_logos.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, 'public', 'modern_logos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ----------------------------------------------------------------------
// OPTION 1: "The Modern Frontier" - Clean Flat Geometric Mark
// Minimalist, bold, authoritative. Zero plastic bevels, zero AI mush.
// Authentic vector logo design like Coinbase, Linear, Cash App.
// ----------------------------------------------------------------------
function getOption1_Icon(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <!-- Background Tile -->
  <rect width="512" height="512" rx="112" fill="#0A0B0E" />
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#1F242F" stroke-width="3" />

  <!-- Accent ambient ring -->
  <circle cx="256" cy="272" r="176" fill="#F59E0B" fill-opacity="0.03" />

  <g id="mark" transform="translate(256, 272)">
    <!-- 5-Point Modern Sheriff Star Silhouette -->
    <!-- Tips with clean circular nodes -->
    <path d="
      M 0 -130
      L 28 -42
      L 122 -42
      L 46 14
      L 74 104
      L 0 52
      L -74 104
      L -46 14
      L -122 -42
      L -28 -42
      Z
    " fill="#161922" stroke="#E5A93C" stroke-width="6" stroke-linejoin="round" />

    <!-- Ball finials at the 5 star tips -->
    <circle cx="0" cy="-130" r="10" fill="#E5A93C" />
    <circle cx="122" cy="-42" r="10" fill="#E5A93C" />
    <circle cx="74" cy="104" r="10" fill="#E5A93C" />
    <circle cx="-74" cy="104" r="10" fill="#E5A93C" />
    <circle cx="-122" cy="-42" r="10" fill="#E5A93C" />

    <!-- Central Clean Medallion -->
    <circle cx="0" cy="8" r="56" fill="#0E1015" stroke="#E5A93C" stroke-width="4.5" />

    <!-- Minimalist Precision Bitcoin ₿ -->
    <g fill="#E5A93C">
      <!-- Stems -->
      <rect x="-6" y="-36" width="4.5" height="72" rx="2.25" />
      <rect x="7" y="-36" width="4.5" height="72" rx="2.25" />
      <!-- 'B' Main Form -->
      <path d="
        M -18 -24
        L 8 -24
        C 17 -24, 23 -18, 23 -11
        C 23 -5, 18 -1, 12 0
        C 20 1, 26 7, 26 15
        C 26 23, 19 26, 8 26
        L -18 26
        Z
        M -10 -17
        L 7 -17
        C 12 -17, 16 -14, 16 -11
        C 16 -8, 12 -5, 7 -5
        L -10 -5
        Z
        M -10 3
        L 8 3
        C 13 3, 18 6, 18 11
        C 18 16, 13 19, 8 19
        L -10 19
        Z
      " fill-rule="evenodd" />
    </g>

    <!-- Sleek Modern Western Cowboy Hat perched on star & badge -->
    <!-- Minimalist vector styling: clean lines, no cheesy gradients -->
    <g id="hat" transform="translate(0, -96)">
      <!-- Hat Crown -->
      <path d="
        M -34 18
        C -32 -16, -24 -36, -12 -33
        C -4 -30, -2 -22, 0 -22
        C 2 -22, 4 -30, 12 -33
        C 24 -36, 32 -16, 34 18
        Z
      " fill="#E5A93C" stroke="#0E1015" stroke-width="3" />
      
      <!-- Crown Crease Shadow line -->
      <path d="M 0 -22 L 0 6" stroke="#B45309" stroke-width="3" stroke-linecap="round" />

      <!-- Hat Band -->
      <path d="M -34 14 Q 0 20 34 14 L 34 18 Q 0 24 -34 18 Z" fill="#0A0B0E" />

      <!-- Hat Brim (Curved modern upturned profile) -->
      <path d="
        M -72 16
        C -44 -4, -36 24, 0 24
        C 36 24, 44 -4, 72 16
        C 52 30, 24 33, 0 33
        C -24 33, -52 30, -72 16
        Z
      " fill="#E5A93C" stroke="#0E1015" stroke-width="2.5" />
    </g>
  </g>
</svg>`;
}

function getOption1_Logo(width = 720, height = 180) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="${width}" height="${height}" fill="none">
  <!-- Background -->
  <rect width="720" height="180" rx="20" fill="#090A0D" />
  <rect width="720" height="180" rx="20" stroke="#181B23" stroke-width="2" />

  <!-- Scaled Icon on left (centered at x=88, y=90) -->
  <g transform="translate(88, 92) scale(0.48)">
    <!-- 5-Point Modern Sheriff Star -->
    <path d="
      M 0 -130
      L 28 -42
      L 122 -42
      L 46 14
      L 74 104
      L 0 52
      L -74 104
      L -46 14
      L -122 -42
      L -28 -42
      Z
    " fill="#141720" stroke="#E5A93C" stroke-width="7" stroke-linejoin="round" />

    <circle cx="0" cy="-130" r="12" fill="#E5A93C" />
    <circle cx="122" cy="-42" r="12" fill="#E5A93C" />
    <circle cx="74" cy="104" r="12" fill="#E5A93C" />
    <circle cx="-74" cy="104" r="12" fill="#E5A93C" />
    <circle cx="-122" cy="-42" r="12" fill="#E5A93C" />

    <circle cx="0" cy="8" r="56" fill="#0A0B0E" stroke="#E5A93C" stroke-width="5" />

    <g fill="#E5A93C">
      <rect x="-6" y="-36" width="5" height="72" rx="2.5" />
      <rect x="7" y="-36" width="5" height="72" rx="2.5" />
      <path d="
        M -18 -24
        L 8 -24
        C 17 -24, 23 -18, 23 -11
        C 23 -5, 18 -1, 12 0
        C 20 1, 26 7, 26 15
        C 26 23, 19 26, 8 26
        L -18 26
        Z
        M -10 -17
        L 7 -17
        C 12 -17, 16 -14, 16 -11
        C 16 -8, 12 -5, 7 -5
        L -10 -5
        Z
        M -10 3
        L 8 3
        C 13 3, 18 6, 18 11
        C 18 16, 13 19, 8 19
        L -10 19
        Z
      " fill-rule="evenodd" />
    </g>

    <g id="hat" transform="translate(0, -96)">
      <path d="
        M -34 18
        C -32 -16, -24 -36, -12 -33
        C -4 -30, -2 -22, 0 -22
        C 2 -22, 4 -30, 12 -33
        C 24 -36, 32 -16, 34 18
        Z
      " fill="#E5A93C" stroke="#0E1015" stroke-width="3" />
      <path d="M 0 -22 L 0 6" stroke="#B45309" stroke-width="3" stroke-linecap="round" />
      <path d="M -34 14 Q 0 20 34 14 L 34 18 Q 0 24 -34 18 Z" fill="#0A0B0E" />
      <path d="
        M -72 16
        C -44 -4, -36 24, 0 24
        C 36 24, 44 -4, 72 16
        C 52 30, 24 33, 0 33
        C -24 33, -52 30, -72 16
        Z
      " fill="#E5A93C" stroke="#0E1015" stroke-width="2.5" />
    </g>
  </g>

  <!-- Typography: Modern Geometric Sans -->
  <text
    x="184"
    y="88"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="62"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="186"
    y="142"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="46"
    font-weight="700"
    letter-spacing="-0.025em"
    fill="#E5A93C"
  >crypto <tspan fill="#F3F4F6" font-weight="600">show</tspan></text>
</svg>`;
}

// ----------------------------------------------------------------------
// OPTION 2: "The Precision Line-Art Mark"
// Super sleek monoline tech aesthetic (like Apple, Stripe, Teenage Engineering).
// Crisp lines, ultra high readability, pure modern vector beauty.
// ----------------------------------------------------------------------
function getOption2_Icon(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <rect width="512" height="512" rx="112" fill="#08090C" />
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#1A1D26" stroke-width="2" />

  <g id="line-mark" transform="translate(256, 276)">
    <!-- 6-point Star Outline with Precision Ball Tips -->
    <!-- Center (0, 16) -->
    <path d="
      M 0 -130
      L 24 -46
      L 108 -46
      L 48 6
      L 78 88
      L 0 46
      L -78 88
      L -48 6
      L -108 -46
      L -24 -46
      Z
    " fill="none" stroke="#F59E0B" stroke-width="5" stroke-linejoin="round" />

    <!-- Solid Gold Nodes -->
    <circle cx="0" cy="-130" r="9" fill="#F59E0B" />
    <circle cx="108" cy="-46" r="9" fill="#F59E0B" />
    <circle cx="78" cy="88" r="9" fill="#F59E0B" />
    <circle cx="-78" cy="88" r="9" fill="#F59E0B" />
    <circle cx="-108" cy="-46" r="9" fill="#F59E0B" />

    <!-- Clean Inner Circle -->
    <circle cx="0" cy="4" r="54" fill="#0E1118" stroke="#F59E0B" stroke-width="4" />

    <!-- Pure Crisp Bitcoin Monogram -->
    <path d="
      M -4 -34 L 0 -34 L 0 -22 L -4 -22 Z
      M 10 -34 L 14 -34 L 14 -22 L 10 -22 Z
      M -4 22 L 0 22 L 0 34 L -4 34 Z
      M 10 22 L 14 22 L 14 34 L 10 34 Z
    " fill="#FFFFFF" />
    <path d="
      M -16 -22
      L 6 -22
      C 14 -22, 20 -17, 20 -11
      C 20 -5, 15 -1, 10 0
      C 17 1, 22 6, 22 13
      C 22 20, 15 22, 6 22
      L -16 22
      Z
      M -8 -15
      L 5 -15
      C 9 -15, 13 -13, 13 -11
      C 13 -9, 9 -7, 5 -7
      L -8 -7
      Z
      M -8 1
      L 6 1
      C 10 1, 14 3, 14 6
      C 14 9, 10 15, 6 15
      L -8 15
      Z
    " fill="#FFFFFF" fill-rule="evenodd" />

    <!-- Sharp Monoline Cowboy Hat atop the Circle & Star -->
    <g id="hat" transform="translate(0, -90)">
      <!-- Hat Crown Outline -->
      <path d="
        M -30 20
        C -28 -10, -22 -30, -10 -28
        C -4 -26, -2 -18, 0 -18
        C 2 -18, 4 -26, 10 -28
        C 22 -30, 28 -10, 30 20
      " fill="#08090C" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      
      <!-- Crease Line -->
      <path d="M 0 -18 L 0 4" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />

      <!-- Brim Curve -->
      <path d="
        M -68 18
        C -40 -2, -32 24, 0 24
        C 32 24, 40 -2, 68 18
        C 48 30, 20 32, 0 32
        C -20 32, -48 30, -68 18
        Z
      " fill="#F59E0B" stroke="#08090C" stroke-width="2" />
    </g>
  </g>
</svg>`;
}

function getOption2_Logo(width = 720, height = 180) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="${width}" height="${height}" fill="none">
  <rect width="720" height="180" rx="20" fill="#08090C" />
  <rect width="720" height="180" rx="20" stroke="#161822" stroke-width="2" />

  <!-- Mark scaled at left -->
  <g transform="translate(86, 92) scale(0.48)">
    <path d="
      M 0 -130
      L 24 -46
      L 108 -46
      L 48 6
      L 78 88
      L 0 46
      L -78 88
      L -48 6
      L -108 -46
      L -24 -46
      Z
    " fill="none" stroke="#F59E0B" stroke-width="6" stroke-linejoin="round" />

    <circle cx="0" cy="-130" r="11" fill="#F59E0B" />
    <circle cx="108" cy="-46" r="11" fill="#F59E0B" />
    <circle cx="78" cy="88" r="11" fill="#F59E0B" />
    <circle cx="-78" cy="88" r="11" fill="#F59E0B" />
    <circle cx="-108" cy="-46" r="11" fill="#F59E0B" />

    <circle cx="0" cy="4" r="54" fill="#0A0B0E" stroke="#F59E0B" stroke-width="5" />

    <path d="
      M -4 -34 L 0 -34 L 0 -22 L -4 -22 Z
      M 10 -34 L 14 -34 L 14 -22 L 10 -22 Z
      M -4 22 L 0 22 L 0 34 L -4 34 Z
      M 10 22 L 14 22 L 14 34 L 10 34 Z
    " fill="#FFFFFF" />
    <path d="
      M -16 -22
      L 6 -22
      C 14 -22, 20 -17, 20 -11
      C 20 -5, 15 -1, 10 0
      C 17 1, 22 6, 22 13
      C 22 20, 15 22, 6 22
      L -16 22
      Z
      M -8 -15
      L 5 -15
      C 9 -15, 13 -13, 13 -11
      C 13 -9, 9 -7, 5 -7
      L -8 -7
      Z
      M -8 1
      L 6 1
      C 10 1, 14 3, 14 6
      C 14 9, 10 15, 6 15
      L -8 15
      Z
    " fill="#FFFFFF" fill-rule="evenodd" />

    <g id="hat" transform="translate(0, -90)">
      <path d="
        M -30 20
        C -28 -10, -22 -30, -10 -28
        C -4 -26, -2 -18, 0 -18
        C 2 -18, 4 -26, 10 -28
        C 22 -30, 28 -10, 30 20
      " fill="#08090C" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
      <path d="M 0 -18 L 0 4" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="
        M -68 18
        C -40 -2, -32 24, 0 24
        C 32 24, 40 -2, 68 18
        C 48 30, 20 32, 0 32
        C -20 32, -48 30, -68 18
        Z
      " fill="#F59E0B" stroke="#08090C" stroke-width="2" />
    </g>
  </g>

  <!-- Typography -->
  <text
    x="180"
    y="90"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="64"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="182"
    y="142"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="44"
    font-weight="700"
    letter-spacing="-0.025em"
    fill="#F59E0B"
  >crypto <tspan fill="#94A3B8" font-weight="500">show</tspan></text>
</svg>`;
}

// ----------------------------------------------------------------------
// OPTION 3: "The Texas Medallion" - Flat Silhouette & Negative Space
// High-contrast, iconic, memorable. Looks like a genuine human brand emblem.
// ----------------------------------------------------------------------
function getOption3_Icon(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <rect width="512" height="512" rx="112" fill="#0C0D12" />
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#222634" stroke-width="2" />

  <g id="mark" transform="translate(256, 276)">
    <!-- 6-Point Star Badge -->
    <path d="
      M 0 -134
      L 34 -52
      L 124 -52
      L 58 12
      L 86 98
      L 0 52
      L -86 98
      L -58 12
      L -124 -52
      L -34 -52
      Z
    " fill="#F59E0B" />

    <!-- Ball Finials -->
    <circle cx="0" cy="-134" r="12" fill="#F59E0B" />
    <circle cx="124" cy="-52" r="12" fill="#F59E0B" />
    <circle cx="86" cy="98" r="12" fill="#F59E0B" />
    <circle cx="-86" cy="98" r="12" fill="#F59E0B" />
    <circle cx="-124" cy="-52" r="12" fill="#F59E0B" />

    <!-- Center Cutout Disc -->
    <circle cx="0" cy="6" r="60" fill="#0C0D12" />

    <!-- Crisp White Bitcoin ₿ -->
    <path d="
      M -5 -38 L 1 -38 L 1 -24 L -5 -24 Z
      M 11 -38 L 17 -38 L 17 -24 L 11 -24 Z
      M -5 24 L 1 24 L 1 38 L -5 38 Z
      M 11 24 L 17 24 L 17 38 L 11 38 Z
    " fill="#F59E0B" />
    <path d="
      M -18 -24
      L 8 -24
      C 18 -24, 25 -18, 25 -11
      C 25 -5, 19 -1, 13 0
      C 22 1, 28 7, 28 15
      C 28 23, 20 25, 8 25
      L -18 25
      Z
      M -9 -16
      L 7 -16
      C 12 -16, 17 -13, 17 -11
      C 17 -8, 12 -6, 7 -6
      L -9 -6
      Z
      M -9 2
      L 8 2
      C 13 2, 19 5, 19 9
      C 19 13, 13 17, 8 17
      L -9 17
      Z
    " fill="#F59E0B" fill-rule="evenodd" />

    <!-- Cowboy Hat (Solid Dark Crown + Gold Brim) -->
    <g id="hat" transform="translate(0, -96)">
      <path d="
        M -36 18
        C -34 -18, -26 -38, -13 -35
        C -5 -32, -2 -22, 0 -22
        C 2 -22, 5 -32, 13 -35
        C 26 -38, 34 -18, 36 18
        Z
      " fill="#0C0D12" stroke="#F59E0B" stroke-width="4.5" />
      <path d="
        M -76 16
        C -46 -6, -38 24, 0 24
        C 38 24, 46 -6, 76 16
        C 56 32, 26 34, 0 34
        C -26 34, -56 32, -76 16
        Z
      " fill="#F59E0B" stroke="#0C0D12" stroke-width="3" />
    </g>
  </g>
</svg>`;
}

function getOption3_Logo(width = 720, height = 180) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="${width}" height="${height}" fill="none">
  <rect width="720" height="180" rx="20" fill="#0C0D12" />
  <rect width="720" height="180" rx="20" stroke="#202430" stroke-width="2" />

  <g transform="translate(86, 92) scale(0.48)">
    <path d="
      M 0 -134
      L 34 -52
      L 124 -52
      L 58 12
      L 86 98
      L 0 52
      L -86 98
      L -58 12
      L -124 -52
      L -34 -52
      Z
    " fill="#F59E0B" />

    <circle cx="0" cy="-134" r="14" fill="#F59E0B" />
    <circle cx="124" cy="-52" r="14" fill="#F59E0B" />
    <circle cx="86" cy="98" r="14" fill="#F59E0B" />
    <circle cx="-86" cy="98" r="14" fill="#F59E0B" />
    <circle cx="-124" cy="-52" r="14" fill="#F59E0B" />

    <circle cx="0" cy="6" r="60" fill="#0C0D12" />

    <path d="
      M -5 -38 L 1 -38 L 1 -24 L -5 -24 Z
      M 11 -38 L 17 -38 L 17 -24 L 11 -24 Z
      M -5 24 L 1 24 L 1 38 L -5 38 Z
      M 11 24 L 17 24 L 17 38 L 11 38 Z
    " fill="#F59E0B" />
    <path d="
      M -18 -24
      L 8 -24
      C 18 -24, 25 -18, 25 -11
      C 25 -5, 19 -1, 13 0
      C 22 1, 28 7, 28 15
      C 28 23, 20 25, 8 25
      L -18 25
      Z
      M -9 -16
      L 7 -16
      C 12 -16, 17 -13, 17 -11
      C 17 -8, 12 -6, 7 -6
      L -9 -6
      Z
      M -9 2
      L 8 2
      C 13 2, 19 5, 19 9
      C 19 13, 13 17, 8 17
      L -9 17
      Z
    " fill="#F59E0B" fill-rule="evenodd" />

    <g id="hat" transform="translate(0, -96)">
      <path d="
        M -36 18
        C -34 -18, -26 -38, -13 -35
        C -5 -32, -2 -22, 0 -22
        C 2 -22, 5 -32, 13 -35
        C 26 -38, 34 -18, 36 18
        Z
      " fill="#0C0D12" stroke="#F59E0B" stroke-width="5" />
      <path d="
        M -76 16
        C -46 -6, -38 24, 0 24
        C 38 24, 46 -6, 76 16
        C 56 32, 26 34, 0 34
        C -26 34, -56 32, -76 16
        Z
      " fill="#F59E0B" stroke="#0C0D12" stroke-width="3" />
    </g>
  </g>

  <text
    x="180"
    y="90"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="64"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="182"
    y="142"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="44"
    font-weight="700"
    letter-spacing="-0.025em"
    fill="#F59E0B"
  >crypto <tspan fill="#FFFFFF" font-weight="500">show</tspan></text>
</svg>`;
}

async function renderAll() {
  // Option 1
  fs.writeFileSync(path.join(outputDir, 'opt1_icon.svg'), getOption1_Icon());
  fs.writeFileSync(path.join(outputDir, 'opt1_logo.svg'), getOption1_Logo());
  await sharp(path.join(outputDir, 'opt1_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'opt1_icon.png'));
  await sharp(path.join(outputDir, 'opt1_logo.svg')).resize(1440, 360).png().toFile(path.join(outputDir, 'opt1_logo.png'));

  // Option 2
  fs.writeFileSync(path.join(outputDir, 'opt2_icon.svg'), getOption2_Icon());
  fs.writeFileSync(path.join(outputDir, 'opt2_logo.svg'), getOption2_Logo());
  await sharp(path.join(outputDir, 'opt2_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'opt2_icon.png'));
  await sharp(path.join(outputDir, 'opt2_logo.svg')).resize(1440, 360).png().toFile(path.join(outputDir, 'opt2_logo.png'));

  // Option 3
  fs.writeFileSync(path.join(outputDir, 'opt3_icon.svg'), getOption3_Icon());
  fs.writeFileSync(path.join(outputDir, 'opt3_logo.svg'), getOption3_Logo());
  await sharp(path.join(outputDir, 'opt3_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'opt3_icon.png'));
  await sharp(path.join(outputDir, 'opt3_logo.svg')).resize(1440, 360).png().toFile(path.join(outputDir, 'opt3_logo.png'));

  console.log('All 3 pure vector design directions rendered to PNG and SVG!');
}

renderAll().catch(console.error);
