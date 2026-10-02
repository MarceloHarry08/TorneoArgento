const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

// Let's sample colors in the 4 corners:
console.log('Corner (0,0):', png.data[0], png.data[1], png.data[2]);
console.log('Corner (103,0):', png.data[(103)*4], png.data[(103)*4+1], png.data[(103)*4+2]);
console.log('Corner (0,140):', png.data[(140*104)*4], png.data[(140*104)*4+1], png.data[(140*104)*4+2]);
console.log('Corner (103,140):', png.data[(140*104+103)*4], png.data[(140*104+103)*4+1], png.data[(140*104+103)*4+2]);

// Print row brightness averages:
for (let y = 0; y < png.height; y += 5) {
    let sum = 0;
    for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        sum += (png.data[idx] + png.data[idx+1] + png.data[idx+2]) / 3;
    }
    console.log(`Row ${y}: avg = ${(sum / png.width).toFixed(1)}`);
}
