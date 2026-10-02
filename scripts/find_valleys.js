const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

const colCounts = new Int32Array(w);
for (let x = 0; x < w; x++) {
  let count = 0;
  for (let y = 0; y < 730; y++) {
    const i = (y * w + x) * 4;
    if (!isBg(png.data[i], png.data[i+1], png.data[i+2])) {
      count++;
    }
  }
  colCounts[x] = count;
}

// Find valleys in ranges:
function findMinInRange(start, end) {
  let minVal = 9999, minX = -1;
  for (let x = start; x <= end; x++) {
    if (colCounts[x] < minVal) {
      minVal = colCounts[x];
      minX = x;
    }
  }
  console.log('Range [' + start + '..' + end + ']: min count=' + minVal + ' at x=' + minX);
}

findMinInRange(320, 420);
findMinInRange(730, 840);
findMinInRange(1040, 1140);

// Print details around minX
for (let x = 760; x <= 810; x += 5) {
  console.log('x=' + x + ': count=' + colCounts[x]);
}
