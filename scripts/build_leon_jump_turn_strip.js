// ==============================================================================
// TORNEO ARGENTO 16-BIT - EL LEÓN: JUMP & TURNAROUND SPRITE STRIP GENERATOR
// Strict 96x96 Grid | Total: 6 Cells (576 x 96 px) | 100% Transparent PNG Background
// Foot ground baseline anchored firmly at y = 89 (Airborne frames elevated dynamically)
//
// Acciones:
//   Acción 1 - FÍSICA DE SALTO (Jump - 4 cuadros):
//     Cuadro 1 (Frame 0): Impulso / Startup (Rodillas muy flexionadas, brazos bajando para tomar envión, pies en y=89)
//     Cuadro 2 (Frame 1): Ascenso / Upward (Cuerpo estirado hacia arriba, pies despegados ~20px en y=69..70)
//     Cuadro 3 (Frame 2): Ápice y Caída / Fall (En el aire, rodillas recogidas, saco abriéndose por la caída)
//     Cuadro 4 (Frame 3): Aterrizaje / Landing (Amortiguación, manos casi tocando el piso, pies en y=89)
//
//   Acción 2 - GIRO / PIVOTE DE DIRECCIÓN (Turnaround - 2 cuadros):
//     Cuadro 5 (Frame 4): Transición 3/4 frontal (Giro sobre talones mirando a la cámara, melena rotando)
//     Cuadro 6 (Frame 5): Perfil opuesto (Finaliza el giro en guardia mirando hacia el lado contrario)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const BASE_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 6;
const STRIP_WIDTH = FRAMES * CELL; // 576 px
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

    dustWhite: [240, 240, 245],
    dustGray: [160, 160, 170]
};

function getPx(png, x, y) {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return [0, 0, 0, 0];
    const i = (y * png.width + x) << 2;
    return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

function setPx(png, x, y, col, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= png.width || y < 0 || y > GROUND_Y || a <= 0) return;
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

function drawThickLine(png, x0, y0, x1, y1, thickness, col, a = 255) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1) * 2;
    const r = thickness / 2;
    for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        for (let oy = -Math.ceil(r); oy <= Math.ceil(r); oy++) {
            for (let ox = -Math.ceil(r); ox <= Math.ceil(r); ox++) {
                if (ox * ox + oy * oy <= r * r) {
                    setPx(png, cx + ox, cy + oy, col, a);
                }
            }
        }
    }
}

// Segmentation helpers
function isUpperBody(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    if (x < 37 && y >= 74) return false; // Tail
    if (y < 72) return true;
    if (x <= 41 && y <= 75) return true; // Left arm
    if (x >= 67 && y <= 73) return true; // Right arm
    if (y === 72 && x >= 42 && x <= 68) return true; // Jacket hem
    return false;
}

function isOldArm(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    if (y >= 48 && y <= 76) {
        if (x <= 44) return true;  // Left arm & hand
        if (x >= 64) return true;  // Right arm & hand
    }
    return false;
}

// Blit base upper body with offsets
function blitBaseUpper(png, offsetX = 0, offsetY = 0, opts = {}) {
    const maxSrcY = opts.maxSrcY || 72;
    for (let y = 0; y <= maxSrcY; y++) {
        for (let x = 0; x < CELL; x++) {
            if (isUpperBody(x, y) && !isOldArm(x, y)) {
                const p = getPx(base, x, y);
                if (p[3] > 0) {
                    setPx(png, x + offsetX, y + offsetY, p);
                }
            }
        }
    }
    // Seal waist seam with suit fabric
    const hemY = maxSrcY + offsetY;
    for (let x = 44 + offsetX; x <= 64 + offsetX; x++) {
        if (getPx(png, x, hemY + 1)[3] === 0 && getPx(png, x, hemY)[3] > 0) {
            setPx(png, x, hemY + 1, PAL.suitBase);
        }
    }
}

// Draw Lion Paw / Shoe
function drawLionPaw(png, px, py, opts = {}) {
    px = Math.round(px);
    py = Math.round(py);
    const facingRight = (opts.facingRight !== false);
    const soleW = opts.soleW || 12;
    const pawH = opts.pawH || 6;

    const soleY = py;
    const startX = facingRight ? px : px - soleW + 4;

    // Shoe sole & bottom cushion
    fillRect(png, startX, soleY - 1, soleW, 2, PAL.shoes);
    setPx(png, startX, soleY - 2, PAL.black);
    setPx(png, startX + soleW - 1, soleY - 2, PAL.black);

    // Paw Golden Fur Body
    fillRect(png, startX + 1, soleY - pawH, soleW - 2, pawH - 1, PAL.furBase);
    fillRect(png, startX + 2, soleY - pawH - 1, soleW - 4, 2, PAL.furHi);
    fillRect(png, startX + 1, soleY - 2, soleW - 2, 1, PAL.furDark);

    // Claws at front of paw
    const clawFrontX = facingRight ? startX + soleW - 1 : startX;
    setPx(png, clawFrontX, soleY - 2, PAL.claw);
    setPx(png, clawFrontX - (facingRight ? 2 : -2), soleY - 2, PAL.claw);
    setPx(png, clawFrontX - (facingRight ? 4 : -4), soleY - 2, PAL.claw);

    // Trouser cuff overlapping ankle
    const cuffY = soleY - pawH - 1;
    fillRect(png, startX + 1, cuffY, soleW - 2, 2, PAL.suitBase);
    setPx(png, startX + 2, cuffY, PAL.suitHi);
    setPx(png, startX + soleW - 2, cuffY, PAL.suitShadow);
}

// Draw Trouser Leg
function drawTrouserLeg(png, hipX, hipY, kneeX, kneeY, ankleX, ankleY, width = 7, isFrontLeg = true) {
    const legBaseCol = isFrontLeg ? PAL.suitBase : PAL.suitShadow;
    const legMidCol = isFrontLeg ? PAL.suitMid : PAL.suitBase;
    const legHiCol = isFrontLeg ? PAL.suitHi : PAL.suitMid;
    const legShadowCol = PAL.suitShadow;

    // Thigh segment
    drawThickLine(png, hipX, hipY, kneeX, kneeY, width, legBaseCol);
    drawThickLine(png, hipX + 1, hipY, kneeX + 1, kneeY, width - 3, legHiCol);
    drawThickLine(png, hipX - 1, hipY, kneeX - 1, kneeY, 2, legShadowCol);

    // Shin segment
    drawThickLine(png, kneeX, kneeY, ankleX, ankleY, width - 1, legBaseCol);
    drawThickLine(png, kneeX + 1, kneeY, ankleX + 1, ankleY, width - 4, legHiCol);
    drawThickLine(png, kneeX - 1, kneeY, ankleX - 1, ankleY, 2, legShadowCol);

    // Crease line along trouser
    drawThickLine(png, hipX + 1, hipY + 1, kneeX + 1, kneeY, 1, PAL.suitCrease);
    drawThickLine(png, kneeX + 1, kneeY, ankleX + 1, ankleY - 1, 1, PAL.suitCrease);
}

// Draw Clenched Lion Fist with White Shirt Cuff & Claws
function drawLionFist(png, fx, fy, opts = {}) {
    fx = Math.round(fx);
    fy = Math.round(fy);
    const facingRight = (opts.facingRight !== false);
    const openClaws = !!opts.openClaws;
    const cuffX = facingRight ? fx - 3 : fx + 6;

    // White shirt cuff
    fillRect(png, cuffX, fy - 1, 3, 6, PAL.shirtWhite);
    setPx(png, cuffX, fy - 1, PAL.shirtDark);
    setPx(png, cuffX, fy + 4, PAL.shirtDark);

    // Golden lion fist body
    fillRect(png, fx, fy - 2, 6, 7, PAL.furBase);
    fillRect(png, fx + 1, fy - 3, 4, 2, PAL.furHi);
    fillRect(png, fx, fy + 4, 6, 2, PAL.furDark);

    // Claws
    const clawX = facingRight ? fx + 5 : fx - 1;
    if (openClaws) {
        setPx(png, clawX, fy - 2, PAL.claw);
        setPx(png, clawX + (facingRight ? 1 : -1), fy - 2, PAL.claw);
        setPx(png, clawX, fy, PAL.claw);
        setPx(png, clawX + (facingRight ? 2 : -2), fy, PAL.claw);
        setPx(png, clawX, fy + 2, PAL.claw);
        setPx(png, clawX + (facingRight ? 2 : -2), fy + 2, PAL.claw);
        setPx(png, clawX, fy + 4, PAL.claw);
        setPx(png, clawX + (facingRight ? 1 : -1), fy + 4, PAL.claw);
    } else {
        setPx(png, clawX, fy - 1, PAL.claw);
        setPx(png, clawX + (facingRight ? 1 : -1), fy - 1, PAL.claw);
        setPx(png, clawX, fy + 1, PAL.claw);
        setPx(png, clawX + (facingRight ? 1 : -1), fy + 1, PAL.claw);
        setPx(png, clawX, fy + 3, PAL.claw);
    }

    setPx(png, fx - 1, fy - 2, PAL.black);
    setPx(png, fx - 1, fy + 4, PAL.black);
    setPx(png, clawX + (facingRight ? 1 : -1), fy - 2, PAL.black);
    setPx(png, clawX + (facingRight ? 1 : -1), fy + 4, PAL.black);
}

// Draw Arm (Shoulder -> Elbow -> Hand)
function drawArm(png, shX, shY, elX, elY, handX, handY, opts = {}) {
    const isFrontArm = (opts.isFrontArm !== false);
    const sleeveCol = isFrontArm ? PAL.suitBase : PAL.suitShadow;
    const sleeveHi = isFrontArm ? PAL.suitHi : PAL.suitMid;
    const width = opts.width || 6;

    drawThickLine(png, shX, shY, elX, elY, width, sleeveCol);
    drawThickLine(png, shX, shY - 1, elX, elY - 1, width - 3, sleeveHi);

    drawThickLine(png, elX, elY, handX, handY, width - 1, sleeveCol);
    drawThickLine(png, elX, elY - 1, handX, handY - 1, width - 3, sleeveHi);

    drawLionFist(png, handX, handY, opts);
}

// Draw Tail with Sinuous Curve and Lion Fur Tuft
function drawLionTail(png, rootX, rootY, midX, midY, tipX, tipY) {
    drawThickLine(png, rootX, rootY, midX, midY, 3, PAL.furDark);
    drawThickLine(png, midX, midY, tipX, tipY, 3, PAL.furDark);
    drawThickLine(png, rootX, rootY - 1, midX, midY - 1, 1, PAL.furBase);
    drawThickLine(png, midX, midY - 1, tipX, tipY - 1, 1, PAL.furBase);

    const tx = Math.round(tipX);
    const ty = Math.round(tipY);
    fillRect(png, tx - 3, ty - 3, 6, 6, PAL.maneBase);
    fillRect(png, tx - 2, ty - 4, 4, 2, PAL.maneHi);
    fillRect(png, tx - 2, ty + 2, 5, 2, PAL.maneDeep);
    setPx(png, tx - 4, ty, PAL.maneShadow);
    setPx(png, tx - 1, ty - 2, PAL.maneLight);
}

// Blit cell into strip
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

// ==============================================================================
// ACCIÓN 1: FÍSICA DE SALTO (JUMP - 4 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 1 (Frame 0): Impulso / Startup
// Rodillas muy flexionadas preparándose para despegar, brazos bajando para tomar
// envión (los pies aún tocan el suelo en y=89).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 1 (Jump 1): Impulse / Startup...');
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);

const DROP_J1 = 11; // Deep crouch compression

// 1. Tail resting low along floor
drawLionTail(f1, 38, 73 + DROP_J1 - 4, 26, 79 + DROP_J1 - 3, 19, 85);

// 2. Legs: Deeply bent knees, wide compression
drawTrouserLeg(f1, 45, 72 + DROP_J1, 40, 80, 42, 85, 8, false);
drawLionPaw(f1, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f1, 55, 72 + DROP_J1, 62, 80, 60, 85, 8, true);
drawLionPaw(f1, 56, 89, { facingRight: true, soleW: 13, pawH: 6 });

// 3. Compressed Upper body core (Head, mane, suit dropped by DROP_J1)
blitBaseUpper(f1, 0, DROP_J1);

// 4. Arms: Sweeping downward and back behind torso to gather vertical lift
// Rear arm (viewer's left): pulled back and down
drawArm(f1, 44, 52 + DROP_J1, 36, 62 + DROP_J1, 34, 72 + DROP_J1, { isFrontArm: false, facingRight: false });

// Lead arm (viewer's right): sweeping down past hip
drawArm(f1, 63, 52 + DROP_J1, 68, 63 + DROP_J1, 67, 73 + DROP_J1, { isFrontArm: true, facingRight: true });

blitToStrip(f1, 0);

// ------------------------------------------------------------------------------
// CUADRO 2 (Frame 1): Ascenso / Upward
// El personaje vuela hacia arriba, cuerpo estirado y garras listas
// (el sprite se despega unos 20 píxeles del suelo de la celda -> pies en y=69..70).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 2 (Jump 2): Upward Flight (Airborne +20px)...');
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);

// In this frame, the head stays unclipped at y=4, torso is compact & upright at y=45..54,
// and athletic legs extend straight down to feet at y=69..70 (20px off floor y=89)!
// 1. Tail trailing straight down behind legs
drawLionTail(f2, 38, 54, 34, 62, 28, 66);

// 2. Legs: Athletic downward stretch with toes pointed down at y=69..70
// Rear leg
drawTrouserLeg(f2, 45, 54, 43, 61, 42, 66, 6, false);
drawLionPaw(f2, 37, 70, { facingRight: true, soleW: 11, pawH: 5 });

// Front leg
drawTrouserLeg(f2, 54, 54, 56, 61, 57, 66, 6, true);
drawLionPaw(f2, 53, 70, { facingRight: true, soleW: 12, pawH: 5 });

// 3. Upper body core at y=0 (Head top at y=4, torso down to y=54)
blitBaseUpper(f2, 0, 0, { maxSrcY: 54 });

// 4. Arms: Swept upward and forward in dynamic launch ascension V, claws ready!
// Left arm (rear): angled up and outward, claws ready
drawArm(f2, 43, 50, 35, 40, 36, 32, {
    isFrontArm: false,
    facingRight: false,
    openClaws: true
});

// Right arm (lead): raised high in athletic combat guard, sharp claws
drawArm(f2, 63, 50, 70, 41, 68, 33, {
    isFrontArm: true,
    facingRight: true,
    openClaws: true
});

blitToStrip(f2, 1);

// ------------------------------------------------------------------------------
// CUADRO 3 (Frame 2): Ápice y Caída / Fall
// Llega al punto más alto y empieza a caer, rodillas ligeramente recogidas
// y saco del traje abriéndose levemente por la caída.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 3 (Jump 3): Apex & Fall (Flared Suit)...');
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);

// In fall phase, feet are in mid-air at y=75 (14px above floor), knees slightly tucked.
// Head is at y=6..47, torso at y=48..60.
// 1. Tail curling upward behind due to air drag
drawLionTail(f3, 38, 58, 27, 54, 18, 50);

// 2. Legs: Knees slightly tucked/bent in air (feet soles at y=75)
drawTrouserLeg(f3, 45, 58, 41, 66, 43, 71, 7, false);
drawLionPaw(f3, 38, 75, { facingRight: true, soleW: 11, pawH: 5 });

drawTrouserLeg(f3, 54, 58, 59, 66, 57, 71, 7, true);
drawLionPaw(f3, 52, 75, { facingRight: true, soleW: 12, pawH: 5 });

// 3. Upper body core shifted by +2 (head at y=6)
blitBaseUpper(f3, 0, 2, { maxSrcY: 58 });

// 4. Saco del traje abriéndose levemente por la caída / resistencia del aire:
// Flared left coat flap
fillRect(f3, 37, 56, 7, 6, PAL.suitBase);
fillRect(f3, 36, 54, 5, 4, PAL.suitMid);
setPx(f3, 35, 55, PAL.suitHi);
// White shirt lining showing
fillRect(f3, 42, 55, 3, 4, PAL.shirtWhite);

// Flared right coat flap
fillRect(f3, 63, 56, 8, 6, PAL.suitBase);
fillRect(f3, 67, 54, 5, 4, PAL.suitHi);
setPx(f3, 71, 55, PAL.suitMid);
fillRect(f3, 63, 55, 3, 4, PAL.shirtWhite);

// Flapping tie lifting slightly
fillRect(f3, 53, 52, 4, 7, PAL.tieBase);
setPx(f3, 54, 54, PAL.tieHi);

// 5. Arms spread for balance in descent
drawArm(f3, 43, 52, 35, 50, 38, 44, { isFrontArm: false, facingRight: false });
drawArm(f3, 64, 52, 72, 51, 68, 44, { isFrontArm: true, facingRight: true });

blitToStrip(f3, 2);

// ------------------------------------------------------------------------------
// CUADRO 4 (Frame 3): Aterrizaje / Landing
// Toca el suelo flexionando las piernas para amortiguar el impacto,
// manos casi tocando el piso antes de ponerse de pie.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 4 (Jump 4): Landing & Shock Absorption...');
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);

const DROP_J4 = 13; // Deep landing absorption drop

// 1. Tail low along floor
drawLionTail(f4, 38, 73 + DROP_J4 - 4, 25, 80, 18, 85);

// 2. Wide planted feet on floor y=89
drawTrouserLeg(f4, 45, 72 + DROP_J4, 38, 80, 39, 85, 8, false);
drawLionPaw(f4, 33, 89, { facingRight: true, soleW: 13, pawH: 6 });

drawTrouserLeg(f4, 55, 72 + DROP_J4, 64, 80, 63, 85, 8, true);
drawLionPaw(f4, 59, 89, { facingRight: true, soleW: 13, pawH: 6 });

// Landing impact dust / arcade friction at foot bases y=88..89
setPx(f4, 31, 88, PAL.dustWhite);
setPx(f4, 30, 89, PAL.dustGray);
setPx(f4, 73, 88, PAL.dustWhite);
setPx(f4, 74, 89, PAL.dustGray);

// 3. Compressed Upper body core
blitBaseUpper(f4, 0, DROP_J4);

// 4. Arms: Reaching all the way down, hands almost touching the ground (y=82..84)!
// Left hand bracing down near floor
drawArm(f4, 43, 52 + DROP_J4, 37, 72, 38, 83, {
    isFrontArm: false,
    facingRight: false,
    openClaws: true
});

// Right hand bracing down near floor
drawArm(f4, 63, 52 + DROP_J4, 69, 72, 68, 83, {
    isFrontArm: true,
    facingRight: true,
    openClaws: true
});

blitToStrip(f4, 3);

// ==============================================================================
// ACCIÓN 2: GIRO / PIVOTE DE DIRECCIÓN (TURNAROUND - 2 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 5 (Frame 4): Transición 3/4 frontal
// El cuerpo gira sobre sus talones mirando hacia la cámara frontal,
// melena rotando en el aire.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 5 (Turn 1): Frontal 3/4 Pivot...');
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);

// 1. Tail whipping behind center
drawLionTail(f5, 48, 73, 38, 76, 26, 81);

// 2. Feet pivoting on heels at y=89
// Left foot turned slightly outward
drawLionPaw(f5, 38, 89, { facingRight: false, soleW: 11, pawH: 6 });
// Right foot turned slightly outward
drawLionPaw(f5, 50, 89, { facingRight: true, soleW: 11, pawH: 6 });

// 3. Trousers centered under hips
drawTrouserLeg(f5, 44, 72, 43, 80, 43, 85, 7, false);
drawTrouserLeg(f5, 52, 72, 53, 80, 53, 85, 7, true);

// 4. Full rotating mane & head:
// Blit full mane from base with bilateral balance
for (let y = 4; y <= 45; y++) {
    for (let x = 28; x <= 74; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) {
            setPx(f5, x - 2, y, p);
        }
    }
}
// Expand left mane volume to represent dynamic mane rotation in the air
for (let y = 8; y <= 42; y++) {
    for (let x = 20; x <= 27; x++) {
        const p = getPx(base, 50 - (x - 20), y);
        if (p[3] > 0) {
            setPx(f5, x, y, p);
        }
    }
}

// 5. Frontal/3-Quarter Muzzle & Eyes:
// Golden lion muzzle centered at x=44..56, y=28..40
fillRect(f5, 45, 29, 11, 8, PAL.muzzleBase);
fillRect(f5, 46, 37, 9, 2, PAL.muzzleShadow);
// Black nose
fillRect(f5, 48, 28, 5, 3, PAL.nose);
setPx(f5, 50, 31, PAL.mouth);
setPx(f5, 50, 32, PAL.mouth);
// Both eyes visible looking forward at the camera
setPx(f5, 43, 23, PAL.eyeWhite);
setPx(f5, 44, 23, PAL.eyePupil);
setPx(f5, 42, 22, PAL.furDark);
setPx(f5, 55, 23, PAL.eyeWhite);
setPx(f5, 54, 23, PAL.eyePupil);
setPx(f5, 56, 22, PAL.furDark);
// Golden brow fur
fillRect(f5, 44, 20, 11, 3, PAL.furBase);
fillRect(f5, 46, 17, 7, 3, PAL.furMid);

// 6. Centered Suit Torso & Tie
// Black suit jacket body
fillRect(f5, 40, 46, 18, 26, PAL.suitBase);
// Lapels
drawThickLine(f5, 42, 47, 46, 62, 2, PAL.suitHi);
drawThickLine(f5, 56, 47, 52, 62, 2, PAL.suitHi);
// White shirt V-neck
fillRect(f5, 47, 47, 5, 8, PAL.shirtWhite);
setPx(f5, 46, 48, PAL.shirtShadow);
setPx(f5, 52, 48, PAL.shirtShadow);
// Centered Violet Tie
fillRect(f5, 48, 50, 3, 16, PAL.tieBase);
fillRect(f5, 49, 50, 1, 16, PAL.tieHi);
setPx(f5, 48, 49, PAL.tieDark);
setPx(f5, 50, 49, PAL.tieDark);

// 7. Arms: Crossing body in mid-pivot
// Left arm swinging across lower chest/waist
drawArm(f5, 40, 52, 46, 62, 54, 64, { isFrontArm: false, facingRight: true });
// Right arm sweeping around flank
drawArm(f5, 57, 52, 63, 60, 61, 68, { isFrontArm: true, facingRight: false });

blitToStrip(f5, 4);

// ------------------------------------------------------------------------------
// CUADRO 6 (Frame 5): Perfil opuesto
// Finaliza el giro asentando los pies en guardia mirando hacia el lado contrario.
// (Mirando hacia la izquierda con postura espejo limpia de alta calidad).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 6 (Turn 2): Opposite Profile Guard (Facing Left)...');
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);

// Mirror base sprite horizontally with exact center axis x=48 (x' = 95 - x)
for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) {
            const mx = 95 - x;
            setPx(f6, mx, y, p);
        }
    }
}

blitToStrip(f6, 5);

// ==============================================================================
// SAVE OUTPUTS
// ==============================================================================
const OUT_LOCAL = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_jump_turn_96x96.png';
const OUT_GAME = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_jump_turn_96x96.png';
const ARTIFACT_DIR = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99';
const OUT_ARTIFACT = path.join(ARTIFACT_DIR, 'leon_spritestrip_jump_turn_96x96.png');

fs.writeFileSync(OUT_LOCAL, PNG.sync.write(strip));
fs.writeFileSync(OUT_GAME, PNG.sync.write(strip));
fs.writeFileSync(OUT_ARTIFACT, PNG.sync.write(strip));

// Also save individual frame previews for inspection
const framesArr = [f1, f2, f3, f4, f5, f6];
for (let i = 0; i < 6; i++) {
    const fPath = path.join(ARTIFACT_DIR, `test_jt_f${i + 1}.png`);
    fs.writeFileSync(fPath, PNG.sync.write(framesArr[i]));
}

console.log('Successfully generated leon_spritestrip_jump_turn_96x96.png!');
