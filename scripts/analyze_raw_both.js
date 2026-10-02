const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

function analyzeRaw(p) {
  const png = PNG.sync.read(fs.readFileSync(p));
  console.log('=== FILE:', p, '===');
  console.log('Size:', png.width, 'x', png.height);
  
  // Sample background at (0, 0) and corners
  const bg = [png.data[0], png.data[1], png.data[2]];
  console.log('Corner (0,0) RGB:', bg);
  
  // Find ground line: scan Y from 650 to 767 to find where character pixels transition to ground line
  for (let y = 680; y < png.height; y += 5) {
    let nonBg = 0;
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) * 4;
      const dr = Math.abs(png.data[i] - bg[0]);
      const dg = Math.abs(png.data[i+1] - bg[1]);
      const db = Math.abs(png.data[i+2] - bg[2]);
      if (dr + dg + db > 20) nonBg++;
    }
    console.log('y=' + y + ': non-bg pixels=' + nonBg);
  }
}

analyzeRaw('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png');
analyzeRaw('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png');
