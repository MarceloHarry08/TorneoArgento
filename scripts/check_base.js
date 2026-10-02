const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const basePath = 'C:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/individuales/el_leon_base.png';
if (fs.existsSync(basePath)) {
  const png = PNG.sync.read(fs.readFileSync(basePath));
  console.log('el_leon_base.png:', png.width, 'x', png.height);
  let minY = 9999, maxY = -1, minX = 9999, maxX = -1;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (y * png.width + x) * 4;
      if (png.data[idx + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log('Base sprite content: x=[' + minX + '..' + maxX + '] w=' + (maxX - minX + 1) + ', y=[' + minY + '..' + maxY + '] h=' + (maxY - minY + 1));
} else {
  console.log('basePath does not exist:', basePath);
}
