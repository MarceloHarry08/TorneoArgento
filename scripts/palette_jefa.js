const fs = require("fs");
const { PNG } = require("pngjs");

const p = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_96x96.png";
const png = PNG.sync.read(fs.readFileSync(p));

const colors = {};
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) << 2;
    if (png.data[idx+3] > 100) {
      const hex = ((1 << 24) + (png.data[idx] << 16) + (png.data[idx+1] << 8) + png.data[idx+2]).toString(16).slice(1);
      colors[hex] = (colors[hex] || 0) + 1;
    }
  }
}

const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]);
console.log("Top 30 colors in base sprite:");
sorted.slice(0, 30).forEach(([hex, count]) => {
  const r = parseInt(hex.slice(0,2), 16);
  const g = parseInt(hex.slice(2,4), 16);
  const b = parseInt(hex.slice(4,6), 16);
  console.log(`#${hex} (r:${r}, g:${g}, b:${b}): ${count} px`);
});
