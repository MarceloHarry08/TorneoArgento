const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const raw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const rw = raw.width, rh = raw.height;

function getCharId(x, y) {
  if (x < 362) return 1;
  if (y < 420) {
    if (x < 805) return 2;
  } else {
    if (x < 700) return 2;
  }
  if (x < 1081) return 3;
  return 4;
}

const CELL = 96;
const FRAMES = 4;
const STRIP_W = FRAMES * CELL; // 384
const STRIP_H = CELL;          // 96
const GROUND_Y = 89;           // baseline

const STANDING_H = 539.0;
const SCALE = 86.0 / STANDING_H; // ~0.15955

// Foot centers in raw
const rawFootCenters = [200.5, 524.5, 891.5, 1238.0];
// Target cell centers for character anchor
// Char 1: startup lean (centered at 48)
// Char 2: punch extension (placed so back foot is at ~14, fist at ~85)
// Char 3: recovery (centered at 48)
// Char 4: neutral return (centered at 48)

const targetAnchors = [48, 48, 48, 48];

const strip = new PNG({ width: STRIP_W, height: STRIP_H });
strip.data.fill(0);

for (let f = 0; f < FRAMES; f++) {
  const cId = f + 1;
  const rawAnchorX = rawFootCenters[f];
  const targetAnchorX = targetAnchors[f];

  // Map each pixel in 96x96 cell
  for (let dy = 0; dy < CELL; dy++) {
    for (let dx = 0; dx < CELL; dx++) {
      // Corresponding raw coordinates
      // dy = GROUND_Y - (729 - rawY) * SCALE  =>  rawY = 729 - (GROUND_Y - dy) / SCALE
      // dx = targetAnchorX + (rawX - rawAnchorX) * SCALE  =>  rawX = rawAnchorX + (dx - targetAnchorX) / SCALE
      
      const rxStart = rawAnchorX + (dx - 0.5 - targetAnchorX) / SCALE;
      const rxEnd   = rawAnchorX + (dx + 0.5 - targetAnchorX) / SCALE;
      const ryStart = 729 - (GROUND_Y - (dy - 0.5)) / SCALE;
      const ryEnd   = 729 - (GROUND_Y - (dy + 0.5)) / SCALE;

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, totalW = 0;

      const sx0 = Math.max(0, Math.floor(rxStart));
      const sx1 = Math.min(rw - 1, Math.ceil(rxEnd));
      const sy0 = Math.max(0, Math.floor(ryStart));
      const sy1 = Math.min(rh - 1, Math.ceil(ryEnd));

      for (let sy = sy0; sy <= sy1; sy++) {
        for (let sx = sx0; sx <= sx1; sx++) {
          if (getCharId(sx, sy) !== cId) continue; // Only sample this character!

          const idx = (sy * rw + sx) * 4;
          const a = raw.data[idx + 3];
          if (a === 0) continue;

          // Weight by overlap
          const wx = Math.max(0, Math.min(sx + 1, rxEnd) - Math.max(sx, rxStart));
          const wy = Math.max(0, Math.min(sy + 1, ryEnd) - Math.max(sy, ryStart));
          const weight = wx * wy;

          rSum += raw.data[idx] * weight;
          gSum += raw.data[idx + 1] * weight;
          bSum += raw.data[idx + 2] * weight;
          aSum += a * weight;
          totalW += weight;
        }
      }

      if (totalW > 0 && (aSum / totalW) > 30) {
        const destX = f * CELL + dx;
        const destIdx = (dy * STRIP_W + destX) * 4;
        strip.data[destIdx] = Math.round(rSum / totalW);
        strip.data[destIdx + 1] = Math.round(gSum / totalW);
        strip.data[destIdx + 2] = Math.round(bSum / totalW);
        strip.data[destIdx + 3] = 255;
      }
    }
  }
}

fs.writeFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_strip.png', PNG.sync.write(strip));
console.log('Saved test_scaled_strip.png');
