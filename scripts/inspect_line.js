const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_block_walk_run.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Check y around 380 to 420 for the guide line
for (let y = 380; y <= 425; y++) {
    let darkCount = 0;
    for (let x = 0; x < png.width; x++) {
        const p = (y * png.width + x) * 4;
        if (png.data[p] < 80 && png.data[p+1] < 80 && png.data[p+2] < 80) darkCount++;
    }
    console.log(`y=${y}: dark pixels across width = ${darkCount}`);
}
