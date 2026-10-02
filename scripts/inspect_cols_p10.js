const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const png = PNG.sync.read(data);

const detectedRows = [
  { name: 'Row 1 - WIN', startY: 20, endY: 260 },
  { name: 'Row 2 - LOSE', startY: 290, endY: 495 },
  { name: 'Row 3 - FATALITY', startY: 510, endY: 767 }
];

for (const r of detectedRows) {
  const colCounts = new Array(png.width).fill(0);
  for (let x = 0; x < png.width; x++) {
    for (let y = r.startY; y <= r.endY; y++) {
      const idx = (y * png.width + x) * 4;
      if (png.data[idx + 3] > 20) {
        colCounts[x]++;
      }
    }
  }

  let inBox = false;
  let startX = 0;
  const boxes = [];
  for (let x = 0; x < png.width; x++) {
    if (colCounts[x] > 5 && !inBox) {
      inBox = true;
      startX = x;
    } else if (colCounts[x] <= 5 && inBox) {
      inBox = false;
      if (x - startX > 20) { // filter tiny noise
        boxes.push({ startX, endX: x - 1, width: x - startX });
      }
    }
  }
  if (inBox && png.width - startX > 20) {
    boxes.push({ startX, endX: png.width - 1, width: png.width - startX });
  }

  console.log(r.name, 'boxes (' + boxes.length + '):', boxes);
}
