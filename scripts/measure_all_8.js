const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// 1. High Kick
const kick = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_kick_nobg.png'));
const kw = kick.width, kh = kick.height;

// Mask out ground line at y >= 705
for (let y = 705; y < kh; y++) {
  for (let x = 0; x < kw; x++) {
    kick.data[(y * kw + x) * 4 + 3] = 0;
  }
}

// 2. Low Sweep
const sweep = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_sweep_nobg.png'));
const sw = sweep.width, sh = sweep.height;

// Mask out floor line at y >= 556
for (let y = 556; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    sweep.data[(y * sw + x) * 4 + 3] = 0;
  }
}

// Test separation for High Kick:
// Frame 1: x in [10..340]
// Frame 2: x in [340..760]
// Frame 3: x in [760..1060]
// Frame 4: x in [1060..1365]

const kickRanges = [
  ['Kick F1', 10, 340],
  ['Kick F2', 340, 760],
  ['Kick F3', 760, 1060],
  ['Kick F4', 1060, 1365]
];

console.log('=== High Kick Frames ===');
kickRanges.forEach(([name, x0, x1]) => {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, count = 0;
  for (let y = 0; y < 705; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * kw + x) * 4;
      if (kick.data[idx + 3] > 0) {
        count++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  console.log(name + ': count=' + count + ' x=[' + minX + '..' + maxX + '] w=' + (maxX - minX + 1) + ' y=[' + minY + '..' + maxY + '] h=' + (maxY - minY + 1));
});

// Test separation for Low Sweep:
// Frame 1: x in [10..300]
// Frame 2: x in [300..750]
// Frame 3: x in [750..1060]
// Frame 4: x in [1060..1365]

const sweepRanges = [
  ['Sweep F5', 10, 300],
  ['Sweep F6', 300, 750],
  ['Sweep F7', 750, 1060],
  ['Sweep F8', 1060, 1365]
];

console.log('=== Low Sweep Frames ===');
sweepRanges.forEach(([name, x0, x1]) => {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, count = 0;
  for (let y = 0; y < 556; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * sw + x) * 4;
      if (sweep.data[idx + 3] > 0) {
        count++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  console.log(name + ': count=' + count + ' x=[' + minX + '..' + maxX + '] w=' + (maxX - minX + 1) + ' y=[' + minY + '..' + maxY + '] h=' + (maxY - minY + 1));
});
