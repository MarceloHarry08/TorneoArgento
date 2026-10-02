const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

// Connected components on alpha > 0
const comp = new Int32Array(w * h).fill(-1);
let compCount = 0;
const compList = [];

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    if (png.data[idx * 4 + 3] > 0 && comp[idx] === -1) {
      const cId = compCount++;
      let size = 0;
      let minX = x, maxX = x, minY = y, maxY = y;
      const q = [idx];
      comp[idx] = cId;

      let head = 0;
      while (head < q.length) {
        const curr = q[head++];
        size++;
        const cx = curr % w;
        const cy = Math.floor(curr / w);

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = ny * w + nx;
            if (comp[nIdx] === -1 && png.data[nIdx * 4 + 3] > 0) {
              comp[nIdx] = cId;
              q.push(nIdx);
            }
          }
        }
      }

      if (size > 100) {
        compList.push({ id: cId, size, minX, maxX, minY, maxY });
      }
    }
  }
}

console.log('Connected components with size > 100:');
compList.sort((a, b) => b.size - a.size);
console.log(compList);
