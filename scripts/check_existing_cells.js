const fs = require('fs');
const { PNG } = require('pngjs');

function checkSheet(path) {
    if (!fs.existsSync(path)) return;
    const data = fs.readFileSync(path);
    const png = PNG.sync.read(data);
    
    // Check first 96x96 cell
    let minX = 96, maxX = 0, minY = 96, maxY = 0;
    for (let y = 0; y < 96; y++) {
        for (let x = 0; x < 96; x++) {
            const idx = (y * png.width + x) * 4;
            if (png.data[idx+3] > 20) { // non-transparent
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    console.log(`${path}: First cell bounds: x=[${minX}, ${maxX}] (w=${maxX-minX+1}), y=[${minY}, ${maxY}] (h=${maxY-minY+1}), baseline y=${maxY}`);
}

checkSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/latina_spritesheet_96x96_hoja1.png');
checkSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_walk_run_96x96.png');
checkSheet('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/jefa_spritesheet_96x96_hoja1.png');
