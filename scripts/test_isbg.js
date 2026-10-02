const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

// Find bounding box of all 4 characters by finding non-background pixels
function isBg(r, g, b) {
  // Background has R in 15..22, G in 13..20, B in 23..30, and B > R + 4, B > G + 4
  // Floor has R in 16..20, G in 14..18, B in 24..28
  return (r >= 14 && r <= 24 && g >= 12 && g <= 22 && b >= 21 && b <= 33 && (b - r >= 4) && (b - g >= 4));
}

// Let's test isBg on (0, 0)
const bgR = png.data[0], bgG = png.data[1], bgB = png.data[2];
console.log('Is (0,0) bg?', isBg(bgR, bgG, bgB), '(', bgR, bgG, bgB, ')');

// Check floor at y=745
let floorBg = 0, floorNonBg = 0;
for (let x = 0; x < w; x++) {
  const i = (745 * w + x) * 4;
  if (isBg(png.data[i], png.data[i+1], png.data[i+2])) floorBg++;
  else floorNonBg++;
}
console.log('Floor row y=745: bg=' + floorBg + ', nonBg=' + floorNonBg);

// Check ground baseline under feet
// Scan y from 710 to 740 to find where feet end for each character
for (let y = 720; y <= 740; y++) {
  let count = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!isBg(png.data[i], png.data[i+1], png.data[i+2])) count++;
  }
  console.log('y=' + y + ': character pixels=' + count);
}
