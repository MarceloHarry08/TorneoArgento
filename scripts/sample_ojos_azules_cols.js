const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log('Columns:');
for (let x = 0; x < png.width; x += 5) {
    let sum = 0;
    for (let y = 20; y < 115; y++) {
        const idx = (y * png.width + x) * 4;
        sum += (png.data[idx] + png.data[idx+1] + png.data[idx+2]) / 3;
    }
    console.log(`Col ${x}: avg = ${(sum / 95).toFixed(1)}`);
}
