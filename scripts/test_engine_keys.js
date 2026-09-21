// Functional test simulating key events on Fighter
const { JSDOM } = require('util');

// Load characters and fighter
const charactersContent = require('fs').readFileSync('js/characters.js', 'utf8');
const fighterContent = require('fs').readFileSync('js/fighter.js', 'utf8');

global.window = global;
global.audioEngine = {
    ensureContext: () => {},
    playJump: () => {},
    playLightHit: () => {},
    playHeavyHit: () => {},
    playBlock: () => {},
    playSpecialMove: () => {},
    playLaser: () => {}
};

eval(`
${charactersContent}
${fighterContent}
global.Fighter = Fighter;
global.CHARACTERS = CHARACTERS;
`);

const p1 = new Fighter('leon', 100, 300, false);
p1.groundY = 300;
p1.y = 300;
p1.isGrounded = true;

console.log('Testing Fighter action state transitions:');

// Test 1: Red circle - Move Left / Right
p1.move('left');
console.log('Move left state:', p1.state, 'vx:', p1.vx);
if (p1.state !== 'walk' || p1.vx >= 0) throw new Error('Move left failed');

p1.move('stop');
p1.move('right');
console.log('Move right state:', p1.state, 'vx:', p1.vx);
if (p1.state !== 'walk' || p1.vx <= 0) throw new Error('Move right failed');

p1.move('stop');

// Test 2: Red circle - Jump / Crouch
p1.jump();
console.log('Jump state:', p1.state, 'vy:', p1.vy);
if (p1.state !== 'jump' || p1.vy >= 0) throw new Error('Jump failed');

p1.y = 300;
p1.isGrounded = true;
p1.state = 'idle';

p1.crouch(true);
console.log('Crouch state:', p1.state);
if (p1.state !== 'crouch') throw new Error('Crouch failed');

p1.crouch(false);
if (p1.state !== 'idle') throw new Error('Crouch release failed');

// Test 3: Blue circle - Pegar (Insert / Home)
p1.lightAttack();
console.log('Light attack state (Insert):', p1.state);
if (p1.state !== 'light_attack') throw new Error('Light attack failed');
p1.state = 'idle';

p1.heavyAttack();
console.log('Heavy attack state (Home / Inicio):', p1.state);
if (p1.state !== 'heavy_attack') throw new Error('Heavy attack failed');
p1.state = 'idle';

// Test 4: Blue circle - Cubrirse (Delete / Supr)
p1.block(true);
console.log('Block state (Delete / Supr):', p1.state);
if (p1.state !== 'block') throw new Error('Block failed');

// Damage test while blocking (-80% damage reduction)
p1.hp = 100;
p1.takeDamage(20, 'left');
console.log('HP after 20 damage blocked:', p1.hp); // Should be 96 (took only 4 dmg = 20 * 0.2)
if (p1.hp !== 96) throw new Error('Block damage reduction failed');

p1.block(false);
console.log('Block release state:', p1.state);
if (p1.state !== 'idle') throw new Error('Block release failed');

// Test 5: Blue circle - Especiales y Super (End, PageDown, PageUp)
p1.meter = 100;
p1.special1();
console.log('Special 1 state (End / Fin):', p1.state);
if (p1.state !== 'special1') throw new Error('Special 1 failed');
p1.state = 'idle';

p1.meter = 100;
p1.special2();
console.log('Special 2 state (PageDown / Av Pág):', p1.state);
if (p1.state !== 'special2') throw new Error('Special 2 failed');
p1.state = 'idle';

p1.meter = 100;
p1.superAttack();
console.log('Super Attack state (PageUp / Re Pág):', p1.state);
if (p1.state !== 'super_attack') throw new Error('Super Attack failed');

console.log('\nALL 5 FUNCTIONAL CONTROLS TESTS PASSED 100%!');
