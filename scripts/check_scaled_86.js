const fs = require("fs");
const { PNG } = require("pngjs");

const p = "C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png";
const png = PNG.sync.read(fs.readFileSync(p));
console.log("test_scaled_86 dimensions:", png.width, "x", png.height);

let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const a = png.data[((png.width * y + x) << 2) + 3];
    if (a > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log("Bounding box in 96x96:", { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
