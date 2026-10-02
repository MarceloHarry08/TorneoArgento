const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_punches.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

console.log('Row 1 cols 150 to 320:');
for (let x = 180; x < 300; x += 5) {
    let count = 0;
    for (let y = 30; y < 380; y++) {
        const p = (y * png.width + x) * 4;
        if (isChar(png.data[p], png.data[p+1], png.data[p+2])) count++;
    }
    console.log(`x=${x}: count=${count}`);
}
