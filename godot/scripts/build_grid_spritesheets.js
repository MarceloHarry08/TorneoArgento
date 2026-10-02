// TORNEO ARGENTO 16-BIT - Grid SpriteSheet Builder for Godot Engine AnimationPlayer
// Builds professional 8x10 (hframes=8, vframes=10) 128x128 cell spritesheets
// with foot pivot anchoring for all 16 characters.

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const PROJECT_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight';
const CHARACTERS_DIR = path.join(PROJECT_DIR, 'assets/characters');
const SPRITES_DIR = path.join(PROJECT_DIR, 'assets/sprites');

const CELL_SIZE = 128;
const HFRAMES = 8;
const VFRAMES = 10;
const SHEET_WIDTH = HFRAMES * CELL_SIZE;  // 1024
const SHEET_HEIGHT = VFRAMES * CELL_SIZE; // 1280

const ROSTER = [
    'leon', 'latina', 'ojosazules', 'pepeargento',
    'eleternauta', 'elcomandante', 'elmesias', 'moria',
    'lasu', 'hugo', 'pergolas', 'sangrejaponesa',
    'lafaraona', 'badbitch', 'oidoabsoluto', 'inmortal'
];

// Cell layout mapping: [cell_index] -> { action, frame_index }
const GRID_CELLS = [
    // Row 0: Idle (0..3), Crouch_Start (4..5), Crouch_End (6..7)
    { a: 'walk_forward', f: 0 }, { a: 'walk_forward', f: 1 }, { a: 'walk_forward', f: 2 }, { a: 'walk_forward', f: 3 },
    { a: 'crouch', f: 0 }, { a: 'crouch', f: 1 },
    { a: 'crouch', f: 1 }, { a: 'crouch', f: 0 },

    // Row 1: Walk Forward (8..13), Crouching loop (14..15)
    { a: 'walk_forward', f: 0 }, { a: 'walk_forward', f: 1 }, { a: 'walk_forward', f: 2 },
    { a: 'walk_forward', f: 3 }, { a: 'walk_forward', f: 4 }, { a: 'walk_forward', f: 5 },
    { a: 'crouch', f: 2 }, { a: 'crouch', f: 3 },

    // Row 2: Walk Backward (16..21), Land (22..23)
    { a: 'walk_backward', f: 0 }, { a: 'walk_backward', f: 1 }, { a: 'walk_backward', f: 2 },
    { a: 'walk_backward', f: 3 }, { a: 'walk_backward', f: 4 }, { a: 'walk_backward', f: 5 },
    { a: 'jump', f: 6 }, { a: 'jump', f: 7 },

    // Row 3: Jump Up (24..26), Jump Forward (27..29), Fall (30..31)
    { a: 'jump', f: 0 }, { a: 'jump', f: 1 }, { a: 'jump', f: 2 },
    { a: 'jump', f: 2 }, { a: 'jump', f: 3 }, { a: 'jump', f: 4 },
    { a: 'jump', f: 4 }, { a: 'jump', f: 5 },

    // Row 4: Light Punch (32..34), Mid Punch (35..37), Extra (38..39)
    { a: 'punch_low', f: 0 }, { a: 'punch_low', f: 1 }, { a: 'punch_low', f: 2 },
    { a: 'punch_low', f: 2 }, { a: 'punch_low', f: 3 }, { a: 'punch_low', f: 4 },
    { a: 'walk_forward', f: 0 }, { a: 'walk_forward', f: 1 },

    // Row 5: Heavy Punch (40..43), Light Kick (44..46), Extra (47)
    { a: 'punch_high', f: 0 }, { a: 'punch_high', f: 2 }, { a: 'punch_high', f: 4 }, { a: 'punch_high', f: 5 },
    { a: 'kick_low', f: 0 }, { a: 'kick_low', f: 1 }, { a: 'kick_low', f: 2 },
    { a: 'walk_forward', f: 0 },

    // Row 6: Mid Kick (48..50), Heavy Kick (51..54), Extra (55)
    { a: 'kick_low', f: 2 }, { a: 'kick_low', f: 3 }, { a: 'kick_low', f: 4 },
    { a: 'kick_high', f: 0 }, { a: 'kick_high', f: 2 }, { a: 'kick_high', f: 4 }, { a: 'kick_high', f: 6 },
    { a: 'walk_forward', f: 0 },

    // Row 7: Hit Light (56..57), Hit Heavy (58..60), Knockdown (61..63)
    { a: 'hurt', f: 0 }, { a: 'hurt', f: 1 },
    { a: 'hurt', f: 2 }, { a: 'hurt', f: 3 }, { a: 'hurt', f: 4 },
    { a: 'defeat', f: 0 }, { a: 'defeat', f: 2 }, { a: 'defeat', f: 4 },

    // Row 8: Win (64..67), Lose (68..71)
    { a: 'victory', f: 0 }, { a: 'victory', f: 1 }, { a: 'victory', f: 2 }, { a: 'victory', f: 3 },
    { a: 'defeat', f: 5 }, { a: 'defeat', f: 6 }, { a: 'defeat', f: 7 }, { a: 'defeat', f: 8 },

    // Row 9: Block (72..73), Special (74..76), Super (77..79)
    { a: 'block', f: 0 }, { a: 'block', f: 1 },
    { a: 'special', f: 0 }, { a: 'special', f: 2 }, { a: 'special', f: 4 },
    { a: 'super', f: 0 }, { a: 'super', f: 3 }, { a: 'super', f: 6 }
];

function readPngSync(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    return PNG.sync.read(buf);
}

function blitScaled(srcPng, destPng, cellCol, cellRow) {
    if (!srcPng) return;
    
    // Scale proportionally to fit inside cell with head clearance and feet anchored at bottom
    const targetH = 106;
    const scale = targetH / srcPng.height;
    const targetW = Math.round(srcPng.width * scale);

    const cellX = cellCol * CELL_SIZE;
    const cellY = cellRow * CELL_SIZE;

    // Centered horizontally, feet placed exactly 2px above bottom of cell
    const startX = cellX + Math.round((CELL_SIZE - targetW) / 2);
    const startY = cellY + (CELL_SIZE - targetH - 2);

    for (let dy = 0; dy < targetH; dy++) {
        const sy = Math.floor(dy / scale);
        if (sy >= srcPng.height) continue;
        const outY = startY + dy;
        if (outY < 0 || outY >= destPng.height) continue;

        for (let dx = 0; dx < targetW; dx++) {
            const sx = Math.floor(dx / scale);
            if (sx >= srcPng.width) continue;
            const outX = startX + dx;
            if (outX < 0 || outX >= destPng.width) continue;

            const sIdx = (srcPng.width * sy + sx) << 2;
            const alpha = srcPng.data[sIdx + 3];
            if (alpha <= 5) continue; // transparent pixel

            const dIdx = (destPng.width * outY + outX) << 2;
            destPng.data[dIdx] = srcPng.data[sIdx];
            destPng.data[dIdx + 1] = srcPng.data[sIdx + 1];
            destPng.data[dIdx + 2] = srcPng.data[sIdx + 2];
            destPng.data[dIdx + 3] = alpha;
        }
    }
}

async function buildAll() {
    console.log(`Building standardized ${HFRAMES}x${VFRAMES} (${CELL_SIZE}x${CELL_SIZE}px) spritesheets for ${ROSTER.length} fighters...`);
    
    for (const charId of ROSTER) {
        process.stdout.write(`- Processing ${charId}... `);
        const charDir = path.join(CHARACTERS_DIR, charId);
        
        const sheet = new PNG({ width: SHEET_WIDTH, height: SHEET_HEIGHT });
        // Clear to transparent
        sheet.data.fill(0);

        for (let i = 0; i < GRID_CELLS.length; i++) {
            const row = Math.floor(i / HFRAMES);
            const col = i % HFRAMES;
            const cell = GRID_CELLS[i];

            let framePath = path.join(charDir, cell.a, `frame_${String(cell.f).padStart(2, '0')}.png`);
            if (!fs.existsSync(framePath)) {
                // Fallback to frame 0
                framePath = path.join(charDir, cell.a, `frame_00.png`);
            }
            if (!fs.existsSync(framePath)) {
                framePath = path.join(charDir, 'walk_forward', 'frame_00.png');
            }

            const framePng = readPngSync(framePath);
            if (framePng) {
                blitScaled(framePng, sheet, col, row);
            }
        }

        const outPath = path.join(SPRITES_DIR, `${charId}_grid.png`);
        const outBuf = PNG.sync.write(sheet);
        fs.writeFileSync(outPath, outBuf);
        console.log(`Done (${(outBuf.length / 1024).toFixed(1)} KB) -> ${outPath}`);
    }

    console.log('All 16 character grid spritesheets generated successfully!');
}

buildAll().catch(console.error);
