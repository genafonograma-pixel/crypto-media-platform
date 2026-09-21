// create_gunslinger_vector.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outputDir = path.join(__dirname, 'public', 'gunslinger');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// -------------------------------------------------------------------------
// GUNSLINGER MASCOT 2D VECTOR - EXACT POSE MATCH
// 1. Arm elbows bend DOWN, hands reach UP
// 2. Gun barrels point UPWARDS into the air (+25 deg)
// 3. Wide western hat with sweeping upturned curls on sides
// 4. Clean, crisp 2D vector colors and bold outlines
// -------------------------------------------------------------------------

function generateGunslingerMascot(cx = 256, cy = 256, scale = 1) {
  return `
  <g id="gunslinger-character" transform="translate(${cx}, ${cy}) scale(${scale})">
    
    <!-- Contact shadow -->
    <ellipse cx="0" cy="165" rx="135" ry="16" fill="#000000" opacity="0.35" />

    <!-- 1. ARMS & DUAL REVOLVERS (UPWARD-POINTING GUNS) -->
    
    <!-- LEFT ARM & GUN -->
    <g id="left-arm-gun">
      <!-- Arm: starts at coin side (x=-90, y=40), loops DOWN to elbow (x=-135, y=95), loops UP to wrist (x=-160, y=20) -->
      <path d="
        M -92 38
        C -115 50, -135 75, -135 98
        C -135 116, -158 114, -165 92
        C -172 68, -168 36, -155 12
        C -145 10, -138 24, -128 32
        C -118 42, -105 32, -92 38
        Z
      " fill="#383F4C" stroke="#0E1015" stroke-width="4.5" stroke-linejoin="round" />

      <!-- Left Revolver & Hand: Angled UPWARDS (rotate +24 deg so left barrel points UP) -->
      <g id="left-gun-hand" transform="translate(-165, 15) rotate(22)">
        <!-- Revolver -->
        <g id="revolver-left">
          <!-- Barrel pointing left & up -->
          <rect x="-105" y="-12" width="85" height="15" rx="2" fill="#71717A" stroke="#0E1015" stroke-width="4" />
          <!-- Front Sight -->
          <polygon points="-102,-12 -97,-18 -92,-12" fill="#3F3F46" stroke="#0E1015" stroke-width="3" />
          <!-- Ejector Rod -->
          <rect x="-90" y="3" width="62" height="5" fill="#52525B" stroke="#0E1015" stroke-width="3" />
          <!-- Cylinder / Chamber -->
          <rect x="-24" y="-16" width="34" height="24" rx="4" fill="#E2E8F0" stroke="#0E1015" stroke-width="4" />
          <line x1="-16" y1="-14" x2="-16" y2="6" stroke="#64748B" stroke-width="2.5" />
          <line x1="-7" y1="-14" x2="-7" y2="6" stroke="#64748B" stroke-width="2.5" />
          <!-- Receiver Frame -->
          <path d="M 10 -14 L 18 -14 L 20 12 L 6 14 Z" fill="#71717A" stroke="#0E1015" stroke-width="4" />
          <!-- Hammer Cocked Back -->
          <path d="M 16 -14 C 23 -21, 25 -14, 19 -9 Z" fill="#27272A" stroke="#0E1015" stroke-width="3" />
          <!-- Trigger Guard -->
          <path d="M -6 12 C -6 28, 10 28, 10 12" fill="none" stroke="#0E1015" stroke-width="3.5" />
          <path d="M 1 13 Q 5 18 2 21" fill="none" stroke="#0E1015" stroke-width="3" />
          <!-- Classic Curved Wood Handle Grip -->
          <path d="
            M 14 8
            C 34 22, 38 56, 20 72
            C 2 76, -2 54, 0 40
            C 0 22, 7 12, 14 8
            Z
          " fill="#B45309" stroke="#0E1015" stroke-width="4" />
          <path d="M 18 18 Q 28 38 16 60" fill="none" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" />
        </g>

        <!-- White Gloved Hand Gripping Handle -->
        <g id="glove-left">
          <!-- Wrist Cuff -->
          <ellipse cx="10" cy="44" rx="16" ry="11" fill="#F4F4F5" stroke="#0E1015" stroke-width="4" transform="rotate(-20 10 44)" />
          <!-- Fingers -->
          <path d="
            M -4 20
            C -14 20, -14 30, -3 30
            C -14 30, -14 40, -2 40
            C -12 40, -12 52, 2 52
            C 16 52, 18 38, 16 26
            C 14 16, 4 16, -4 20
            Z
          " fill="#FFFFFF" stroke="#0E1015" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M -5 30 L 4 30" stroke="#CBD5E1" stroke-width="2" />
          <path d="M -4 40 L 6 40" stroke="#CBD5E1" stroke-width="2" />
        </g>
      </g>
    </g>

    <!-- RIGHT ARM & GUN (Mirrored symmetrically) -->
    <g id="right-arm-gun">
      <path d="
        M 92 38
        C 115 50, 135 75, 135 98
        C 135 116, 158 114, 165 92
        C 172 68, 168 36, 155 12
        C 145 10, 138 24, 128 32
        C 118 42, 105 32, 92 38
        Z
      " fill="#383F4C" stroke="#0E1015" stroke-width="4.5" stroke-linejoin="round" />

      <g id="right-gun-hand" transform="translate(165, 15) scale(-1, 1) rotate(22)">
        <g id="revolver-right">
          <rect x="-105" y="-12" width="85" height="15" rx="2" fill="#71717A" stroke="#0E1015" stroke-width="4" />
          <polygon points="-102,-12 -97,-18 -92,-12" fill="#3F3F46" stroke="#0E1015" stroke-width="3" />
          <rect x="-90" y="3" width="62" height="5" fill="#52525B" stroke="#0E1015" stroke-width="3" />
          <rect x="-24" y="-16" width="34" height="24" rx="4" fill="#E2E8F0" stroke="#0E1015" stroke-width="4" />
          <line x1="-16" y1="-14" x2="-16" y2="6" stroke="#64748B" stroke-width="2.5" />
          <line x1="-7" y1="-14" x2="-7" y2="6" stroke="#64748B" stroke-width="2.5" />
          <path d="M 10 -14 L 18 -14 L 20 12 L 6 14 Z" fill="#71717A" stroke="#0E1015" stroke-width="4" />
          <path d="M 16 -14 C 23 -21, 25 -14, 19 -9 Z" fill="#27272A" stroke="#0E1015" stroke-width="3" />
          <path d="M -6 12 C -6 28, 10 28, 10 12" fill="none" stroke="#0E1015" stroke-width="3.5" />
          <path d="M 1 13 Q 5 18 2 21" fill="none" stroke="#0E1015" stroke-width="3" />
          <path d="
            M 14 8
            C 34 22, 38 56, 20 72
            C 2 76, -2 54, 0 40
            C 0 22, 7 12, 14 8
            Z
          " fill="#B45309" stroke="#0E1015" stroke-width="4" />
          <path d="M 18 18 Q 28 38 16 60" fill="none" stroke="#78350F" stroke-width="2.5" stroke-linecap="round" />
        </g>

        <g id="glove-right">
          <ellipse cx="10" cy="44" rx="16" ry="11" fill="#F4F4F5" stroke="#0E1015" stroke-width="4" transform="rotate(-20 10 44)" />
          <path d="
            M -4 20
            C -14 20, -14 30, -3 30
            C -14 30, -14 40, -2 40
            C -12 40, -12 52, 2 52
            C 16 52, 18 38, 16 26
            C 14 16, 4 16, -4 20
            Z
          " fill="#FFFFFF" stroke="#0E1015" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M -5 30 L 4 30" stroke="#CBD5E1" stroke-width="2" />
          <path d="M -4 40 L 6 40" stroke="#CBD5E1" stroke-width="2" />
        </g>
      </g>
    </g>

    <!-- 2. BITCOIN COIN BODY -->
    <g id="coin-body" transform="translate(0, 36)">
      <!-- Outer coin edge 3D profile -->
      <circle cx="0" cy="6" r="112" fill="#92400E" stroke="#0E1015" stroke-width="5" />
      
      <!-- Main Golden Coin Face -->
      <circle cx="0" cy="0" r="110" fill="#F59E0B" stroke="#0E1015" stroke-width="5" />

      <!-- Coin Inner Border Ring with milling dashes -->
      <circle cx="0" cy="0" r="94" fill="none" stroke="#D97706" stroke-width="4" />
      <circle cx="0" cy="0" r="94" fill="none" stroke="#FEF08A" stroke-width="3" stroke-dasharray="5 7" />

      <!-- Cel-shaded diagonal shine streak -->
      <path d="
        M -80 -70
        L -40 -90
        L 75 35
        L 35 55
        Z
      " fill="#FFFFFF" opacity="0.22" />

      <!-- Iconic Bitcoin ₿ Symbol (Large, Crisp, Bold) -->
      <g id="btc-symbol" transform="translate(0, 2) scale(1.26)">
        <!-- Top Stems -->
        <rect x="-9" y="-56" width="6.5" height="18" rx="2" fill="#D97706" stroke="#0E1015" stroke-width="3" />
        <rect x="6.5" y="-56" width="6.5" height="18" rx="2" fill="#D97706" stroke="#0E1015" stroke-width="3" />
        <!-- Bottom Stems -->
        <rect x="-9" y="38" width="6.5" height="18" rx="2" fill="#D97706" stroke="#0E1015" stroke-width="3" />
        <rect x="6.5" y="38" width="6.5" height="18" rx="2" fill="#D97706" stroke="#0E1015" stroke-width="3" />

        <!-- 'B' Main Outline -->
        <path d="
          M -28 -42
          L 16 -42
          C 34 -42, 46 -32, 46 -17
          C 46 -6, 36 2, 24 5
          C 40 8, 50 18, 50 33
          C 50 50, 34 58, 12 58
          L -28 58
          L -28 40
          L -12 40
          L -12 -24
          L -28 -24
          Z
          M 4 -24
          L 16 -24
          C 24 -24, 30 -20, 30 -14
          C 30 -8, 24 -4, 16 -4
          L 4 -4
          Z
          M 4 12
          L 18 12
          C 26 12, 34 17, 34 25
          C 34 33, 26 40, 18 40
          L 4 40
          Z
        " fill="#D97706" fill-rule="evenodd" stroke="#0E1015" stroke-width="4.5" stroke-linejoin="round" />

        <!-- Highlights on B -->
        <path d="M -10 -22 L 14 -22" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" />
        <path d="M -10 14 L 16 14" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" />
      </g>
    </g>

    <!-- 3. COWBOY HAT (Classic Western Sweeping Upturned Brim) -->
    <g id="cowboy-hat" transform="translate(0, -62)">
      <!-- Hat Shadow cast across the coin -->
      <path d="
        M -92 42
        C -45 74, 45 74, 92 42
        C 45 50, -45 50, -92 42
        Z
      " fill="#000000" opacity="0.32" />

      <!-- Hat Crown -->
      <path d="
        M -64 30
        C -60 -30, -48 -76, -22 -72
        C -10 -68, -4 -50, 0 -50
        C 4 -50, 10 -68, 22 -72
        C 48 -76, 60 -30, 64 30
        Z
      " fill="#D97706" stroke="#0E1015" stroke-width="5" stroke-linejoin="round" />

      <!-- Center Crease Shadow -->
      <path d="
        M -10 -54
        C -3 -30, -1 -8, 0 10
        C 1 -8, 3 -30, 10 -54
        Z
      " fill="#92400E" stroke="#0E1015" stroke-width="2" />

      <!-- Pinch Dimples -->
      <path d="M -38 -34 Q -22 -12, -30 16" fill="none" stroke="#92400E" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 38 -34 Q 22 -12, 30 16" fill="none" stroke="#92400E" stroke-width="3.5" stroke-linecap="round" />

      <!-- Leather Hat Band -->
      <path d="
        M -65 20
        Q 0 34 65 20
        L 66 33
        Q 0 47 -66 33
        Z
      " fill="#3B1E08" stroke="#0E1015" stroke-width="3" />
      <!-- Gold Buckle -->
      <rect x="-11" y="24" width="22" height="15" rx="3" fill="#FBBF24" stroke="#0E1015" stroke-width="2.5" />
      <rect x="-5" y="28" width="10" height="7" rx="1" fill="#3B1E08" />

      <!-- Wide Sweeping Upturned Brim (curling UP on left and right) -->
      <path d="
        M -155 -6
        C -125 -10, -85 36, 0 36
        C 85 36, 125 -10, 155 -6
        C 142 54, 75 68, 0 68
        C -75 68, -142 54, -155 -6
        Z
      " fill="#B45309" stroke="#0E1015" stroke-width="5" stroke-linejoin="round" />

      <!-- Brim Top Rolled Highlight -->
      <path d="
        M -148 -2
        C -118 -5, -80 39, 0 39
        C 80 39, 118 -5, 148 -2
      " fill="none" stroke="#FEF08A" stroke-width="3.5" stroke-linecap="round" />
    </g>

  </g>
  `;
}

// 1. App Icon (Square Squircle 512x512)
function getGunslingerAppIcon(size = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" fill="none">
  <!-- Rounded Squircle Dark Canvas -->
  <rect width="512" height="512" rx="112" fill="#0A0B0E" />
  <rect x="2" y="2" width="508" height="508" rx="110" stroke="#222736" stroke-width="3" />
  
  <!-- Subtle Amber Glow -->
  <circle cx="256" cy="256" r="170" fill="#F59E0B" fill-opacity="0.08" />

  <!-- Character Centered -->
  ${generateGunslingerMascot(256, 252, 0.88)}
</svg>`;
}

// 2. Full Horizontal Brand Logo (980x280)
function getGunslingerLogo(width = 980, height = 280) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 280" width="${width}" height="${height}" fill="none">
  <rect width="980" height="280" fill="#0A0B0E" />

  <!-- Mascot on Left -->
  ${generateGunslingerMascot(175, 142, 0.58)}

  <!-- Typography: Pure Bold Modern Geometric Sans -->
  <!-- Line 1: wildwest -->
  <text
    x="345"
    y="126"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="96"
    font-weight="900"
    letter-spacing="-0.04em"
    fill="#FFFFFF"
  >wildwest</text>

  <!-- Line 2: crypto show -->
  <text
    x="348"
    y="204"
    font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="76"
    font-weight="800"
    letter-spacing="-0.03em"
    fill="#F59E0B"
  >crypto <tspan fill="#FFFFFF" font-weight="700">show</tspan></text>
</svg>`;
}

// 3. Standalone Transparent Vector Mascot (512x512)
function getGunslingerTransparent(width = 512, height = 512) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}" fill="none">
  ${generateGunslingerMascot(256, 252, 0.88)}
</svg>`;
}

async function renderGunslingerAssets() {
  fs.writeFileSync(path.join(outputDir, 'wildwest_gunslinger_icon.svg'), getGunslingerAppIcon());
  fs.writeFileSync(path.join(outputDir, 'wildwest_gunslinger_logo.svg'), getGunslingerLogo());
  fs.writeFileSync(path.join(outputDir, 'wildwest_gunslinger_mark.svg'), getGunslingerTransparent());

  await sharp(path.join(outputDir, 'wildwest_gunslinger_icon.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'wildwest_gunslinger_icon.png'));

  await sharp(path.join(outputDir, 'wildwest_gunslinger_icon.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'wildwest_gunslinger_icon_1024.png'));

  await sharp(path.join(outputDir, 'wildwest_gunslinger_logo.svg'))
    .resize(1960, 560)
    .png()
    .toFile(path.join(outputDir, 'wildwest_gunslinger_logo.png'));

  await sharp(path.join(outputDir, 'wildwest_gunslinger_mark.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'wildwest_gunslinger_mark.png'));

  // Copy to public/ root
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_icon.svg'), path.join(__dirname, 'public', 'wildwest_icon.svg'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_icon.png'), path.join(__dirname, 'public', 'wildwest_icon.png'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_logo.svg'), path.join(__dirname, 'public', 'wildwest_logo.svg'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_logo.png'), path.join(__dirname, 'public', 'wildwest_logo.png'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_mark.svg'), path.join(__dirname, 'public', 'wildwest_mark.svg'));
  fs.copyFileSync(path.join(outputDir, 'wildwest_gunslinger_mark.png'), path.join(__dirname, 'public', 'wildwest_mark.png'));

  await sharp(path.join(outputDir, 'wildwest_gunslinger_icon.svg'))
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));

  console.log('Gunslinger vector brand assets updated successfully!');
}

renderGunslingerAssets().catch(console.error);
