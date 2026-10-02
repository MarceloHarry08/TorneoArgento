const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

console.log('ASCII Map between x=550 and 720 (y from 600 to 730):');
for (let y = 600; y < 730; y += 15) {
  let line = ('' + y).padStart(4, ' ') + ': ';
  for (let x = 550; x <= 720; x += 5) {
    const i = (y * w + x) * 4;
    line += isBg(png.data[i], png.data[i+1], png.data[i+2]) ? '.' : '#';
  }
  console.log(line);
}
