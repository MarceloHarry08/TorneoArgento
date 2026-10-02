const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_kicks.png';
const data = fs.readFileSync(imgPath);
const src = PNG.sync.read(data);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

const figures = [
    // High kick (4 frames)
    { name: 'hk_startup', xRange: [46, 214], yRange: [30, 380] },
    { name: 'hk_impact_high', xRange: [281, 601], yRange: [30, 380] },
    { name: 'hk_recovery', xRange: [697, 893], yRange: [30, 380] },
    { name: 'hk_landing', xRange: [969, 1146], yRange: [30, 380] },
    // Low kick / sweep (4 frames)
    { name: 'lk_startup_hand_ground', xRange: [63, 267], yRange: [410, 760] },
    { name: 'lk_sweep_ext', xRange: [356, 670], yRange: [410, 760] },
    { name: 'lk_sweep_ground', xRange: [779, 1066], yRange: [410, 760] },
    { name: 'lk_return_crouch', xRange: [1141, 1313], yRange: [410, 760] }
];

const strip = new PNG({ width: 8 * 96, height: 96 });
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

const outPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_kicks_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log(`Successfully generated Prompt 3 kicks strip: ${outPath} (768x96)`);

const artifactPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_spritestrip_kicks_96x96.png';
fs.writeFileSync(artifactPath, PNG.sync.write(strip));
console.log(`Saved artifact: ${artifactPath}`);
