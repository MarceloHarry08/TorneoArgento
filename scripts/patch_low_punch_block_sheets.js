// Patch hoja1 and hoja2 with the new low punch and block frames
const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_low_punch_block_96x96.png';
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

// Low punch in Hoja 1: Row 2, cols 6..8 (frames 1, 2, 3)
const hoja1Mapping = [
    [0, 6, 2], // Cuadro 1 -> Col 6, Row 2 (Startup)
    [1, 7, 2], // Cuadro 2 -> Col 7, Row 2 (Active punch)
    [2, 8, 2]  // Cuadro 3 -> Col 8, Row 2 (Recovery)
];

// Block in Hoja 2: Row 3, cols 0..2
const hoja2Mapping = [
    [4, 0, 3], // Cuadro 5 -> Col 0, Row 3 (Entry)
    [5, 1, 3], // Cuadro 6 -> Col 1, Row 3 (Firm block)
    [6, 2, 3]  // Cuadro 7 -> Col 2, Row 3 (Impact with sparks)
];

['c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites',
 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites'].forEach(dir => {
    patchSheet(path.join(dir, 'leon_spritesheet_96x96_hoja1.png'), hoja1Mapping);
    patchSheet(path.join(dir, 'leon_spritesheet_96x96_hoja2.png'), hoja2Mapping);
});
console.log('Done patching sheets.');
