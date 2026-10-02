const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_high_punch_96x96.png';
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

// Row 2 is Piñas:
// High Punch: 4 frames -> Cols 0, 1, 2, 3 (Frames 18, 19, 20, 21)
copyCell(0, 0, 2); // Frame 1: Startup
copyCell(1, 1, 2); // Frame 2: Active / Impact
copyCell(2, 2, 2); // Frame 3: Recovery 1
copyCell(3, 3, 2); // Frame 4: Neutral Return

fs.writeFileSync(HOJA1_PATH, PNG.sync.write(hoja1));
console.log('✓ Successfully injected 4 High Punch frames into leon_spritesheet_96x96_hoja1.png (Row 2, Cols 0..3)');

// Copy to artifacts
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
fs.writeFileSync(path.join(artifactDir, 'leon_spritesheet_96x96_hoja1.png'), PNG.sync.write(hoja1));
console.log('✓ Updated artifact copy of leon_spritesheet_96x96_hoja1.png');
