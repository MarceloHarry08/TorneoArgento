const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png'));
const w = png.width, h = png.height;

// Flood fill from (0, 0) on the entire 1376x768 image
// What distinguishes background from character?
// Let's check color at (0, 0)
const bgR = png.data[0], bgG = png.data[1], bgB = png.data[2];
console.log('Background at (0,0):', bgR, bgG, bgB);

// Find color difference for all background pixels
// Check several background points: (100, 50), (400, 50), (800, 50), (1200, 50)
const bgPts = [[0, 0], [100, 50], [400, 50], [800, 50], [1200, 50], [1370, 0], [0, 500], [1370, 500]];
bgPts.forEach(([x, y]) => {
  const i = (y * w + x) * 4;
  console.log('pt (' + x + ',' + y + '): ' + png.data[i] + ',' + png.data[i+1] + ',' + png.data[i+2]);
});

// Also check the floor bar at the bottom: y=735 to 767
const floorPts = [[50, 750], [400, 750], [800, 750], [1200, 750]];
floorPts.forEach(([x, y]) => {
  const i = (y * w + x) * 4;
  console.log('floor (' + x + ',' + y + '): ' + png.data[i] + ',' + png.data[i+1] + ',' + png.data[i+2]);
});
