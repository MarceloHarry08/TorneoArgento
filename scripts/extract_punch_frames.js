const fs = require('fs');
const { PNG } = require('pngjs');

const buf = fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_high_punch_isolated.png');
const png = PNG.sync.read(buf);

for (let i = 0; i < 4; i++) {
  const frame = new PNG({ width: 96, height: 96 });
  for (let y = 0; y < 96; y++) {
    for (let x = 0; x < 96; x++) {
      const srcIdx = (y * 384 + (i * 96 + x)) * 4;
      const dstIdx = (y * 96 + x) * 4;
      frame.data[dstIdx] = png.data[srcIdx];
      frame.data[dstIdx + 1] = png.data[srcIdx + 1];
      frame.data[dstIdx + 2] = png.data[srcIdx + 2];
      frame.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  fs.writeFileSync(`C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/punch_frame_${i + 1}.png`, PNG.sync.write(frame));
}
console.log('Saved punch frames 1 to 4');
