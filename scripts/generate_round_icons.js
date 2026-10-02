const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const outDirs = [
    path.resolve(__dirname, '../assets/ui/icons'),
    'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/ui/icons'
];

outDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Sun Round Icon (16x16)
const sunPng = new PNG({ width: 16, height: 16 });
for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (16 * y + x) << 2;

        if (dist <= 6.5) {
            // Gold sun circle with gradient
            const ratio = dist / 6.5;
            const r = 255;
            const g = Math.floor(230 - ratio * 90);
            const b = 0;
            sunPng.data[idx] = r;
            sunPng.data[idx + 1] = g;
            sunPng.data[idx + 2] = b;
            sunPng.data[idx + 3] = 255;
        } else if (dist <= 7.5) {
            // Border
            sunPng.data[idx] = 40;
            sunPng.data[idx + 1] = 20;
            sunPng.data[idx + 2] = 0;
            sunPng.data[idx + 3] = 255;
        } else {
            sunPng.data[idx + 3] = 0;
        }
    }
}

// 2. Empty Round Icon (16x16)
const emptyPng = new PNG({ width: 16, height: 16 });
for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (16 * y + x) << 2;

        if (dist <= 6.5) {
            emptyPng.data[idx] = 45;
            emptyPng.data[idx + 1] = 45;
            emptyPng.data[idx + 2] = 55;
            emptyPng.data[idx + 3] = 255;
        } else if (dist <= 7.5) {
            emptyPng.data[idx] = 20;
            emptyPng.data[idx + 1] = 20;
            emptyPng.data[idx + 2] = 25;
            emptyPng.data[idx + 3] = 255;
        } else {
            emptyPng.data[idx + 3] = 0;
        }
    }
}

const sunBuffer = PNG.sync.write(sunPng);
const emptyBuffer = PNG.sync.write(emptyPng);

outDirs.forEach(dir => {
    fs.writeFileSync(path.join(dir, 'round_sun.png'), sunBuffer);
    fs.writeFileSync(path.join(dir, 'round_empty.png'), emptyBuffer);
});

console.log('Round icons generated successfully!');
