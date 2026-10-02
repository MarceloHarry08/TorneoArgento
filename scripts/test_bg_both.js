const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// 1. Process High Kick:
const kick = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
const kw = kick.width, kh = kick.height;

// Background detector for High Kick
function isBgKick(r, g, b) {
  // Bg is around 32..38, 32..38, 40..46
  return (r >= 28 && r <= 42 && g >= 28 && g <= 42 && b >= 36 && b <= 50);
}

// 2. Process Low Sweep:
const sweep = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
const sw = sweep.width, sh = sweep.height;

function isBgSweep(r, g, b) {
  return (r >= 25 && r <= 38 && g >= 24 && g <= 36 && b >= 35 && b <= 48);
}

console.log('Testing isBg on corner (0,0):');
console.log('High Kick (0,0):', isBgKick(kick.data[0], kick.data[1], kick.data[2]));
console.log('Low Sweep (0,0):', isBgSweep(sweep.data[0], sweep.data[1], sweep.data[2]));

// Check suit colors in High Kick (Frame 4 suit at x=1250, y=600)
for (let y = 580; y <= 620; y += 10) {
  const i = (y * kw + 1250) * 4;
  console.log('Kick suit (' + 1250 + ',' + y + '): ' + kick.data[i] + ',' + kick.data[i+1] + ',' + kick.data[i+2] + ' isBg=' + isBgKick(kick.data[i], kick.data[i+1], kick.data[i+2]));
}

// Check suit colors in Low Sweep (Frame 4 suit at x=1250, y=500)
for (let y = 480; y <= 520; y += 10) {
  const i = (y * sw + 1250) * 4;
  console.log('Sweep suit (' + 1250 + ',' + y + '): ' + sweep.data[i] + ',' + sweep.data[i+1] + ',' + sweep.data[i+2] + ' isBg=' + isBgSweep(sweep.data[i], sweep.data[i+1], sweep.data[i+2]));
}
