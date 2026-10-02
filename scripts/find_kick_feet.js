const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
const w = raw.width;

function isBg(r, g, b) {
  return (r >= 28 && r <= 42 && g >= 28 && g <= 42 && b >= 36 && b <= 50);
}

// Find feet at y=700..701
console.log('Character feet at y=700..701:');
for (let y = 700; y <= 701; y++) {
  let inFoot = false;
  let startX = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = raw.data[i], g = raw.data[i+1], b = raw.data[i+2];
    const isChar = !isBg(r, g, b);
    if (isChar && !inFoot) {
      inFoot = true;
      startX = x;
    } else if (!isChar && inFoot) {
      inFoot = false;
      console.log('y=' + y + ': foot from x=' + startX + ' to ' + (x - 1) + ' (center=' + ((startX + x - 1) / 2).toFixed(1) + ')');
    }
  }
  if (inFoot) {
    console.log('y=' + y + ': foot from x=' + startX + ' to ' + (w - 1));
  }
}
