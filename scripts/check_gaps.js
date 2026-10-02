const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

// Print non-transparent pixels in x=340..380
console.log('Boundary 1-2 (x=340..380):');
for (let y = 300; y <= 650; y += 25) {
  let line = ('' + y).padStart(3, ' ') + ': ';
  for (let x = 340; x <= 380; x += 2) {
    const idx = (y * w + x) * 4;
    line += png.data[idx + 3] > 0 ? '#' : '.';
  }
  console.log(line);
}

// Print boundary 2-3 (x=770..810)
console.log('Boundary 2-3 (x=770..810):');
for (let y = 250; y <= 650; y += 25) {
  let line = ('' + y).padStart(3, ' ') + ': ';
  for (let x = 770; x <= 810; x += 2) {
    const idx = (y * w + x) * 4;
    line += png.data[idx + 3] > 0 ? '#' : '.';
  }
  console.log(line);
}

// Print boundary 3-4 (x=1060..1100)
console.log('Boundary 3-4 (x=1060..1100):');
for (let y = 250; y <= 650; y += 25) {
  let line = ('' + y).padStart(3, ' ') + ': ';
  for (let x = 1060; x <= 1100; x += 2) {
    const idx = (y * w + x) * 4;
    line += png.data[idx + 3] > 0 ? '#' : '.';
  }
  console.log(line);
}
