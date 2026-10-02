const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_idle_crouch.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isChar(r, g, b) {
    // Checkerboard is near-gray: r ~= g ~= b and brightness > 90
    // Any significant saturation or very dark pixel (black shoe, dark outline) belongs to character
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // Very dark outlines or black shoes:
    if (max < 30) return true;
    
    // Checkerboard squares in this image: (140..170, 140..170, 140..170) or (190..220, 190..220, 190..220)
    if (diff < 12 && r > 90) return false;
    
    return true;
}

// Inspect Row 1 (y: 10 to 380)
console.log('--- ROW 1 COLUMNS ---');
const colCountsR1 = [];
for (let x = 0; x < png.width; x++) {
    let count = 0;
    for (let y = 20; y < 375; y++) {
        const p = (y * png.width + x) * 4;
        if (isChar(png.data[p], png.data[p+1], png.data[p+2])) count++;
    }
    colCountsR1.push(count);
}

// Find contiguous column segments where count > 10
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

const r1Segs = findSegments(colCountsR1);
console.log(`Row 1 segments (${r1Segs.length}):`, r1Segs);

// Inspect Row 2 (y: 400 to 760)
console.log('--- ROW 2 COLUMNS ---');
const colCountsR2 = [];
for (let x = 0; x < png.width; x++) {
    let count = 0;
    for (let y = 410; y < 760; y++) {
        const p = (y * png.width + x) * 4;
        if (isChar(png.data[p], png.data[p+1], png.data[p+2])) count++;
    }
    colCountsR2.push(count);
}

const r2Segs = findSegments(colCountsR2);
console.log(`Row 2 segments (${r2Segs.length}):`, r2Segs);
