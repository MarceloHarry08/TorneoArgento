const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const src = PNG.sync.read(data);

function isBg(r, g, b, x, y) {
    if (y % 192 <= 2 || y % 192 >= 189) return true;
    if (x % 229 <= 2 || x % 229 >= 226) return true;
    const diffRG = Math.abs(r - g);
    const diffGB = Math.abs(g - b);
    const diffRB = Math.abs(r - b);
    const maxDiff = Math.max(diffRG, diffGB, diffRB);
    if (maxDiff <= 5 && r >= 48 && r <= 145) return true;
    return false;
}

// 4 Rows, 6 Columns max -> 6 * 96 = 576 wide, 4 * 96 = 384 tall
const sheet = new PNG({ width: 6 * 96, height: 4 * 96 });

const rowDefs = [
    { name: 'Row 1 (Dolar Throw)', y0: 3, y1: 188, numCells: 4, isVFX: false },
    { name: 'Row 2 (Dolar VFX)', y0: 195, y1: 380, numCells: 4, isVFX: true },
    { name: 'Row 3 (Cat Summon)', y0: 388, y1: 572, numCells: 4, isVFX: false },
    { name: 'Row 4 (Fatality)', y0: 580, y1: 764, numCells: 6, isVFX: false }
];

const baselineY = 89;
const standardStandingH = 180.0;
const targetStandingH = 85.0;
const scale = targetStandingH / standardStandingH; // ~0.472

rowDefs.forEach((rDef, rowIndex) => {
    for (let c = 0; c < rDef.numCells; c++) {
        const x0 = Math.round(c * (src.width / 6)) + 3;
        const x1 = Math.round((c + 1) * (src.width / 6)) - 3;
        
        let minX = x1, maxX = x0, minY = rDef.y1, maxY = rDef.y0;
        for (let y = rDef.y0; y <= rDef.y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const p = (y * src.width + x) * 4;
                if (!isBg(src.data[p], src.data[p+1], src.data[p+2], x, y)) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        if (minX > maxX || minY > maxY) continue;
        
        const figW = maxX - minX + 1;
        const figH = maxY - minY + 1;
        const scaledW = Math.round(figW * scale);
        const scaledH = Math.round(figH * scale);
        
        const cellOffsetX = c * 96;
        const cellOffsetY = rowIndex * 96;
        
        const destStartX = cellOffsetX + Math.max(0, Math.min(96 - scaledW, Math.round((96 - scaledW) / 2)));
        let destStartY = cellOffsetY + (baselineY - scaledH + 1);
        
        // If VFX or air projectile (Row 2, or flying cat in Row 3 Cell 4), center vertically in cell
        if (rDef.isVFX || (rowIndex === 2 && c === 3)) {
            destStartY = cellOffsetY + Math.round((96 - scaledH) / 2);
        }
        
        console.log(`Row ${rowIndex + 1} Cell ${c + 1}: ${figW}x${figH} -> ${scaledW}x${scaledH} at (${destStartX}, ${destStartY})`);
        
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
                
                if (!isBg(r, g, b, srcX, srcY)) {
                    const destX = destStartX + dx;
                    const destY = destStartY + dy;
                    if (destX >= cellOffsetX && destX < cellOffsetX + 96 &&
                        destY >= cellOffsetY && destY < cellOffsetY + 96) {
                        const destIdx = (destY * sheet.width + destX) * 4;
                        sheet.data[destIdx] = r;
                        sheet.data[destIdx + 1] = g;
                        sheet.data[destIdx + 2] = b;
                        sheet.data[destIdx + 3] = 255;
                    }
                }
            }
        }
    }
});

const outPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/ojos_azules_spritesheet_specials_fatality_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(sheet));
console.log(`Successfully generated Prompt 6 specials/fatality sheet: ${outPath} (576x384)`);

const artifactPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_spritesheet_specials_fatality_96x96.png';
fs.writeFileSync(artifactPath, PNG.sync.write(sheet));
console.log(`Saved artifact: ${artifactPath}`);
