const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const GODOT_SPRITES_DIR = path.resolve(__dirname, '../godot/assets/sprites');
const JUEGO_SPRITES_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// High-quality area-averaging resizer with premultiplied alpha
function resizePNG(srcPng, targetW, targetH) {
  const dstPng = new PNG({ width: targetW, height: targetH });
  const scaleX = srcPng.width / targetW;
  const scaleY = srcPng.height / targetH;

  for (let y = 0; y < targetH; y++) {
    const srcY1 = y * scaleY;
    const srcY2 = (y + 1) * scaleY;
    for (let x = 0; x < targetW; x++) {
      const srcX1 = x * scaleX;
      const srcX2 = (x + 1) * scaleX;

      let accR = 0, accG = 0, accB = 0, accA = 0, totalArea = 0;
      const yStart = Math.floor(srcY1);
      const yEnd = Math.min(srcPng.height - 1, Math.floor(srcY2));
      const xStart = Math.floor(srcX1);
      const xEnd = Math.min(srcPng.width - 1, Math.floor(srcX2));

      for (let sy = yStart; sy <= yEnd; sy++) {
        const yWeight = Math.min(sy + 1, srcY2) - Math.max(sy, srcY1);
        for (let sx = xStart; sx <= xEnd; sx++) {
          const xWeight = Math.min(sx + 1, srcX2) - Math.max(sx, srcX1);
          const weight = yWeight * xWeight;
          totalArea += weight;

          const idx = (sy * srcPng.width + sx) * 4;
          const a = srcPng.data[idx + 3] / 255;
          accR += (srcPng.data[idx] * a) * weight;
          accG += (srcPng.data[idx + 1] * a) * weight;
          accB += (srcPng.data[idx + 2] * a) * weight;
          accA += srcPng.data[idx + 3] * weight;
        }
      }

      const dstIdx = (y * targetW + x) * 4;
      const finalA = accA / totalArea;
      dstPng.data[dstIdx + 3] = Math.round(finalA);
      if (finalA > 0.5) {
        const aNorm = accA / 255;
        dstPng.data[dstIdx] = Math.min(255, Math.max(0, Math.round(accR / aNorm)));
        dstPng.data[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(accG / aNorm)));
        dstPng.data[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(accB / aNorm)));
      } else {
        dstPng.data[dstIdx] = 0;
        dstPng.data[dstIdx + 1] = 0;
        dstPng.data[dstIdx + 2] = 0;
      }
    }
  }
  return dstPng;
}

// Background cleaner per cell with flood fill and pocket detection
function cleanSheet(srcPng, cols, rows, isBgFn) {
  const w = srcPng.width, h = srcPng.height;
  const cellW = Math.floor(w / cols), cellH = Math.floor(h / rows);
  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const minX = c * cellW, maxX = (c === cols - 1) ? w - 1 : (c + 1) * cellW - 1;
      const minY = r * cellH, maxY = (r === rows - 1) ? h - 1 : (r + 1) * cellH - 1;

      for (let x = minX; x <= maxX; x++) {
        let idx = minY * w + x;
        if (!visited[idx] && isBgFn(srcPng.data[idx*4], srcPng.data[idx*4+1], srcPng.data[idx*4+2])) {
          visited[idx] = 1; queue.push(idx);
        }
        idx = maxY * w + x;
        if (!visited[idx] && isBgFn(srcPng.data[idx*4], srcPng.data[idx*4+1], srcPng.data[idx*4+2])) {
          visited[idx] = 1; queue.push(idx);
        }
      }
      for (let y = minY; y <= maxY; y++) {
        let idx = y * w + minX;
        if (!visited[idx] && isBgFn(srcPng.data[idx*4], srcPng.data[idx*4+1], srcPng.data[idx*4+2])) {
          visited[idx] = 1; queue.push(idx);
        }
        idx = y * w + maxX;
        if (!visited[idx] && isBgFn(srcPng.data[idx*4], srcPng.data[idx*4+1], srcPng.data[idx*4+2])) {
          visited[idx] = 1; queue.push(idx);
        }
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w, cy = (curr / w) | 0;
    for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!visited[nIdx]) {
          const np = nIdx * 4;
          if (isBgFn(srcPng.data[np], srcPng.data[np+1], srcPng.data[np+2])) {
            visited[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }
    }
  }

  // Detect enclosed pockets of background
  const compVisited = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!visited[i] && !compVisited[i]) {
      const p = i * 4;
      if (isBgFn(srcPng.data[p], srcPng.data[p+1], srcPng.data[p+2])) {
        const cQ = [i];
        compVisited[i] = 1;
        let cHead = 0;
        while (cHead < cQ.length) {
          const curr = cQ[cHead++];
          const cx = curr % w, cy = (curr / w) | 0;
          for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nIdx = ny * w + nx;
              if (!visited[nIdx] && !compVisited[nIdx]) {
                const np = nIdx * 4;
                if (isBgFn(srcPng.data[np], srcPng.data[np+1], srcPng.data[np+2])) {
                  compVisited[nIdx] = 1;
                  cQ.push(nIdx);
                }
              }
            }
          }
        }
        // If pocket is large enough to be background (> 150 px)
        if (cQ.length > 150) {
          for (const px of cQ) visited[px] = 1;
        }
      }
    }
  }

  // Build clean PNG
  const outPng = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (visited[i]) {
      outPng.data[p] = 0;
      outPng.data[p + 1] = 0;
      outPng.data[p + 2] = 0;
      outPng.data[p + 3] = 0;
    } else {
      outPng.data[p] = srcPng.data[p];
      outPng.data[p + 1] = srcPng.data[p + 1];
      outPng.data[p + 2] = srcPng.data[p + 2];
      outPng.data[p + 3] = srcPng.data[p + 3];
    }
  }
  return outPng;
}

function saveDual(filename, pngObj) {
  const buf = PNG.sync.write(pngObj);
  const p1 = path.join(GODOT_SPRITES_DIR, filename);
  fs.writeFileSync(p1, buf);
  if (fs.existsSync(JUEGO_SPRITES_DIR)) {
    const p2 = path.join(JUEGO_SPRITES_DIR, filename);
    fs.writeFileSync(p2, buf);
  }
  console.log(`[SAVED] ${filename} (${pngObj.width}x${pngObj.height})`);
}

function main() {
  console.log('=== CLEANING AND SIZING EL LEON SPRITES ===');

  // 1. el_leon_mk_base.png -> Resize to 233x335 so character is ~330px
  const baseSrcPath = path.join(GODOT_SPRITES_DIR, 'el_leon_mk_base.png');
  const baseRawPath = path.join(GODOT_SPRITES_DIR, 'el_leon_mk_base_raw.png');
  if (!fs.existsSync(baseRawPath) && fs.existsSync(baseSrcPath)) {
    fs.copyFileSync(baseSrcPath, baseRawPath);
    if (fs.existsSync(JUEGO_SPRITES_DIR)) {
      fs.copyFileSync(baseSrcPath, path.join(JUEGO_SPRITES_DIR, 'el_leon_mk_base_raw.png'));
    }
  }
  const baseSource = fs.existsSync(baseRawPath) ? baseRawPath : baseSrcPath;
  const basePng = PNG.sync.read(fs.readFileSync(baseSource));
  // 330 / 1009 = ~0.327056 -> 233 x 335
  const resizedBase = resizePNG(basePng, 233, 335);
  saveDual('el_leon_mk_base.png', resizedBase);

  // 2. leon_crouch_jump_block.png
  const cjbRaw = path.join(GODOT_SPRITES_DIR, 'leon_crouch_jump_block_raw.png');
  if (fs.existsSync(cjbRaw)) {
    const png = PNG.sync.read(fs.readFileSync(cjbRaw));
    const cleaned = cleanSheet(png, 4, 3, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 190);
    });
    saveDual('leon_crouch_jump_block.png', cleaned);
  }

  // 3. leon_punches.png
  const pRaw = path.join(GODOT_SPRITES_DIR, 'leon_punches_raw.png');
  if (fs.existsSync(pRaw)) {
    const png = PNG.sync.read(fs.readFileSync(pRaw));
    const cleaned = cleanSheet(png, 4, 3, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 75 && r <= 165);
    });
    saveDual('leon_punches.png', cleaned);
  }

  // 4. leon_kicks.png
  const kRaw = path.join(GODOT_SPRITES_DIR, 'leon_kicks_raw.png');
  if (fs.existsSync(kRaw)) {
    const png = PNG.sync.read(fs.readFileSync(kRaw));
    const cleaned = cleanSheet(png, 4, 3, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 12 && r >= 120 && r <= 220);
    });
    saveDual('leon_kicks.png', cleaned);
  }

  // 5. leon_air_attacks.png
  const aRaw = path.join(GODOT_SPRITES_DIR, 'leon_air_attacks_raw.png');
  if (fs.existsSync(aRaw)) {
    const png = PNG.sync.read(fs.readFileSync(aRaw));
    const cleaned = cleanSheet(png, 3, 2, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 115 && r <= 200);
    });
    saveDual('leon_air_attacks.png', cleaned);
  }

  // 6. leon_hurt_knockdown.png
  const hkRaw = path.join(GODOT_SPRITES_DIR, 'leon_hurt_knockdown_raw.png');
  if (fs.existsSync(hkRaw)) {
    const png = PNG.sync.read(fs.readFileSync(hkRaw));
    const cleaned = cleanSheet(png, 5, 2, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 135 && r <= 210);
    });
    saveDual('leon_hurt_knockdown.png', cleaned);
  }

  // 7. leon_special_projectile.png
  const spRaw = path.join(GODOT_SPRITES_DIR, 'leon_special_projectile_raw.png');
  if (fs.existsSync(spRaw)) {
    const png = PNG.sync.read(fs.readFileSync(spRaw));
    const cleaned = cleanSheet(png, 5, 2, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 50 && r <= 135) || (r < 50 && g < 50 && b < 50);
    });
    saveDual('leon_special_projectile.png', cleaned);
  }

  // 8. leon_win_lose.png
  const wlRaw = path.join(GODOT_SPRITES_DIR, 'leon_win_lose_raw.png');
  if (fs.existsSync(wlRaw)) {
    const png = PNG.sync.read(fs.readFileSync(wlRaw));
    const cleaned = cleanSheet(png, 4, 2, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 10 && r >= 180) || (r < 40 && g < 40 && b < 40);
    });
    saveDual('leon_win_lose.png', cleaned);
  }

  // 9. leon_fatality.png -> Clean and scale down by 0.5 to 688x384 so it matches other ~330-360px specials
  const fatRaw = path.join(GODOT_SPRITES_DIR, 'leon_fatality_raw.png');
  if (fs.existsSync(fatRaw)) {
    const png = PNG.sync.read(fs.readFileSync(fatRaw));
    const cleaned = cleanSheet(png, 6, 1, (r, g, b) => {
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      return (maxDiff <= 8 && r >= 115 && r <= 200);
    });
    // Scale down 50% to 688 x 384
    const resizedFat = resizePNG(cleaned, 688, 384);
    saveDual('leon_fatality.png', resizedFat);
  }

  console.log('=== ALL SPRITES CLEANED & SCALED SUCCESSFULLY! ===');
}

main();
