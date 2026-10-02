const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Background pixels: let's gather all colors from the top 15 rows and left 20 cols
const bgColors = new Set();
for (let y = 0; y < 15; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        const hex = `${png.data[idx]},${png.data[idx+1]},${png.data[idx+2]}`;
        bgColors.add(hex);
    }
}
for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < 20; x++) {
        const idx = (y * png.width + x) * 4;
        const hex = `${png.data[idx]},${png.data[idx+1]},${png.data[idx+2]}`;
        bgColors.add(hex);
    }
    for (let x = png.width - 15; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        const hex = `${png.data[idx]},${png.data[idx+1]},${png.data[idx+2]}`;
        bgColors.add(hex);
    }
}

console.log(`Found ${bgColors.size} unique background colors.`);

// Flood fill or BFS from (0,0) to find the connected background component!
const visited = new Uint8Array(png.width * png.height);
const queue = [0];
visited[0] = 1;

function isBgPixel(r, g, b) {
    // Check if close to background colors:
    // Background is dark with slight purple/blue tint
    return (r <= 42 && g <= 40 && b <= 56) && (Math.abs(r - g) < 15 && b >= Math.max(r, g) - 5);
}

let head = 0;
while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % png.width;
    const cy = Math.floor(curr / png.width);
    
    const neighbors = [
        [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
    ];
    for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < png.width && ny >= 0 && ny < png.height) {
            const nidx = ny * png.width + nx;
            if (!visited[nidx]) {
                const p = nidx * 4;
                if (isBgPixel(png.data[p], png.data[p+1], png.data[p+2])) {
                    visited[nidx] = 1;
                    queue.push(nidx);
                }
            }
        }
    }
}

console.log(`Flood filled ${queue.length} background pixels out of ${png.width * png.height} total pixels.`);

// Character pixels are non-visited pixels
let charMinX = png.width, charMaxX = 0, charMinY = png.height, charMaxY = 0;
for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = y * png.width + x;
        if (!visited[idx]) {
            if (x < charMinX) charMinX = x;
            if (x > charMaxX) charMaxX = x;
            if (y < charMinY) charMinY = y;
            if (y > charMaxY) charMaxY = y;
        }
    }
}

console.log(`Character bounding box: x=[${charMinX}, ${charMaxX}] (w=${charMaxX - charMinX + 1}), y=[${charMinY}, ${charMaxY}] (h=${charMaxY - charMinY + 1})`);
