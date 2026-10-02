const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
const w = raw.width;

function isBg(r, g, b) {
  return (r >= 23 && r <= 40 && g >= 22 && g <= 38 && b >= 33 && b <= 50);
}

// Sample between legs in Low Sweep characters:
// Char 5: around x=130..155, y=490..545
// Char 8: around x=1190..1220, y=490..545
console.log('Sweep Char 5 between legs:');
for (let y = 500; y <= 540; y += 10) {
  let line = 'y=' + y + ': ';
  for (let x = 125; x <= 165; x += 5) {
    const i = (y * w + x) * 4;
    line += isBg(raw.data[i], raw.data[i+1], raw.data[i+2]) ? 'B' : '.';
  }
  console.log(line);
}

console.log('Sweep Char 8 between legs:');
for (let y = 500; y <= 540; y += 10) {
  let line = 'y=' + y + ': ';
  for (let x = 1180; x <= 1220; x += 5) {
    const i = (y * w + x) * 4;
    line += isBg(raw.data[i], raw.data[i+1], raw.data[i+2]) ? 'B' : '.';
  }
  console.log(line);
}
