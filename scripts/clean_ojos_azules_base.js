const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

const visited = new Uint8Array(png.width * png.height);
const queue = [];

function isBg(r, g, b) {
    // Background is dark checkerboard: r in [10..40], g in [10..38], b in [15..55]
    // Crucially, in background, blue is at most 18 higher than r or g
    // Navy suit has much higher blue or different saturation
    if (r <= 40 && g <= 38 && b <= 55 && (b - Math.max(r, g) <= 18)) {
        return true;
    }
    return false;
}

// Add all perimeter pixels that match bg
for (let x = 0; x < png.width; x++) {
    for (const y of [0, png.height - 1]) {
        const idx = y * png.width + x;
        const p = idx * 4;
        if (isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            visited[idx] = 1;
            queue.push(idx);
        }
    }
}
for (let y = 0; y < png.height; y++) {
    for (const x of [0, png.width - 1]) {
        const idx = y * png.width + x;
        const p = idx * 4;
        if (!visited[idx] && isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            visited[idx] = 1;
            queue.push(idx);
        }
    }
}

let head = 0;
while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % png.width;
    const cy = Math.floor(curr / png.width);
    
    const neighbors = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
    for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < png.width && ny >= 0 && ny < png.height) {
            const nidx = ny * png.width + nx;
            if (!visited[nidx]) {
                const p = nidx * 4;
                if (isBg(png.data[p], png.data[p+1], png.data[p+2])) {
                    visited[nidx] = 1;
                    queue.push(nidx);
                }
            }
        }
    }
}

// Find character bounds
let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = y * png.width + x;
        if (!visited[idx]) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }
}

const charW = maxX - minX + 1;
const charH = maxY - minY + 1;
console.log(`Cleaned character bounds: x=[${minX}, ${maxX}] (w=${charW}), y=[${minY}, ${maxY}] (h=${charH})`);

// Create transparent PNG of character
const out = new PNG({ width: charW, height: charH });
for (let y = 0; y < charH; y++) {
    for (let x = 0; x < charW; x++) {
        const srcX = minX + x;
        const srcY = minY + y;
        const srcIdx = srcY * png.width + srcX;
        const outIdx = (y * charW + x) * 4;
        
        if (!visited[srcIdx]) {
            const p = srcIdx * 4;
            out.data[outIdx] = png.data[p];
            out.data[outIdx+1] = png.data[p+1];
            out.data[outIdx+2] = png.data[p+2];
            out.data[outIdx+3] = 255;
        } else {
            out.data[outIdx+3] = 0;
        }
    }
}

fs.writeFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base_clean.png', PNG.sync.write(out));
console.log('Saved ojos_azules_base_clean.png');
