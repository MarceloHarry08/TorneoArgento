const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isBg(r, g, b, x, y) {
    // Grid lines (dark lines dividing rows and columns)
    if (y % 192 <= 2 || y % 192 >= 189) return true;
    if (x % 229 <= 2 || x % 229 >= 226) return true;
    
    // Pure or near pure gray checkerboard:
    const diffRG = Math.abs(r - g);
    const diffGB = Math.abs(g - b);
    const diffRB = Math.abs(r - b);
    const maxDiff = Math.max(diffRG, diffGB, diffRB);
    
    // If neutral gray (within tolerance 4) and brightness between 45 and 145:
    if (maxDiff <= 5 && r >= 48 && r <= 145) {
        return true;
    }
    return false;
}

// Check character bounding box in each cell
const rows = [
    { name: 'Row 1 (Dolar Throw)', y0: 3, y1: 188, numCells: 4 },
    { name: 'Row 2 (Dolar VFX)', y0: 195, y1: 380, numCells: 4 },
    { name: 'Row 3 (Cat Summon)', y0: 388, y1: 572, numCells: 4 },
    { name: 'Row 4 (Fatality)', y0: 580, y1: 764, numCells: 6 }
];

rows.forEach(r => {
    console.log(`\n=== ${r.name} ===`);
    for (let c = 0; c < r.numCells; c++) {
        const x0 = Math.round(c * (png.width / 6)) + 3;
        const x1 = Math.round((c + 1) * (png.width / 6)) - 3;
        
        let minX = x1, maxX = x0, minY = r.y1, maxY = r.y0;
        let count = 0;
        
        for (let y = r.y0; y <= r.y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const p = (y * png.width + x) * 4;
                if (!isBg(png.data[p], png.data[p+1], png.data[p+2], x, y)) {
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
