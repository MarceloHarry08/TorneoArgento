// TORNEO ARGENTO 16-BIT - Patch Hoja 1 with Ground Truth Frames
// Injects the 7 ground truth frames from leon_spritestrip_idle_crouch_96x96.png
// into Row 0 (Idle 0..3) and Row 1 (Crouch 9..11) of leon_spritesheet_96x96_hoja1.png.

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const STRIP_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_idle_crouch_96x96.png';
const HOJA1_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja1.png';

const strip = PNG.sync.read(fs.readFileSync(STRIP_PATH));
const hoja1 = PNG.sync.read(fs.readFileSync(HOJA1_PATH));

const CELL = 96;

// Helper to copy a 96x96 cell from strip into hoja1 at (targetCol, targetRow)
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

// Row 0: Idle (Cuadros 1, 2, 3, 4 -> Cols 0, 1, 2, 3)
copyCell(0, 0, 0); // Frame 1: Ground truth base
copyCell(1, 1, 0); // Frame 2: Breath in
copyCell(2, 2, 0); // Frame 3: Peak breath
copyCell(3, 3, 0); // Frame 4: Breath return

// Also mirror into cols 4, 5, 6, 7 for walk cycle
copyCell(0, 4, 0);
copyCell(1, 5, 0);
copyCell(2, 6, 0);
copyCell(3, 7, 0);

// Row 1: Crouch (Cuadros 5, 6, 7 -> Cols 0, 1, 2)
copyCell(4, 0, 1); // Frame 5: Crouch start (cell 9)
copyCell(5, 1, 1); // Frame 6: Full low guard crouch (cell 10)
copyCell(6, 2, 1); // Frame 7: Crouch end / return (cell 11)

fs.writeFileSync(HOJA1_PATH, PNG.sync.write(hoja1));
console.log('✓ Successfully patched leon_spritesheet_96x96_hoja1.png with Ground Truth frames!');

// Copy to artifacts
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
fs.writeFileSync(path.join(artifactDir, 'leon_spritesheet_96x96_hoja1.png'), PNG.sync.write(hoja1));
console.log('✓ Updated artifact copy.');
