const fs = require("fs");
const { PNG } = require("pngjs");

const p = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790732899037.png";
const data = fs.readFileSync(p);
const png = PNG.sync.read(data);
console.log("Width:", png.width, "Height:", png.height);

// Check bounding box and colors
let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
const colorCounts = {};

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) << 2;
    const a = png.data[idx + 3];
    if (a > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const key = `${png.data[idx]},${png.data[idx+1]},${png.data[idx+2]}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
  }
}

console.log("Bounding box:", { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });
const sortedColors = Object.entries(colorCounts).sort((a,b) => b[1] - a[1]).slice(0, 15);
console.log("Top colors (r,g,b):", sortedColors);
