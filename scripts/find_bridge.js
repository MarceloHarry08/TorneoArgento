const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const png = PNG.sync.read(fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_raw_nobg.png'));
const w = png.width, h = png.height;

// Check where id 0 touches between char 2 and char 3
// Between x=750 and 820
let touchPoints = [];
for (let y = 0; y < 730; y++) {
  for (let x = 750; x <= 820; x++) {
    const idx = (y * w + x) * 4;
    if (png.data[idx + 3] > 0) {
      // Check if this pixel bridges between the left side (x < 780) and right side (x > 800)
    }
  }
}

// Let's print out all non-transparent pixels in x=770..810 line by line
console.log('Non-transparent pixels in x=770..810:');
for (let y = 340; y <= 420; y++) {
  let row = '';
  for (let x = 770; x <= 810; x++) {
    const idx = (y * w + x) * 4;
    row += png.data[idx + 3] > 0 ? '#' : '.';
  }
  if (row.includes('#')) {
    console.log(('' + y).padStart(3, ' ') + ': ' + row);
  }
}
