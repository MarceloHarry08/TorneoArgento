const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

// Check character 4 (around x=1200, y=500 is suit)
console.log('Sampling character 4 suit (x=1180..1220, y=480..520):');
for (let y = 480; y <= 520; y += 10) {
  for (let x = 1180; x <= 1220; x += 10) {
    const i = (y * w + x) * 4;
    console.log('(' + x + ',' + y + '): R=' + png.data[i] + ' G=' + png.data[i+1] + ' B=' + png.data[i+2]);
  }
}

// Check character 3 suit (around x=650..700, y=450..500)
console.log('Sampling character 2/3 suit:');
for (let y = 450; y <= 500; y += 15) {
  for (let x = 650; x <= 700; x += 15) {
    const i = (y * w + x) * 4;
    console.log('(' + x + ',' + y + '): R=' + png.data[i] + ' G=' + png.data[i+1] + ' B=' + png.data[i+2]);
  }
}
