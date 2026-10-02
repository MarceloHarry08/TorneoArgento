const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
// Check top row and bottom row
for (let x = 0; x < w; x++) {
  const iTop = x * 4;
  const iBot = ((h - 1) * w + x) * 4;
  for (const i of [iTop, iBot]) {
    minR = Math.min(minR, png.data[i]);
    maxR = Math.max(maxR, png.data[i]);
    minG = Math.min(minG, png.data[i+1]);
    maxG = Math.max(maxG, png.data[i+1]);
    minB = Math.min(minB, png.data[i+2]);
    maxB = Math.max(maxB, png.data[i+2]);
  }
}
console.log('Border RGB range: R=[' + minR + '..' + maxR + '] G=[' + minG + '..' + maxG + '] B=[' + minB + '..' + maxB + ']');
