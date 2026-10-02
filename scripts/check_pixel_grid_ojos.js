const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_base_clean.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Cleaned image: ${png.width}x${png.height}`);

// Let's sample runs of identical or near-identical pixels along horizontal lines (e.g. across the forehead, eyes, tie, shoes)
for (let y = 15; y < png.height; y += 10) {
    let runs = [];
    let curLen = 1;
    for (let x = 1; x < png.width; x++) {
        const p1 = (y * png.width + x - 1) * 4;
        const p2 = (y * png.width + x) * 4;
        if (png.data[p1+3] > 0 && png.data[p2+3] > 0) {
            const diff = Math.abs(png.data[p1] - png.data[p2]) + Math.abs(png.data[p1+1] - png.data[p2+1]) + Math.abs(png.data[p1+2] - png.data[p2+2]);
            if (diff < 5) {
                curLen++;
            } else {
                if (curLen > 1) runs.push(curLen);
                curLen = 1;
            }
        }
    }
    if (runs.length > 0) {
        console.log(`y=${y}: run lengths = ${runs.slice(0, 10).join(', ')}`);
    }
}
