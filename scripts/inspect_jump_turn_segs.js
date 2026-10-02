const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_jump_turn.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Jump/Turn dimensions: ${png.width}x${png.height}`);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 15 && min > 80) return false;
    return true;
}

// In this image, we have:
// Fig 1: Bottom left (jump impulse crouch) -> x: ~20..220, y: ~500..760
// Fig 2: Mid-air float with tie up -> x: ~250..460, y: ~150..550
// Fig 3: Apex high in air -> x: ~480..680, y: ~40..460
// Fig 4: Jump landing crouch -> x: ~690..890, y: ~500..760
// Fig 5: Turn back/3/4 -> x: ~930..1120, y: ~490..760
// Fig 6: Turn finish opposite -> x: ~1140..1340, y: ~500..760

const regions = [
    { name: 'jump_impulse', x: [20, 240], y: [500, 765] },
    { name: 'jump_ascend_tie', x: [240, 480], y: [140, 560] },
    { name: 'jump_apex', x: [480, 700], y: [40, 480] },
    { name: 'jump_land', x: [700, 920], y: [500, 765] },
    { name: 'turn_pivot', x: [930, 1130], y: [490, 765] },
    { name: 'turn_finish', x: [1140, 1360], y: [500, 765] }
];

regions.forEach(reg => {
    let minX = reg.x[1], maxX = reg.x[0];
    let minY = reg.y[1], maxY = reg.y[0];
    for (let y = reg.y[0]; y <= reg.y[1]; y++) {
        for (let x = reg.x[0]; x <= reg.x[1]; x++) {
            const p = (y * png.width + x) * 4;
            if (isChar(png.data[p], png.data[p+1], png.data[p+2])) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    console.log(`${reg.name}: x=[${minX}, ${maxX}] (w=${w}), y=[${minY}, ${maxY}] (h=${h}), bottom=${maxY}`);
});
