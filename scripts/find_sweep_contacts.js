const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
const w = raw.width;

function isBg(r, g, b) {
  return (r >= 23 && r <= 40 && g >= 22 && g <= 38 && b >= 33 && b <= 50);
}

console.log('Low Sweep contacts at y=552..554:');
for (let y = 552; y <= 554; y++) {
  let inCont = false;
  let startX = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = raw.data[i], g = raw.data[i+1], b = raw.data[i+2];
    const isChar = !isBg(r, g, b);
    if (isChar && !inCont) {
      inCont = true;
      startX = x;
    } else if (!isChar && inCont) {
      inCont = false;
      if (x - startX > 10) {
        console.log('y=' + y + ': contact from x=' + startX + ' to ' + (x - 1) + ' (center=' + ((startX + x - 1) / 2).toFixed(1) + ')');
      }
    }
  }
  if (inCont && w - startX > 10) {
    console.log('y=' + y + ': contact from x=' + startX + ' to ' + (w - 1));
  }
}
