const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Inspect rows around bottom (120 to 140) and top (5 to 25)
console.log('Top rows character pixels:');
for (let y = 10; y <= 25; y++) {
    let row = `y=${y}: `;
    for (let x = 40; x <= 80; x += 4) {
        const p = (y * png.width + x) * 4;
        row += `(${png.data[p]},${png.data[p+1]},${png.data[p+2]}) `;
    }
    console.log(row);
}

console.log('\nBottom rows character pixels:');
for (let y = 125; y <= 140; y++) {
    let row = `y=${y}: `;
    for (let x = 40; x <= 80; x += 4) {
        const p = (y * png.width + x) * 4;
        row += `(${png.data[p]},${png.data[p+1]},${png.data[p+2]}) `;
    }
    console.log(row);
}
