const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_specials_fatality.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Sample background at (10, 10), (10, 20), (20, 10), (20, 20)
for (let y = 5; y < 35; y += 5) {
    let row = `y=${y}: `;
    for (let x = 5; x < 35; x += 5) {
        const p = (y * png.width + x) * 4;
        row += `(${png.data[p]},${png.data[p+1]},${png.data[p+2]}) `;
    }
    console.log(row);
}
