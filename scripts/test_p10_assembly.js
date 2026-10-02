const fs = require('fs');
const { PNG } = require('pngjs');

const rawData = fs.readFileSync('godot/assets/sprites/egipta_win_lose_fatality.png');
const raw = PNG.sync.read(rawData);

// 1. Clean the black horizontal separator line at y = 252..256
for (let y = 252; y <= 256; y++) {
  for (let x = 0; x < raw.width; x++) {
    const idx = (y * raw.width + x) * 4;
    if (raw.data[idx+3] > 0 && raw.data[idx] < 60 && raw.data[idx+1] < 60 && raw.data[idx+2] < 60) {
      raw.data[idx+3] = 0;
    }
  }
}

// Also check and clean any leftover green fringes
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

// Define the source bounding box for each frame
// Row 1: 4 Win frames
const winFrames = [
  { minX: 40, maxX: 195, minY: 25, maxY: 252 },
  { minX: 245, maxX: 430, minY: 18, maxY: 252 },
  { minX: 485, maxX: 655, minY: 30, maxY: 252 },
  { minX: 705, maxX: 910, minY: 20, maxY: 252 }
];

// Row 2: 4 Lose frames
const loseFrames = [
  { minX: 30, maxX: 180, minY: 288, maxY: 494 },
  { minX: 235, maxX: 440, minY: 310, maxY: 496 },
  { minX: 475, maxX: 665, minY: 320, maxY: 498 },
  { minX: 710, maxX: 865, minY: 292, maxY: 494 }
];

// Row 3: 6 Fatality frames
const fatalityFrames = [
  { minX: 5, maxX: 222, minY: 512, maxY: 767 },
  { minX: 226, maxX: 460, minY: 512, maxY: 767 },
  { minX: 485, maxX: 666, minY: 530, maxY: 767 },
  { minX: 685, maxX: 920, minY: 532, maxY: 767 },
  { minX: 921, maxX: 1147, minY: 518, maxY: 767 },
  { minX: 1148, maxX: 1375, minY: 514, maxY: 767 }
];

console.log('Win frames:', winFrames.length);
console.log('Lose frames:', loseFrames.length);
console.log('Fatality frames:', fatalityFrames.length);
