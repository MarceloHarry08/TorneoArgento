const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

// For each column x, count non-bg pixels between y=0 and 729
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

// Find gaps (where colCount == 0)
let inChar = false;
let startX = 0;
for (let x = 0; x < w; x++) {
  if (colCounts[x] > 0 && !inChar) {
    inChar = true;
    startX = x;
  } else if (colCounts[x] === 0 && inChar) {
    inChar = false;
    console.log('Character found: x=[' + startX + '..' + (x - 1) + '] width=' + (x - startX));
  }
}
if (inChar) {
  console.log('Character found: x=[' + startX + '..' + (w - 1) + '] width=' + (w - startX));
}
