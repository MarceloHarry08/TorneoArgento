const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_kicks.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Kicks dimensions: ${png.width}x${png.height}`);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

// Row 1 (y: 20 to 380)
const colCountsR1 = [];
for (let x = 0; x < png.width; x++) {
    let count = 0;
    for (let y = 20; y < 380; y++) {
        const p = (y * png.width + x) * 4;
        if (isChar(png.data[p], png.data[p+1], png.data[p+2])) count++;
    }
    colCountsR1.push(count);
}

// Row 2 (y: 410 to 760)
const colCountsR2 = [];
for (let x = 0; x < png.width; x++) {
    let count = 0;
    for (let y = 410; y < 760; y++) {
        const p = (y * png.width + x) * 4;
        if (isChar(png.data[p], png.data[p+1], png.data[p+2])) count++;
    }
    colCountsR2.push(count);
}

function findSegments(counts, minGap = 20, minW = 50) {
    const segs = [];
    let inSeg = false;
    let start = 0;
    let gap = 0;
    for (let x = 0; x < counts.length; x++) {
        if (counts[x] > 10) {
            if (!inSeg) {
                inSeg = true;
                start = x;
            }
            gap = 0;
        } else {
            if (inSeg) {
                gap++;
                if (gap >= minGap || x === counts.length - 1) {
                    const end = x - gap;
                    if (end - start + 1 >= minW) {
                        segs.push({ start, end });
                    }
                    inSeg = false;
                }
            }
        }
    }
    return segs;
}

console.log('Row 1 segments:', findSegments(colCountsR1));
console.log('Row 2 segments:', findSegments(colCountsR2));
