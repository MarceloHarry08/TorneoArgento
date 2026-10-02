const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

// 1. Clean High Kick
function cleanHighKick() {
  const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png'));
  const w = png.width, h = png.height;

  function isBg(r, g, b) {
    return (r >= 26 && r <= 44 && g >= 26 && g <= 44 && b >= 34 && b <= 52);
  }

  const isBgMask = new Uint8Array(w * h);
  const q = [];

  // Seed y >= 702 (ground line and below)
  for (let y = 702; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      isBgMask[idx] = 1;
      q.push(idx);
    }
  }

  // Seed borders
  for (let x = 0; x < w; x++) {
    if (!isBgMask[x] && isBg(png.data[x * 4], png.data[x * 4 + 1], png.data[x * 4 + 2])) {
      isBgMask[x] = 1; q.push(x);
    }
  }
  for (let y = 0; y < 702; y++) {
    const l = y * w, r = y * w + (w - 1);
    if (!isBgMask[l] && isBg(png.data[l * 4], png.data[l * 4 + 1], png.data[l * 4 + 2])) {
      isBgMask[l] = 1; q.push(l);
    }
    if (!isBgMask[r] && isBg(png.data[r * 4], png.data[r * 4 + 1], png.data[r * 4 + 2])) {
      isBgMask[r] = 1; q.push(r);
    }
  }

  // Enclosed pockets seeds (e.g. between Char 4 legs)
  const extraSeeds = [[1215, 675], [1210, 680]];
  for (const [sx, sy] of extraSeeds) {
    const idx = sy * w + sx;
    if (!isBgMask[idx] && isBg(png.data[idx * 4], png.data[idx * 4 + 1], png.data[idx * 4 + 2])) {
      isBgMask[idx] = 1; q.push(idx);
    }
  }

  let head = 0;
  while (head < q.length) {
    const curr = q[head++];
    const cx = curr % w, cy = Math.floor(curr / w);
    for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < 702) {
        const nIdx = ny * w + nx;
        if (!isBgMask[nIdx]) {
          const p = nIdx * 4;
          if (isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            isBgMask[nIdx] = 1;
            q.push(nIdx);
          }
        }
      }
    }
  }

  const out = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (isBgMask[i]) {
      out.data[p] = 0; out.data[p+1] = 0; out.data[p+2] = 0; out.data[p+3] = 0;
    } else {
      out.data[p] = png.data[p];
      out.data[p+1] = png.data[p+1];
      out.data[p+2] = png.data[p+2];
      out.data[p+3] = 255;
    }
  }
  fs.writeFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_kick_nobg.png', PNG.sync.write(out));
  console.log('Saved test_kick_nobg.png, bg count:', q.length);
}

// 2. Clean Low Sweep
function cleanLowSweep() {
  const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png'));
  const w = png.width, h = png.height;

  function isBg(r, g, b) {
    return (r >= 23 && r <= 40 && g >= 22 && g <= 38 && b >= 33 && b <= 50);
  }

  const isBgMask = new Uint8Array(w * h);
  const q = [];

  // Seed y >= 555 (floor and below)
  for (let y = 555; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      isBgMask[idx] = 1;
      q.push(idx);
    }
  }

  // Seed borders
  for (let x = 0; x < w; x++) {
    if (!isBgMask[x] && isBg(png.data[x * 4], png.data[x * 4 + 1], png.data[x * 4 + 2])) {
      isBgMask[x] = 1; q.push(x);
    }
  }
  for (let y = 0; y < 555; y++) {
    const l = y * w, r = y * w + (w - 1);
    if (!isBgMask[l] && isBg(png.data[l * 4], png.data[l * 4 + 1], png.data[l * 4 + 2])) {
      isBgMask[l] = 1; q.push(l);
    }
    if (!isBgMask[r] && isBg(png.data[r * 4], png.data[r * 4 + 1], png.data[r * 4 + 2])) {
      isBgMask[r] = 1; q.push(r);
    }
  }

  // Enclosed pockets seeds (Char 5 and Char 8 between legs)
  const extraSeeds = [[145, 525], [1205, 525]];
  for (const [sx, sy] of extraSeeds) {
    const idx = sy * w + sx;
    if (!isBgMask[idx] && isBg(png.data[idx * 4], png.data[idx * 4 + 1], png.data[idx * 4 + 2])) {
      isBgMask[idx] = 1; q.push(idx);
    }
  }

  let head = 0;
  while (head < q.length) {
    const curr = q[head++];
    const cx = curr % w, cy = Math.floor(curr / w);
    for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < 555) {
        const nIdx = ny * w + nx;
        if (!isBgMask[nIdx]) {
          const p = nIdx * 4;
          if (isBg(png.data[p], png.data[p+1], png.data[p+2])) {
            isBgMask[nIdx] = 1;
            q.push(nIdx);
          }
        }
      }
    }
  }

  const out = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (isBgMask[i]) {
      out.data[p] = 0; out.data[p+1] = 0; out.data[p+2] = 0; out.data[p+3] = 0;
    } else {
      out.data[p] = png.data[p];
      out.data[p+1] = png.data[p+1];
      out.data[p+2] = png.data[p+2];
      out.data[p+3] = 255;
    }
  }
  fs.writeFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_sweep_nobg.png', PNG.sync.write(out));
  console.log('Saved test_sweep_nobg.png, bg count:', q.length);
}

cleanHighKick();
cleanLowSweep();
