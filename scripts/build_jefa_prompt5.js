// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 5 (JUMP & TURNAROUND STRIP)
// 6 Cells of 96x96 px (576 x 96 px) | 100% Transparent PNG | Baseline y = 89
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 6;
const STRIP_W = FRAMES * CELL; // 576
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
  bootBase: [32, 46, 88]
};

// ------------------------------------------------------------------------------
// ACCIÓN 1: FÍSICA DE SALTO (JUMP - CELDAS 0..3)
// ------------------------------------------------------------------------------

// Cuadro 1 (Frame 0): Impulso / Anticipación (flexiona rodillas, baja torso 7px, brazos atrás)
const f0 = new PNG({ width: CELL, height: CELL });
f0.data.fill(0);
const jDrop = 7;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f0, x, y + jDrop, col, col[3]);
    } else if (y >= 83) {
      setPx(f0, x, y, col, col[3]);
    } else {
      setPx(f0, x, y + Math.floor(jDrop * 0.6), col, col[3]);
    }
  }
}
// Arms sweeping down for takeoff
for (let ay = 60; ay <= 72; ay++) {
  setPx(f0, 38, ay, PAL.suitBase);
  setPx(f0, 58, ay, PAL.suitBase);
}
blitCell(f0, 0);

// Cuadro 2 (Frame 1): Ascenso (Salto vertical en el aire, despegada 18px del piso, cabello flotando arriba)
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);
const lift = 18;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Entire body lifted 18px (soles at y=71)
    setPx(f1, x, y - lift, col, col[3]);
  }
}
// Hair billowing upwards with aerodynamic flow (y: 2..16)
for (let hy = 2; hy <= 14; hy++) {
  for (let hx = 40; hx <= 56; hx++) {
    if ((hx + hy) % 2 === 0) {
      setPx(f1, hx, hy, PAL.hairMid);
    }
  }
}
// Scarf flowing gracefully upwards
setPx(f1, 46, 26, PAL.scarfHi);
setPx(f1, 47, 25, PAL.scarfBase);
setPx(f1, 48, 24, PAL.scarfHi);
blitCell(f1, 1);

// Cuadro 3 (Frame 2): Ápice y Caída (Punto máximo y descenso, piernas semiflexionadas preparadas para impacto)
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);
const apexLift = 15;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f2, x, y - apexLift, col, col[3]);
    } else {
      // Legs tucked slightly (y - apexLift - 2)
      setPx(f2, x, y - apexLift - 2, col, col[3]);
    }
  }
}
blitCell(f2, 2);

// Cuadro 4 (Frame 3): Aterrizaje (Toca el suelo flexionando piernas para amortiguar)
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);
const landDrop = 8;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f3, x, y + landDrop, col, col[3]);
    } else if (y >= 83) {
      setPx(f3, x, y, col, col[3]);
    } else {
      setPx(f3, x, y + Math.floor(landDrop * 0.6), col, col[3]);
    }
  }
}
blitCell(f3, 3);

// ------------------------------------------------------------------------------
// ACCIÓN 2: GIRO DE DIRECCIÓN (TURNAROUND - CELDAS 4..5)
// ------------------------------------------------------------------------------

// Cuadro 5 (Frame 4): Transición frontal (3/4 frontal pivoteando sobre los pies)
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Symmetrical frontal stance centering shoulders and scarf
    const cx = Math.round(48 + (x - 48) * 0.9);
    setPx(f4, cx, y, col, col[3]);
  }
}
// Frontal chest & symmetrical scarf
for (let sy = 39; sy <= 45; sy++) {
  for (let sx = 44; sx <= 52; sx++) {
    setPx(f4, sx, sy, PAL.scarfBase);
  }
}
blitCell(f4, 4);

// Cuadro 6 (Frame 5): Asienta los pies en dirección contraria en posición de guardia (flipped)
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);
// Mirrored horizontally about center x=48
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    const mirX = 96 - 1 - x;
    setPx(f5, mirX, y, col, col[3]);
  }
}
blitCell(f5, 5);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritestrip_jump_turn_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritestrip_jump_turn_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritestrip_jump_turn_96x96.png';

const buf = PNG.sync.write(strip);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 5: jefa_spritestrip_jump_turn_96x96.png (576x96)");
