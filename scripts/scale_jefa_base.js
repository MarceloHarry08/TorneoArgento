const fs = require("fs");
const { PNG } = require("pngjs");

const p = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_segmented.png";
const src = PNG.sync.read(fs.readFileSync(p));

// Let us crop the character from jefa_segmented
const charMinX = 8, charMaxX = 69, charMinY = 0, charMaxY = 121;
const charW = charMaxX - charMinX + 1; // 62
const charH = charMaxY - charMinY + 1; // 122

// Target height: 86px (from y=4 to y=89 in 96x96)
const targetH = 86;
const targetW = Math.round(charW * (targetH / charH)); // ~44 px

console.log("Target character size in 96x96:", targetW, "x", targetH);

const cell96 = new PNG({ width: 96, height: 96 });
cell96.data.fill(0);

const targetGroundY = 89;
const targetStartY = targetGroundY - targetH + 1; // 4
const targetStartX = Math.round((96 - targetW) / 2); // ~26

for (let dy = 0; dy < targetH; dy++) {
  const sy = Math.floor(dy * (charH / targetH));
  for (let dx = 0; dx < targetW; dx++) {
    const sx = Math.floor(dx * (charW / targetW));
    const sIdx = ((charMinY + sy) * src.width + (charMinX + sx)) << 2;
    const a = src.data[sIdx + 3];
    if (a < 50) continue;
    const dIdx = (((targetStartY + dy) * 96) + (targetStartX + dx)) << 2;
    cell96.data[dIdx] = src.data[sIdx];
    cell96.data[dIdx + 1] = src.data[sIdx + 1];
    cell96.data[dIdx + 2] = src.data[sIdx + 2];
    cell96.data[dIdx + 3] = 255;
  }
}

fs.writeFileSync("c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_96x96.png", PNG.sync.write(cell96));
console.log("Saved jefa_base_96x96.png at targetStartX:", targetStartX, "targetStartY:", targetStartY);
