const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Complete 16-character roster mapped to 4x4 grid in character_sprite_sheet.png
const ROSTER_CONFIG = {
    leon: {
        r: 0, c: 0, id: 'leon', name: 'El León',
        theme: { r: 255, g: 215, b: 0 }, fx: 'lion'
    },
    latina: {
        r: 0, c: 1, id: 'latina', name: 'La Jefa',
        theme: { r: 255, g: 200, b: 50 }, fx: 'solar'
    },
    ojosazules: {
        r: 0, c: 2, id: 'ojosazules', name: 'El Ingeniero',
        theme: { r: 255, g: 230, b: 30 }, fx: 'balloon'
    },
    pepeargento: {
        r: 0, c: 3, id: 'pepeargento', name: 'Pepe Argento',
        theme: { r: 80, g: 180, b: 255 }, fx: 'racing'
    },
    eleternauta: {
        r: 1, c: 0, id: 'eleternauta', name: 'El Eternauta',
        theme: { r: 120, g: 240, b: 255 }, fx: 'ice'
    },
    elcomandante: {
        r: 1, c: 1, id: 'elcomandante', name: 'El Comandante',
        theme: { r: 85, g: 225, b: 110 }, fx: 'money'
    },
    elmesias: {
        r: 1, c: 2, id: 'elmesias', name: 'El Mesías',
        theme: { r: 115, g: 210, b: 255 }, fx: 'ball'
    },
    moria: {
        r: 1, c: 3, id: 'moria', name: 'La One',
        theme: { r: 220, g: 80, b: 255 }, fx: 'claws'
    },
    lasu: {
        r: 2, c: 0, id: 'lasu', name: 'La Su',
        theme: { r: 255, g: 220, b: 40 }, fx: 'phone'
    },
    hugo: {
        r: 2, c: 1, id: 'hugo', name: 'Hugo',
        theme: { r: 0, g: 235, b: 245 }, fx: 'sound'
    },
    pergolas: {
        r: 2, c: 2, id: 'pergolas', name: 'Pergolas',
        theme: { r: 50, g: 255, b: 130 }, fx: 'drone'
    },
    sangrejaponesa: {
        r: 2, c: 3, id: 'sangrejaponesa', name: 'Sangre Japonesa',
        theme: { r: 255, g: 60, b: 180 }, fx: 'poison'
    },
    lafaraona: {
        r: 3, c: 0, id: 'lafaraona', name: 'La Faraona',
        theme: { r: 255, g: 90, b: 230 }, fx: 'corn'
    },
    badbitch: {
        r: 3, c: 1, id: 'badbitch', name: 'Bad Bitch',
        theme: { r: 255, g: 150, b: 220 }, fx: 'glitter'
    },
    oidoabsoluto: {
        r: 3, c: 2, id: 'oidoabsoluto', name: 'Oído Absoluto',
        theme: { r: 255, g: 70, b: 70 }, fx: 'piano'
    },
    inmortal: {
        r: 3, c: 3, id: 'inmortal', name: 'Inmortal',
        theme: { r: 255, g: 235, b: 150 }, fx: 'tableware'
    }
};

function setPixel(png, x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= png.width || y < 0 || y >= png.height || a <= 0) return;
    const idx = (png.width * y + x) << 2;
    if (a >= 255) {
        png.data[idx] = r;
        png.data[idx+1] = g;
        png.data[idx+2] = b;
        png.data[idx+3] = 255;
    } else {
        const curA = png.data[idx+3] / 255;
        const newA = a / 255;
        const outA = newA + curA * (1 - newA);
        if (outA > 0) {
            png.data[idx] = Math.round((r * newA + png.data[idx] * curA * (1 - newA)) / outA);
            png.data[idx+1] = Math.round((g * newA + png.data[idx+1] * curA * (1 - newA)) / outA);
            png.data[idx+2] = Math.round((b * newA + png.data[idx+2] * curA * (1 - newA)) / outA);
            png.data[idx+3] = Math.round(outA * 255);
        }
    }
}

function extractCharacter(masterPng, charKey) {
    const info = ROSTER_CONFIG[charKey];
    const colW = 316;
    const rowH = 212;
    const cellH = 172; // strictly cut at 172, feet end at 171 and text starts at 174
    
    const isBg = new Uint8Array(colW * cellH);
    const queue = [];
    
    function isBgPixel(gx, gy) {
        const idx = (masterPng.width * gy + gx) << 2;
        const r = masterPng.data[idx];
        const g = masterPng.data[idx+1];
        const b = masterPng.data[idx+2];
        if (r < 10 && g < 10 && b < 12) return false;
        return (r >= 10 && r <= 46 && g >= 8 && g <= 42 && b >= 14 && b <= 56 && (b >= g - 2));
    }
    
    for (let x = 0; x < colW; x++) {
        queue.push([x, 0]);
        queue.push([x, cellH - 1]);
    }
    for (let y = 0; y < cellH; y++) {
        queue.push([0, y]);
        queue.push([colW - 1, y]);
    }
    
    while (queue.length > 0) {
        const [x, y] = queue.pop();
        if (x < 0 || x >= colW || y < 0 || y >= cellH) continue;
        const pos = y * colW + x;
        if (isBg[pos]) continue;
        
        const gx = info.c * colW + x;
        const gy = info.r * rowH + y;
        if (isBgPixel(gx, gy)) {
            isBg[pos] = 1;
            queue.push([x + 1, y]);
            queue.push([x - 1, y]);
            queue.push([x, y + 1]);
            queue.push([x, y - 1]);
        }
    }
    
    let minX = colW, maxX = 0, minY = cellH, maxY = 0;
    for (let y = 0; y < cellH; y++) {
        for (let x = 75; x < 240; x++) {
            if (!isBg[y * colW + x]) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    
    const bmp = {
        width: w,
        height: h,
        data: new Uint8Array(w * h * 4),
        dominantSuit: { r: 180, g: 180, b: 190 },
        skinTone: { r: 235, g: 180, b: 140 }
    };
    
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const cx = minX + x;
            const cy = minY + y;
            const dstIdx = (y * w + x) << 2;
            if (!isBg[cy * colW + cx]) {
                const gx = info.c * colW + cx;
                const gy = info.r * rowH + cy;
                const srcIdx = (masterPng.width * gy + gx) << 2;
                const r = masterPng.data[srcIdx];
                const g = masterPng.data[srcIdx+1];
                const b = masterPng.data[srcIdx+2];
                bmp.data[dstIdx] = r;
                bmp.data[dstIdx+1] = g;
                bmp.data[dstIdx+2] = b;
                bmp.data[dstIdx+3] = 255;
                
                if (y > h * 0.22 && y < h * 0.34 && r > 170 && g > 120 && b < 170) {
                    bmp.skinTone = { r, g, b };
                }
                if (y > h * 0.45 && y < h * 0.60 && (r + g + b > 80)) {
                    bmp.dominantSuit = { r, g, b };
                }
            } else {
                bmp.data[dstIdx+3] = 0;
            }
        }
    }
    
    // Trim noise borders (rows or cols with fewer than 4 active pixels)
    let trimTop = 0, trimBottom = h - 1, trimLeft = 0, trimRight = w - 1;
    while (trimTop < trimBottom) {
        let count = 0;
        for (let x = 0; x < w; x++) if (bmp.data[(trimTop * w + x) * 4 + 3] > 0) count++;
        if (count >= 4) break;
        trimTop++;
    }
    while (trimBottom > trimTop) {
        let count = 0;
        for (let x = 0; x < w; x++) if (bmp.data[(trimBottom * w + x) * 4 + 3] > 0) count++;
        if (count >= 4) break;
        trimBottom--;
    }
    while (trimLeft < trimRight) {
        let count = 0;
        for (let y = 0; y < h; y++) if (bmp.data[(y * w + trimLeft) * 4 + 3] > 0) count++;
        if (count >= 4) break;
        trimLeft++;
    }
    while (trimRight > trimLeft) {
        let count = 0;
        for (let y = 0; y < h; y++) if (bmp.data[(y * w + trimRight) * 4 + 3] > 0) count++;
        if (count >= 4) break;
        trimRight--;
    }
    
    const finalW = trimRight - trimLeft + 1;
    const finalH = trimBottom - trimTop + 1;
    const cleanBmp = {
        width: finalW,
        height: finalH,
        data: new Uint8Array(finalW * finalH * 4),
        dominantSuit: bmp.dominantSuit,
        skinTone: bmp.skinTone
    };
    for (let y = 0; y < finalH; y++) {
        for (let x = 0; x < finalW; x++) {
            const srcIdx = ((trimTop + y) * w + (trimLeft + x)) << 2;
            const dstIdx = (y * finalW + x) << 2;
            cleanBmp.data[dstIdx] = bmp.data[srcIdx];
            cleanBmp.data[dstIdx+1] = bmp.data[srcIdx+1];
            cleanBmp.data[dstIdx+2] = bmp.data[srcIdx+2];
            cleanBmp.data[dstIdx+3] = bmp.data[srcIdx+3];
        }
    }
    
    return { bmp: cleanBmp, charKey, info };
}

function sampleBmp(bmp, sx, sy) {
    sx = Math.round(sx);
    sy = Math.round(sy);
    if (sx < 0 || sx >= bmp.width || sy < 0 || sy >= bmp.height) {
        return { r: 0, g: 0, b: 0, a: 0 };
    }
    const idx = (sy * bmp.width + sx) << 2;
    return {
        r: bmp.data[idx],
        g: bmp.data[idx+1],
        b: bmp.data[idx+2],
        a: bmp.data[idx+3]
    };
}

function renderDeformedCharacter(png, bmp, anchorX, groundY, transformFn, opts = {}) {
    const w = bmp.width;
    const h = bmp.height;
    const tint = opts.tint || null;
    
    const minDstX = anchorX - Math.floor(w * 0.95);
    const maxDstX = anchorX + Math.floor(w * 1.35);
    const minDstY = groundY - Math.floor(h * 1.35);
    const maxDstY = groundY + 10;
    
    for (let dy = minDstY; dy <= maxDstY; dy++) {
        for (let dx = minDstX; dx <= maxDstX; dx++) {
            const relX = dx - anchorX;
            const relY = groundY - dy;
            
            const src = transformFn(relX, relY, w, h);
            if (!src) continue;
            
            const px = sampleBmp(bmp, src.sx, src.sy);
            if (px.a < 20) continue;
            
            let r = px.r;
            let g = px.g;
            let b = px.b;
            
            if (tint) {
                r = Math.min(255, Math.round(r * (1 - tint.amount) + tint.r * tint.amount));
                g = Math.min(255, Math.round(g * (1 - tint.amount) + tint.g * tint.amount));
                b = Math.min(255, Math.round(b * (1 - tint.amount) + tint.b * tint.amount));
            }
            
            setPixel(png, dx, dy, r, g, b, px.a);
        }
    }
}

function drawThematicSpecialFx(png, x, y, charKey, frameIdx) {
    const info = ROSTER_CONFIG[charKey];
    const theme = info.theme;
    
    switch (info.fx) {
        case 'money':
            for (let i = 0; i < 24 + frameIdx * 14; i++) {
                const bx = x + 35 + ((i * 19) % 80);
                const by = y - 95 + ((i * 31) % 115) - frameIdx * 6;
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -5; dx <= 5; dx++) {
                        const isBorder = (dx === -5 || dx === 5 || dy === -2 || dy === 2);
                        setPixel(png, bx + dx, by + dy, isBorder ? 20 : 75, isBorder ? 140 : 210, isBorder ? 40 : 100, 255);
                    }
                }
                setPixel(png, bx, by, 255, 255, 255, 255);
            }
            break;
            
        case 'lion':
            for (let a = -0.8; a <= 0.8; a += 0.08) {
                const rad = 25 + frameIdx * 18;
                const cx = x + 40 + Math.cos(a) * rad;
                const cy = y - 85 + Math.sin(a) * rad;
                setPixel(png, cx, cy, 255, 225, 60, 255);
                setPixel(png, cx + 1, cy, 255, 170, 20, 220);
                setPixel(png, cx + 2, cy, 255, 255, 255, 240);
            }
            break;
            
        case 'ball':
            const ballX = x + 55 + frameIdx * 16;
            const ballY = y - 55;
            for (let dy = -14; dy <= 14; dy++) {
                for (let dx = -14; dx <= 14; dx++) {
                    if (dx*dx + dy*dy <= 196) {
                        const isWhite = ((Math.abs(dx) + Math.abs(dy)) % 6 < 3);
                        setPixel(png, ballX + dx, ballY + dy, isWhite ? 255 : 110, isWhite ? 255 : 190, 255, 255);
                    }
                }
            }
            for (let i = 0; i < 28; i++) {
                const fx = ballX - 16 - (i % 16);
                const fy = ballY + ((i * 9) % 28) - 14;
                setPixel(png, fx, fy, 255, 215, 0, 240);
                setPixel(png, fx + 1, fy, 255, 255, 255, 200);
            }
            break;
            
        case 'solar':
            for (let sy = y - 165; sy <= y; sy += 2) {
                for (let sx = x + 25; sx <= x + 85; sx++) {
                    const dist = Math.abs(sx - (x + 55));
                    setPixel(png, sx, sy, 255, 220, 80, Math.round(180 * (1 - dist / 30)));
                }
            }
            for (let py = 0; py < 25; py++) {
                for (let px = -py; px <= py; px++) {
                    setPixel(png, x + 55 + px, y - 70 + py, 255, 235, 120, 220);
                }
            }
            break;
            
        case 'ice':
            for (let i = 0; i < 30 + frameIdx * 16; i++) {
                const ix = x + 35 + ((i * 17) % 70);
                const iy = y - 90 + ((i * 23) % 110);
                setPixel(png, ix, iy, 255, 255, 255, 255);
                setPixel(png, ix-1, iy, 120, 240, 255, 240);
                setPixel(png, ix+1, iy, 120, 240, 255, 240);
                setPixel(png, ix, iy-1, 120, 240, 255, 240);
                setPixel(png, ix, iy+1, 120, 240, 255, 240);
            }
            break;
            
        case 'racing':
            const shoeX = x + 50 + frameIdx * 18;
            const shoeY = y - 45;
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -14; dx <= 14; dx++) {
                    if (dx*dx/196 + dy*dy/36 <= 1) {
                        setPixel(png, shoeX + dx, shoeY + dy, 180, 140, 80, 255);
                    }
                }
            }
            for (let f = 0; f < 25; f++) {
                const fx = shoeX - 14 - (f % 14);
                const fy = shoeY + ((f * 5) % 16) - 8;
                setPixel(png, fx, fy, 80, 190, 255, 230);
                setPixel(png, fx - 1, fy, 255, 255, 255, 255);
            }
            break;
            
        case 'balloon':
            const bx = x + 50 + frameIdx * 15;
            const by = y - 80;
            for (let dy = -16; dy <= 16; dy++) {
                for (let dx = -12; dx <= 12; dx++) {
                    if (dx*dx/144 + dy*dy/256 <= 1) {
                        setPixel(png, bx + dx, by + dy, 255, 230, 20, 240);
                    }
                }
            }
            for (let l = 0; l < 18; l++) {
                setPixel(png, bx, by + 16 + l, 220, 220, 220, 220);
            }
            break;
            
        case 'claws':
            for (let c = 0; c < 4; c++) {
                for (let l = 0; l < 25 + frameIdx * 8; l++) {
                    const cx = x + 35 + c * 8 + l;
                    const cy = y - 75 + c * 4 - l * 0.4;
                    setPixel(png, cx, cy, 255, 20, 40, 255);
                    setPixel(png, cx, cy + 1, 200, 0, 80, 220);
                }
            }
            break;
            
        case 'phone':
            const px = x + 52 + frameIdx * 12;
            const py = y - 55;
            for (let dy = -10; dy <= 10; dy++) {
                for (let dx = -14; dx <= 14; dx++) {
                    setPixel(png, px + dx, py + dy, 255, 215, 0, 240);
                }
            }
            for (let a = -1.2; a <= 1.2; a += 0.1) {
                const rx = px + 18 + Math.cos(a) * 16;
                const ry = py + Math.sin(a) * 16;
                setPixel(png, rx, ry, 255, 255, 255, 220);
            }
            break;
            
        case 'sound':
            for (let a = -0.9; a <= 0.9; a += 0.08) {
                const rad = 20 + frameIdx * 18;
                const cx = x + 40 + Math.cos(a) * rad;
                const cy = y - 80 + Math.sin(a) * rad;
                setPixel(png, cx, cy, 0, 240, 255, 240);
                setPixel(png, cx + 1, cy, 255, 255, 255, 220);
            }
            break;
            
        case 'drone':
            const drX = x + 55 + frameIdx * 12;
            const drY = y - 95;
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -18; dx <= 18; dx++) {
                    setPixel(png, drX + dx, drY + dy, 40, 45, 50, 255);
                }
            }
            for (let l = 0; l < 45; l++) {
                setPixel(png, drX + l, drY + l * 0.6, 50, 255, 120, 240);
            }
            break;
            
        case 'poison':
            for (let i = 0; i < 30 + frameIdx * 18; i++) {
                const qx = x + 35 + ((i * 19) % 75);
                const qy = y - 85 + ((i * 27) % 100);
                setPixel(png, qx, qy, 255, 50, 180, 230);
                setPixel(png, qx + 1, qy, 160, 30, 240, 200);
            }
            break;
            
        case 'corn':
            for (let i = 0; i < 24 + frameIdx * 14; i++) {
                const cx = x + 40 + ((i * 17) % 70);
                const cy = y - 70 + ((i * 29) % 95);
                setPixel(png, cx, cy, 255, 240, 80, 255);
                setPixel(png, cx + 1, cy, 255, 120, 220, 220);
            }
            break;
            
        case 'glitter':
            for (let i = 0; i < 36 + frameIdx * 18; i++) {
                const gx = x + 35 + ((i * 23) % 80);
                const gy = y - 85 + ((i * 37) % 110);
                setPixel(png, gx, gy, 255, 255, 255, 255);
                setPixel(png, gx, gy + 1, 255, 150, 220, 220);
            }
            break;
            
        case 'piano':
            const pX = x + 40 + frameIdx * 10;
            const pY = y - 90;
            for (let dy = -16; dy <= 16; dy++) {
                for (let dx = -18; dx <= 18; dx++) {
                    setPixel(png, pX + dx, pY + dy, 20, 20, 25, 255);
                }
            }
            for (let k = -14; k <= 14; k += 4) {
                for (let dy = 6; dy <= 16; dy++) {
                    setPixel(png, pX + k, pY + dy, 255, 255, 255, 255);
                }
            }
            break;
            
        case 'tableware':
            for (let i = 0; i < 18 + frameIdx * 10; i++) {
                const tx = x + 35 + ((i * 21) % 75);
                const ty = y - 95 + ((i * 29) % 110);
                for (let l = -6; l <= 6; l++) {
                    setPixel(png, tx + l, ty, 255, 235, 140, 240);
                    setPixel(png, tx, ty + l, 255, 255, 255, 240);
                }
            }
            break;
            
        default:
            for (let i = 0; i < 28 + frameIdx * 18; i++) {
                const rad = (i * 11) % (40 + frameIdx * 20);
                const ang = (i * 0.7) + frameIdx;
                const px = x + 48 + Math.cos(ang) * rad;
                const py = y - 75 + Math.sin(ang) * rad;
                setPixel(png, px, py, theme.r, theme.g, theme.b, 240);
                setPixel(png, px + 1, py, 255, 255, 255, 220);
            }
            break;
    }
}

// Build complete 768x1600 spritesheet
function buildCharacterSheet(masterPng, charKey) {
    const { bmp, info } = extractCharacter(masterPng, charKey);
    const sheet = new PNG({ width: 768, height: 1600 });
    sheet.data.fill(0);
    
    const w = bmp.width;
    const h = bmp.height;
    
    // Row 0: Portrait (15, 10, 90, 70)
    const headH = Math.floor(h * 0.44);
    const portMidX = 15 + 45;
    const portMidY = 10 + 42;
    for (let sy = 0; sy < headH; sy++) {
        for (let sx = 0; sx < w; sx++) {
            const px = sampleBmp(bmp, sx, sy);
            if (px.a < 20) continue;
            setPixel(sheet, portMidX + (sx - w / 2), portMidY - headH / 2 + sy, px.r, px.g, px.b, px.a);
        }
    }
    
    // Row 1: Idle (ground = 255)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 255, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - ry
    }));
    renderDeformedCharacter(sheet, bmp, 145 + 60, 255, (rx, ry, w, h) => {
        const lift = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * 3;
        return {
            sx: w / 2 + rx * 0.98,
            sy: h - (ry - lift)
        };
    });
    renderDeformedCharacter(sheet, bmp, 275 + 60, 255, (rx, ry, w, h) => {
        const settle = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * -1;
        return {
            sx: w / 2 + rx * 1.01,
            sy: h - (ry - settle)
        };
    });
    
    // Row 2: Walk (ground = 440)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 440, (rx, ry, w, h) => {
        const isLegs = ry < h * 0.42;
        const legSkew = isLegs ? (rx > 0 ? 4 : -4) : 0;
        const torsoSway = isLegs ? 0 : 2;
        return {
            sx: w / 2 + rx - legSkew - torsoSway,
            sy: h - (ry + 1)
        };
    });
    renderDeformedCharacter(sheet, bmp, 145 + 60, 440, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry - 3)
    }));
    renderDeformedCharacter(sheet, bmp, 275 + 60, 440, (rx, ry, w, h) => {
        const isLegs = ry < h * 0.42;
        const legSkew = isLegs ? (rx < 0 ? 4 : -4) : 0;
        const torsoSway = isLegs ? 0 : -2;
        return {
            sx: w / 2 + rx - legSkew - torsoSway,
            sy: h - (ry + 1)
        };
    });
    renderDeformedCharacter(sheet, bmp, 405 + 60, 440, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry - 2)
    }));
    
    // Row 3: Jump, Crouch, Block (ground = 625)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 625, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry * 1.2 - 8)
    }));
    renderDeformedCharacter(sheet, bmp, 145 + 60, 625, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry + 28)
    }));
    renderDeformedCharacter(sheet, bmp, 275 + 60, 625, (rx, ry, w, h) => ({
        sx: w / 2 + rx * 0.95,
        sy: h - (ry * 1.45)
    }));
    renderDeformedCharacter(sheet, bmp, 405 + 60, 625, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 4,
        sy: h - ry
    }), { tint: { r: 100, g: 200, b: 255, amount: 0.25 } });
    
    // Row 4: Punch Light & Heavy (ground = 810)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 810, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 4,
        sy: h - ry
    }));
    renderDeformedCharacter(sheet, bmp, 145 + 60, 810, (rx, ry, w, h) => {
        const lunge = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * 12;
        return {
            sx: w / 2 + rx - lunge,
            sy: h - ry
        };
    });
    for (let dx = 35; dx <= 52; dx++) {
        setPixel(sheet, 145 + 60 + dx, 810 - h * 0.55, 255, 255, 255, 255);
        setPixel(sheet, 145 + 60 + dx, 810 - h * 0.55 + 1, bmp.dominantSuit.r, bmp.dominantSuit.g, bmp.dominantSuit.b, 220);
    }
    renderDeformedCharacter(sheet, bmp, 285 + 60, 810, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 6,
        sy: h - (ry * 1.1)
    }));
    renderDeformedCharacter(sheet, bmp, 415 + 60, 810, (rx, ry, w, h) => {
        const lunge = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * 18;
        return {
            sx: w / 2 + rx - lunge,
            sy: h - (ry - 4)
        };
    });
    for (let i = 0; i < 22; i++) {
        const sx = 415 + 60 + 35 + ((i * 5) % 22);
        const sy = 810 - h * 0.65 - ((i * 7) % 28);
        setPixel(sheet, sx, sy, 255, 220, 60, 240);
        setPixel(sheet, sx + 1, sy, 255, 255, 255, 255);
    }
    
    // Row 5: Kick Light & Heavy (ground = 995)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 995, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 3,
        sy: h - ry
    }));
    renderDeformedCharacter(sheet, bmp, 145 + 60, 995, (rx, ry, w, h) => {
        const isLeg = ry < h * 0.40 && rx > 0;
        return {
            sx: w / 2 + rx - (isLeg ? 14 : 4),
            sy: h - ry
        };
    });
    for (let dx = 30; dx <= 46; dx++) {
        setPixel(sheet, 145 + 60 + dx, 995 - h * 0.30, 255, 255, 255, 240);
    }
    renderDeformedCharacter(sheet, bmp, 285 + 60, 995, (rx, ry, w, h) => ({
        sx: w / 2 + rx * 0.9 + (ry / h) * 4,
        sy: h - (ry - 4)
    }));
    renderDeformedCharacter(sheet, bmp, 415 + 60, 995, (rx, ry, w, h) => {
        const isLeg = ry < h * 0.45 && rx > -w * 0.2;
        const kickOffset = isLeg ? Math.max(0, 1 - Math.abs(ry - h * 0.35) / (h * 0.2)) * 16 : 0;
        return {
            sx: w / 2 + rx - kickOffset - 4,
            sy: h - (ry - 4)
        };
    });
    for (let a = -0.6; a <= 0.8; a += 0.08) {
        const ax = 415 + 60 + 38 + Math.cos(a) * 20;
        const ay = 995 - h * 0.45 + Math.sin(a) * 20;
        setPixel(sheet, ax, ay, 255, 255, 255, 255);
        setPixel(sheet, ax + 1, ay, info.theme.r, info.theme.g, info.theme.b, 220);
    }
    
    // Row 6: Special Moves (ground = 1180)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 1180, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry - 2)
    }), { tint: { r: 255, g: 255, b: 200, amount: 0.25 } });
    drawThematicSpecialFx(sheet, 15 + 60, 1180, charKey, 0);
    
    renderDeformedCharacter(sheet, bmp, 155 + 60, 1180, (rx, ry, w, h) => {
        const lunge = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * 14;
        return {
            sx: w / 2 + rx - lunge,
            sy: h - (ry - 2)
        };
    }, { tint: { r: 255, g: 255, b: 255, amount: 0.35 } });
    drawThematicSpecialFx(sheet, 155 + 60, 1180, charKey, 1);
    
    renderDeformedCharacter(sheet, bmp, 305 + 60, 1180, (rx, ry, w, h) => {
        const lunge = Math.max(0, (ry - h * 0.35) / (h * 0.65)) * 18;
        return {
            sx: w / 2 + rx - lunge,
            sy: h - (ry - 2)
        };
    });
    drawThematicSpecialFx(sheet, 305 + 60, 1180, charKey, 2);
    
    // Row 7: Hurt & Dizzy (ground = 1365)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 1365, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 12,
        sy: h - ry
    }), { tint: { r: 255, g: 50, b: 50, amount: 0.35 } });
    renderDeformedCharacter(sheet, bmp, 145 + 60, 1365, (rx, ry, w, h) => ({
        sx: w / 2 + rx + (ry / h) * 5,
        sy: h - ry
    }));
    renderDeformedCharacter(sheet, bmp, 275 + 60, 1365, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry + 2)
    }));
    for (let s = 0; s < 3; s++) {
        const starX = 275 + 60 + (s - 1) * 16;
        const starY = 1365 - h - 10 + (s % 2) * 4;
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                setPixel(sheet, starX + dx, starY + dy, 255, 255, 0, 255);
            }
        }
    }
    renderDeformedCharacter(sheet, bmp, 405 + 60, 1365, (rx, ry, w, h) => ({
        sx: w / 2 + rx - (ry / h) * 5,
        sy: h - ry
    }));
    
    // Row 8: Defeat Kneeling, Dead KO, Victory (ground = 1550)
    renderDeformedCharacter(sheet, bmp, 15 + 60, 1550, (rx, ry, w, h) => ({
        sx: w / 2 + rx * 0.95 - 4,
        sy: h - (ry * 1.55)
    }));
    for (let sy = 0; sy < h; sy++) {
        for (let sx = 0; sx < w; sx++) {
            const px = sampleBmp(bmp, sx, sy);
            if (px.a < 20) continue;
            const rx = (h - sy) - h / 2;
            const ry = (sx - w / 2) * 0.52;
            setPixel(sheet, 150 + 85 + rx, 1550 - 14 + ry, px.r, px.g, px.b, 255);
        }
    }
    renderDeformedCharacter(sheet, bmp, 335 + 60, 1550, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry - 4)
    }));
    renderDeformedCharacter(sheet, bmp, 465 + 60, 1550, (rx, ry, w, h) => ({
        sx: w / 2 + rx,
        sy: h - (ry - 6)
    }), { tint: { r: 255, g: 240, b: 180, amount: 0.18 } });
    for (let v = 0; v < 22; v++) {
        const vx = 465 + 60 + ((v * 19) % 75) - 37;
        const vy = 1550 - h - 14 - ((v * 13) % 42);
        setPixel(sheet, vx, vy, 255, 215, 0, 240);
        setPixel(sheet, vx + 1, vy, 255, 255, 255, 255);
    }
    
    return sheet;
}

// Main execution: generate all 16 character sheets
async function generateAll() {
    console.log('Loading character_sprite_sheet.png...');
    const masterBuffer = fs.readFileSync('character_sprite_sheet.png');
    const masterPng = PNG.sync.read(masterBuffer);
    console.log('Master sheet loaded: ' + masterPng.width + 'x' + masterPng.height);
    
    const outDir = path.join(__dirname, '..', 'assets', 'sprites');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    
    const keys = Object.keys(ROSTER_CONFIG);
    console.log(`Starting generation for ${keys.length} characters...`);
    
    for (let i = 0; i < keys.length; i++) {
        const charKey = keys[i];
        const info = ROSTER_CONFIG[charKey];
        process.stdout.write(`[${i + 1}/${keys.length}] Generating ${info.name} (${charKey})... `);
        
        const startTime = Date.now();
        const sheet = buildCharacterSheet(masterPng, charKey);
        const fileName = `${charKey}_spritesheet.png`;
        const filePath = path.join(outDir, fileName);
        
        fs.writeFileSync(filePath, PNG.sync.write(sheet));
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`OK (${elapsed}s) -> ${fileName}`);
    }
    
    console.log('\nAll 16 spritesheets successfully generated in assets/sprites/!');
}

generateAll().catch(err => {
    console.error('Fatal error generating spritesheets:', err);
    process.exit(1);
});
