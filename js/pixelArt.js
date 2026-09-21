/* TORNEO ARGENTO 16-BIT - HIGH-DEFINITION 16-BIT SPRITE & ANIMATION ENGINE */

class PixelArtRenderer {
    constructor() {
        this.isLoaded = false;

        // Character Color Palettes for FX and Aura Glows
        this.palettes = {
            leon: { skin: '#e0ac69', hair: '#3a2518', suit: '#1c1c24', tie: '#ffcc00', eye: '#00e5ff', aura: '#ffb300' },
            latina: { skin: '#f1c27d', hair: '#2b1b17', suit: '#ffffff', sash: '#75aadb', eye: '#3a2518', aura: '#ffe600' },
            ojosazules: { skin: '#ffd8a8', hair: '#4a3525', shirt: '#75aadb', sweater: '#1b3b6f', eye: '#00ccff', aura: '#ffea00' },
            pepeargento: { skin: '#e8b88a', hair: '#222222', sweater: '#cc3333', shirt: '#ffffff', pants: '#333355', aura: '#ff3300' },
            elcomandante: { skin: '#d49b6a', hair: '#1a100c', coat: '#e6c894', pants: '#111111', glasses: '#000000', aura: '#ffd700' },
            elmesias: { skin: '#f1c27d', hair: '#4a2e1b', beard: '#5c3a21', shirt: '#75aadb', stripe: '#ffffff', shorts: '#0f1a30', boots: '#ffd700', aura: '#75aadb' },
            moria: { skin: '#f5cbb0', hair: '#111111', gown: '#800080', boa: '#ff007f', eye: '#111111', aura: '#ff007f' },
            lasu: { skin: '#ffe0bd', hair: '#fff275', gown: '#d4af37', pattern: '#8b5a2b', phone: '#ff3366', aura: '#ffe600' },
            hugo: { skin: '#e5b88f', hair: '#1a1a1a', suit: '#22222b', tattoos: '#3a506b', aura: '#00e5ff' },
            desodorante: { skin: '#e5b88f', hair: '#1a1a1a', suit: '#22222b', tattoos: '#3a506b', aura: '#00e5ff' },
            pergolas: { skin: '#e5b88f', hair: '#2a1a10', suit: '#111111', glasses: '#000000', mic: '#888888', aura: '#00ffff' },
            fumancha: { skin: '#e5b88f', hair: '#2a1a10', suit: '#111111', glasses: '#000000', mic: '#888888', aura: '#00ffff' },
            sangrejaponesa: { skin: '#e0ac69', hair: '#221100', jacket: '#1b3b6f', trim: '#ff2a55', pants: '#ffffff', boots: '#111111', hat: '#1b3b6f', saber: '#cccccc', aura: '#ff00aa' },
            ellibertador: { skin: '#e0ac69', hair: '#221100', jacket: '#1b3b6f', trim: '#ff2a55', pants: '#ffffff', boots: '#111111', hat: '#1b3b6f', saber: '#cccccc', aura: '#ff00aa' },
            lafaraona: { skin: '#e5b88f', hair: '#3a2518', beard: '#3a2518', cap: '#ff007f', crown: '#ffd700', robe: '#e6c894', aura: '#ff007f' },
            badbitch: { skin: '#ffe0bd', hair: '#fff7aa', coat: '#ffffff', glasses: '#000000', bag: '#ff0055', aura: '#ff0055' },
            oidoabsoluto: { skin: '#e0ac69', hair: '#111111', stacheL: '#111111', stacheR: '#ffffff', shirt: '#ff0033', synth: '#222222', aura: '#ff3300' },
            eleternauta: { skin: '#8e9196', hair: '#555555', suit: '#ffffff', stripe: '#f1c40f', pants: '#2b4c7e', eye: '#00f0ff', aura: '#00f0ff' },
            blockboss: { skin: '#8e9196', hair: '#555555', suit: '#ffffff', stripe: '#f1c40f', pants: '#2b4c7e', eye: '#00f0ff', aura: '#00f0ff' },
            inmortal: { skin: '#fff0db', hair: '#ffffff', gown: '#e6e6fa', armor: '#c0c0c0', crown: '#ffd700', hammer: '#ffd700', aura: '#ffd700' }
        };

        // 1. MASTER 4x4 CHARACTER GRID FROM ROOT character_sprite_sheet.png (1264 x 848)
        this.rosterGrid = {
            leon:          { col: 0, row: 0 },
            latina:        { col: 1, row: 0 },
            ojosazules:    { col: 2, row: 0 },
            pepeargento:   { col: 3, row: 0 },
            eleternauta:   { col: 0, row: 1 },
            elcomandante:  { col: 1, row: 1 },
            elmesias:      { col: 2, row: 1 },
            moria:         { col: 3, row: 1 },
            lasu:          { col: 0, row: 2 },
            hugo:          { col: 1, row: 2 },
            pergolas:      { col: 2, row: 2 },
            sangrejaponesa:{ col: 3, row: 2 },
            lafaraona:     { col: 0, row: 3 },
            badbitch:      { col: 1, row: 3 },
            oidoabsoluto:  { col: 2, row: 3 },
            inmortal:      { col: 3, row: 3 }
        };

        this.rosterRawImg = new Image();
        this.rosterCanvas = null;
        this.rosterLoaded = false;

        this.rosterRawImg.onload = () => {
            this.processRosterTransparency();
            this.rosterLoaded = true;
            if (window.uiController && uiController.refreshPortraits) {
                uiController.refreshPortraits();
            }
            if (window.phaserAnimationEngine && phaserAnimationEngine.onRosterLoaded) {
                phaserAnimationEngine.onRosterLoaded();
            }
        };
        this.rosterRawImg.src = 'character_sprite_sheet.png';

        // 2. INDIVIDUAL FIGHTING SPRITE SHEETS (assets/sprites/<id>_spritesheet.png)
        this.spriteFiles = {
            leon:          'assets/sprites/leon_spritesheet.png',
            pepeargento:   'assets/sprites/pepeargento_spritesheet.png',
            elmesias:      'assets/sprites/elmesias_spritesheet.png',
            elcomandante:  'assets/sprites/elcomandante_spritesheet.png',
            eleternauta:   'assets/sprites/eleternauta_spritesheet.png',
            latina:        'assets/sprites/latina_spritesheet.png',
            inmortal:      'assets/sprites/inmortal_spritesheet.png',
            ojosazules:    'assets/sprites/ojosazules_spritesheet.png',
            moria:         'assets/sprites/moria_spritesheet.png',
            lasu:          'assets/sprites/lasu_spritesheet.png',
            oidoabsoluto:  'assets/sprites/oidoabsoluto_spritesheet.png',
            pergolas:      'assets/sprites/pergolas_spritesheet.png',
            hugo:          'assets/sprites/hugo_spritesheet.png',
            sangrejaponesa:'assets/sprites/sangrejaponesa_spritesheet.png',
            lafaraona:     'assets/sprites/lafaraona_spritesheet.png',
            badbitch:      'assets/sprites/badbitch_spritesheet.png'
        };

        this.characterSheets = {};
        this.characterCanvases = {};
        this.characterLoaded = {};

        // Backward compatibility pointer for Leon
        this.leonCanvas = null;
        this.leonLoaded = false;

        this.loadIndividualSheets();

        // 3. FRAME DEFINITIONS
        // Standardized coordinates (768 x 1600 sheets based on character_sprite_sheet.png)
        this.standardFrames = {
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

        // Leon uses the same high-resolution unified standard grid
        this.leonFrames = this.standardFrames;
    }

    // Load and chroma-key all individual sprite sheets
    loadIndividualSheets() {
        Object.keys(this.spriteFiles).forEach(key => {
            const img = new Image();
            this.characterSheets[key] = img;

            img.onload = () => {
                const offCanvas = this.processGreenTransparency(img);
                this.characterCanvases[key] = offCanvas;
                this.characterLoaded[key] = true;

                if (key === 'leon') {
                    this.leonCanvas = offCanvas;
                    this.leonLoaded = true;
                }

                if (window.uiController && uiController.refreshPortraits) {
                    uiController.refreshPortraits();
                }
                if (window.phaserAnimationEngine && phaserAnimationEngine.onSheetLoaded) {
                    phaserAnimationEngine.onSheetLoaded(key, offCanvas);
                }
            };
            img.src = this.spriteFiles[key];
        });
    }

    // Chroma-Key green background (#467e41) into full transparency on offscreen canvas
    processGreenTransparency(img) {
        const offCanvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 576;
        const h = img.naturalHeight || img.height || 1024;
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');

        // Draw the image first - so even if pixel access fails under file://, offCanvas holds the image!
        offCtx.drawImage(img, 0, 0);

        try {
            const imgData = offCtx.getImageData(0, 0, w, h);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Green Screen threshold: green dominant over red and blue
                if (g > 70 && g > r * 1.15 && g > b * 1.15) {
                    data[i + 3] = 0; // Transparent
                }
            }

            offCtx.putImageData(imgData, 0, 0);
        } catch (e) {
            console.log('Chroma-key pixel manipulation skipped under local file:// protocol.');
        }

        return offCanvas;
    }

    // Process dark background of character_sprite_sheet.png into transparency
    processRosterTransparency() {
        const offCanvas = document.createElement('canvas');
        const w = this.rosterRawImg.naturalWidth || this.rosterRawImg.width || 1264;
        const h = this.rosterRawImg.naturalHeight || this.rosterRawImg.height || 848;
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');

        offCtx.drawImage(this.rosterRawImg, 0, 0);

        try {
            const imgData = offCtx.getImageData(0, 0, w, h);
            const data = imgData.data;

            // Dark background of character_sprite_sheet.png (#14111c: r<32, g<28, b<40)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (r < 32 && g < 28 && b < 40) {
                    data[i + 3] = 0; // Alpha 0
                }
            }

            offCtx.putImageData(imgData, 0, 0);
        } catch (e) {
            console.log('Roster transparency pixel manipulation skipped under local file:// protocol.');
        }

        this.rosterCanvas = offCanvas;
        this.rosterLoaded = true;
    }

    // Render 16-bit Portrait for HUD, Character Select, Tower and Menus
    drawPortrait(ctx, charKey, width = 40, height = 40) {
        ctx.save();
        ctx.clearRect(0, 0, width, height);

        // Background card
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1c1630');
        grad.addColorStop(1, '#090714');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Grid border
        ctx.strokeStyle = '#443c68';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);

        ctx.imageSmoothingEnabled = false;

        // 1. Source: Master character_sprite_sheet.png (uniform 16-bit portraits for all 16 fighters)
        const rosterSource = this.rosterCanvas || (this.rosterRawImg && this.rosterRawImg.complete && this.rosterRawImg.naturalWidth > 0 ? this.rosterRawImg : null);
        if (rosterSource && this.rosterGrid[charKey]) {
            const grid = this.rosterGrid[charKey];
            const cellW = 316;
            const cellH = 212;
            const sx = grid.col * cellW + 85;
            const sy = grid.row * cellH + 10;
            const sw = 146;
            const sh = 170;

            ctx.drawImage(rosterSource, sx, sy, sw, sh, 2, 2, width - 4, height - 4);
            ctx.restore();
            return;
        }

        // 2. Source: Individual sprite sheet portrait
        const sheetSource = this.characterCanvases[charKey] || (this.characterSheets[charKey] && this.characterSheets[charKey].complete && this.characterSheets[charKey].naturalWidth > 0 ? this.characterSheets[charKey] : null);
        if (sheetSource) {
            let p = (charKey === 'leon') ? this.leonFrames.portrait : this.standardFrames.portrait;
            ctx.drawImage(sheetSource, p.sx, p.sy, p.sw, p.sh, 2, 2, width - 4, height - 4);
            ctx.restore();
            return;
        }

        // 3. Fallback Monogram & Auto-Refresh listener
        const pal = this.palettes[charKey] || this.palettes.leon;
        ctx.fillStyle = pal.skin || '#ffcc00';
        ctx.font = 'bold ' + Math.floor(width * 0.4) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charKey.substring(0, 2).toUpperCase(), width / 2, height / 2);

        // Auto-refresh when image finishes loading
        if (this.rosterRawImg && !this.rosterRawImg.complete) {
            this.rosterRawImg.addEventListener('load', () => {
                this.drawPortrait(ctx, charKey, width, height);
            }, { once: true });
        }

        ctx.restore();
    }

    // Render 16-Bit Animated Fighter on the Battle Stage Canvas
    drawFighter(ctx, fighter) {
        const x = Math.floor(fighter.x);
        const y = Math.floor(fighter.y);
        const isFlipped = fighter.facing === 'left';

        ctx.save();
        ctx.translate(x, y);

        if (isFlipped) {
            ctx.scale(-1, 1);
        }

        // Stage floor shadow ellipse (scaled to match larger arcade characters)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. RENDER FROM INDIVIDUAL 16-BIT SPRITE SHEET (canvas OR loaded image)
        const sheetSource = this.characterCanvases[fighter.id] || 
                            (this.characterSheets[fighter.id] && this.characterSheets[fighter.id].complete && this.characterSheets[fighter.id].naturalWidth > 0 ? this.characterSheets[fighter.id] : null);

        if (sheetSource) {
            this.drawSheetFighter(ctx, fighter, sheetSource);
            ctx.restore();
            return;
        }

        // 2. RENDER FROM MASTER character_sprite_sheet.png (canvas OR loaded image)
        const rosterSource = this.rosterCanvas || 
                             (this.rosterRawImg && this.rosterRawImg.complete && this.rosterRawImg.naturalWidth > 0 ? this.rosterRawImg : null);

        if (rosterSource) {
            this.drawRosterFighter(ctx, fighter, rosterSource);
        } else {
            this.drawLoadingFighter(ctx, fighter);
        }

        ctx.restore();
    }

    // Loading silhouette for fighter
    drawLoadingFighter(ctx, fighter) {
        const pal = this.palettes[fighter.id] || this.palettes.leon;
        ctx.fillStyle = pal.suit || pal.jacket || pal.gown || pal.shirt || '#ffd700';
        ctx.fillRect(-40, -145, 80, 120);
        ctx.fillStyle = pal.skin || '#e0ac69';
        ctx.fillRect(-22, -170, 44, 35);
    }

    // High-Resolution Sprite Sheet Renderer for El León (374x1024)
    drawLeonSprite(ctx, fighter, sheetSource) {
        const state = fighter.state;
        const frameIdx = Math.floor(fighter.animFrame);
        const frames = this.leonFrames;
        let f = frames.idle[0];
        let drawW = 125;
        let drawH = 165;
        let offX = -62;
        let offY = -165;
        const source = sheetSource || this.leonCanvas || this.characterSheets.leon;

        switch (state) {
            case 'idle':
                f = frames.idle[frameIdx % frames.idle.length];
                break;
            case 'walk':
                f = frames.walk[frameIdx % frames.walk.length];
                break;
            case 'crouch':
            case 'block':
                f = frames.crouch;
                drawH = 142;
                offY = -142;
                break;
            case 'jump':
                f = frames.jump[Math.min(frames.jump.length - 1, Math.floor(fighter.vy < 0 ? 0 : 2))];
                offY = -175;
                break;
            case 'light_attack':
                f = frames.punch_light[fighter.stateTimer < 6 ? 0 : 1];
                drawW = 150;
                break;
            case 'heavy_attack':
                f = frames.kick_heavy[fighter.stateTimer < 10 ? 0 : 1];
                drawW = 165;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
                ctx.fillRect(35, offY + 20, 55, 90);
                break;
            case 'special_attack':
            case 'special1': // Morder
                f = frames.special_bite[Math.min(frames.special_bite.length - 1, Math.floor(fighter.stateTimer / 6))];
                drawW = 188;
                drawH = 175;
                offY = -175;
                ctx.fillStyle = 'rgba(255, 180, 0, 0.4)';
                ctx.fillRect(45, offY - 20, 100, 110);
                break;
            case 'special2': // Arañar
                f = frames.special_claw[Math.min(frames.special_claw.length - 1, Math.floor(fighter.stateTimer / 5))];
                drawW = 188;
                drawH = 175;
                offY = -175;
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(75, offY + 55, 55, -0.6, 0.8);
                ctx.stroke();
                break;
            case 'special3': // Rugir
            case 'super_attack':
                f = frames.special_roar[Math.min(frames.special_roar.length - 1, Math.floor(fighter.stateTimer / 6))];
                drawW = 198;
                drawH = 185;
                offY = -185;
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(88, offY + 75, 30 + fighter.stateTimer * 4, -0.8, 0.8);
                ctx.stroke();
                break;
            case 'taunt':
                f = frames.taunt;
                drawW = 142;
                break;
            case 'hurt':
                f = frames.hurt;
                drawW = 132;
                offY = -155;
                break;
            case 'dizzy':
                f = frames.dizzy[frameIdx % frames.dizzy.length];
                const starAngle = Date.now() / 200;
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(Math.cos(starAngle) * 30, offY - 22 + Math.sin(starAngle) * 8, 8, 8);
                ctx.fillRect(Math.cos(starAngle + Math.PI) * 30, offY - 22 + Math.sin(starAngle + Math.PI) * 8, 8, 8);
                break;
            case 'defeat_kneeling':
                f = frames.defeat_kneeling;
                drawW = 165;
                drawH = 132;
                offY = -125;
                offX = -75;
                break;
            case 'defeat_dead':
            case 'ko':
                f = frames.defeat_dead;
                drawW = 190;
                drawH = 95;
                offY = -80;
                offX = -95;
                break;
            case 'victory':
                f = frames.victory[frameIdx % frames.victory.length];
                drawW = 145;
                drawH = 188;
                offY = -188;
                break;
            default:
                f = frames.idle[0];
                break;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(source, f.sx, f.sy, f.sw, f.sh, offX, offY, drawW, drawH);

        this.drawStatusOverlays(ctx, fighter, offX, offY, drawW, drawH);
    }

    // High-Resolution Sprite Sheet Renderer for All 16 Fighters (768x1600)
    drawSheetFighter(ctx, fighter, sheetSource) {
        const state = fighter.state;
        const frameIdx = Math.floor(fighter.animFrame);
        const frames = this.standardFrames;
        let f = frames.idle[0];
        let drawW = 125;
        let drawH = 175;
        let offX = -62;
        let offY = -175;

        switch (state) {
            case 'idle':
                f = frames.idle[frameIdx % frames.idle.length];
                break;
            case 'walk':
                f = frames.walk[frameIdx % frames.walk.length];
                break;
            case 'crouch':
                f = frames.crouch;
                break;
            case 'block':
                f = frames.block || frames.crouch;
                break;
            case 'jump':
                f = frames.jump[Math.min(frames.jump.length - 1, Math.floor(fighter.vy < 0 ? 0 : 1))];
                offY = -175;
                break;
            case 'light_attack':
                f = frames.punch_light[fighter.stateTimer < 6 ? 0 : 1];
                drawW = 135;
                break;
            case 'heavy_attack':
                f = frames.kick_heavy[fighter.stateTimer < 8 ? 0 : 1];
                drawW = 145;
                ctx.fillStyle = 'rgba(255, 230, 0, 0.4)';
                ctx.fillRect(40, offY + 25, 48, 80);
                break;
            case 'special_attack':
            case 'special1':
                f = frames.special[0];
                drawW = 145;
                break;
            case 'special2':
                f = frames.special[Math.min(frames.special.length - 1, 1)];
                drawW = 150;
                break;
            case 'special3':
            case 'super_attack':
                f = frames.special[Math.min(frames.special.length - 1, 2)];
                drawW = 160;
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(35, offY + 90, 45 + (fighter.stateTimer % 15) * 4, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'taunt':
                f = frames.victory[0];
                drawW = 125;
                break;
            case 'hurt':
                f = frames.hurt;
                drawW = 125;
                break;
            case 'dizzy':
                f = frames.dizzy[frameIdx % frames.dizzy.length];
                const starAngle = Date.now() / 200;
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(Math.cos(starAngle) * 30, offY - 22 + Math.sin(starAngle) * 8, 8, 8);
                ctx.fillRect(Math.cos(starAngle + Math.PI) * 30, offY - 22 + Math.sin(starAngle + Math.PI) * 8, 8, 8);
                break;
            case 'defeat_kneeling':
                f = frames.defeat_kneeling;
                drawW = 125;
                drawH = 175;
                offX = -62;
                offY = -175;
                break;
            case 'defeat_dead':
            case 'ko':
                f = frames.defeat_dead;
                drawW = 180;
                drawH = 175;
                offX = -90;
                offY = -175;
                break;
            case 'victory':
                f = frames.victory[frameIdx % frames.victory.length];
                drawW = 125;
                break;
            default:
                f = frames.idle[0];
                break;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sheetSource, f.sx, f.sy, f.sw, f.sh, offX, offY, drawW, drawH);

        this.drawStatusOverlays(ctx, fighter, offX, offY, drawW, drawH);
    }

    // High-Resolution Renderer from character_sprite_sheet.png (Master 4x4 Grid)
    drawRosterFighter(ctx, fighter, rosterSource) {
        const source = rosterSource || this.rosterCanvas || this.rosterRawImg;
        if (!source || !this.rosterGrid[fighter.id]) {
            return;
        }

        const grid = this.rosterGrid[fighter.id];
        const cellW = 316;
        const cellH = 212;
        const sx = grid.col * cellW + 80;
        const sy = grid.row * cellH + 12;
        const sw = 156;
        const sh = 188;

        const state = fighter.state;
        const frame = Math.floor(fighter.animFrame) % 4;

        let drawW = 125;
        let drawH = 165;
        let offX = -62;
        let offY = -165;

        // Dynamic motion modifiers matching fighter state
        if (state === 'idle') {
            offY += (frame % 2 === 0) ? -2 : 2;
        } else if (state === 'walk') {
            offX += (frame % 2 === 0) ? 4 : -4;
            offY += (frame % 2 === 0) ? -4 : 0;
        } else if (state === 'crouch' || state === 'block') {
            drawH = 128;
            offY = -128;
        } else if (state === 'jump') {
            offY = -185;
        } else if (state === 'light_attack') {
            offX = -48;
            drawW = 140;
            ctx.fillStyle = 'rgba(255, 230, 0, 0.4)';
            ctx.fillRect(40, offY + 45, 35, 35);
        } else if (state === 'heavy_attack') {
            offX = -40;
            drawW = 155;
            ctx.fillStyle = 'rgba(255, 60, 0, 0.5)';
            ctx.fillRect(48, offY + 35, 45, 55);
        } else if (state.startsWith('special') || state === 'super_attack') {
            drawW = 150;
            drawH = 175;
            offY = -175;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, offY + 90, 60, 0, Math.PI * 2);
            ctx.stroke();
        } else if (state === 'hurt') {
            offX = -75;
            offY = -155;
        } else if (state === 'dizzy') {
            const starAngle = Date.now() / 200;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(Math.cos(starAngle) * 30, offY - 22 + Math.sin(starAngle) * 8, 8, 8);
            ctx.fillRect(Math.cos(starAngle + Math.PI) * 30, offY - 22 + Math.sin(starAngle + Math.PI) * 8, 8, 8);
        } else if (state === 'defeat_kneeling') {
            drawH = 115;
            drawW = 136;
            offY = -110;
            offX = -68;
        } else if (state === 'defeat_dead' || state === 'ko') {
            ctx.save();
            ctx.translate(0, -30);
            ctx.rotate(Math.PI / 2);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(source, sx, sy, sw, sh, -75, -55, 130, 110);
            ctx.restore();
            return;
        } else if (state === 'victory') {
            offY = -180;
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-8, offY - 25, 16, 16);
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(source, sx, sy, sw, sh, offX, offY, drawW, drawH);

        this.drawStatusOverlays(ctx, fighter, offX, offY, drawW, drawH);
    }

    // Status overlays for Sub-Zero Freeze & Poison
    drawStatusOverlays(ctx, fighter, offX, offY, drawW, drawH) {
        if (fighter.isFrozen) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.fillRect(offX - 8, offY - 8, drawW + 16, drawH + 16);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(offX - 8, offY - 8, drawW + 16, drawH + 16);
        }

        if (fighter.isPoisoned) {
            ctx.fillStyle = 'rgba(180, 0, 255, 0.3)';
            ctx.fillRect(offX, offY, drawW, drawH);
        }
    }

    // Dynamic Special Move Projectiles & Summons Renderer
    drawProjectile(ctx, proj) {
        ctx.save();
        ctx.translate(Math.floor(proj.x), Math.floor(proj.y));

        const type = proj.type;

        switch (type) {
            case 'lion_roar':
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, 16, -1, 1);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(10, 0, 24, -1, 1);
                ctx.stroke();
                break;

            case 'pyramids':
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(12, 10);
                ctx.lineTo(-12, 10);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#00e5ff';
                ctx.stroke();
                break;

            case 'cadena':
                ctx.fillStyle = '#75aadb';
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffe600';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'flying_cat':
                ctx.fillStyle = '#f5deb3';
                ctx.fillRect(-12, -6, 24, 12);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(-10, -10, 6, 6);
                ctx.fillRect(4, -10, 6, 6);
                ctx.fillStyle = '#00ccff';
                ctx.fillRect(-4, -4, 3, 3);
                ctx.fillRect(2, -4, 3, 3);
                break;

            case 'kittens':
                ctx.fillStyle = '#ffd8a8';
                ctx.fillRect(-10, 4, 20, 8);
                ctx.fillStyle = '#ff9900';
                ctx.fillRect(-8, 0, 4, 4);
                ctx.fillRect(4, 0, 4, 4);
                break;

            case 'balloon':
                ctx.fillStyle = '#ffee00';
                ctx.beginPath();
                ctx.arc(0, -4, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();
                break;

            case 'pistol_shot':
                ctx.fillStyle = '#ffcc00';
                ctx.fillRect(-8, -3, 16, 6);
                ctx.fillStyle = '#ff3300';
                ctx.fillRect(8, -5, 8, 10);
                break;

            case 'ice_blast':
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
                ctx.fillRect(-14, -8, 28, 16);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-8, -4, 16, 8);
                break;

            case 'ice_sculpture':
            case 'voxel_wall':
                ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.fillRect(-16, -24, 32, 48);
                ctx.strokeRect(-16, -24, 32, 48);
                break;

            case 'dollars':
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(-14, -7, 28, 14);
                ctx.fillStyle = '#ffffff';
                ctx.font = '8px monospace';
                ctx.fillText('$100', -12, 3);
                break;

            case 'suitcase':
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(-16, -12, 32, 24);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-6, -14, 12, 4);
                break;

            case 'curved_ball':
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#75aadb';
                ctx.fillRect(-4, -4, 8, 8);
                ctx.fillStyle = 'rgba(117, 170, 219, 0.5)';
                ctx.beginPath();
                ctx.arc(-10, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'gold_ball':
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'words_blade':
                ctx.fillStyle = '#ff007f';
                ctx.fillRect(-14, -5, 28, 10);
                ctx.fillStyle = '#fff';
                ctx.font = '7px monospace';
                ctx.fillText('¡LLORÁ!', -12, 3);
                break;

            case 'gold_phone':
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-12, -6, 24, 12);
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(-8, -10, 16, 4);
                break;

            case 'laugh_waves':
                ctx.fillStyle = '#00e5ff';
                ctx.font = '10px monospace';
                ctx.fillText('¡HONK!', -16, 4);
                break;

            case 'deodorant':
                ctx.fillStyle = '#3a506b';
                ctx.fillRect(-12, -6, 24, 12);
                ctx.fillStyle = '#00e5ff';
                ctx.fillRect(-14, -2, 4, 4);
                break;

            case 'drone':
                ctx.fillStyle = '#333333';
                ctx.fillRect(-16, -4, 32, 8);
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(-18, -8, 8, 2);
                ctx.fillRect(10, -8, 8, 2);
                break;

            case 'robot':
                ctx.fillStyle = '#555555';
                ctx.fillRect(-12, -14, 24, 24);
                ctx.fillStyle = '#ff0033';
                ctx.fillRect(-4, -10, 8, 4);
                break;

            case 'poison_lips':
                ctx.fillStyle = '#ff007f';
                ctx.beginPath();
                ctx.arc(-4, 0, 6, 0, Math.PI * 2);
                ctx.arc(4, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#00ff66';
                ctx.fillRect(-2, -2, 4, 4);
                break;

            case 'poison_cloud':
                ctx.fillStyle = 'rgba(128, 0, 128, 0.45)';
                ctx.beginPath();
                ctx.ellipse(0, 4, 25, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'corn':
                ctx.fillStyle = '#ffea00';
                ctx.fillRect(-10, -5, 20, 10);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(-14, -2, 6, 4);
                break;

            case 'chickens':
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-10, -4, 20, 10);
                ctx.fillStyle = '#ff3300';
                ctx.fillRect(-6, -8, 4, 4);
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(8, -2, 4, 4);
                break;

            case 'glitter_bomb':
                ctx.fillStyle = '#ff0055';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(-2, -2, 4, 4);
                break;

            case 'grand_piano':
                ctx.fillStyle = '#111111';
                ctx.fillRect(-20, -14, 40, 24);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-18, 6, 36, 4);
                break;

            case 'lightning_riff':
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(-5, -8);
                ctx.lineTo(5, 4);
                ctx.lineTo(15, -4);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 'silver_cutlery':
                ctx.fillStyle = '#c0c0c0';
                ctx.fillRect(-12, -3, 24, 6);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(6, -6, 6, 12);
                break;

            case 'divine_lightning':
                ctx.strokeStyle = '#ffff00';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-15, -10);
                ctx.lineTo(0, 5);
                ctx.lineTo(15, -8);
                ctx.stroke();
                break;

            default:
                ctx.fillStyle = '#00e5ff';
                ctx.fillRect(-10, -5, 20, 10);
                break;
        }

        ctx.restore();
    }
}

const pixelRenderer = new PixelArtRenderer();
window.pixelRenderer = pixelRenderer;
