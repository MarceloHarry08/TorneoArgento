const fs = require('fs');
const { PNG } = require('pngjs');

console.log('=== VERIFYING NEW USER REQUIREMENTS ===');

// 1. Crouch sprite: Check Cell 1 (x: 300..600, y: 0..298) for right-side stray piece
const cjb = PNG.sync.read(fs.readFileSync('godot/assets/sprites/leon_crouch_jump_block.png'));
let cell1RightCount = 0;
for (let y = 0; y < 298; y++) {
  for (let x = 545; x < 600; x++) {
    if (cjb.data[(y * cjb.width + x) * 4 + 3] > 20) cell1RightCount++;
  }
}
let cell1LeftCount = 0;
for (let y = 0; y < 298; y++) {
  for (let x = 300; x < 355; x++) {
    if (cjb.data[(y * cjb.width + x) * 4 + 3] > 20) cell1LeftCount++;
  }
}
console.log('Point 1 - Cell 1 right-side stray pixels (must be 0):', cell1RightCount, cell1RightCount === 0 ? 'PASS' : 'FAIL');
console.log('Point 1 - Cell 1 left-side stray pixels (must be 0):', cell1LeftCount, cell1LeftCount === 0 ? 'PASS' : 'FAIL');

// 2. Crouch attacks damage & hitbox
const fgd = fs.readFileSync('godot/scripts/fighter.gd', 'utf8');
const hasCrouchPunchDmg = fgd.includes('6.0 * atk_power');
const hasCrouchKickDmg = fgd.includes('7.0 * atk_power');
const hasCanAttackCrouchFix = fgd.includes('State.IDLE, State.WALK_FORWARD, State.WALK_BACKWARD, State.RUN');
console.log('Point 2 - Crouch punch damage (6 HP):', hasCrouchPunchDmg ? 'PASS' : 'FAIL');
console.log('Point 2 - Crouch kick damage (7 HP):', hasCrouchKickDmg ? 'PASS' : 'FAIL');
console.log('Point 2 - Can attack crouch while holding down:', hasCanAttackCrouchFix ? 'PASS' : 'FAIL');

// 3. Pause menu space toggle & centering & combos
const pmTscn = fs.readFileSync('godot/scenes/ui/pause_menu.tscn', 'utf8');
const pmGd = fs.readFileSync('godot/scripts/ui/pause_menu.gd', 'utf8');
const battleGd = fs.readFileSync('godot/scripts/battle.gd', 'utf8');

const isCanvasLayer = pmTscn.includes('type="CanvasLayer"');
const isCentered = pmTscn.includes('anchors_preset = 8') && pmTscn.includes('anchor_left = 0.5');
const hasDebounce = pmGd.includes('Time.get_ticks_msec() - open_timestamp >= 220');
const hasCombosButton = pmTscn.includes('BtnCombos') && pmGd.includes('_populate_dual_movelists');
const passesBothFighters = battleGd.includes('pause_menu.open_pause(p1_id, p2_id)');

console.log('Point 3.1 - Pause Menu Space Bar toggle (debounce & no instant close):', hasDebounce ? 'PASS' : 'FAIL');
console.log('Point 3.2 - Pause Menu Centered via CanvasLayer & preset 8:', (isCanvasLayer && isCentered) ? 'PASS' : 'FAIL');
console.log('Point 3.3 - Combos option for both fighters (P1 & P2):', (hasCombosButton && passesBothFighters) ? 'PASS' : 'FAIL');
