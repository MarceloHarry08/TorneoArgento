const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
const w = raw.width;

console.log('Sampling raw high kick char 4 between legs (x=1190..1240, y=650..700):');
for (let y = 650; y <= 700; y += 10) {
  let line = 'y=' + y + ': ';
  for (let x = 1190; x <= 1240; x += 5) {
    const i = (y * w + x) * 4;
    line += '(' + raw.data[i] + ',' + raw.data[i+1] + ',' + raw.data[i+2] + ') ';
  }
  console.log(line);
}
