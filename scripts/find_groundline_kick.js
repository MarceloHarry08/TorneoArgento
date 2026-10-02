const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
const w = raw.width;

console.log('Sampling column x=330 (between char 1 and 2) around y=680..710:');
for (let y = 680; y <= 710; y++) {
  const i = (y * w + 330) * 4;
  console.log('y=' + y + ': rgb(' + raw.data[i] + ',' + raw.data[i+1] + ',' + raw.data[i+2] + ')');
}
