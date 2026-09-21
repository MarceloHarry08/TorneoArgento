/* TORNEO ARGENTO 16-BIT - PHASER 3 ANIMATION ENGINE (POWERED BY THIS.ANIMS.CREATE) */

class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
        this.p1Sprite = null;
        this.p2Sprite = null;
        this.shadowGraphics = null;
        this.auraGraphics = null;
        this.projectilesGraphics = null;
        this.registeredCharacters = new Set();
        this.isSceneReady = false;
        this.p1Key = null;
        this.p2Key = null;
    }

    create() {
        // 1. Graphics layers
        this.shadowGraphics = this.add.graphics();
        this.shadowGraphics.setDepth(1);

        this.auraGraphics = this.add.graphics();
        this.auraGraphics.setDepth(2);

        // 2. Fighter Sprites (Origin 0.5, 1.0 so (x, y) anchors feet to street)
        this.p1Sprite = this.add.sprite(180, 315, '__DEFAULT');
        this.p1Sprite.setOrigin(0.5, 1.0);
        this.p1Sprite.setDepth(3);
        this.p1Sprite.visible = false;

        this.p2Sprite = this.add.sprite(460, 315, '__DEFAULT');
        this.p2Sprite.setOrigin(0.5, 1.0);
        this.p2Sprite.setDepth(3);
        this.p2Sprite.visible = false;

        // 3. Projectiles and visual FX layer
        this.projectilesGraphics = this.add.graphics();
        this.projectilesGraphics.setDepth(4);

        this.isSceneReady = true;
        if (window.phaserAnimationEngine) {
            window.phaserAnimationEngine.scene = this;
            window.phaserAnimationEngine.isActive = true;
        }

        // If a match was requested before scene finished creating
        if (this.p1Key && this.p2Key) {
            this.setupFighters(this.p1Key, this.p2Key);
        }
    }

    // Register texture and animations in Phaser via this.anims.create
    ensureCharacterAnims(charKey, forceReload = false) {
        if (!charKey) return false;
        if (!forceReload && this.registeredCharacters.has(charKey)) return true;

        try {
            const texKey = `char_${charKey}`;
            if (this.textures.exists(texKey)) {
                this.textures.remove(texKey);
            }

            let texture = null;

            // 1. PRIORITIZE HTMLImageElement!
            // HTMLImageElement NEVER triggers Canvas SecurityError / cross-origin tainting under file:// protocol!
            const sourceImg = (window.pixelRenderer && pixelRenderer.characterSheets && pixelRenderer.characterSheets[charKey])
                ? pixelRenderer.characterSheets[charKey]
                : null;

            const rosterImg = (window.pixelRenderer && pixelRenderer.rosterRawImg)
                ? pixelRenderer.rosterRawImg
                : null;

            if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
                // Add Image directly to Phaser Texture Manager (immune to canvas cross-origin taint)
                this.textures.addImage(texKey, sourceImg);
                texture = this.textures.get(texKey);
            } else if (rosterImg && rosterImg.complete && rosterImg.naturalWidth > 0 && window.pixelRenderer && pixelRenderer.rosterGrid && pixelRenderer.rosterGrid[charKey]) {
                // For roster characters without separate sheets, add master roster image directly
                this.textures.addImage(texKey, rosterImg);
                texture = this.textures.get(texKey);
            } else {
                // If images are still loading, attach onload listeners to retry and update sprite
                if (sourceImg && !sourceImg.complete) {
                    sourceImg.addEventListener('load', () => {
                        this.updateCharacterTexture(charKey);
                    }, { once: true });
                }
                if (rosterImg && !rosterImg.complete) {
                    rosterImg.addEventListener('load', () => {
                        this.updateCharacterTexture(charKey);
                    }, { once: true });
                }
                return false;
            }

            if (!texture) return false;

            // Frame definitions from pixelRenderer
            let framesDef = (charKey === 'leon' && window.pixelRenderer) 
                ? pixelRenderer.leonFrames 
                : (window.pixelRenderer ? pixelRenderer.standardFrames : null);

            // If using roster grid image, synthesize frames from roster grid coordinates
            if (texture && (!sourceImg || !sourceImg.complete) && window.pixelRenderer && pixelRenderer.rosterGrid && pixelRenderer.rosterGrid[charKey]) {
                const grid = pixelRenderer.rosterGrid[charKey];
                const cellW = 316;
                const cellH = 212;
                const sx = grid.col * cellW + 80;
                const sy = grid.row * cellH + 12;
                const sw = 156;
                const sh = 188;
                framesDef = {
                    portrait: { sx, sy, sw, sh },
                    idle: [{ sx, sy, sw, sh }],
                    walk: [{ sx, sy, sw, sh }],
                    jump: [{ sx, sy, sw, sh }],
                    crouch: { sx, sy, sw, sh },
                    block: { sx, sy, sw, sh },
                    punch_light: [{ sx, sy, sw, sh }],
                    punch_heavy: [{ sx, sy, sw, sh }],
                    kick_light: [{ sx, sy, sw, sh }],
                    kick_heavy: [{ sx, sy, sw, sh }],
                    special: [{ sx, sy, sw, sh }],
                    hurt: { sx, sy, sw, sh },
                    dizzy: [{ sx, sy, sw, sh }],
                    defeat_kneeling: { sx, sy, sw, sh },
                    defeat_dead: { sx, sy, sw, sh },
                    victory: [{ sx, sy, sw, sh }]
                };
            }

            if (!framesDef) return false;

            // Helper to add frame to Phaser Texture Manager
            const safeAddFrame = (fName, sx, sy, sw, sh) => {
                if (!texture.has(fName) && sw > 0 && sh > 0) {
                    texture.add(fName, 0, Math.max(0, sx), Math.max(0, sy), sw, sh);
                }
            };

            // Remove existing animations for this character before recreating
            const animKeys = [
                'idle', 'walk', 'jump', 'crouch', 'block',
                'punch_light', 'punch_heavy', 'kick_light', 'kick_heavy',
                'special', 'hurt', 'dizzy', 'defeat', 'victory'
            ];
            animKeys.forEach(name => {
                const fullKey = `${charKey}_${name}`;
                if (this.anims.exists(fullKey)) {
                    this.anims.remove(fullKey);
                }
            });

            // 1. Idle Frames
            if (Array.isArray(framesDef.idle)) {
                framesDef.idle.forEach((f, i) => safeAddFrame(`idle_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_idle`,
                    frames: framesDef.idle.map((_, i) => ({ key: texKey, frame: `idle_${i}` })),
                    frameRate: 6,
                    repeat: -1
                });
            }

            // 2. Walk Frames
            if (Array.isArray(framesDef.walk)) {
                framesDef.walk.forEach((f, i) => safeAddFrame(`walk_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_walk`,
                    frames: framesDef.walk.map((_, i) => ({ key: texKey, frame: `walk_${i}` })),
                    frameRate: 8,
                    repeat: -1
                });
            }

            // 3. Jump Frames
            if (Array.isArray(framesDef.jump)) {
                framesDef.jump.forEach((f, i) => safeAddFrame(`jump_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_jump`,
                    frames: framesDef.jump.map((_, i) => ({ key: texKey, frame: `jump_${i}` })),
                    frameRate: 6,
                    repeat: 0
                });
            }

            // 4. Crouch Frame
            if (framesDef.crouch) {
                safeAddFrame('crouch_0', framesDef.crouch.sx, framesDef.crouch.sy, framesDef.crouch.sw, framesDef.crouch.sh);
                this.anims.create({
                    key: `${charKey}_crouch`,
                    frames: [{ key: texKey, frame: 'crouch_0' }],
                    frameRate: 6,
                    repeat: -1
                });
            }

            // 5. Block Frame
            if (framesDef.block) {
                safeAddFrame('block_0', framesDef.block.sx, framesDef.block.sy, framesDef.block.sw, framesDef.block.sh);
                this.anims.create({
                    key: `${charKey}_block`,
                    frames: [{ key: texKey, frame: 'block_0' }],
                    frameRate: 6,
                    repeat: -1
                });
            }

            // 6. Punch Light
            if (Array.isArray(framesDef.punch_light)) {
                framesDef.punch_light.forEach((f, i) => safeAddFrame(`punch_l_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_punch_light`,
                    frames: framesDef.punch_light.map((_, i) => ({ key: texKey, frame: `punch_l_${i}` })),
                    frameRate: 10,
                    repeat: 0
                });
            }

            // 7. Punch Heavy
            if (Array.isArray(framesDef.punch_heavy)) {
                framesDef.punch_heavy.forEach((f, i) => safeAddFrame(`punch_h_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_punch_heavy`,
                    frames: framesDef.punch_heavy.map((_, i) => ({ key: texKey, frame: `punch_h_${i}` })),
                    frameRate: 8,
                    repeat: 0
                });
            }

            // 8. Kick Light
            if (Array.isArray(framesDef.kick_light)) {
                framesDef.kick_light.forEach((f, i) => safeAddFrame(`kick_l_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_kick_light`,
                    frames: framesDef.kick_light.map((_, i) => ({ key: texKey, frame: `kick_l_${i}` })),
                    frameRate: 10,
                    repeat: 0
                });
            }

            // 9. Kick Heavy
            if (Array.isArray(framesDef.kick_heavy)) {
                framesDef.kick_heavy.forEach((f, i) => safeAddFrame(`kick_h_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_kick_heavy`,
                    frames: framesDef.kick_heavy.map((_, i) => ({ key: texKey, frame: `kick_h_${i}` })),
                    frameRate: 8,
                    repeat: 0
                });
            }

            // 10. Special Moves
            const specials = framesDef.special || framesDef.special_bite || framesDef.punch_heavy;
            if (Array.isArray(specials)) {
                specials.forEach((f, i) => safeAddFrame(`special_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_special`,
                    frames: specials.map((_, i) => ({ key: texKey, frame: `special_${i}` })),
                    frameRate: 8,
                    repeat: 0
                });
            }

            // 11. Hurt
            if (framesDef.hurt) {
                safeAddFrame('hurt_0', framesDef.hurt.sx, framesDef.hurt.sy, framesDef.hurt.sw, framesDef.hurt.sh);
                this.anims.create({
                    key: `${charKey}_hurt`,
                    frames: [{ key: texKey, frame: 'hurt_0' }],
                    frameRate: 8,
                    repeat: 0
                });
            }

            // 12. Dizzy
            if (Array.isArray(framesDef.dizzy)) {
                framesDef.dizzy.forEach((f, i) => safeAddFrame(`dizzy_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_dizzy`,
                    frames: framesDef.dizzy.map((_, i) => ({ key: texKey, frame: `dizzy_${i}` })),
                    frameRate: 6,
                    repeat: -1
                });
            }

            // 13. Defeat
            const defeatFrame = framesDef.defeat_kneeling || framesDef.knockdown || framesDef.hurt;
            if (defeatFrame) {
                safeAddFrame('defeat_0', defeatFrame.sx, defeatFrame.sy, defeatFrame.sw, defeatFrame.sh);
                this.anims.create({
                    key: `${charKey}_defeat`,
                    frames: [{ key: texKey, frame: 'defeat_0' }],
                    frameRate: 4,
                    repeat: 0
                });
            }

            // 14. Victory
            if (Array.isArray(framesDef.victory)) {
                framesDef.victory.forEach((f, i) => safeAddFrame(`victory_${i}`, f.sx, f.sy, f.sw, f.sh));
                this.anims.create({
                    key: `${charKey}_victory`,
                    frames: framesDef.victory.map((_, i) => ({ key: texKey, frame: `victory_${i}` })),
                    frameRate: 6,
                    repeat: -1
                });
            }

            this.registeredCharacters.add(charKey);
            return true;
        } catch (e) {
            console.warn(`[PhaserAnims] Error creating anims for ${charKey}:`, e);
            return false;
        }
    }

    // Generate complete canvas guaranteeing no frame is ever empty transparent pixels
    generateCompleteCanvas(charKey) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 576;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            const dummyFighter = { id: charKey, state: 'idle', stateTimer: 0, meter: 0, isFrozen: false, isPoisoned: false };

            if (window.pixelRenderer && pixelRenderer.rosterLoaded && pixelRenderer.rosterGrid[charKey]) {
                pixelRenderer.drawRosterFighter(ctx, dummyFighter, pixelRenderer.rosterCanvas);
            } else if (window.pixelRenderer && pixelRenderer.drawProceduralFighter) {
                // Populate key frame locations with procedural fighter
                const locations = [
                    [15, 78, 70, 86], [135, 78, 70, 86], [255, 78, 70, 86], // idle
                    [15, 168, 68, 88], [110, 168, 68, 88], [205, 168, 68, 88], // walk
                    [15, 262, 68, 88], [110, 262, 68, 88], // jump
                    [215, 275, 70, 75], [310, 275, 70, 75], // crouch, block
                    [15, 356, 85, 88], [130, 356, 95, 88], // punch
                    [15, 450, 90, 90], [135, 450, 95, 90], // kick
                    [15, 546, 110, 98], [145, 546, 115, 98], // special
                    [15, 656, 75, 80], [20, 738, 75, 86], // hurt, dizzy
                    [25, 832, 95, 72], [25, 958, 80, 66]  // defeat, victory
                ];
                locations.forEach(([x, y, w, h]) => {
                    pixelRenderer.drawProceduralFighter(ctx, dummyFighter, x, y, w, h);
                });
            }
            return canvas;
        } catch (e) {
            return null;
        }
    }

    // Called when a character's spritesheet finishes loading asynchronously
    updateCharacterTexture(charKey, offCanvas) {
        if (!charKey) return;
        this.ensureCharacterAnims(charKey, true);

        const texKey = `char_${charKey}`;
        if (this.p1Key === charKey && this.p1Sprite) {
            this.p1Sprite.setTexture(texKey);
            this.p1Sprite.visible = true;
            if (this.anims.exists(`${charKey}_idle`)) {
                this.p1Sprite.play(`${charKey}_idle`, true);
            }
        }
        if (this.p2Key === charKey && this.p2Sprite) {
            this.p2Sprite.setTexture(texKey);
            this.p2Sprite.visible = true;
            if (this.anims.exists(`${charKey}_idle`)) {
                this.p2Sprite.play(`${charKey}_idle`, true);
            }
        }
    }

    // Setup fighters for match
    setupFighters(p1, p2) {
        const p1Key = typeof p1 === 'string' ? p1 : (p1 ? p1.id : 'leon');
        const p2Key = typeof p2 === 'string' ? p2 : (p2 ? p2.id : 'latina');
        this.p1Key = p1Key;
        this.p2Key = p2Key;

        if (!this.isSceneReady) return;

        this.ensureCharacterAnims(p1Key);
        this.ensureCharacterAnims(p2Key);

        const tex1 = `char_${p1Key}`;
        const tex2 = `char_${p2Key}`;

        // Scale tuned for 640x360 coordinates
        if (this.p1Sprite) {
            this.p1Sprite.setTexture(tex1);
            this.p1Sprite.visible = true;
            const scale1 = p1Key === 'leon' ? 2.4 : 1.35;
            this.p1Sprite.setScale(scale1);
            if (this.anims.exists(`${p1Key}_idle`)) {
                this.p1Sprite.play(`${p1Key}_idle`, true);
            }
        }

        if (this.p2Sprite) {
            this.p2Sprite.setTexture(tex2);
            this.p2Sprite.visible = true;
            const scale2 = p2Key === 'leon' ? 2.4 : 1.35;
            this.p2Sprite.setScale(scale2);
            if (this.anims.exists(`${p2Key}_idle`)) {
                this.p2Sprite.play(`${p2Key}_idle`, true);
            }
        }
    }

    // Update individual fighter sprite, animation and FX
    updateFighter(sprite, fighter) {
        if (!sprite || !fighter) return;

        // Position: Align sprite bottom to fighter street level in 640x360 coordinates
        sprite.x = fighter.x;
        sprite.y = fighter.y;
        sprite.visible = true;

        // Orientation / Flips
        sprite.setFlipX(fighter.facing === 'left');

        // Map fighter state to Phaser animation key
        const charKey = fighter.id;
        let animName = 'idle';

        switch (fighter.state) {
            case 'idle':
                animName = 'idle';
                break;
            case 'walk':
            case 'walk_forward':
            case 'walk_backward':
                animName = 'walk';
                break;
            case 'jump':
            case 'jump_forward':
            case 'jump_backward':
                animName = 'jump';
                break;
            case 'crouch':
                animName = 'crouch';
                break;
            case 'block':
                animName = 'block';
                break;
            case 'light_attack':
            case 'punch_light':
                animName = 'punch_light';
                break;
            case 'heavy_attack':
            case 'punch_heavy':
                animName = 'punch_heavy';
                break;
            case 'kick_light':
                animName = 'kick_light';
                break;
            case 'kick_heavy':
                animName = 'kick_heavy';
                break;
            case 'special1':
            case 'special2':
            case 'special3':
            case 'special_attack':
            case 'super_attack':
                animName = 'special';
                break;
            case 'hurt':
                animName = 'hurt';
                break;
            case 'dizzy':
                animName = 'dizzy';
                break;
            case 'defeat_kneeling':
            case 'defeat_dead':
            case 'ko':
                animName = 'defeat';
                break;
            case 'victory':
                animName = 'victory';
                break;
            default:
                animName = 'idle';
                break;
        }

        const targetAnimKey = `${charKey}_${animName}`;

        // Play animation registered in Phaser via this.anims.create
        if (this.anims.exists(targetAnimKey)) {
            if (!sprite.anims.isPlaying || (sprite.anims.currentAnim && sprite.anims.currentAnim.key !== targetAnimKey)) {
                sprite.anims.play(targetAnimKey, true);
            }
        }

        // Visual effects: Hurt tint / status effects
        if (fighter.state === 'hurt') {
            sprite.setTint(0xff3333);
        } else if (fighter.isFrozen) {
            sprite.setTint(0x70d6ff);
        } else if (fighter.isPoisoned) {
            sprite.setTint(0xb5179e);
        } else {
            sprite.clearTint();
        }

        // Draw Soft Street Shadow
        if (this.shadowGraphics) {
            const shadowW = 32 * (sprite.scaleX || 1.35);
            const shadowH = 10;
            this.shadowGraphics.fillStyle(0x000000, 0.4);
            this.shadowGraphics.fillEllipse(fighter.x, fighter.groundY || 315, shadowW, shadowH);
        }

        // Aura for Super Attack / Full Meter
        if (this.auraGraphics && (fighter.meter >= 100 || fighter.state === 'super_attack')) {
            const auraColor = (window.pixelRenderer && pixelRenderer.palettes[fighter.id])
                ? parseInt(pixelRenderer.palettes[fighter.id].aura.replace('#', '0x'))
                : 0xffd700;
            const radius = 35 + Math.sin(this.time.now / 120) * 6;
            this.auraGraphics.lineStyle(3, isNaN(auraColor) ? 0xffd700 : auraColor, 0.7);
            this.auraGraphics.strokeCircle(fighter.x, fighter.y - 50, radius);
        }
    }

    // Render frame update from GameEngine
    updateMatch(p1, p2, projectiles, particles) {
        if (!this.isSceneReady) return false;

        // Clear per-frame FX graphics
        if (this.shadowGraphics) this.shadowGraphics.clear();
        if (this.auraGraphics) this.auraGraphics.clear();
        if (this.projectilesGraphics) this.projectilesGraphics.clear();

        // Update P1 & P2
        if (p1 && this.p1Sprite) this.updateFighter(this.p1Sprite, p1);
        if (p2 && this.p2Sprite) this.updateFighter(this.p2Sprite, p2);

        // Render Projectiles
        if (this.projectilesGraphics && Array.isArray(projectiles)) {
            projectiles.forEach(p => {
                const col = p.color ? parseInt(p.color.replace('#', '0x')) : 0x00e5ff;
                const validCol = isNaN(col) ? 0x00e5ff : col;
                this.projectilesGraphics.fillStyle(validCol, 0.9);
                this.projectilesGraphics.fillCircle(p.x, p.y, p.radius || 10);
                this.projectilesGraphics.lineStyle(2, 0xffffff, 0.8);
                this.projectilesGraphics.strokeCircle(p.x, p.y, (p.radius || 10) + 2);
            });
        // Check if at least one fighter is visibly rendering in Phaser
        const hasVisibleFighter = (this.p1Sprite && this.p1Sprite.visible) || (this.p2Sprite && this.p2Sprite.visible);
        if (!hasVisibleFighter) {
            return false;
        }

        return true;
    }
}

class PhaserAnimationEngine {
    constructor() {
        this.game = null;
        this.scene = null;
        this.isActive = false;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        try {
            const canvas = document.getElementById('phaserCanvas');
            if (!canvas) {
                console.warn("[PhaserEngine] #phaserCanvas not found in DOM");
                return;
            }

            // Internal resolution 640x360 matching gameCanvas 1:1
            const config = {
                type: Phaser.CANVAS,
                canvas: canvas,
                width: 640,
                height: 360,
                transparent: true,
                pixelArt: true,
                physics: { default: false },
                scene: FightScene
            };

            this.game = new Phaser.Game(config);

            this.game.events.once('step', () => {
                this.scene = this.game.scene.getScene('FightScene');
                this.isActive = true;
                console.log("[PhaserEngine] Phaser 3 animation engine initialized successfully!");
            });

            this.isInitialized = true;
        } catch (e) {
            console.warn("[PhaserEngine] Failed to initialize Phaser:", e);
            this.isActive = false;
        }
    }

    onSheetLoaded(charKey, offCanvas) {
        if (this.scene && this.scene.updateCharacterTexture) {
            this.scene.updateCharacterTexture(charKey, offCanvas);
        }
    }

    onRosterLoaded() {
        if (this.scene && this.scene.ensureCharacterAnims) {
            if (this.scene.p1Key) this.scene.ensureCharacterAnims(this.scene.p1Key, true);
            if (this.scene.p2Key) this.scene.ensureCharacterAnims(this.scene.p2Key, true);
        }
    }

    setupMatch(p1, p2) {
        if (this.scene) {
            this.scene.setupFighters(p1, p2);
        } else if (this.game) {
            setTimeout(() => {
                this.scene = this.game.scene.getScene('FightScene');
                if (this.scene) this.scene.setupFighters(p1, p2);
            }, 60);
        }
    }

    updateAndRender(p1, p2, projectiles = [], particles = []) {
        if (!this.isActive || !this.scene) return false;
        try {
            return this.scene.updateMatch(p1, p2, projectiles, particles);
        } catch (e) {
            return false;
        }
    }
}

// Global Singleton Instance
const phaserAnimationEngine = new PhaserAnimationEngine();
window.phaserAnimationEngine = phaserAnimationEngine;
