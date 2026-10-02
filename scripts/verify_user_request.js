const fs = require('fs');
const { PNG } = require('pngjs');

console.log('=== VERIFYING ALL 5 REQUESTED POINTS ===');

// 1. Check scale 0.375 (25% bigger than 0.30)
const fgd = fs.readFileSync('godot/scripts/fighter.gd', 'utf8');
const lctrl = fs.readFileSync('godot/scripts/LeonController.gd', 'utf8');
const fgdOneDrive = fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/scripts/fighter.gd', 'utf8');
const lctrlOneDrive = fs.readFileSync('C:/Users/marce/OneDrive/Documentos/juego-fight/scripts/LeonController.gd', 'utf8');

const p1_fgd = fgd.includes('sprite.scale = Vector2(0.375, 0.375)');
const p1_lctrl = lctrl.includes('sprite.scale = Vector2(0.375, 0.375)');
const p1_sync = fgdOneDrive.includes('sprite.scale = Vector2(0.375, 0.375)') && lctrlOneDrive.includes('sprite.scale = Vector2(0.375, 0.375)');
console.log('Point 1 - Scale 0.375 (+25% bigger):', (p1_fgd && p1_lctrl && p1_sync) ? 'PASS' : 'FAIL');

// 2. Check white borders removed on block
const cjb = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_crouch_jump_block.png'));
let edgeWhite = 0;
for (let y = 596; y < 894; y++) {
  for (let x = 0; x < 300; x++) {
    const idx = (y * cjb.width + x) * 4;
    const a = cjb.data[idx + 3];
    if (a < 50) continue;
    const r = cjb.data[idx];
    const g = cjb.data[idx + 1];
    const b = cjb.data[idx + 2];
    if (r > 190 && g > 190 && b > 190) {
      let adjTrans = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= 300 || ny < 596 || ny >= 894 || cjb.data[(ny * cjb.width + nx) * 4 + 3] === 0) {
            adjTrans = true; break;
          }
        }
        if (adjTrans) break;
      }
      if (adjTrans) edgeWhite++;
    }
  }
}
console.log('Point 2 - White halo pixels on block silhouette:', edgeWhite, edgeWhite < 10 ? 'PASS' : 'FAIL');

// 3 & 4. Check leon_specials.png exists and has rows for mic, chainsaw, roar, bite
const specials1 = fs.existsSync('godot/assets/sprites/leon_specials.png');
const specials2 = fs.existsSync('C:/Users/marce/OneDrive/Documentos/juego-fight/assets/sprites/leon_specials.png');
const spPng = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_specials.png'));
// Check non-transparent pixels in each row
const rowCounts = [0, 0, 0, 0];
for (let r = 0; r < 4; r++) {
  for (let y = r * 298; y < (r + 1) * 298; y++) {
    for (let x = 0; x < 1200; x++) {
      if (spPng.data[(y * 1200 + x) * 4 + 3] > 20) rowCounts[r]++;
    }
  }
}
console.log('Point 3 - Row 0 Microphone pixels:', rowCounts[0], rowCounts[0] > 10000 ? 'PASS' : 'FAIL');
console.log('Point 4 - Row 1 Motosierra pixels:', rowCounts[1], 'Row 2 Rugido:', rowCounts[2], 'Row 3 Mordisco:', rowCounts[3], (rowCounts[1] > 10000 && rowCounts[2] > 10000 && rowCounts[3] > 10000) ? 'PASS' : 'FAIL');

// 5. Check hitboxes reach and active collision detection
const hasSetHitboxHelper = fgd.includes('_set_hitbox_size_and_pos');
const hasOverlapCheck = fgd.includes('get_overlapping_areas');
const hasMicDamage = fgd.includes('ejecutar_especial("mic", 14.0, true)');
const hasWideReach = fgd.includes('reach_x = 46.0 * facing_dir') && fgd.includes('reach_x = 52.0 * facing_dir');
console.log('Point 5 - Extended hitboxes reach:', hasWideReach ? 'PASS' : 'FAIL');
console.log('Point 5 - Dynamic shape sizing & overlap check:', (hasSetHitboxHelper && hasOverlapCheck) ? 'PASS' : 'FAIL');
console.log('Point 5 - Mic damage enabled:', hasMicDamage ? 'PASS' : 'FAIL');
