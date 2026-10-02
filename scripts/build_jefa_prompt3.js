// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 3 (HIGH KICK & LOW KICK / SWEEP STRIP)
// 8 Cells of 96x96 px (768 x 96 px) | 100% Transparent PNG | Baseline y = 89
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 8;
const STRIP_W = FRAMES * CELL; // 768
const STRIP_H = CELL;          // 96
const GROUND_Y = 89;

const strip = new PNG({ width: STRIP_W, height: STRIP_H });
strip.data.fill(0);

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

function blitCell(srcCell, frameIdx) {
  const startX = frameIdx * CELL;
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = (y * CELL + x) << 2;
      const a = srcCell.data[sIdx + 3];
      if (a === 0) continue;
      const dIdx = (y * STRIP_W + (startX + x)) << 2;
      strip.data[dIdx] = srcCell.data[sIdx];
      strip.data[dIdx + 1] = srcCell.data[sIdx + 1];
      strip.data[dIdx + 2] = srcCell.data[sIdx + 2];
      strip.data[dIdx + 3] = a;
    }
  }
}

const PAL = {
  outline: [14, 12, 22],
  hairDark: [48, 22, 28],
  hairBase: [78, 38, 36],
  hairMid: [110, 54, 46],
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
  bootDark: [18, 24, 46],
  bootHeel: [12, 16, 32],
  sparkWhite: [255, 255, 255],
  sparkBlue: [120, 215, 255]
};

// ------------------------------------------------------------------------------
// ACCIÓN 1: PATADA ALTA / Tecla SUPR (HIGH KICK - 4 CUADROS)
// ------------------------------------------------------------------------------

// Cuadro 1 (Frame 0): Anticipación (peso pasa a pierna trasera, levanta rodilla delantera flexionada al pecho)
const f0 = new PNG({ width: CELL, height: CELL });
f0.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Shift slightly back onto support leg (x - 3)
    if (y < 70) {
      setPx(f0, x - 3, y, col, col[3]);
    } else if (x < 46) {
      // Support leg stays firmly planted
      setPx(f0, x - 3, y, col, col[3]);
    }
  }
}
// Lifted knee folded towards chest at x: 44..56, y: 50..66
for (let ky = 52; ky <= 64; ky++) {
  for (let kx = 45; kx <= 56; kx++) {
    setPx(f0, kx, ky, PAL.suitBase);
  }
}
// Boot tucked under bent knee at x: 42..50, y: 64..75
for (let by = 65; by <= 75; by++) {
  for (let bx = 42; bx <= 50; bx++) {
    setPx(f0, bx, by, PAL.bootBase);
  }
}
blitCell(f0, 0);

// Cuadro 2 (Frame 1): Impacto Activo (Extensión total en diagonal arriba al mentón con taco definido, torso atrás)
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      // Upper body tilted back to balance kick
      setPx(f1, x - 6, y + 2, col, col[3]);
    } else if (x < 46) {
      // Support leg
      setPx(f1, x - 4, y, col, col[3]);
    }
  }
}
// High kicking leg extending in diagonal: hip (44, 62) -> knee (58, 48) -> ankle (72, 34) -> foot (82, 24)
for (let t = 0; t <= 1; t += 0.02) {
  const kx = Math.round(44 + (80 - 44) * t);
  const ky = Math.round(62 + (24 - 62) * t);
  for (let w = -3; w <= 3; w++) {
    setPx(f1, kx, ky + w, t < 0.7 ? PAL.suitBase : PAL.bootBase);
    if (w === -3 || w === 3) setPx(f1, kx, ky + w, PAL.outline);
  }
}
// High boot foot & sharp dress heel pointing upwards at x: 80..86, y: 20..30
for (let by = 20; by <= 28; by++) {
  for (let bx = 78; bx <= 86; bx++) {
    setPx(f1, bx, by, PAL.bootBase);
  }
}
// Sharp high heel feature
for (let hy = 28; hy <= 33; hy++) {
  setPx(f1, 80, hy, PAL.bootHeel);
}
// Kinetic impact flash
setPx(f1, 86, 22, PAL.sparkWhite);
setPx(f1, 88, 21, PAL.sparkBlue);
setPx(f1, 87, 24, PAL.sparkWhite);
blitCell(f1, 1);

// Cuadro 3 (Frame 2): Recuperación (flexiona la rodilla bajando velozmente)
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f2, x - 2, y + 1, col, col[3]);
    } else if (x < 46) {
      setPx(f2, x - 2, y, col, col[3]);
    }
  }
}
// Retracting leg at intermediate height: hip (44, 64) -> knee (60, 58) -> foot (64, 70)
for (let ky = 56; ky <= 68; ky++) {
  for (let kx = 52; kx <= 64; kx++) {
    setPx(f2, kx, ky, PAL.suitBase);
  }
}
for (let by = 68; by <= 78; by++) {
  for (let bx = 56; bx <= 66; bx++) {
    setPx(f2, bx, by, PAL.bootBase);
  }
}
blitCell(f2, 2);

// Cuadro 4 (Frame 3): Aterrizaje (apoya el pie en el piso y vuelve a guardia)
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);
for (let i = 0; i < base.data.length; i++) f3.data[i] = base.data[i];
blitCell(f3, 3);

// ------------------------------------------------------------------------------
// ACCIÓN 2: PATADA BAJA / BARRIDA / Tecla FIN (LOW KICK / SWEEP - 4 CUADROS)
// ------------------------------------------------------------------------------

// Cuadro 5 (Frame 4): Flexión baja (agacha el torso flexionando pierna de apoyo casi hasta el piso)
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);
const sDrop = 18;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      // Deep crouch drop
      setPx(f4, x - 4, Math.min(GROUND_Y - 14, y + sDrop), col, col[3]);
    } else if (y >= 82) {
      // Support foot grounded at y=89
      setPx(f4, x - 4, Math.min(GROUND_Y, y), col, col[3]);
    } else {
      setPx(f4, x - 4, Math.min(GROUND_Y - 2, y + Math.floor(sDrop * 0.4)), col, col[3]);
    }
  }
}
blitCell(f4, 4);

// Cuadro 6 (Frame 5): Barrida Horizontal (patada rasante al ras del suelo para barrer tobillos)
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f5, x - 6, Math.min(GROUND_Y - 14, y + sDrop), col, col[3]);
    } else if (x < 44 && y >= 82) {
      // Grounded crouching foot
      setPx(f5, x - 6, Math.min(GROUND_Y, y), col, col[3]);
    }
  }
}
// Extended horizontal leg sweeping across ground at y: 84..89, x: 42..86
for (let sx = 40; sx <= 82; sx++) {
  for (let sy = 84; sy <= 89; sy++) {
    setPx(f5, sx, sy, sx < 70 ? PAL.suitBase : PAL.bootBase);
  }
}
// Boot tip and heel sweeping across floor
for (let bx = 80; bx <= 87; bx++) {
  for (let by = 83; by <= 89; by++) {
    setPx(f5, bx, by, PAL.bootBase);
  }
}
// Dust / impact pixels on ground sweep
setPx(f5, 87, 88, PAL.sparkBlue);
setPx(f5, 88, 89, PAL.sparkWhite);
setPx(f5, 89, 88, PAL.sparkBlue);
blitCell(f5, 5);

// Cuadro 7 (Frame 6): Recuperación (recoge pierna estirada apoyando mano en el suelo)
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f6, x - 2, Math.min(GROUND_Y - 14, y + 14), col, col[3]);
    } else if (y >= 82) {
      setPx(f6, x - 2, Math.min(GROUND_Y, y), col, col[3]);
    } else {
      setPx(f6, x - 2, Math.min(GROUND_Y - 2, y + 6), col, col[3]);
    }
  }
}
// Hand supporting on ground at x: 34..40, y: 85..89
for (let hy = 84; hy <= 89; hy++) {
  for (let hx = 34; hx <= 40; hx++) {
    setPx(f6, hx, hy, PAL.skinHi);
  }
}
// Leg folding back at x: 44..62, y: 80..88
for (let ly = 80; ly <= 88; ly++) {
  for (let lx = 44; lx <= 62; lx++) {
    setPx(f6, lx, ly, lx < 54 ? PAL.suitBase : PAL.bootBase);
  }
}
blitCell(f6, 6);

// Cuadro 8 (Frame 7): Reincorporación (vuelve a postura agachada estándar)
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);
const cDrop7 = 13;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 66) {
      setPx(f7, x, y + cDrop7, col, col[3]);
    } else if (y >= 83) {
      setPx(f7, x, y, col, col[3]);
    } else {
      const kx = x < 48 ? x - 2 : x + 2;
      setPx(f7, kx, y + Math.floor(cDrop7 * 0.6), col, col[3]);
    }
  }
}
blitCell(f7, 7);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritestrip_kicks_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritestrip_kicks_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritestrip_kicks_96x96.png';

const buf = PNG.sync.write(strip);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 3: jefa_spritestrip_kicks_96x96.png (768x96)");
