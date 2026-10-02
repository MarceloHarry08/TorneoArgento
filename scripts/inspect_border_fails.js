const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isBg(r, g, b) {
    const maxVal = Math.max(r, g, b);
    if (maxVal < 42 && r < 36 && g < 36 && b < 52) return true;
    if (r <= 32 && g <= 30 && b <= 42) return true;
    return false;
}

console.log('Border pixels failing isBg:');
for (let x = 0; x < png.width; x++) {
    for (const y of [0, 1, png.height - 2, png.height - 1]) {
        const p = (y * png.width + x) * 4;
        if (!isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            console.log(`x=${x}, y=${y}: (${png.data[p]}, ${png.data[p+1]}, ${png.data[p+2]})`);
        }
    }
}
for (let y = 0; y < png.height; y++) {
    for (const x of [0, 1, png.width - 2, png.width - 1]) {
        const p = (y * png.width + x) * 4;
        if (!isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            console.log(`x=${x}, y=${y}: (${png.data[p]}, ${png.data[p+1]}, ${png.data[p+2]})`);
        }
    }
}
