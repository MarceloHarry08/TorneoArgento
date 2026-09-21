const fs = require('fs');
const { PNG } = require('pngjs');

const CHARACTERS = [
    'leon', 'latina', 'ojosazules', 'pepeargento',
    'eleternauta', 'elcomandante', 'elmesias', 'moria',
    'lasu', 'hugo', 'pergolas', 'sangrejaponesa',
    'lafaraona', 'badbitch', 'oidoabsoluto', 'inmortal'
];

const standardFrames = {
    portrait: { sx: 15, sy: 10, sw: 90, sh: 70 },
    idle: [
        { sx: 15, sy: 90, sw: 120, sh: 175 },
        { sx: 145, sy: 90, sw: 120, sh: 175 },
        { sx: 275, sy: 90, sw: 120, sh: 175 }
    ],
    walk: [
        { sx: 15, sy: 275, sw: 120, sh: 175 },
        { sx: 145, sy: 275, sw: 120, sh: 175 },
        { sx: 275, sy: 275, sw: 120, sh: 175 },
        { sx: 405, sy: 275, sw: 120, sh: 175 }
    ],
    jump: [
        { sx: 15, sy: 460, sw: 120, sh: 175 },
        { sx: 145, sy: 460, sw: 120, sh: 175 }
    ],
    crouch: { sx: 275, sy: 460, sw: 120, sh: 175 },
    block: { sx: 405, sy: 460, sw: 120, sh: 175 },
    punch_light: [
        { sx: 15, sy: 645, sw: 120, sh: 175 },
        { sx: 145, sy: 645, sw: 130, sh: 175 }
    ],
    punch_heavy: [
        { sx: 285, sy: 645, sw: 120, sh: 175 },
        { sx: 415, sy: 645, sw: 140, sh: 175 }
    ],
    kick_light: [
        { sx: 15, sy: 830, sw: 120, sh: 175 },
        { sx: 145, sy: 830, sw: 130, sh: 175 }
    ],
    kick_heavy: [
        { sx: 285, sy: 830, sw: 120, sh: 175 },
        { sx: 415, sy: 830, sw: 140, sh: 175 }
    ],
    special: [
        { sx: 15, sy: 1015, sw: 130, sh: 175 },
        { sx: 155, sy: 1015, sw: 140, sh: 175 },
        { sx: 305, sy: 1015, sw: 150, sh: 175 }
    ],
    hurt: { sx: 15, sy: 1200, sw: 120, sh: 175 },
    dizzy: [
        { sx: 145, sy: 1200, sw: 120, sh: 175 },
        { sx: 275, sy: 1200, sw: 120, sh: 175 },
        { sx: 405, sy: 1200, sw: 120, sh: 175 }
    ],
    defeat_kneeling: { sx: 15, sy: 1385, sw: 125, sh: 175 },
    defeat_dead: { sx: 150, sy: 1385, sw: 175, sh: 175 },
    victory: [
        { sx: 335, sy: 1385, sw: 120, sh: 175 },
        { sx: 465, sy: 1385, sw: 120, sh: 175 }
    ]
};

let allPassed = true;
let totalFrames = 0;

for (const charKey of CHARACTERS) {
    const file = `assets/sprites/${charKey}_spritesheet.png`;
    if (!fs.existsSync(file)) {
        console.error(`MISSING FILE: ${file}`);
        allPassed = false;
        continue;
    }
    const buf = fs.readFileSync(file);
    const png = PNG.sync.read(buf);
    
    let charFailures = 0;
    
    for (const [actionName, frameDef] of Object.entries(standardFrames)) {
        const frames = Array.isArray(frameDef) ? frameDef : [frameDef];
        frames.forEach((f, idx) => {
            totalFrames++;
            let nonTrans = 0;
            for (let y = f.sy; y < f.sy + f.sh; y++) {
                for (let x = f.sx; x < f.sx + f.sw; x++) {
                    const i = (png.width * y + x) << 2;
                    if (png.data[i+3] > 20) {
                        nonTrans++;
                    }
                }
            }
            if (nonTrans === 0) {
                console.error(`FAIL: ${charKey} ${actionName}[${idx}] has 0 pixels! (sx=${f.sx}, sy=${f.sy})`);
                charFailures++;
                allPassed = false;
            }
        });
    }
    
    if (charFailures === 0) {
        console.log(`PASS: ${charKey.padEnd(16)} (all 26 animation frames contain non-transparent character data)`);
    }
}

console.log(`\nVerification completed: Checked ${totalFrames} frames across ${CHARACTERS.length} characters.`);
if (allPassed) {
    console.log('SUCCESS: 100% of frames across all 16 sheets passed validation!');
} else {
    console.error('FAILED: One or more frames failed verification.');
    process.exit(1);
}
