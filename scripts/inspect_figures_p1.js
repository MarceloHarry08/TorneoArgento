const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_idle_crouch.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

function isChar(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max < 30) return true;
    if (diff < 12 && r > 90) return false;
    return true;
}

const figures = [
    // 4 idle frames from Row 1:
    { name: 'idle_f1', xRange: [52, 219], yRange: [20, 375] },
    { name: 'idle_f2', xRange: [327, 498], yRange: [20, 375] },
    { name: 'idle_f3', xRange: [599, 771], yRange: [20, 375] },
    { name: 'idle_f4', xRange: [877, 1044], yRange: [20, 375] },
    // 3 crouch frames from Row 2:
    { name: 'crouch_down', xRange: [316, 490], yRange: [410, 760] },
    { name: 'crouch_loop', xRange: [602, 778], yRange: [410, 760] },
    { name: 'crouch_up', xRange: [883, 1060], yRange: [410, 760] }
];

figures.forEach(fig => {
    let minX = fig.xRange[1], maxX = fig.xRange[0];
    let minY = fig.yRange[1], maxY = fig.yRange[0];
    
    for (let y = fig.yRange[0]; y <= fig.yRange[1]; y++) {
        for (let x = fig.xRange[0]; x <= fig.xRange[1]; x++) {
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
    console.log(`${fig.name}: x=[${minX}, ${maxX}] (w=${w}), y=[${minY}, ${maxY}] (h=${h}), bottom=${maxY}`);
});
