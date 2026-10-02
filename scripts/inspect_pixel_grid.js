const fs = require("fs");
const { PNG } = require("pngjs");

const p = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_segmented.png";
const png = PNG.sync.read(fs.readFileSync(p));

console.log("Segmented size:", png.width, "x", png.height);

// Check if pixels are clustered in 1x1, 1.5x, 2x2, etc.
// Let's inspect a horizontal slice across the face (around y = 30 to 45)
for (let y = 30; y <= 45; y += 3) {
  let row = "";
  for (let x = 10; x < 65; x++) {
    const idx = (png.width * y + x) << 2;
    if (png.data[idx+3] < 10) row += " ";
    else {
      const r = png.data[idx];
      const g = png.data[idx+1];
      const b = png.data[idx+2];
      if (r > 180 && g > 130 && b > 90) row += "O"; // skin
      else if (r > 80 && g < 40 && b < 40) row += "#"; // hair / dark
      else if (r < 50 && g < 50 && b < 50) row += "."; // outline
      else row += "*";
    }
  }
  console.log(`y=${y}:`, row);
}

// Let's also check the feet area (bottom of sprite)
console.log("Checking feet (y = 100 to 121):");
for (let y = 100; y < 122; y += 2) {
  let row = "";
  for (let x = 15; x < 65; x++) {
    const idx = (png.width * y + x) << 2;
    if (png.data[idx+3] < 10) row += " ";
    else {
      const r = png.data[idx];
      const g = png.data[idx+1];
      const b = png.data[idx+2];
      row += (r < 40 && g < 40 && b < 40) ? "." : "+";
    }
  }
  console.log(`y=${y}:`, row);
}
