const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Specials dimensions: ${png.width}x${png.height}`);

// Check horizontal grid lines dividing the 4 rows:
for (let y = 170; y < 210; y++) {
    let dark = 0;
    for (let x = 0; x < png.width; x++) {
        const p = (y * png.width + x) * 4;
        if (png.data[p] < 40 && png.data[p+1] < 40 && png.data[p+2] < 40) dark++;
    }
    if (dark > png.width * 0.7) console.log(`Dividing line 1 at y=${y} (dark=${dark})`);
}

for (let y = 360; y < 400; y++) {
    let dark = 0;
    for (let x = 0; x < png.width; x++) {
        const p = (y * png.width + x) * 4;
        if (png.data[p] < 40 && png.data[p+1] < 40 && png.data[p+2] < 40) dark++;
    }
    if (dark > png.width * 0.7) console.log(`Dividing line 2 at y=${y} (dark=${dark})`);
}

for (let y = 550; y < 600; y++) {
    let dark = 0;
    for (let x = 0; x < png.width; x++) {
        const p = (y * png.width + x) * 4;
        if (png.data[p] < 40 && png.data[p+1] < 40 && png.data[p+2] < 40) dark++;
    }
    if (dark > png.width * 0.7) console.log(`Dividing line 3 at y=${y} (dark=${dark})`);
}
