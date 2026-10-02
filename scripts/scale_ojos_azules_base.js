const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base_clean.png';
const data = fs.readFileSync(imgPath);
const src = PNG.sync.read(data);

// Target height: 85 px
const targetH = 85;
const scale = targetH / src.height;
const targetW = Math.round(src.width * scale); // ~40 px

console.log(`Original: ${src.width}x${src.height} -> Scaled: ${targetW}x${targetH} (scale=${scale.toFixed(4)})`);

// Create 96x96 canvas
const cell = new PNG({ width: 96, height: 96 });
const baselineY = 89;
const startY = baselineY - targetH + 1; // 89 - 85 + 1 = 5
const startX = Math.round((96 - targetW) / 2); // Center horizontally

console.log(`Placing at startX=${startX}, startY=${startY} to y=${baselineY}`);

for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
        // Nearest neighbor sampling
        const srcX = Math.min(src.width - 1, Math.floor(x / scale));
        const srcY = Math.min(src.height - 1, Math.floor(y / scale));
        
        const srcIdx = (srcY * src.width + srcX) * 4;
        const alpha = src.data[srcIdx + 3];
        
        if (alpha > 50) {
            const destX = startX + x;
            const destY = startY + y;
            const destIdx = (destY * 96 + destX) * 4;
            
            cell.data[destIdx] = src.data[srcIdx];
            cell.data[destIdx + 1] = src.data[srcIdx + 1];
            cell.data[destIdx + 2] = src.data[srcIdx + 2];
            cell.data[destIdx + 3] = 255;
        }
    }
}

fs.writeFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base_96x96.png', PNG.sync.write(cell));
console.log('Saved ojos_azules_base_96x96.png');
