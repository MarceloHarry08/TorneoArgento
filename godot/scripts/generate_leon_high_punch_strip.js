// TORNEO ARGENTO 16-BIT - Ground Truth Identity HIGH PUNCH Sprite Strip Generator
// Generates a 4-frame horizontal sprite strip (384 x 96 px) on a strict 96x96 grid.
//
// Identity reference: el_leon_base.png (mane brown, black formal suit, white shirt, dark tie, 16-bit pixel art)
// Frames:
//   1. Cuadro 1 - Anticipación (Startup): Lean forward on front leg, rear arm fully cocked back, front arm in guard.
//   2. Cuadro 2 - Impacto (Active Frame): Rear arm fully extended horizontally at head height, body twisted for max reach.
//   3. Cuadro 3 - Recuperación 1 (Recovery): Fist retracting quickly, body un-twisting and returning towards vertical.
//   4. Cuadro 4 - Retorno (Final Recovery): Arms returning to ready guard, body recentered and balanced.

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const CELL = 96;
const FRAMES = 4;
const STRIP_WIDTH = FRAMES * CELL; // 384 px
const STRIP_HEIGHT = CELL;          // 96 px
const GROUND_Y = 89;                // Baseline sole of feet

const strip = new PNG({ width: STRIP_WIDTH, height: STRIP_HEIGHT });
strip.data.fill(0); // 100% Transparent

// Exact Ground Truth Palette Swatches
const PAL = {
    // Outlines & Shadows
    black: [0, 0, 0],
    darkOutline: [16, 14, 18],
    deepShadow: [10, 8, 10],

    // Formal Black Suit
    suitDark: [22, 21, 24],
    suitBase: [30, 29, 34],
    suitMid: [42, 40, 48],
    suitHi: [58, 56, 66],
    suitCrease: [76, 74, 86],

    // White Shirt & Cuffs
    shirtBase: [244, 246, 248],
    shirtShadow: [182, 184, 194],
    shirtDark: [134, 136, 146],

    // Dark Purple/Navy Tie
    tieDark: [28, 24, 38],
    tieBase: [46, 40, 64],
    tieMid: [62, 54, 88],
    tieHi: [82, 72, 114],

    // Mane (Warm Brown / Lion Locks)
    maneDeep: [44, 24, 12],
    maneShadow: [72, 40, 20],
    maneBase: [114, 68, 35],
    maneMid: [152, 94, 50],
    maneHi: [188, 124, 72],
    maneLight: [218, 152, 92],

    // Golden Lion Fur / Skin
    furDark: [148, 88, 32],
    furBase: [214, 144, 58],
    furMid: [238, 172, 78],
    furHi: [252, 196, 100],

    // Muzzle & Snout
    muzzleBase: [244, 230, 198],
    muzzleShadow: [218, 200, 164],
    nose: [26, 18, 20],
    mouth: [18, 12, 14],

    // Eyes
    eyeWhite: [255, 255, 255],
    eyePupil: [12, 10, 10],

    // Claws & Details
    claw: [252, 250, 240],
    shoes: [16, 15, 18],
    shoesHi: [44, 42, 50]
};

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

// Draw authentic Lion Head matching ground truth features
function drawLionHead(png, ox, oy, opt = {}) {
    const lean = opt.lean || 0;
    const pitch = opt.pitch || 0;

    // 1. Mane silhouette & volume (Back and top locks)
    // Top tufts/locks
    fillRect(png, ox - 14 + lean, oy - 22 + pitch, 28, 6, PAL.maneBase);
    fillRect(png, ox - 12 + lean, oy - 24 + pitch, 24, 4, PAL.maneMid);
    fillRect(png, ox - 8 + lean, oy - 26 + pitch, 16, 4, PAL.maneHi);
    // Spiky top tufts
    setPx(png, ox - 10 + lean, oy - 27 + pitch, PAL.maneHi);
    setPx(png, ox - 6 + lean, oy - 28 + pitch, PAL.maneLight);
    setPx(png, ox - 2 + lean, oy - 28 + pitch, PAL.maneHi);
    setPx(png, ox + 3 + lean, oy - 27 + pitch, PAL.maneLight);
    setPx(png, ox + 7 + lean, oy - 27 + pitch, PAL.maneHi);

    // Outer voluminous mane
    fillRect(png, ox - 18 + lean, oy - 18 + pitch, 36, 32, PAL.maneShadow);
    fillRect(png, ox - 16 + lean, oy - 20 + pitch, 32, 34, PAL.maneBase);
    fillRect(png, ox - 14 + lean, oy - 18 + pitch, 28, 30, PAL.maneMid);
    // Mane highlights on right/front
    fillRect(png, ox + 4 + lean, oy - 16 + pitch, 8, 24, PAL.maneHi);
    fillRect(png, ox + 8 + lean, oy - 12 + pitch, 5, 18, PAL.maneLight);
    // Back mane spikes
    setPx(png, ox - 19 + lean, oy - 10 + pitch, PAL.maneDeep);
    setPx(png, ox - 20 + lean, oy - 4 + pitch, PAL.maneDeep);
    setPx(png, ox - 19 + lean, oy + 4 + pitch, PAL.maneDeep);
    setPx(png, ox - 17 + lean, oy + 10 + pitch, PAL.maneDeep);

    // 2. Rounded lion ear
    fillRect(png, ox - 8 + lean, oy - 20 + pitch, 6, 6, PAL.maneDeep);
    fillRect(png, ox - 7 + lean, oy - 19 + pitch, 4, 4, PAL.furMid);
    fillRect(png, ox - 6 + lean, oy - 18 + pitch, 2, 2, PAL.muzzleBase);

    // 3. Golden face / Cranium
    fillRect(png, ox - 4 + lean, oy - 12 + pitch, 18, 22, PAL.furDark);
    fillRect(png, ox - 2 + lean, oy - 10 + pitch, 16, 20, PAL.furBase);
    fillRect(png, ox + 1 + lean, oy - 8 + pitch, 12, 16, PAL.furMid);
    fillRect(png, ox + 3 + lean, oy - 6 + pitch, 8, 12, PAL.furHi);

    // 4. Snout / Muzzle
    const snoutX = ox + 6 + lean;
    const snoutY = oy - 2 + pitch;
    fillRect(png, snoutX, snoutY, 11, 10, PAL.muzzleShadow);
    fillRect(png, snoutX + 1, snoutY + 1, 9, 8, PAL.muzzleBase);
    // Black nose tip
    fillRect(png, snoutX + 8, snoutY, 4, 4, PAL.nose);
    fillRect(png, snoutX + 9, snoutY + 1, 2, 2, PAL.black);
    // Whiskers line / mouth
    fillRect(png, snoutX + 4, snoutY + 5, 6, 2, PAL.mouth);
    fillRect(png, snoutX + 6, snoutY + 7, 4, 2, PAL.maneShadow);

    // 5. Intense Eyes
    const eyeX = ox + 3 + lean;
    const eyeY = oy - 8 + pitch;
    // Eyebrow ridge
    fillRect(png, eyeX - 2, eyeY - 2, 8, 2, PAL.maneDeep);
    // White eye with dark pupil
    fillRect(png, eyeX, eyeY, 5, 3, PAL.eyeWhite);
    setPx(png, eyeX + 2, eyeY + 1, PAL.eyePupil);
    setPx(png, eyeX + 3, eyeY + 1, PAL.eyePupil);
    // Eye slit outline
    setPx(png, eyeX - 1, eyeY, PAL.darkOutline);
    setPx(png, eyeX + 5, eyeY, PAL.darkOutline);

    // 6. Chin beard of the mane (under jaw)
    fillRect(png, ox + lean, oy + 8 + pitch, 14, 10, PAL.maneBase);
    fillRect(png, ox + 2 + lean, oy + 10 + pitch, 10, 8, PAL.maneShadow);
    fillRect(png, ox + 4 + lean, oy + 12 + pitch, 6, 6, PAL.maneDeep);
}

// Draw Feline Tail with organic tuft
function drawTail(png, ox, oy, pose = "normal") {
    let pts = [];
    if (pose === "startup") {
        // Coiled tension: tail angled down then whipping up
        pts = [
            [ox - 10, oy + 6], [ox - 14, oy + 10], [ox - 18, oy + 14],
            [ox - 22, oy + 16], [ox - 26, oy + 14], [ox - 28, oy + 10]
        ];
    } else if (pose === "active") {
        // Taut extension behind the strike
        pts = [
            [ox - 12, oy + 8], [ox - 17, oy + 10], [ox - 22, oy + 11],
            [ox - 27, oy + 10], [ox - 31, oy + 7], [ox - 34, oy + 3]
        ];
    } else if (pose === "recovery") {
        pts = [
            [ox - 10, oy + 6], [ox - 15, oy + 9], [ox - 19, oy + 13],
            [ox - 23, oy + 16], [ox - 26, oy + 17], [ox - 29, oy + 15]
        ];
    } else {
        // Neutral ready curve
        pts = [
            [ox - 10, oy + 6], [ox - 14, oy + 9], [ox - 18, oy + 13],
            [ox - 21, oy + 18], [ox - 20, oy + 22], [ox - 17, oy + 24]
        ];
    }

    // Draw tail segments
    for (const p of pts) {
        fillRect(png, p[0], p[1], 3, 3, PAL.furBase);
        setPx(png, p[0], p[1] + 2, PAL.furDark);
    }
    // Tail fluffy tuft at the tip
    const tip = pts[pts.length - 1];
    fillRect(png, tip[0] - 2, tip[1] - 2, 6, 6, PAL.maneBase);
    fillRect(png, tip[0] - 1, tip[1] - 1, 4, 4, PAL.maneHi);
    fillRect(png, tip[0], tip[1], 2, 2, PAL.maneLight);
}

// Draw paws/feet planted on ground baseline
function drawPaws(png, xFront, xBack, yBase = GROUND_Y) {
    // Back paw
    fillRect(png, xBack - 2, yBase - 6, 12, 6, PAL.furBase);
    fillRect(png, xBack, yBase - 7, 8, 2, PAL.furHi);
    setPx(png, xBack + 1, yBase - 1, PAL.claw);
    setPx(png, xBack + 4, yBase - 1, PAL.claw);
    setPx(png, xBack + 7, yBase - 1, PAL.claw);
    fillRect(png, xBack - 2, yBase, 12, 1, PAL.darkOutline);

    // Front paw
    fillRect(png, xFront - 2, yBase - 6, 14, 6, PAL.furBase);
    fillRect(png, xFront, yBase - 7, 10, 2, PAL.furHi);
    setPx(png, xFront + 2, yBase - 1, PAL.claw);
    setPx(png, xFront + 5, yBase - 1, PAL.claw);
    setPx(png, xFront + 8, yBase - 1, PAL.claw);
    fillRect(png, xFront - 2, yBase, 14, 1, PAL.darkOutline);
}

// Draw a clenched lion fist with white cuff and claws
function drawClenchedFist(png, fx, fy, facingRight = true) {
    // White shirt cuff
    const cuffX = facingRight ? fx - 4 : fx + 6;
    fillRect(png, cuffX, fy - 1, 4, 8, PAL.shirtBase);
    setPx(png, cuffX, fy - 1, PAL.shirtDark);
    setPx(png, cuffX, fy + 6, PAL.shirtDark);

    // Clenched fur paw
    fillRect(png, fx, fy - 2, 8, 9, PAL.furBase);
    fillRect(png, fx + 1, fy - 3, 6, 2, PAL.furHi);
    fillRect(png, fx + 1, fy - 1, 6, 6, PAL.furMid);
    // Knuckles / fingers crease
    for (let k = 0; k < 3; k++) {
        setPx(png, fx + (facingRight ? 7 : 0), fy + k * 2, PAL.claw);
        setPx(png, fx + (facingRight ? 8 : -1), fy + k * 2, PAL.claw);
        setPx(png, fx + 4, fy + k * 2 + 1, PAL.furDark);
    }
    // Outline
    for (let dy = -2; dy <= 7; dy++) {
        setPx(png, fx - 1, fy + dy, PAL.darkOutline);
        setPx(png, fx + 8, fy + dy, PAL.darkOutline);
    }
}

// ==============================================================================
// 1. CUADRO 1: ANTICIPACIÓN (STARTUP)
// Leans forward on front leg, rear punching arm cocked back near body, front guard high
// ==============================================================================
function buildFrame1() {
    const png = new PNG({ width: CELL, height: CELL });
    png.data.fill(0);

    const ox = 44;
    const oy = 32;

    // Tail (tension)
    drawTail(png, ox - 4, oy + 32, "startup");

    // Legs: Front knee bent deeply, back leg extended back
    // Back leg (trousers)
    fillRect(png, ox - 14, oy + 36, 10, 20, PAL.suitDark);
    fillRect(png, ox - 16, oy + 48, 8, 10, PAL.suitBase);
    // Front leg (trousers) - bent forward supporting weight
    fillRect(png, ox + 6, oy + 34, 13, 22, PAL.suitBase);
    fillRect(png, ox + 8, oy + 34, 3, 22, PAL.suitHi);
    fillRect(png, ox + 10, oy + 50, 11, 8, PAL.suitBase);

    // Feet planted
    drawPaws(png, ox + 14, ox - 12);

    // Torso: Arched forward ~15 degrees
    // Jacket base
    fillRect(png, ox - 8, oy + 16, 26, 24, PAL.suitDark);
    fillRect(png, ox - 5, oy + 14, 22, 24, PAL.suitBase);
    fillRect(png, ox - 2, oy + 14, 18, 22, PAL.suitHi);
    // Lapels & Collar
    fillRect(png, ox + 2, oy + 14, 4, 18, PAL.suitDark);
    fillRect(png, ox + 12, oy + 14, 4, 16, PAL.suitDark);

    // White Shirt V-neck
    fillRect(png, ox + 6, oy + 14, 6, 16, PAL.shirtBase);
    fillRect(png, ox + 7, oy + 16, 4, 14, PAL.shirtShadow);

    // Dark Purple/Navy Tie (hanging diagonally forward)
    for (let dy = 0; dy < 14; dy++) {
        const tx = ox + 8 + Math.round(dy * 0.15);
        setPx(png, tx, oy + 16 + dy, PAL.tieMid);
        setPx(png, tx + 1, oy + 16 + dy, PAL.tieHi);
        setPx(png, tx + 2, oy + 16 + dy, PAL.tieDark);
    }

    // REAR PUNCHING ARM (Character's right arm): Retracted back, elbow cocked behind!
    // Shoulder to elbow pulled far back (x from ox-4 back to ox-16)
    for (let step = 0; step < 12; step++) {
        const ax = ox - 4 - step;
        const ay = oy + 18 + Math.round(step * 0.4);
        fillRect(png, ax, ay, 4, 7, PAL.suitDark);
        setPx(png, ax, ay, PAL.suitHi);
    }
    // Forearm cocked forward to fist
    for (let step = 0; step < 10; step++) {
        const ax = ox - 16 + step;
        const ay = oy + 22 + Math.round(step * 0.2);
        fillRect(png, ax, ay, 4, 7, PAL.suitBase);
    }
    // Clenched fist at the hip/ribs
    drawClenchedFist(png, ox - 6, oy + 23, true);

    // Head & Mane (tilted forward, aggressive glare)
    drawLionHead(png, ox + 4, oy, { lean: 2, pitch: 2 });

    // FRONT GUARD ARM (Character's left arm): Forearm raised protecting chin/face!
    // Upper arm from shoulder (ox+12)
    fillRect(png, ox + 12, oy + 18, 7, 8, PAL.suitBase);
    // Forearm angled upward in front of jaw
    for (let dy = 0; dy < 12; dy++) {
        const ax = ox + 16 + Math.round(dy * 0.3);
        const ay = oy + 22 - dy;
        fillRect(png, ax, ay, 6, 4, PAL.suitBase);
        setPx(png, ax + 2, ay, PAL.suitHi);
    }
    // Front fist guarding face
    drawClenchedFist(png, ox + 19, oy + 8, true);

    return png;
}

// ==============================================================================
// 2. CUADRO 2: IMPACTO (ACTIVE FRAME - FULL HORIZONTAL HIGH PUNCH)
// Rear arm fully extended horizontally at head height, torso twisted, reach maximized
// ==============================================================================
function buildFrame2() {
    const png = new PNG({ width: CELL, height: CELL });
    png.data.fill(0);

    const ox = 42;
    const oy = 28;

    // Tail (taut thrust)
    drawTail(png, ox - 8, oy + 36, "active");

    // Legs: Stride lunge - back leg straight and driving, front leg braced
    // Back driving leg
    fillRect(png, ox - 18, oy + 40, 14, 18, PAL.suitDark);
    fillRect(png, ox - 22, oy + 50, 10, 10, PAL.suitBase);
    // Front braced leg
    fillRect(png, ox + 6, oy + 38, 14, 22, PAL.suitBase);
    fillRect(png, ox + 8, oy + 38, 3, 22, PAL.suitHi);
    fillRect(png, ox + 10, oy + 52, 12, 8, PAL.suitBase);

    // Feet planted
    drawPaws(png, ox + 16, ox - 18);

    // Torso: Strong torsion (punching shoulder thrust forward!)
    fillRect(png, ox - 8, oy + 18, 28, 24, PAL.suitDark);
    fillRect(png, ox - 4, oy + 16, 24, 24, PAL.suitBase);
    fillRect(png, ox, oy + 16, 20, 22, PAL.suitHi);

    // Lapels & Shirt twisted to profile
    fillRect(png, ox + 6, oy + 16, 6, 16, PAL.shirtBase);
    fillRect(png, ox + 8, oy + 18, 4, 14, PAL.shirtShadow);

    // Tie whipped back from the forward thrust
    for (let dy = 0; dy < 14; dy++) {
        const tx = ox + 9 - Math.round(dy * 0.3);
        setPx(png, tx, oy + 18 + dy, PAL.tieMid);
        setPx(png, tx + 1, oy + 18 + dy, PAL.tieHi);
        setPx(png, tx + 2, oy + 18 + dy, PAL.tieDark);
    }

    // NON-STRIKING ARM (Snapped back to ribs chambered for torque)
    fillRect(png, ox - 12, oy + 24, 10, 6, PAL.suitDark);
    drawClenchedFist(png, ox - 16, oy + 24, false);

    // Head & Mane: Head at ox+6, mane flowing back from explosive speed
    drawLionHead(png, ox + 6, oy + 2, { lean: 4, pitch: 1 });

    // ==========================================================================
    // STRIKING ARM: FULLY EXTENDED HORIZONTALLY AT HEAD HEIGHT (y=28..34)
    // Shoulder (ox+16) -> Forearm -> Cuff (ox+34) -> Fist (ox+38..48)
    // ==========================================================================
    const armY = oy + 4; // Head level: y = 32

    // Shoulder joint & upper arm sleeve
    fillRect(png, ox + 14, armY - 3, 10, 9, PAL.suitBase);
    fillRect(png, ox + 14, armY - 4, 10, 2, PAL.suitHi);
    // Extended horizontal sleeve (clean 16-bit jacket folds)
    fillRect(png, ox + 22, armY - 3, 16, 8, PAL.suitBase);
    fillRect(png, ox + 22, armY - 4, 16, 2, PAL.suitHi); // Upper crease highlight
    fillRect(png, ox + 22, armY + 4, 16, 2, PAL.suitDark); // Lower shadow

    // Crisp white shirt cuff
    fillRect(png, ox + 37, armY - 3, 4, 8, PAL.shirtBase);
    fillRect(png, ox + 38, armY - 2, 2, 6, PAL.shirtShadow);

    // CLENCHED CLAWED LION FIST EXTENDED (reaching ox+41 to ox+51 = x=83..93!)
    const fistX = ox + 41;
    fillRect(png, fistX, armY - 4, 10, 10, PAL.furBase);
    fillRect(png, fistX + 1, armY - 5, 8, 2, PAL.furHi);
    fillRect(png, fistX + 2, armY - 3, 6, 7, PAL.furMid);
    // Front knuckles & gleaming sharp claws
    for (let k = -2; k <= 2; k += 2) {
        setPx(png, fistX + 9, armY + k, PAL.claw);
        setPx(png, fistX + 10, armY + k, [255, 255, 255]);
        setPx(png, fistX + 11, armY + k, [255, 255, 255]); // Claw gleam
        setPx(png, fistX + 7, armY + k + 1, PAL.furDark);
    }
    // Fist outline
    for (let dy = -4; dy <= 6; dy++) {
        setPx(png, fistX - 1, armY + dy, PAL.darkOutline);
        setPx(png, fistX + 10, armY + dy, PAL.darkOutline);
    }

    return png;
}

// ==============================================================================
// 3. CUADRO 3: RECUPERACIÓN 1 (RECOVERY)
// Punching arm retracting rapidly, body un-twisting and returning to upright
// ==============================================================================
function buildFrame3() {
    const png = new PNG({ width: CELL, height: CELL });
    png.data.fill(0);

    const ox = 43;
    const oy = 30;

    // Tail (recoil settling)
    drawTail(png, ox - 6, oy + 34, "recovery");

    // Legs: Weight shifting back towards center
    // Back leg
    fillRect(png, ox - 14, oy + 38, 12, 18, PAL.suitDark);
    fillRect(png, ox - 16, oy + 50, 10, 10, PAL.suitBase);
    // Front leg
    fillRect(png, ox + 6, oy + 36, 13, 22, PAL.suitBase);
    fillRect(png, ox + 8, oy + 36, 3, 22, PAL.suitHi);
    fillRect(png, ox + 10, oy + 52, 11, 8, PAL.suitBase);

    // Feet planted
    drawPaws(png, ox + 14, ox - 14);

    // Torso: Returning to upright
    fillRect(png, ox - 8, oy + 16, 26, 24, PAL.suitDark);
    fillRect(png, ox - 4, oy + 15, 22, 24, PAL.suitBase);
    fillRect(png, ox, oy + 15, 18, 22, PAL.suitHi);

    // Lapels & Shirt
    fillRect(png, ox + 4, oy + 15, 6, 16, PAL.shirtBase);
    fillRect(png, ox + 6, oy + 17, 4, 14, PAL.shirtShadow);

    // Tie settling
    for (let dy = 0; dy < 14; dy++) {
        const tx = ox + 7;
        setPx(png, tx, oy + 17 + dy, PAL.tieMid);
        setPx(png, tx + 1, oy + 17 + dy, PAL.tieHi);
        setPx(png, tx + 2, oy + 17 + dy, PAL.tieDark);
    }

    // RETRACTING PUNCHING ARM: Elbow bending back, fist pulled halfway to chest
    // Upper arm from shoulder (ox+14, oy+18) to elbow (ox+26, oy+22)
    fillRect(png, ox + 14, oy + 16, 12, 8, PAL.suitBase);
    fillRect(png, ox + 14, oy + 15, 12, 2, PAL.suitHi);
    // Forearm angled inward: elbow (ox+26) back to fist (ox+22)
    fillRect(png, ox + 22, oy + 18, 6, 8, PAL.suitBase);
    // Retracting fist at ox+24, oy+18
    drawClenchedFist(png, ox + 24, oy + 18, true);

    // Head & Mane: Head upright, eyes forward
    drawLionHead(png, ox + 2, oy, { lean: 1, pitch: 0 });

    // Front arm (moving forward from hip towards guard)
    fillRect(png, ox - 6, oy + 20, 8, 8, PAL.suitDark);
    drawClenchedFist(png, ox - 8, oy + 22, false);

    return png;
}

// ==============================================================================
// 4. CUADRO 4: RETORNO (FINAL RECOVERY)
// Both arms return to ready guard, body recentered and balanced
// ==============================================================================
function buildFrame4() {
    const png = new PNG({ width: CELL, height: CELL });
    png.data.fill(0);

    const ox = 44;
    const oy = 32;

    // Tail (relaxed ready curve)
    drawTail(png, ox - 4, oy + 32, "normal");

    // Legs: Balanced neutral ready stance
    // Back leg
    fillRect(png, ox - 12, oy + 36, 11, 22, PAL.suitDark);
    fillRect(png, ox - 14, oy + 50, 10, 8, PAL.suitBase);
    // Front leg
    fillRect(png, ox + 4, oy + 36, 12, 22, PAL.suitBase);
    fillRect(png, ox + 6, oy + 36, 3, 22, PAL.suitHi);
    fillRect(png, ox + 6, oy + 50, 11, 8, PAL.suitBase);

    // Feet planted
    drawPaws(png, ox + 10, ox - 12);

    // Torso: Vertical, balanced
    fillRect(png, ox - 8, oy + 16, 26, 24, PAL.suitDark);
    fillRect(png, ox - 4, oy + 14, 22, 24, PAL.suitBase);
    fillRect(png, ox, oy + 14, 18, 22, PAL.suitHi);

    // Lapels & Shirt
    fillRect(png, ox + 3, oy + 14, 7, 16, PAL.shirtBase);
    fillRect(png, ox + 5, oy + 16, 5, 14, PAL.shirtShadow);

    // Tie vertical
    for (let dy = 0; dy < 14; dy++) {
        const tx = ox + 6;
        setPx(png, tx, oy + 16 + dy, PAL.tieMid);
        setPx(png, tx + 1, oy + 16 + dy, PAL.tieHi);
        setPx(png, tx + 2, oy + 16 + dy, PAL.tieDark);
    }

    // Rear arm returned to relaxed ready angle at side
    fillRect(png, ox - 10, oy + 18, 7, 14, PAL.suitDark);
    drawClenchedFist(png, ox - 12, oy + 28, false);

    // Head & Mane: Neutral forward gaze
    drawLionHead(png, ox, oy, { lean: 0, pitch: 0 });

    // Front arm returned to front ready guard
    fillRect(png, ox + 10, oy + 18, 7, 12, PAL.suitBase);
    fillRect(png, ox + 12, oy + 18, 2, 12, PAL.suitHi);
    drawClenchedFist(png, ox + 12, oy + 28, true);

    return png;
}

// ==============================================================================
// ASSEMBLE 4-FRAME SPRITE STRIP (384 x 96 px)
// ==============================================================================
console.log('Generating High Punch 4-frame sprite strip...');
const f1 = buildFrame1();
const f2 = buildFrame2();
const f3 = buildFrame3();
const f4 = buildFrame4();

const frames = [f1, f2, f3, f4];

for (let idx = 0; idx < FRAMES; idx++) {
    const fPng = frames[idx];
    const startX = idx * CELL;
    for (let y = 0; y < CELL; y++) {
        for (let x = 0; x < CELL; x++) {
            const sIdx = (y * CELL + x) << 2;
            const a = fPng.data[sIdx + 3];
            if (a === 0) continue;
            const dIdx = (y * STRIP_WIDTH + (startX + x)) << 2;
            strip.data[dIdx] = fPng.data[sIdx];
            strip.data[dIdx + 1] = fPng.data[sIdx + 1];
            strip.data[dIdx + 2] = fPng.data[sIdx + 2];
            strip.data[dIdx + 3] = a;
        }
    }
    // Also save individual frame for inspection
    fs.writeFileSync(`C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_high_punch_f${idx + 1}.png`, PNG.sync.write(fPng));
}

const outPath = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_high_punch_96x96.png';
fs.writeFileSync(outPath, PNG.sync.write(strip));
console.log('Saved 4-frame High Punch strip to:', outPath);

// Copy to artifacts
const artifactDir = 'C:/Users/marce/.gemini/antigravity-ide/brain/a8b10b9e-0949-4eae-8bf9-dd46681472bf';
fs.writeFileSync(path.join(artifactDir, 'leon_spritestrip_high_punch_96x96.png'), PNG.sync.write(strip));
console.log('Copied to artifacts directory.');
