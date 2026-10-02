const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const sweep = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
const w = sweep.width, h = sweep.height;

// Inspect Y from 500 to 600 in sweep
for (let y = 520; y <= 600; y += 5) {
  let counts = [];
  for (let x = 0; x < w; x += 100) {
    const i = (y * w + x) * 4;
    counts.push(sweep.data[i] + ',' + sweep.data[i+1] + ',' + sweep.data[i+2]);
  }
  console.log('y=' + y + ': ' + counts.slice(0, 5).join(' | '));
}

// Find horizontal black line in sweep (it separates the characters from the checkered floor below)
for (let y = 540; y <= 580; y++) {
  let darkLinePx = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = sweep.data[i], g = sweep.data[i+1], b = sweep.data[i+2];
    if (r <= 25 && g <= 25 && b <= 30) darkLinePx++;
  }
  console.log('sweep y=' + y + ': dark line pixels=' + darkLinePx);
}
