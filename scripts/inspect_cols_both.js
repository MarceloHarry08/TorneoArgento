const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// High Kick
const kick = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
const kw = kick.width, kh = kick.height;
const bgK = [kick.data[0], kick.data[1], kick.data[2]];

// Find columns of characters in high kick
const kickCol = new Int32Array(kw);
for (let x = 0; x < kw; x++) {
  for (let y = 0; y <= 704; y++) {
    const i = (y * kw + x) * 4;
    const dr = Math.abs(kick.data[i] - bgK[0]);
    const dg = Math.abs(kick.data[i+1] - bgK[1]);
    const db = Math.abs(kick.data[i+2] - bgK[2]);
    if (dr + dg + db > 25) kickCol[x]++;
  }
}

// Low Sweep
const sweep = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
const sw = sweep.width, sh = sweep.height;
const bgS = [sweep.data[0], sweep.data[1], sweep.data[2]];

const sweepCol = new Int32Array(sw);
for (let x = 0; x < sw; x++) {
  for (let y = 0; y <= 555; y++) {
    const i = (y * sw + x) * 4;
    const dr = Math.abs(sweep.data[i] - bgS[0]);
    const dg = Math.abs(sweep.data[i+1] - bgS[1]);
    const db = Math.abs(sweep.data[i+2] - bgS[2]);
    if (dr + dg + db > 25) sweepCol[x]++;
  }
}

console.log('=== High Kick Columns (sample every 20px) ===');
for (let x = 0; x < kw; x += 30) {
  console.log('x=' + x + ': count=' + kickCol[x]);
}

console.log('=== Low Sweep Columns (sample every 20px) ===');
for (let x = 0; x < sw; x += 30) {
  console.log('x=' + x + ': count=' + sweepCol[x]);
}
