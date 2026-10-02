// ==============================================================================
// TORNEO ARGENTO 16-BIT - EL LEÓN: LOW PUNCH & BLOCK SPRITE STRIP GENERATOR
// Strict 96x96 Grid | Total: 7 Cells (672 x 96 px) | 100% Transparent PNG Background
// Foot ground baseline anchored firmly at y = 89
//
// Acciones:
//   Acción 1 - PIÑA BAJA (Low Punch - 4 cuadros):
//     Cuadro 1 (Frame 0): Inicio en agachado (flexión profunda, brazo retraído preparando impacto)
//     Cuadro 2 (Frame 1): Golpe bajo activo (puño extendido horizontal a nivel de rodilla/espinilla)
//     Cuadro 3 (Frame 2): Recuperación (brazo replegándose rápidamente hacia el pecho)
//     Cuadro 4 (Frame 3): Fin (vuelta a postura agachada neutral)
//
//   Acción 2 - BLOQUEO / GUARDIA (Block - 3 cuadros):
//     Cuadro 5 (Frame 4): Entrada a guardia (cruza antebrazos en X frente a cara y pecho)
//     Cuadro 6 (Frame 5): Postura de bloqueo firme (brazos plantados, piernas flexionadas 2px)
//     Cuadro 7 (Frame 6): Impacto absorbido (retroceso de 2px con chispas de píxeles arcade)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const BASE_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 7;
const STRIP_WIDTH = FRAMES * CELL; // 672 px
const STRIP_HEIGHT = CELL;          // 96 px
const GROUND_Y = 89;                // Ground baseline for feet soles

const strip = new PNG({ width: STRIP_WIDTH, height: STRIP_HEIGHT });
strip.data.fill(0); // 100% Transparent

// Exact Ground Truth Palette Swatches (Derived directly from el_leon_base.png)
const PAL = {
    black: [16, 14, 18],
    suitShadow: [24, 22, 26],
    suitBase: [36, 34, 40],
    suitMid: [50, 48, 56],
    suitHi: [68, 66, 76],
    suitCrease: [88, 86, 98],

    shirtWhite: [245, 246, 248],
    shirtShadow: [180, 182, 192],
    shirtDark: [130, 132, 142],

    tieDark: [35, 30, 48],
    tieBase: [56, 48, 76],
    tieMid: [76, 66, 102],
    tieHi: [98, 86, 130],

    maneDeep: [44, 24, 12],
    maneShadow: [72, 40, 20],
    maneBase: [114, 68, 35],
    maneMid: [152, 94, 50],
    maneHi: [188, 124, 72],
    maneLight: [218, 152, 92],

    furDark: [148, 88, 32],
    furBase: [214, 144, 58],
    furMid: [238, 172, 78],
    furHi: [252, 196, 100],

    muzzleBase: [244, 230, 198],
    muzzleShadow: [218, 200, 164],
    nose: [26, 18, 20],
    mouth: [18, 12, 14],

    eyeWhite: [255, 255, 255],
    eyePupil: [12, 10, 10],

    claw: [252, 250, 240],
    shoes: [16, 15, 18],
    shoesHi: [44, 42, 50],

    sparkWhite: [255, 255, 255],
    sparkYellow: [254, 240, 138],
    sparkGold: [245, 158, 11],
    sparkCyan: [103, 232, 249],
    sparkBlue: [56, 189, 248]
};

function getPx(png, x, y) {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return [0, 0, 0, 0];
    const i = (y * png.width + x) << 2;
    return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

function setPx(png, x, y, col, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= png.width || y < 0 || y >= png.height || a <= 0) return;
    const i = (y * png.width + x) << 2;
    if (a >= 255) {
        png.data[i] = col[0];
        png.data[i + 1] = col[1];
        png.data[i + 2] = col[2];
        png.data[i + 3] = 255;
    } else {
        const curA = png.data[i + 3] / 255;
        const newA = a / 255;
        const outA = newA + curA * (1 - newA);
        if (outA > 0) {
            png.data[i] = Math.round((col[0] * newA + png.data[i] * curA * (1 - newA)) / outA);
            png.data[i + 1] = Math.round((col[1] * newA + png.data[i + 1] * curA * (1 - newA)) / outA);
            png.data[i + 2] = Math.round((col[2] * newA + png.data[i + 2] * curA * (1 - newA)) / outA);
            png.data[i + 3] = Math.round(outA * 255);
        }
    }
}

function fillRect(png, x, y, w, h, col, a = 255) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            setPx(png, x + dx, y + dy, col, a);
        }
    }
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

// Segmentation helper from base sprite
function isUpperBody(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    if (x < 37 && y >= 75) return false; // Tail
    if (y < 72) return true;
    if (x <= 41 && y <= 75) return true; // Left arm
    if (x >= 67 && y <= 73) return true; // Right arm
    if (y === 72 && x >= 42 && x <= 68) return true; // Jacket hem
    return false;
}

function isOldArm(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    if (y >= 48 && y <= 76) {
        if (x <= 41) return true;  // Left arm
        if (x >= 67) return true;  // Right arm
    }
    return false;
}

// Clenched lion fist with white cuff and sharp claws
function drawClenchedFist(png, fx, fy, dir = "right", scale = 1.0) {
    fx = Math.round(fx);
    fy = Math.round(fy);
    const facingRight = (dir === "right");
    const cuffX = facingRight ? fx - 3 : fx + 7;

    // White shirt cuff
    fillRect(png, cuffX, fy - 1, 3, 7, PAL.shirtWhite);
    setPx(png, cuffX, fy - 1, PAL.shirtDark);
    setPx(png, cuffX, fy + 5, PAL.shirtDark);

    // Golden lion fist body
    fillRect(png, fx, fy - 2, 7, 8, PAL.furBase);
    fillRect(png, fx + 1, fy - 3, 5, 2, PAL.furHi);
    fillRect(png, fx, fy + 5, 7, 2, PAL.furDark);

    // Claws at fist front
    const clawX = facingRight ? fx + 6 : fx - 1;
    setPx(png, clawX, fy - 1, PAL.claw);
    setPx(png, clawX, fy + 1, PAL.claw);
    setPx(png, clawX, fy + 3, PAL.claw);
    setPx(png, clawX, fy + 5, PAL.claw);

    // Dark outline
    setPx(png, fx - 1, fy - 2, PAL.black);
    setPx(png, fx - 1, fy + 5, PAL.black);
    fillRect(png, clawX + (facingRight ? 1 : -1), fy - 1, 1, 7, PAL.black);
}

// Draw dynamic arcade block sparks
function drawBlockSparks(png, cx, cy) {
    // 1. Intense white core
    fillRect(png, cx - 1, cy - 1, 3, 3, PAL.sparkWhite);
    setPx(png, cx, cy - 2, PAL.sparkWhite);
    setPx(png, cx, cy + 2, PAL.sparkWhite);
    setPx(png, cx - 2, cy, PAL.sparkWhite);
    setPx(png, cx + 2, cy, PAL.sparkWhite);

    // 2. High-energy yellow / gold sparks in dynamic diagonals
    const yellowPts = [
        [cx - 3, cy - 3], [cx + 3, cy - 3], [cx - 3, cy + 3], [cx + 3, cy + 3],
        [cx - 4, cy - 1], [cx + 4, cy - 1], [cx - 1, cy - 4], [cx + 1, cy - 4],
        [cx - 2, cy + 4], [cx + 2, cy + 4], [cx + 5, cy + 1], [cx - 5, cy + 2]
    ];
    for (const p of yellowPts) {
        setPx(png, p[0], p[1], PAL.sparkYellow);
    }

    // 3. Gold outer embers
    const goldPts = [
        [cx - 5, cy - 4], [cx + 5, cy - 4], [cx + 6, cy - 2], [cx - 6, cy + 3],
        [cx + 4, cy + 5], [cx - 3, cy + 6], [cx + 7, cy], [cx, cy - 6]
    ];
    for (const p of goldPts) {
        setPx(png, p[0], p[1], PAL.sparkGold);
    }

    // 4. Cyan / blue arcade electric particles
    const cyanPts = [
        [cx + 6, cy - 5], [cx - 7, cy - 2], [cx + 8, cy + 2], [cx - 4, cy - 6],
        [cx + 3, cy - 7], [cx - 6, cy + 5], [cx + 6, cy + 4], [cx + 2, cy + 7]
    ];
    for (const p of cyanPts) {
        setPx(png, p[0], p[1], PAL.sparkCyan);
    }
}

// ------------------------------------------------------------------------------
// CUADRO 1: INICIO EN AGACHADO (LOW PUNCH STARTUP)
// Deep crouch (drop 13px), front arm cocked back towards torso preparing impact
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 1: Low Punch Startup...');
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);

const DROP_C1 = 13;

// Feet identical to base firmly on ground y=89
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f1, x, y, p);
    }
}

// Tail resting low along floor
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) {
            setPx(f1, x, Math.min(88, y + 5), p);
        }
    }
}

// Compressed trousers into deep bent knees
for (let destY = 79; destY < 83; destY++) {
    const t = (destY - 79) / (83 - 79);
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 2;
                else if (x > 54) destX = x + 2;
                setPx(f1, destX, destY, p);
            }
        }
    }
}

// Upper body core (Head, mane, suit chest, tie) dropped by DROP_C1, excluding old idle arms
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f1, x, y + DROP_C1, p);
        }
    }
}

// Seal waist seam
for (let y = 78; y <= 80; y++) {
    for (let x = 40; x <= 66; x++) {
        if (getPx(f1, x, y)[3] === 0) {
            const pAbove = getPx(f1, x, y - 1);
            if (pAbove[3] > 0) setPx(f1, x, y, pAbove);
        }
    }
}

// Draw newly articulated arms:
// 1. Rear arm (viewer's left): In crouch guard protecting chest
fillRect(f1, 52, 60, 6, 8, PAL.suitBase);
fillRect(f1, 53, 59, 4, 2, PAL.suitMid);
fillRect(f1, 54, 57, 4, 3, PAL.shirtWhite); // cuff
fillRect(f1, 55, 54, 6, 5, PAL.furBase);    // clenched guard fist
fillRect(f1, 56, 53, 4, 2, PAL.furHi);
setPx(f1, 58, 54, PAL.claw);
setPx(f1, 58, 56, PAL.claw);

// 2. Lead arm (character's right arm, punching arm):
// COCKED/RETRACTED BACKWARD toward flank/torso preparing impact
fillRect(f1, 40, 64, 8, 8, PAL.suitBase);    // Shoulder/upper arm angled back
fillRect(f1, 38, 68, 6, 7, PAL.suitShadow);  // Elbow bent back behind torso
fillRect(f1, 44, 69, 7, 6, PAL.suitMid);     // Forearm pulled along ribs
fillRect(f1, 49, 70, 3, 5, PAL.shirtWhite);  // White cuff
drawClenchedFist(f1, 51, 71, "right");       // Fist drawn back, knuckles forward

blitToStrip(f1, 0);

// ------------------------------------------------------------------------------
// CUADRO 2: GOLPE BAJO ACTIVO (LOW PUNCH ACTIVE)
// Full horizontal extension forward at knee/shin height (y=70..75)
// Torso inclined forward, center of gravity low, feet planted
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 2: Low Punch Active (Extended)...');
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);

const DROP_C2 = 14;
const LEAN_C2 = 5; // Torso leaned forward +5px

// Feet: Back foot anchored at x=34..46, front foot planted forward at x=60..72
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) {
            // Anchor back foot as base, brace front foot forward +2px
            const destX = (x > 50) ? x + 2 : x;
            setPx(f2, destX, y, p);
        }
    }
}

// Tail extended low behind strike
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) {
            const destX = x - 2;
            const destY = Math.min(88, y + 4);
            setPx(f2, destX, destY, p);
        }
    }
}

// Dynamic lunge trousers
for (let destY = 78; destY < 83; destY++) {
    const t = (destY - 78) / (83 - 78);
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 1;
                else if (x > 54) destX = x + LEAN_C2;
                setPx(f2, destX, destY, p);
            }
        }
    }
}

// Upper body core (Head, mane, chest, tie) dropped by 14px and leaned forward by +5px
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            const destX = x + LEAN_C2;
            const destY = y + DROP_C2;
            setPx(f2, destX, destY, p);
        }
    }
}

// Seal waist seam
for (let y = 78; y <= 81; y++) {
    for (let x = 40 + LEAN_C2; x <= 66 + LEAN_C2; x++) {
        if (getPx(f2, x, y)[3] === 0) {
            const pAbove = getPx(f2, x, y - 1);
            if (pAbove[3] > 0) setPx(f2, x, y, pAbove);
        }
    }
}

// Rear guard arm (tucked at chest)
fillRect(f2, 50 + LEAN_C2 - 2, 60, 5, 8, PAL.suitShadow);
fillRect(f2, 51 + LEAN_C2 - 2, 57, 4, 3, PAL.shirtWhite);
fillRect(f2, 52 + LEAN_C2 - 2, 54, 5, 5, PAL.furBase);

// FULL HORIZONTAL LOW PUNCH EXTENSION AT KNEE/SHIN HEIGHT (y = 70..76)
const armY = 70;
const shoulderX = 54 + LEAN_C2; // ~59

// Shoulder and upper arm emerging from suit
fillRect(f2, shoulderX - 2, armY - 1, 6, 7, PAL.suitBase);
fillRect(f2, shoulderX, armY - 2, 4, 2, PAL.suitMid);

// Extended horizontal suit sleeve
fillRect(f2, shoulderX + 4, armY, 16, 6, PAL.suitBase);       // Sleeve body
fillRect(f2, shoulderX + 4, armY - 1, 16, 2, PAL.suitHi);     // Top fabric highlight
fillRect(f2, shoulderX + 4, armY + 5, 16, 2, PAL.suitShadow); // Bottom shadow crease
fillRect(f2, shoulderX + 8, armY + 2, 8, 2, PAL.suitMid);     // Crease line

// White shirt cuff at wrist
fillRect(f2, shoulderX + 20, armY, 3, 6, PAL.shirtWhite);
setPx(f2, shoulderX + 20, armY, PAL.shirtDark);
setPx(f2, shoulderX + 20, armY + 5, PAL.shirtDark);
setPx(f2, shoulderX + 21, armY + 2, PAL.black); // Cuff button

// Clenched golden lion fist with claws at knee height (y=69..76, x extends to ~89)
const fistX = shoulderX + 23; // ~82
fillRect(f2, fistX, armY - 1, 7, 8, PAL.furBase);
fillRect(f2, fistX + 1, armY - 2, 5, 2, PAL.furHi);     // Knuckle highlight
fillRect(f2, fistX, armY + 6, 7, 2, PAL.furDark);    // Lower shadow
// 4 sharp white claws thrust forward
setPx(f2, fistX + 6, armY, PAL.claw);
setPx(f2, fistX + 7, armY + 2, PAL.claw);
setPx(f2, fistX + 7, armY + 4, PAL.claw);
setPx(f2, fistX + 6, armY + 6, PAL.claw);
// Outline
fillRect(f2, fistX + 8, armY, 1, 7, PAL.black);

// Kinetic speed lines (punch force trail)
fillRect(f2, shoulderX + 10, armY + 2, 6, 1, PAL.shirtWhite, 160);
fillRect(f2, shoulderX + 14, armY + 4, 5, 1, PAL.furHi, 180);

blitToStrip(f2, 1);

// ------------------------------------------------------------------------------
// CUADRO 3: RECUPERACIÓN (LOW PUNCH RECOVERY)
// Arm retracting quickly towards chest, torso un-leaning back towards center
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 3: Low Punch Recovery...');
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);

const DROP_C3 = 13;
const LEAN_C3 = 2; // Reduced lean to +2px

// Feet
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f3, x, y, p);
    }
}

// Tail
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) {
            setPx(f3, x, Math.min(88, y + 5), p);
        }
    }
}

// Trousers
for (let destY = 79; destY < 83; destY++) {
    const t = (destY - 79) / (83 - 79);
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 1;
                else if (x > 54) destX = x + LEAN_C3;
                setPx(f3, destX, destY, p);
            }
        }
    }
}

// Upper body core dropped by 13px, leaned +2px
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f3, x + LEAN_C3, y + DROP_C3, p);
        }
    }
}

// Seal waist seam
for (let y = 78; y <= 81; y++) {
    for (let x = 40 + LEAN_C3; x <= 66 + LEAN_C3; x++) {
        if (getPx(f3, x, y)[3] === 0) {
            const pAbove = getPx(f3, x, y - 1);
            if (pAbove[3] > 0) setPx(f3, x, y, pAbove);
        }
    }
}

// Rear guard arm
fillRect(f3, 51 + LEAN_C3, 59, 5, 8, PAL.suitBase);
fillRect(f3, 52 + LEAN_C3, 56, 4, 3, PAL.shirtWhite);
fillRect(f3, 53 + LEAN_C3, 53, 5, 5, PAL.furBase);

// RETRACTING PUNCHING ARM: Elbow bending back, sleeve folding, fist halfway to chest
const retShoulderX = 54 + LEAN_C3;
fillRect(f3, retShoulderX - 1, armY - 1, 6, 7, PAL.suitBase);
// Forearm pulled halfway back
fillRect(f3, retShoulderX + 4, armY, 9, 6, PAL.suitBase);
fillRect(f3, retShoulderX + 4, armY - 1, 9, 2, PAL.suitHi);
fillRect(f3, retShoulderX + 4, armY + 5, 9, 2, PAL.suitShadow);
// Cuff
fillRect(f3, retShoulderX + 13, armY, 3, 6, PAL.shirtWhite);
// Fist pulled back to x ~ 70
drawClenchedFist(f3, retShoulderX + 15, armY, "right");

blitToStrip(f3, 2);

// ------------------------------------------------------------------------------
// CUADRO 4: FIN (LOW PUNCH RETURN / NEUTRAL CROUCH)
// Clean return to balanced neutral crouch posture
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 4: Low Punch End (Neutral Crouch)...');
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);

const DROP_C4 = 13;

// Feet
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f4, x, y, p);
    }
}

// Tail
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) {
            setPx(f4, x, Math.min(88, y + 5), p);
        }
    }
}

// Trousers
for (let destY = 79; destY < 83; destY++) {
    const t = (destY - 79) / (83 - 79);
    const srcY = Math.round(72 + t * 10);
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, srcY) && !(x < 37 && srcY >= 75)) {
            const p = getPx(base, x, srcY);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 2;
                else if (x > 54) destX = x + 2;
                setPx(f4, destX, destY, p);
            }
        }
    }
}

// Upper body core
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f4, x, y + DROP_C4, p);
        }
    }
}

// Seal waist seam
for (let y = 78; y <= 80; y++) {
    for (let x = 40; x <= 66; x++) {
        if (getPx(f4, x, y)[3] === 0) {
            const pAbove = getPx(f4, x, y - 1);
            if (pAbove[3] > 0) setPx(f4, x, y, pAbove);
        }
    }
}

// Compact crouch guard arms
// Left guard arm
fillRect(f4, 38, 62, 7, 7, PAL.suitBase);
fillRect(f4, 40, 68, 4, 3, PAL.shirtWhite);
drawClenchedFist(f4, 41, 70, "right");

// Right guard arm
fillRect(f4, 56, 61, 7, 7, PAL.suitBase);
fillRect(f4, 58, 67, 4, 3, PAL.shirtWhite);
drawClenchedFist(f4, 59, 69, "left");

blitToStrip(f4, 3);

// ------------------------------------------------------------------------------
// CUADRO 5: ENTRADA A GUARDIA / BLOQUEO (BLOCK ENTRY)
// Standing stance, arms crossing in front of face and chest into X-guard
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 5: Block Entry (Crossing X)...');
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);

// Feet at ground y=89
for (let y = 83; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f5, x, y, p);
    }
}

// Trousers & Legs
for (let y = 72; y < 83; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, y)) {
            const p = getPx(base, x, y);
            if (p[3] > 0) setPx(f5, x, y, p);
        }
    }
}

// Tail
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) setPx(f5, x, y, p);
    }
}

// Upper body core (Head, mane, chest, tie) at standing height, excluding old arms
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f5, x, y, p);
        }
    }
}

// Crossing arms into X-guard:
// Left forearm crossing diagonally up-right across chest
for (let step = 0; step < 12; step++) {
    const ax = 46 + step;
    const ay = 60 - Math.round(step * 0.9);
    fillRect(f5, ax, ay, 5, 5, PAL.suitBase);
    setPx(f5, ax + 1, ay, PAL.suitHi);
    setPx(f5, ax + 1, ay + 4, PAL.suitShadow);
}
// Right forearm crossing diagonally up-left across chest
for (let step = 0; step < 13; step++) {
    const bx = 66 - step;
    const by = 58 - Math.round(step * 0.9);
    fillRect(f5, bx, by, 5, 5, PAL.suitMid);
    setPx(f5, bx + 1, by, PAL.suitHi);
    setPx(f5, bx + 1, by + 4, PAL.suitShadow);
}

// White shirt cuffs at wrists
fillRect(f5, 55, 48, 3, 5, PAL.shirtWhite);
fillRect(f5, 58, 46, 3, 5, PAL.shirtWhite);

// Clenched golden lion fists at the upper ends of the X
drawClenchedFist(f5, 53, 44, "right");
drawClenchedFist(f5, 61, 43, "left");

blitToStrip(f5, 4);

// ------------------------------------------------------------------------------
// CUADRO 6: POSTURA DE BLOQUEO FIRME (FIRM BLOCK HOLD)
// Knees flexed 2px, solid locked X-guard firmly protecting torso and head
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 6: Firm Block Hold...');
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);

const DROP_B6 = 2; // 2px knee flexion

// Feet firmly on ground y=89
for (let y = 84; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f6, x, y, p);
    }
}

// Flexed trousers
for (let y = 72 + DROP_B6; y < 84; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, y - DROP_B6)) {
            const p = getPx(base, x, y - DROP_B6);
            if (p[3] > 0) {
                let destX = x;
                if (x < 50) destX = x - 1;
                else if (x > 54) destX = x + 1;
                setPx(f6, destX, y, p);
            }
        }
    }
}

// Tail
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) setPx(f6, x, Math.min(88, y + 1), p);
    }
}

// Upper body core lowered by 2px
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f6, x, y + DROP_B6, p);
        }
    }
}

// Solid locked X-cross-guard (firmly planted, reinforced)
// Left forearm diagonal
for (let step = 0; step < 14; step++) {
    const ax = 45 + step;
    const ay = 61 + DROP_B6 - Math.round(step * 0.95);
    fillRect(f6, ax, ay, 6, 6, PAL.suitBase);
    fillRect(f6, ax + 1, ay, 4, 2, PAL.suitHi);
    fillRect(f6, ax + 1, ay + 4, 4, 2, PAL.suitShadow);
}
// Right forearm diagonal crossing over
for (let step = 0; step < 14; step++) {
    const bx = 67 - step;
    const by = 59 + DROP_B6 - Math.round(step * 0.95);
    fillRect(f6, bx, by, 6, 6, PAL.suitMid);
    fillRect(f6, bx + 1, by, 4, 2, PAL.suitHi);
    fillRect(f6, bx + 1, by + 4, 4, 2, PAL.suitShadow);
}

// White shirt cuffs
fillRect(f6, 54, 47 + DROP_B6, 4, 5, PAL.shirtWhite);
fillRect(f6, 58, 45 + DROP_B6, 4, 5, PAL.shirtWhite);

// Clenched golden lion fists locked at upper ends
drawClenchedFist(f6, 51, 43 + DROP_B6, "right");
drawClenchedFist(f6, 62, 42 + DROP_B6, "left");

blitToStrip(f6, 5);

// ------------------------------------------------------------------------------
// CUADRO 7: IMPACTO ABSORBIDO (BLOCK IMPACT RECOIL + ARCADE SPARKS)
// 2px pushback recoil (shiftX = -2), bright arcade pixel sparks on forearms
// ------------------------------------------------------------------------------
console.log('Generating Cuadro 7: Block Impact Absorbed...');
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);

const RECOIL_X = -2; // 2px recoil pushback
const DROP_B7 = 2;

// Feet firmly on ground y=89, shifted -2px
for (let y = 84; y <= 89; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f7, x + RECOIL_X, y, p);
    }
}

// Trousers & Legs shifted -2px
for (let y = 72 + DROP_B7; y < 84; y++) {
    for (let x = 0; x < CELL; x++) {
        if (!isUpperBody(x, y - DROP_B7)) {
            const p = getPx(base, x, y - DROP_B7);
            if (p[3] > 0) {
                let destX = x + RECOIL_X;
                if (x < 50) destX = x - 1 + RECOIL_X;
                else if (x > 54) destX = x + 1 + RECOIL_X;
                setPx(f7, destX, y, p);
            }
        }
    }
}

// Tail shifted -2px
for (let y = 74; y <= 89; y++) {
    for (let x = 19; x <= 37; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0 && !isUpperBody(x, y)) {
            setPx(f7, x + RECOIL_X, Math.min(88, y + 1), p);
        }
    }
}

// Upper body core shifted -2px and dropped 2px
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        if (isUpperBody(x, y) && !isOldArm(x, y)) {
            const p = getPx(base, x, y);
            setPx(f7, x + RECOIL_X, y + DROP_B7, p);
        }
    }
}

// Crossed forearms absorbing kinetic shock
for (let step = 0; step < 14; step++) {
    const ax = 45 + step + RECOIL_X;
    const ay = 61 + DROP_B7 - Math.round(step * 0.95);
    fillRect(f7, ax, ay, 6, 6, PAL.suitBase);
    fillRect(f7, ax + 1, ay, 4, 2, PAL.suitHi);
    fillRect(f7, ax + 1, ay + 4, 4, 2, PAL.suitShadow);
}
for (let step = 0; step < 14; step++) {
    const bx = 67 - step + RECOIL_X;
    const by = 59 + DROP_B7 - Math.round(step * 0.95);
    fillRect(f7, bx, by, 6, 6, PAL.suitMid);
    fillRect(f7, bx + 1, by, 4, 2, PAL.suitHi);
    fillRect(f7, bx + 1, by + 4, 4, 2, PAL.suitShadow);
}

// Cuffs & Fists
fillRect(f7, 54 + RECOIL_X, 47 + DROP_B7, 4, 5, PAL.shirtWhite);
fillRect(f7, 58 + RECOIL_X, 45 + DROP_B7, 4, 5, PAL.shirtWhite);
drawClenchedFist(f7, 51 + RECOIL_X, 43 + DROP_B7, "right");
drawClenchedFist(f7, 62 + RECOIL_X, 42 + DROP_B7, "left");

// IMPACT FLASH & PIXEL SPARKS (Contact point on crossed forearms)
const impactX = 63 + RECOIL_X; // ~61
const impactY = 51 + DROP_B7;  // ~53
drawBlockSparks(f7, impactX, impactY);

blitToStrip(f7, 6);

// ------------------------------------------------------------------------------
// SAVE STRIP AND VALIDATE
// ------------------------------------------------------------------------------
const outDir1 = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites';
const outDir2 = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites';

const stripFileName = 'leon_spritestrip_low_punch_block_96x96.png';
const outPath1 = path.join(outDir1, stripFileName);
const outPath2 = path.join(outDir2, stripFileName);

const pngBuffer = PNG.sync.write(strip);
fs.writeFileSync(outPath1, pngBuffer);
if (fs.existsSync(outDir2)) {
    fs.writeFileSync(outPath2, pngBuffer);
}

console.log('==================================================================');
console.log('✅ Sprite Strip 96x96 de 7 Cuadros generado con éxito:');
console.log('   - Ancho:', strip.width, 'px (7 celdas de 96px)');
console.log('   - Alto:', strip.height, 'px');
console.log('   - Ruta 1:', outPath1);
console.log('   - Ruta 2:', outPath2);
console.log('==================================================================');
