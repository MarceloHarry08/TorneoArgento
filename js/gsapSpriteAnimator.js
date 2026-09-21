/* ==========================================================================
   TORNEO ARGENTO 16-BIT - GSAP SPRITE ANIMATOR & STUDIO ENGINE
   Powered by GreenSock Animation Platform (GSAP 3)
   ========================================================================== */

class GsapSpriteAnimator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 640;
        this.height = 360;

        // Current state
        this.currentChar = 'leon';
        this.currentAction = 'idle';
        this.currentMode = 'kinetic'; // 'frame', 'kinetic', 'combo', 'versus'
        this.versusOpponent = 'latina';

        // Display Options
        this.zoom = 1.3; // 1x, 1.3x, 2x
        this.backgroundType = 'dojo'; // 'checkerboard', 'dojo', 'obelisco', 'patio'
        this.showHitbox = false;
        this.showOnionSkin = false;
        this.fps = 8;
        this.speed = 1.0;
        this.isPlaying = true;
        this.isLooping = true;

        // Animated Properties (Driven by GSAP)
        this.animState = {
            // Player 1 properties
            frameIndex: 0,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            alpha: 1,
            tint: null,
            glow: 0,
            auraScale: 0.8,
            auraAlpha: 0,
            flashAlpha: 0,

            // Player 2 properties (for versus duel mode)
            p2FrameIndex: 0,
            p2X: 0,
            p2Y: 0,
            p2ScaleX: 1,
            p2ScaleY: 1,
            p2Rotation: 0,
            p2Alpha: 1,
            p2Action: 'idle',
            p2Facing: 'left',

            // Global FX
            shakeX: 0,
            shakeY: 0,
            particles: [],
            projectiles: []
        };

        // Active GSAP Timeline / Tween
        this.timeline = null;
        this.isUserScrubbing = false;

        // Roster of all characters
        this.rosterList = [
            { id: 'leon', name: '🦁 El León (Javier Milei)', hasSheet: true },
            { id: 'pepeargento', name: '👟 Pepe Argento (Francella)', hasSheet: true },
            { id: 'elmesias', name: '⚽ El Mesías (Lionel Messi)', hasSheet: true },
            { id: 'elcomandante', name: '💵 El Comandante (Ricardo Fort)', hasSheet: true },
            { id: 'eleternauta', name: '❄️ El Eternauta (Juan Salvo)', hasSheet: true },
            { id: 'latina', name: '🏛️ La Tina (Cristina Kirchner)', hasSheet: true },
            { id: 'inmortal', name: '👑 La Inmortal (Mirtha Legrand)', hasSheet: true },
            { id: 'ojosazules', name: '🐱 Ojos Azules (Mauricio Macri)', hasSheet: true },
            { id: 'moria', name: '🪶 La One (Moria Casán)', hasSheet: true },
            { id: 'lasu', name: '☎️ La Su (Susana Giménez)', hasSheet: true },
            { id: 'oidoabsoluto', name: '🎹 Oído Absoluto (Charly García)', hasSheet: true },
            { id: 'pergolas', name: '🕶️ Pérgolas (Mario Pergolini)', hasSheet: true },
            { id: 'hugo', name: '🚛 Hugo (Camioneros)', hasSheet: true },
            // All 16 characters now have high-resolution sprite sheets
            { id: 'sangrejaponesa', name: '⚔️ Sangre Japonesa (China Suárez)', hasSheet: true },
            { id: 'lafaraona', name: '👑 La Faraona (Martín Cirio)', hasSheet: true },
            { id: 'badbitch', name: '💅 Bad Bitch (Wanda Nara)', hasSheet: true }
        ];

        // Actions mapping
        this.actionList = [
            { id: 'idle', name: 'Pose de Combate (Idle)' },
            { id: 'walk', name: 'Caminar (Paso adelante)' },
            { id: 'jump', name: 'Salto Acrobático' },
            { id: 'crouch', name: 'Agacharse' },
            { id: 'block', name: 'Bloqueo Defensivo' },
            { id: 'punch_light', name: 'Golpe Liviano (Jab)' },
            { id: 'punch_heavy', name: 'Golpe Pesado (Gancho)' },
            { id: 'kick_light', name: 'Patada Baja' },
            { id: 'kick_heavy', name: 'Patada Voladora' },
            { id: 'special', name: 'Poder Especial 16-Bit' },
            { id: 'hurt', name: 'Golpe Recibido (Impacto)' },
            { id: 'dizzy', name: 'Mareado (Dizzy Stun)' },
            { id: 'defeat', name: 'Caída KO (Derrota)' },
            { id: 'victory', name: 'Celebración de Victoria' }
        ];

        this.cachedCanvases = {};
        this.cachedFrames = {};
        this.tickerFn = null;
    }

    init(canvasElement) {
        this.canvas = canvasElement || document.getElementById('gsap-animator-canvas');
        if (!this.canvas) {
            console.warn('[GsapSpriteAnimator] Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });
        this.ctx.imageSmoothingEnabled = false;

        // Setup render ticker with GSAP
        if (this.tickerFn) {
            gsap.ticker.remove(this.tickerFn);
        }
        this.tickerFn = () => this.render();
        gsap.ticker.add(this.tickerFn);

        // Preload and cache frames
        this.buildAnimation(this.currentChar, this.currentAction, this.currentMode);
        this.updateFilmstrip();
        console.log('[GsapSpriteAnimator] Engine initialized successfully with GSAP 3');
    }

    // Get frames definition for given character & action
    getFramesForAction(charKey, action) {
        const isLeon = (charKey === 'leon');
        const framesDef = isLeon ? (window.pixelRenderer ? pixelRenderer.leonFrames : null) 
                                 : (window.pixelRenderer ? pixelRenderer.standardFrames : null);

        if (!framesDef) {
            // Fallback frames (768x1600 schema)
            return [{ sx: 15, sy: 90, sw: 120, sh: 175 }];
        }

        switch (action) {
            case 'idle':
                return framesDef.idle || [{ sx: 15, sy: 90, sw: 120, sh: 175 }];
            case 'walk':
                return framesDef.walk || [{ sx: 15, sy: 275, sw: 120, sh: 175 }];
            case 'jump':
                return framesDef.jump || [{ sx: 15, sy: 460, sw: 120, sh: 175 }];
            case 'crouch':
                return [framesDef.crouch || { sx: 275, sy: 460, sw: 120, sh: 175 }];
            case 'block':
                return [framesDef.block || { sx: 405, sy: 460, sw: 120, sh: 175 }];
            case 'punch_light':
                return framesDef.punch_light || [{ sx: 15, sy: 645, sw: 120, sh: 175 }];
            case 'punch_heavy':
                return framesDef.punch_heavy || [{ sx: 285, sy: 645, sw: 120, sh: 175 }];
            case 'kick_light':
                return framesDef.kick_light || [{ sx: 15, sy: 830, sw: 120, sh: 175 }];
            case 'kick_heavy':
                return framesDef.kick_heavy || [{ sx: 285, sy: 830, sw: 120, sh: 175 }];
            case 'special':
                return framesDef.special || [{ sx: 15, sy: 1015, sw: 130, sh: 175 }];
            case 'hurt':
                return [framesDef.hurt || { sx: 15, sy: 1200, sw: 120, sh: 175 }];
            case 'dizzy':
                return framesDef.dizzy || [{ sx: 145, sy: 1200, sw: 120, sh: 175 }];
            case 'defeat':
                return [
                    framesDef.defeat_kneeling || { sx: 15, sy: 1385, sw: 125, sh: 175 },
                    framesDef.defeat_dead || { sx: 150, sy: 1385, sw: 175, sh: 175 }
                ];
            case 'victory':
                return framesDef.victory || [{ sx: 335, sy: 1385, sw: 120, sh: 175 }];
            default:
                return framesDef.idle || [{ sx: 15, sy: 90, sw: 120, sh: 175 }];
        }
    }

    // Get Sprite Sheet Source (Transparent Canvas or image)
    getSpriteSource(charKey) {
        if (window.pixelRenderer) {
            if (pixelRenderer.characterCanvases && pixelRenderer.characterCanvases[charKey]) {
                return pixelRenderer.characterCanvases[charKey];
            }
            if (pixelRenderer.characterSheets && pixelRenderer.characterSheets[charKey] && pixelRenderer.characterSheets[charKey].complete) {
                return pixelRenderer.characterSheets[charKey];
            }
            if (pixelRenderer.rosterCanvas) {
                return pixelRenderer.rosterCanvas;
            }
            if (pixelRenderer.rosterRawImg && pixelRenderer.rosterRawImg.complete) {
                return pixelRenderer.rosterRawImg;
            }
        }
        return null;
    }

    // Reset Animated State
    resetState() {
        this.animState.frameIndex = 0;
        this.animState.x = 0;
        this.animState.y = 0;
        this.animState.scaleX = 1;
        this.animState.scaleY = 1;
        this.animState.rotation = 0;
        this.animState.alpha = 1;
        this.animState.tint = null;
        this.animState.glow = 0;
        this.animState.auraScale = 0.8;
        this.animState.auraAlpha = 0;
        this.animState.flashAlpha = 0;

        this.animState.p2FrameIndex = 0;
        this.animState.p2X = 0;
        this.animState.p2Y = 0;
        this.animState.p2ScaleX = 1;
        this.animState.p2ScaleY = 1;
        this.animState.p2Rotation = 0;
        this.animState.p2Alpha = 1;
        this.animState.p2Action = 'idle';

        this.animState.shakeX = 0;
        this.animState.shakeY = 0;
        this.animState.particles = [];
        this.animState.projectiles = [];
    }

    // Build or Rebuild Animation with GSAP
    buildAnimation(charKey = this.currentChar, action = this.currentAction, mode = this.currentMode) {
        this.currentChar = charKey;
        this.currentAction = action;
        this.currentMode = mode;

        // Kill existing timeline
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }

        this.resetState();

        const frames = this.getFramesForAction(charKey, action);
        const totalFrames = frames.length;

        // GSAP MASTER TIMELINE
        this.timeline = gsap.timeline({
            repeat: this.isLooping ? -1 : 0,
            onUpdate: () => this.onTimelineUpdate()
        });

        // 1. MODE: FRAME BY FRAME (Pure Sprite Animation)
        if (mode === 'frame') {
            const frameDuration = (1 / Math.max(1, this.fps));
            const animDuration = Math.max(0.2, totalFrames * frameDuration);

            if (totalFrames > 1) {
                this.timeline.to(this.animState, {
                    frameIndex: totalFrames - 1,
                    duration: animDuration,
                    ease: `steps(${totalFrames - 1})`
                });
            } else {
                this.animState.frameIndex = 0;
                this.timeline.to(this.animState, {
                    duration: 1
                });
            }
        }
        // 2. MODE: KINETIC GSAP MOTION (Kinetic Physics & Easing)
        else if (mode === 'kinetic') {
            this.buildKineticTimeline(this.timeline, charKey, action, frames);
        }
        // 3. MODE: FULL COMBO (Choreographed Fight Sequence with GSAP)
        else if (mode === 'combo') {
            this.buildFullComboTimeline(this.timeline, charKey);
        }
        // 4. MODE: VERSUS DUEL (1 vs 1 Interactive Battle with GSAP)
        else if (mode === 'versus') {
            this.buildVersusDuelTimeline(this.timeline, charKey, this.versusOpponent);
        }

        // Apply global timescale / playback speed
        this.timeline.timeScale(this.speed);

        if (!this.isPlaying) {
            this.timeline.pause();
        }

        this.updateUIControls();
    }

    // Build Kinetic Action Timeline
    buildKineticTimeline(tl, charKey, action, frames) {
        const totalFrames = frames.length;
        const frameDuration = (1 / Math.max(1, this.fps));
        const totalTime = Math.max(0.3, totalFrames * frameDuration);

        // Frame cycle
        if (totalFrames > 1) {
            tl.to(this.animState, {
                frameIndex: totalFrames - 1,
                duration: totalTime,
                ease: `steps(${totalFrames - 1})`
            }, 0);
        }

        // Physical motions according to action
        switch (action) {
            case 'idle':
                // Subtle breathing float with squash & stretch
                tl.to(this.animState, {
                    y: -5,
                    scaleY: 1.03,
                    scaleX: 0.98,
                    duration: 0.6,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: 1
                }, 0);
                break;

            case 'walk':
                // Striding back and forth with slight head bob
                tl.to(this.animState, {
                    x: 60,
                    duration: totalTime / 2,
                    ease: 'power1.inOut'
                }, 0)
                .to(this.animState, {
                    x: 0,
                    duration: totalTime / 2,
                    ease: 'power1.inOut'
                }, totalTime / 2)
                .to(this.animState, {
                    y: -4,
                    duration: totalTime / 4,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: 3
                }, 0);
                break;

            case 'jump':
                // Dramatic jump arc with anticipation squash, peak float and landing squash
                tl.to(this.animState, {
                    scaleY: 0.85,
                    scaleX: 1.15,
                    duration: 0.1,
                    ease: 'power1.in'
                }, 0)
                .to(this.animState, {
                    y: -110,
                    scaleY: 1.15,
                    scaleX: 0.9,
                    duration: 0.45,
                    ease: 'power2.out'
                }, 0.1)
                .to(this.animState, {
                    y: 0,
                    scaleY: 0.8,
                    scaleX: 1.25,
                    duration: 0.35,
                    ease: 'bounce.out',
                    onComplete: () => this.spawnGroundDust(this.animState.x, 0)
                }, 0.55)
                .to(this.animState, {
                    scaleY: 1,
                    scaleX: 1,
                    duration: 0.2,
                    ease: 'power1.out'
                }, 0.9);
                break;

            case 'crouch':
                tl.to(this.animState, {
                    y: 12,
                    scaleY: 0.82,
                    scaleX: 1.15,
                    duration: 0.2,
                    ease: 'power2.out'
                }, 0);
                break;

            case 'block':
                tl.to(this.animState, {
                    x: -12,
                    scaleX: 0.95,
                    duration: 0.1,
                    ease: 'power1.out'
                }, 0)
                .to(this.animState, {
                    x: 0,
                    scaleX: 1,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.4)'
                }, 0.1);
                break;

            case 'punch_light':
                // Fast snap jab with back ease
                tl.to(this.animState, {
                    x: 35,
                    scaleX: 1.08,
                    duration: 0.12,
                    ease: 'back.out(2)',
                    onComplete: () => this.spawnHitSparks(this.animState.x + 60, this.animState.y - 45, '#ffd700')
                }, 0)
                .to(this.animState, {
                    x: 0,
                    scaleX: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                }, 0.15);
                break;

            case 'punch_heavy':
                // Deep lunging uppercut with screen shake
                tl.to(this.animState, {
                    x: -15,
                    duration: 0.1,
                    ease: 'power1.in'
                }, 0)
                .to(this.animState, {
                    x: 55,
                    y: -18,
                    duration: 0.18,
                    ease: 'back.out(3)',
                    onStart: () => {
                        this.screenShake(8);
                        this.spawnHitSparks(this.animState.x + 75, this.animState.y - 65, '#ff2a55');
                    }
                }, 0.1)
                .to(this.animState, {
                    x: 0,
                    y: 0,
                    duration: 0.25,
                    ease: 'power2.out'
                }, 0.32);
                break;

            case 'kick_light':
                tl.to(this.animState, {
                    x: 25,
                    rotation: 4,
                    duration: 0.14,
                    ease: 'power2.out'
                }, 0)
                .to(this.animState, {
                    x: 0,
                    rotation: 0,
                    duration: 0.18,
                    ease: 'power1.out'
                }, 0.16);
                break;

            case 'kick_heavy':
                // Flying high roundhouse kick
                tl.to(this.animState, {
                    y: -40,
                    x: 65,
                    rotation: -12,
                    duration: 0.24,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.screenShake(10);
                        this.spawnHitSparks(this.animState.x + 70, this.animState.y - 30, '#00e5ff');
                    }
                }, 0)
                .to(this.animState, {
                    y: 0,
                    x: 0,
                    rotation: 0,
                    duration: 0.3,
                    ease: 'bounce.out',
                    onComplete: () => this.spawnGroundDust(0, 0)
                }, 0.28);
                break;

            case 'special':
                // Full Argentine Special Power Aura & Projectile Surge
                tl.to(this.animState, {
                    x: -20,
                    auraScale: 1.6,
                    auraAlpha: 0.85,
                    duration: 0.35,
                    ease: 'power2.inOut',
                    onStart: () => this.screenShake(12)
                }, 0)
                .to(this.animState, {
                    x: 45,
                    auraScale: 2.2,
                    auraAlpha: 0.3,
                    duration: 0.2,
                    ease: 'back.out(2)',
                    onStart: () => {
                        this.shootProjectile(this.animState.x + 60, this.animState.y - 50);
                        this.screenShake(16);
                    }
                }, 0.38)
                .to(this.animState, {
                    x: 0,
                    auraScale: 0.8,
                    auraAlpha: 0,
                    duration: 0.35,
                    ease: 'power1.out'
                }, 0.65);
                break;

            case 'hurt':
                tl.to(this.animState, {
                    x: -35,
                    rotation: -8,
                    flashAlpha: 0.8,
                    duration: 0.08,
                    ease: 'power2.out'
                }, 0)
                .to(this.animState, {
                    x: '+=10',
                    rotation: '+=4',
                    duration: 0.05,
                    yoyo: true,
                    repeat: 5,
                    ease: 'rough'
                }, 0.08)
                .to(this.animState, {
                    x: 0,
                    rotation: 0,
                    flashAlpha: 0,
                    duration: 0.25,
                    ease: 'power2.out'
                }, 0.35);
                break;

            case 'dizzy':
                tl.to(this.animState, {
                    rotation: 6,
                    x: 8,
                    duration: 0.4,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: 3
                }, 0);
                break;

            case 'defeat':
                tl.to(this.animState, {
                    y: 15,
                    scaleY: 0.9,
                    duration: 0.4,
                    ease: 'power1.out'
                }, 0)
                .to(this.animState, {
                    rotation: -90,
                    y: 28,
                    duration: 0.5,
                    ease: 'bounce.out',
                    onStart: () => this.screenShake(15)
                }, 0.4);
                break;

            case 'victory':
                tl.to(this.animState, {
                    y: -50,
                    scaleY: 1.15,
                    duration: 0.3,
                    ease: 'power2.out'
                }, 0)
                .to(this.animState, {
                    y: 0,
                    scaleY: 1,
                    duration: 0.3,
                    ease: 'bounce.out',
                    onComplete: () => this.spawnConfettiBurst(this.animState.x, -50)
                }, 0.3)
                .to(this.animState, {
                    y: -10,
                    duration: 0.4,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: 2
                }, 0.65);
                break;
        }
    }

    // Build Full Choreographed Combo Timeline
    buildFullComboTimeline(tl, charKey) {
        // Step 1: Intro Walk
        tl.call(() => { this.setActionFrames(charKey, 'walk'); }, null, 0)
          .fromTo(this.animState, { x: -140 }, { x: -40, duration: 0.7, ease: 'power1.inOut' }, 0);

        // Step 2: Jab Light Punch
        tl.call(() => { this.setActionFrames(charKey, 'punch_light'); }, null, 0.75)
          .to(this.animState, {
              x: 0,
              duration: 0.15,
              ease: 'back.out(2)',
              onComplete: () => this.spawnHitSparks(this.animState.x + 55, this.animState.y - 45, '#ffd700')
          }, 0.75)
          .to(this.animState, { x: -10, duration: 0.1 }, 0.92);

        // Step 3: Heavy Punch / Uppercut
        tl.call(() => { this.setActionFrames(charKey, 'punch_heavy'); }, null, 1.05)
          .to(this.animState, {
              x: 25,
              y: -15,
              duration: 0.2,
              ease: 'back.out(3)',
              onStart: () => {
                  this.screenShake(10);
                  this.spawnHitSparks(this.animState.x + 60, this.animState.y - 65, '#ff2a55');
              }
          }, 1.05)
          .to(this.animState, { x: 10, y: 0, duration: 0.15 }, 1.28);

        // Step 4: Flying Roundhouse Kick
        tl.call(() => { this.setActionFrames(charKey, 'kick_heavy'); }, null, 1.45)
          .to(this.animState, {
              x: 60,
              y: -35,
              rotation: -10,
              duration: 0.25,
              ease: 'power2.out',
              onStart: () => {
                  this.screenShake(12);
                  this.spawnHitSparks(this.animState.x + 70, this.animState.y - 30, '#00e5ff');
              }
          }, 1.45)
          .to(this.animState, {
              x: 30,
              y: 0,
              rotation: 0,
              duration: 0.25,
              ease: 'bounce.out'
          }, 1.72);

        // Step 5: Super Special Attack Release
        tl.call(() => { this.setActionFrames(charKey, 'special'); }, null, 2.05)
          .to(this.animState, {
              x: 10,
              auraScale: 2.0,
              auraAlpha: 0.9,
              duration: 0.4,
              ease: 'power1.in',
              onStart: () => this.screenShake(14)
          }, 2.05)
          .to(this.animState, {
              x: 70,
              duration: 0.22,
              ease: 'power3.out',
              onStart: () => {
                  this.shootProjectile(this.animState.x + 70, this.animState.y - 45);
                  this.screenShake(20);
              }
          }, 2.48)
          .to(this.animState, { auraAlpha: 0, duration: 0.3 }, 2.75);

        // Step 6: Backflip Retreat
        tl.call(() => { this.setActionFrames(charKey, 'jump'); }, null, 2.85)
          .to(this.animState, {
              x: -30,
              y: -80,
              rotation: 360,
              duration: 0.5,
              ease: 'power2.out'
          }, 2.85)
          .to(this.animState, {
              y: 0,
              rotation: 0,
              duration: 0.3,
              ease: 'bounce.out'
          }, 3.35);

        // Step 7: Victory Pose
        tl.call(() => { this.setActionFrames(charKey, 'victory'); }, null, 3.7)
          .to(this.animState, {
              y: -30,
              duration: 0.3,
              ease: 'power2.out',
              onComplete: () => this.spawnConfettiBurst(this.animState.x, -50)
          }, 3.7)
          .to(this.animState, {
              y: 0,
              duration: 0.3,
              ease: 'bounce.out'
          }, 4.0)
          .to(this.animState, { duration: 1.0 }, 4.3); // Hold victory
    }

    // Build Versus Duel Timeline (P1 vs P2)
    buildVersusDuelTimeline(tl, p1Key, p2Key) {
        // Initial setup
        this.animState.x = -130;
        this.animState.p2X = 130;
        this.animState.p2Facing = 'left';

        // 1. Approach
        tl.call(() => {
            this.setActionFrames(p1Key, 'walk');
            this.setP2Action(p2Key, 'walk');
        }, null, 0)
        .to(this.animState, { x: -65, duration: 0.7, ease: 'power1.inOut' }, 0)
        .to(this.animState, { p2X: 65, duration: 0.7, ease: 'power1.inOut' }, 0);

        // 2. P1 punches, P2 blocks
        tl.call(() => {
            this.setActionFrames(p1Key, 'punch_light');
            this.setP2Action(p2Key, 'block');
        }, null, 0.75)
        .to(this.animState, { x: -45, duration: 0.15, ease: 'back.out(2)' }, 0.75)
        .to(this.animState, {
            p2X: 75,
            duration: 0.15,
            onStart: () => this.spawnHitSparks(15, -45, '#ffd700')
        }, 0.75)
        .to(this.animState, { x: -55, duration: 0.15 }, 0.92);

        // 3. P2 counters with heavy kick, P1 ducks
        tl.call(() => {
            this.setActionFrames(p1Key, 'crouch');
            this.setP2Action(p2Key, 'kick_heavy');
        }, null, 1.1)
        .to(this.animState, { y: 15, scaleY: 0.8, duration: 0.15 }, 1.1)
        .to(this.animState, {
            p2X: 30,
            p2Y: -25,
            duration: 0.25,
            ease: 'power2.out'
        }, 1.1)
        .to(this.animState, {
            p2X: 65,
            p2Y: 0,
            duration: 0.25,
            ease: 'bounce.out'
        }, 1.38);

        // 4. P1 rises and unleashes Special Attack
        tl.call(() => {
            this.setActionFrames(p1Key, 'special');
            this.setP2Action(p2Key, 'idle');
        }, null, 1.65)
        .to(this.animState, {
            y: 0,
            scaleY: 1,
            x: -70,
            auraScale: 2.2,
            auraAlpha: 0.95,
            duration: 0.45,
            ease: 'power2.in',
            onStart: () => this.screenShake(10)
        }, 1.65)
        .to(this.animState, {
            x: -25,
            duration: 0.2,
            ease: 'power3.out',
            onStart: () => {
                this.shootProjectile(-10, -45);
                this.screenShake(22);
            }
        }, 2.12);

        // 5. P2 is hit, flies back and falls KO
        tl.call(() => {
            this.setP2Action(p2Key, 'hurt');
        }, null, 2.22)
        .to(this.animState, {
            p2X: 160,
            p2Y: -40,
            p2Rotation: 25,
            duration: 0.35,
            ease: 'power2.out',
            onStart: () => this.spawnHitSparks(75, -45, '#ff2a55')
        }, 2.22)
        .call(() => {
            this.setP2Action(p2Key, 'defeat');
        }, null, 2.58)
        .to(this.animState, {
            p2Y: 25,
            p2Rotation: 90,
            duration: 0.35,
            ease: 'bounce.out',
            onStart: () => this.screenShake(15)
        }, 2.58)
        .to(this.animState, { auraAlpha: 0, duration: 0.3 }, 2.5);

        // 6. P1 Victory
        tl.call(() => {
            this.setActionFrames(p1Key, 'victory');
        }, null, 3.0)
        .to(this.animState, {
            y: -40,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => this.spawnConfettiBurst(this.animState.x, -50)
        }, 3.0)
        .to(this.animState, { y: 0, duration: 0.3, ease: 'bounce.out' }, 3.3)
        .to(this.animState, { duration: 1.2 }, 3.6);
    }

    // Helper to set frames for primary actor dynamically during timeline
    setActionFrames(charKey, action) {
        const frames = this.getFramesForAction(charKey, action);
        this.activeP1Frames = frames;
        this.animState.frameIndex = 0;
        if (frames.length > 1) {
            gsap.killTweensOf(this.animState, 'frameIndex');
            gsap.to(this.animState, {
                frameIndex: frames.length - 1,
                duration: frames.length * (1 / this.fps),
                ease: `steps(${frames.length - 1})`,
                repeat: 0
            });
        }
    }

    // Helper to set P2 action
    setP2Action(charKey, action) {
        this.animState.p2Action = action;
        const frames = this.getFramesForAction(charKey, action);
        this.activeP2Frames = frames;
        this.animState.p2FrameIndex = 0;
        if (frames.length > 1) {
            gsap.killTweensOf(this.animState, 'p2FrameIndex');
            gsap.to(this.animState, {
                p2FrameIndex: frames.length - 1,
                duration: frames.length * (1 / this.fps),
                ease: `steps(${frames.length - 1})`,
                repeat: 0
            });
        }
    }

    // Visual FX Helpers
    screenShake(intensity) {
        gsap.killTweensOf(this.animState, 'shakeX,shakeY');
        this.animState.shakeX = (Math.random() - 0.5) * intensity;
        this.animState.shakeY = (Math.random() - 0.5) * intensity;
        gsap.to(this.animState, {
            shakeX: 0,
            shakeY: 0,
            duration: 0.25,
            ease: 'power2.out'
        });
    }

    spawnHitSparks(x, y, color = '#ffd700') {
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            const p = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                color: (i % 2 === 0) ? '#ffffff' : color,
                alpha: 1
            };
            this.animState.particles.push(p);
            gsap.to(p, {
                x: p.x + p.vx * 15,
                y: p.y + p.vy * 15,
                alpha: 0,
                duration: 0.3 + Math.random() * 0.2,
                ease: 'power2.out',
                onComplete: () => {
                    const idx = this.animState.particles.indexOf(p);
                    if (idx !== -1) this.animState.particles.splice(idx, 1);
                }
            });
        }
    }

    spawnGroundDust(x, y) {
        for (let i = 0; i < 8; i++) {
            const dir = (i % 2 === 0) ? 1 : -1;
            const p = {
                x: x + dir * (Math.random() * 10),
                y: y,
                size: 3 + Math.random() * 5,
                color: '#cccccc',
                alpha: 0.7
            };
            this.animState.particles.push(p);
            gsap.to(p, {
                x: p.x + dir * (20 + Math.random() * 25),
                y: p.y - (5 + Math.random() * 10),
                size: 1,
                alpha: 0,
                duration: 0.4,
                ease: 'power1.out',
                onComplete: () => {
                    const idx = this.animState.particles.indexOf(p);
                    if (idx !== -1) this.animState.particles.splice(idx, 1);
                }
            });
        }
    }

    spawnConfettiBurst(x, y) {
        const colors = ['#ffd700', '#00e5ff', '#ff2a55', '#00ff66', '#ffffff'];
        for (let i = 0; i < 35; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
            const dist = 50 + Math.random() * 90;
            const p = {
                x: x,
                y: y,
                size: 3 + Math.random() * 4,
                color: colors[i % colors.length],
                alpha: 1,
                rotation: Math.random() * 360
            };
            this.animState.particles.push(p);
            gsap.to(p, {
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist + 40,
                rotation: p.rotation + 360,
                alpha: 0,
                duration: 0.9 + Math.random() * 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    const idx = this.animState.particles.indexOf(p);
                    if (idx !== -1) this.animState.particles.splice(idx, 1);
                }
            });
        }
    }

    shootProjectile(startX, startY) {
        const proj = {
            x: startX,
            y: startY,
            radius: 14,
            color: '#00e5ff',
            trail: []
        };
        this.animState.projectiles.push(proj);
        gsap.to(proj, {
            x: startX + 220,
            duration: 0.45,
            ease: 'power2.in',
            onUpdate: () => {
                proj.trail.push({ x: proj.x, y: proj.y, alpha: 0.8 });
                if (proj.trail.length > 5) proj.trail.shift();
            },
            onComplete: () => {
                this.spawnHitSparks(proj.x, proj.y, '#00e5ff');
                this.screenShake(12);
                const idx = this.animState.projectiles.indexOf(proj);
                if (idx !== -1) this.animState.projectiles.splice(idx, 1);
            }
        });
    }

    // Playback Controls
    play() {
        this.isPlaying = true;
        if (this.timeline) {
            this.timeline.play();
        }
        this.updatePlayButtonUI();
    }

    pause() {
        this.isPlaying = false;
        if (this.timeline) {
            this.timeline.pause();
        }
        this.updatePlayButtonUI();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    stepForward() {
        this.pause();
        if (!this.timeline) return;
        const totalDuration = this.timeline.totalDuration();
        const stepTime = 1 / Math.max(1, this.fps);
        const nextTime = Math.min(totalDuration, this.timeline.time() + stepTime);
        this.timeline.time(nextTime);
        this.onTimelineUpdate();
    }

    stepBackward() {
        this.pause();
        if (!this.timeline) return;
        const stepTime = 1 / Math.max(1, this.fps);
        const prevTime = Math.max(0, this.timeline.time() - stepTime);
        this.timeline.time(prevTime);
        this.onTimelineUpdate();
    }

    setSpeed(speedVal) {
        this.speed = parseFloat(speedVal) || 1.0;
        if (this.timeline) {
            this.timeline.timeScale(this.speed);
        }
        const speedDisplay = document.getElementById('gsap-speed-display');
        if (speedDisplay) speedDisplay.textContent = `${this.speed}x`;
    }

    setZoom(zoomVal) {
        this.zoom = parseFloat(zoomVal) || 1.3;
        const zoomDisplay = document.getElementById('gsap-zoom-display');
        if (zoomDisplay) zoomDisplay.textContent = `${this.zoom}x`;
    }

    setBackground(bgKey) {
        this.backgroundType = bgKey;
    }

    scrubTo(progressVal) {
        if (!this.timeline) return;
        this.isUserScrubbing = true;
        this.timeline.progress(progressVal).pause();
        this.isPlaying = false;
        this.updatePlayButtonUI();
        this.onTimelineUpdate();
        this.isUserScrubbing = false;
    }

    // Timeline update hook
    onTimelineUpdate() {
        if (!this.timeline) return;

        // Update progress slider
        const slider = document.getElementById('gsap-timeline-slider');
        if (slider && !this.isUserScrubbing) {
            slider.value = this.timeline.progress();
        }

        // Update time / frame display
        const timeDisplay = document.getElementById('gsap-time-display');
        if (timeDisplay) {
            const curr = this.timeline.time().toFixed(2);
            const total = this.timeline.totalDuration().toFixed(2);
            const currentFrame = Math.round(this.animState.frameIndex) + 1;
            const frames = this.getFramesForAction(this.currentChar, this.currentAction);
            timeDisplay.textContent = `⏱️ ${curr}s / ${total}s | CUADRO: ${currentFrame} / ${frames.length}`;
        }

        // Highlight active filmstrip thumbnail
        this.highlightActiveFilmstripFrame(Math.round(this.animState.frameIndex));
    }

    // MAIN RENDER LOOP (Called by GSAP Ticker)
    render() {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // Apply screen shake
        if (this.animState.shakeX || this.animState.shakeY) {
            ctx.translate(this.animState.shakeX, this.animState.shakeY);
        }

        // 1. Render Background
        this.renderBackground(ctx, w, h);

        // Center origin at ground level (X: 320, Y: 270)
        const groundX = w / 2;
        const groundY = 270;

        // 2. Render Ground Shadow
        this.renderShadow(ctx, groundX + this.animState.x * this.zoom, groundY, 40 * this.zoom, 10 * this.zoom);
        if (this.currentMode === 'versus') {
            this.renderShadow(ctx, groundX + this.animState.p2X * this.zoom, groundY, 40 * this.zoom, 10 * this.zoom);
        }

        // 3. Render P2 if in versus mode
        if (this.currentMode === 'versus') {
            const p2Frames = this.activeP2Frames || this.getFramesForAction(this.versusOpponent, this.animState.p2Action || 'idle');
            const p2Source = this.getSpriteSource(this.versusOpponent);
            this.drawFighterSprite(
                ctx,
                this.versusOpponent,
                p2Source,
                p2Frames,
                this.animState.p2FrameIndex,
                groundX + this.animState.p2X * this.zoom,
                groundY + this.animState.p2Y * this.zoom,
                this.animState.p2Facing || 'left',
                this.animState.p2ScaleX,
                this.animState.p2ScaleY,
                this.animState.p2Rotation,
                this.animState.p2Alpha
            );
        }

        // 4. Render P1 (Main Actor)
        const p1Frames = this.activeP1Frames || this.getFramesForAction(this.currentChar, this.currentAction);
        const p1Source = this.getSpriteSource(this.currentChar);

        // Aura
        if (this.animState.auraAlpha > 0.05) {
            this.renderAura(ctx, groundX + this.animState.x * this.zoom, groundY + this.animState.y * this.zoom - (45 * this.zoom));
        }

        // Main Sprite
        this.drawFighterSprite(
            ctx,
            this.currentChar,
            p1Source,
            p1Frames,
            this.animState.frameIndex,
            groundX + this.animState.x * this.zoom,
            groundY + this.animState.y * this.zoom,
            'right',
            this.animState.scaleX,
            this.animState.scaleY,
            this.animState.rotation,
            this.animState.alpha
        );

        // Hit flash overlay
        if (this.animState.flashAlpha > 0.05) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.animState.flashAlpha})`;
            ctx.fillRect(0, 0, w, h);
        }

        // 5. Render Projectiles
        this.renderProjectiles(ctx, groundX, groundY);

        // 6. Render Particles
        this.renderParticles(ctx, groundX, groundY);

        ctx.restore();
    }

    // Render Stage Background
    renderBackground(ctx, w, h) {
        if (this.backgroundType === 'checkerboard') {
            // Transparency checkerboard
            const sz = 16;
            for (let x = 0; x < w; x += sz) {
                for (let y = 0; y < h; y += sz) {
                    ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#181528' : '#100e1c';
                    ctx.fillRect(x, y, sz, sz);
                }
            }
            // Studio Grid lines
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 270);
            ctx.lineTo(w, 270);
            ctx.stroke();
        } else if (this.backgroundType === 'dojo') {
            // 16-Bit Argentine Dojo with Neon glow
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#0f0c1b');
            grad.addColorStop(0.75, '#2b1055');
            grad.addColorStop(1, '#05030a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Back columns
            ctx.fillStyle = '#1c1335';
            ctx.fillRect(60, 40, 40, 230);
            ctx.fillRect(540, 40, 40, 230);

            // Floor tatami
            const floorGrad = ctx.createLinearGradient(0, 270, 0, h);
            floorGrad.addColorStop(0, '#3a1c4a');
            floorGrad.addColorStop(1, '#150a20');
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, 270, w, h - 270);

            // Neon line
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, 270);
            ctx.lineTo(w, 270);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (this.backgroundType === 'obelisco') {
            // Obelisk Night Cityscape
            const sky = ctx.createLinearGradient(0, 0, 0, 270);
            sky.addColorStop(0, '#030818');
            sky.addColorStop(1, '#1a2750');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, 270);

            // Distant Obelisco silhouette
            ctx.fillStyle = '#3a4e80';
            ctx.beginPath();
            ctx.moveTo(310, 40);
            ctx.lineTo(330, 40);
            ctx.lineTo(340, 270);
            ctx.lineTo(300, 270);
            ctx.closePath();
            ctx.fill();

            // Street floor (Avenida 9 de Julio)
            ctx.fillStyle = '#111420';
            ctx.fillRect(0, 270, w, h - 270);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 270, w, 2);
        } else if (this.backgroundType === 'patio') {
            // Argentine Patio Parrilla
            const sky = ctx.createLinearGradient(0, 0, 0, 270);
            sky.addColorStop(0, '#1a0b2e');
            sky.addColorStop(1, '#521d45');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, 270);

            // Brick wall
            ctx.fillStyle = '#3a1822';
            ctx.fillRect(0, 160, w, 110);

            // Patio Floor tiles
            ctx.fillStyle = '#220e15';
            ctx.fillRect(0, 270, w, h - 270);
            ctx.strokeStyle = '#ff9900';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 270, w, 2);
        }
    }

    // Render Shadow
    renderShadow(ctx, x, y, width, height) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Render Energy Aura with GSAP pulse
    renderAura(ctx, x, y) {
        ctx.save();
        const pal = (window.pixelRenderer && pixelRenderer.palettes[this.currentChar]) 
            ? pixelRenderer.palettes[this.currentChar].aura 
            : '#ffd700';

        const radius = (35 + Math.sin(Date.now() / 150) * 5) * this.zoom * this.animState.auraScale;
        const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.animState.auraAlpha})`);
        grad.addColorStop(0.5, pal);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Render Projectiles
    renderProjectiles(ctx, groundX, groundY) {
        if (!this.animState.projectiles || !this.animState.projectiles.length) return;

        this.animState.projectiles.forEach(p => {
            const px = groundX + p.x * this.zoom;
            const py = groundY + p.y * this.zoom;
            const r = p.radius * (this.zoom / 1.5);

            // Trail
            if (p.trail) {
                p.trail.forEach((t, i) => {
                    ctx.fillStyle = `rgba(0, 229, 255, ${(i / p.trail.length) * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(groundX + t.x * this.zoom, groundY + t.y * this.zoom, r * (i / p.trail.length), 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            // Energy core
            const grad = ctx.createRadialGradient(px, py, 2, px, py, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.6, p.color || '#00e5ff');
            grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Render Particles
    renderParticles(ctx, groundX, groundY) {
        if (!this.animState.particles || !this.animState.particles.length) return;

        this.animState.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            const px = groundX + p.x * this.zoom;
            const py = groundY + p.y * this.zoom;
            const sz = p.size * (this.zoom / 2);

            if (p.rotation) {
                ctx.translate(px, py);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
            } else {
                ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
            }
            ctx.restore();
        });
    }

    // Draw individual fighter sprite with pixel-perfect resolution
    drawFighterSprite(ctx, charKey, source, frames, frameIdxFloat, x, y, facing, scaleX, scaleY, rotation, alpha) {
        if (!source || !frames || !frames.length) {
            // Draw placeholder silhouette
            ctx.save();
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x - 25, y - 90, 50, 90);
            ctx.restore();
            return;
        }

        const safeIdx = Math.max(0, Math.min(frames.length - 1, Math.floor(frameIdxFloat)));
        const f = frames[safeIdx] || frames[0];

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);

        if (rotation) {
            ctx.rotate(rotation * Math.PI / 180);
        }

        const dir = (facing === 'left') ? -1 : 1;
        ctx.scale(dir * scaleX * this.zoom, scaleY * this.zoom);

        // Anchor at bottom center (feet at street)
        const targetW = f.sw || 70;
        const targetH = f.sh || 86;
        const drawX = -targetW / 2;
        const drawY = -targetH;

        ctx.imageSmoothingEnabled = false;

        try {
            ctx.drawImage(
                source,
                f.sx, f.sy, f.sw, f.sh,
                drawX, drawY, targetW, targetH
            );
        } catch (e) {
            // Fallback draw
            ctx.fillStyle = '#ff2a55';
            ctx.fillRect(drawX, drawY, targetW, targetH);
        }

        ctx.restore();
    }

    // Build the dynamic filmstrip of all frames for the active action
    updateFilmstrip() {
        const filmstripContainer = document.getElementById('gsap-filmstrip');
        if (!filmstripContainer) return;

        filmstripContainer.innerHTML = '';
        const frames = this.getFramesForAction(this.currentChar, this.currentAction);
        const source = this.getSpriteSource(this.currentChar);

        frames.forEach((f, idx) => {
            const card = document.createElement('div');
            card.className = `filmstrip-frame ${idx === Math.round(this.animState.frameIndex) ? 'active' : ''}`;
            card.id = `filmstrip-frame-${idx}`;
            card.title = `Cuadro #${idx + 1} (${f.sw}x${f.sh}px) - Haz clic para saltar aquí con GSAP`;

            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 48;
            thumbCanvas.height = 48;
            const tCtx = thumbCanvas.getContext('2d');
            tCtx.imageSmoothingEnabled = false;

            if (source) {
                const aspect = f.sw / f.sh;
                let dw = 40;
                let dh = 40;
                if (aspect > 1) {
                    dh = 40 / aspect;
                } else {
                    dw = 40 * aspect;
                }
                const dx = (48 - dw) / 2;
                const dy = (48 - dh) / 2;

                try {
                    tCtx.drawImage(source, f.sx, f.sy, f.sw, f.sh, dx, dy, dw, dh);
                } catch (e) {
                    tCtx.fillStyle = '#ffd700';
                    tCtx.fillRect(10, 10, 28, 28);
                }
            }

            const label = document.createElement('span');
            label.className = 'frame-num-tag';
            label.textContent = `#${idx + 1}`;

            card.appendChild(thumbCanvas);
            card.appendChild(label);

            // Click to scrub with GSAP
            card.addEventListener('click', () => {
                if (this.timeline) {
                    const totalFrames = frames.length;
                    const targetProgress = idx / Math.max(1, totalFrames - 1);
                    this.scrubTo(targetProgress);
                }
            });

            filmstripContainer.appendChild(card);
        });
    }

    // Highlight active frame in filmstrip
    highlightActiveFilmstripFrame(frameIdx) {
        const frames = document.querySelectorAll('.filmstrip-frame');
        frames.forEach((el, idx) => {
            if (idx === frameIdx) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // Update UI controls to match current state
    updateUIControls() {
        const charSelect = document.getElementById('gsap-select-character');
        if (charSelect && charSelect.value !== this.currentChar) {
            charSelect.value = this.currentChar;
        }

        const actionSelect = document.getElementById('gsap-select-action');
        if (actionSelect && actionSelect.value !== this.currentAction) {
            actionSelect.value = this.currentAction;
        }

        // Mode buttons
        const modeButtons = document.querySelectorAll('.btn-gsap-mode');
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.updatePlayButtonUI();
        this.updateFilmstrip();
    }

    updatePlayButtonUI() {
        const playBtn = document.getElementById('btn-gsap-play-toggle');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? '⏸️ PAUSA' : '▶️ REPRODUCIR';
            playBtn.classList.toggle('active', this.isPlaying);
        }
    }
}

// Global Singleton Instance
const gsapSpriteAnimator = new GsapSpriteAnimator();
window.gsapSpriteAnimator = gsapSpriteAnimator;
