const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

// Mask each character
// Char 1: x < 362
// Char 2: 362 <= x, and (y < 420 ? x < 805 : x < 700)
// Char 3: (y < 420 ? x >= 805 : x >= 700) and x < 1081
// Char 4: x >= 1081

function getCharId(x, y) {
  if (x < 362) return 1;
  if (y < 420) {
    if (x < 805) return 2;
  } else {
    if (x < 700) return 2;
  }
  if (x < 1081) return 3;
  return 4;
}

// Check bounds and count for each character
for (let c = 1; c <= 4; c++) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (getCharId(x, y) === c) {
        const idx = (y * w + x) * 4;
        if (png.data[idx + 3] > 0) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  console.log('Char ' + c + ': count=' + count + ' x=[' + minX + '..' + maxX + '] w=' + (maxX - minX + 1) + ' y=[' + minY + '..' + maxY + '] h=' + (maxY - minY + 1));
}
