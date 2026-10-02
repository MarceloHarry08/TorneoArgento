const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

console.log('Pixels around x=798..810 for y=358..364:');
for (let y = 358; y <= 364; y++) {
  let line = 'y=' + y + ': ';
  for (let x = 798; x <= 810; x++) {
    const idx = (y * w + x) * 4;
    line += '(' + x + ': ' + png.data[idx] + ',' + png.data[idx+1] + ',' + png.data[idx+2] + ') ';
  }
  console.log(line);
}
