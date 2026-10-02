const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 13 && r <= 25 && g >= 11 && g <= 23 && b >= 20 && b <= 34 && (b - r >= 3) && (b - g >= 3));
}

// Sample between legs:
// Char 1: ox ~ 150..220, y ~ 650
// Char 2: ox ~ 450..550, y ~ 650
// Char 3: ox ~ 850..920, y ~ 650
// Char 4: ox ~ 1180..1250, y ~ 670
const points = [
  ['Char 1 legs', 180, 650],
  ['Char 2 legs', 500, 650],
  ['Char 3 legs', 890, 650],
  ['Char 4 legs', 1210, 670]
];

points.forEach(([name, x, y]) => {
  const i = (y * w + x) * 4;
  const r = png.data[i], g = png.data[i+1], b = png.data[i+2];
  console.log(name, '(' + x + ',' + y + '): ' + r + ',' + g + ',' + b + ' isBg=' + isBg(r, g, b));
});
