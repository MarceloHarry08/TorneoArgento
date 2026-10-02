const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// 1. Load clean sources
const kickRaw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_kick_nobg.png'));
const sweepRaw = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_sweep_nobg.png'));

// Clear any floor lines
for (let y = 701; y < kickRaw.height; y++) {
  for (let x = 0; x < kickRaw.width; x++) kickRaw.data[(y * kickRaw.width + x) * 4 + 3] = 0;
}
for (let y = 555; y < sweepRaw.height; y++) {
  for (let x = 0; x < sweepRaw.width; x++) sweepRaw.data[(y * sweepRaw.width + x) * 4 + 3] = 0;
}

const CELL = 96;
const FRAMES = 8;
const STRIP_W = FRAMES * CELL; // 768 px
const STRIP_H = CELL;          // 96 px
const TARGET_GROUND_Y = 89;

const rawStrip = new PNG({ width: STRIP_W, height: STRIP_H });
rawStrip.data.fill(0);

// Parameters for each of the 8 frames:
// [source, charId, xMin, xMax, rawGroundY, rawAnchorX, targetAnchorX, scale]
const kickScale = 86.0 / 514.0; // ~0.1673
const sweepScale = 0.161;

const frameConfigs = [
  // High Kick (Frames 1..4)
  { src: kickRaw, xMin: 15, xMax: 330, rawGroundY: 700, rawAnchorX: 172.5, targetAnchorX: 48, scale: kickScale },
  { src: kickRaw, xMin: 345, xMax: 760, rawGroundY: 700, rawAnchorX: 535.0, targetAnchorX: 47, scale: kickScale },
  { src: kickRaw, xMin: 770, xMax: 1060, rawGroundY: 700, rawAnchorX: 890.0, targetAnchorX: 48, scale: kickScale },
  { src: kickRaw, xMin: 1080, xMax: 1365, rawGroundY: 700, rawAnchorX: 1223.5, targetAnchorX: 48, scale: kickScale },
  
  // Low Sweep (Frames 5..8)
  { src: sweepRaw, xMin: 20, xMax: 290, rawGroundY: 554, rawAnchorX: 160.0, targetAnchorX: 46, scale: sweepScale },
  { src: sweepRaw, xMin: 310, xMax: 740, rawGroundY: 554, rawAnchorX: 520.0, targetAnchorX: 48, scale: sweepScale },
  { src: sweepRaw, xMin: 755, xMax: 1060, rawGroundY: 554, rawAnchorX: 895.0, targetAnchorX: 48, scale: sweepScale },
  { src: sweepRaw, xMin: 1070, xMax: 1365, rawGroundY: 554, rawAnchorX: 1210.0, targetAnchorX: 48, scale: sweepScale }
];

for (let f = 0; f < FRAMES; f++) {
  const cfg = frameConfigs[f];
  const src = cfg.src;
  const sw = src.width, sh = src.height;

  for (let dy = 0; dy < CELL; dy++) {
    for (let dx = 0; dx < CELL; dx++) {
      const rxStart = cfg.rawAnchorX + (dx - 0.5 - cfg.targetAnchorX) / cfg.scale;
      const rxEnd   = cfg.rawAnchorX + (dx + 0.5 - cfg.targetAnchorX) / cfg.scale;
      const ryStart = cfg.rawGroundY - (TARGET_GROUND_Y - (dy - 0.5)) / cfg.scale;
      const ryEnd   = cfg.rawGroundY - (TARGET_GROUND_Y - (dy + 0.5)) / cfg.scale;

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, totalW = 0;

      const sx0 = Math.max(cfg.xMin, Math.floor(rxStart));
      const sx1 = Math.min(cfg.xMax, Math.ceil(rxEnd));
      const sy0 = Math.max(0, Math.floor(ryStart));
      const sy1 = Math.min(cfg.rawGroundY, Math.ceil(ryEnd));

      for (let sy = sy0; sy <= sy1; sy++) {
        for (let sx = sx0; sx <= sx1; sx++) {
          const idx = (sy * sw + sx) * 4;
          const a = src.data[idx + 3];
          if (a === 0) continue;

          const wx = Math.max(0, Math.min(sx + 1, rxEnd) - Math.max(sx, rxStart));
          const wy = Math.max(0, Math.min(sy + 1, ryEnd) - Math.max(sy, ryStart));
          const weight = wx * wy;

          rSum += src.data[idx] * weight;
          gSum += src.data[idx + 1] * weight;
          bSum += src.data[idx + 2] * weight;
          aSum += a * weight;
          totalW += weight;
        }
      }

      if (totalW > 0 && (aSum / totalW) > 30) {
        const destX = f * CELL + dx;
        const destIdx = (dy * STRIP_W + destX) * 4;
        rawStrip.data[destIdx] = Math.round(rSum / totalW);
        rawStrip.data[destIdx + 1] = Math.round(gSum / totalW);
        rawStrip.data[destIdx + 2] = Math.round(bSum / totalW);
        rawStrip.data[destIdx + 3] = 255;
      }
    }
  }
}

// 2. Connected Component Filter per cell
const finalStrip = new PNG({ width: STRIP_W, height: STRIP_H });
finalStrip.data.fill(0);

for (let f = 0; f < FRAMES; f++) {
  const comp = new Int32Array(CELL * CELL).fill(-1);
  let cCount = 0;
  const compMap = new Map();

  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = (y * STRIP_W + (f * CELL + x)) * 4;
      const idx = y * CELL + x;
      if (rawStrip.data[sIdx + 3] > 0 && comp[idx] === -1) {
        const cId = cCount++;
        let size = 0;
        const q = [[x, y]];
        comp[idx] = cId;

        while (q.length > 0) {
          const [cx, cy] = q.pop();
          size++;
          for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < CELL && ny >= 0 && ny < CELL) {
              const nIdx = ny * CELL + nx;
              const npIdx = (ny * STRIP_W + (f * CELL + nx)) * 4;
              if (comp[nIdx] === -1 && rawStrip.data[npIdx + 3] > 0) {
                comp[nIdx] = cId;
                q.push([nx, ny]);
              }
            }
          }
        }
        compMap.set(cId, size);
      }
    }
  }

  // Copy only components with size > 150 (keeps character body + limbs, drops stray specks)
  let cellMinX = 999, cellMaxX = -1, cellMinY = 999, cellMaxY = -1, cellCount = 0;
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const idx = y * CELL + x;
      const cId = comp[idx];
      if (cId !== -1 && compMap.get(cId) > 150) {
        cellCount++;
        cellMinX = Math.min(cellMinX, x); cellMaxX = Math.max(cellMaxX, x);
        cellMinY = Math.min(cellMinY, y); cellMaxY = Math.max(cellMaxY, y);
        const sIdx = (y * STRIP_W + (f * CELL + x)) * 4;
        const dIdx = (y * STRIP_W + (f * CELL + x)) * 4;
        finalStrip.data[dIdx] = rawStrip.data[sIdx];
        finalStrip.data[dIdx + 1] = rawStrip.data[sIdx + 1];
        finalStrip.data[dIdx + 2] = rawStrip.data[sIdx + 2];
        finalStrip.data[dIdx + 3] = rawStrip.data[sIdx + 3];
      }
    }
  }
  console.log(`Frame ${f + 1}: count=${cellCount}, x=[${cellMinX}..${cellMaxX}] w=${cellMaxX - cellMinX + 1}, y=[${cellMinY}..${cellMaxY}] h=${cellMaxY - cellMinY + 1}`);
}

// 3. Save to output paths
const outPaths = [
  'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_kicks_96x96.png',
  'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf/leon_spritestrip_kicks_96x96.png',
  'C:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_kicks_96x96.png'
];

outPaths.forEach(p => {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(p, PNG.sync.write(finalStrip));
  console.log('Saved:', p);
});
