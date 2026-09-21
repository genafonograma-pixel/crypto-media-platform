// create_bandit_vector.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, 'public', 'bandit_brand');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ---------------------------------------------------------------------------------
// REFINED 2D VECTOR WESTERN BITCOIN BANDIT
// Updates:
// 1. NO shadow under hat
// 2. NO black line with 3 dots in front of head (completely removed)
// 3. Smaller Bitcoin symbol ₿
// 4. Hat positioned lower over the coin
// 5. Bandana positioned higher (upper) over the coin
// ---------------------------------------------------------------------------------

function generateBanditMascot(cx = 250, cy = 250, scale = 1) {
  return `
  <g id="bitcoin-bandit" transform="translate(${cx}, ${cy}) scale(${scale})">
    
    <!-- 1. BITCOIN COIN (FULL CIRCLE, CENTERED AT 0, 0, RADIUS 84) -->
    <g id="coin" transform="translate(0, 0)">
      <!-- Dark edge outline -->
      <circle cx="0" cy="0" r="88" fill="#0C0D10" />
      
      <!-- Outer Coin Rim (Dark Amber) -->
      <circle cx="0" cy="0" r="84" fill="#D97706" />

      <!-- Inner Coin Face (Vibrant Bitcoin Orange #F7931A) -->
      <circle cx="0" cy="0" r="76" fill="#F7931A" />
      
      <!-- Inner milled ring -->
      <circle cx="0" cy="0" r="68" fill="none" stroke="#FDE68A" stroke-width="2" stroke-opacity="0.4" />

      <!-- Smaller, perfectly centered Crisp White Bitcoin Symbol ₿ -->
      <g transform="rotate(14) scale(0.92)" fill="#FFFFFF">
        <!-- Top vertical hashes -->
        <rect x="-6" y="-50" width="5.5" height="14" rx="1.5" />
        <rect x="6" y="-50" width="5.5" height="14" rx="1.5" />
        <!-- Bottom vertical hashes -->
        <rect x="-6" y="35" width="5.5" height="14" rx="1.5" />
        <rect x="6" y="35" width="5.5" height="14" rx="1.5" />

        <!-- 'B' Main Shape -->
        <path d="
          M -22 -36
          L 13 -36
          C 26 -36, 36 -28, 36 -17
          C 36 -7, 28 -2, 18 0
          C 31 2, 40 11, 40 23
          C 40 37, 27 45, 11 45
          L -22 45
          Z
          M -11 -26
          L 11 -26
          C 18 -26, 24 -22, 24 -17
          C 24 -11, 18 -7, 11 -7
          L -11 -7
          Z
          M -11 5
          L 13 5
          C 20 5, 27 10, 27 19
          C 27 28, 20 35, 13 35
          L -11 35
          Z
        " fill-rule="evenodd" />
      </g>
    </g>

    <!-- 2. RED BANDANA / NECKERCHIEF (MOVED UPPER OVER COIN) -->
    <!-- Positioned higher at y = 32 -->
    <g id="bandana" transform="translate(0, 32)">
      <!-- Bandana Base Outline -->
      <path d="
        M -74 2
        C -45 22, 45 22, 74 2
        C 84 30, 70 58, 48 82
        L 0 132
        L -48 82
        C -70 58, -84 30, -74 2
        Z
      " fill="#7F1D1D" stroke="#0C0D10" stroke-width="5" stroke-linejoin="round" />

      <!-- Main Red Cloth Body -->
      <path d="
        M -72 4
        C -44 24, 44 24, 72 4
        C 82 32, 66 60, 44 84
        L 0 128
        L -44 84
        C -66 60, -82 32, -72 4
        Z
      " fill="#DC2626" />

      <!-- Top Fold Rim -->
      <path d="
        M -68 8
        Q 0 28 68 8
        Q 0 18 -68 8
        Z
      " fill="#EF4444" />

      <!-- Shadow Folds -->
      <path d="
        M -60 28
        C -30 48, 10 44, 36 34
        C 10 46, -28 50, -54 36
      " fill="#991B1B" />

      <path d="
        M -40 50
        Q -10 82 0 116
        Q 12 86 32 62
        C 12 72, -12 72, -40 50
        Z
      " fill="#991B1B" />
      
      <!-- Highlight Accent -->
      <path d="
        M -32 44
        Q -6 74 0 110
      " fill="none" stroke="#F87171" stroke-width="3.5" stroke-linecap="round" />

      <!-- Neckerchief Knot on Right Side -->
      <g id="knot" transform="translate(70, 14)">
        <circle cx="0" cy="0" r="11" fill="#DC2626" stroke="#0C0D10" stroke-width="4.5" />
        <circle cx="-2" cy="-2" r="7" fill="#EF4444" />

        <!-- Upper Tail -->
        <path d="
          M 4 -5
          C 18 -15, 38 -10, 46 2
          C 38 10, 20 8, 4 4
          Z
        " fill="#DC2626" stroke="#0C0D10" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M 12 -3 Q 26 -6 38 1" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round" />

        <!-- Lower Tail -->
        <path d="
          M 2 4
          C 10 20, 20 34, 30 42
          C 32 36, 26 20, 10 10
          Z
        " fill="#991B1B" stroke="#0C0D10" stroke-width="4.5" stroke-linejoin="round" />
        <path d="
          M 3 6
          C 12 18, 22 28, 28 36
          C 30 32, 24 18, 8 8
          Z
        " fill="#DC2626" stroke="#0C0D10" stroke-width="3.5" stroke-linejoin="round" />
      </g>
    </g>

    <!-- 3. SMOOTH COWBOY HAT (LOWER DOWN, NO SHADOW, NO BLACK LINE WITH 3 DOTS) -->
    <!-- Positioned lower at y = -36 -->
    <g id="cowboy-hat" transform="translate(0, -36)">
      
      <!-- Crown Body (Smooth rounded cowboy crown) -->
      <path d="
        M -56 8
        C -54 -28, -48 -70, -22 -72
        C -8 -73, 8 -73, 22 -72
        C 48 -70, 54 -28, 56 8
        Z
      " fill="#A0522D" stroke="#0C0D10" stroke-width="5" stroke-linejoin="round" />

      <!-- Crown Subtle 2D Shadow on Right -->
      <path d="
        M 8 -72
        C 20 -72, 42 -68, 50 -32
        C 54 -10, 55 2, 56 8
        L 24 8
        C 24 -14, 18 -48, 8 -72
        Z
      " fill="#78350F" opacity="0.4" />

      <!-- Crown Left Highlight Curve -->
      <path d="
        M -36 -56
        C -44 -32, -46 0, -44 8
      " fill="none" stroke="#CD7F32" stroke-width="4" stroke-linecap="round" opacity="0.6" />

      <!-- Clean Wide Western Brim (Arches over coin, curves down on sides) -->
      <!-- NO shadow underneath, NO black line with 3 dots in front! -->
      <path d="
        M -144 26
        C -132 -10, -78 -10, 0 -6
        C 78 -10, 132 -10, 144 26
        C 126 50, 96 36, 68 18
        C 42 6, -42 6, -68 18
        C -96 36, -126 50, -144 26
        Z
      " fill="#B45920" stroke="#0C0D10" stroke-width="5.5" stroke-linejoin="round" />

      <!-- Brim Highlight Rolled Edge -->
      <path d="
        M -136 22
        C -124 -6, -75 -6, 0 -3
        C 75 -6, 124 -6, 136 22
      " fill="none" stroke="#E28448" stroke-width="3" stroke-linecap="round" />
    </g>

  </g>
  `;
}

// -------------------------------------------------------------------------
// ASSETS FOR PRODUCTION & UI/UX
// -------------------------------------------------------------------------

// 1. App Icon / Squircle (512x512)
function getAppIconSvg(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <rect width="512" height="512" rx="112" fill="#090A0D" />
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#1D2028" stroke-width="3" />
  <circle cx="256" cy="245" r="160" fill="#F7931A" fill-opacity="0.08" />

  ${generateBanditMascot(256, 240, 1.25)}
</svg>`;
}

// 2. Horizontal Navbar Logo (Transparent, tailored for web header height: 460x110)
function getNavbarLogoSvg(width = 460, height = 110) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="${width}" height="${height}" fill="none">
  <!-- Scaled Mascot on Left (fitted to ~96px height) -->
  ${generateBanditMascot(56, 52, 0.40)}

  <!-- Typography -->
  <text
    x="125"
    y="55"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="44"
    font-weight="900"
    letter-spacing="-0.035em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="127"
    y="92"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="34"
    font-weight="800"
    letter-spacing="-0.025em"
    fill="#F7931A"
  >crypto <tspan fill="#FFFFFF" font-weight="700">show</tspan></text>
</svg>`;
}

// 3. Full Horizontal Brand Logo with Dark Background (820x220)
function getBannerLogoSvg(width = 820, height = 220) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 220" width="${width}" height="${height}" fill="none">
  <rect width="820" height="220" rx="20" fill="#08090C" />
  <rect width="820" height="220" rx="20" stroke="#1C1F28" stroke-width="2" />

  <!-- Mascot on Left -->
  ${generateBanditMascot(120, 110, 0.72)}

  <!-- Typography -->
  <text
    x="245"
    y="105"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="78"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="248"
    y="168"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="60"
    font-weight="800"
    letter-spacing="-0.03em"
    fill="#F7931A"
  >crypto <tspan fill="#FFFFFF" font-weight="700">show</tspan></text>
</svg>`;
}

// 4. Standalone Vector Mark (Transparent: 400x400)
function getTransparentMarkSvg(size = 400) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}" fill="none">
  ${generateBanditMascot(200, 190, 1.15)}
</svg>`;
}

// 5. Favicon (64x64)
function getFaviconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none">
  <rect width="64" height="64" rx="14" fill="#0A0B0E" />
  ${generateBanditMascot(32, 31, 0.21)}
</svg>`;
}

async function renderBanditAssets() {
  // Write SVGs
  fs.writeFileSync(path.join(outputDir, 'bandit_icon.svg'), getAppIconSvg());
  fs.writeFileSync(path.join(outputDir, 'bandit_navbar_logo.svg'), getNavbarLogoSvg());
  fs.writeFileSync(path.join(outputDir, 'bandit_banner_logo.svg'), getBannerLogoSvg());
  fs.writeFileSync(path.join(outputDir, 'bandit_mark.svg'), getTransparentMarkSvg());

  // Render High-Resolution PNGs via sharp
  await sharp(path.join(outputDir, 'bandit_icon.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'bandit_icon.png'));

  await sharp(path.join(outputDir, 'bandit_icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'bandit_icon_1024.png'));

  await sharp(path.join(outputDir, 'bandit_navbar_logo.svg'))
    .resize(920, 220)
    .png()
    .toFile(path.join(outputDir, 'bandit_navbar_logo.png'));

  await sharp(path.join(outputDir, 'bandit_banner_logo.svg'))
    .resize(1640, 440)
    .png()
    .toFile(path.join(outputDir, 'bandit_banner_logo.png'));

  await sharp(path.join(outputDir, 'bandit_mark.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'bandit_mark.png'));

  // Update public/ root files for live app
  fs.copyFileSync(path.join(outputDir, 'bandit_icon.svg'), path.join(__dirname, 'public', 'wildwest_icon.svg'));
  fs.copyFileSync(path.join(outputDir, 'bandit_icon.png'), path.join(__dirname, 'public', 'wildwest_icon.png'));
  fs.copyFileSync(path.join(outputDir, 'bandit_navbar_logo.svg'), path.join(__dirname, 'public', 'wildwest_logo.svg'));
  fs.copyFileSync(path.join(outputDir, 'bandit_navbar_logo.png'), path.join(__dirname, 'public', 'wildwest_logo.png'));
  fs.copyFileSync(path.join(outputDir, 'bandit_mark.svg'), path.join(__dirname, 'public', 'wildwest_mark.svg'));
  fs.copyFileSync(path.join(outputDir, 'bandit_mark.png'), path.join(__dirname, 'public', 'wildwest_mark.png'));
  fs.copyFileSync(path.join(outputDir, 'bandit_navbar_logo.svg'), path.join(__dirname, 'public', 'crypton_logo.svg'));

  await sharp(path.join(outputDir, 'bandit_icon.svg'))
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));

  console.log('Bandit 2D vector brand assets updated successfully!');
}

renderBanditAssets().catch(console.error);
