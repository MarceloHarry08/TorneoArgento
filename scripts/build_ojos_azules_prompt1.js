const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_idle_crouch.png';
const data = fs.readFileSync(imgPath);
const src = PNG.sync.read(data);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    // Dark outline or shoes
    if (max < 40) return true;
    // Checkerboard squares (grayish with little saturation)
    if (diff < 15 && min > 80) return false;
    return true;
}

const figures = [
    { name: 'idle_1', xRange: [52, 219], yRange: [20, 369] },
    { name: 'idle_2', xRange: [327, 498], yRange: [20, 369] },
    { name: 'idle_3', xRange: [599, 771], yRange: [20, 369] },
    { name: 'idle_4', xRange: [877, 1044], yRange: [20, 369] },
    { name: 'crouch_down', xRange: [316, 490], yRange: [410, 754] },
    { name: 'crouch_hold', xRange: [602, 778], yRange: [410, 754] },
    { name: 'crouch_up', xRange: [883, 1060], yRange: [410, 754] }
];

// Target: 7 cells of 96x96 -> Total width = 7 * 96 = 672, height = 96
const strip = new PNG({ width: 7 * 96, height: 96 });
const baselineY = 89;
const standardStandingH = 345.0;
const targetStandingH = 85.0;
const scale = targetStandingH / standardStandingH; // ~0.2464

figures.forEach((fig, cellIdx) => {
    // Determine bounding box
    let minX = fig.xRange[1], maxX = fig.xRange[0];
    let minY = fig.yRange[1], maxY = fig.yRange[0];
    for (let y = fig.yRange[0]; y <= fig.yRange[1]; y++) {
        for (let x = fig.xRange[0]; x <= fig.xRange[1]; x++) {
            const p = (y * src.width + x) * 4;
            if (isChar(src.data[p], src.data[p+1], src.data[p+2])) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    const figW = maxX - minX + 1;
    const figH = maxY - minY + 1;
    const footLine = maxY; // Feet position in source
    
    const scaledW = Math.round(figW * scale);
    const scaledH = Math.round(figH * scale);
    
    // Cell offset
    const cellOffsetX = cellIdx * 96;
    const destStartX = cellOffsetX + Math.round((96 - scaledW) / 2);
    // Align feet to baselineY
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
            
            if (isChar(r, g, b)) {
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

// Save to assets/sprites
const outPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_idle_crouch_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log(`Successfully generated Prompt 1 sprite strip: ${outPath} (672x96)`);

// Also save to brain artifact directory
const artifactPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_spritestrip_idle_crouch_96x96.png';
fs.writeFileSync(artifactPath, PNG.sync.write(strip));
console.log(`Saved artifact: ${artifactPath}`);
