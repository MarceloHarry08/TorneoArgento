const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

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

// Check foot X bounds at y=720..729 for each character
for (let c = 1; c <= 4; c++) {
  let minFootX = 9999, maxFootX = -1;
  for (let y = 720; y <= 729; y++) {
    for (let x = 0; x < w; x++) {
      if (getCharId(x, y) === c) {
        const idx = (y * w + x) * 4;
        if (png.data[idx + 3] > 0) {
          minFootX = Math.min(minFootX, x);
          maxFootX = Math.max(maxFootX, x);
        }
      }
    }
  }
  const footCenter = (minFootX + maxFootX) / 2;
  console.log('Char ' + c + ': feet x=[' + minFootX + '..' + maxFootX + '] center=' + footCenter.toFixed(1));
}
