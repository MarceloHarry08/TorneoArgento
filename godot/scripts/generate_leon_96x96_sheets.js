// ==============================================================================
// 16-BIT RETRO ARCADE PIXEL ART SPRITESHEET GENERATOR: "EL LEÓN"
// Resolution: Strict 96x96 px cells, transparent PNG background
// Generates:
//   - Hoja 1: Movimientos y Combates Básicos (Idle, Crouch/Jump, Punches, Kicks, Damage/Knockdown)
//   - Hoja 2: Especiales, Súper Ataque, Bloqueo y Victoria
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const CELL = 96;
const COLS = 9;
const ROWS = 5;
const WIDTH = COLS * CELL;   // 864 px
const HEIGHT = ROWS * CELL;  // 480 px
const GROUND_Y = 90;         // Foot anchor baseline in every 96px cell

const PALETTE = {
    // Fur & Mane
    furBase: [217, 119, 6],
    furHi: [251, 191, 36],
    furShadow: [146, 64, 14],
    furDark: [120, 53, 15],
    maneDark: [69, 26, 3],
    maneMid: [120, 53, 15],
    maneHi: [180, 83, 9],
    muzzle: [253, 230, 138],
    nose: [15, 23, 42],
    eye: [254, 240, 138],
    eyePupil: [0, 0, 0],
    fangs: [255, 255, 255],

    // Suit
    suitBase: [24, 24, 27],
    suitShadow: [9, 9, 11],
    suitHi: [45, 47, 56],
    suitEdge: [70, 73, 86],
    shirt: [248, 250, 252],
    shirtShadow: [148, 163, 184],
    tie: [127, 29, 29],
    shoes: [12, 12, 16],
    shoesHi: [40, 42, 52],

    // FX & Energy
    goldAura: [254, 240, 138],
    goldFire: [245, 158, 11],
    goldCore: [255, 255, 255],
    blueSpark: [102, 217, 239],
    clawSlash: [255, 240, 150]
};

function setPx(png, x, y, col, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= png.width || y < 0 || y >= png.height || alpha <= 0) return;
    const i = (png.width * y + x) << 2;
    if (alpha >= 255) {
        png.data[i] = col[0];
        png.data[i + 1] = col[1];
        png.data[i + 2] = col[2];
        png.data[i + 3] = 255;
    } else {
        const curA = png.data[i + 3] / 255;
        const newA = alpha / 255;
        const outA = newA + curA * (1 - newA);
        if (outA > 0) {
            png.data[i] = Math.round((col[0] * newA + png.data[i] * curA * (1 - newA)) / outA);
            png.data[i + 1] = Math.round((col[1] * newA + png.data[i + 1] * curA * (1 - newA)) / outA);
            png.data[i + 2] = Math.round((col[2] * newA + png.data[i + 2] * curA * (1 - newA)) / outA);
            png.data[i + 3] = Math.round(outA * 255);
        }
    }
}

function fillRect(png, x, y, w, h, col, alpha = 255) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            setPx(png, x + dx, y + dy, col, alpha);
        }
    }
}

// Draw a stylized lion head with mane, ears, snout, and glowing eye
function drawLionHead(png, ox, oy, lookingUp = false, roar = false, hurt = false) {
    const maneCol = PALETTE.maneMid;
    const maneDark = PALETTE.maneDark;
    const maneHi = PALETTE.maneHi;
    const fur = PALETTE.furBase;

    // Outer voluminous mane
    fillRect(png, ox - 14, oy - 14, 28, 28, maneDark);
    fillRect(png, ox - 12, oy - 16, 24, 28, maneCol);
    fillRect(png, ox - 8, oy - 18, 18, 26, maneHi);
    // Mane spikes/locks
    setPx(png, ox - 15, oy - 8, maneDark);
    setPx(png, ox - 16, oy - 2, maneDark);
    setPx(png, ox - 14, oy + 8, maneDark);
    setPx(png, ox - 12, oy + 12, maneDark);
    setPx(png, ox + 10, oy - 16, maneHi);
    setPx(png, ox + 12, oy - 12, maneHi);

    // Rounded Lion Ears
    fillRect(png, ox - 8, oy - 20, 5, 4, maneDark);
    fillRect(png, ox - 7, oy - 19, 3, 2, PALETTE.muzzle);
    fillRect(png, ox + 4, oy - 19, 5, 4, maneDark);
    fillRect(png, ox + 5, oy - 18, 3, 2, PALETTE.muzzle);

    // Face / Cranium
    fillRect(png, ox - 4, oy - 10, 14, 18, fur);
    fillRect(png, ox - 2, oy - 8, 10, 14, PALETTE.furHi);

    // Snout / Muzzle (Profile facing Right)
    const snoutY = lookingUp ? oy - 6 : oy - 2;
    fillRect(png, ox + 4, snoutY, 10, 10, PALETTE.muzzle);
    // Black nose tip
    fillRect(png, ox + 12, snoutY, 3, 3, PALETTE.nose);

    // Mouth / Jaws
    if (roar) {
        // Open roaring mouth with fangs
        fillRect(png, ox + 4, snoutY + 6, 9, 8, [136, 19, 55]);
        setPx(png, ox + 7, snoutY + 6, PALETTE.fangs);
        setPx(png, ox + 10, snoutY + 6, PALETTE.fangs);
        setPx(png, ox + 8, snoutY + 12, PALETTE.fangs);
    } else {
        // Closed confident jaw
        fillRect(png, ox + 6, snoutY + 8, 7, 2, PALETTE.nose);
    }

    // Eye
    const eyeY = lookingUp ? oy - 6 : oy - 4;
    if (hurt) {
        // Closed / winced eye
        fillRect(png, ox + 2, eyeY, 4, 2, PALETTE.nose);
    } else {
        fillRect(png, ox + 2, eyeY, 4, 3, PALETTE.eye);
        setPx(png, ox + 4, eyeY + 1, PALETTE.eyePupil);
        // Eyebrow ridge
        fillRect(png, ox + 1, eyeY - 2, 6, 2, maneDark);
    }
}

// Draw the formal black business suit torso
function drawSuitTorso(png, ox, oy, breath = 0, lean = 0, openChest = false) {
    const base = PALETTE.suitBase;
    const shadow = PALETTE.suitShadow;
    const hi = PALETTE.suitHi;
    const shirt = PALETTE.shirt;
    const tie = PALETTE.tie;

    const topW = 18 + breath;
    const tx = ox - 8 + lean;

    // Suit shoulders and back
    fillRect(png, tx - 4, oy, topW, 20, base);
    fillRect(png, tx - 5, oy + 2, 3, 16, shadow); // Back shadow
    fillRect(png, tx - 2, oy + 1, topW - 4, 4, hi);    // Shoulder seam

    // White shirt V-neck & Lapels
    fillRect(png, tx + 6, oy + 2, 7, 10, shirt);
    fillRect(png, tx + 7, oy + 12, 5, 4, shirt);
    // Dark tie
    fillRect(png, tx + 8, oy + 4, 3, 14, tie);
    setPx(png, tx + 9, oy + 3, [200, 50, 50]); // Tie knot accent

    // Suit Lapels (black collar flaring out)
    fillRect(png, tx + 4, oy + 2, 3, 14, base);
    fillRect(png, tx + 12, oy + 2, 3, 12, base);
    setPx(png, tx + 13, oy + 14, PALETTE.suitEdge);

    // Suit buttons (Gold cufflinks / buttons)
    setPx(png, tx + 8, oy + 18, [212, 175, 55]);

    // Lower jacket skirt
    fillRect(png, tx - 4, oy + 20, topW + 1, 8, base);
    fillRect(png, tx - 5, oy + 22, 2, 6, shadow);
}

// Draw feline lion tail extending behind with darker furry tuft
function drawLionTail(png, ox, oy, angle = 0) {
    const fur = PALETTE.furBase;
    const tuft = PALETTE.maneDark;
    const tuftHi = PALETTE.maneHi;

    // Tail curves from lower back downwards, then curls up
    const pts = [
        [ox - 8, oy],
        [ox - 12, oy + 2 + angle],
        [ox - 16, oy + 6 + angle * 2],
        [ox - 19, oy + 12 + angle],
        [ox - 20, oy + 18],
        [ox - 18, oy + 22 - angle],
        [ox - 15, oy + 24 - angle * 2]
    ];

    for (const p of pts) {
        fillRect(png, p[0], p[1], 3, 3, fur);
    }

    // Fluffy tuft at the tip of the tail
    const tip = pts[pts.length - 1];
    fillRect(png, tip[0] - 2, tip[1] - 2, 6, 6, tuft);
    fillRect(png, tip[0] - 1, tip[1] - 1, 4, 4, tuftHi);
}

// Draw formal trousers and polished dress shoes
function drawLegs(png, ox, oy, stance = "stand", crouchAmt = 0) {
    const base = PALETTE.suitBase;
    const shadow = PALETTE.suitShadow;
    const hi = PALETTE.suitHi;
    const shoes = PALETTE.shoes;
    const shoesHi = PALETTE.shoesHi;

    if (stance === "crouch") {
        const legY = oy + 26;
        // Deep folded crouch legs
        fillRect(png, ox - 10, legY, 14, 10, base);
        fillRect(png, ox + 2, legY + 2, 16, 8, shadow);
        // Shoes on ground
        fillRect(png, ox - 12, GROUND_Y - 4, 12, 5, shoes);
        fillRect(png, ox + 6, GROUND_Y - 4, 14, 5, shoes);
        fillRect(png, ox - 10, GROUND_Y - 5, 8, 2, shoesHi);
        fillRect(png, ox + 8, GROUND_Y - 5, 10, 2, shoesHi);
    } else if (stance === "jump") {
        const legY = oy + 24;
        // Legs tucked up in air
        fillRect(png, ox - 8, legY, 8, 12, base);
        fillRect(png, ox + 4, legY - 2, 9, 10, shadow);
        fillRect(png, ox - 10, legY + 12, 10, 5, shoes);
        fillRect(png, ox + 6, legY + 8, 10, 5, shoes);
    } else if (stance === "kick_high") {
        // Left supporting leg straight
        fillRect(png, ox - 8, oy + 26, 8, 22, base);
        fillRect(png, ox - 10, GROUND_Y - 4, 12, 5, shoes);
        // Right leg kicked high horizontally
        fillRect(png, ox + 6, oy + 12, 28, 8, base);
        fillRect(png, ox + 12, oy + 10, 20, 4, hi);
        // Kicking shoe
        fillRect(png, ox + 32, oy + 8, 12, 10, shoes);
        fillRect(png, ox + 34, oy + 8, 8, 3, shoesHi);
    } else if (stance === "kick_low") {
        // Low sweep leg along ground
        fillRect(png, ox - 12, oy + 28, 14, 10, base);
        fillRect(png, ox - 14, GROUND_Y - 5, 12, 5, shoes);
        // Sweeping leg extended
        fillRect(png, ox + 2, GROUND_Y - 6, 32, 6, base);
        fillRect(png, ox + 30, GROUND_Y - 7, 12, 6, shoes);
    } else if (stance === "knockdown") {
        // Falling on floor
        fillRect(png, ox - 26, GROUND_Y - 6, 26, 7, base);
        fillRect(png, ox - 34, GROUND_Y - 7, 10, 6, shoes);
    } else {
        // Normal standing / idle / walk
        const legY = oy + 26;
        const legH = GROUND_Y - legY - 4;
        // Back leg
        fillRect(png, ox - 9, legY, 7, legH, shadow);
        fillRect(png, ox - 12, GROUND_Y - 4, 11, 5, shoes);
        fillRect(png, ox - 10, GROUND_Y - 5, 7, 2, shoesHi);
        // Front leg
        fillRect(png, ox + 2, legY, 8, legH, base);
        fillRect(png, ox + 4, legY, 2, legH, hi); // Crease line
        fillRect(png, ox, GROUND_Y - 4, 13, 5, shoes);
        fillRect(png, ox + 2, GROUND_Y - 5, 9, 2, shoesHi);
    }
}

// Draw arms & clawed lion paws
function drawArms(png, ox, oy, pose = "guard") {
    const base = PALETTE.suitBase;
    const hi = PALETTE.suitHi;
    const cuff = PALETTE.shirt;
    const claw = PALETTE.furBase;
    const sharp = PALETTE.fangs;

    if (pose === "guard") {
        // Left arm forward in front guard
        fillRect(png, ox + 6, oy + 4, 6, 12, base);
        fillRect(png, ox + 10, oy + 14, 8, 5, base);
        setPx(png, ox + 18, oy + 15, cuff);
        // Clawed fist
        fillRect(png, ox + 19, oy + 13, 6, 6, claw);
        setPx(png, ox + 25, oy + 13, sharp);
        setPx(png, ox + 25, oy + 15, sharp);

        // Right arm cocked at chest
        fillRect(png, ox - 2, oy + 6, 5, 11, PALETTE.suitShadow);
        fillRect(png, ox + 2, oy + 15, 6, 5, PALETTE.suitShadow);
        fillRect(png, ox + 6, oy + 14, 5, 5, claw);
    } else if (pose === "punch_high") {
        // Full horizontal slash / punch at head level
        fillRect(png, ox + 6, oy + 2, 28, 7, base);
        fillRect(png, ox + 8, oy + 1, 24, 3, hi);
        fillRect(png, ox + 32, oy + 2, 3, 7, cuff);
        // Massive extended claw paw
        fillRect(png, ox + 35, oy, 9, 9, claw);
        fillRect(png, ox + 44, oy, 4, 2, sharp);
        fillRect(png, ox + 44, oy + 3, 4, 2, sharp);
        fillRect(png, ox + 43, oy + 6, 4, 2, sharp);
        // Claw slash trail FX
        for (let i = 0; i < 3; i++) {
            fillRect(png, ox + 38 + i * 2, oy - 4 + i * 5, 8, 2, PALETTE.clawSlash, 190);
        }
    } else if (pose === "punch_mid") {
        // Straight punch directly to chest
        fillRect(png, ox + 6, oy + 8, 26, 7, base);
        fillRect(png, ox + 30, oy + 8, 3, 7, cuff);
        fillRect(png, ox + 33, oy + 7, 8, 8, claw);
        fillRect(png, ox + 41, oy + 8, 3, 3, sharp);
    } else if (pose === "punch_low") {
        // Uppercut rising from below
        fillRect(png, ox + 8, oy + 10, 8, 16, base);
        fillRect(png, ox + 14, oy + 4, 8, 8, cuff);
        fillRect(png, ox + 18, oy - 2, 9, 9, claw);
        fillRect(png, ox + 20, oy - 6, 3, 4, sharp);
    } else if (pose === "hurt") {
        // Arms flailed back
        fillRect(png, ox - 10, oy + 2, 6, 14, base);
        fillRect(png, ox - 14, oy + 12, 6, 6, claw);
        fillRect(png, ox + 2, oy + 6, 6, 12, base);
        fillRect(png, ox + 4, oy + 16, 6, 6, claw);
    } else if (pose === "block") {
        // X-Block in front of chest
        fillRect(png, ox + 10, oy + 2, 7, 18, base);
        fillRect(png, ox + 14, oy + 4, 7, 16, PALETTE.suitShadow);
        fillRect(png, ox + 12, oy, 7, 7, claw);
        fillRect(png, ox + 16, oy + 2, 7, 7, claw);
        // Spark
        setPx(png, ox + 18, oy + 8, PALETTE.blueSpark);
        setPx(png, ox + 19, oy + 8, [255, 255, 255]);
        setPx(png, ox + 18, oy + 9, PALETTE.blueSpark);
    } else if (pose === "victory") {
        // Right claw fist thrust into sky
        fillRect(png, ox + 6, oy - 14, 7, 20, base);
        fillRect(png, ox + 7, oy - 16, 5, 3, cuff);
        fillRect(png, ox + 6, oy - 23, 7, 8, claw);
        setPx(png, ox + 7, oy - 24, sharp);
        setPx(png, ox + 9, oy - 24, sharp);
        // Left hand on suit lapel
        fillRect(png, ox - 2, oy + 8, 6, 10, base);
        fillRect(png, ox + 2, oy + 12, 5, 5, claw);
    }
}

// Draw full character inside a 96x96 cell
function drawFighterCell(png, cellCol, cellRow, config) {
    const cx = cellCol * CELL;
    const cy = cellRow * CELL;
    const ox = cx + 46 + (config.shiftX || 0);
    const oy = cy + 42 + (config.shiftY || 0);

    const breath = config.breath || 0;
    const stance = config.stance || "stand";
    const armPose = config.armPose || "guard";
    const roar = !!config.roar;
    const hurt = !!config.hurt;
    const lookUp = !!config.lookUp;
    const tailAng = config.tailAng || 0;

    if (stance === "knockdown_flat") {
        // Full fallen pose on ground
        drawLionHead(png, ox + 12, cy + GROUND_Y - 14, false, false, true);
        fillRect(png, ox - 16, cy + GROUND_Y - 14, 26, 10, PALETTE.suitBase);
        fillRect(png, ox - 34, cy + GROUND_Y - 10, 20, 8, PALETTE.suitShadow);
        fillRect(png, ox - 40, cy + GROUND_Y - 8, 10, 6, PALETTE.shoes);
        return;
    }

    // 1. Feline tail (drawn behind body)
    drawLionTail(png, ox, oy + 8, tailAng);

    // 2. Legs & Shoes (anchored on ground)
    drawLegs(png, ox, oy, stance);

    // 3. Torso / Suit jacket & Tie
    drawSuitTorso(png, ox, oy, breath, config.lean || 0);

    // 4. Lion Head & Mane
    drawLionHead(png, ox, oy, lookUp, roar, hurt);

    // 5. Arms & Claw Paws
    drawArms(png, ox, oy, armPose);

    // 6. Optional Special FX (Sonic rings, golden aura)
    if (config.fx === "sonic_ring") {
        for (let r = 8; r <= 18; r += 4) {
            for (let a = -0.6; a <= 0.6; a += 0.25) {
                const rx = ox + 24 + Math.cos(a) * r;
                const ry = oy + 2 + Math.sin(a) * r;
                setPx(png, rx, ry, PALETTE.goldAura, 220);
                setPx(png, rx + 1, ry, PALETTE.goldCore, 255);
            }
        }
    } else if (config.fx === "super_aura") {
        for (let i = 0; i < 30; i++) {
            const rx = ox - 20 + Math.random() * 45;
            const ry = cy + GROUND_Y - Math.random() * 65;
            setPx(png, rx, ry, PALETTE.goldFire, 180);
            setPx(png, rx, ry - 1, PALETTE.goldAura, 220);
        }
    }
}

// ==============================================================================
// BUILD HOJA 1: MOVIMIENTOS Y COMBATES BÁSICOS (864 x 480 px, 96x96 per cell)
// ==============================================================================
function buildHoja1() {
    console.log("Generating Hoja 1: Movimientos y Combates Básicos (96x96)...");
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    png.data.fill(0); // 100% Transparent background

    // Fila 1 - IDLE (4 cuadros): Respiración enérgica, puños cerrados en guardia frontal
    drawFighterCell(png, 0, 0, { breath: 0, armPose: "guard", tailAng: 0 });
    drawFighterCell(png, 1, 0, { breath: 1, armPose: "guard", tailAng: 1, shiftY: -1 });
    drawFighterCell(png, 2, 0, { breath: 2, armPose: "guard", tailAng: 2, shiftY: -2 });
    drawFighterCell(png, 3, 0, { breath: 1, armPose: "guard", tailAng: 1, shiftY: -1 });

    // Fila 2 - AGACHARSE Y SALTO (6 cuadros):
    // 2 cuadros de agachada rápida, 4 cuadros de salto (impulso, elevación, caída felina, aterrizaje)
    drawFighterCell(png, 0, 1, { stance: "crouch", armPose: "guard", shiftY: 10 }); // Agachada 1 (bajada)
    drawFighterCell(png, 1, 1, { stance: "crouch", armPose: "guard", shiftY: 18 }); // Agachada 2 (crouch pleno)
    drawFighterCell(png, 2, 1, { stance: "crouch", armPose: "guard", shiftY: 14 }); // Salto 1 (Impulso)
    drawFighterCell(png, 3, 1, { stance: "jump", armPose: "guard", shiftY: -18 });  // Salto 2 (Elevación)
    drawFighterCell(png, 4, 1, { stance: "jump", armPose: "punch_high", shiftY: -8 }); // Salto 3 (Caída felina pouncing)
    drawFighterCell(png, 5, 1, { stance: "crouch", armPose: "guard", shiftY: 12 }); // Salto 4 (Aterrizaje firme)

    // Fila 3 - PIÑAS (9 cuadros):
    // Piña alta (3 cuadros), Piña media (3 cuadros), Piña baja (3 cuadros)
    drawFighterCell(png, 0, 2, { armPose: "guard", shiftX: -2 });
    drawFighterCell(png, 1, 2, { armPose: "punch_high", shiftX: 6, lean: 2 });
    drawFighterCell(png, 2, 2, { armPose: "punch_high", shiftX: 4 });

    drawFighterCell(png, 3, 2, { armPose: "guard", shiftX: -1 });
    drawFighterCell(png, 4, 2, { armPose: "punch_mid", shiftX: 6, lean: 3 });
    drawFighterCell(png, 5, 2, { armPose: "punch_mid", shiftX: 2 });

    drawFighterCell(png, 6, 2, { stance: "crouch", armPose: "guard", shiftY: 12 });
    drawFighterCell(png, 7, 2, { stance: "crouch", armPose: "punch_low", shiftY: 8, shiftX: 4 });
    drawFighterCell(png, 8, 2, { stance: "crouch", armPose: "punch_low", shiftY: 10 });

    // Fila 4 - PATADAS (9 cuadros):
    // Patada alta (3 cuadros), Patada media (3 cuadros), Patada baja (3 cuadros)
    drawFighterCell(png, 0, 3, { armPose: "guard", shiftX: -3 });
    drawFighterCell(png, 1, 3, { stance: "kick_high", armPose: "guard", shiftX: 4, lean: -2 });
    drawFighterCell(png, 2, 3, { stance: "kick_high", armPose: "guard", shiftX: 2 });

    drawFighterCell(png, 3, 3, { armPose: "guard", shiftX: -2 });
    drawFighterCell(png, 4, 3, { stance: "kick_high", armPose: "guard", shiftX: 6, shiftY: 6 });
    drawFighterCell(png, 5, 3, { armPose: "guard", shiftX: 1 });

    drawFighterCell(png, 6, 3, { stance: "crouch", armPose: "guard", shiftY: 14 });
    drawFighterCell(png, 7, 3, { stance: "kick_low", armPose: "guard", shiftY: 16, shiftX: 6 });
    drawFighterCell(png, 8, 3, { stance: "crouch", armPose: "guard", shiftY: 12 });

    // Fila 5 - DAÑO Y DERROTA (5 cuadros):
    // 2 cuadros de impacto recibido (hurt), 3 cuadros de caída noqueado al piso (knockdown)
    drawFighterCell(png, 0, 4, { armPose: "hurt", hurt: true, shiftX: -4, lean: -4 });
    drawFighterCell(png, 1, 4, { armPose: "hurt", hurt: true, shiftX: -8, lean: -8, lookUp: true });

    drawFighterCell(png, 2, 4, { stance: "jump", armPose: "hurt", hurt: true, shiftX: -14, shiftY: -10, lean: -12 });
    drawFighterCell(png, 3, 4, { stance: "knockdown", armPose: "hurt", hurt: true, shiftX: -10, shiftY: 10 });
    drawFighterCell(png, 4, 4, { stance: "knockdown_flat", hurt: true });

    const outPath = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja1.png';
    const buf = PNG.sync.write(png);
    fs.writeFileSync(outPath, buf);
    console.log(`Hoja 1 guardada con éxito en: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// ==============================================================================
// BUILD HOJA 2: ESPECIALES, SÚPER, GUARDIA Y VICTORIA (864 x 480 px, 96x96 per cell)
// ==============================================================================
function buildHoja2() {
    console.log("Generating Hoja 2: Especiales, Súper, Bloqueo y Victoria (96x96)...");
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    png.data.fill(0); // 100% Transparent background

    // Fila 1 - RUGIDO DE LA SELVA (Especial 1 - 6 cuadros)
    drawFighterCell(png, 0, 0, { armPose: "guard", shiftX: -2 });
    drawFighterCell(png, 1, 0, { armPose: "guard", lookUp: true, shiftX: -4, breath: 2 });
    drawFighterCell(png, 2, 0, { armPose: "punch_high", roar: true, lookUp: true, fx: "sonic_ring", shiftX: 4 });
    drawFighterCell(png, 3, 0, { armPose: "punch_high", roar: true, fx: "sonic_ring", shiftX: 6 });
    drawFighterCell(png, 4, 0, { armPose: "guard", roar: true, shiftX: 2 });
    drawFighterCell(png, 5, 0, { armPose: "guard", shiftX: 0 });

    // Fila 2 - ZARPAZO FELINO / MORDISCO (Especial 2 - 6 cuadros)
    drawFighterCell(png, 0, 1, { stance: "crouch", armPose: "guard", shiftY: 12, shiftX: -4 });
    drawFighterCell(png, 1, 1, { stance: "jump", armPose: "punch_high", shiftY: 2, shiftX: 6, lean: 8 });
    drawFighterCell(png, 2, 1, { stance: "jump", armPose: "punch_high", shiftY: -10, shiftX: 14, roar: true });
    drawFighterCell(png, 3, 1, { stance: "jump", armPose: "punch_high", shiftY: -4, shiftX: 18 });
    drawFighterCell(png, 4, 1, { stance: "crouch", armPose: "guard", shiftY: 14, shiftX: 10 });
    drawFighterCell(png, 5, 1, { armPose: "guard", shiftX: 0 });

    // Fila 3 - SÚPER ATAQUE / LEÓN ASTRAL SUPREMO (8 cuadros)
    drawFighterCell(png, 0, 2, { armPose: "guard", fx: "super_aura" });
    drawFighterCell(png, 1, 2, { armPose: "guard", roar: true, lookUp: true, fx: "super_aura", breath: 2 });
    drawFighterCell(png, 2, 2, { stance: "jump", armPose: "punch_high", shiftY: -18, fx: "super_aura" });
    drawFighterCell(png, 3, 2, { stance: "jump", armPose: "punch_high", shiftY: -26, roar: true, fx: "super_aura" });
    drawFighterCell(png, 4, 2, { stance: "jump", armPose: "punch_high", shiftY: -12, shiftX: 12, fx: "super_aura" });
    drawFighterCell(png, 5, 2, { stance: "crouch", armPose: "punch_low", shiftY: 12, fx: "super_aura" });
    drawFighterCell(png, 6, 2, { armPose: "victory", shiftX: 2 });
    drawFighterCell(png, 7, 2, { armPose: "guard", shiftX: 0 });

    // Fila 4 - BLOQUEO Y GUARDIA (4 cuadros)
    drawFighterCell(png, 0, 3, { armPose: "block", shiftX: -1 });
    drawFighterCell(png, 1, 3, { armPose: "block", shiftX: -3 });
    drawFighterCell(png, 2, 3, { stance: "crouch", armPose: "block", shiftY: 14 });
    drawFighterCell(png, 3, 3, { stance: "crouch", armPose: "block", shiftY: 14, shiftX: -2 });

    // Fila 5 - VICTORIA Y CELEBRACIÓN (6 cuadros)
    drawFighterCell(png, 0, 4, { armPose: "guard", shiftX: 0 });
    drawFighterCell(png, 1, 4, { armPose: "victory", shiftX: 2, breath: 1 });
    drawFighterCell(png, 2, 4, { armPose: "victory", roar: true, lookUp: true, shiftX: 4, breath: 2 });
    drawFighterCell(png, 3, 4, { armPose: "victory", roar: true, lookUp: true, shiftX: 4, breath: 2 });
    drawFighterCell(png, 4, 4, { armPose: "victory", shiftX: 2, breath: 1 });
    drawFighterCell(png, 5, 4, { armPose: "guard", shiftX: 0 });

    const outPath = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_spritesheet_96x96_hoja2.png';
    const buf = PNG.sync.write(png);
    fs.writeFileSync(outPath, buf);
    console.log(`Hoja 2 guardada con éxito en: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

buildHoja1();
buildHoja2();
console.log("¡Ambas hojas de sprites 96x96 en PNG transparente generadas con éxito!");
