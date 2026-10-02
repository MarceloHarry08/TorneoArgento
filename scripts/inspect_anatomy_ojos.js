const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base_96x96.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Inspect rows from y=5 to y=89
for (let y = 5; y <= 89; y += 4) {
    let colors = [];
    for (let x = 0; x < 96; x++) {
        const p = (y * 96 + x) * 4;
        if (png.data[p+3] > 0) {
            colors.push(`[${png.data[p]},${png.data[p+1]},${png.data[p+2]}]`);
        }
    }
    console.log(`y=${y}: count=${colors.length}, sample=${colors.slice(0, 3).join('')}...${colors.slice(-2).join('')}`);
}
