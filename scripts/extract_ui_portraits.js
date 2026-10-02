const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const sourcePath = path.resolve(__dirname, '../character_sprite_sheet.png');
const outDirs = [
    path.resolve(__dirname, '../assets/ui/portraits'),
    'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/ui/portraits'
];

outDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const rosterGrid = {
    leon:          { col: 0, row: 0 },
    latina:        { col: 1, row: 0 },
    ojosazules:    { col: 2, row: 0 },
    pepeargento:   { col: 3, row: 0 },
    eleternauta:   { col: 0, row: 1 },
    elcomandante:  { col: 1, row: 1 },
    elmesias:      { col: 2, row: 1 },
    moria:         { col: 3, row: 1 },
    lasu:          { col: 0, row: 2 },
    hugo:          { col: 1, row: 2 },
    pergolas:      { col: 2, row: 2 },
    sangrejaponesa:{ col: 3, row: 2 },
    lafaraona:     { col: 0, row: 3 },
    badbitch:      { col: 1, row: 3 },
    oidoabsoluto:  { col: 2, row: 3 },
    inmortal:      { col: 3, row: 3 }
};

fs.createReadStream(sourcePath)
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function() {
        console.log(`Master Sheet loaded: ${this.width}x${this.height}`);
        const cellW = 316;
        const cellH = 212;
        const sw = 146;
        const sh = 170;

        for (const [key, pos] of Object.entries(rosterGrid)) {
            const sx = pos.col * cellW + 85;
            const sy = pos.row * cellH + 10;

            const portraitPng = new PNG({ width: sw, height: sh });

            for (let y = 0; y < sh; y++) {
                for (let x = 0; x < sw; x++) {
                    const srcX = Math.min(this.width - 1, Math.max(0, sx + x));
                    const srcY = Math.min(this.height - 1, Math.max(0, sy + y));

                    const srcIdx = (this.width * srcY + srcX) << 2;
                    const dstIdx = (sw * y + x) << 2;

                    const r = this.data[srcIdx];
                    const g = this.data[srcIdx + 1];
                    const b = this.data[srcIdx + 2];
                    const a = this.data[srcIdx + 3];

                    // Chroma-key dark background #14111c: r<32, g<28, b<40
                    if (r < 32 && g < 28 && b < 40) {
                        portraitPng.data[dstIdx] = 0;
                        portraitPng.data[dstIdx + 1] = 0;
                        portraitPng.data[dstIdx + 2] = 0;
                        portraitPng.data[dstIdx + 3] = 0;
                    } else {
                        portraitPng.data[dstIdx] = r;
                        portraitPng.data[dstIdx + 1] = g;
                        portraitPng.data[dstIdx + 2] = b;
                        portraitPng.data[dstIdx + 3] = a;
                    }
                }
            }

            const buffer = PNG.sync.write(portraitPng);
            outDirs.forEach(dir => {
                const targetFile = path.join(dir, `${key}.png`);
                fs.writeFileSync(targetFile, buffer);
                console.log(`Saved portrait for ${key} -> ${targetFile}`);
            });
        }
        console.log("All 16 portraits extracted successfully!");
    });
