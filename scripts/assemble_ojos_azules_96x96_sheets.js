const fs = require('fs');
const { PNG } = require('pngjs');

// Load generated strips
const pIdleCrouch = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_idle_crouch_96x96.png'));
const pPunches = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_punches_96x96.png'));
const pKicks = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_kicks_96x96.png'));
const pBWR = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_block_walk_run_96x96.png'));
const pJumpTurn = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_jump_turn_96x96.png'));
const pSpecials = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritesheet_specials_fatality_96x96.png'));

function copyCell(srcPng, srcCellX, srcCellY, dstPng, dstCellX, dstCellY) {
    for (let y = 0; y < 96; y++) {
        for (let x = 0; x < 96; x++) {
            const sx = srcCellX * 96 + x;
            const sy = srcCellY * 96 + y;
            const sIdx = (sy * srcPng.width + sx) * 4;
            
            const dx = dstCellX * 96 + x;
            const dy = dstCellY * 96 + y;
            const dIdx = (dy * dstPng.width + dx) * 4;
            
            dstPng.data[dIdx] = srcPng.data[sIdx];
            dstPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
            dstPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
            dstPng.data[dIdx + 3] = srcPng.data[sIdx + 3];
        }
    }
}

// ==========================================
// ASSEMBLE HOJA 1 (9 cols x 5 rows = 864 x 480)
// ==========================================
const hoja1 = new PNG({ width: 9 * 96, height: 5 * 96 });

// Row 0: Idle (0..3), Walk (4..7)
for (let i = 0; i < 4; i++) {
    copyCell(pIdleCrouch, i, 0, hoja1, i, 0);
}
for (let i = 0; i < 4; i++) {
    // BWR has: block 0..2, walk 3..6, run 7..10
    copyCell(pBWR, 3 + i, 0, hoja1, 4 + i, 0);
}

// Row 1: Crouch start (cell 0 -> 9), Crouching (cell 1 -> 10), Jump impulse (11), Jump ascend (12), Jump apex (13), Jump land (14), Crouch up (15), Turn pivot (16), Turn finish (17)
copyCell(pIdleCrouch, 4, 0, hoja1, 0, 1); // cell 9
copyCell(pIdleCrouch, 5, 0, hoja1, 1, 1); // cell 10
copyCell(pJumpTurn, 0, 0, hoja1, 2, 1);   // cell 11 (jump impulse)
copyCell(pJumpTurn, 1, 0, hoja1, 3, 1);   // cell 12 (jump ascend)
copyCell(pJumpTurn, 2, 0, hoja1, 4, 1);   // cell 13 (jump apex)
copyCell(pJumpTurn, 3, 0, hoja1, 5, 1);   // cell 14 (jump land)
copyCell(pIdleCrouch, 6, 0, hoja1, 6, 1); // cell 15 (crouch up)
copyCell(pJumpTurn, 4, 0, hoja1, 7, 1);   // cell 16 (turn pivot)
copyCell(pJumpTurn, 5, 0, hoja1, 8, 1);   // cell 17 (turn finish)

// Row 2: High Punch (18..21), Low Punch (24..27)
for (let i = 0; i < 4; i++) {
    copyCell(pPunches, i, 0, hoja1, i, 2); // 18..21
}
for (let i = 0; i < 4; i++) {
    copyCell(pPunches, 4 + i, 0, hoja1, 5 + i, 2); // 23..26
}

// Row 3: High Kick (27..30), Low Kick / Sweep (31..34)
for (let i = 0; i < 4; i++) {
    copyCell(pKicks, i, 0, hoja1, i, 3); // 27..30
}
for (let i = 0; i < 4; i++) {
    copyCell(pKicks, 4 + i, 0, hoja1, 4 + i, 3); // 31..34
}

// Row 4: Hurt (36..37), Knockdown (38..40)
// We use crouch down / recoil / block recoil for hit reactions
copyCell(pBWR, 2, 0, hoja1, 0, 4); // 36: hit light (recoil)
copyCell(pBWR, 2, 0, hoja1, 1, 4); // 37: hit heavy
copyCell(pKicks, 4, 0, hoja1, 2, 4); // 38: knockdown start
copyCell(pKicks, 6, 0, hoja1, 3, 4); // 39: knockdown ground
copyCell(pKicks, 6, 0, hoja1, 4, 4); // 40: lose / defeat on floor

// ==========================================
// ASSEMBLE HOJA 2 (9 cols x 5 rows = 864 x 480)
// ==========================================
const hoja2 = new PNG({ width: 9 * 96, height: 5 * 96 });

// Row 0: Especial 1 - Lluvia de Dólares (0..3) & VFX (4..7)
for (let i = 0; i < 4; i++) {
    copyCell(pSpecials, i, 0, hoja2, i, 0); // 0..3 (character throw)
    copyCell(pSpecials, i, 1, hoja2, 4 + i, 0); // 4..7 (dollar projectile vfx)
}

// Row 1: Especial 2 - Invocación Felina / El Gato (9..12)
for (let i = 0; i < 4; i++) {
    copyCell(pSpecials, i, 2, hoja2, i, 1); // 9..12 (cat summon & leap)
}

// Row 2: Súper Ataque / Proyectil (18..21)
for (let i = 0; i < 4; i++) {
    copyCell(pSpecials, i, 0, hoja2, i, 2);
}

// Row 3: Bloqueo (27..29), Correr/Dash (31..34)
for (let i = 0; i < 3; i++) {
    copyCell(pBWR, i, 0, hoja2, i, 3); // 27..29
}
for (let i = 0; i < 4; i++) {
    copyCell(pBWR, 7 + i, 0, hoja2, 4 + i, 3); // 31..34 (run)
}

// Row 4: Victoria y Fatality (36..41)
for (let i = 0; i < 6; i++) {
    copyCell(pSpecials, i, 3, hoja2, i, 4); // 36..41 (fatality reposera)
}

// Save Hoja 1 and Hoja 2
const h1Path = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojosazules_spritesheet_96x96_hoja1.png';
const h2Path = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojosazules_spritesheet_96x96_hoja2.png';
fs.writeFileSync(h1Path, PNG.sync.write(hoja1));
fs.writeFileSync(h2Path, PNG.sync.write(hoja2));

console.log(`Saved ${h1Path}`);
console.log(`Saved ${h2Path}`);

// Copy to OneDrive game project assets as well!
const odH1 = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/ojosazules_spritesheet_96x96_hoja1.png';
const odH2 = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/ojosazules_spritesheet_96x96_hoja2.png';
fs.writeFileSync(odH1, PNG.sync.write(hoja1));
fs.writeFileSync(odH2, PNG.sync.write(hoja2));
console.log(`Synced to OneDrive: ${odH1} and ${odH2}`);
