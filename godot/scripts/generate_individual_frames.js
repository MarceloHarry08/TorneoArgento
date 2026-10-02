const fs = require('fs');
const path = require('path');
const { PNG } = require('c:/Users/marce/.gemini/antigravity-ide/scratch/torneo-argento 2/node_modules/pngjs');

const PROJECT_DIR = 'C:/Users/marce/OneDrive/Documentos/juego-fight';
const MASTER_IMG_PATH = path.join(PROJECT_DIR, 'assets/character_sprite_sheet.png');
const CHAR_OUT_DIR = path.join(PROJECT_DIR, 'assets/characters');

const ROSTER_CONFIG = {
    leon: { r: 0, c: 0, id: 'leon', name: 'El León', theme: { r: 255, g: 215, b: 0 }, fx: 'lion' },
    latina: { r: 0, c: 1, id: 'latina', name: 'La Jefa', theme: { r: 78, g: 168, b: 222 }, fx: 'solar' },
    ojosazules: { r: 0, c: 2, id: 'ojosazules', name: 'El Ingeniero', theme: { r: 255, g: 210, b: 30 }, fx: 'balloon' },
    pepeargento: { r: 0, c: 3, id: 'pepeargento', name: 'Pepe Argento', theme: { r: 0, g: 168, b: 232 }, fx: 'racing' },
    eleternauta: { r: 1, c: 0, id: 'eleternauta', name: 'El Eternauta', theme: { r: 168, g: 218, b: 220 }, fx: 'ice' },
    elcomandante: { r: 1, c: 1, id: 'elcomandante', name: 'El Comandante', theme: { r: 230, g: 57, b: 70 }, fx: 'money' },
    elmesias: { r: 1, c: 2, id: 'elmesias', name: 'El Mesías', theme: { r: 0, g: 180, b: 216 }, fx: 'ball' },
    moria: { r: 1, c: 3, id: 'moria', name: 'La One', theme: { r: 217, g: 4, b: 41 }, fx: 'claws' },
    lasu: { r: 2, c: 0, id: 'lasu', name: 'La Su', theme: { r: 255, g: 183, b: 3 }, fx: 'phone' },
    hugo: { r: 2, c: 1, id: 'hugo', name: 'Hugo', theme: { r: 131, g: 56, b: 236 }, fx: 'sound' },
    pergolas: { r: 2, c: 2, id: 'pergolas', name: 'Pergolas', theme: { r: 58, g: 134, b: 255 }, fx: 'drone' },
    sangrejaponesa: { r: 2, c: 3, id: 'sangrejaponesa', name: 'Sangre Japonesa', theme: { r: 255, g: 0, b: 110 }, fx: 'poison' },
    lafaraona: { r: 3, c: 0, id: 'lafaraona', name: 'La Faraona', theme: { r: 155, g: 93, b: 229 }, fx: 'corn' },
    badbitch: { r: 3, c: 1, id: 'badbitch', name: 'Bad Bitch', theme: { r: 247, g: 37, b: 133 }, fx: 'glitter' },
    oidoabsoluto: { r: 3, c: 2, id: 'oidoabsoluto', name: 'Oído Absoluto', theme: { r: 76, g: 201, b: 240 }, fx: 'piano' },
    inmortal: { r: 3, c: 3, id: 'inmortal', name: 'Inmortal', theme: { r: 255, g: 215, b: 0 }, fx: 'tableware' }
};

const FRAME_W = 140;
const FRAME_H = 175;
const ANCHOR_X = 70;
const GROUND_Y = 160;

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

function extractCharacter(masterPng, charKey) {
    const info = ROSTER_CONFIG[charKey];
    const colW = 316;
    const rowH = 212;
    const cellH = 172;
    
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

function renderDeformed(png, bmp, anchorX, groundY, transformFn, opts = {}) {
    const w = bmp.width;
    const h = bmp.height;
    const tint = opts.tint || null;
    const flashWhite = opts.flashWhite || false;
    
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
            
            if (flashWhite) {
                r = 255; g = 255; b = 255;
            } else if (tint) {
                r = Math.min(255, Math.round(r * (1 - tint.amount) + tint.r * tint.amount));
                g = Math.min(255, Math.round(g * (1 - tint.amount) + tint.g * tint.amount));
                b = Math.min(255, Math.round(b * (1 - tint.amount) + tint.b * tint.amount));
            }
            
            setPixel(png, dx, dy, r, g, b, px.a);
        }
    }
}

// Special thematic FX rendering
function drawThematicSpecial(png, charKey, frameIdx, totalFrames) {
    const info = ROSTER_CONFIG[charKey];
    const theme = info.theme;
    const progress = frameIdx / (totalFrames - 1);
    
    // Core energy flare
    const flareX = ANCHOR_X + 25 + Math.round(progress * 30);
    const flareY = GROUND_Y - 80;
    const radius = Math.round(14 + progress * 16);
    
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d <= radius) {
                const alpha = Math.round(240 * (1 - d / radius));
                setPixel(png, flareX + dx, flareY + dy, theme.r, theme.g, theme.b, alpha);
            }
        }
    }
    // Bright white core
    for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
            if (dx*dx + dy*dy <= 16) {
                setPixel(png, flareX + dx, flareY + dy, 255, 255, 255, 255);
            }
        }
    }
    
    // Radiating energy streaks
    for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + progress * 2.0;
        const len = 12 + ((i * 7) % 20) + progress * 15;
        const sx = flareX + Math.cos(ang) * len;
        const sy = flareY + Math.sin(ang) * len;
        setPixel(png, sx, sy, 255, 255, 255, 220);
        setPixel(png, sx + 1, sy, theme.r, theme.g, theme.b, 180);
    }
}

function drawFatalityFx(png, frameIdx, totalFrames) {
    const progress = frameIdx / (totalFrames - 1);
    // Red shockwave nova
    const fxX = ANCHOR_X + 25;
    const fxY = GROUND_Y - 75;
    const r = Math.round(10 + progress * 35);
    
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const x = fxX + Math.cos(a) * r;
        const y = fxY + Math.sin(a) * r;
        setPixel(png, x, y, 255, 20, 40, 255);
        setPixel(png, x + 1, y, 255, 220, 60, 240);
        setPixel(png, x, y + 1, 200, 0, 0, 220);
    }
    // Crimson blood sparks
    for (let i = 0; i < 28; i++) {
        const dist = ((i * 13) % 45) * progress;
        const ang = (i * 0.8) + progress * 3.0;
        const sx = fxX + Math.cos(ang) * dist;
        const sy = fxY + Math.sin(ang) * dist;
        setPixel(png, sx, sy, 255, 0, 20, 255);
        setPixel(png, sx + 1, sy, 180, 0, 0, 200);
    }
}

// Ensure dir exists
function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function run() {
    console.log('Loading master sheet:', MASTER_IMG_PATH);
    const masterBuf = fs.readFileSync(MASTER_IMG_PATH);
    const masterPng = PNG.sync.read(masterBuf);
    console.log('Loaded master sheet size:', masterPng.width, 'x', masterPng.height);
    
    ensureDir(CHAR_OUT_DIR);
    
    const characters = Object.keys(ROSTER_CONFIG);
    console.log(`Starting generation of individual animation frames for ${characters.length} characters...`);
    
    let totalGenerated = 0;
    const manifest = {};
    
    for (const charKey of characters) {
        console.log(`\nProcessing character: ${charKey} (${ROSTER_CONFIG[charKey].name})...`);
        const { bmp, info } = extractCharacter(masterPng, charKey);
        const charDir = path.join(CHAR_OUT_DIR, charKey);
        ensureDir(charDir);
        manifest[charKey] = {};
        
        const w = bmp.width;
        const h = bmp.height;
        
        // Definition of all requested actions
        const actions = {
            // 1. Piñas altas (punch_high) - 6 frames
            punch_high: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }), // Windup
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.3) / h) * 6, sy: h - (ry + 2) }),
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.3) / h) * 16, sy: h - (ry - 3) }), // Strike apex
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.3) / h) * 14, sy: h - (ry - 2) }), // Hit linger
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.3) / h) * 7, sy: h - ry }), // Recoil
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }) // Recovery
            ],
            
            // 2. Piñas bajas (punch_low) - 6 frames
            punch_low: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.96) }), // Dip
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.2) / h) * 8, sy: h - (ry * 0.94) }),
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.2) / h) * 14, sy: h - (ry * 0.92) }), // Low thrust
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.2) / h) * 12, sy: h - (ry * 0.93) }),
                (rx, ry) => ({ sx: w / 2 + rx - Math.max(0, (ry - h * 0.2) / h) * 6, sy: h - (ry * 0.95) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 3. Patadas altas (kick_high) - 8 frames
            kick_high: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.95) }), // Chamber
                (rx, ry) => {
                    const isLeg = ry < h * 0.45 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 10 : -2), sy: h - (ry + (isLeg ? 15 : 0)) };
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.45 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 20 : -4), sy: h - (ry + (isLeg ? 28 : 0)) };
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.45 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 24 : -5), sy: h - (ry + (isLeg ? 32 : 0)) }; // High kick apex
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.45 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 22 : -4), sy: h - (ry + (isLeg ? 30 : 0)) };
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.45 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 12 : -2), sy: h - (ry + (isLeg ? 16 : 0)) };
                },
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.96) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 4. Patadas bajas (kick_low) - 6 frames
            kick_low: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.88) }), // Low crouch
                (rx, ry) => {
                    const isLeg = ry < h * 0.35 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 12 : 2), sy: h - (ry * 0.85) };
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.35 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 20 : 4), sy: h - (ry * 0.82) }; // Sweep apex
                },
                (rx, ry) => {
                    const isLeg = ry < h * 0.35 && rx > 0;
                    return { sx: w / 2 + rx - (isLeg ? 16 : 3), sy: h - (ry * 0.84) };
                },
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.90) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 5. Correr hacia adelante (walk_forward) - 8 frames
            walk_forward: [
                (rx, ry) => ({ sx: w / 2 + rx - (ry < h * 0.4 ? (rx > 0 ? 5 : -5) : 1), sy: h - (ry + 1) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry < h * 0.4 ? (rx > 0 ? 9 : -8) : 2), sy: h - (ry + 3) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry - 2) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry < h * 0.4 ? (rx < 0 ? 6 : -6) : -1), sy: h - (ry + 1) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry < h * 0.4 ? (rx < 0 ? 10 : -9) : -2), sy: h - (ry + 3) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry - 1) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry < h * 0.4 ? (rx > 0 ? 4 : -4) : 1), sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 6. Correr hacia atrás (walk_backward) - 8 frames
            walk_backward: [
                (rx, ry) => ({ sx: w / 2 + rx + (ry < h * 0.4 ? (rx > 0 ? -4 : 4) : 2), sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry < h * 0.4 ? (rx > 0 ? -8 : 8) : 3), sy: h - (ry + 2) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry - 1) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry < h * 0.4 ? (rx < 0 ? -5 : 5) : 1), sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry < h * 0.4 ? (rx < 0 ? -9 : 9) : 2), sy: h - (ry + 2) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry - 1) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry < h * 0.4 ? (rx > 0 ? -3 : 3) : 1), sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 7. Saltar (jump) - 6 frames
            jump: [
                (rx, ry) => ({ sx: w / 2 + rx * 0.98, sy: h - (ry * 0.88) }), // Squat
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 15) }), // Launch
                (rx, ry) => ({ sx: w / 2 + rx * 0.96, sy: h - (ry + 32) }), // Apex rise
                (rx, ry) => ({ sx: w / 2 + rx * 0.95, sy: h - (ry + 35) }), // Highest float
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 18) }), // Descent
                (rx, ry) => ({ sx: w / 2 + rx * 0.98, sy: h - (ry * 0.92) }) // Land
            ],
            
            // 8. Agacharse (crouch) - 4 frames
            crouch: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.85) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.95, sy: h - (ry * 0.72) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.96, sy: h - (ry * 0.73) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.95, sy: h - (ry * 0.72) })
            ],
            
            // 9. Cubrirse (block) - 4 frames
            block: [
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 4, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 5, sy: h - (ry - 1) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 5, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 4, sy: h - ry })
            ],
            
            // 10. Poderes (special) - 10 frames
            special: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 4, sy: h - (ry * 0.95) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 8, sy: h - (ry * 0.93) }), // Cast motion
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 12, sy: h - (ry * 0.92) }), // Release
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 14, sy: h - (ry * 0.92) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 14, sy: h - (ry * 0.93) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 12, sy: h - (ry * 0.94) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 8, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 4, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 11. Súper Ataque Astral (super) - 12 frames
            super: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.92) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.88) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 10, sy: h - (ry * 0.95) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 16, sy: h - (ry + 8) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 18, sy: h - (ry + 10) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 18, sy: h - (ry + 10) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 15, sy: h - (ry + 6) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 10, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 6, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 12. Fatalities (fatality) - 12 frames
            fatality: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 6, sy: h - (ry * 0.95) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 12, sy: h - (ry * 0.92) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 18, sy: h - (ry - 4) }), // Strike
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 20, sy: h - (ry - 6) }), // Nova
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 20, sy: h - (ry - 6) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 18, sy: h - (ry - 4) }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 14, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx - (ry / h) * 8, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry })
            ],
            
            // 13. Cuando ganan (victory) - 8 frames
            victory: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 2) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 6) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 10) }), // Arms raised
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 12) }), // Full victory pose
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 12) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 10) }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry + 10) })
            ],
            
            // 14. Cuando pierden (defeat) - 8 frames
            defeat: [
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 6, sy: h - ry }), // Stagger
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 12, sy: h - (ry * 0.95) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.96, sy: h - (ry * 0.85) }), // Fall to knees
                (rx, ry) => ({ sx: w / 2 + rx * 0.94, sy: h - (ry * 0.70) }), // Kneeling defeated
                (rx, ry) => ({ sx: w / 2 + rx * 0.94, sy: h - (ry * 0.68) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.90, sy: h - (ry * 0.50) }), // Collapsing
                (rx, ry) => ({ sx: w / 2 + rx * 0.85, sy: h - (ry * 0.35) }), // Flat on floor
                (rx, ry) => ({ sx: w / 2 + rx * 0.85, sy: h - (ry * 0.32) })  // KO
            ],
            
            // 15. Cuando son golpeados (hurt) - 6 frames
            hurt: [
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 8, sy: h - (ry + 2) }), // Hit flash
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 14, sy: h - (ry + 4) }), // Max recoil
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 12, sy: h - (ry + 3) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 8, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 4, sy: h - ry }),
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - ry }) // Recovery
            ],
            
            // 16. Víctima de Fatality (fatality_victim) - 12 frames
            fatality_victim: [
                (rx, ry) => ({ sx: w / 2 + rx, sy: h - (ry * 0.70) }), // Kneeling
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 6, sy: h - (ry * 0.72) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 14, sy: h - (ry * 0.75) }), // Fatal impact
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 18, sy: h - (ry * 0.70) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 22, sy: h - (ry * 0.60) }), // Energy tear
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 24, sy: h - (ry * 0.50) }),
                (rx, ry) => ({ sx: w / 2 + rx + (ry / h) * 26, sy: h - (ry * 0.40) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.85, sy: h - (ry * 0.30) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.80, sy: h - (ry * 0.25) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.75, sy: h - (ry * 0.20) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.70, sy: h - (ry * 0.15) }),
                (rx, ry) => ({ sx: w / 2 + rx * 0.65, sy: h - (ry * 0.10) }) // Ashes/dead
            ]
        };
        
        for (const [actionName, frames] of Object.entries(actions)) {
            const actionDir = path.join(charDir, actionName);
            ensureDir(actionDir);
            manifest[charKey][actionName] = [];
            
            for (let fIdx = 0; fIdx < frames.length; fIdx++) {
                const transformFn = frames[fIdx];
                const framePng = new PNG({ width: FRAME_W, height: FRAME_H });
                framePng.data.fill(0);
                
                const opts = {};
                // Hurt frame 0: white hit flash
                if (actionName === 'hurt' && fIdx === 0) {
                    opts.flashWhite = true;
                }
                // Block frames: cyan shield tint
                if (actionName === 'block') {
                    opts.tint = { r: 100, g: 210, b: 255, amount: 0.28 };
                }
                // Fatality victim: red flash
                if (actionName === 'fatality_victim' && (fIdx === 2 || fIdx === 3)) {
                    opts.tint = { r: 255, g: 30, b: 50, amount: 0.45 };
                }
                
                renderDeformed(framePng, bmp, ANCHOR_X, GROUND_Y, transformFn, opts);
                
                // Add action specific visual effects
                if (actionName === 'punch_high' && (fIdx === 2 || fIdx === 3)) {
                    // Fist hit spark
                    const sparkX = ANCHOR_X + 48;
                    const sparkY = GROUND_Y - h * 0.65;
                    setPixel(framePng, sparkX, sparkY, 255, 255, 255, 255);
                    setPixel(framePng, sparkX + 1, sparkY, 255, 220, 60, 240);
                    setPixel(framePng, sparkX, sparkY + 1, 255, 180, 0, 220);
                }
                
                if (actionName === 'punch_low' && (fIdx === 2 || fIdx === 3)) {
                    const sparkX = ANCHOR_X + 42;
                    const sparkY = GROUND_Y - h * 0.48;
                    setPixel(framePng, sparkX, sparkY, 255, 255, 255, 255);
                    setPixel(framePng, sparkX + 1, sparkY, 255, 240, 80, 240);
                }
                
                if (actionName === 'kick_high' && (fIdx === 3 || fIdx === 4)) {
                    const kickX = ANCHOR_X + 50;
                    const kickY = GROUND_Y - h * 0.72;
                    for (let s = -4; s <= 4; s++) {
                        setPixel(framePng, kickX + s, kickY + s * 0.5, 255, 255, 255, 240);
                    }
                }
                
                if (actionName === 'block') {
                    // Energy barrier arc
                    const bx = ANCHOR_X + 35;
                    const by = GROUND_Y - h * 0.5;
                    for (let dy = -40; dy <= 40; dy++) {
                        const dx = Math.round(Math.cos(dy / 40 * 1.2) * 8);
                        setPixel(framePng, bx + dx, by + dy, 100, 220, 255, 220);
                        setPixel(framePng, bx + dx + 1, by + dy, 255, 255, 255, 180);
                    }
                }
                
                if (actionName === 'special' && fIdx >= 3) {
                    drawThematicSpecial(framePng, charKey, fIdx - 3, frames.length - 3);
                }
                
                if (actionName === 'super' && fIdx >= 3) {
                    drawThematicSpecial(framePng, charKey, fIdx - 3, frames.length - 3);
                }
                
                if (actionName === 'fatality' && fIdx >= 3) {
                    drawFatalityFx(framePng, fIdx - 3, frames.length - 3);
                }
                
                if (actionName === 'victory' && fIdx >= 3) {
                    // Confetti and gold stars
                    for (let c = 0; c < 12; c++) {
                        const cx = ANCHOR_X - 45 + ((c * 23) % 90);
                        const cy = GROUND_Y - 140 + ((c * 17) % 80);
                        const col = c % 2 === 0 ? { r: 255, g: 215, b: 0 } : { r: 255, g: 255, b: 255 };
                        setPixel(framePng, cx, cy, col.r, col.g, col.b, 240);
                        setPixel(framePng, cx + 1, cy, col.r, col.g, col.b, 200);
                    }
                }
                
                const frameFileName = `frame_${String(fIdx).padStart(2, '0')}.png`;
                const framePath = path.join(actionDir, frameFileName);
                fs.writeFileSync(framePath, PNG.sync.write(framePng));
                
                const relPath = `res://assets/characters/${charKey}/${actionName}/${frameFileName}`;
                manifest[charKey][actionName].push(relPath);
                totalGenerated++;
            }
        }
    }
    
    // Save manifest JSON
    const manifestPath = path.join(CHAR_OUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n======================================================`);
    console.log(`SUCCESS: Generated ${totalGenerated} individual animation frames!`);
    console.log(`Saved to: ${CHAR_OUT_DIR}`);
    console.log(`Manifest written to: ${manifestPath}`);
    console.log(`======================================================`);
}

run().catch(err => {
    console.error('ERROR during sprite generation:', err);
    process.exit(1);
});
