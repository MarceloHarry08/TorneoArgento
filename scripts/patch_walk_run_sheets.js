// Patch hoja1 and hoja2 with Walk (4 frames) and Run (4 frames)
const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_walk_run_96x96.png';
const strip = PNG.sync.read(fs.readFileSync(STRIP_PATH));

const CELL = 96;

function patchSheet(sheetPath, cellMapping) {
    if (!fs.existsSync(sheetPath)) return;
    const sheet = PNG.sync.read(fs.readFileSync(sheetPath));

    for (const [stripIdx, destCol, destRow] of cellMapping) {
        const srcStartX = stripIdx * CELL;
        const destStartX = destCol * CELL;
        const destStartY = destRow * CELL;

        // Clear cell
        for (let dy = 0; dy < CELL; dy++) {
            for (let dx = 0; dx < CELL; dx++) {
                const dIdx = ((destStartY + dy) * sheet.width + (destStartX + dx)) << 2;
                sheet.data[dIdx] = 0;
                sheet.data[dIdx + 1] = 0;
                sheet.data[dIdx + 2] = 0;
                sheet.data[dIdx + 3] = 0;
            }
        }

        // Blit from strip
        for (let dy = 0; dy < CELL; dy++) {
            for (let dx = 0; dx < CELL; dx++) {
                const sIdx = (dy * strip.width + (srcStartX + dx)) << 2;
                const a = strip.data[sIdx + 3];
                if (a === 0) continue;
                const dIdx = ((destStartY + dy) * sheet.width + (destStartX + dx)) << 2;
                sheet.data[dIdx] = strip.data[sIdx];
                sheet.data[dIdx + 1] = strip.data[sIdx + 1];
                sheet.data[dIdx + 2] = strip.data[sIdx + 2];
                sheet.data[dIdx + 3] = a;
            }
        }
    }

    fs.writeFileSync(sheetPath, PNG.sync.write(sheet));
    console.log('Patched sheet:', sheetPath);
}

// Walk (Frames 0..3) in Hoja 1: Row 0, cols 4..7
const hoja1WalkMapping = [
    [0, 4, 0], // Walk 1 -> Col 4, Row 0 (Frame 4)
    [1, 5, 0], // Walk 2 -> Col 5, Row 0 (Frame 5)
    [2, 6, 0], // Walk 3 -> Col 6, Row 0 (Frame 6)
    [3, 7, 0]  // Walk 4 -> Col 7, Row 0 (Frame 7)
];

// Run (Frames 4..7) in Hoja 2: Row 3, cols 4..7
const hoja2RunMapping = [
    [4, 4, 3], // Run 1 -> Col 4, Row 3 (Frame 31)
    [5, 5, 3], // Run 2 -> Col 5, Row 3 (Frame 32)
    [6, 6, 3], // Run 3 -> Col 6, Row 3 (Frame 33)
    [7, 7, 3]  // Run 4 -> Col 7, Row 3 (Frame 34)
];

// Patch both workspace and Godot project
patchSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritesheet_96x96_hoja1.png', hoja1WalkMapping);
patchSheet('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja1.png', hoja1WalkMapping);

patchSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritesheet_96x96_hoja2.png', hoja2RunMapping);
patchSheet('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja2.png', hoja2RunMapping);

console.log('Finished patching Walk and Run into sheets.');
