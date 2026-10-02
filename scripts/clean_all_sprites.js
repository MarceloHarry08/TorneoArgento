const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SPRITES_DIR = path.join(__dirname, '../godot/assets/sprites');
const TARGET_DIR_OD = 'C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites';

const files = [
    { in: 'leon_crouch_jump_block_raw.png', out: 'leon_crouch_jump_block.png' },
    { in: 'leon_punches_raw.png', out: 'leon_punches.png' },
    { in: 'leon_kicks_raw.png', out: 'leon_kicks.png' },
    { in: 'leon_air_attacks_raw.png', out: 'leon_air_attacks.png' },
    { in: 'leon_hurt_knockdown_raw.png', out: 'leon_hurt_knockdown.png' },
    { in: 'leon_special_projectile_raw.png', out: 'leon_special_projectile.png' },
    { in: 'leon_win_lose_raw.png', out: 'leon_win_lose.png' },
    { in: 'leon_fatality_raw.png', out: 'leon_fatality.png' }
];

function isBgPixel(r, g, b) {
    const diffRG = Math.abs(r - g);
    const diffGB = Math.abs(g - b);
    const diffRB = Math.abs(r - b);
    // Gray/white checkerboard squares with high luminance and low saturation
    return (diffRG <= 9 && diffGB <= 9 && diffRB <= 9 && r >= 180 && g >= 180 && b >= 180);
}

function processImage(fileInfo) {
    const inPath = path.join(SPRITES_DIR, fileInfo.in);
    if (!fs.existsSync(inPath)) return;

    const data = fs.readFileSync(inPath);
    const png = PNG.sync.read(data);
    const w = png.width;
    const h = png.height;
    const total = w * h;

    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    // Seed top and bottom borders
    for (let x = 0; x < w; x++) {
        // Top
        const pTop = x << 2;
        if (isBgPixel(png.data[pTop], png.data[pTop + 1], png.data[pTop + 2])) {
            visited[x] = 1;
            queue[tail++] = x;
        }
        // Bottom
        const yBottom = h - 1;
        const bIdx = yBottom * w + x;
        const pBottom = bIdx << 2;
        if (isBgPixel(png.data[pBottom], png.data[pBottom + 1], png.data[pBottom + 2])) {
            visited[bIdx] = 1;
            queue[tail++] = bIdx;
        }
    }

    // Seed left and right borders
    for (let y = 0; y < h; y++) {
        // Left
        const lIdx = y * w;
        if (!visited[lIdx]) {
            const pL = lIdx << 2;
            if (isBgPixel(png.data[pL], png.data[pL + 1], png.data[pL + 2])) {
                visited[lIdx] = 1;
                queue[tail++] = lIdx;
            }
        }
        // Right
        const rIdx = y * w + (w - 1);
        if (!visited[rIdx]) {
            const pR = rIdx << 2;
            if (isBgPixel(png.data[pR], png.data[pR + 1], png.data[pR + 2])) {
                visited[rIdx] = 1;
                queue[tail++] = rIdx;
            }
        }
    }

    // Fast BFS
    while (head < tail) {
        const curr = queue[head++];
        const cx = curr % w;
        const cy = (curr / w) | 0;

        // Set to fully transparent
        const p = curr << 2;
        png.data[p] = 0;
        png.data[p + 1] = 0;
        png.data[p + 2] = 0;
        png.data[p + 3] = 0;

        // 4 neighbors
        if (cx > 0) {
            const n = curr - 1;
            if (!visited[n]) {
                const np = n << 2;
                if (isBgPixel(png.data[np], png.data[np + 1], png.data[np + 2])) {
                    visited[n] = 1;
                    queue[tail++] = n;
                }
            }
        }
        if (cx < w - 1) {
            const n = curr + 1;
            if (!visited[n]) {
                const np = n << 2;
                if (isBgPixel(png.data[np], png.data[np + 1], png.data[np + 2])) {
                    visited[n] = 1;
                    queue[tail++] = n;
                }
            }
        }
        if (cy > 0) {
            const n = curr - w;
            if (!visited[n]) {
                const np = n << 2;
                if (isBgPixel(png.data[np], png.data[np + 1], png.data[np + 2])) {
                    visited[n] = 1;
                    queue[tail++] = n;
                }
            }
        }
        if (cy < h - 1) {
            const n = curr + w;
            if (!visited[n]) {
                const np = n << 2;
                if (isBgPixel(png.data[np], png.data[np + 1], png.data[np + 2])) {
                    visited[n] = 1;
                    queue[tail++] = n;
                }
            }
        }
    }

    const outBuffer = PNG.sync.write(png);
    const outPath1 = path.join(SPRITES_DIR, fileInfo.out);
    fs.writeFileSync(outPath1, outBuffer);

    if (fs.existsSync(TARGET_DIR_OD)) {
        const outPath2 = path.join(TARGET_DIR_OD, fileInfo.out);
        fs.writeFileSync(outPath2, outBuffer);
    }

    console.log(`[OK] Cleaned & saved: ${fileInfo.out} (${w}x${h})`);
}

for (const f of files) {
    processImage(f);
}
console.log('All sprite sheets cleaned successfully!');
