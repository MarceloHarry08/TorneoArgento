// ==============================================================================
// TORNEO ARGENTO 16-BIT - ASSEMBLE 96x96 DUAL SHEETS FOR "LA JEFA" (LATINA)
// Generates:
//   - latina_spritesheet_96x96_hoja1.png (864 x 480 px)
//   - latina_spritesheet_96x96_hoja2.png (864 x 480 px)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const CELL = 96;
const COLS = 9;
const ROWS = 5;
const WIDTH = COLS * CELL;   // 864 px
const HEIGHT = ROWS * CELL;  // 480 px

const hoja1 = new PNG({ width: WIDTH, height: HEIGHT });
const hoja2 = new PNG({ width: WIDTH, height: HEIGHT });
hoja1.data.fill(0);
hoja2.data.fill(0);

const baseDir = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites';

const p1 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritestrip_idle_crouch_96x96.png')));
const p2 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritestrip_punches_96x96.png')));
const p3 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritestrip_kicks_96x96.png')));
const p4 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritestrip_block_walk_run_96x96.png')));
const p5 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritestrip_jump_turn_96x96.png')));
const p6 = PNG.sync.read(fs.readFileSync(path.join(baseDir, 'jefa_spritesheet_specials_fatality_96x96.png')));

function blitCell(srcPng, srcCol, srcRow, destSheet, destCol, destRow) {
  const sxStart = srcCol * CELL;
  const syStart = srcRow * CELL;
  const dxStart = destCol * CELL;
  const dyStart = destRow * CELL;

  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = ((syStart + y) * srcPng.width + (sxStart + x)) << 2;
      const a = srcPng.data[sIdx + 3];
      if (a === 0) continue;
      const dIdx = ((dyStart + y) * destSheet.width + (dxStart + x)) << 2;
      destSheet.data[dIdx] = srcPng.data[sIdx];
      destSheet.data[dIdx + 1] = srcPng.data[sIdx + 1];
      destSheet.data[dIdx + 2] = srcPng.data[sIdx + 2];
      destSheet.data[dIdx + 3] = a;
    }
  }
}

// ------------------------------------------------------------------------------
// ASSEMBLE HOJA 1
// ------------------------------------------------------------------------------
// Row 0: Idle (cols 0..3) & Walk (cols 4..7)
for (let i = 0; i < 4; i++) {
  blitCell(p1, i, 0, hoja1, i, 0); // Idle frames 0..3
  blitCell(p4, 3 + i, 0, hoja1, 4 + i, 0); // Walk frames 3..6
}

// Row 1: Crouch (cols 0..2) & Jump (cols 3..6)
for (let i = 0; i < 3; i++) {
  blitCell(p1, 4 + i, 0, hoja1, i, 1); // Crouch frames 4..6
}
for (let i = 0; i < 4; i++) {
  blitCell(p5, i, 0, hoja1, 3 + i, 1); // Jump frames 0..3
}

// Row 2: Punches
// High Punch: cols 0..3
for (let i = 0; i < 4; i++) {
  blitCell(p2, i, 0, hoja1, i, 2);
}
// Low Punch: cols 6..8
for (let i = 0; i < 3; i++) {
  blitCell(p2, 4 + i, 0, hoja1, 6 + i, 2);
}

// Row 3: Kicks
// High Kick: cols 0..3
for (let i = 0; i < 4; i++) {
  blitCell(p3, i, 0, hoja1, i, 3);
}
// Low Kick / Sweep: cols 6..8
for (let i = 0; i < 3; i++) {
  blitCell(p3, 4 + i, 0, hoja1, 6 + i, 3);
}

// Row 4: Hurt / Reaction & Knockdown
blitCell(p4, 2, 0, hoja1, 0, 4); // Block impact / flinch
blitCell(p4, 2, 0, hoja1, 1, 4);
blitCell(p3, 4, 0, hoja1, 2, 4); // Low drop
blitCell(p3, 5, 0, hoja1, 3, 4); // Sweep ground contact
blitCell(p3, 6, 0, hoja1, 4, 4); // Recovering floor

// ------------------------------------------------------------------------------
// ASSEMBLE HOJA 2
// ------------------------------------------------------------------------------
// Row 0: Especial 1 - Poder (cols 0..3) & Proyectil VFX (cols 4..7)
for (let i = 0; i < 4; i++) {
  blitCell(p6, i, 0, hoja2, i, 0); // Fila 1 Poder
  blitCell(p6, i, 1, hoja2, 4 + i, 0); // Fila 2 Proyectil VFX
}

// Row 1: Fatality Atril & Descenso (cols 0..5)
for (let i = 0; i < 6; i++) {
  blitCell(p6, i, 2, hoja2, i, 1);
}

// Row 2: Súper Ataque / Remate Poder (cols 0..3)
for (let i = 0; i < 4; i++) {
  blitCell(p6, i, 0, hoja2, i, 2);
}

// Row 3: Bloqueo (cols 0..2) & Correr / Dash (cols 4..7)
for (let i = 0; i < 3; i++) {
  blitCell(p4, i, 0, hoja2, i, 3);
}
for (let i = 0; i < 4; i++) {
  blitCell(p4, 7 + i, 0, hoja2, 4 + i, 3);
}

// Row 4: Victoria (cols 0..5: Saludo triunfal y V de la victoria)
blitCell(p6, 3, 2, hoja2, 0, 4); // Paso al frente
blitCell(p6, 4, 2, hoja2, 1, 4); // Acomoda pañuelo
blitCell(p6, 5, 2, hoja2, 2, 4); // V de la victoria
blitCell(p6, 5, 2, hoja2, 3, 4); // V sostenida
blitCell(p6, 2, 0, hoja2, 4, 4); // Saludo triunfal mano en alto
blitCell(p6, 3, 0, hoja2, 5, 4);

// Write to files
const targets = [
  { p: path.join(baseDir, 'latina_spritesheet_96x96_hoja1.png'), buf: PNG.sync.write(hoja1) },
  { p: path.join(baseDir, 'latina_spritesheet_96x96_hoja2.png'), buf: PNG.sync.write(hoja2) },
  { p: path.join(baseDir, 'jefa_spritesheet_96x96_hoja1.png'), buf: PNG.sync.write(hoja1) },
  { p: path.join(baseDir, 'jefa_spritesheet_96x96_hoja2.png'), buf: PNG.sync.write(hoja2) },
  
  { p: 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/latina_spritesheet_96x96_hoja1.png', buf: PNG.sync.write(hoja1) },
  { p: 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/latina_spritesheet_96x96_hoja2.png', buf: PNG.sync.write(hoja2) },
  { p: 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritesheet_96x96_hoja1.png', buf: PNG.sync.write(hoja1) },
  { p: 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/jefa_spritesheet_96x96_hoja2.png', buf: PNG.sync.write(hoja2) },
  
  { p: 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/latina_spritesheet_96x96_hoja1.png', buf: PNG.sync.write(hoja1) },
  { p: 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/latina_spritesheet_96x96_hoja2.png', buf: PNG.sync.write(hoja2) }
];

targets.forEach(t => {
  fs.writeFileSync(t.p, t.buf);
  console.log("Saved:", t.p);
});

console.log("Dual 96x96 sheets successfully assembled for La Jefa (latina)!");
