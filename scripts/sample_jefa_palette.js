const fs = require("fs");
const { PNG } = require("pngjs");

const p = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_segmented.png";
const png = PNG.sync.read(fs.readFileSync(p));

// Sample regions:
// Head / Hair / Face: y from 0 to 45
// Scarf: y from 40 to 55
// Jacket / Suit: y from 52 to 85
// Pants: y from 80 to 105
// Boots: y from 105 to 121

function sampleRegion(minY, maxY, name) {
  const map = {};
  for (let y = minY; y <= maxY; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      if (png.data[idx+3] > 100) {
        const r = png.data[idx];
        const g = png.data[idx+1];
        const b = png.data[idx+2];
        const key = `${r},${g},${b}`;
        map[key] = (map[key] || 0) + 1;
      }
    }
  }
  const top = Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 8);
  console.log(`Region: ${name} (y: ${minY}..${maxY})`);
  top.forEach(([k, c]) => console.log(`  rgb(${k}): ${c} px`));
}

sampleRegion(5, 35, "Hair & Face");
sampleRegion(38, 52, "Neck & Red Scarf");
sampleRegion(53, 80, "White Jacket & Torso");
sampleRegion(81, 105, "White Pants");
sampleRegion(106, 121, "Dark Blue Boots");
