// Patch Special Attacks into hoja2 spritesheet
const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_specials_96x96.png';
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
    console.log('Patched sheet with Specials:', sheetPath);
}

// Mapping into Hoja 2 (9 cols x 5 rows):
// Row 0: Rugido Sónico (Cols 0..3), Micrófono (Cols 4..8)
// Row 1: Motosierra (Cols 0..4)
// Row 2: Mordisco Feroz (Cols 0..3)
const hoja2SpecialsMapping = [
    // Rugido Sónico (strip 0..3 -> Row 0, cols 0..3)
    [0, 0, 0], [1, 1, 0], [2, 2, 0], [3, 3, 0],

    // Lanza Micrófono (strip 9..13 -> Row 0, cols 4..8)
    [9, 4, 0], [10, 5, 0], [11, 6, 0], [12, 7, 0], [13, 8, 0],

    // Saca Motosierra (strip 4..8 -> Row 1, cols 0..4)
    [4, 0, 1], [5, 1, 1], [6, 2, 1], [7, 3, 1], [8, 4, 1],

    // Mordisco Feroz (strip 14..17 -> Row 2, cols 0..3)
    [14, 0, 2], [15, 1, 2], [16, 2, 2], [17, 3, 2]
];

patchSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritesheet_96x96_hoja2.png', hoja2SpecialsMapping);
patchSheet('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja2.png', hoja2SpecialsMapping);

console.log('Finished patching Specials into hoja2.');
