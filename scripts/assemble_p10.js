const fs = require('fs');
const { PNG } = require('pngjs');

const rawData = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const raw = PNG.sync.read(rawData);

// Clean separator lines and green fringes
for (let y = 252; y <= 256; y++) {
  for (let x = 0; x < raw.width; x++) {
    const idx = (y * raw.width + x) * 4;
    if (raw.data[idx+3] > 0 && raw.data[idx] < 60 && raw.data[idx+1] < 60 && raw.data[idx+2] < 60) {
      raw.data[idx+3] = 0;
    }
  }
}
for (let i = 0; i < raw.data.length; i += 4) {
  const r = raw.data[i];
  const g = raw.data[i+1];
  const b = raw.data[i+2];
  const a = raw.data[i+3];
  if (a > 0) {
    if (g > 115 && g - r > 25 && g - b > 25) {
      raw.data[i+3] = 0;
    }
  }
}

// Helper to get tight bounding box of a region
function getTightBox(minX, maxX, minY, maxY) {
  let actualMinX = maxX, actualMaxX = minX;
  let actualMinY = maxY, actualMaxY = minY;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * raw.width + x) * 4;
      if (raw.data[idx + 3] > 20) {
        if (x < actualMinX) actualMinX = x;
        if (x > actualMaxX) actualMaxX = x;
        if (y < actualMinY) actualMinY = y;
        if (y > actualMaxY) actualMaxY = y;
      }
    }
  }
  return {
    minX: actualMinX,
    maxX: actualMaxX,
    minY: actualMinY,
    maxY: actualMaxY,
    width: Math.max(1, actualMaxX - actualMinX + 1),
    height: Math.max(1, actualMaxY - actualMinY + 1)
  };
}

const winRegions = [
  getTightBox(35, 200, 20, 252),
  getTightBox(240, 435, 15, 252),
  getTightBox(480, 660, 25, 252),
  getTightBox(700, 915, 18, 252)
];

const loseRegions = [
  getTightBox(25, 185, 280, 496),
  getTightBox(230, 445, 305, 498),
  getTightBox(470, 670, 315, 500),
  getTightBox(705, 870, 285, 496)
];

const fatalityRegions = [
  getTightBox(5, 222, 510, 767),
  getTightBox(226, 460, 510, 767),
  getTightBox(485, 666, 528, 767),
  getTightBox(685, 920, 530, 767),
  getTightBox(921, 1147, 516, 767),
  getTightBox(1148, 1375, 512, 767)
];

console.log('Tight boxes computed:');
console.log('Win:', winRegions.map(b => `${b.width}x${b.height} [${b.minX}..${b.maxX}, ${b.minY}..${b.maxY}]`));
console.log('Lose:', loseRegions.map(b => `${b.width}x${b.height} [${b.minX}..${b.maxX}, ${b.minY}..${b.maxY}]`));
console.log('Fatality:', fatalityRegions.map(b => `${b.width}x${b.height} [${b.minX}..${b.maxX}, ${b.minY}..${b.maxY}]`));

// Create target canvas: 6 cols x 3 rows of 192x192
const cellW = 192;
const cellH = 192;
const cols = 6;
const rows = 3;
const dst = new PNG({ width: cellW * cols, height: cellH * rows });

// Clear dst to fully transparent
for (let i = 0; i < dst.data.length; i += 4) {
  dst.data[i] = 0;
  dst.data[i+1] = 0;
  dst.data[i+2] = 0;
  dst.data[i+3] = 0;
}

// Base scale: standing height in reference is ~226 raw px, target is 180 px in 192x192
const standardScale = 180 / 226;

function drawFrameToCell(box, col, row, customScale = null) {
  const scale = customScale !== null ? customScale : Math.min(standardScale, 184 / box.height, 184 / box.width);
  const scaledW = Math.round(box.width * scale);
  const scaledH = Math.round(box.height * scale);

  const cellX = col * cellW;
  const cellY = row * cellH;

  // Center horizontally
  const offsetX = cellX + Math.floor((cellW - scaledW) / 2);
  // Ground feet at y = 191 (cellY + 191)
  const offsetY = cellY + 191 - scaledH;

  for (let dy = 0; dy < scaledH; dy++) {
    const sy = box.minY + Math.min(box.height - 1, Math.floor(dy / scale));
    const targetY = offsetY + dy;
    if (targetY < cellY || targetY >= cellY + cellH) continue;

    for (let dx = 0; dx < scaledW; dx++) {
      const sx = box.minX + Math.min(box.width - 1, Math.floor(dx / scale));
      const targetX = offsetX + dx;
      if (targetX < cellX || targetX >= cellX + cellW) continue;

      const srcIdx = (sy * raw.width + sx) * 4;
      const dstIdx = (targetY * dst.width + targetX) * 4;

      if (raw.data[srcIdx + 3] > 10) {
        dst.data[dstIdx] = raw.data[srcIdx];
        dst.data[dstIdx + 1] = raw.data[srcIdx + 1];
        dst.data[dstIdx + 2] = raw.data[srcIdx + 2];
        dst.data[dstIdx + 3] = raw.data[srcIdx + 3];
      }
    }
  }
}

// Row 0: Win (4 frames + repeat frame 4 on cols 4 and 5)
for (let c = 0; c < 4; c++) {
  drawFrameToCell(winRegions[c], c, 0);
}
drawFrameToCell(winRegions[3], 4, 0);
drawFrameToCell(winRegions[3], 5, 0);

// Row 1: Lose (4 frames + repeat frame 4 on cols 4 and 5)
for (let c = 0; c < 4; c++) {
  drawFrameToCell(loseRegions[c], c, 1);
}
drawFrameToCell(loseRegions[3], 4, 1);
drawFrameToCell(loseRegions[3], 5, 1);

// Row 2: Fatality (6 frames)
for (let c = 0; c < 6; c++) {
  drawFrameToCell(fatalityRegions[c], c, 2);
}

const outBuf = PNG.sync.write(dst);
fs.writeFileSync('godot/assets/sprites/arquitecta_egipta_win_lose_fatality_192x192.png', outBuf);
fs.writeFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/arquitecta_egipta_win_lose_fatality_192x192.png', outBuf);

console.log('Successfully saved uniform 192x192 spritesheet: 1152 x 576 to both locations!');
