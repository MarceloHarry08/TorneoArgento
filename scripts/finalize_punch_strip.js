const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const strip = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_strip.png'));
const CELL = 96;
const cleanStrip = new PNG({ width: 384, height: 96 });
cleanStrip.data.fill(0);

for (let f = 0; f < 4; f++) {
  const comp = new Int32Array(CELL * CELL).fill(-1);
  let cCount = 0;
  const compMap = new Map();

  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = (y * strip.width + (f * CELL + x)) * 4;
      const idx = y * CELL + x;
      if (strip.data[sIdx + 3] > 0 && comp[idx] === -1) {
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
              const npIdx = (ny * strip.width + (f * CELL + nx)) * 4;
              if (comp[nIdx] === -1 && strip.data[npIdx + 3] > 0) {
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

  // Copy only pixels belonging to the main character component (size > 500)
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const idx = y * CELL + x;
      const cId = comp[idx];
      if (cId !== -1 && compMap.get(cId) > 500) {
        const sIdx = (y * strip.width + (f * CELL + x)) * 4;
        const dIdx = (y * cleanStrip.width + (f * CELL + x)) * 4;
        cleanStrip.data[dIdx] = strip.data[sIdx];
        cleanStrip.data[dIdx + 1] = strip.data[sIdx + 1];
        cleanStrip.data[dIdx + 2] = strip.data[sIdx + 2];
        cleanStrip.data[dIdx + 3] = strip.data[sIdx + 3];
      }
    }
  }
}

// 1. Save to juego-fight assets
const dstPath1 = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_high_punch_96x96.png';
fs.writeFileSync(dstPath1, PNG.sync.write(cleanStrip));
console.log('Saved to:', dstPath1);

// 2. Save to artifact directory
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
const dstPath2 = path.join(artifactDir, 'leon_spritestrip_high_punch_96x96.png');
fs.writeFileSync(dstPath2, PNG.sync.write(cleanStrip));
console.log('Saved to:', dstPath2);

// 3. Save to scratch torneo-argento 2 assets if exists
const dstPath3 = 'C:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_high_punch_96x96.png';
const dir3 = path.dirname(dstPath3);
if (!fs.existsSync(dir3)) fs.mkdirSync(dir3, { recursive: true });
fs.writeFileSync(dstPath3, PNG.sync.write(cleanStrip));
console.log('Saved to:', dstPath3);
