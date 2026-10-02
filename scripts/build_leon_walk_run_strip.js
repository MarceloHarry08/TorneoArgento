// ==============================================================================
// TORNEO ARGENTO 16-BIT - EL LEÓN: WALK & RUN SPRITE STRIP GENERATOR
// Strict 96x96 Grid | Total: 8 Cells (768 x 96 px) | 100% Transparent PNG Background
// Foot ground baseline anchored firmly at y = 89 (Airborne frame elevated dynamically)
//
// Acciones:
//   Acción 1 - CAMINAR (Walk Cycle - 4 cuadros en loop fluido):
//     Cuadro 1 (Frame 0): Pierna delantera extendiéndose para dar el paso hacia adelante,
//                         brazo contrario balanceándose al frente.
//     Cuadro 2 (Frame 1): Apoyo total del pie delantero en el piso, peso pasando por encima del eje.
//     Cuadro 3 (Frame 2): Pierna trasera pasando hacia adelante, torso erguido con guardia media activa.
//     Cuadro 4 (Frame 3): Contacto de la otra pierna cerrando el ciclo de caminata firme.
//
//   Acción 2 - CORRER / DASH (Run Cycle - 4 cuadros rápidos en loop):
//     Cuadro 5 (Frame 4): Impulso agresivo: Torso inclinado 45 grados hacia adelante, zancada larga
//                         veloz con garras visibles, melena agitada hacia atrás por el viento.
//     Cuadro 6 (Frame 5): Ambos pies en el aire en fase de vuelo corto a alta velocidad.
//     Cuadro 7 (Frame 6): Impacto del pie delantero en el piso traccionando con fuerza.
//     Cuadro 8 (Frame 7): Pierna trasera impulsando con potencia para reiniciar el paso veloz.
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const BASE_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 8;
const STRIP_WIDTH = FRAMES * CELL; // 768 px
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

// Segmentation helpers from base sprite
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

function isHeadAndMane(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    return (y < 46);
}

function isTorsoCore(x, y) {
    if (base.data[((y * 96 + x) << 2) + 3] === 0) return false;
    if (y >= 46 && y <= 72 && x > 41 && x < 67) return true;
    return false;
}

// Draw Lion Paw / Shoe at specific position
// Planted foot at groundY (usually 89) or in flight/stride
function drawLionPaw(png, px, py, opts = {}) {
    px = Math.round(px);
    py = Math.round(py);
    const facingRight = (opts.facingRight !== false);
    const isPlanted = (opts.isPlanted !== false);
    const isAirborne = !!opts.isAirborne;
    const soleW = opts.soleW || 12;
    const pawH = opts.pawH || 6;

    // Dark outline / shoe sole
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

// Draw Fully Articulated Trouser Leg
function drawTrouserLeg(png, hipX, hipY, kneeX, kneeY, ankleX, ankleY, width = 7, isFrontLeg = true) {
    const legBaseCol = isFrontLeg ? PAL.suitBase : PAL.suitShadow;
    const legMidCol = isFrontLeg ? PAL.suitMid : PAL.suitBase;
    const legHiCol = isFrontLeg ? PAL.suitHi : PAL.suitMid;
    const legShadowCol = PAL.suitShadow;

    // Thigh segment (hip to knee)
    drawThickLine(png, hipX, hipY, kneeX, kneeY, width, legBaseCol);
    drawThickLine(png, hipX + 1, hipY, kneeX + 1, kneeY, width - 3, legHiCol);
    drawThickLine(png, hipX - 1, hipY, kneeX - 1, kneeY, 2, legShadowCol);

    // Shin segment (knee to ankle)
    drawThickLine(png, kneeX, kneeY, ankleX, ankleY, width - 1, legBaseCol);
    drawThickLine(png, kneeX + 1, kneeY, ankleX + 1, ankleY, width - 4, legHiCol);
    drawThickLine(png, kneeX - 1, kneeY, ankleX - 1, ankleY, 2, legShadowCol);

    // Crease line along trouser
    drawThickLine(png, hipX + 1, hipY + 1, kneeX + 1, kneeY, 1, PAL.suitCrease);
    drawThickLine(png, kneeX + 1, kneeY, ankleX + 1, ankleY - 1, 1, PAL.suitCrease);
}

// Draw Clenched Lion Fist with White Shirt Cuff
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
        // Extended ferocious claws for sprinting
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
        setPx(png, clawX, fy + 1, PAL.claw);
        setPx(png, clawX, fy + 3, PAL.claw);
    }

    // Outline
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

    // Upper arm
    drawThickLine(png, shX, shY, elX, elY, width, sleeveCol);
    drawThickLine(png, shX, shY - 1, elX, elY - 1, width - 3, sleeveHi);

    // Forearm
    drawThickLine(png, elX, elY, handX, handY, width - 1, sleeveCol);
    drawThickLine(png, elX, elY - 1, handX, handY - 1, width - 3, sleeveHi);

    // Fist / Claws
    drawLionFist(png, handX, handY, opts);
}

// Draw Tail with Sinuous Curve and Lion Fur Tuft
function drawLionTail(png, rootX, rootY, midX, midY, tipX, tipY, tuftAngle = "left") {
    // Tail core curve
    drawThickLine(png, rootX, rootY, midX, midY, 3, PAL.furDark);
    drawThickLine(png, midX, midY, tipX, tipY, 3, PAL.furDark);
    drawThickLine(png, rootX, rootY - 1, midX, midY - 1, 1, PAL.furBase);
    drawThickLine(png, midX, midY - 1, tipX, tipY - 1, 1, PAL.furBase);

    // Tail tuft (bushy lion tassel)
    const tx = Math.round(tipX);
    const ty = Math.round(tipY);
    fillRect(png, tx - 3, ty - 3, 6, 6, PAL.maneBase);
    fillRect(png, tx - 2, ty - 4, 4, 2, PAL.maneHi);
    fillRect(png, tx - 2, ty + 2, 5, 2, PAL.maneDeep);
    setPx(png, tx - 4, ty, PAL.maneShadow);
    setPx(png, tx - 1, ty - 2, PAL.maneLight);
}

// Draw Windblown Mane Spikes for Sprinting / Dashing
function drawWindblownManeBack(png, headX, headY, intensity = 1.0) {
    const spikes = [
        { x: headX - 8, y: headY + 8, len: 12 * intensity, w: 3, col: PAL.maneHi },
        { x: headX - 10, y: headY + 14, len: 16 * intensity, w: 4, col: PAL.maneBase },
        { x: headX - 12, y: headY + 20, len: 18 * intensity, w: 4, col: PAL.maneMid },
        { x: headX - 9, y: headY + 26, len: 14 * intensity, w: 3, col: PAL.maneBase },
        { x: headX - 7, y: headY + 32, len: 10 * intensity, w: 3, col: PAL.maneDeep },
        { x: headX - 4, y: headY + 38, len: 8 * intensity, w: 2, col: PAL.maneShadow }
    ];

    for (const sp of spikes) {
        for (let l = 0; l < sp.len; l++) {
            const sx = Math.round(sp.x - l);
            const sy = Math.round(sp.y + (l * 0.2));
            for (let w = 0; w < sp.w; w++) {
                setPx(png, sx, sy + w, sp.col);
            }
            if (l === Math.round(sp.len - 1)) {
                setPx(png, sx - 1, sy, PAL.maneDeep);
            }
        }
    }
}

// Draw Running Tie Flapping Backward in Wind
function drawRunningTie(png, startX, startY, len = 14, tiltY = -2) {
    for (let l = 0; l < len; l++) {
        const tx = Math.round(startX - (l * 0.7));
        const ty = Math.round(startY + l * 0.9 + tiltY);
        setPx(png, tx, ty, PAL.tieBase);
        setPx(png, tx, ty + 1, PAL.tieDark);
        setPx(png, tx - 1, ty, PAL.tieMid);
    }
    // Tie knot
    fillRect(png, startX - 1, startY - 1, 3, 3, PAL.tieDark);
    setPx(png, startX, startY, PAL.tieHi);
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

// Helper: Blit base torso and head with offsets
function blitBaseUpper(png, offsetX = 0, offsetY = 0, opts = {}) {
    for (let y = 0; y < CELL; y++) {
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
    const hemY = 72 + offsetY;
    for (let x = 44 + offsetX; x <= 64 + offsetX; x++) {
        if (getPx(png, x, hemY + 1)[3] === 0 && getPx(png, x, hemY)[3] > 0) {
            setPx(png, x, hemY + 1, PAL.suitBase);
        }
    }
}

// ==============================================================================
// ACCIÓN 1: CAMINAR (WALK CYCLE - 4 CUADROS EN LOOP FLUIDO)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 1 (Frame 0): Pierna delantera extendiéndose para dar el paso hacia adelante,
//                     brazo contrario balanceándose al frente.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 1 (Walk 1): Stride Forward...');
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);

// 1. Tail (resting lower in stride)
drawLionTail(f1, 38, 74, 27, 80, 20, 86);

// 2. Background Leg (viewer's left, character's left): trailing back, pushing off
drawTrouserLeg(f1, 45, 73, 40, 80, 37, 85, 7, false);
drawLionPaw(f1, 32, 89, { facingRight: true, soleW: 11, pawH: 5 });

// 3. Upper body core (slight stride bob +1px)
blitBaseUpper(f1, 0, 1);

// 4. Foreground Leg (viewer's right, character's right): reaching forward, heel contact at y=89
drawTrouserLeg(f1, 54, 74, 63, 80, 68, 85, 7, true);
drawLionPaw(f1, 64, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 5. Arms (counter-swing):
// Rear arm (viewer's left): swinging forward with cuff & fist
drawArm(f1, 43, 53, 48, 62, 55, 68, { isFrontArm: false });

// Lead arm (viewer's right): swinging back behind hip
drawArm(f1, 64, 53, 67, 63, 64, 73, { isFrontArm: true });

blitToStrip(f1, 0);

// ------------------------------------------------------------------------------
// CUADRO 2 (Frame 1): Apoyo total del pie delantero en el piso, peso pasando por encima del eje.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 2 (Walk 2): Full Plant / Passing Axis...');
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);

// 1. Tail (slight upward undulation)
drawLionTail(f2, 38, 73, 26, 77, 19, 82);

// 2. Background Leg (viewer's left): passing through, knee flexing forward, foot lifted low
drawTrouserLeg(f2, 45, 73, 48, 79, 47, 84, 7, false);
drawLionPaw(f2, 43, 87, { facingRight: true, soleW: 11, pawH: 5 });

// 3. Upper body core (centered over support foot, y=0)
blitBaseUpper(f2, 0, 0);

// 4. Foreground Leg (viewer's right): supporting full weight, planted flat at y=89
drawTrouserLeg(f2, 53, 73, 55, 80, 57, 85, 7, true);
drawLionPaw(f2, 52, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 5. Arms: passing torso in stride transition
drawArm(f2, 43, 52, 45, 62, 47, 70, { isFrontArm: false });
drawArm(f2, 64, 52, 65, 62, 64, 71, { isFrontArm: true });

blitToStrip(f2, 1);

// ------------------------------------------------------------------------------
// CUADRO 3 (Frame 2): Pierna trasera pasando hacia adelante, torso erguido con guardia media activa.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 3 (Walk 3): Step-Through / Active Mid-Guard...');
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);

// 1. Tail (high jaunty flick)
drawLionTail(f3, 38, 72, 26, 75, 18, 78);

// 2. Foreground Supporting Leg (viewer's right): solid column at y=89
drawTrouserLeg(f3, 53, 72, 53, 79, 53, 85, 7, true);
drawLionPaw(f3, 48, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 3. Background Stepping Leg (viewer's left): swinging forward past supporting leg, knee high
drawTrouserLeg(f3, 45, 72, 54, 77, 58, 83, 7, false);
drawLionPaw(f3, 55, 87, { facingRight: true, soleW: 11, pawH: 5 });

// 4. Upper body core (erect, proud martial carriage, y=-1)
blitBaseUpper(f3, 0, -1);

// 5. ACTIVE MID-GUARD ARMS ("guardia media activa"):
// Lead arm (viewer's right): raised in front of chest, clenched fist with claws ready
drawArm(f3, 63, 51, 67, 59, 64, 53, { isFrontArm: true, facingRight: true });

// Rear guard arm (viewer's left): protecting ribs/chin
drawArm(f3, 43, 51, 45, 59, 52, 55, { isFrontArm: false, facingRight: true });

blitToStrip(f3, 2);

// ------------------------------------------------------------------------------
// CUADRO 4 (Frame 3): Contacto de la otra pierna cerrando el ciclo de caminata firme.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 4 (Walk 4): Opposite Stride Contact...');
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);

// 1. Tail (settling into loop restart)
drawLionTail(f4, 38, 74, 27, 80, 20, 85);

// 2. Foreground Leg (viewer's right): trailing back, pushing off on toes
drawTrouserLeg(f4, 53, 74, 48, 80, 44, 85, 7, true);
drawLionPaw(f4, 39, 89, { facingRight: true, soleW: 11, pawH: 5 });

// 3. Upper body core (stride dip +1px)
blitBaseUpper(f4, 0, 1);

// 4. Background Leg (viewer's left): stepping down firmly into contact at y=89
drawTrouserLeg(f4, 45, 74, 56, 80, 62, 85, 7, false);
drawLionPaw(f4, 58, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 5. Arms (opposite swing closing loop):
// Foreground arm: swinging forward towards front
drawArm(f4, 64, 53, 66, 62, 60, 68, { isFrontArm: true });

// Rear arm: swinging back behind
drawArm(f4, 43, 53, 41, 62, 38, 71, { isFrontArm: false });

blitToStrip(f4, 3);

// ==============================================================================
// ACCIÓN 2: CORRER / DASH (RUN CYCLE - 4 CUADROS RÁPIDOS EN LOOP)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 5 (Frame 4): Impulso agresivo: Torso inclinado 45 grados hacia adelante,
//                     zancada larga veloz con garras visibles, melena agitada hacia atrás.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 5 (Run 1): Aggressive Sprint Launch...');
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);

const LEAN_F5 = 7;
const DROP_F5 = 4;

// 1. Horizontal trailing lion tail
drawLionTail(f5, 40 + LEAN_F5 - 3, 71, 26, 73, 14, 74);

// 2. Rear Leg (viewer's left): driving hard off ground at y=89
drawTrouserLeg(f5, 43 + LEAN_F5 - 2, 70, 33, 77, 25, 85, 7, false);
drawLionPaw(f5, 19, 89, { facingRight: true, soleW: 11, pawH: 5 });

// 3. Windblown Mane trailing behind (sharp 16-bit arcade wind spikes)
drawWindblownManeBack(f5, 52 + LEAN_F5, 14 + DROP_F5, 1.0);

// 4. Leaned Upper Body Core
blitBaseUpper(f5, LEAN_F5, DROP_F5);

// 5. Flapping Tie
drawRunningTie(f5, 52 + LEAN_F5, 52 + DROP_F5, 14, -2);

// 6. Front Leg (viewer's right): massive long sprint stride reaching forward
drawTrouserLeg(f5, 54 + LEAN_F5, 71, 67 + LEAN_F5, 78, 73 + LEAN_F5, 85, 7, true);
drawLionPaw(f5, 70 + LEAN_F5, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 7. Arms:
// Rear arm: swept back behind torso for aerodynamic balance
drawArm(f5, 45 + LEAN_F5, 54 + DROP_F5, 36, 61 + DROP_F5, 28, 65 + DROP_F5, { isFrontArm: false });

// Lead arm: aggressively pumping forward with open sharp lion claws!
drawArm(f5, 62 + LEAN_F5, 53 + DROP_F5, 72 + LEAN_F5, 58 + DROP_F5, 79 + LEAN_F5, 59 + DROP_F5, {
    isFrontArm: true,
    facingRight: true,
    openClaws: true
});

blitToStrip(f5, 4);

// ------------------------------------------------------------------------------
// CUADRO 6 (Frame 5): Ambos pies en el aire en fase de vuelo corto a alta velocidad.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 6 (Run 2): Airborne Flight Phase (Both Feet Off Floor)...');
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);

const LEAN_F6 = 8;
const DROP_F6 = 3;

// 1. Aerodynamic trailing tail
drawLionTail(f6, 40 + LEAN_F6 - 3, 69, 24, 71, 12, 72);

// 2. Rear Leg: stretched far horizontally behind IN AIR (y=77..80, 9px above floor y=89!)
drawTrouserLeg(f6, 42 + LEAN_F6 - 2, 68, 30, 72, 21, 76, 7, false);
drawLionPaw(f6, 15, 80, { facingRight: true, soleW: 11, pawH: 5, isAirborne: true });

// 3. Windblown Mane trailing behind
drawWindblownManeBack(f6, 52 + LEAN_F6, 14 + DROP_F6, 1.2);

// 4. Leaned Upper Body Core
blitBaseUpper(f6, LEAN_F6, DROP_F6);

// 5. Flapping Tie
drawRunningTie(f6, 52 + LEAN_F6, 52 + DROP_F6, 15, -3);

// 6. Front Leg: reaching forward IN AIR (y=82..84, 5px above floor y=89!)
drawTrouserLeg(f6, 54 + LEAN_F6, 68, 68 + LEAN_F6, 74, 74 + LEAN_F6, 79, 7, true);
drawLionPaw(f6, 71 + LEAN_F6, 84, { facingRight: true, soleW: 12, pawH: 6, isAirborne: true });

// 7. Arms:
// Rear arm: swept back in flight
drawArm(f6, 45 + LEAN_F6, 54 + DROP_F6, 34, 59 + DROP_F6, 26, 62 + DROP_F6, { isFrontArm: false });

// Lead arm: leading flight forward with claws out
drawArm(f6, 62 + LEAN_F6, 53 + DROP_F6, 73 + LEAN_F6, 56 + DROP_F6, 81 + LEAN_F6, 57 + DROP_F6, {
    isFrontArm: true,
    facingRight: true,
    openClaws: true
});

blitToStrip(f6, 5);

// ------------------------------------------------------------------------------
// CUADRO 7 (Frame 6): Impacto del pie delantero en el piso traccionando con fuerza.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 7 (Run 3): Front Foot Impact & Traction...');
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);

const LEAN_F7 = 6;
const DROP_F7 = 4;

// 1. Trailing tail
drawLionTail(f7, 40 + LEAN_F7 - 2, 71, 27, 72, 15, 75);

// 2. Rear Leg: in air, swinging through rapidly (y=80..83)
drawTrouserLeg(f7, 43 + LEAN_F7 - 2, 70, 36, 75, 30, 80, 7, false);
drawLionPaw(f7, 25, 83, { facingRight: true, soleW: 11, pawH: 5, isAirborne: true });

// 3. Windblown Mane
drawWindblownManeBack(f7, 52 + LEAN_F7, 14 + DROP_F7, 0.9);

// 4. Leaned Upper Body Core
blitBaseUpper(f7, LEAN_F7, DROP_F7);

// 5. Flapping Tie
drawRunningTie(f7, 52 + LEAN_F7, 52 + DROP_F7, 13, -1);

// 6. Front Leg: IMPACT & TRACTION on ground y=89!
drawTrouserLeg(f7, 54 + LEAN_F7, 71, 64 + LEAN_F7, 78, 68 + LEAN_F7, 85, 7, true);
drawLionPaw(f7, 65 + LEAN_F7, 89, { facingRight: true, soleW: 13, pawH: 6 });

// Traction friction sparks/dust at foot contact y=89
setPx(f7, 77 + LEAN_F7, 88, PAL.dustWhite);
setPx(f7, 78 + LEAN_F7, 89, PAL.dustGray);
setPx(f7, 79 + LEAN_F7, 88, PAL.dustWhite);
setPx(f7, 80 + LEAN_F7, 89, PAL.dustGray);

// 7. Arms:
// Front arm: beginning tuck back as torso drives over foot
drawArm(f7, 62 + LEAN_F7, 54 + DROP_F7, 66 + LEAN_F7, 62 + DROP_F7, 64 + LEAN_F7, 70 + DROP_F7, { isFrontArm: true });

// Rear arm: beginning forward power stroke
drawArm(f7, 45 + LEAN_F7, 54 + DROP_F7, 41 + LEAN_F7, 62 + DROP_F7, 46 + LEAN_F7, 68 + DROP_F7, { isFrontArm: false });

blitToStrip(f7, 6);

// ------------------------------------------------------------------------------
// CUADRO 8 (Frame 7): Pierna trasera impulsando con potencia para reiniciar el paso veloz.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 8 (Run 4): Rear Leg Powerful Push-Off / Restart...');
const f8 = new PNG({ width: CELL, height: CELL });
f8.data.fill(0);

const LEAN_F8 = 7;
const DROP_F8 = 4;

// 1. Tail curling behind
drawLionTail(f8, 40 + LEAN_F8 - 2, 71, 26, 73, 14, 73);

// 2. Rear Leg: planted firmly on floor y=89 pushing backward with intense torque
drawTrouserLeg(f8, 43 + LEAN_F8 - 2, 70, 37, 77, 33, 85, 7, false);
drawLionPaw(f8, 27, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 3. Windblown Mane
drawWindblownManeBack(f8, 52 + LEAN_F8, 14 + DROP_F8, 1.0);

// 4. Leaned Upper Body Core
blitBaseUpper(f8, LEAN_F8, DROP_F8);

// 5. Flapping Tie
drawRunningTie(f8, 52 + LEAN_F8, 52 + DROP_F8, 14, -2);

// 6. Front Leg: HIGH KNEE DRIVE! (Knee high at y=71, foot at y=82 poised to burst into Frame 5)
drawTrouserLeg(f8, 54 + LEAN_F8, 70, 66 + LEAN_F8, 72, 67 + LEAN_F8, 78, 7, true);
drawLionPaw(f8, 64 + LEAN_F8, 83, { facingRight: true, soleW: 11, pawH: 5, isAirborne: true });

// 7. Arms:
// Cross-pump with explosive energy:
// Left arm driving forward with claws out
drawArm(f8, 45 + LEAN_F8, 53 + DROP_F8, 56 + LEAN_F8, 57 + DROP_F8, 64 + LEAN_F8, 58 + DROP_F8, {
    isFrontArm: false,
    facingRight: true,
    openClaws: true
});

// Right arm pulling back
drawArm(f8, 62 + LEAN_F8, 54 + DROP_F8, 56 + LEAN_F8, 63 + DROP_F8, 48 + LEAN_F8, 67 + DROP_F8, { isFrontArm: true });

blitToStrip(f8, 7);

// ==============================================================================
// SAVE OUTPUTS
// ==============================================================================
const OUT_LOCAL = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_walk_run_96x96.png';
const OUT_GAME = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_walk_run_96x96.png';
const ARTIFACT_DIR = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99';
const OUT_ARTIFACT = path.join(ARTIFACT_DIR, 'leon_spritestrip_walk_run_96x96.png');

fs.writeFileSync(OUT_LOCAL, PNG.sync.write(strip));
fs.writeFileSync(OUT_GAME, PNG.sync.write(strip));
fs.writeFileSync(OUT_ARTIFACT, PNG.sync.write(strip));

// Also save individual frame previews for inspection
const framesArr = [f1, f2, f3, f4, f5, f6, f7, f8];
for (let i = 0; i < 8; i++) {
    const fPath = path.join(ARTIFACT_DIR, `test_wr_f${i + 1}.png`);
    fs.writeFileSync(fPath, PNG.sync.write(framesArr[i]));
}

console.log('Successfully generated leon_spritestrip_walk_run_96x96.png!');

