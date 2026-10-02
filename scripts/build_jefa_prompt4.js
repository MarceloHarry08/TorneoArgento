// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 4 (BLOCK, WALK & RUN SPRITE STRIP)
// 11 Cells of 96x96 px (1056 x 96 px) | 100% Transparent PNG | Baseline y = 89
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BASE_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 11;
const STRIP_W = FRAMES * CELL; // 1056
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
  sparkWhite: [255, 255, 255],
  sparkCyan: [100, 220, 255]
};

// ------------------------------------------------------------------------------
// ACCIÓN 1: BLOQUEO / Tecla RE PÁG (BLOCK - CELDAS 0..2)
// ------------------------------------------------------------------------------

// Cuadro 1 (Frame 0): Entrada (Cruza los antebrazos frente al rostro y pecho)
const f0 = new PNG({ width: CELL, height: CELL });
f0.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(f0, x, y, col, col[3]);
  }
}
// Crossed forearms guarding face & chest at x: 44..58, y: 38..52
for (let ay = 38; ay <= 52; ay++) {
  for (let ax = 46; ax <= 58; ax++) {
    setPx(f0, ax, ay, PAL.suitBase);
  }
}
for (let hx = 44; hx <= 50; hx++) {
  setPx(f0, hx, 38, PAL.skinHi);
  setPx(f0, hx + 8, 40, PAL.skinHi);
}
blitCell(f0, 0);

// Cuadro 2 (Frame 1): Guardia Sostenida (Firme en el suelo absorbiendo impacto, pañuelo tenso)
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Solid braced stance
    setPx(f1, x - 1, y, col, col[3]);
  }
}
// Crossed arms shield
for (let ay = 36; ay <= 52; ay++) {
  for (let ax = 45; ax <= 59; ax++) {
    setPx(f1, ax, ay, PAL.suitBase);
  }
}
// Taut scarf
for (let sy = 38; sy <= 43; sy++) {
  setPx(f1, 44, sy, PAL.scarfHi);
  setPx(f1, 45, sy, PAL.scarfBase);
}
blitCell(f1, 1);

// Cuadro 3 (Frame 2): Impacto (Pequeño retroceso con chispas de píxeles al frenar golpe)
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Push back 3px
    setPx(f2, x - 3, y, col, col[3]);
  }
}
// Crossed arms
for (let ay = 36; ay <= 52; ay++) {
  for (let ax = 42; ax <= 56; ax++) {
    setPx(f2, ax, ay, PAL.suitBase);
  }
}
// Block impact sparks on front guard at x: 58..64, y: 38..48
setPx(f2, 58, 42, PAL.sparkWhite);
setPx(f2, 59, 41, PAL.sparkCyan);
setPx(f2, 60, 42, PAL.sparkWhite);
setPx(f2, 61, 44, PAL.sparkCyan);
setPx(f2, 58, 46, PAL.sparkCyan);
setPx(f2, 59, 47, PAL.sparkWhite);
blitCell(f2, 2);

// ------------------------------------------------------------------------------
// ACCIÓN 2: CAMINATA (WALK CYCLE - CELDAS 3..6)
// ------------------------------------------------------------------------------

// Cuadro 4 (Frame 3): Paso 1 - Pierna delantera avanzando, brazo opuesto al frente
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 68) {
      setPx(f3, x, y, col, col[3]);
    } else if (y < 82) {
      // Stride forward: front leg pushes +2px, rear leg -2px
      setPx(f3, x + 2, y, col, col[3]);
    } else {
      // Front foot stepping ahead (x + 3)
      setPx(f3, x + 3, y, col, col[3]);
    }
  }
}
// Arm swing
for (let ay = 50; ay <= 60; ay++) {
  setPx(f3, 56, ay, PAL.suitBase);
}
blitCell(f3, 3);

// Cuadro 5 (Frame 4): Paso 2 - Apoyo total delantero, peso pasando sobre el eje
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Torso rises 1px on passing axis
    if (y < 68) {
      setPx(f4, x + 1, y - 1, col, col[3]);
    } else {
      setPx(f4, x + 1, y, col, col[3]);
    }
  }
}
blitCell(f4, 4);

// Cuadro 6 (Frame 5): Paso 3 - Pierna trasera pasando al frente, porte dominante
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 68) {
      setPx(f5, x, y, col, col[3]);
    } else if (y < 82) {
      // Rear leg passing forward
      setPx(f5, x - 2, y, col, col[3]);
    } else {
      setPx(f5, x - 3, y, col, col[3]);
    }
  }
}
blitCell(f5, 5);

// Cuadro 7 (Frame 6): Paso 4 - Contacto firme del otro pie cerrando el ciclo
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    setPx(f6, x, y, col, col[3]);
  }
}
// Scarf trailing gently behind walk
setPx(f6, 38, 41, PAL.scarfHi);
setPx(f6, 37, 42, PAL.scarfBase);
blitCell(f6, 6);

// ------------------------------------------------------------------------------
// ACCIÓN 3: CORRER / Tecla AV PÁG (RUN CYCLE - CELDAS 7..10)
// ------------------------------------------------------------------------------

// Cuadro 8 (Frame 7): Impulso agresivo (torso inclinado adelante, zancada larga, bufanda ondeando)
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 46) {
      // Head & torso leaned forward 5px
      setPx(f7, x + 5, y + 2, col, col[3]);
    } else if (y < 68) {
      setPx(f7, x + 3, y + 2, col, col[3]);
    } else if (x > 46) {
      // Front leg stretching forward
      setPx(f7, x + 6, y, col, col[3]);
    } else {
      // Rear leg trailing back
      setPx(f7, x - 5, y, col, col[3]);
    }
  }
}
// Scarf flying horizontally backwards (x: 28..42, y: 38..44)
for (let sx = 26; sx <= 42; sx++) {
  setPx(f7, sx, 40, PAL.scarfHi);
  setPx(f7, sx, 41, PAL.scarfBase);
  if (sx < 36) setPx(f7, sx, 42, PAL.scarfDark);
}
blitCell(f7, 7);

// Cuadro 9 (Frame 8): Despegue / vuelo de carrera rápida
const f8 = new PNG({ width: CELL, height: CELL });
f8.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Airborne pop 2px
    if (y < 46) {
      setPx(f8, x + 4, y - 1, col, col[3]);
    } else if (y < 68) {
      setPx(f8, x + 2, y - 1, col, col[3]);
    } else if (x > 46) {
      setPx(f8, x + 4, y - 2, col, col[3]);
    } else {
      setPx(f8, x - 3, y - 2, col, col[3]);
    }
  }
}
// Flapping scarf
for (let sx = 24; sx <= 40; sx++) {
  setPx(f8, sx, 38, PAL.scarfHi);
  setPx(f8, sx, 39, PAL.scarfBase);
}
blitCell(f8, 8);

// Cuadro 10 (Frame 9): Aterrizaje de zancada / contacto contrario
const f9 = new PNG({ width: CELL, height: CELL });
f9.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 46) {
      setPx(f9, x + 4, y + 2, col, col[3]);
    } else if (y < 68) {
      setPx(f9, x + 2, y + 2, col, col[3]);
    } else if (x > 46) {
      // Rear leg
      setPx(f9, x - 4, y, col, col[3]);
    } else {
      // Front leg
      setPx(f9, x + 5, y, col, col[3]);
    }
  }
}
// Trailing scarf
for (let sx = 26; sx <= 42; sx++) {
  setPx(f9, sx, 41, PAL.scarfHi);
  setPx(f9, sx, 42, PAL.scarfBase);
}
blitCell(f9, 9);

// Cuadro 11 (Frame 10): Impulso de cierre / ciclo fluido de carrera
const f10 = new PNG({ width: CELL, height: CELL });
f10.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 46) {
      setPx(f10, x + 3, y + 1, col, col[3]);
    } else if (y < 68) {
      setPx(f10, x + 1, y + 1, col, col[3]);
    } else {
      setPx(f10, x, y, col, col[3]);
    }
  }
}
for (let sx = 28; sx <= 42; sx++) {
  setPx(f10, sx, 40, PAL.scarfHi);
  setPx(f10, sx, 41, PAL.scarfBase);
}
blitCell(f10, 10);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritestrip_block_walk_run_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritestrip_block_walk_run_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritestrip_block_walk_run_96x96.png';

const buf = PNG.sync.write(strip);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 4: jefa_spritestrip_block_walk_run_96x96.png (1056x96)");
