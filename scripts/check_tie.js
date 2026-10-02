const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

// In character 4, tie is around x=1230..1270, y=550..660
console.log('Sampling tie in character 4:');
for (let y = 570; y <= 640; y += 10) {
  for (let x = 1240; x <= 1260; x += 5) {
    const i = (y * w + x) * 4;
    const r = png.data[i], g = png.data[i+1], b = png.data[i+2];
    console.log('(' + x + ',' + y + '): ' + r + ',' + g + ',' + b + ' isBg=' + isBg(r, g, b));
  }
}
