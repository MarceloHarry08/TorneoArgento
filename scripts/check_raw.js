const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
console.log('Raw width:', png.width, 'height:', png.height);

const samples = [[10, 10], [100, 10], [500, 10], [1000, 10], [1300, 10], [10, 750], [500, 750], [1300, 750]];
for (const [x, y] of samples) {
  const i = (y * png.width + x) * 4;
  console.log('(' + x + ', ' + y + '): rgba(' + png.data[i] + ', ' + png.data[i+1] + ', ' + png.data[i+2] + ', ' + png.data[i+3] + ')');
}
