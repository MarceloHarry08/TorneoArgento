const fs = require('fs');
const { PNG } = require('pngjs');

// Load scaled jefa base
const raw = PNG.sync.read(fs.readFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_96x96.png'));

// Create cleaned base with strict palette
const clean = new PNG({ width: 96, height: 96 });
clean.data.fill(0);

// Copy over and clean edges
for (let y = 0; y < 96; y++) {
  for (let x = 0; x < 96; x++) {
    const idx = (y * 96 + x) << 2;
    const a = raw.data[idx + 3];
    if (a < 50) continue;
    const r = raw.data[idx];
    const g = raw.data[idx + 1];
    const b = raw.data[idx + 2];

    clean.data[idx] = r;
    clean.data[idx + 1] = g;
    clean.data[idx + 2] = b;
    clean.data[idx + 3] = 255;
  }
}

fs.writeFileSync('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/scripts/jefa_base_clean.png', PNG.sync.write(clean));
console.log("Saved jefa_base_clean.png");
