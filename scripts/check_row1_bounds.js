const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const png = PNG.sync.read(data);

// Clear the artificial black horizontal line at y = 253..255
for (let y = 253; y <= 256; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (y * png.width + x) * 4;
    // Check if it's black/dark line
    if (png.data[idx] < 50 && png.data[idx+1] < 50 && png.data[idx+2] < 50) {
      png.data[idx+3] = 0;
    }
  }
}

// Check row 1 characters' bounds:
const row1Cols = [
  { name: 'Win 1', minX: 30, maxX: 210 },
  { name: 'Win 2', minX: 230, maxX: 440 },
  { name: 'Win 3', minX: 470, maxX: 670 },
  { name: 'Win 4', minX: 700, maxX: 920 }
];

for (const c of row1Cols) {
  let minY = 999, maxY = 0;
  for (let y = 20; y <= 252; y++) {
    for (let x = c.minX; x <= c.maxX; x++) {
      const idx = (y * png.width + x) * 4;
      if (png.data[idx + 3] > 20) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(c.name, 'minY:', minY, 'maxY:', maxY, 'height:', maxY - minY + 1);
}
