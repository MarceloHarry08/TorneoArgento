const fs = require("fs");
const { PNG } = require("pngjs");

const pSheet = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/latina_spritesheet.png";
const png = PNG.sync.read(fs.readFileSync(pSheet));

console.log("latina_spritesheet size:", png.width, "x", png.height);

// In game_data.gd, STANDARD_FRAMES has:
// idle: [Rect2(15, 90, 120, 175), ...]
// Let's inspect Rect2(15, 90, 120, 175) in latina_spritesheet:
let minX = 120, maxX = 0, minY = 175, maxY = 0;
for (let y = 0; y < 175; y++) {
  for (let x = 0; x < 120; x++) {
    const idx = ((png.width * (90 + y) + (15 + x)) << 2) + 3;
    if (png.data[idx] > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log("Existing idle frame 0 bounding box:", { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
