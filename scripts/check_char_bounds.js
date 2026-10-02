const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

// Check where each character's non-transparent pixels end vertically (max Y)
// Character 1: x in [10..360]
// Character 2: x in [360..780]
// Character 3: x in [780..1080]
// Character 4: x in [1080..1365]

const ranges = [
  ['Char 1', 10, 360],
  ['Char 2', 360, 780],
  ['Char 3', 780, 1080],
  ['Char 4', 1080, 1365]
];

ranges.forEach(([name, xMin, xMax]) => {
  let minY = 9999, maxY = -1, minX = 9999, maxX = -1;
  for (let y = 0; y < h; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const idx = (y * w + x) * 4;
      if (png.data[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(name + ': x=[' + minX + '..' + maxX + '] w=' + (maxX - minX + 1) + ', y=[' + minY + '..' + maxY + '] h=' + (maxY - minY + 1));
});
