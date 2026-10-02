const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_jump_turn.png';
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
    // 4 Jump frames
    { name: 'jump_impulse', xRange: [36, 218], yRange: [500, 755], isAir: false },
    { name: 'jump_ascend_tie', xRange: [259, 462], yRange: [140, 560], isAir: true, airLift: 18 },
    { name: 'jump_apex', xRange: [488, 673], yRange: [40, 460], isAir: true, airLift: 28 },
    { name: 'jump_land', xRange: [712, 881], yRange: [500, 755], isAir: false },
    // 2 Turn frames
    { name: 'turn_pivot', xRange: [957, 1117], yRange: [490, 755], isAir: false },
    { name: 'turn_finish', xRange: [1156, 1332], yRange: [500, 755], isAir: false }
];

const strip = new PNG({ width: 6 * 96, height: 96 });
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
    
    // For ground poses, foot is at baselineY
    // For airborne poses, foot is lifted by airLift
    let destFootY = baselineY;
    if (fig.isAir) {
        destFootY = baselineY - fig.airLift;
    }
    const destStartY = Math.max(2, destFootY - scaledH + 1);
    
    console.log(`Cell ${cellIdx + 1} (${fig.name}): size ${figW}x${figH} -> ${scaledW}x${scaledH} at destX=${destStartX}, destY=${destStartY}..${destFootY}`);
    
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

const outPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritestrip_jump_turn_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log(`Successfully generated Prompt 5 jump/turn strip: ${outPath} (576x96)`);

const artifactPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_spritestrip_jump_turn_96x96.png';
fs.writeFileSync(artifactPath, PNG.sync.write(strip));
console.log(`Saved artifact: ${artifactPath}`);
