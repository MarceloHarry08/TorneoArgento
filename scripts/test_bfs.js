const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  // Check if pixel is the dark purplish background
  return (r >= 13 && r <= 25 && g >= 11 && g <= 23 && b >= 20 && b <= 34 && (b - r >= 3) && (b - g >= 3));
}

// 2D mask of background visited by BFS from (0, 0)
const visited = new Uint8Array(w * h);
const q = [0]; // index = y * w + x -> 0 is (0,0)
visited[0] = 1;

let head = 0;
while (head < q.length) {
  const curr = q[head++];
  const cx = curr % w;
  const cy = Math.floor(curr / w);

  const neighbors = [
    [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < 730) { // stay above ground line
      const nIdx = ny * w + nx;
      if (!visited[nIdx]) {
        const p = nIdx * 4;
        const r = png.data[p], g = png.data[p+1], b = png.data[p+2];
        if (isBg(r, g, b)) {
          visited[nIdx] = 1;
          q.push(nIdx);
        }
      }
    }
  }
}

console.log('BFS finished. Total visited background pixels:', q.length);

// Now check if visited reached inside the characters
// Check character 4 tie at (1240, 640):
const tieIdx = 640 * w + 1240;
console.log('Was tie visited by BFS?', visited[tieIdx] === 1 ? 'YES (LEAK!)' : 'NO (SAFE!)');

// Check character 3 suit:
const suit3Idx = 480 * w + 930;
console.log('Was char 3 suit visited?', visited[suit3Idx] === 1 ? 'YES (LEAK!)' : 'NO (SAFE!)');

// Also check ground line:
// Under y=729, the ground line and floor can be marked as background as well
