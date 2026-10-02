// ==============================================================================
// TORNEO ARGENTO 16-BIT - LA JEFA: PROMPT 2 (HIGH PUNCH & LOW PUNCH STRIP)
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
  ringGlow: [120, 215, 255],
  ringBright: [255, 255, 255],
  bootBase: [32, 46, 88]
};

// ------------------------------------------------------------------------------
// ACCIÓN 1: PIÑA ALTA (HIGH PUNCH / REVERSO ENÉRGICO) - CELDAS 0..3
// ------------------------------------------------------------------------------

// Cuadro 1 (Frame 0): Anticipación (torso rota ligeramente atrás, brazo derecho cargando revés)
const f0 = new PNG({ width: CELL, height: CELL });
f0.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    // Shift slightly left (anticipation lean)
    if (y < 65) {
      setPx(f0, x - 2, y, col, col[3]);
    } else {
      setPx(f0, x, y, col, col[3]);
    }
  }
}
// Arm pulled back at shoulder height (x: 34..42, y: 44..52)
for (let ay = 44; ay <= 52; ay++) {
  for (let ax = 32; ax <= 42; ax++) {
    setPx(f0, ax, ay, PAL.suitBase);
  }
}
// Clenched hand / glove preparing slap
for (let hy = 42; hy <= 47; hy++) {
  for (let hx = 28; hx <= 34; hx++) {
    setPx(f0, hx, hy, PAL.skinHi);
  }
}
blitCell(f0, 0);

// Cuadro 2 (Frame 1): Impacto Activo (Brazo completamente extendido al frente lanzando revés/bofetada con anillos brillantes)
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      // Forward surge
      setPx(f1, x + 3, y, col, col[3]);
    } else {
      setPx(f1, x, y, col, col[3]);
    }
  }
}
// Extended arm reaching x: 50..82 at face level y: 40..46
for (let ax = 50; ax <= 80; ax++) {
  for (let ay = 40; ay <= 46; ay++) {
    setPx(f1, ax, ay, PAL.suitBase);
  }
}
// Open authoritative palm / slap hand at x: 80..86, y: 38..48
for (let hx = 80; hx <= 86; hx++) {
  for (let hy = 38; hy <= 48; hy++) {
    setPx(f1, hx, hy, PAL.skinHi);
  }
}
// Rings of bright energy / kinetic slap rings
for (let r = 5; r <= 8; r++) {
  for (let angle = -1.2; angle <= 1.2; angle += 0.25) {
    const rx = Math.round(84 + Math.cos(angle) * r);
    const ry = Math.round(43 + Math.sin(angle) * (r * 1.3));
    setPx(f1, rx, ry, PAL.ringGlow);
    setPx(f1, rx + 1, ry, PAL.ringBright);
  }
}
blitCell(f1, 1);

// Cuadro 3 (Frame 2): Recuperación (brazo replegándose a mitad de camino)
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 65) {
      setPx(f2, x + 1, y, col, col[3]);
    } else {
      setPx(f2, x, y, col, col[3]);
    }
  }
}
// Arm partially folded at x: 50..66, y: 44..50
for (let ax = 50; ax <= 66; ax++) {
  for (let ay = 44; ay <= 50; ay++) {
    setPx(f2, ax, ay, PAL.suitBase);
  }
}
for (let hx = 65; hx <= 71; hx++) {
  for (let hy = 43; hy <= 49; hy++) {
    setPx(f2, hx, hy, PAL.skinBase);
  }
}
blitCell(f2, 2);

// Cuadro 4 (Frame 3): Retorno (vuelve a postura neutral de guardia)
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);
for (let i = 0; i < base.data.length; i++) f3.data[i] = base.data[i];
blitCell(f3, 3);

// ------------------------------------------------------------------------------
// ACCIÓN 2: PIÑA BAJA (LOW PUNCH AGACHADA) - CELDAS 4..7
// ------------------------------------------------------------------------------

// Cuadro 5 (Frame 4): Inicio agachado (personaje agachado retrayendo puño a la cintura)
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);
const cDrop = 13;
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 66) {
      setPx(f4, x, y + cDrop, col, col[3]);
    } else if (y >= 83) {
      setPx(f4, x, y, col, col[3]);
    } else {
      const kx = x < 48 ? x - 2 : x + 2;
      setPx(f4, kx, y + Math.floor(cDrop * 0.6), col, col[3]);
    }
  }
}
// Retracting fist at waist (x: 42..48, y: 68..74)
for (let fy = 68; fy <= 74; fy++) {
  for (let fx = 40; fx <= 48; fx++) {
    setPx(f4, fx, fy, PAL.suitBase);
  }
}
for (let fy = 70; fy <= 74; fy++) {
  for (let fx = 36; fx <= 42; fx++) {
    setPx(f4, fx, fy, PAL.skinHi);
  }
}
blitCell(f4, 4);

// Cuadro 6 (Frame 5): Impacto Bajo (puñetazo recto y seco al nivel abdomen/rodilla del rival)
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 66) {
      // Lean forward slightly
      setPx(f5, x + 3, y + cDrop, col, col[3]);
    } else if (y >= 83) {
      setPx(f5, x, y, col, col[3]);
    } else {
      const kx = x < 48 ? x - 1 : x + 3;
      setPx(f5, kx, y + Math.floor(cDrop * 0.6), col, col[3]);
    }
  }
}
// Extended straight punch arm at y: 66..72, reaching forward x: 48..82
for (let ax = 48; ax <= 78; ax++) {
  for (let ay = 66; ay <= 72; ay++) {
    setPx(f5, ax, ay, PAL.suitBase);
  }
}
// Punching fist with sharp white/blue impact accent at x: 78..86, y: 64..74
for (let fx = 78; fx <= 85; fx++) {
  for (let fy = 65; fy <= 73; fy++) {
    setPx(f5, fx, fy, PAL.skinHi);
  }
}
// Micro impact spark
setPx(f5, 86, 68, PAL.ringBright);
setPx(f5, 87, 69, PAL.ringGlow);
setPx(f5, 86, 70, PAL.ringBright);
blitCell(f5, 5);

// Cuadro 7 (Frame 6): Recuperación (recoge el puño hacia el cuerpo)
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const col = getPx(base, x, y);
    if (col[3] === 0) continue;
    if (y < 66) {
      setPx(f6, x + 1, y + cDrop, col, col[3]);
    } else if (y >= 83) {
      setPx(f6, x, y, col, col[3]);
    } else {
      const kx = x < 48 ? x - 2 : x + 2;
      setPx(f6, kx, y + Math.floor(cDrop * 0.6), col, col[3]);
    }
  }
}
// Partially retracted arm at x: 48..66, y: 68..74
for (let ax = 48; ax <= 66; ax++) {
  for (let ay = 68; ay <= 74; ay++) {
    setPx(f6, ax, ay, PAL.suitBase);
  }
}
for (let fx = 65; fx <= 72; fx++) {
  for (let fy = 68; fy <= 74; fy++) {
    setPx(f6, fx, fy, PAL.skinBase);
  }
}
blitCell(f6, 6);

// Cuadro 8 (Frame 7): Fin (vuelve a postura agachada estándar)
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);
for (let y = 0; y < CELL; y++) {
  for (let x = 0; x < CELL; x++) {
    const c = getPx(f4, x, y);
    if (c[3] > 0) setPx(f7, x, y, c, c[3]);
  }
}
blitCell(f7, 7);

// Save outputs
const outPathWorkspace = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritestrip_punches_96x96.png';
const outPathGodot = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritestrip_punches_96x96.png';
const outPathArtifact = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/jefa_spritestrip_punches_96x96.png';

const buf = PNG.sync.write(strip);
fs.writeFileSync(outPathWorkspace, buf);
fs.writeFileSync(outPathGodot, buf);
fs.writeFileSync(outPathArtifact, buf);

console.log("Successfully generated PROMPT 2: jefa_spritestrip_punches_96x96.png (768x96)");
