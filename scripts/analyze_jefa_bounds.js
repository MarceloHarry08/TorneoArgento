const fs = require("fs");
const { PNG } = require("pngjs");

const pBase = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790732899037.png";
const basePng = PNG.sync.read(fs.readFileSync(pBase));

console.log("Analyzing image size:", basePng.width, "x", basePng.height);

// Check corners to find background colors
const corners = [
  [0, 0], [1, 0], [0, 1], [basePng.width - 1, 0], [0, basePng.height - 1], [basePng.width - 1, basePng.height - 1]
];
corners.forEach(([x, y]) => {
  const idx = (basePng.width * y + x) << 2;
  console.log(`Corner (${x},${y}): rgba(${basePng.data[idx]}, ${basePng.data[idx+1]}, ${basePng.data[idx+2]}, ${basePng.data[idx+3]})`);
});

// Let us find what pixels are NOT background
// Background appears to be dark purple/gray checkerboard (r: 25-40, g: 22-36, b: 35-50)
function isBg(r, g, b, a) {
  if (a < 10) return true;
  // Checkered pattern in IDE scratch: roughly r in [28..38], g in [24..34], b in [38..48]
  if (r >= 26 && r <= 40 && g >= 22 && g <= 36 && b >= 36 && b <= 52) return true;
  return false;
}

let minX = basePng.width, maxX = 0, minY = basePng.height, maxY = 0;
for (let y = 0; y < basePng.height; y++) {
  for (let x = 0; x < basePng.width; x++) {
    const idx = (basePng.width * y + x) << 2;
    const r = basePng.data[idx];
    const g = basePng.data[idx+1];
    const b = basePng.data[idx+2];
    const a = basePng.data[idx+3];
    if (!isBg(r, g, b, a)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log("Character sprite bounds inside 73x122 image:", { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
