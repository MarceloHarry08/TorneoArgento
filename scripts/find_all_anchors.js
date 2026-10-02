const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// 1. High Kick
const kick = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_kick_nobg.png'));
const kw = kick.width;
for (let y = 705; y < kick.height; y++) {
  for (let x = 0; x < kw; x++) kick.data[(y * kw + x) * 4 + 3] = 0;
}

const kickRanges = [[10, 340], [340, 760], [760, 1060], [1060, 1365]];
console.log('=== High Kick Foot Anchors (y=690..704) ===');
kickRanges.forEach(([x0, x1], idx) => {
  let minX = 9999, maxX = -1;
  for (let y = 690; y <= 704; y++) {
    for (let x = x0; x <= x1; x++) {
      if (kick.data[(y * kw + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      }
    }
  }
  console.log('Kick F' + (idx+1) + ': foot x=[' + minX + '..' + maxX + '] center=' + ((minX + maxX)/2).toFixed(1));
});

// 2. Low Sweep
const sweep = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_sweep_nobg.png'));
const sw = sweep.width;
for (let y = 556; y < sweep.height; y++) {
  for (let x = 0; x < sw; x++) sweep.data[(y * sw + x) * 4 + 3] = 0;
}

const sweepRanges = [[10, 300], [300, 750], [750, 1060], [1060, 1365]];
console.log('=== Low Sweep Foot/Hand Anchors (y=540..555) ===');
sweepRanges.forEach(([x0, x1], idx) => {
  let minX = 9999, maxX = -1;
  for (let y = 540; y <= 555; y++) {
    for (let x = x0; x <= x1; x++) {
      if (sweep.data[(y * sw + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      }
    }
  }
  console.log('Sweep F' + (idx+5) + ': contact x=[' + minX + '..' + maxX + '] center=' + ((minX + maxX)/2).toFixed(1));
});
