const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const png = PNG.sync.read(data);

console.log('PNG size:', png.width, 'x', png.height);

// Find horizontal projection of non-transparent pixels
const rowCounts = new Array(png.height).fill(0);
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 20) {
      rowCounts[y]++;
    }
  }
}

// Find contiguous row regions
let inRow = false;
let startY = 0;
const rows = [];
for (let y = 0; y < png.height; y++) {
  if (rowCounts[y] > 50 && !inRow) {
    inRow = true;
    startY = y;
  } else if (rowCounts[y] <= 50 && inRow) {
    inRow = false;
    rows.push({ startY, endY: y - 1, height: y - startY });
  }
}
if (inRow) {
  rows.push({ startY, endY: png.height - 1, height: png.height - startY });
}

console.log('Detected rows:', rows);
