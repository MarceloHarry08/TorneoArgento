const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const strip = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_kicks_96x96.png'));

// Check Frame 4 (cell 3: x=3*96 to 4*96) between legs (y=75..89, x=40..55 inside cell)
console.log('Frame 4 between legs:');
for (let y = 75; y <= 89; y++) {
  let line = 'y=' + y + ': ';
  for (let x = 40; x <= 55; x++) {
    const sIdx = (y * strip.width + (3 * 96 + x)) * 4;
    line += strip.data[sIdx + 3] > 0 ? '#' : '.';
  }
  console.log(line);
}

// Check Frame 7 tail on left edge (cell 6: x=0..15 inside cell)
console.log('Frame 7 left edge:');
for (let y = 60; y <= 85; y++) {
  let line = 'y=' + y + ': ';
  for (let x = 0; x <= 15; x++) {
    const sIdx = (y * strip.width + (6 * 96 + x)) * 4;
    line += strip.data[sIdx + 3] > 0 ? '#' : '.';
  }
  console.log(line);
}
