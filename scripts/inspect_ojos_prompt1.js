const fs = require('fs');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const imgPath = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/ojos_azules_idle_crouch_1790739320340.jpg';
const rawData = fs.readFileSync(imgPath);
const jpg = jpeg.decode(rawData, { useTArray: true });

console.log(`JPG dimensions: ${jpg.width}x${jpg.height}`);

// Let's find character clusters / columns
// Sample row brightness across the height
for (let y = 0; y < jpg.height; y += 40) {
    let sum = 0;
    for (let x = 0; x < jpg.width; x++) {
        const idx = (y * jpg.width + x) * 4;
        sum += (jpg.data[idx] + jpg.data[idx+1] + jpg.data[idx+2]) / 3;
    }
    console.log(`y=${y}: avg=${(sum / jpg.width).toFixed(1)}`);
}
