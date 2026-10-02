// Patch Jump frames into hoja1 Row 1, cols 2..5 (indices 11..14)
const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_jump_turn_96x96.png';
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
    console.log('Patched sheet with Jump frames:', sheetPath);
}

// Jump frames (Cuadros 1..4 -> strip indices 0..3) into Hoja 1 Row 1, cols 2..5
const hoja1JumpMapping = [
    [0, 2, 1], // Startup -> Col 2, Row 1 (Frame 11)
    [1, 3, 1], // Upward -> Col 3, Row 1 (Frame 12)
    [2, 4, 1], // Fall -> Col 4, Row 1 (Frame 13)
    [3, 5, 1]  // Landing -> Col 5, Row 1 (Frame 14)
];

patchSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritesheet_96x96_hoja1.png', hoja1JumpMapping);
patchSheet('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja1.png', hoja1JumpMapping);

console.log('Finished patching Jump frames into sheets.');
