const fs = require('fs');
const { PNG } = require('pngjs');

const imgPath = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/ojos_azules_idle_crouch.png';
const data = fs.readFileSync(imgPath);
const png = PNG.sync.read(data);

console.log(`Dimensions: ${png.width}x${png.height}`);

// Notice the background is gray checkerboard:
// White squares ~ (200, 200, 200) and gray squares ~ (150, 150, 150)
// Character pixels have color (suit navy blue, skin tan, hair dark gray, tie blue)

// Check row brightness and character detection across y
for (let y = 0; y < png.height; y += 20) {
    let charPixels = 0;
    for (let x = 0; x < png.width; x++) {
        const idx = (y * png.width + x) * 4;
        const r = png.data[idx];
        const g = png.data[idx+1];
        const b = png.data[idx+2];
        // Checkerboard is nearly neutral gray (r ~= g ~= b)
        const isNeutral = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10 && r > 100;
        if (!isNeutral) charPixels++;
    }
    console.log(`y=${y}: non-neutral pixels = ${charPixels}`);
}
