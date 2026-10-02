const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const kick = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_kick_nobg.png'));
const kw = kick.width;

// Check at y=700..704 what pixels are active across the whole width
console.log('Active pixels at y=703 (foot soles):');
let line = '';
for (let x = 0; x < kw; x += 5) {
  line += kick.data[(703 * kw + x) * 4 + 3] > 0 ? '#' : '.';
}
console.log(line);
for (let x = 0; x < kw; x += 10) {
  if (kick.data[(703 * kw + x) * 4 + 3] > 0) {
    console.log('Foot sole at x=' + x);
  }
}
