const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_block_walk_run.png';
const data = fs.readFileSync(imgPath);
const src = PNG.sync.read(data);

function isChar(r, g, b, y) {
    // Avoid ground line around y >= 405
    if (y >= 395 && y <= 435) return false;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

const figures = [
    // Block (3 frames)
    { name: 'block_1', xRange: [32, 177], yRange: [20, 385] },
    { name: 'block_2', xRange: [207, 360], yRange: [20, 385] },
    { name: 'block_3_sparks', xRange: [401, 582], yRange: [20, 385] },
    // Walk (4 frames)
    { name: 'walk_1', xRange: [636, 767], yRange: [20, 385] },
    { name: 'walk_2', xRange: [826, 965], yRange: [20, 385] },
    { name: 'walk_3', xRange: [1016, 1140], yRange: [20, 385] },
    { name: 'walk_4', xRange: [1199, 1338], yRange: [20, 385] },
    // Run (4 frames)
    { name: 'run_1', xRange: [55, 246], yRange: [450, 755] },
    { name: 'run_2', xRange: [316, 532], yRange: [450, 755] },
    { name: 'run_3', xRange: [613, 802], yRange: [450, 755] },
    { name: 'run_4', xRange: [866, 1051], yRange: [450, 755] }
];

const strip = new PNG({ width: 11 * 96, height: 96 });
const baselineY = 89;
const standardStandingH = 345.0;
const targetStandingH = 85.0;
const scale = targetStandingH / standardStandingH; // ~0.2464

figures.forEach((fig, cellIdx) => {
    let minX = fig.xRange[1], maxX = fig.xRange[0];
    let minY = fig.yRange[1], maxY = fig.yRange[0];
    for (let y = fig.yRange[0]; y <= fig.yRange[1]; y++) {
        for (let x = fig.xRange[0]; x <= fig.xRange[1]; x++) {
            const p = (y * src.width + x) * 4;
            if (isChar(src.data[p], src.data[p+1], src.data[p+2], y)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    const figW = maxX - minX + 1;
    const figH = maxY - minY + 1;
    const scaledW = Math.round(figW * scale);
    const scaledH = Math.round(figH * scale);
    
    const cellOffsetX = cellIdx * 96;
    const destStartX = cellOffsetX + Math.max(0, Math.min(96 - scaledW, Math.round((96 - scaledW) / 2)));
    const destStartY = baselineY - scaledH + 1;
    
    console.log(`Cell ${cellIdx + 1} (${fig.name}): size ${figW}x${figH} -> ${scaledW}x${scaledH} at destX=${destStartX}, destY=${destStartY}..${baselineY}`);
    
    for (let dy = 0; dy < scaledH; dy++) {
        for (let dx = 0; dx < scaledW; dx++) {
            const sy = Math.min(figH - 1, Math.floor(dy / scale));
            const sx = Math.min(figW - 1, Math.floor(dx / scale));
            
            const srcX = minX + sx;
            const srcY = minY + sy;
            const srcIdx = (srcY * src.width + srcX) * 4;
            
            const r = src.data[srcIdx];
            const g = src.data[srcIdx + 1];
            const b = src.data[srcIdx + 2];
            
            if (isChar(r, g, b, srcY)) {
                const destX = destStartX + dx;
                const destY = destStartY + dy;
                if (destX >= cellOffsetX && destX < cellOffsetX + 96 && destY >= 0 && destY < 96) {
                    const destIdx = (destY * strip.width + destX) * 4;
                    strip.data[destIdx] = r;
                    strip.data[destIdx + 1] = g;
                    strip.data[destIdx + 2] = b;
                    strip.data[destIdx + 3] = 255;
                }
            }
        }
    }
});

const outPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_block_walk_run_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log(`Successfully generated Prompt 4 block/walk/run strip: ${outPath} (1056x96)`);

const artifactPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_spritestrip_block_walk_run_96x96.png';
fs.writeFileSync(artifactPath, PNG.sync.write(strip));
console.log(`Saved artifact: ${artifactPath}`);
