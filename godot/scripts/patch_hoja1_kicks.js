const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_kicks_96x96.png';
const HOJA1_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja1.png';

const strip = PNG.sync.read(fs.readFileSync(STRIP_PATH));
const hoja1 = PNG.sync.read(fs.readFileSync(HOJA1_PATH));

const CELL = 96;

function copyCell(fromStripIdx, targetCol, targetRow) {
    const srcStartX = fromStripIdx * CELL;
    const destStartX = targetCol * CELL;
    const destStartY = targetRow * CELL;

    // Clear dest cell first
    for (let dy = 0; dy < CELL; dy++) {
        for (let dx = 0; dx < CELL; dx++) {
            const dIdx = ((destStartY + dy) * hoja1.width + (destStartX + dx)) << 2;
            hoja1.data[dIdx] = 0;
            hoja1.data[dIdx + 1] = 0;
            hoja1.data[dIdx + 2] = 0;
            hoja1.data[dIdx + 3] = 0;
        }
    }

    // Blit from strip
    for (let dy = 0; dy < CELL; dy++) {
        for (let dx = 0; dx < CELL; dx++) {
            const sIdx = (dy * strip.width + (srcStartX + dx)) << 2;
            const a = strip.data[sIdx + 3];
            if (a === 0) continue;
            const dIdx = ((destStartY + dy) * hoja1.width + (destStartX + dx)) << 2;
            hoja1.data[dIdx] = strip.data[sIdx];
            hoja1.data[dIdx + 1] = strip.data[sIdx + 1];
            hoja1.data[dIdx + 2] = strip.data[sIdx + 2];
            hoja1.data[dIdx + 3] = a;
        }
    }
}

// Row 3 is Patadas (Kicks):
// Cols 0, 1, 2, 3: High Kick (Frames 1..4 -> cells 27, 28, 29, 30)
copyCell(0, 0, 3);
copyCell(1, 1, 3);
copyCell(2, 2, 3);
copyCell(3, 3, 3);

// Cols 4, 5, 6, 7: Low Sweep (Frames 5..8 -> cells 31, 32, 33, 34)
copyCell(4, 4, 3);
copyCell(5, 5, 3);
copyCell(6, 6, 3);
copyCell(7, 7, 3);

fs.writeFileSync(HOJA1_PATH, PNG.sync.write(hoja1));
console.log('✓ Successfully injected 8 Kick frames into leon_spritesheet_96x96_hoja1.png (Row 3, Cols 0..7)');

// Copy to artifacts
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
fs.writeFileSync(path.join(artifactDir, 'leon_spritesheet_96x96_hoja1.png'), PNG.sync.write(hoja1));
console.log('✓ Updated artifact copy of leon_spritesheet_96x96_hoja1.png');
