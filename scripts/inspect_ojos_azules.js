const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Image dimensions: ${png.width}x${png.height}`);

// Character boundary detection
// Any pixel with brightness or color significantly different from the dark background (#10..#20)
let minX = png.width, maxX = 0, minY = png.height, maxY = 0;

for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        
        // Background pixels are around #121018 to #201a28
        const maxVal = Math.max(r, g, b);
        const isBg = (r < 35 && g < 32 && b < 45);
        if (!isBg) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }
}

console.log(`Character bounding box: x=[${minX}, ${maxX}] (w=${maxX - minX + 1}), y=[${minY}, ${maxY}] (h=${maxY - minY + 1})`);

