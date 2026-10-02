const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

console.log('Boundary 1-2 (x=330..410):');
for (let y = 150; y < 730; y += 40) {
  let line = ('' + y).padStart(4, ' ') + ': ';
  for (let x = 330; x <= 410; x += 3) {
    const i = (y * w + x) * 4;
    line += isBg(png.data[i], png.data[i+1], png.data[i+2]) ? '.' : '#';
  }
  console.log(line);
}

console.log('Boundary 3-4 (x=1040..1120):');
for (let y = 150; y < 730; y += 40) {
  let line = ('' + y).padStart(4, ' ') + ': ';
  for (let x = 1040; x <= 1120; x += 3) {
    const i = (y * w + x) * 4;
    line += isBg(png.data[i], png.data[i+1], png.data[i+2]) ? '.' : '#';
  }
  console.log(line);
}
