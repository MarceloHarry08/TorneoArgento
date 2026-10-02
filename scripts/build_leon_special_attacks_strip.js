// ==============================================================================
// TORNEO ARGENTO 16-BIT - EL LEÓN: SPECIAL ATTACKS SPRITE STRIP GENERATOR
// Strict 96x96 Grid | Total: 18 Cells (1728 x 96 px) | 100% Transparent PNG Background
// Foot ground baseline anchored firmly at y = 89
//
// Acciones:
//   Acción 1 - RUGIDO SÓNICO (Sonic Roar - 4 cuadros):
//     Cuadro 1 (Frame 0): Anticipación (Torso hacia atrás, puños cerrados, boca abriéndose)
//     Cuadro 2 (Frame 1): Rugido Activo (Boca abierta al máximo, 3-4 aros de energía sónica, melena atrás)
//     Cuadro 3 (Frame 2): Recuperación 1 (Jadeo cerrando la boca, estabilización)
//     Cuadro 4 (Frame 3): Recuperación 2 (Retorno a guardia neutral)
//
//   Acción 2 - SACA MOTOSIERRA (Chainsaw - 5 cuadros):
//     Cuadro 5 (Frame 4): Anticipación (Cuerpo girado buscando detrás de la espalda)
//     Cuadro 6 (Frame 5): Motosierra Visible (Agachado ligero, extiende motosierra, mano busca mango)
//     Cuadro 7 (Frame 6): Carga / Revving (Levanta motosierra sobre hombro, chispas en la cadena)
//     Cuadro 8 (Frame 7): Corte Diagonal (Corte rápido, estela y chispas)
//     Cuadro 9 (Frame 8): Recuperación (Esconde motosierra y vuelve a guardia)
//
//   Acción 3 - LANZA MICRÓFONO (Microphone Throw - 5 cuadros):
//     Cuadro 10 (Frame 9): Reach (Mano al pecho sacando micrófono del saco)
//     Cuadro 11 (Frame 10): Throw Startup (Brazo armado sobre el hombro listo para lanzar)
//     Cuadro 12 (Frame 11): Throw Release (Micrófono negro con cable en el aire)
//     Cuadro 13 (Frame 12): Pull / Lasso (Pose de pescador tensando el cable para atraer rival)
//     Cuadro 14 (Frame 13): Recuperación (Recoge cable y vuelve a guardia)
//
//   Acción 4 - MORDISCO FEROZ (Fierce Bite - 4 cuadros):
//     Cuadro 15 (Frame 14): Lunge (Embestida baja hacia adelante, despegando pocos píxeles)
//     Cuadro 16 (Frame 15): Morder (Boca abierta al máximo mordiendo con colmillos, garras listas)
//     Cuadro 17 (Frame 16): Landing & Wipe (Aterriza flexionando rodillas, limpiándose el hocico)
//     Cuadro 18 (Frame 17): Recuperación (Retorno a guardia media neutral)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const BASE_PATH = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/test_scaled_86.png';
const base = PNG.sync.read(fs.readFileSync(BASE_PATH));

const CELL = 96;
const FRAMES = 18;
const STRIP_WIDTH = FRAMES * CELL; // 1728 px
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

    mouthRed: [138, 24, 34],
    mouthDark: [68, 12, 18],
    tongue: [216, 76, 88],
    fang: [255, 255, 248],
    fangShadow: [205, 200, 185],

    eyeWhite: [255, 255, 255],
    eyePupil: [12, 10, 10],

    claw: [252, 250, 240],
    shoes: [16, 15, 18],
    shoesHi: [44, 42, 50],

    // Chainsaw palette
    sawBody: [245, 158, 11],
    sawBodyHi: [251, 191, 36],
    sawBodyDark: [180, 83, 9],
    sawMetal: [203, 213, 225],
    sawMetalDark: [100, 116, 139],
    sawChain: [30, 41, 59],
    sawHandle: [24, 24, 27],

    // Sparks & Sonic Energy
    sparkYellow: [254, 240, 138],
    sparkOrange: [249, 115, 22],
    sparkRed: [239, 68, 68],
    sparkWhite: [255, 255, 255],

    sonicCyan: [103, 232, 249],
    sonicCyanHi: [165, 243, 252],
    sonicBlue: [56, 189, 248],
    sonicGold: [253, 224, 71],

    // Mic & Cable
    micSilver: [226, 232, 240],
    micMesh: [148, 163, 184],
    micBody: [24, 24, 27],
    cableBlack: [15, 15, 18],
    cableShine: [71, 85, 105],

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
    const excludeHead = !!opts.excludeHead;
    const excludeFace = !!opts.excludeFace;
    for (let y = 0; y <= maxSrcY; y++) {
        for (let x = 0; x < CELL; x++) {
            if (isUpperBody(x, y) && !isOldArm(x, y)) {
                if (excludeHead && y < 46) continue;
                if (excludeFace && y >= 18 && y <= 45 && x >= 45) continue;
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

// Draw Clenched Lion Fist / Paw with White Cuff & Sharp Claws
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

// Draw Roaring Mouth / Open Jaws with Sharp Fangs & Tongue
function drawRoaringMaw(png, mx, my, openAmount = 1.0) {
    const h = Math.round(10 * openAmount);
    // Dark throat interior
    fillRect(png, mx, my, 12, h, PAL.mouthDark);
    fillRect(png, mx + 2, my + 1, 8, h - 2, PAL.mouthRed);
    // Pink tongue at bottom
    fillRect(png, mx + 3, my + h - 3, 6, 2, PAL.tongue);
    setPx(png, mx + 4, my + h - 4, PAL.sparkWhite); // saliva glint

    // Top sharp ivory fangs
    setPx(png, mx + 2, my, PAL.fang);
    setPx(png, mx + 2, my + 1, PAL.fang);
    setPx(png, mx + 2, my + 2, PAL.fang);
    setPx(png, mx + 4, my, PAL.fangShadow);
    setPx(png, mx + 6, my, PAL.fangShadow);
    setPx(png, mx + 8, my, PAL.fang);
    setPx(png, mx + 8, my + 1, PAL.fang);

    // Bottom sharp ivory fangs
    setPx(png, mx + 3, my + h - 1, PAL.fang);
    setPx(png, mx + 3, my + h - 2, PAL.fang);
    setPx(png, mx + 7, my + h - 1, PAL.fang);
    setPx(png, mx + 7, my + h - 2, PAL.fang);

    // Upper muzzle lip
    fillRect(png, mx - 1, my - 3, 14, 3, PAL.muzzleBase);
    fillRect(png, mx + 1, my - 4, 6, 2, PAL.muzzleShadow);
    fillRect(png, mx + 3, my - 6, 5, 3, PAL.nose);

    // Lower jaw dropped
    fillRect(png, mx - 1, my + h, 13, 3, PAL.muzzleBase);
    fillRect(png, mx, my + h + 2, 11, 2, PAL.maneShadow);
}

// Draw Concentric Sonic Energy Rings
function drawSonicEnergyRings(png, mouthX, mouthY) {
    // Ring 1 (Small immediate blast)
    for (let dy = -6; dy <= 6; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, 36 - dy * dy)) * 0.7);
        setPx(png, mouthX + 4 + dx, mouthY + dy, PAL.sonicCyanHi);
        setPx(png, mouthX + 5 + dx, mouthY + dy, PAL.sparkWhite);
    }
    // Ring 2 (Medium expanding shockwave)
    for (let dy = -12; dy <= 12; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, 144 - dy * dy)) * 0.6);
        setPx(png, mouthX + 11 + dx, mouthY + dy, PAL.sonicCyan);
        setPx(png, mouthX + 12 + dx, mouthY + dy, PAL.sonicGold);
        setPx(png, mouthX + 13 + dx, mouthY + dy, PAL.sparkWhite);
    }
    // Ring 3 (Large sonic ring)
    for (let dy = -18; dy <= 18; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, 324 - dy * dy)) * 0.5);
        setPx(png, mouthX + 19 + dx, mouthY + dy, PAL.sonicBlue);
        setPx(png, mouthX + 20 + dx, mouthY + dy, PAL.sonicCyan);
        setPx(png, mouthX + 21 + dx, mouthY + dy, PAL.sparkWhite);
    }
    // Ring 4 (Massive front shockwave cone)
    for (let dy = -26; dy <= 26; dy++) {
        const dx = Math.round(Math.sqrt(Math.max(0, 676 - dy * dy)) * 0.4);
        if (mouthX + 28 + dx < CELL) {
            setPx(png, mouthX + 27 + dx, mouthY + dy, PAL.sonicCyan);
            setPx(png, mouthX + 28 + dx, mouthY + dy, PAL.sonicCyanHi);
            setPx(png, mouthX + 29 + dx, mouthY + dy, PAL.sparkWhite);
        }
    }
}

// Draw Pixelated Chainsaw (Motosierra)
function drawChainsaw(png, x, y, angle = "horizontal", withSparks = false) {
    x = Math.round(x);
    y = Math.round(y);

    if (angle === "horizontal") {
        // Engine body (Amber/Orange box)
        fillRect(png, x, y, 14, 10, PAL.sawBody);
        fillRect(png, x + 1, y + 1, 12, 3, PAL.sawBodyHi);
        fillRect(png, x, y + 8, 14, 2, PAL.sawBodyDark);
        // Black wrap handle
        drawThickLine(png, x + 2, y - 4, x + 8, y, 2, PAL.sawHandle);
        // Rear trigger handle
        fillRect(png, x - 5, y + 3, 5, 4, PAL.sawHandle);

        // Guide bar (Metallic steel plate)
        fillRect(png, x + 14, y + 2, 22, 6, PAL.sawMetal);
        fillRect(png, x + 14, y + 3, 20, 2, PAL.sparkWhite);
        fillRect(png, x + 14, y + 6, 22, 2, PAL.sawMetalDark);
        // Rounded bar nose
        fillRect(png, x + 35, y + 3, 3, 4, PAL.sawMetalDark);

        // Chain teeth around guide bar
        for (let cx = x + 14; cx <= x + 35; cx += 2) {
            setPx(png, cx, y + 1, PAL.sawChain);
            setPx(png, cx, y + 8, PAL.sawChain);
        }
    } else if (angle === "diagonal_up") {
        // Angled up over shoulder ~45 deg
        // Engine
        fillRect(png, x, y, 12, 10, PAL.sawBody);
        fillRect(png, x + 1, y, 10, 3, PAL.sawBodyHi);
        fillRect(png, x, y + 8, 12, 2, PAL.sawBodyDark);
        // Bar angled up-right
        for (let l = 0; l < 24; l++) {
            const bx = x + 10 + l;
            const by = y + 2 - Math.round(l * 0.7);
            fillRect(png, bx, by, 3, 4, PAL.sawMetal);
            setPx(png, bx, by - 1, PAL.sawChain);
            setPx(png, bx, by + 4, PAL.sawChain);
        }
    } else if (angle === "diagonal_down") {
        // Angled down forward ~45 deg (slash)
        // Engine
        fillRect(png, x, y, 12, 10, PAL.sawBody);
        fillRect(png, x + 1, y, 10, 3, PAL.sawBodyHi);
        // Bar angled down-right
        for (let l = 0; l < 24; l++) {
            const bx = x + 10 + l;
            const by = y + 4 + Math.round(l * 0.7);
            fillRect(png, bx, by, 3, 4, PAL.sawMetal);
            setPx(png, bx, by - 1, PAL.sawChain);
            setPx(png, bx, by + 4, PAL.sawChain);
        }
    }

    // Dynamic sparks on the chain
    if (withSparks) {
        const sparkPts = [
            [x + 24, y - 2], [x + 28, y - 4], [x + 32, y - 1],
            [x + 36, y + 3], [x + 38, y + 7], [x + 34, y + 10],
            [x + 26, y + 11], [x + 30, y + 13], [x + 40, y + 1]
        ];
        for (let i = 0; i < sparkPts.length; i++) {
            const p = sparkPts[i];
            const col = (i % 3 === 0) ? PAL.sparkWhite : (i % 2 === 0 ? PAL.sparkYellow : PAL.sparkRed);
            setPx(png, p[0], p[1], col);
        }
    }
}

// Draw Microphone with Stage Cable
function drawMicrophone(png, x, y, angle = "horizontal") {
    x = Math.round(x);
    y = Math.round(y);
    // Silver mesh head
    fillRect(png, x, y - 2, 5, 5, PAL.micSilver);
    fillRect(png, x + 1, y - 3, 3, 7, PAL.micMesh);
    setPx(png, x + 2, y - 1, PAL.sparkWhite); // mesh glint
    // Black metal handle
    fillRect(png, x - 8, y - 1, 8, 3, PAL.micBody);
    setPx(png, x - 8, y, PAL.cableShine);
}

function drawCable(png, points) {
    for (let i = 0; i < points.length - 1; i++) {
        drawThickLine(png, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], 1, PAL.cableBlack);
        setPx(png, points[i][0], points[i][1], PAL.cableShine);
    }
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
// ACCIÓN 1: RUGIDO SÓNICO (SONIC ROAR - 4 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 1 (Frame 0): Anticipación
// Inclina torso hacia atrás, puños cerrados con fuerza a los costados, boca abriéndose.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 1 (Roar 1): Anticipation...');
const f1 = new PNG({ width: CELL, height: CELL });
f1.data.fill(0);

const LEAN_R1 = -4; // Leaned back -4px

// 1. Tail
drawLionTail(f1, 38 + LEAN_R1, 74, 26 + LEAN_R1, 79, 18 + LEAN_R1, 85);

// 2. Firm grounded legs
drawTrouserLeg(f1, 45 + LEAN_R1, 73, 42, 80, 42, 85, 7, false);
drawLionPaw(f1, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f1, 54 + LEAN_R1, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f1, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

// 3. Leaned back upper body (without old face so we draw custom preparing roar mouth)
blitBaseUpper(f1, LEAN_R1, 0, { excludeFace: true });

// 4. Custom Head with Mouth starting to open
for (let y = 4; y <= 45; y++) {
    for (let x = 28; x <= 62; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f1, x + LEAN_R1, y, p);
    }
}
// Opening mouth at x=56, y=34
drawRoaringMaw(f1, 56 + LEAN_R1, 34, 0.4);

// 5. Tightly clenched fists at flanks
drawArm(f1, 42 + LEAN_R1, 52, 36 + LEAN_R1, 62, 38 + LEAN_R1, 68, { isFrontArm: false, facingRight: true });
drawArm(f1, 63 + LEAN_R1, 52, 68 + LEAN_R1, 62, 66 + LEAN_R1, 68, { isFrontArm: true, facingRight: true });

blitToStrip(f1, 0);

// ------------------------------------------------------------------------------
// CUADRO 2 (Frame 1): Rugido Activo
// Torso hacia adelante, boca abierta al máximo, 3-4 aros de energía sónica, melena atrás.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 2 (Roar 2): Active Roar (Sonic Waves)...');
const f2 = new PNG({ width: CELL, height: CELL });
f2.data.fill(0);

const LEAN_R2 = 5; // Torso forward +5px

// 1. Tail straight back
drawLionTail(f2, 38 + LEAN_R2 - 2, 73, 26, 75, 14, 76);

// 2. Braced legs on floor y=89
drawTrouserLeg(f2, 45 + LEAN_R2 - 1, 73, 39, 80, 37, 85, 7, false);
drawLionPaw(f2, 31, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f2, 54 + LEAN_R2, 73, 62 + LEAN_R2, 80, 64 + LEAN_R2, 85, 7, true);
drawLionPaw(f2, 60 + LEAN_R2, 89, { facingRight: true, soleW: 13, pawH: 6 });

// 3. Upper body leaned forward (without face)
blitBaseUpper(f2, LEAN_R2, 0, { excludeFace: true });

// 4. Head with mane blown backward
for (let y = 4; y <= 45; y++) {
    for (let x = 28; x <= 60; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f2, x + LEAN_R2 - 2, y, p);
    }
}
// Windblown mane spikes trailing back
for (let l = 0; l < 16; l++) {
    setPx(f2, 30 - l, 18 + Math.round(l * 0.2), PAL.maneHi);
    setPx(f2, 28 - l, 24 + Math.round(l * 0.2), PAL.maneBase);
    setPx(f2, 26 - l, 30 + Math.round(l * 0.2), PAL.maneMid);
}

// 5. MAXIMAL ROARING MAW at x=56, y=30
drawRoaringMaw(f2, 56 + LEAN_R2, 30, 1.2);

// 6. 3-4 CONCENTRIC SONIC ENERGY RINGS bursting from mouth
drawSonicEnergyRings(f2, 68 + LEAN_R2, 35);

// 7. Arms: Fists clenched down/back radiating raw roar power
drawArm(f2, 42 + LEAN_R2, 52, 34 + LEAN_R2, 64, 32 + LEAN_R2, 72, { isFrontArm: false, facingRight: false });
drawArm(f2, 63 + LEAN_R2, 52, 70 + LEAN_R2, 64, 72 + LEAN_R2, 72, { isFrontArm: true, facingRight: true, openClaws: true });

blitToStrip(f2, 1);

// ------------------------------------------------------------------------------
// CUADRO 3 (Frame 2): Recuperación 1
// Jadeo cerrando la boca, estabilización, pecho bajando.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 3 (Roar 3): Recovery Panting...');
const f3 = new PNG({ width: CELL, height: CELL });
f3.data.fill(0);

const LEAN_R3 = 2;

drawLionTail(f3, 38 + LEAN_R3, 73, 26 + LEAN_R3, 78, 18 + LEAN_R3, 84);
drawTrouserLeg(f3, 45 + LEAN_R3, 73, 41, 80, 41, 85, 7, false);
drawLionPaw(f3, 35, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f3, 54 + LEAN_R3, 73, 58, 80, 60, 85, 7, true);
drawLionPaw(f3, 56, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f3, LEAN_R3, 1, { excludeFace: true });
for (let y = 4; y <= 45; y++) {
    for (let x = 28; x <= 62; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f3, x + LEAN_R3, y + 1, p);
    }
}
// Mouth slightly open panting
drawRoaringMaw(f3, 56 + LEAN_R3, 34, 0.3);

// Arms recovering towards ribs
drawArm(f3, 43 + LEAN_R3, 53, 40 + LEAN_R3, 63, 44 + LEAN_R3, 70, { isFrontArm: false, facingRight: true });
drawArm(f3, 63 + LEAN_R3, 53, 66 + LEAN_R3, 63, 64 + LEAN_R3, 71, { isFrontArm: true, facingRight: true });

blitToStrip(f3, 2);

// ------------------------------------------------------------------------------
// CUADRO 4 (Frame 3): Recuperación 2
// Retorno completo a la guardia neutral.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 4 (Roar 4): Neutral Guard...');
const f4 = new PNG({ width: CELL, height: CELL });
f4.data.fill(0);

drawLionTail(f4, 38, 74, 27, 80, 20, 86);
drawTrouserLeg(f4, 45, 73, 43, 80, 42, 85, 7, false);
drawLionPaw(f4, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f4, 54, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f4, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f4, 0, 0);
drawArm(f4, 43, 52, 45, 62, 47, 70, { isFrontArm: false });
drawArm(f4, 64, 52, 65, 62, 64, 71, { isFrontArm: true });

blitToStrip(f4, 3);

// ==============================================================================
// ACCIÓN 2: SACA MOTOSIERRA (CHAINSAW - 5 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 5 (Frame 4): Anticipación
// Gira el cuerpo parcialmente hacia atrás buscando algo detrás de la espalda.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 5 (Saw 1): Anticipation Reaching Behind...');
const f5 = new PNG({ width: CELL, height: CELL });
f5.data.fill(0);

drawLionTail(f5, 45, 73, 35, 76, 24, 82);
drawTrouserLeg(f5, 44, 73, 42, 80, 42, 85, 7, false);
drawLionPaw(f5, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f5, 53, 73, 54, 80, 54, 85, 7, true);
drawLionPaw(f5, 50, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f5, 0, 0);

// Left arm resting in front
drawArm(f5, 43, 52, 46, 62, 50, 68, { isFrontArm: false, facingRight: true });
// Right arm reaching deeply behind back / coat
drawArm(f5, 63, 52, 54, 60, 44, 64, { isFrontArm: true, facingRight: false });

blitToStrip(f5, 4);

// ------------------------------------------------------------------------------
// CUADRO 6 (Frame 5): Motosierra Visible
// Se agacha ligeramente, extiende una motosierra pixelada de tamaño mediano,
// el brazo libre busca el mango.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 6 (Saw 2): Chainsaw Drawn...');
const f6 = new PNG({ width: CELL, height: CELL });
f6.data.fill(0);

const DROP_S2 = 4; // Slight crouch

drawLionTail(f6, 38, 73 + DROP_S2, 26, 78 + DROP_S2, 18, 85);
drawTrouserLeg(f6, 44, 72 + DROP_S2, 40, 80, 41, 85, 7, false);
drawLionPaw(f6, 35, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f6, 54, 72 + DROP_S2, 58, 80, 60, 85, 7, true);
drawLionPaw(f6, 56, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f6, 0, DROP_S2);

// Chainsaw extended horizontally at waist height
drawChainsaw(f6, 54, 60 + DROP_S2, "horizontal", false);

// Right arm holding rear handle
drawArm(f6, 63, 52 + DROP_S2, 60, 62 + DROP_S2, 53, 63 + DROP_S2, { isFrontArm: true });
// Left arm reaching to top wrap handle
drawArm(f6, 43, 52 + DROP_S2, 52, 58 + DROP_S2, 58, 58 + DROP_S2, { isFrontArm: false });

blitToStrip(f6, 5);

// ------------------------------------------------------------------------------
// CUADRO 7 (Frame 6): Carga / Revving
// Levanta la motosierra sobre el hombro para pose de carga, chispas rojas y amarillas.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 7 (Saw 3): Revving Over Shoulder...');
const f7 = new PNG({ width: CELL, height: CELL });
f7.data.fill(0);

drawLionTail(f7, 38, 74, 26, 78, 18, 84);
drawTrouserLeg(f7, 44, 73, 41, 80, 41, 85, 7, false);
drawLionPaw(f7, 35, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f7, 54, 73, 57, 80, 59, 85, 7, true);
drawLionPaw(f7, 56, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f7, 0, 0);

// Chainsaw angled up over shoulder with sparks!
drawChainsaw(f7, 50, 42, "diagonal_up", true);

// Both arms gripping and revving chainsaw over shoulder
drawArm(f7, 43, 52, 48, 46, 52, 44, { isFrontArm: false });
drawArm(f7, 63, 52, 62, 44, 58, 42, { isFrontArm: true });

blitToStrip(f7, 6);

// ------------------------------------------------------------------------------
// CUADRO 8 (Frame 7): Corte Diagonal
// Corte diagonal rápido hacia adelante con chispas de la cadena.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 8 (Saw 4): Diagonal Slash...');
const f8 = new PNG({ width: CELL, height: CELL });
f8.data.fill(0);

const LEAN_S4 = 5;

drawLionTail(f8, 38 + LEAN_S4, 73, 26 + LEAN_S4, 76, 16 + LEAN_S4, 80);
drawTrouserLeg(f8, 44 + LEAN_S4, 73, 38, 80, 36, 85, 7, false);
drawLionPaw(f8, 30, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f8, 54 + LEAN_S4, 73, 64 + LEAN_S4, 80, 66 + LEAN_S4, 85, 7, true);
drawLionPaw(f8, 62 + LEAN_S4, 89, { facingRight: true, soleW: 13, pawH: 6 });

blitBaseUpper(f8, LEAN_S4, 0);

// Chainsaw angled downward in fast diagonal strike with sparks!
drawChainsaw(f8, 52 + LEAN_S4, 56, "diagonal_down", true);

// Arms driving the slash
drawArm(f8, 43 + LEAN_S4, 52, 50 + LEAN_S4, 56, 54 + LEAN_S4, 58, { isFrontArm: false });
drawArm(f8, 63 + LEAN_S4, 52, 60 + LEAN_S4, 54, 56 + LEAN_S4, 56, { isFrontArm: true });

blitToStrip(f8, 7);

// ------------------------------------------------------------------------------
// CUADRO 9 (Frame 8): Recuperación
// Esconde la motosierra rápidamente y vuelve a guardia.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 9 (Saw 5): Stow Chainsaw & Guard...');
const f9 = new PNG({ width: CELL, height: CELL });
f9.data.fill(0);

drawLionTail(f9, 38, 74, 27, 80, 20, 86);
drawTrouserLeg(f9, 45, 73, 43, 80, 42, 85, 7, false);
drawLionPaw(f9, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f9, 54, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f9, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f9, 0, 0);
drawArm(f9, 43, 52, 45, 62, 47, 70, { isFrontArm: false });
drawArm(f9, 64, 52, 65, 62, 64, 71, { isFrontArm: true });

blitToStrip(f9, 8);

// ==============================================================================
// ACCIÓN 3: LANZA MICRÓFONO (MICROPHONE THROW - 5 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 10 (Frame 9): Reach
// Se lleva la mano al pecho (como sacando un micrófono oculto del saco).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 10 (Mic 1): Reach Inside Jacket...');
const f10 = new PNG({ width: CELL, height: CELL });
f10.data.fill(0);

drawLionTail(f10, 38, 74, 27, 80, 20, 86);
drawTrouserLeg(f10, 44, 73, 42, 80, 42, 85, 7, false);
drawLionPaw(f10, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f10, 54, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f10, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f10, 0, 0);

// Left arm resting at flank
drawArm(f10, 43, 52, 42, 62, 44, 70, { isFrontArm: false });
// Right arm reaching inside left jacket lapel
drawArm(f10, 63, 52, 58, 58, 50, 56, { isFrontArm: true });

blitToStrip(f10, 9);

// ------------------------------------------------------------------------------
// CUADRO 11 (Frame 10): Throw Windup
// Movimiento de lanzamiento por encima del hombro, micrófono en mano.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 11 (Mic 2): Throw Windup...');
const f11 = new PNG({ width: CELL, height: CELL });
f11.data.fill(0);

const LEAN_M2 = -3;

drawLionTail(f11, 38 + LEAN_M2, 74, 26 + LEAN_M2, 78, 18 + LEAN_M2, 84);
drawTrouserLeg(f11, 44 + LEAN_M2, 73, 41, 80, 41, 85, 7, false);
drawLionPaw(f11, 35, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f11, 54 + LEAN_M2, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f11, 56, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f11, LEAN_M2, 0);

// Left arm aiming forward
drawArm(f11, 43 + LEAN_M2, 52, 52 + LEAN_M2, 56, 62 + LEAN_M2, 58, { isFrontArm: false });
// Right arm cocked back over shoulder holding mic
drawArm(f11, 63 + LEAN_M2, 52, 58 + LEAN_M2, 42, 54 + LEAN_M2, 36, { isFrontArm: true });
drawMicrophone(f11, 56 + LEAN_M2, 34);

blitToStrip(f11, 10);

// ------------------------------------------------------------------------------
// CUADRO 12 (Frame 11): Throw Release / Airborne Mic
// En el cuadro 3, el micrófono (negro con cable) ya está en el aire de la celda.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 12 (Mic 3): Airborne Mic Release...');
const f12 = new PNG({ width: CELL, height: CELL });
f12.data.fill(0);

const LEAN_M3 = 4;

drawLionTail(f12, 38 + LEAN_M3, 73, 26 + LEAN_M3, 76, 17 + LEAN_M3, 81);
drawTrouserLeg(f12, 44 + LEAN_M3, 73, 39, 80, 38, 85, 7, false);
drawLionPaw(f12, 32, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f12, 54 + LEAN_M3, 73, 62 + LEAN_M3, 80, 64 + LEAN_M3, 85, 7, true);
drawLionPaw(f12, 60 + LEAN_M3, 89, { facingRight: true, soleW: 13, pawH: 6 });

blitBaseUpper(f12, LEAN_M3, 0);

// Right arm thrown forward in follow-through
drawArm(f12, 63 + LEAN_M3, 52, 70 + LEAN_M3, 54, 76 + LEAN_M3, 56, { isFrontArm: true });
// Left arm trailing back
drawArm(f12, 43 + LEAN_M3, 52, 38 + LEAN_M3, 60, 36 + LEAN_M3, 68, { isFrontArm: false });

// AIRBORNE MICROPHONE IN THE AIR AT x=84, y=52
drawMicrophone(f12, 84, 52);

// Sinuous black cable trailing from hand to flying mic
drawCable(f12, [
    [76 + LEAN_M3, 56],
    [78, 62],
    [80, 56],
    [84 - 8, 52]
]);

blitToStrip(f12, 11);

// ------------------------------------------------------------------------------
// CUADRO 13 (Frame 12): Pull / Lasso
// Pose de "pescador" o "lazo": mano extendida como tensando un cable para "atraer" al rival.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 13 (Mic 4): Pull / Fisherman Tension...');
const f13 = new PNG({ width: CELL, height: CELL });
f13.data.fill(0);

const LEAN_M4 = -2; // Bracing backward

drawLionTail(f13, 38 + LEAN_M4, 74, 25 + LEAN_M4, 79, 16 + LEAN_M4, 85);
drawTrouserLeg(f13, 44 + LEAN_M4, 73, 40, 80, 39, 85, 8, false);
drawLionPaw(f13, 33, 89, { facingRight: true, soleW: 13, pawH: 6 });
drawTrouserLeg(f13, 54 + LEAN_M4, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f13, 56, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f13, LEAN_M4, 0);

// Both hands gripping and tensing the taut cable horizontally!
drawArm(f13, 43 + LEAN_M4, 52, 48 + LEAN_M4, 60, 54 + LEAN_M4, 62, { isFrontArm: false });
drawArm(f13, 63 + LEAN_M4, 52, 60 + LEAN_M4, 60, 68 + LEAN_M4, 62, { isFrontArm: true, openClaws: true });

// Taut horizontal cable yanking forward to rival
drawThickLine(f13, 68 + LEAN_M4, 62, 95, 62, 2, PAL.cableBlack);
setPx(f13, 75, 61, PAL.cableShine);
setPx(f13, 85, 61, PAL.cableShine);

blitToStrip(f13, 12);

// ------------------------------------------------------------------------------
// CUADRO 14 (Frame 13): Recuperación
// Vuelve a guardia neutral.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 14 (Mic 5): Neutral Guard...');
const f14 = new PNG({ width: CELL, height: CELL });
f14.data.fill(0);

drawLionTail(f14, 38, 74, 27, 80, 20, 86);
drawTrouserLeg(f14, 45, 73, 43, 80, 42, 85, 7, false);
drawLionPaw(f14, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f14, 54, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f14, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f14, 0, 0);
drawArm(f14, 43, 52, 45, 62, 47, 70, { isFrontArm: false });
drawArm(f14, 64, 52, 65, 62, 64, 71, { isFrontArm: true });

blitToStrip(f14, 13);

// ==============================================================================
// ACCIÓN 4: MORDISCO FEROZ (FIERCE BITE - 4 CUADROS)
// ==============================================================================

// ------------------------------------------------------------------------------
// CUADRO 15 (Frame 14): Lunge
// Salto corto o embestida hacia adelante a baja altura (despega unos píxeles del suelo).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 15 (Bite 1): Low Airborne Lunge...');
const f15 = new PNG({ width: CELL, height: CELL });
f15.data.fill(0);

const LEAN_B1 = 6;
const LIFT_B1 = -3; // Airborne by 3-4px (despega unos píxeles del suelo)

// Tail streamlined horizontally
drawLionTail(f15, 38 + LEAN_B1, 73 + LIFT_B1, 25, 73, 14, 74);

// Legs tucked forward in flight (floating at y=86, 3-4px off floor y=89!)
drawTrouserLeg(f15, 44 + LEAN_B1, 72 + LIFT_B1, 38, 78, 38, 83, 7, false);
drawLionPaw(f15, 32, 86, { facingRight: true, soleW: 11, pawH: 5 });

drawTrouserLeg(f15, 54 + LEAN_B1, 72 + LIFT_B1, 62 + LEAN_B1, 78, 64 + LEAN_B1, 83, 7, true);
drawLionPaw(f15, 60 + LEAN_B1, 86, { facingRight: true, soleW: 12, pawH: 5 });

blitBaseUpper(f15, LEAN_B1, LIFT_B1);

// Arms reaching forward with claws ready to seize prey
drawArm(f15, 43 + LEAN_B1, 52 + LIFT_B1, 54 + LEAN_B1, 58 + LIFT_B1, 64 + LEAN_B1, 60 + LIFT_B1, {
    isFrontArm: false,
    openClaws: true
});
drawArm(f15, 63 + LEAN_B1, 52 + LIFT_B1, 72 + LEAN_B1, 56 + LIFT_B1, 80 + LEAN_B1, 58 + LIFT_B1, {
    isFrontArm: true,
    openClaws: true
});

blitToStrip(f15, 14);

// ------------------------------------------------------------------------------
// CUADRO 16 (Frame 15): Morder
// Boca abierta al máximo sobre el rival imaginario. Garras visibles en guardia agresiva.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 16 (Bite 2): Active Bite / Chomp...');
const f16 = new PNG({ width: CELL, height: CELL });
f16.data.fill(0);

const LEAN_B2 = 7;

drawLionTail(f16, 38 + LEAN_B2 - 2, 73, 26, 75, 14, 78);
drawTrouserLeg(f16, 44 + LEAN_B2 - 2, 73, 38, 80, 36, 85, 7, false);
drawLionPaw(f16, 30, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f16, 54 + LEAN_B2, 73, 64 + LEAN_B2, 80, 66 + LEAN_B2, 85, 7, true);
drawLionPaw(f16, 62 + LEAN_B2, 89, { facingRight: true, soleW: 13, pawH: 6 });

blitBaseUpper(f16, LEAN_B2, 0, { excludeFace: true });

// Head surged forward
for (let y = 4; y <= 45; y++) {
    for (let x = 28; x <= 60; x++) {
        const p = getPx(base, x, y);
        if (p[3] > 0) setPx(f16, x + LEAN_B2, y, p);
    }
}
// PREDATORY BITE JAW at x=56, y=28 with sharp fangs and chomp marks
drawRoaringMaw(f16, 56 + LEAN_B2, 28, 1.3);

// Bite kinetic impact lines
setPx(f16, 72 + LEAN_B2, 26, PAL.sparkWhite);
setPx(f16, 74 + LEAN_B2, 28, PAL.sparkWhite);
setPx(f16, 74 + LEAN_B2, 38, PAL.sparkWhite);
setPx(f16, 72 + LEAN_B2, 40, PAL.sparkWhite);

// Arms: Fierce forward claw guard seizing prey
drawArm(f16, 43 + LEAN_B2, 52, 54 + LEAN_B2, 56, 66 + LEAN_B2, 56, { isFrontArm: false, openClaws: true });
drawArm(f16, 63 + LEAN_B2, 52, 72 + LEAN_B2, 54, 82 + LEAN_B2, 54, { isFrontArm: true, openClaws: true });

blitToStrip(f16, 15);

// ------------------------------------------------------------------------------
// CUADRO 17 (Frame 16): Landing & Mouth Wipe
// Aterriza flexionando rodillas, limpiándose la boca (postura agresiva).
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 17 (Bite 3): Landing & Muzzle Wipe...');
const f17 = new PNG({ width: CELL, height: CELL });
f17.data.fill(0);

const DROP_B3 = 8;

drawLionTail(f17, 38, 73 + DROP_B3 - 3, 26, 78 + DROP_B3 - 2, 18, 85);
drawTrouserLeg(f17, 44, 72 + DROP_B3, 39, 80, 40, 85, 7, false);
drawLionPaw(f17, 34, 89, { facingRight: true, soleW: 12, pawH: 6 });

drawTrouserLeg(f17, 54, 72 + DROP_B3, 60, 80, 62, 85, 7, true);
drawLionPaw(f17, 58, 89, { facingRight: true, soleW: 13, pawH: 6 });

blitBaseUpper(f17, 0, DROP_B3);

// Left arm in low stabilizing guard
drawArm(f17, 43, 52 + DROP_B3, 38, 64 + DROP_B3, 42, 72 + DROP_B3, { isFrontArm: false });
// Right arm brought up across muzzle wiping mouth!
drawArm(f17, 63, 52 + DROP_B3, 64, 46 + DROP_B3, 56, 36 + DROP_B3, { isFrontArm: true });

blitToStrip(f17, 16);

// ------------------------------------------------------------------------------
// CUADRO 18 (Frame 17): Recuperación
// Retorno completo a la guardia neutral.
// ------------------------------------------------------------------------------
console.log('Rendering Cuadro 18 (Bite 4): Neutral Guard...');
const f18 = new PNG({ width: CELL, height: CELL });
f18.data.fill(0);

drawLionTail(f18, 38, 74, 27, 80, 20, 86);
drawTrouserLeg(f18, 45, 73, 43, 80, 42, 85, 7, false);
drawLionPaw(f18, 36, 89, { facingRight: true, soleW: 12, pawH: 6 });
drawTrouserLeg(f18, 54, 73, 56, 80, 58, 85, 7, true);
drawLionPaw(f18, 55, 89, { facingRight: true, soleW: 12, pawH: 6 });

blitBaseUpper(f18, 0, 0);
drawArm(f18, 43, 52, 45, 62, 47, 70, { isFrontArm: false });
drawArm(f18, 64, 52, 65, 62, 64, 71, { isFrontArm: true });

blitToStrip(f18, 17);

// ==============================================================================
// SAVE OUTPUTS
// ==============================================================================
const OUT_LOCAL = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/assets/sprites/leon_spritestrip_specials_96x96.png';
const OUT_GAME = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritestrip_specials_96x96.png';
const ARTIFACT_DIR = 'C:/Users/marce/.gemini/antigravity-ide/brain/b2e39770-9d86-4c6b-a7ca-796966836f99';
const OUT_ARTIFACT = path.join(ARTIFACT_DIR, 'leon_spritestrip_specials_96x96.png');

fs.writeFileSync(OUT_LOCAL, PNG.sync.write(strip));
fs.writeFileSync(OUT_GAME, PNG.sync.write(strip));
fs.writeFileSync(OUT_ARTIFACT, PNG.sync.write(strip));

// Also save individual frame previews for inspection
const framesArr = [
    f1, f2, f3, f4,
    f5, f6, f7, f8, f9,
    f10, f11, f12, f13, f14,
    f15, f16, f17, f18
];
for (let i = 0; i < 18; i++) {
    const fPath = path.join(ARTIFACT_DIR, `test_sp_f${i + 1}.png`);
    fs.writeFileSync(fPath, PNG.sync.write(framesArr[i]));
}

console.log('Successfully generated leon_spritestrip_specials_96x96.png (18 frames)!');
