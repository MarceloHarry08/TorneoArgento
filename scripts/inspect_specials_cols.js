const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Check vertical dividing lines along row 1 (y: 20 to 180)
console.log('Vertical line check:');
for (let x = 0; x < png.width; x++) {
    let dark = 0;
    for (let y = 10; y < 185; y++) {
        const p = (y * png.width + x) * 4;
        if (png.data[p] < 40 && png.data[p+1] < 40 && png.data[p+2] < 40) dark++;
    }
    if (dark > 160) {
        console.log(`Vertical line at x=${x}`);
    }
}
