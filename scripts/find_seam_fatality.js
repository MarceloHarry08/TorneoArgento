const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const png = PNG.sync.read(data);

// Inspect x from 918 to 1375 in row 3 (y: 510 to 767)
const colCounts = new Array(png.width).fill(0);
for (let x = 918; x < 1375; x++) {
  for (let y = 510; y < 767; y++) {
    const idx = (y * png.width + x) * 4;
    if (png.data[idx + 3] > 20) {
      colCounts[x]++;
    }
  }
}

// Print histogram of non-transparent counts between 1100 and 1200 to find the seam
for (let x = 1100; x <= 1200; x += 5) {
  console.log('x=' + x + ': ' + colCounts[x]);
}
