const fs = require('fs');
const { PNG } = require('pngjs');

console.log('=== VERIFYING ALL 5 POINTS ===');

// Check 1: fighter.gd scale
const fgd = fs.readFileSync('godot/scripts/fighter.gd', 'utf8');
const hasScale = fgd.includes('sprite.scale = Vector2(0.30, 0.30)');
console.log('Point 1 - Scale 0.30 in fighter.gd:', hasScale ? 'PASS' : 'FAIL');

// Check 2: leon_punches.png clean
const punches = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_punches.png'));
let punchArtifacts = 0;
for (let y = 270; y <= 298; y++) {
  for (let x = 540; x <= 599; x++) {
    if (punches.data[(y * punches.width + x) * 4 + 3] > 30) punchArtifacts++;
  }
}
console.log('Point 2 - PUNCH watermark artifacts in leon_punches.png:', punchArtifacts, punchArtifacts === 0 ? 'PASS' : 'FAIL');

// Check 3: leon_kicks.png borders
const kicks = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_kicks.png'));
let kickBorderPixels = 0;
for (let y = 0; y < 298 * 2; y++) {
  for (const x of [0, 1, 298, 299, 300, 301, 598, 599, 600, 601, 898, 899, 900, 901, 1198, 1199]) {
    if (kicks.data[(y * kicks.width + x) * 4 + 3] > 30) kickBorderPixels++;
  }
}
for (const y of [0, 1, 296, 297, 298, 299, 595, 596, 597, 598]) {
  for (let x = 0; x < kicks.width; x++) {
    if (kicks.data[(y * kicks.width + x) * 4 + 3] > 30) kickBorderPixels++;
  }
}
console.log('Point 3 - Black border pixels in leon_kicks.png:', kickBorderPixels, kickBorderPixels === 0 ? 'PASS' : 'FAIL');

// Check 4: Block in crouch_jump_block and fighter.gd
const cjb = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_crouch_jump_block.png'));
let b8NonTrans = 0;
for (let y = 597; y < 895; y++) {
  for (let x = 0; x < 300; x++) {
    if (cjb.data[(y * cjb.width + x) * 4 + 3] > 30) b8NonTrans++;
  }
}
const hasBlockAnim = fgd.includes("lib.add_animation('block'".replace(/'/g, '"')) && fgd.includes("[8], 0.20, false");
console.log('Point 4 - Block Frame 8 pixels:', b8NonTrans, 'Block static anim in fighter.gd:', hasBlockAnim ? 'PASS' : 'FAIL');

// Check 5: Walk and Run
const wrExists = fs.existsSync('godot/assets/sprites/leon_walk_run.png') && fs.existsSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_walk_run.png');
const hasWalkAnim = fgd.includes("walk_forward") && fgd.includes("tex_leon_walk_run");
const hasRunAnim = fgd.includes("run") && fgd.includes("tex_leon_walk_run");
console.log('Point 5 - leon_walk_run.png exists in both locations:', wrExists ? 'PASS' : 'FAIL');
console.log('Point 5 - Walk and Run anims in fighter.gd:', (hasWalkAnim && hasRunAnim) ? 'PASS' : 'FAIL');
