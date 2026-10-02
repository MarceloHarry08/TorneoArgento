const fs = require("fs");
const { PNG } = require("pngjs");

const pBase = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790732899037.png";
const basePng = PNG.sync.read(fs.readFileSync(pBase));

const w = basePng.width;
const h = basePng.height;

// Let us analyze the column and row color distributions to find the character
const outPng = new PNG({ width: w, height: h });
// Copy over
for (let i = 0; i < basePng.data.length; i++) outPng.data[i] = basePng.data[i];

// Flood fill from (0,0), (w-1,0), (0, h-1), (w-1, h-1)
// Check what pixel color is character vs background
const isVisited = new Uint8Array(w * h);
const queue = [];

function isSimilarToBg(x, y) {
  const idx = (w * y + x) << 2;
  const r = basePng.data[idx];
  const g = basePng.data[idx+1];
  const b = basePng.data[idx+2];
  // Background in the dark checkered area has r < 48, g < 45, b < 60, and r,g,b are close together
  // Character has:
  // - hair: brown (r > 60, g > 30, b > 15)
  // - skin: peach (r > 150, g > 100, b > 70)
  // - suit: white/light blue (r > 180, g > 190, b > 210) or blue accents
  // - scarf: red (r > 120, g < 40, b < 40)
  // - boots: navy blue (r: 30-50, g: 40-70, b: 80-130)
  // - black outline: r < 20, g < 20, b < 20
  if (r < 45 && g < 42 && b < 58 && Math.abs(r - g) < 12 && (b - r) > 2 && (b - r) < 22) {
    return true;
  }
  return false;
}

for (let x = 0; x < w; x++) {
  if (isSimilarToBg(x, 0)) queue.push([x, 0]);
  if (isSimilarToBg(x, h - 1)) queue.push([x, h - 1]);
}
for (let y = 0; y < h; y++) {
  if (isSimilarToBg(0, y)) queue.push([0, y]);
  if (isSimilarToBg(w - 1, y)) queue.push([w - 1, y]);
}

while (queue.length > 0) {
  const [x, y] = queue.pop();
  const pos = y * w + x;
  if (isVisited[pos]) continue;
  isVisited[pos] = 1;

  const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
      const npos = ny * w + nx;
      if (!isVisited[npos] && isSimilarToBg(nx, ny)) {
        queue.push([nx, ny]);
      }
    }
  }
}

let charMinX = w, charMaxX = 0, charMinY = h, charMaxY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const pos = y * w + x;
    const idx = (w * y + x) << 2;
    if (isVisited[pos]) {
      outPng.data[idx + 3] = 0; // transparent
    } else {
      if (x < charMinX) charMinX = x;
      if (x > charMaxX) charMaxX = x;
      if (y < charMinY) charMinY = y;
      if (y > charMaxY) charMaxY = y;
    }
  }
}

console.log("Segmented Character bounds:", { charMinX, charMaxX, charMinY, charMaxY, w: charMaxX - charMinX + 1, h: charMaxY - charMinY + 1 });
fs.writeFileSync("c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_segmented.png", PNG.sync.write(outPng));
console.log("Saved segmented test image");
