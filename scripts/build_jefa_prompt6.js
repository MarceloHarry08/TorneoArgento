// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 6 (SPECIALS, VFX & FATALITY SHEET)
// Grid: 96x96 px | 6 Columns x 3 Rows (576 x 288 px) | 100% Transparent PNG
//
// Fila 1 (Row 0): LANZAMIENTO DE PODER (4 cuadros del personaje)
// Fila 2 (Row 1): VFX DEL PODER (4 cuadros independientes de proyectil sónico)
// Fila 3 (Row 2): FATALITY (6 cuadros: Atril presidencial demoledor + Saludo en "V")
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const COLS = 6;
const ROWS = 3;
const SHEET_W = COLS * CELL; // 576
const SHEET_H = ROWS * CELL; // 288
const GROUND_Y = 89;

const sheet = new PNG({ width: SHEET_W, height: SHEET_H });
sheet.data.fill(0);

function getPx(png, x, y) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return [0, 0, 0, 0];
  const idx = (y * png.width + x) << 2;
  return [png.data[idx], png.data[idx+1], png.data[idx+2], png.data[idx+3]];
}

function setPx(png, x, y, col, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (y * png.width + x) << 2;
  png.data[idx] = col[0];
  png.data[idx+1] = col[1];
  png.data[idx+2] = col[2];
  png.data[idx+3] = a;
}

function blitToSheet(cellPng, col, row) {
  const startX = col * CELL;
  const startY = row * CELL;
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = (y * CELL + x) << 2;
      const a = cellPng.data[sIdx + 3];
      if (a === 0) continue;
      const dIdx = ((startY + y) * SHEET_W + (startX + x)) << 2;
      sheet.data[dIdx] = cellPng.data[sIdx];
      sheet.data[dIdx + 1] = cellPng.data[sIdx + 1];
      sheet.data[dIdx + 2] = cellPng.data[sIdx + 2];
      sheet.data[dIdx + 3] = a;
    }
  }
}

const PAL = {
  outline: [14, 12, 22],
  hairDark: [48, 22, 28],
  hairBase: [78, 38, 36],
  hairMid: [110, 54, 46],
  hairHi: [142, 74, 58],
  skinBase: [225, 155, 120],
  skinHi: [245, 185, 150],
  scarfDark: [110, 15, 20],
  scarfBase: [175, 25, 30],
  scarfHi: [235, 45, 50],
  suitShadow: [165, 178, 198],
  suitBase: [238, 244, 250],
  suitHi: [255, 255, 255],
  blueAccent: [45, 85, 175],
  bootBase: [32, 46, 88],
  
  // Power VFX & Rings
  cyanGlow: [120, 215, 255],
  cyanMid: [50, 150, 245],
  cyanDeep: [20, 90, 200],
  whiteEnergy: [255, 255, 255],
  goldSolar: [255, 215, 60],
  
  // Atril Presidencial (Rich mahogany & brass microphones)
  woodDark: [52, 28, 18],
  woodBase: [95, 52, 28],
  woodMid: [135, 78, 42],
  woodHi: [175, 108, 60],
  brassGold: [225, 185, 65],
  micSilver: [210, 220, 230],
  micBlack: [24, 24, 28]
};

// ==============================================================================
// FILA 1 (ROW 0): LANZAMIENTO DE PODER (4 CUADROS)
// ==============================================================================

// Cuadro 1 (Col 0): Manos en alto convocando energía patriótica
const r0_c0 = new PNG({ width: CELL, height: CELL });
r0_c0.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(r0_c0, x, y, col, col[3]);
  }
}
// Both arms raised high summoning celestial aura at x: 38..58, y: 16..38
for (let ay = 18; ay <= 38; ay++) {
  setPx(r0_c0, 36, ay, PAL.suitBase);
  setPx(r0_c0, 37, ay, PAL.suitHi);
  setPx(r0_c0, 58, ay, PAL.suitBase);
  setPx(r0_c0, 59, ay, PAL.suitHi);
}
// Raised open palms gathering energy
for (let hy = 12; hy <= 18; hy++) {
  for (let hx = 33; hx <= 39; hx++) setPx(r0_c0, hx, hy, PAL.skinHi);
  for (let hx = 56; hx <= 62; hx++) setPx(r0_c0, hx, hy, PAL.skinHi);
}
// Gathering sparks
setPx(r0_c0, 36, 10, PAL.cyanGlow);
setPx(r0_c0, 59, 10, PAL.cyanGlow);
setPx(r0_c0, 48, 12, PAL.goldSolar);
blitToSheet(r0_c0, 0, 0);

// Cuadro 2 (Col 1): Extiende ambas manos hacia adelante con fuerza lanzando onda expansiva
const r0_c1 = new PNG({ width: CELL, height: CELL });
r0_c1.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(r0_c1, x + 4, y, col, col[3]);
    } else {
      setPx(r0_c1, x, y, col, col[3]);
    }
  }
}
// Both arms thrust forward horizontally (x: 48..78, y: 44..52)
for (let ax = 48; ax <= 78; ax++) {
  setPx(r0_c1, ax, 44, PAL.suitBase);
  setPx(r0_c1, ax, 45, PAL.suitHi);
  setPx(r0_c1, ax, 48, PAL.suitBase);
  setPx(r0_c1, ax, 49, PAL.suitHi);
}
// Double palms thrusting blast
for (let hy = 42; hy <= 51; hy++) {
  for (let hx = 76; hx <= 82; hx++) {
    setPx(r0_c1, hx, hy, PAL.skinHi);
  }
}
// Muzzle blast of energy rings right in front of hands (x: 82..95)
for (let r = 3; r <= 8; r++) {
  for (let a = -1.3; a <= 1.3; a += 0.2) {
    const rx = Math.round(84 + Math.cos(a) * r);
    const ry = Math.round(47 + Math.sin(a) * (r * 1.5));
    if (rx < 96) {
      setPx(r0_c1, rx, ry, PAL.cyanGlow);
      setPx(r0_c1, rx + 1, ry, PAL.whiteEnergy);
    }
  }
}
blitToSheet(r0_c1, 1, 0);

// Cuadro 3 (Col 2): Recuperación con saludo triunfal (inicia elevación de brazo saludando)
const r0_c2 = new PNG({ width: CELL, height: CELL });
r0_c2.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(r0_c2, x, y, col, col[3]);
  }
}
// Right arm raised in triumphant wave at x: 54..60, y: 22..36
for (let ay = 22; ay <= 36; ay++) {
  setPx(r0_c2, 54, ay, PAL.suitBase);
  setPx(r0_c2, 55, ay, PAL.suitHi);
}
for (let hy = 16; hy <= 22; hy++) {
  for (let hx = 52; hx <= 58; hx++) setPx(r0_c2, hx, hy, PAL.skinHi);
}
blitToSheet(r0_c2, 2, 0);

// Cuadro 4 (Col 3): Saludo triunfal sostenido y retorno a guardia
const r0_c3 = new PNG({ width: CELL, height: CELL });
r0_c3.data.fill(0);
for (let i = 0; i < base.data.length; i++) r0_c3.data[i] = base.data[i];
// Scarf waving gently
setPx(r0_c3, 49, 41, PAL.scarfHi);
setPx(r0_c3, 50, 42, PAL.scarfBase);
blitToSheet(r0_c3, 3, 0);

// ==============================================================================
// FILA 2 (ROW 1): VFX DEL PODER (4 CUADROS INDEPENDIENTES DE PROYECTIL SÓNICO)
// ==============================================================================

// Proyectil F2_C0: Nacimiento de los aros celestes y blancos (compacto)
const r1_c0 = new PNG({ width: CELL, height: CELL });
r1_c0.data.fill(0);
function drawSonicRings(png, cx, cy, rad, widthFactor = 1.0) {
  for (let r = rad - 3; r <= rad; r++) {
    for (let th = -1.4; th <= 1.4; th += 0.08) {
      const rx = Math.round(cx + Math.cos(th) * (r * widthFactor));
      const ry = Math.round(cy + Math.sin(th) * (r * 1.4));
      setPx(png, rx, ry, PAL.cyanMid);
      setPx(png, rx + 1, ry, PAL.cyanGlow);
      if (r === rad) setPx(png, rx, ry, PAL.whiteEnergy);
    }
  }
}
drawSonicRings(r1_c0, 28, 48, 12, 0.7);
drawSonicRings(r1_c0, 18, 48, 8, 0.6);
// Center core flash
for (let dy = -2; dy <= 2; dy++) {
  for (let dx = -2; dx <= 2; dx++) {
    setPx(r1_c0, 28 + dx, 48 + dy, PAL.whiteEnergy);
  }
}
blitToSheet(r1_c0, 0, 1);

// Proyectil F2_C1: Expansión de aros viajando al frente
const r1_c1 = new PNG({ width: CELL, height: CELL });
r1_c1.data.fill(0);
drawSonicRings(r1_c1, 44, 48, 18, 0.8);
drawSonicRings(r1_c1, 32, 48, 14, 0.7);
drawSonicRings(r1_c1, 20, 48, 9, 0.6);
blitToSheet(r1_c1, 1, 1);

// Proyectil F2_C2: Onda de choque sónica en máxima expansión
const r1_c2 = new PNG({ width: CELL, height: CELL });
r1_c2.data.fill(0);
drawSonicRings(r1_c2, 60, 48, 24, 0.9);
drawSonicRings(r1_c2, 46, 48, 18, 0.8);
drawSonicRings(r1_c2, 32, 48, 12, 0.7);
// Outer energy sparks
setPx(r1_c2, 78, 30, PAL.goldSolar);
setPx(r1_c2, 78, 66, PAL.goldSolar);
setPx(r1_c2, 84, 48, PAL.whiteEnergy);
blitToSheet(r1_c2, 2, 1);

// Proyectil F2_C3: Dispersión de estela sónica
const r1_c3 = new PNG({ width: CELL, height: CELL });
r1_c3.data.fill(0);
drawSonicRings(r1_c3, 76, 48, 28, 0.95);
drawSonicRings(r1_c3, 58, 48, 20, 0.85);
blitToSheet(r1_c3, 3, 1);

// ==============================================================================
// FILA 3 (ROW 2): FATALITY (6 CUADROS: ATRIL DEMOLEDOR + SALUDO EN "V")
// ==============================================================================

// Helper to draw presidential mahogany podium (Atril)
function drawAtril(png, topX, topY, w, h) {
  // Slanted top reading desk
  for (let x = topX - 14; x <= topX + 14; x++) {
    for (let y = topY; y <= topY + 6; y++) {
      setPx(png, x, y, (x % 3 === 0) ? PAL.woodHi : PAL.woodBase);
    }
  }
  // Dual presidential gooseneck microphones
  for (let my = topY - 10; my <= topY; my++) {
    setPx(png, topX - 8, my, PAL.micSilver);
    setPx(png, topX + 8, my, PAL.micSilver);
  }
  setPx(png, topX - 8, topY - 11, PAL.micBlack);
  setPx(png, topX + 8, topY - 11, PAL.micBlack);
  
  // Main heavy column / wooden pedestal
  for (let y = topY + 7; y <= topY + h; y++) {
    for (let x = topX - 10; x <= topX + 10; x++) {
      let c = PAL.woodBase;
      if (x === topX - 10 || x === topX + 10) c = PAL.woodDark;
      else if (x === topX - 8) c = PAL.woodHi;
      // Brass Argentine seal plaque in center
      if (y >= topY + 12 && y <= topY + 20 && x >= topX - 4 && x <= topX + 4) {
        c = PAL.brassGold;
      }
      setPx(png, x, y, c);
    }
  }
  // Heavy stepped base of podium
  for (let bx = topX - 16; bx <= topX + 16; bx++) {
    for (let by = topY + h + 1; by <= topY + h + 5; by++) {
      setPx(png, bx, by, PAL.woodDark);
      if (by === topY + h + 1) setPx(png, bx, by, PAL.woodHi);
    }
  }
}

// Cuadro 1 (Col 0): Atril desciende desde lo alto (y: 8..45)
const r2_c0 = new PNG({ width: CELL, height: CELL });
r2_c0.data.fill(0);
drawAtril(r2_c0, 48, 14, 20, 32);
// Downward motion blur lines
for (let y = 48; y <= 75; y += 4) {
  setPx(r2_c0, 38, y, PAL.cyanGlow);
  setPx(r2_c0, 58, y, PAL.cyanGlow);
}
blitToSheet(r2_c0, 0, 2);

// Cuadro 2 (Col 1): Atril en picada acelerada a centímetros del impacto (y: 42..82)
const r2_c1 = new PNG({ width: CELL, height: CELL });
r2_c1.data.fill(0);
drawAtril(r2_c1, 48, 44, 20, 36);
// Speed streaks
for (let y = 10; y <= 40; y += 3) {
  setPx(r2_c1, 40, y, PAL.whiteEnergy);
  setPx(r2_c1, 56, y, PAL.whiteEnergy);
}
blitToSheet(r2_c1, 1, 2);

// Cuadro 3 (Col 2): IMPACTO DEMOLEDOR contra el suelo (y=89), astillas y choque sísmico
const r2_c2 = new PNG({ width: CELL, height: CELL });
r2_c2.data.fill(0);
drawAtril(r2_c2, 48, 52, 20, 32);
// Ground shockwave & wood splinters flying
for (let dx = -36; dx <= 36; dx++) {
  setPx(r2_c2, 48 + dx, 88, PAL.whiteEnergy);
  setPx(r2_c2, 48 + dx, 89, PAL.cyanGlow);
}
// Splinters flying up in explosion
const splinters = [[-18, 70], [-25, 62], [22, 68], [28, 60], [-12, 54], [14, 52]];
splinters.forEach(([sx, sy]) => {
  setPx(r2_c2, 48 + sx, sy, PAL.woodHi);
  setPx(r2_c2, 48 + sx + 1, sy, PAL.woodDark);
});
blitToSheet(r2_c2, 2, 2);

// Cuadro 4 (Col 3): "La Jefa" da un paso al frente elegante
const r2_c3 = new PNG({ width: CELL, height: CELL });
r2_c3.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Step forward +4px
    setPx(r2_c3, x + 4, y, col, col[3]);
  }
}
blitToSheet(r2_c3, 3, 2);

// Cuadro 5 (Col 4): Se acomoda el pañuelo rojo con estilo y distinción
const r2_c4 = new PNG({ width: CELL, height: CELL });
r2_c4.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(r2_c4, x + 4, y, col, col[3]);
  }
}
// Hand adjusting the red scarf at throat (x: 48..54, y: 39..46)
for (let ay = 38; ay <= 46; ay++) {
  for (let ax = 48; ax <= 55; ax++) {
    setPx(r2_c4, ax, ay, PAL.skinHi);
  }
}
// Scarf fabric highlighted
for (let sy = 40; sy <= 45; sy++) {
  setPx(r2_c4, 46, sy, PAL.scarfHi);
  setPx(r2_c4, 56, sy, PAL.scarfHi);
}
blitToSheet(r2_c4, 4, 2);

// Cuadro 6 (Col 5): SALUDO CON LOS DEDOS EN "V" DE LA VICTORIA (sonrisa triunfal)
const r2_c5 = new PNG({ width: CELL, height: CELL });
r2_c5.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(r2_c5, x + 4, y, col, col[3]);
  }
}
// Arm raised proudly high at shoulder height (x: 54..60, y: 22..38)
for (let ay = 20; ay <= 36; ay++) {
  setPx(r2_c5, 54, ay, PAL.suitBase);
  setPx(r2_c5, 55, ay, PAL.suitHi);
}
// Hand making the iconic "V" victory fingers at x: 50..58, y: 12..20
for (let hy = 16; hy <= 21; hy++) {
  for (let hx = 52; hx <= 57; hx++) setPx(r2_c5, hx, hy, PAL.skinBase);
}
// Two distinct "V" fingers: Index finger and Middle finger pointing up
setPx(r2_c5, 52, 12, PAL.skinHi); // Left finger tip
setPx(r2_c5, 52, 13, PAL.skinHi);
setPx(r2_c5, 52, 14, PAL.skinBase);
setPx(r2_c5, 53, 15, PAL.skinBase);

setPx(r2_c5, 56, 12, PAL.skinHi); // Right finger tip
setPx(r2_c5, 56, 13, PAL.skinHi);
setPx(r2_c5, 55, 14, PAL.skinBase);
setPx(r2_c5, 54, 15, PAL.skinBase);

// Golden victory glint on "V" fingers
setPx(r2_c5, 54, 11, PAL.goldSolar);
setPx(r2_c5, 54, 10, PAL.whiteEnergy);

blitToSheet(r2_c5, 5, 2);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritesheet_specials_fatality_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritesheet_specials_fatality_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritesheet_specials_fatality_96x96.png';

const buf = PNG.sync.write(sheet);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 6: jefa_spritesheet_specials_fatality_96x96.png (576x288)");
