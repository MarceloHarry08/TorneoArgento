const fs = require("fs");
const { PNG } = require("pngjs");

const pBase = "C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99/.user_uploaded/media_1790732899037.png";
const pSheet = "c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/latina_spritesheet.png";

const basePng = PNG.sync.read(fs.readFileSync(pBase));
console.log("Uploaded base:", basePng.width, "x", basePng.height);

if (fs.existsSync(pSheet)) {
  const sheetPng = PNG.sync.read(fs.readFileSync(pSheet));
  console.log("Existing latina_spritesheet:", sheetPng.width, "x", sheetPng.height);
} else {
  console.log("No existing sheet found at:", pSheet);
}
