const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

function isBg(r, g, b) {
  return (r >= 13 && r <= 25 && g >= 11 && g <= 23 && b >= 20 && b <= 34 && (b - r >= 3) && (b - g >= 3));
}

const isBackground = new Uint8Array(w * h);

// Seed all pixels at y >= 730 as background
const q = [];
for (let y = 730; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    isBackground[idx] = 1;
    q.push(idx);
  }
}

// Also seed top, left, right borders
for (let x = 0; x < w; x++) {
  if (!isBackground[x] && isBg(png.data[x * 4], png.data[x * 4 + 1], png.data[x * 4 + 2])) {
    isBackground[x] = 1;
    q.push(x);
  }
}
for (let y = 0; y < 730; y++) {
  const lIdx = y * w;
  if (!isBackground[lIdx] && isBg(png.data[lIdx * 4], png.data[lIdx * 4 + 1], png.data[lIdx * 4 + 2])) {
    isBackground[lIdx] = 1;
    q.push(lIdx);
  }
  const rIdx = y * w + (w - 1);
  if (!isBackground[rIdx] && isBg(png.data[rIdx * 4], png.data[rIdx * 4 + 1], png.data[rIdx * 4 + 2])) {
    isBackground[rIdx] = 1;
    q.push(rIdx);
  }
}

let head = 0;
while (head < q.length) {
  const curr = q[head++];
  const cx = curr % w;
  const cy = Math.floor(curr / w);

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx >= 0 && nx < w && ny >= 0 && ny < 730) {
      const nIdx = ny * w + nx;
      if (!isBackground[nIdx]) {
        const p = nIdx * 4;
        if (isBg(png.data[p], png.data[p + 1], png.data[p + 2])) {
          isBackground[nIdx] = 1;
          q.push(nIdx);
        }
      }
    }
  }
}

console.log('Total background pixels marked:', q.length);

// Check if any pixels inside characters are unreached background pockets
// Let's create a transparent PNG of the raw image to inspect!
const transparentPng = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    const p = idx * 4;
    if (isBackground[idx]) {
      transparentPng.data[p] = 0;
      transparentPng.data[p + 1] = 0;
      transparentPng.data[p + 2] = 0;
      transparentPng.data[p + 3] = 0;
    } else {
      transparentPng.data[p] = png.data[p];
      transparentPng.data[p + 1] = png.data[p + 1];
      transparentPng.data[p + 2] = png.data[p + 2];
      transparentPng.data[p + 3] = 255;
    }
  }
}

fs.writeFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png', PNG.sync.write(transparentPng));
console.log('Saved test_raw_nobg.png');
