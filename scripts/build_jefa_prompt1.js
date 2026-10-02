// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 1 (IDLE & CROUCH SPRITE STRIP)
// 7 Cells of 96x96 px (672 x 96 px) | 100% Transparent PNG | Baseline y = 89
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 7;
const STRIP_W = FRAMES * CELL; // 672
const STRIP_H = CELL;          // 96
const GROUND_Y = 89;

const strip = new PNG({ width: STRIP_W, height: STRIP_H });
strip.data.fill(0);

// Helper pixel functions
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

// Color palette
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
  bootDark: [18, 24, 46]
};

// Segments definition:
// Head & hair: y < 38
// Neck & scarf: 38 <= y < 46
// Torso & arms: 46 <= y < 62
// Pelvis & belt: 62 <= y < 70
// Legs: 70 <= y < 82
// Boots & feet: 82 <= y <= 89

// FRAME 0 (Cuadro 1): Base Ground Truth
const f0 = new PNG({ width: CELL, height: CELL });
f0.data.fill(0);
for (let i = 0; i < base.data.length; i++) f0.data[i] = base.data[i];
blitCell(f0, 0);

// FRAME 1 (Cuadro 2): Respiración Sutil (torso sube 1px, pañuelo oscila)
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 62) {
      // Upper body lifted by 1px
      setPx(f1, x, y - 1, col, col[3]);
    } else {
      setPx(f1, x, y, col, col[3]);
    }
  }
}
// Subtle scarf oscillation at neck:
for (let sy = 37; sy <= 43; sy++) {
  setPx(f1, 48, sy - 1, PAL.scarfHi);
  setPx(f1, 49, sy - 1, PAL.scarfBase);
}
blitCell(f1, 1);

// FRAME 2 (Cuadro 3): Punto más alto de respiración y gesticulación leve
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 62) {
      setPx(f2, x, y - 1, col, col[3]);
    } else {
      setPx(f2, x, y, col, col[3]);
    }
  }
}
// Hand gesture raised slightly with authority (right arm / hand gesticulating at x: 50..58, y: 44..52)
for (let gy = 44; gy <= 50; gy++) {
  for (let gx = 52; gx <= 58; gx++) {
    const orig = getPx(base, gx, gy);
    if (orig[3] > 0) {
      setPx(f2, gx, gy, [0, 0, 0, 0], 0);
      setPx(f2, gx + 1, gy - 2, orig, orig[3]);
    }
  }
}
// Scarf breeze tip
setPx(f2, 50, 42, PAL.scarfHi);
setPx(f2, 51, 42, PAL.scarfBase);
blitCell(f2, 2);

// FRAME 3 (Cuadro 4): Retorno suave al Cuadro 1 (in between)
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col0 = getPx(f0, x, y);
    const col1 = getPx(f1, x, y);
    if (col1[3] > 0) {
      setPx(f3, x, y, col1, col1[3]);
    } else if (col0[3] > 0) {
      setPx(f3, x, y, col0, col0[3]);
    }
  }
}
blitCell(f3, 3);

// FRAME 4 (Cuadro 5): Descenso agachado (rodillas flexionan, torso baja ~6px)
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);
const drop5 = 6;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 68) {
      // Upper body & hips drop by 6px
      setPx(f4, x, y + drop5, col, col[3]);
    } else if (y >= 82) {
      // Boots anchored firmly at ground
      setPx(f4, x, y, col, col[3]);
    } else {
      // Flexed knees widening slightly
      const kneeX = x < 48 ? x - 1 : x + 1;
      setPx(f4, kneeX, y + Math.floor(drop5 * 0.5), col, col[3]);
    }
  }
}
blitCell(f4, 4);

// FRAME 5 (Cuadro 6): Agachada fija / guardia baja (drop 13px, brazos protegiendo)
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);
const drop6 = 13;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 66) {
      // Upper body compressed and dropped
      setPx(f5, x, y + drop6, col, col[3]);
    } else if (y >= 83) {
      // Soles anchored on baseline y=89
      setPx(f5, x, y, col, col[3]);
    } else {
      // Deep knee bend
      const kx = x < 48 ? x - 2 : x + 2;
      setPx(f5, kx, y + Math.floor(drop6 * 0.6), col, col[3]);
    }
  }
}
// Defensive arm tucking in low guard
for (let ay = 64; ay <= 74; ay++) {
  for (let ax = 42; ax <= 56; ax++) {
    if (ax % 2 === 0) setPx(f5, ax, ay, PAL.suitBase);
  }
}
blitCell(f5, 5);

// FRAME 6 (Cuadro 7): Ascenso (reincorporándose, drop 6px hacia Cuadro 1)
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const c4 = getPx(f4, x, y);
    if (c4[3] > 0) setPx(f6, x, y, c4, c4[3]);
  }
}
blitCell(f6, 6);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritestrip_idle_crouch_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritestrip_idle_crouch_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritestrip_idle_crouch_96x96.png';

const buf = PNG.sync.write(strip);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 1: jefa_spritestrip_idle_crouch_96x96.png (672x96)");
