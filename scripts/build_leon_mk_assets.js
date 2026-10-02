const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const PROJECT_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight';
const LOCAL_DIR = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/godot';

const BASE_PATH = path.join(PROJECT_DIR, 'assets/sprites/el_leon_mk_base.png');
const baseBuf = fs.readFileSync(BASE_PATH);
const basePng = PNG.sync.read(baseBuf);

console.log('Loaded base lion:', basePng.width, 'x', basePng.height);

// 1. Generate UI Portrait (146 x 170) focusing on head/chest
const portraitW = 146;
const portraitH = 170;
const portrait = new PNG({ width: portraitW, height: portraitH });

// Crop head area from basePng: head is roughly from y=0 to y=350, x=150 to x=550
const srcHeadX = 140;
const srcHeadY = 0;
const srcHeadW = 400;
const srcHeadH = 465;

for (let y = 0; y < portraitH; y++) {
    const sy = Math.floor(srcHeadY + (y / portraitH) * srcHeadH);
    for (let x = 0; x < portraitW; x++) {
        const sx = Math.floor(srcHeadX + (x / portraitW) * srcHeadW);
        const sIdx = (sy * basePng.width + sx) << 2;
        const dIdx = (y * portraitW + x) << 2;
        portrait.data[dIdx] = basePng.data[sIdx];
        portrait.data[dIdx + 1] = basePng.data[sIdx + 1];
        portrait.data[dIdx + 2] = basePng.data[sIdx + 2];
        portrait.data[dIdx + 3] = basePng.data[sIdx + 3];
    }
}

const portraitBuf = PNG.sync.write(portrait);
const pOut1 = path.join(PROJECT_DIR, 'assets/ui/portraits/leon.png');
const pOut2 = path.join(LOCAL_DIR, 'assets/ui/portraits/leon.png');
fs.writeFileSync(pOut1, portraitBuf);
if (fs.existsSync(path.dirname(pOut2))) fs.writeFileSync(pOut2, portraitBuf);
console.log('[OK] Saved new MK portrait to assets/ui/portraits/leon.png');

// 2. Update leon_spritesheet.png for Character Select preview
const sheetPath = path.join(PROJECT_DIR, 'assets/sprites/leon_spritesheet.png');
const sheet = PNG.sync.read(fs.readFileSync(sheetPath));

// GameData.STANDARD_FRAMES:
// portrait: Rect2(15, 10, 90, 70)
const portX = 15, portY = 10, portW = 90, portH = 70;
// Clear region
for (let y = portY; y < portY + portH; y++) {
    for (let x = portX; x < portX + portW; x++) {
        const idx = (y * sheet.width + x) << 2;
        sheet.data[idx] = 0; sheet.data[idx+1] = 0; sheet.data[idx+2] = 0; sheet.data[idx+3] = 0;
    }
}
// Blit scaled head into portrait region
for (let y = 0; y < portH; y++) {
    const sy = Math.floor(srcHeadY + (y / portH) * (srcHeadH * 0.8));
    for (let x = 0; x < portW; x++) {
        const sx = Math.floor((srcHeadX + 40) + (x / portW) * (srcHeadW * 0.8));
        const sIdx = (sy * basePng.width + sx) << 2;
        const dIdx = ((portY + y) * sheet.width + (portX + x)) << 2;
        if (basePng.data[sIdx + 3] > 10) {
            sheet.data[dIdx] = basePng.data[sIdx];
            sheet.data[dIdx + 1] = basePng.data[sIdx + 1];
            sheet.data[dIdx + 2] = basePng.data[sIdx + 2];
            sheet.data[dIdx + 3] = basePng.data[sIdx + 3];
        }
    }
}

// idle[0]: Rect2(15, 90, 120, 175)
const idleX = 15, idleY = 90, idleW = 120, idleH = 175;
// Clear region
for (let y = idleY; y < idleY + idleH; y++) {
    for (let x = idleX; x < idleX + idleW; x++) {
        const idx = (y * sheet.width + x) << 2;
        sheet.data[idx] = 0; sheet.data[idx+1] = 0; sheet.data[idx+2] = 0; sheet.data[idx+3] = 0;
    }
}
// Blit full-body MK Leon into idle preview
for (let y = 0; y < idleH; y++) {
    const sy = Math.floor((y / idleH) * basePng.height);
    for (let x = 0; x < idleW; x++) {
        const sx = Math.floor((x / idleW) * basePng.width);
        const sIdx = (sy * basePng.width + sx) << 2;
        const dIdx = ((idleY + y) * sheet.width + (idleX + x)) << 2;
        if (basePng.data[sIdx + 3] > 10) {
            sheet.data[dIdx] = basePng.data[sIdx];
            sheet.data[dIdx + 1] = basePng.data[sIdx + 1];
            sheet.data[dIdx + 2] = basePng.data[sIdx + 2];
            sheet.data[dIdx + 3] = basePng.data[sIdx + 3];
        }
    }
}

const sheetBuf = PNG.sync.write(sheet);
fs.writeFileSync(sheetPath, sheetBuf);
fs.writeFileSync(path.join(LOCAL_DIR, 'assets/sprites/leon_spritesheet.png'), sheetBuf);
console.log('[OK] Updated leon_spritesheet.png with MK Leon portrait and preview!');
