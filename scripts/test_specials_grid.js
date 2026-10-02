const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isChar(r, g, b, x, y) {
    // Avoid grid lines
    if (y % 192 < 3 || y % 192 > 189) return false;
    if (x % 229 < 3 || x % 229 > 226) return false;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 35) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

const rows = [
    { name: 'Row 1 (Dolar Throw)', y0: 4, y1: 188, numCells: 4 },
    { name: 'Row 2 (Dolar VFX)', y0: 195, y1: 380, numCells: 4 },
    { name: 'Row 3 (Cat Summon)', y0: 388, y1: 572, numCells: 4 },
    { name: 'Row 4 (Fatality)', y0: 580, y1: 764, numCells: 6 }
];

rows.forEach(r => {
    console.log(`\n=== ${r.name} ===`);
    for (let c = 0; c < r.numCells; c++) {
        const x0 = Math.round(c * (png.width / 6)) + 4;
        const x1 = Math.round((c + 1) * (png.width / 6)) - 4;
        
        let minX = x1, maxX = x0, minY = r.y1, maxY = r.y0;
        let count = 0;
        
        for (let y = r.y0; y <= r.y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const p = (y * png.width + x) * 4;
                if (isChar(png.data[p], png.data[p+1], png.data[p+2], x, y)) {
                    count++;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        console.log(`  Cell ${c + 1}: count=${count}, x=[${minX}, ${maxX}] (w=${maxX-minX+1}), y=[${minY}, ${maxY}] (h=${maxY-minY+1}), bottom=${maxY}`);
    }
});
