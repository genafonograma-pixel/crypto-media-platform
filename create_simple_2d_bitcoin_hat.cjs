// create_simple_2d_bitcoin_hat.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, 'public', 'simple_2d');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// =========================================================================
// VARIATION 1: The Iconic Bitcoin Orange 2D Coin with Flat Cowboy Hat
// Clean, unmistakable, flat 2D. Just the classic Bitcoin coin wearing a hat.
// =========================================================================
function getVar1_CoinWithHat(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <!-- Background transparent or dark canvas -->
  <rect width="512" height="512" rx="100" fill="#0A0B0E" />

  <g transform="translate(256, 280)">
    <!-- Flat 2D Bitcoin Orange Disc -->
    <circle cx="0" cy="10" r="140" fill="#F7931A" />
    
    <!-- Inner subtle flat ring -->
    <circle cx="0" cy="10" r="128" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.25" />

    <!-- Pure Flat Crisp White Bitcoin ₿ (tilted 14 degrees standard Bitcoin angle) -->
    <g transform="translate(0, 10) rotate(14) scale(1.65)" fill="#FFFFFF">
      <!-- Stems -->
      <rect x="-7" y="-56" width="6" height="112" rx="2" />
      <rect x="7" y="-56" width="6" height="112" rx="2" />
      <!-- B Letterform -->
      <path d="
        M -24 -40
        L 14 -40
        C 28 -40, 38 -31, 38 -18
        C 38 -8, 30 -2, 20 0
        C 33 2, 42 10, 42 24
        C 42 38, 30 46, 12 46
        L -24 46
        Z
        M -12 -28
        L 12 -28
        C 20 -28, 26 -24, 26 -18
        C 26 -12, 20 -8, 12 -8
        L -12 -8
        Z
        M -12 4
        L 14 4
        C 22 4, 30 9, 30 18
        C 30 27, 22 34, 14 34
        L -12 34
        Z
      " fill-rule="evenodd" />
    </g>

    <!-- Simple Flat 2D Western Cowboy Hat perched on top of coin -->
    <g id="cowboy-hat" transform="translate(4, -135) rotate(-6)">
      <!-- Hat Crown (Flat Dark/Charcoal with crisp edge) -->
      <path d="
        M -54 20
        C -50 -32, -38 -66, -18 -62
        C -8 -58, -3 -42, 0 -42
        C 3 -42, 8 -58, 18 -62
        C 38 -66, 50 -32, 54 20
        Z
      " fill="#181B22" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round" />
      
      <!-- Crease shadow -->
      <path d="M 0 -42 L 0 6" stroke="#2D3342" stroke-width="5" stroke-linecap="round" />

      <!-- Hat Band (Bitcoin Orange flat accent) -->
      <path d="M -54 12 Q 0 24 54 12 L 55 22 Q 0 34 -55 22 Z" fill="#F7931A" />

      <!-- Hat Brim (Curved upturned western brim) -->
      <path d="
        M -125 18
        C -80 -14, -60 32, 0 32
        C 60 32, 80 -14, 125 18
        C 95 56, 45 60, 0 60
        C -45 60, -95 56, -125 18
        Z
      " fill="#181B22" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
    </g>
  </g>
</svg>`;
}

// =========================================================================
// VARIATION 2: Pure 2D Flat Silhouette - The "₿" Monogram Wearing the Hat
// No background coin disc, just the bold 2D Bitcoin B directly wearing the hat.
// Ultra-clean, iconic, minimal.
// =========================================================================
function getVar2_MonogramWithHat(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <!-- Dark canvas -->
  <rect width="512" height="512" rx="100" fill="#0A0B0E" />

  <g transform="translate(256, 280)">
    <!-- Bold 2D Bitcoin Monogram (Straight, centered) -->
    <!-- Gold / Bitcoin Orange #F7931A -->
    <g fill="#F7931A" transform="scale(1.75)">
      <!-- Top Stems -->
      <rect x="-11" y="-80" width="8" height="28" rx="2" />
      <rect x="7" y="-80" width="8" height="28" rx="2" />
      <!-- Bottom Stems -->
      <rect x="-11" y="52" width="8" height="28" rx="2" />
      <rect x="7" y="52" width="8" height="28" rx="2" />
      
      <!-- 'B' Body -->
      <path d="
        M -36 -62
        L 18 -62
        C 42 -62, 58 -46, 58 -26
        C 58 -9, 46 1, 30 5
        C 50 9, 64 24, 64 45
        C 64 68, 44 80, 16 80
        L -36 80
        L -36 58
        L -16 58
        L -16 -40
        L -36 -40
        Z
        M 4 -40
        L 18 -40
        C 28 -40, 36 -34, 36 -26
        C 36 -18, 28 -12, 18 -12
        L 4 -12
        Z
        M 4 8
        L 20 8
        C 32 8, 42 16, 42 27
        C 42 38, 32 46, 20 46
        L 4 46
        Z
      " fill-rule="evenodd" />
    </g>

    <!-- Simple Flat 2D Cowboy Hat tilted on the top of the B -->
    <g id="cowboy-hat" transform="translate(4, -125) rotate(-8)">
      <!-- Crown -->
      <path d="
        M -56 20
        C -52 -28, -40 -64, -20 -60
        C -8 -56, -3 -42, 0 -42
        C 3 -42, 8 -56, 20 -60
        C 40 -64, 52 -28, 56 20
        Z
      " fill="#FFFFFF" />

      <!-- Cattleman crease -->
      <path d="M 0 -42 L 0 8" stroke="#0A0B0E" stroke-width="6" stroke-linecap="round" />

      <!-- Hat band -->
      <path d="M -56 12 Q 0 24 56 12 L 57 22 Q 0 34 -57 22 Z" fill="#F7931A" />

      <!-- Brim -->
      <path d="
        M -125 18
        C -80 -14, -60 32, 0 32
        C 60 32, 80 -14, 125 18
        C 95 56, 45 60, 0 60
        C -45 60, -95 56, -125 18
        Z
      " fill="#FFFFFF" />
    </g>
  </g>
</svg>`;
}

// =========================================================================
// VARIATION 3: The Minimalist Modern Fintech Mark
// Clean 2-tone vector: Bitcoin Orange ₿ wearing a crisp stylish 2D Western hat.
// Fully transparent-friendly, sharp on any background.
// =========================================================================
function getVar3_MinimalistFintech(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <rect width="512" height="512" rx="100" fill="#0E1015" />

  <g transform="translate(256, 275)">
    <!-- Bitcoin Symbol (Flat Clean Crisp) -->
    <!-- Stems -->
    <rect x="-18" y="-120" width="13" height="42" rx="3" fill="#F7931A" />
    <rect x="12" y="-120" width="13" height="42" rx="3" fill="#F7931A" />
    <rect x="-18" y="90" width="13" height="42" rx="3" fill="#F7931A" />
    <rect x="12" y="90" width="13" height="42" rx="3" fill="#F7931A" />

    <!-- 'B' Body -->
    <path d="
      M -60 -90
      L 24 -90
      C 62 -90, 88 -68, 88 -38
      C 88 -14, 70 2, 46 8
      C 74 14, 94 38, 94 72
      C 94 108, 68 126, 22 126
      L -60 126
      L -60 92
      L -26 92
      L -26 -56
      L -60 -56
      Z
      M 6 -56
      L 24 -56
      C 40 -56, 50 -48, 50 -38
      C 50 -28, 40 -20, 24 -20
      L 6 -20
      Z
      M 6 16
      L 26 16
      C 44 16, 54 26, 54 39
      C 54 52, 44 62, 26 62
      L 6 62
      Z
    " fill="#F7931A" fill-rule="evenodd" />

    <!-- 2D Cowboy Hat perched with swagger on top-left arch of B -->
    <g id="cowboy-hat" transform="translate(0, -96) rotate(-7)">
      <!-- Crown -->
      <path d="
        M -50 16
        C -46 -24, -36 -52, -18 -48
        C -8 -44, -3 -32, 0 -32
        C 3 -32, 8 -44, 18 -48
        C 36 -52, 46 -24, 50 16
        Z
      " fill="#F7931A" stroke="#0E1015" stroke-width="4" />

      <!-- Center Crease -->
      <path d="M 0 -32 L 0 6" stroke="#0E1015" stroke-width="4.5" stroke-linecap="round" />

      <!-- Hat Band -->
      <path d="M -50 10 Q 0 20 50 10 L 51 18 Q 0 28 -51 18 Z" fill="#0E1015" />

      <!-- Brim -->
      <path d="
        M -110 14
        C -70 -12, -52 28, 0 28
        C 52 28, 70 -12, 110 14
        C 84 46, 42 50, 0 50
        C -42 50, -84 46, -110 14
        Z
      " fill="#F7931A" stroke="#0E1015" stroke-width="4.5" />
    </g>
  </g>
</svg>`;
}

// =========================================================================
// Horizontal Logos for each variation
// =========================================================================
function getVar1_HorizontalLogo(width = 820, height = 200) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 200" width="${width}" height="${height}" fill="none">
  <rect width="820" height="200" fill="#0A0B0E" />

  <!-- Var 1 Icon scaled on left (x=105, y=105, scale=0.48) -->
  <g transform="translate(105, 108) scale(0.48)">
    <circle cx="0" cy="10" r="140" fill="#F7931A" />
    <circle cx="0" cy="10" r="128" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.25" />

    <g transform="translate(0, 10) rotate(14) scale(1.65)" fill="#FFFFFF">
      <rect x="-7" y="-56" width="6" height="112" rx="2" />
      <rect x="7" y="-56" width="6" height="112" rx="2" />
      <path d="
        M -24 -40
        L 14 -40
        C 28 -40, 38 -31, 38 -18
        C 38 -8, 30 -2, 20 0
        C 33 2, 42 10, 42 24
        C 42 38, 30 46, 12 46
        L -24 46
        Z
        M -12 -28
        L 12 -28
        C 20 -28, 26 -24, 26 -18
        C 26 -12, 20 -8, 12 -8
        L -12 -8
        Z
        M -12 4
        L 14 4
        C 22 4, 30 9, 30 18
        C 30 27, 22 34, 14 34
        L -12 34
        Z
      " fill-rule="evenodd" />
    </g>

    <g id="cowboy-hat" transform="translate(4, -135) rotate(-6)">
      <path d="
        M -54 20
        C -50 -32, -38 -66, -18 -62
        C -8 -58, -3 -42, 0 -42
        C 3 -42, 8 -58, 18 -62
        C 38 -66, 50 -32, 54 20
        Z
      " fill="#181B22" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round" />
      <path d="M 0 -42 L 0 6" stroke="#2D3342" stroke-width="5" stroke-linecap="round" />
      <path d="M -54 12 Q 0 24 54 12 L 55 22 Q 0 34 -55 22 Z" fill="#F7931A" />
      <path d="
        M -125 18
        C -80 -14, -60 32, 0 32
        C 60 32, 80 -14, 125 18
        C 95 56, 45 60, 0 60
        C -45 60, -95 56, -125 18
        Z
      " fill="#181B22" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
    </g>
  </g>

  <!-- Typography -->
  <text
    x="210"
    y="96"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="70"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="212"
    y="154"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="56"
    font-weight="700"
    letter-spacing="-0.03em"
    fill="#F7931A"
  >crypto <tspan fill="#FFFFFF" font-weight="600">show</tspan></text>
</svg>`;
}

function getVar2_HorizontalLogo(width = 820, height = 200) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 200" width="${width}" height="${height}" fill="none">
  <rect width="820" height="200" fill="#0A0B0E" />

  <!-- Var 2 Icon scaled on left (x=105, y=105, scale=0.48) -->
  <g transform="translate(105, 108) scale(0.48)">
    <g fill="#F7931A" transform="scale(1.75)">
      <rect x="-11" y="-80" width="8" height="28" rx="2" />
      <rect x="7" y="-80" width="8" height="28" rx="2" />
      <rect x="-11" y="52" width="8" height="28" rx="2" />
      <rect x="7" y="52" width="8" height="28" rx="2" />
      
      <path d="
        M -36 -62
        L 18 -62
        C 42 -62, 58 -46, 58 -26
        C 58 -9, 46 1, 30 5
        C 50 9, 64 24, 64 45
        C 64 68, 44 80, 16 80
        L -36 80
        L -36 58
        L -16 58
        L -16 -40
        L -36 -40
        Z
        M 4 -40
        L 18 -40
        C 28 -40, 36 -34, 36 -26
        C 36 -18, 28 -12, 18 -12
        L 4 -12
        Z
        M 4 8
        L 20 8
        C 32 8, 42 16, 42 27
        C 42 38, 32 46, 20 46
        L 4 46
        Z
      " fill-rule="evenodd" />
    </g>

    <g id="cowboy-hat" transform="translate(4, -125) rotate(-8)">
      <path d="
        M -56 20
        C -52 -28, -40 -64, -20 -60
        C -8 -56, -3 -42, 0 -42
        C 3 -42, 8 -56, 20 -60
        C 40 -64, 52 -28, 56 20
        Z
      " fill="#FFFFFF" />
      <path d="M 0 -42 L 0 8" stroke="#0A0B0E" stroke-width="6" stroke-linecap="round" />
      <path d="M -56 12 Q 0 24 56 12 L 57 22 Q 0 34 -57 22 Z" fill="#F7931A" />
      <path d="
        M -125 18
        C -80 -14, -60 32, 0 32
        C 60 32, 80 -14, 125 18
        C 95 56, 45 60, 0 60
        C -45 60, -95 56, -125 18
        Z
      " fill="#FFFFFF" />
    </g>
  </g>

  <!-- Typography -->
  <text
    x="210"
    y="96"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="70"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <text
    x="212"
    y="154"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="56"
    font-weight="700"
    letter-spacing="-0.03em"
    fill="#F7931A"
  >crypto <tspan fill="#FFFFFF" font-weight="600">show</tspan></text>
</svg>`;
}

async function renderAll() {
  // Var 1
  fs.writeFileSync(path.join(outputDir, 'v1_coin_hat_icon.svg'), getVar1_CoinWithHat());
  fs.writeFileSync(path.join(outputDir, 'v1_coin_hat_logo.svg'), getVar1_HorizontalLogo());
  await sharp(path.join(outputDir, 'v1_coin_hat_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'v1_coin_hat_icon.png'));
  await sharp(path.join(outputDir, 'v1_coin_hat_logo.svg')).resize(1640, 400).png().toFile(path.join(outputDir, 'v1_coin_hat_logo.png'));

  // Var 2
  fs.writeFileSync(path.join(outputDir, 'v2_monogram_hat_icon.svg'), getVar2_MonogramWithHat());
  fs.writeFileSync(path.join(outputDir, 'v2_monogram_hat_logo.svg'), getVar2_HorizontalLogo());
  await sharp(path.join(outputDir, 'v2_monogram_hat_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'v2_monogram_hat_icon.png'));
  await sharp(path.join(outputDir, 'v2_monogram_hat_logo.svg')).resize(1640, 400).png().toFile(path.join(outputDir, 'v2_monogram_hat_logo.png'));

  // Var 3
  fs.writeFileSync(path.join(outputDir, 'v3_fintech_icon.svg'), getVar3_MinimalistFintech());
  await sharp(path.join(outputDir, 'v3_fintech_icon.svg')).resize(512, 512).png().toFile(path.join(outputDir, 'v3_fintech_icon.png'));

  console.log('Simple 2D Bitcoin with Cowboy Hat assets built successfully!');
}

renderAll().catch(console.error);
