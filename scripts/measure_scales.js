const fs = require('fs');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

function measureMane(p, x0, x1, y0, y1, name) {
  const png = PNG.sync.read(fs.readFileSync(p));
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, count = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * png.width + x) * 4;
      const r = png.data[idx], g = png.data[idx+1], b = png.data[idx+2];
      // Brown mane color has r in 60..220, g in 30..150, b in 10..90, r > g + 15, g > b
      if (r >= 60 && r <= 220 && g >= 30 && g <= 150 && b <= 90 && r > g + 15 && g > b) {
        count++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  console.log(name + ': mane pixels=' + count + ' w=' + (maxX - minX + 1) + ' h=' + (maxY - minY + 1) + ' y=[' + minY + '..' + maxY + ']');
}

// 1. High Punch (reference from previous step): Frame 4 mane
measureMane('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_punch_raw.png', 1100, 1350, 150, 450, 'High Punch Frame 4');

// 2. High Kick: Frame 4 mane
measureMane('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_high_kick_raw.png', 1050, 1350, 150, 450, 'High Kick Frame 4');

// 3. Low Sweep: Frame 4 mane
measureMane('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_low_sweep_raw.png', 1100, 1350, 150, 450, 'Low Sweep Frame 4');
