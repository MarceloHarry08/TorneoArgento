const fs = require('fs');
const { PNG } = require('pngjs');

function inspectPng(p) {
  if (!fs.existsSync(p)) {
    console.log('File does not exist:', p);
    return;
  }
  const buf = fs.readFileSync(p);
  const png = PNG.sync.read(buf);
  console.log('=== FILE:', p, '===');
  console.log('Width:', png.width, 'Height:', png.height);
  const CELL = 96;
  const numCells = Math.floor(png.width / CELL);
  for (let c = 0; c < numCells; c++) {
    let minX = 999, maxX = -1, minY = 999, maxY = -1, count = 0;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < CELL; x++) {
        const px = c * CELL + x;
        const idx = (y * png.width + px) * 4;
        if (png.data[idx + 3] > 10) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log('Cell ' + (c + 1) + ': pixels=' + count + ', x=[' + minX + '..' + maxX + '], y=[' + minY + '..' + maxY + ']');
  }
}

inspectPng('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_high_punch_isolated.png');
inspectPng('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_high_punch_96x96.png');
