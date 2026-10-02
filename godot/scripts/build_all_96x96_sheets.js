// TORNEO ARGENTO 16-BIT - Universal 96x96 Dual SpriteSheet Builder
// Generates standard 9x5 96x96 cell sheets (Hoja 1 and Hoja 2)
// for all characters in the roster with strict foot pivot at y=90.

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const PROJECT_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight';
const CHARACTERS_DIR = path.join(PROJECT_DIR, 'assets/characters');
const SPRITES_DIR = path.join(PROJECT_DIR, 'assets/sprites');

const CELL = 96;
const COLS = 9;
const ROWS = 5;
const WIDTH = COLS * CELL;   // 864 px
const HEIGHT = ROWS * CELL;  // 480 px
const GROUND_Y = 90;         // Foot anchor baseline

const ROSTER = [
    'latina', 'ojosazules', 'pepeargento',
    'eleternauta', 'elcomandante', 'elmesias', 'moria',
    'lasu', 'hugo', 'pergolas', 'sangrejaponesa',
    'lafaraona', 'badbitch', 'oidoabsoluto', 'inmortal'
];

function readPngSync(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    return PNG.sync.read(buf);
}

function blitScaled(srcPng, destPng, cellCol, cellRow, opt = {}) {
    if (!srcPng) return;
    
    const targetH = opt.targetH || 72;
    const scale = targetH / srcPng.height;
    const targetW = Math.max(1, Math.round(srcPng.width * scale));

    const cellX = cellCol * CELL;
    const cellY = cellRow * CELL;

    const startX = cellX + Math.round((CELL - targetW) / 2) + (opt.shiftX || 0);
    const startY = cellY + (GROUND_Y - targetH) + (opt.shiftY || 0);

    for (let dy = 0; dy < targetH; dy++) {
        const sy = Math.floor(dy / scale);
        if (sy >= srcPng.height) continue;
        const destY = startY + dy;
        if (destY < cellY || destY >= cellY + CELL) continue;

        for (let dx = 0; dx < targetW; dx++) {
            const sx = Math.floor(dx / scale);
            if (sx >= srcPng.width) continue;
            const destX = startX + dx;
            if (destX < cellX || destX >= cellX + CELL) continue;

            const sIdx = (srcPng.width * sy + sx) << 2;
            const sA = srcPng.data[sIdx + 3];
            if (sA < 10) continue; // transparent pixel

            const dIdx = (destPng.width * destY + destX) << 2;
            destPng.data[dIdx] = srcPng.data[sIdx];
            destPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
            destPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
            destPng.data[dIdx + 3] = sA;
        }
    }
}

function getCharFrame(charId, action, frameIdx) {
    const pad = String(frameIdx).padStart(2, '0');
    const p1 = path.join(CHARACTERS_DIR, charId, action, `frame_${pad}.png`);
    if (fs.existsSync(p1)) return readPngSync(p1);

    // fallback to frame 0
    const p0 = path.join(CHARACTERS_DIR, charId, action, `frame_00.png`);
    if (fs.existsSync(p0)) return readPngSync(p0);

    // fallback to walk_forward frame 0
    const pw = path.join(CHARACTERS_DIR, charId, 'walk_forward', `frame_00.png`);
    if (fs.existsSync(pw)) return readPngSync(pw);

    return null;
}

function buildCharacterSheets(charId) {
    console.log(`Processing 96x96 sheets for: ${charId}...`);

    // --- HOJA 1: Movimientos y Combates Básicos ---
    const hoja1 = new PNG({ width: WIDTH, height: HEIGHT });
    hoja1.data.fill(0);

    // Fila 0: IDLE (4 frames) + WALK (4 frames)
    for (let f = 0; f < 4; f++) {
        blitScaled(getCharFrame(charId, 'walk_forward', f), hoja1, f, 0, { targetH: 72 });
    }
    for (let f = 0; f < 4; f++) {
        blitScaled(getCharFrame(charId, 'walk_forward', f + 1), hoja1, 4 + f, 0, { targetH: 72 });
    }
    blitScaled(getCharFrame(charId, 'walk_backward', 0), hoja1, 8, 0, { targetH: 72 });

    // Fila 1: AGACHARSE (2 frames) + SALTO (4 frames)
    blitScaled(getCharFrame(charId, 'crouch', 0), hoja1, 0, 1, { targetH: 52, shiftY: 20 });
    blitScaled(getCharFrame(charId, 'crouch', 1), hoja1, 1, 1, { targetH: 48, shiftY: 24 });
    blitScaled(getCharFrame(charId, 'jump', 0), hoja1, 2, 1, { targetH: 64, shiftY: 8 });
    blitScaled(getCharFrame(charId, 'jump', 2), hoja1, 3, 1, { targetH: 68, shiftY: -16 });
    blitScaled(getCharFrame(charId, 'jump', 4), hoja1, 4, 1, { targetH: 68, shiftY: -8 });
    blitScaled(getCharFrame(charId, 'jump', 6), hoja1, 5, 1, { targetH: 56, shiftY: 16 });

    // Fila 2: PIÑAS (3 Alta, 3 Media, 3 Baja)
    blitScaled(getCharFrame(charId, 'punch_high', 0), hoja1, 0, 2, { targetH: 72 });
    blitScaled(getCharFrame(charId, 'punch_high', 2), hoja1, 1, 2, { targetH: 72, shiftX: 4 });
    blitScaled(getCharFrame(charId, 'punch_high', 4), hoja1, 2, 2, { targetH: 72, shiftX: 2 });

    blitScaled(getCharFrame(charId, 'punch_low', 0), hoja1, 3, 2, { targetH: 72 });
    blitScaled(getCharFrame(charId, 'punch_low', 2), hoja1, 4, 2, { targetH: 72, shiftX: 4 });
    blitScaled(getCharFrame(charId, 'punch_low', 4), hoja1, 5, 2, { targetH: 72, shiftX: 2 });

    blitScaled(getCharFrame(charId, 'crouch', 0), hoja1, 6, 2, { targetH: 52, shiftY: 20 });
    blitScaled(getCharFrame(charId, 'punch_low', 1), hoja1, 7, 2, { targetH: 52, shiftY: 20, shiftX: 4 });
    blitScaled(getCharFrame(charId, 'punch_low', 3), hoja1, 8, 2, { targetH: 52, shiftY: 20 });

    // Fila 3: PATADAS (3 Alta, 3 Media, 3 Baja)
    blitScaled(getCharFrame(charId, 'kick_high', 0), hoja1, 0, 3, { targetH: 72 });
    blitScaled(getCharFrame(charId, 'kick_high', 2), hoja1, 1, 3, { targetH: 72, shiftX: 4 });
    blitScaled(getCharFrame(charId, 'kick_high', 4), hoja1, 2, 3, { targetH: 72, shiftX: 2 });

    blitScaled(getCharFrame(charId, 'kick_low', 0), hoja1, 3, 3, { targetH: 72 });
    blitScaled(getCharFrame(charId, 'kick_low', 2), hoja1, 4, 3, { targetH: 72, shiftX: 4 });
    blitScaled(getCharFrame(charId, 'kick_low', 4), hoja1, 5, 3, { targetH: 72, shiftX: 2 });

    blitScaled(getCharFrame(charId, 'crouch', 1), hoja1, 6, 3, { targetH: 48, shiftY: 24 });
    blitScaled(getCharFrame(charId, 'kick_low', 1), hoja1, 7, 3, { targetH: 48, shiftY: 24, shiftX: 6 });
    blitScaled(getCharFrame(charId, 'crouch', 1), hoja1, 8, 3, { targetH: 48, shiftY: 24 });

    // Fila 4: DAÑO Y DERROTA (2 Hurt, 3 Knockdown)
    blitScaled(getCharFrame(charId, 'hurt', 0), hoja1, 0, 4, { targetH: 70, shiftX: -4 });
    blitScaled(getCharFrame(charId, 'hurt', 2), hoja1, 1, 4, { targetH: 68, shiftX: -8 });
    blitScaled(getCharFrame(charId, 'defeat', 0), hoja1, 2, 4, { targetH: 60, shiftX: -8, shiftY: 10 });
    blitScaled(getCharFrame(charId, 'defeat', 2), hoja1, 3, 4, { targetH: 44, shiftX: -12, shiftY: 26 });
    blitScaled(getCharFrame(charId, 'defeat', 4), hoja1, 4, 4, { targetH: 30, shiftX: -16, shiftY: 40 });

    const out1 = path.join(SPRITES_DIR, `${charId}_spritesheet_96x96_hoja1.png`);
    fs.writeFileSync(out1, PNG.sync.write(hoja1));

    // --- HOJA 2: Especiales, Súper, Bloqueo y Victoria ---
    const hoja2 = new PNG({ width: WIDTH, height: HEIGHT });
    hoja2.data.fill(0);

    // Fila 0: ESPECIAL 1 (6 frames)
    for (let f = 0; f < 6; f++) {
        blitScaled(getCharFrame(charId, 'special', f), hoja2, f, 0, { targetH: 72 });
    }

    // Fila 1: ESPECIAL 2 (6 frames)
    for (let f = 0; f < 6; f++) {
        blitScaled(getCharFrame(charId, 'special', (f + 2) % 6), hoja2, f, 1, { targetH: 72 });
    }

    // Fila 2: SÚPER ATAQUE (8 frames)
    for (let f = 0; f < 8; f++) {
        blitScaled(getCharFrame(charId, 'super', f), hoja2, f, 2, { targetH: 74 });
    }

    // Fila 3: BLOQUEO Y GUARDIA (4 frames)
    blitScaled(getCharFrame(charId, 'block', 0), hoja2, 0, 3, { targetH: 70 });
    blitScaled(getCharFrame(charId, 'block', 1), hoja2, 1, 3, { targetH: 70 });
    blitScaled(getCharFrame(charId, 'crouch', 0), hoja2, 2, 3, { targetH: 52, shiftY: 20 });
    blitScaled(getCharFrame(charId, 'block', 1), hoja2, 3, 3, { targetH: 52, shiftY: 20 });

    // Fila 4: VICTORIA Y CELEBRACIÓN (6 frames)
    for (let f = 0; f < 6; f++) {
        blitScaled(getCharFrame(charId, 'victory', f), hoja2, f, 4, { targetH: 72 });
    }

    const out2 = path.join(SPRITES_DIR, `${charId}_spritesheet_96x96_hoja2.png`);
    fs.writeFileSync(out2, PNG.sync.write(hoja2));
    console.log(`✓ Sheets created for ${charId}`);
}

for (const charId of ROSTER) {
    buildCharacterSheets(charId);
}
console.log('¡Todos los personajes cuentan ahora con hojas de sprites 96x96!');
