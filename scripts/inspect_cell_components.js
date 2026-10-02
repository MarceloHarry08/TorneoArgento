const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const strip = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_strip.png'));
const CELL = 96;

for (let f = 0; f < 4; f++) {
  // Find components in cell f
  const comp = new Int32Array(CELL * CELL).fill(-1);
  let cCount = 0;
  const list = [];

  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const sIdx = (y * strip.width + (f * CELL + x)) * 4;
      const idx = y * CELL + x;
      if (strip.data[sIdx + 3] > 0 && comp[idx] === -1) {
        const cId = cCount++;
        let size = 0;
        let minX = x, maxX = x, minY = y, maxY = y;
        const q = [[x, y]];
        comp[idx] = cId;

        while (q.length > 0) {
          const [cx, cy] = q.pop();
          size++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

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
        list.push({ id: cId, size, minX, maxX, minY, maxY });
      }
    }
  }
  list.sort((a, b) => b.size - a.size);
  console.log('Frame ' + (f + 1) + ' components:', list);
}
