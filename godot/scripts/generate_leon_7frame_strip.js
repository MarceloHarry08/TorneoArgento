// TORNEO ARGENTO 16-BIT - Ground Truth 7-Frame Sprite Strip Builder
// Character: "El León"
// Cell size: Strict 96x96 pixels (Total: 672 x 96 px)
// Frames:
//   1. IDLE (Frame 1): Identical to el_leon_base.png (ground truth)
//   2. IDLE (Frame 2): Inhalation (+1px elevation, subtle chest expansion & arm flexion)
//   3. IDLE (Frame 3): Peak breath (+1px elevation, chest fully expanded, tail tip wave)
//   4. IDLE (Frame 4): Exhalation / gentle return easing back into Frame 1
//   5. CROUCH (Frame 5): Knees begin flexing, hips and torso lower by 6px
//   6. CROUCH (Frame 6): Full low guard crouch (drop 13px, arms protecting body, legs bent low)
//   7. CROUCH (Frame 7): Uncoiling and rising back up (drop 6px, returning to neutral)

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const BASE_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 7;
const STRIP_WIDTH = FRAMES * CELL; // 672 px
const STRIP_HEIGHT = CELL;          // 96 px

const strip = new PNG({ width: STRIP_WIDTH, height: STRIP_HEIGHT });
strip.data.fill(0); // 100% Transparent

function getPx(png, x, y) {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return [0,0,0,0];
    const i = (y * png.width + x) << 2;
    return [png.data[i], png.data[i+1], png.data[i+2], png.data[i+3]];
}

function setPx(png, x, y, col, a = 255) {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
    const i = (y * png.width + x) << 2;
    png.data[i] = col[0];
    png.data[i+1] = col[1];
    png.data[i+2] = col[2];
    png.data[i+3] = a;
}

function blitToStrip(cellPng, frameIndex) {
    const startX = frameIndex * CELL;
    for (let y = 0; y < CELL; y++) {
        for (let x = 0; x < CELL; x++) {
            const sIdx = (y * CELL + x) << 2;
            const a = cellPng.data[sIdx + 3];
            if (a === 0) continue;
            const dIdx = (y * STRIP_WIDTH + (startX + x)) << 2;
            strip.data[dIdx] = cellPng.data[sIdx];
            strip.data[dIdx + 1] = cellPng.data[sIdx + 1];
            strip.data[dIdx + 2] = cellPng.data[sIdx + 2];
            strip.data[dIdx + 3] = a;
        }
    }
}

function isUpper(x, y) {
    if (base.data[((y*96+x)<<2)+3] === 0) return false;
    if (x < 37 && y >= 75) return false; // tail stays with lower body
    if (y < 72) return true;
    if (x <= 41 && y <= 75) return true; // left fist
    if (x >= 69 && y <= 73) return true; // right fist
    if (y === 72 && x >= 42 && x <= 68) return true; // jacket hem
    return false;
}

// ------------------------------------------------------------------------------
// FRAME 1: EXACT GROUND TRUTH
// ------------------------------------------------------------------------------
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.set(base.data);
blitToStrip(f1, 0);

// ------------------------------------------------------------------------------
// FRAME 2: IDLE 2 (Breath In: +1px elevation, subtle chest expansion)
// ------------------------------------------------------------------------------
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);

// Lower body (legs, feet, tail)
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, y)) {
            const p = getPx(base, x, y);
            if (p[3] > 0) setPx(f2, x, y, p);
        }
    }
}

// Upper body shifted UP by 1px
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            setPx(f2, x, y - 1, p);
        }
    }
}

// Seal waist seam and under-fist pixels with solid suit/trouser color
for (let x = 40; x <= 68; x++) {
    const pAbove = getPx(f2, x, 71);
    const pBelow = getPx(f2, x, 73);
    if (pAbove[3] > 0 && pBelow[3] > 0 && getPx(f2, x, 72)[3] === 0) {
        setPx(f2, x, 72, pAbove);
    }
}
for (let x = 33; x <= 41; x++) {
    if (getPx(f2, x, 74)[3] > 0 && getPx(f2, x, 75)[3] === 0) setPx(f2, x, 75, [20, 20, 24]);
}
for (let x = 69; x <= 73; x++) {
    if (getPx(f2, x, 72)[3] > 0 && getPx(f2, x, 73)[3] === 0) setPx(f2, x, 73, [20, 20, 24]);
}

blitToStrip(f2, 1);

// ------------------------------------------------------------------------------
// FRAME 3: IDLE 3 (Peak Inhalation: +1px elevation, full chest, tail tip wave)
// ------------------------------------------------------------------------------
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);

// Lower body with subtle tail tip wave
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, y)) {
            const p = getPx(base, x, y);
            if (p[3] > 0) {
                // Tail tip rises 1px
                const isTailTip = (x < 28 && y > 76);
                const destY = isTailTip ? y - 1 : y;
                setPx(f3, x, destY, p);
            }
        }
    }
}

// Upper body at peak (+1px)
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            setPx(f3, x, y - 1, p);
        }
    }
}

// Seal seams
for (let x = 40; x <= 68; x++) {
    const pAbove = getPx(f3, x, 71);
    const pBelow = getPx(f3, x, 73);
    if (pAbove[3] > 0 && pBelow[3] > 0 && getPx(f3, x, 72)[3] === 0) {
        setPx(f3, x, 72, pAbove);
    }
}
for (let x = 33; x <= 41; x++) {
    if (getPx(f3, x, 74)[3] > 0 && getPx(f3, x, 75)[3] === 0) setPx(f3, x, 75, [20, 20, 24]);
}
for (let x = 69; x <= 73; x++) {
    if (getPx(f3, x, 72)[3] > 0 && getPx(f3, x, 73)[3] === 0) setPx(f3, x, 73, [20, 20, 24]);
}

blitToStrip(f3, 2);

// ------------------------------------------------------------------------------
// FRAME 4: IDLE 4 (Exhalation easing gently back to Frame 1)
// ------------------------------------------------------------------------------
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);

// Lower body
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, y)) {
            const p = getPx(base, x, y);
            if (p[3] > 0) setPx(f4, x, y, p);
        }
    }
}

// Upper body returned to baseline y (0 offset), easing breath
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            setPx(f4, x, y, p);
        }
    }
}
blitToStrip(f4, 3);

// ------------------------------------------------------------------------------
// FRAME 5: CROUCH 1 (Start of knee flexion, hips and torso lower 6px)
// ------------------------------------------------------------------------------
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);

const DROP5 = 6;

// Feet (y >= 83) identical to base
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f5, x, y, p);
    }
}

// Tail lowered slightly (+3px)
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpper(x, y)) {
            const destY = Math.min(88, y + 3);
            setPx(f5, x, destY, p);
        }
    }
}

// Compress trousers (y from 72..82 into 78..82)
for (let destY = 72 + DROP5; destY < 83; destY++) {
    const t = (destY - (72 + DROP5)) / (83 - (72 + DROP5));
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 1;
                else if (x > 54) destX = x + 1;
                setPx(f5, destX, destY, p);
            }
        }
    }
}

// Upper body lowered by DROP5 (+6px) and leaned forward (+1px in X)
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            const destY = y + DROP5;
            const destX = x + 1;
            setPx(f5, destX, destY, p);
        }
    }
}

// Seal hem overlap
for (let y = 76; y <= 79; y++) {
    for (let x = 40; x <= 66; x++) {
        const p = getPx(f5, x, y);
        if (p[3] === 0) {
            const pAbove = getPx(f5, x, y - 1);
            if (pAbove[3] > 0) setPx(f5, x, y, pAbove);
        }
    }
}

blitToStrip(f5, 4);

// ------------------------------------------------------------------------------
// FRAME 6: CROUCH 2 (Full Low Guard Crouch)
// Deep crouch (drop 13px), legs bent low, arms protecting body, feet anchored
// ------------------------------------------------------------------------------
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);

const DROP6 = 13;

// Feet (y >= 83) identical to base
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f6, x, y, p);
    }
}

// Tail resting low along floor (+5px)
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpper(x, y)) {
            const destY = Math.min(88, y + 5);
            setPx(f6, x, destY, p);
        }
    }
}

// Compress trousers into deep bent knees (y from 79..82)
for (let destY = 79; destY < 83; destY++) {
    const t = (destY - 79) / (83 - 79);
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 2;
                else if (x > 54) destX = x + 2;
                setPx(f6, destX, destY, p);
            }
        }
    }
}

// Upper body dropped by DROP6 (+13px), with hands and cuffs held high in guard
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            const isHandOrCuff = (y >= 66 && (x <= 42 || x >= 68));
            // Raise fists relative to dropped torso (+4px upward flexion)
            const yOffset = isHandOrCuff ? (DROP6 - 4) : DROP6;
            const destY = y + yOffset;
            const destX = x + (isHandOrCuff ? (x < 50 ? 2 : -1) : 1);
            setPx(f6, destX, destY, p);
        }
    }
}

// Seal hem overlap
for (let y = 78; y <= 80; y++) {
    for (let x = 40; x <= 66; x++) {
        const p = getPx(f6, x, y);
        if (p[3] === 0) {
            const pAbove = getPx(f6, x, y - 1);
            if (pAbove[3] > 0) setPx(f6, x, y, pAbove);
        }
    }
}

blitToStrip(f6, 5);

// ------------------------------------------------------------------------------
// FRAME 7: CROUCH 3 (Uncoiling and rising back towards neutral guard)
// Symmetric anticipation frame easing from crouch back into Frame 1
// ------------------------------------------------------------------------------
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);

const DROP7 = 6;

// Feet identical to base
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f7, x, y, p);
    }
}

// Tail
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpper(x, y)) {
            const destY = Math.min(88, y + 2);
            setPx(f7, x, destY, p);
        }
    }
}

// Compress trousers
for (let destY = 72 + DROP7; destY < 83; destY++) {
    const t = (destY - (72 + DROP7)) / (83 - (72 + DROP7));
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpper(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 1;
                else if (x > 54) destX = x + 1;
                setPx(f7, destX, destY, p);
            }
        }
    }
}

// Upper body rising (at +6px, returning to 0px)
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpper(x, y)) {
            const p = getPx(base, x, y);
            const destY = y + DROP7;
            const destX = x + 1;
            setPx(f7, destX, destY, p);
        }
    }
}

// Seal hem overlap
for (let y = 76; y <= 79; y++) {
    for (let x = 40; x <= 66; x++) {
        const p = getPx(f7, x, y);
        if (p[3] === 0) {
            const pAbove = getPx(f7, x, y - 1);
            if (pAbove[3] > 0) setPx(f7, x, y, pAbove);
        }
    }
}

blitToStrip(f7, 6);

// ------------------------------------------------------------------------------
// SAVE OUTPUTS
// ------------------------------------------------------------------------------
const outPath = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_idle_crouch_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log('Saved 7-frame sprite strip to:', outPath);

// Also copy to artifacts directory for user viewing
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
fs.writeFileSync(path.join(artifactDir, 'leon_spritestrip_idle_crouch_96x96.png'), PNG.sync.write(strip));
console.log('Copied to artifacts directory.');
