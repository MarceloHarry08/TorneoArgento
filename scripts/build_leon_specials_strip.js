// ==============================================================================
// TORNEO ARGENTO 16-BIT - EL LEÓN: SPECIAL ATTACKS SPRITE SHEET GENERATOR
// Standard 300x298 cells | Total: 1200 x 1192 px (4 columns x 4 rows)
// Row 0: MICRÓFONO (Ataque con micrófono retro de metal y ondas sónicas)
// Row 1: MOTOSIERRA (Ataque con motosierra rugiente y chispas)
// Row 2: RUGIDO (Onda sónica dorada expansiva)
// Row 3: MORDISCO SALVAJE / LEÓN ASTRAL (Salto depredador y fauces astrales)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const PROJECT_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight';
const LOCAL_DIR = 'c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/godot';

const stdBasePath = 'test_extracted/std_base.png';
const base = PNG.sync.read(fs.readFileSync(stdBasePath));

const CELL_W = 300;
const CELL_H = 298;
const COLS = 4;
const ROWS = 4;

const sheet = new PNG({ width: CELL_W * COLS, height: CELL_H * ROWS });
sheet.data.fill(0); // 100% Transparent

// Drawing utilities
function setPx(dst, x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= dst.width || y < 0 || y >= dst.height || a <= 0) return;
    const idx = (y * dst.width + x) * 4;
    if (a >= 255) {
        dst.data[idx] = r;
        dst.data[idx + 1] = g;
        dst.data[idx + 2] = b;
        dst.data[idx + 3] = 255;
    } else {
        const curA = dst.data[idx + 3] / 255;
        const newA = a / 255;
        const outA = newA + curA * (1 - newA);
        if (outA > 0) {
            dst.data[idx] = Math.round((r * newA + dst.data[idx] * curA * (1 - newA)) / outA);
            dst.data[idx + 1] = Math.round((g * newA + dst.data[idx + 1] * curA * (1 - newA)) / outA);
            dst.data[idx + 2] = Math.round((b * newA + dst.data[idx + 2] * curA * (1 - newA)) / outA);
            dst.data[idx + 3] = Math.round(outA * 255);
        }
    }
}

function fillRect(dst, x0, y0, w, h, r, g, b, a = 255) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            setPx(dst, x0 + dx, y0 + dy, r, g, b, a);
        }
    }
}

function drawLine(dst, x0, y0, x1, y1, thick, r, g, b, a = 255) {
    const dx = x1 - x0, dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1) * 2;
    const rad = thick / 2;
    for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        for (let oy = -Math.ceil(rad); oy <= Math.ceil(rad); oy++) {
            for (let ox = -Math.ceil(rad); ox <= Math.ceil(rad); ox++) {
                if (ox * ox + oy * oy <= rad * rad) {
                    setPx(dst, cx + ox, cy + oy, r, g, b, a);
                }
            }
        }
    }
}

function drawArc(dst, cx, cy, radius, startAngle, endAngle, thick, r, g, b, a = 255) {
    const steps = Math.ceil(radius * Math.abs(endAngle - startAngle) * 2);
    for (let s = 0; s <= steps; s++) {
        const theta = startAngle + (endAngle - startAngle) * (s / Math.max(1, steps));
        const px = cx + Math.cos(theta) * radius;
        const py = cy + Math.sin(theta) * radius;
        for (let oy = -Math.ceil(thick / 2); oy <= Math.ceil(thick / 2); oy++) {
            for (let ox = -Math.ceil(thick / 2); ox <= Math.ceil(thick / 2); ox++) {
                if (ox * ox + oy * oy <= (thick / 2) * (thick / 2)) {
                    setPx(dst, px + ox, py + oy, r, g, b, a);
                }
            }
        }
    }
}

function copyBaseBody(dst, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < base.height; y++) {
        for (let x = 0; x < base.width; x++) {
            const s = (y * base.width + x) * 4;
            if (base.data[s + 3] > 30) {
                const dx = x + offsetX;
                const dy = y + offsetY;
                if (dx >= 0 && dx < dst.width && dy >= 0 && dy < dst.height) {
                    const d = (dy * dst.width + dx) * 4;
                    for (let k = 0; k < 4; k++) dst.data[d + k] = base.data[s + k];
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------
// 1. DIBUJAR MICRÓFONO RETRO Y ONDAS SÓNICAS
// -----------------------------------------------------------------------------
function drawMicrophone(cell, micX, micY, angleRad = 0, blastLevel = 0) {
    const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
    
    // Función de transformación local del micrófono
    function mPx(lx, ly) {
        return [micX + lx * cos - ly * sin, micY + lx * sin + ly * cos];
    }

    // Cable del micrófono colgando en bucle dinámico
    const [c0x, c0y] = mPx(0, 24);
    drawLine(cell, c0x, c0y, c0x - 8, c0y + 16, 2, 20, 20, 25);
    drawLine(cell, c0x - 8, c0y + 16, c0x + 4, c0y + 32, 2, 25, 25, 30);
    drawLine(cell, c0x + 4, c0y + 32, c0x - 12, c0y + 48, 2, 15, 15, 20);

    // Mango negro/cromo (lx: -3..3, ly: 5..24)
    for (let ly = 6; ly <= 24; ly++) {
        for (let lx = -3; lx <= 3; lx++) {
            const [gx, gy] = mPx(lx, ly);
            const col = (lx === -1 || lx === 0) ? [85, 90, 105] : [30, 32, 38];
            setPx(cell, gx, gy, col[0], col[1], col[2]);
        }
    }

    // Conector y cuello plateado
    for (let ly = 1; ly <= 5; ly++) {
        for (let lx = -4; lx <= 4; lx++) {
            const [gx, gy] = mPx(lx, ly);
            const col = (lx < 0) ? [235, 240, 250] : [140, 145, 160];
            setPx(cell, gx, gy, col[0], col[1], col[2]);
        }
    }

    // Cabeza del Micrófono Shure 55SH (Forma de gota/elipse retro cromada con rejilla)
    const headW = 9, headH = 14;
    for (let ly = -headH; ly <= 0; ly++) {
        const factor = Math.cos((ly / headH) * 1.3);
        const wAtY = Math.round(headW * factor);
        for (let lx = -wAtY; lx <= wAtY; lx++) {
            const [gx, gy] = mPx(lx, ly);
            
            // Rejilla interna negra/azul
            let r = 25, g = 30, b = 45;
            
            // Varillas horizontales cromadas de la rejilla
            if (Math.abs(ly) % 3 === 0) {
                r = 210; g = 215; b = 225;
            }
            // Varilla vertical central cromada y borde
            if (lx === 0 || Math.abs(lx) === wAtY) {
                r = 240; g = 245; b = 255;
            } else if (lx === -1) {
                r = 255; g = 255; b = 255; // Brillo especular
            }
            setPx(cell, gx, gy, r, g, b);
        }
    }

    // Ondas sónicas expansivas en el disparo
    if (blastLevel > 0) {
        const [tipX, tipY] = mPx(0, -headH - 2);
        const arcSpread = 0.7; // Ángulo de apertura
        const baseAngle = angleRad - Math.PI / 2;

        if (blastLevel >= 1) {
            drawArc(cell, tipX, tipY, 18, baseAngle - arcSpread, baseAngle + arcSpread, 2, 100, 220, 255, 220);
            drawArc(cell, tipX, tipY, 28, baseAngle - arcSpread * 1.1, baseAngle + arcSpread * 1.1, 3, 60, 180, 255, 200);
        }
        if (blastLevel >= 2) {
            drawArc(cell, tipX, tipY, 42, baseAngle - arcSpread * 1.2, baseAngle + arcSpread * 1.2, 4, 180, 240, 255, 240);
            drawArc(cell, tipX, tipY, 60, baseAngle - arcSpread * 1.3, baseAngle + arcSpread * 1.3, 3, 40, 160, 255, 180);
            drawArc(cell, tipX, tipY, 78, baseAngle - arcSpread * 1.4, baseAngle + arcSpread * 1.4, 2, 220, 250, 255, 150);

            // Chispas acústicas de alto impacto
            for (let i = 0; i < 16; i++) {
                const spDist = 30 + (i * 5) % 55;
                const spAng = baseAngle + ((i - 8) / 8.0) * arcSpread * 1.4;
                const sx = tipX + Math.cos(spAng) * spDist;
                const sy = tipY + Math.sin(spAng) * spDist;
                setPx(cell, sx, sy, 255, 255, 255);
                setPx(cell, sx + 1, sy, 120, 220, 255);
                setPx(cell, sx, sy + 1, 120, 220, 255);
            }
        }
    }
}

// -----------------------------------------------------------------------------
// 2. DIBUJAR MOTOSIERRA Y CHISPAS
// -----------------------------------------------------------------------------
function drawChainsaw(cell, csX, csY, angleRad = 0, isRevving = false, hasSlash = false) {
    const cos = Math.cos(angleRad), sin = Math.sin(angleRad);
    function csPx(lx, ly) {
        return [csX + lx * cos - ly * sin, csY + lx * sin + ly * cos];
    }

    // 1. Mango trasero negro (lx: -22..-12, ly: -6..6)
    for (let ly = -6; ly <= 6; ly++) {
        for (let lx = -22; lx <= -12; lx++) {
            if (Math.abs(ly) >= 4 || lx <= -19) {
                const [gx, gy] = csPx(lx, ly);
                setPx(cell, gx, gy, 28, 28, 32);
            }
        }
    }

    // 2. Bloque de Motor Stihl Naranja / Amarillo (lx: -12..14, ly: -12..10)
    for (let ly = -12; ly <= 10; ly++) {
        for (let lx = -12; lx <= 14; lx++) {
            const [gx, gy] = csPx(lx, ly);
            let r = 245, g = 100, b = 15; // Naranja Stihl
            if (ly < -6) {
                r = 255; g = 140; b = 30; // Brillo superior
            } else if (lx < -4 && ly > 2) {
                r = 250; g = 200, b = 25; // Detalle amarillo
            } else if (ly > 6 || lx > 10) {
                r = 180; g = 60, b = 10; // Sombra
            }
            setPx(cell, gx, gy, r, g, b);
        }
    }

    // Filtro de aire y arrancador negro (lx: -10..-2, ly: -11..-3)
    for (let ly = -11; ly <= -5; ly++) {
        for (let lx = -10; lx <= -2; lx++) {
            const [gx, gy] = csPx(lx, ly);
            setPx(cell, gx, gy, 40, 40, 48);
        }
    }

    // Mango superior tubular negro (arco sobre el motor)
    for (let lx = -8; lx <= 10; lx += 2) {
        const [gx, gy] = csPx(lx, -16);
        setPx(cell, gx, gy, 35, 35, 42);
        setPx(cell, gx, gy + 1, 60, 60, 70);
    }

    // 3. Espada / Barra de corte de acero (lx: 14..72, ly: -6..6)
    const barLen = 58;
    for (let ly = -5; ly <= 5; ly++) {
        for (let lx = 14; lx <= 14 + barLen; lx++) {
            // Punta redondeada de la espada
            const distFromTip = (14 + barLen) - lx;
            if (distFromTip < 6 && Math.abs(ly) > (distFromTip)) continue;

            const [gx, gy] = csPx(lx, ly);
            let r = 200, g = 205, b = 215; // Acero
            if (ly === -5 || ly === 5) {
                r = 140; g = 145; b = 155; // Ranura de la cadena
            } else if (ly === 0) {
                r = 230; g = 235; b = 245; // Reflejo central
            }
            setPx(cell, gx, gy, r, g, b);
        }
    }

    // 4. Cadena dentada con dientes en movimiento
    const tOffset = isRevving ? (Math.random() > 0.5 ? 2 : 0) : 0;
    for (let lx = 15; lx <= 14 + barLen; lx += 4) {
        // Diente superior
        const [gx1, gy1] = csPx(lx + tOffset, -7);
        setPx(cell, gx1, gy1, 255, 255, 255);
        const [gx1b, gy1b] = csPx(lx + tOffset - 1, -6);
        setPx(cell, gx1b, gy1b, 40, 42, 50);

        // Diente inferior
        const [gx2, gy2] = csPx(lx + tOffset, 7);
        setPx(cell, gx2, gy2, 255, 255, 255);
        const [gx2b, gy2b] = csPx(lx + tOffset - 1, 6);
        setPx(cell, gx2b, gy2b, 40, 42, 50);
    }
    // Dientes en la punta
    const [ptX, ptY] = csPx(14 + barLen + 2, 0);
    setPx(cell, ptX, ptY, 255, 255, 255);
    setPx(cell, ptX - 1, ptY - 3, 255, 255, 255);
    setPx(cell, ptX - 1, ptY + 3, 255, 255, 255);

    // 5. Chispas y humo si está acelerando o cortando
    if (isRevving || hasSlash) {
        const [tipX, tipY] = csPx(14 + barLen + 4, 0);
        const sparkCount = hasSlash ? 28 : 12;
        for (let i = 0; i < sparkCount; i++) {
            const sDist = 8 + Math.random() * (hasSlash ? 55 : 25);
            const sAng = angleRad + (Math.random() - 0.5) * (hasSlash ? 1.5 : 0.8);
            const sx = tipX + Math.cos(sAng) * sDist;
            const sy = tipY + Math.sin(sAng) * sDist;
            const isWhite = Math.random() > 0.4;
            setPx(cell, sx, sy, 255, isWhite ? 255 : 180, isWhite ? 200 : 30);
        }

        if (hasSlash) {
            // Estela luminosa de corte en arco (slash arc)
            drawArc(cell, csX, csY, barLen + 15, angleRad - 0.8, angleRad + 0.8, 5, 255, 170, 30, 220);
            drawArc(cell, csX, csY, barLen + 17, angleRad - 0.6, angleRad + 0.6, 3, 255, 240, 120, 255);
        }
    }
}

// -----------------------------------------------------------------------------
// 3. DIBUJAR RUGIDO DE LA SELVA (Ondas doradas y aura felina)
// -----------------------------------------------------------------------------
function drawRoarWaves(cell, mouthX, mouthY, level = 1) {
    const baseAngle = 0; // Hacia la derecha
    const spread = 0.75;

    // Aura dorada sobre la cabeza y melena de Milei
    const auraCol = [255, 210, 40];
    const auraHi = [255, 245, 150];

    for (let i = 0; i < 20; i++) {
        const ax = mouthX - 35 + (i * 4) % 65;
        const ay = mouthY - 45 + ((i * 7) % 55);
        setPx(cell, ax, ay, auraHi[0], auraHi[1], auraHi[2], 140);
        setPx(cell, ax + 1, ay, auraCol[0], auraCol[1], auraCol[2], 120);
    }

    // Ondas sónicas expansivas doradas
    if (level >= 1) {
        drawArc(cell, mouthX, mouthY, 22, -spread, spread, 3, 255, 215, 50, 240);
        drawArc(cell, mouthX, mouthY, 36, -spread * 1.1, spread * 1.1, 4, 255, 185, 25, 220);
    }
    if (level >= 2) {
        drawArc(cell, mouthX, mouthY, 54, -spread * 1.2, spread * 1.2, 5, 255, 230, 90, 250);
        drawArc(cell, mouthX, mouthY, 74, -spread * 1.3, spread * 1.3, 4, 240, 160, 20, 210);
        drawArc(cell, mouthX, mouthY, 96, -spread * 1.4, spread * 1.4, 3, 255, 200, 40, 180);

        // Partículas doradas temblorosas
        for (let i = 0; i < 24; i++) {
            const dist = 35 + Math.random() * 85;
            const ang = (Math.random() - 0.5) * spread * 2.2;
            const px = mouthX + Math.cos(ang) * dist;
            const py = mouthY + Math.sin(ang) * dist;
            setPx(cell, px, py, 255, 255, 200, 230);
            setPx(cell, px + 1, py, 255, 190, 40, 180);
        }
    }
}

// -----------------------------------------------------------------------------
// 4. DIBUJAR MORDISCO SALVAJE / FAUCES DEL LEÓN ASTRAL
// -----------------------------------------------------------------------------
function drawAstralBite(cell, jawX, jawY, openFactor = 1.0, isImpact = false) {
    // Mandíbula astral dorada translúcida
    const upperY = jawY - Math.round(openFactor * 26);
    const lowerY = jawY + Math.round(openFactor * 26);

    // Mandíbula Superior
    drawArc(cell, jawX, upperY, 38, -2.4, -0.6, 6, 255, 195, 30, 210);
    drawArc(cell, jawX, upperY, 40, -2.2, -0.8, 3, 255, 245, 140, 240);

    // Colmillos Superiores (3 colmillos prominentes)
    for (let f = -1; f <= 1; f++) {
        const fx = jawX + f * 14 + 10;
        const fy = upperY + 22;
        drawLine(cell, fx, fy, fx + 2, fy + 14, 3, 255, 255, 240, 250);
        drawLine(cell, fx - 1, fy, fx + 1, fy + 12, 1, 230, 210, 150, 220);
    }

    // Mandíbula Inferior
    drawArc(cell, jawX, lowerY, 36, 0.6, 2.4, 5, 240, 170, 20, 200);
    drawArc(cell, jawX, lowerY, 38, 0.8, 2.2, 3, 255, 240, 130, 240);

    // Colmillos Inferiores (3 colmillos hacia arriba)
    for (let f = -1; f <= 1; f++) {
        const fx = jawX + f * 14 + 10;
        const fy = lowerY - 20;
        drawLine(cell, fx, fy, fx + 2, fy - 14, 3, 255, 255, 240, 250);
        drawLine(cell, fx - 1, fy, fx + 1, fy - 12, 1, 230, 210, 150, 220);
    }

    // Destello de impacto del mordisco al cerrar
    if (isImpact) {
        for (let i = 0; i < 32; i++) {
            const rad = Math.random() * 45;
            const ang = Math.random() * Math.PI * 2;
            const ix = jawX + 15 + Math.cos(ang) * rad;
            const iy = jawY + Math.sin(ang) * rad;
            setPx(cell, ix, iy, 255, 255, 255, 250);
            setPx(cell, ix + 1, iy, 255, 210, 40, 200);
        }
    }
}

// -----------------------------------------------------------------------------
// ENSAMBLAR LOS 16 FOTOGRAMAS
// -----------------------------------------------------------------------------

function blitCell(cell, col, row) {
    const startX = col * CELL_W;
    const startY = row * CELL_H;
    for (let y = 0; y < CELL_H; y++) {
        for (let x = 0; x < CELL_W; x++) {
            const s = (y * CELL_W + x) * 4;
            const d = ((startY + y) * sheet.width + (startX + x)) * 4;
            for (let k = 0; k < 4; k++) sheet.data[d + k] = cell.data[s + k];
        }
    }
}

console.log('Building Row 0: MICRÓFONO (4 frames)...');
// ROW 0: MICRÓFONO
for (let f = 0; f < 4; f++) {
    const cell = new PNG({ width: CELL_W, height: CELL_H });
    cell.data.fill(0);
    copyBaseBody(cell, 0, 0);

    // Frame 0: Sacando el micrófono
    // Frame 1: Levantando el micrófono al pecho
    // Frame 2: Estocada / Grito al micrófono con estallido de ondas sónicas
    // Frame 3: Sosteniendo el micrófono al frente
    if (f === 0) {
        drawMicrophone(cell, 192, 160, 0.4, 0);
    } else if (f === 1) {
        drawMicrophone(cell, 196, 142, 0.15, 1);
    } else if (f === 2) {
        drawMicrophone(cell, 232, 126, -0.25, 2);
    } else if (f === 3) {
        drawMicrophone(cell, 218, 134, -0.1, 1);
    }
    blitCell(cell, f, 0);
}

console.log('Building Row 1: MOTOSIERRA (4 frames)...');
// ROW 1: MOTOSIERRA
for (let f = 0; f < 4; f++) {
    const cell = new PNG({ width: CELL_W, height: CELL_H });
    cell.data.fill(0);
    copyBaseBody(cell, 0, 0);

    if (f === 0) {
        // Arrancador
        drawChainsaw(cell, 186, 165, -0.4, false, false);
    } else if (f === 1) {
        // Acelerando con humo y chispas
        drawChainsaw(cell, 198, 150, -0.15, true, false);
    } else if (f === 2) {
        // Tajo de motosierra con arco llameante
        drawChainsaw(cell, 222, 136, 0.25, true, true);
    } else if (f === 3) {
        // Recorrido final
        drawChainsaw(cell, 212, 146, 0.1, true, false);
    }
    blitCell(cell, f, 1);
}

console.log('Building Row 2: RUGIDO (4 frames)...');
// ROW 2: RUGIDO
for (let f = 0; f < 4; f++) {
    const cell = new PNG({ width: CELL_W, height: CELL_H });
    cell.data.fill(0);
    const bob = (f === 1 || f === 2) ? -2 : 0;
    copyBaseBody(cell, 0, bob);

    const mouthX = 175, mouthY = 68 + bob;
    if (f === 0) {
        drawRoarWaves(cell, mouthX, mouthY, 0);
    } else if (f === 1) {
        drawRoarWaves(cell, mouthX, mouthY, 1);
    } else if (f === 2) {
        drawRoarWaves(cell, mouthX, mouthY, 2);
    } else if (f === 3) {
        drawRoarWaves(cell, mouthX, mouthY, 1);
    }
    blitCell(cell, f, 2);
}

console.log('Building Row 3: MORDISCO SALVAJE / LEÓN ASTRAL (4 frames)...');
// ROW 3: MORDISCO SALVAJE
for (let f = 0; f < 4; f++) {
    const cell = new PNG({ width: CELL_W, height: CELL_H });
    cell.data.fill(0);
    const fwdX = (f === 1) ? 14 : ((f === 2) ? 22 : ((f === 3) ? 10 : 0));
    const leapY = (f === 1) ? -12 : ((f === 2) ? -6 : 0);
    copyBaseBody(cell, fwdX, leapY);

    const jawX = 188 + fwdX, jawY = 110 + leapY;
    if (f === 0) {
        drawAstralBite(cell, jawX, jawY, 0.9, false);
    } else if (f === 1) {
        drawAstralBite(cell, jawX + 10, jawY, 1.2, false);
    } else if (f === 2) {
        // Mordisco cerrado con impacto
        drawAstralBite(cell, jawX + 16, jawY, 0.2, true);
    } else if (f === 3) {
        drawAstralBite(cell, jawX + 6, jawY, 0.4, false);
    }
    blitCell(cell, f, 3);
}

// Write to both project directories
const sheetBuf = PNG.sync.write(sheet);
const outLocal = path.join(LOCAL_DIR, 'assets/sprites/leon_specials.png');
const outGame = path.join(PROJECT_DIR, 'assets/sprites/leon_specials.png');

fs.writeFileSync(outLocal, sheetBuf);
if (fs.existsSync(path.dirname(outGame))) {
    fs.writeFileSync(outGame, sheetBuf);
}

console.log('Successfully generated leon_specials.png (1200 x 1192 px, 16 frames) in both locations!');
