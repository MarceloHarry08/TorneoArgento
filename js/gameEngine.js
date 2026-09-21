/* TORNEO ARGENTO 16-BIT - MAIN GAME ENGINE & MATCH CONTROLLER */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.gameState = 'TITLE'; // TITLE, CHAR_SELECT, TOWER, FIGHT, FATALITY, VICTORY
        this.mode = 'arcade'; // 'arcade' or 'vs'

        // Match Participants
        this.p1 = null;
        this.p2 = null;

        // Score & Rounds (Best of 3 -> 2 Victories to win)
        this.p1Rounds = 0;
        this.p2Rounds = 0;
        this.currentRound = 1;

        // Match Timer
        this.timer = 99;
        this.timerInterval = null;

        // Fatality State
        this.fatalityActive = false;
        this.fatalityTimer = 5;
        this.fatalityInterval = null;
        this.fatalityExecuted = false;

        // Visual FX
        this.screenShake = 0;
        this.freezeFrame = 0;
        this.particles = [];

        // Arcade Tower Progress
        this.towerIndex = 0;
        this.towerOpponents = ['latina', 'ojosazules', 'pepeargento', 'elcomandante', 'elmesias', 'inmortal'];

        // Animation Loop
        this.lastTime = 0;
        this.isPaused = false;
    }

    init() {
        // Setup initial default fighters
        this.p1 = new Fighter('leon', 180, 'right', false);
        this.p2 = new Fighter('latina', 460, 'left', true, 'normal');

        // Initialize Phaser 3 Animation Engine (powered by this.anims.create)
        if (typeof phaserAnimationEngine !== 'undefined') {
            phaserAnimationEngine.init();
            phaserAnimationEngine.setupMatch(this.p1, this.p2);
        }

        // Start render loop
        requestAnimationFrame((t) => this.loop(t));
    }

    startMatch(p1Key, p2Key, isCPU = true, difficulty = 'normal', stageKey = 'obelisco') {
        this.p1 = new Fighter(p1Key, 180, 'right', false);
        this.p2 = new Fighter(p2Key, 460, 'left', isCPU, difficulty);

        this.p1Rounds = 0;
        this.p2Rounds = 0;
        this.currentRound = 1;
        this.fatalityExecuted = false;

        stageRenderer.setStage(stageKey);
        this.setupRound();
        this.gameState = 'FIGHT';

        // Select and play Argentine Rock Nacional classic
        let songToPlay = 'hacelopormi';
        const rockSongSelect = document.getElementById('select-rock-song');
        const userSong = rockSongSelect ? rockSongSelect.value : 'auto';

        if (userSong && userSong !== 'auto') {
            songToPlay = userSong;
        } else {
            if (stageKey === 'obelisco') songToPlay = 'homero';
            else if (stageKey === 'casarosada') songToPlay = 'hacelopormi';
            else if (stageKey === 'caminito') songToPlay = 'fanky';
            else if (stageKey === 'glaciar') songToPlay = 'labalada';
            else if (stageKey === 'mesaza') songToPlay = 'hadaelmago';
            else songToPlay = 'demusicaligera';
        }

        audioEngine.startBgm(songToPlay);
    }

    setupRound() {
        this.p1.reset(180, 'right');
        this.p2.reset(460, 'left');

        this.timer = 99;
        this.fatalityActive = false;

        // Reset and synchronize Phaser 3 animated actors
        if (typeof phaserAnimationEngine !== 'undefined' && phaserAnimationEngine.isActive) {
            phaserAnimationEngine.setupMatch(this.p1, this.p2);
        }

        uiController.updateHUD(this.p1, this.p2, this.p1Rounds, this.p2Rounds, this.currentRound, this.timer);
        uiController.showAnnouncer(`RONDA ${this.currentRound}`, '¡A PELEAR!');
        audioEngine.playAnnouncer(`ROUND ${this.currentRound}`);

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameState === 'FIGHT' && !this.isPaused && !this.fatalityActive) {
                this.timer--;
                uiController.updateTimer(this.timer);

                if (this.timer <= 0) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.update();
            this.render();
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        if (this.gameState !== 'FIGHT' && this.gameState !== 'FATALITY') return;

        // Screen Shake decay
        if (this.screenShake > 0) this.screenShake--;

        // Hit Freeze Frame
        if (this.freezeFrame > 0) {
            this.freezeFrame--;
            return;
        }

        // Update Fighters
        this.p1.update(this.p2, 640);
        this.p2.update(this.p1, 640);

        // Check Hitbox Collisions
        this.checkCombatCollision(this.p1, this.p2);
        this.checkCombatCollision(this.p2, this.p1);

        // Check KO / Victory Condition
        if (!this.fatalityActive) {
            if (this.p1.hp <= 0 || this.p2.hp <= 0) {
                this.handleKO();
            }
        }

        // Particle updates
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    checkCombatCollision(attacker, defender) {
        if (!attacker.hitbox || defender.state === 'hurt' || defender.state === 'ko') return;

        const hb = attacker.hitbox;
        const defHurtX = defender.x - 38;
        const defHurtY = defender.y - 145;
        const defHurtW = 76;
        const defHurtH = 145;

        // AABB Collision check
        if (hb.x < defHurtX + defHurtW &&
            hb.x + hb.w > defHurtX &&
            hb.y < defHurtY + defHurtH &&
            hb.y + hb.h > defHurtY) {

            // Hit Confirmed!
            defender.takeDamage(hb.dmg, attacker.facing);
            attacker.hitbox = null; // Consume hitbox

            // Combo counter increase
            attacker.comboHits++;
            attacker.comboTimer = 90;

            if (attacker === this.p1) {
                uiController.showCombo('p1', attacker.comboHits);
            } else {
                uiController.showCombo('p2', attacker.comboHits);
            }

            // Visual Sparks & Freeze frame
            this.addSparkParticles(hb.x + hb.w / 2, hb.y + hb.h / 2);
            this.screenShake = 6;
            this.freezeFrame = 4;

            uiController.updateHUDBars(this.p1, this.p2);
        }
    }

    addSparkParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: Math.random() < 0.5 ? '#ffff00' : '#ff0055',
                life: 15
            });
        }
    }

    handleKO() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const winner = (this.p1.hp > 0) ? this.p1 : this.p2;
        const loser = (winner === this.p1) ? this.p2 : this.p1;

        if (winner === this.p1) this.p1Rounds++;
        else this.p2Rounds++;

        uiController.updateRoundsDisplay(this.p1Rounds, this.p2Rounds);

        // Check if Match Winner (Requires 2 Victories!)
        if (this.p1Rounds >= 2 || this.p2Rounds >= 2) {
            // Trigger FATALITY OPPORTUNITY STATE ("¡LIQUIDÁLO!")
            this.triggerFatalityState(winner, loser);
        } else {
            // Advance to next round
            uiController.showAnnouncer(`¡GANADOR: ${winner.name}!`, 'PREPÁRATE PARA LA SIGUIENTE RONDA');
            audioEngine.playAnnouncer('VICTORIA');
            setTimeout(() => {
                this.currentRound++;
                this.setupRound();
            }, 3000);
        }
    }

    handleTimeout() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        let winner = null;
        if (this.p1.hp > this.p2.hp) winner = this.p1;
        else if (this.p2.hp > this.p1.hp) winner = this.p2;

        if (winner) {
            if (winner === this.p1) this.p1Rounds++;
            else this.p2Rounds++;
            uiController.showAnnouncer('¡TIEMPO AGOTADO!', `¡GANADOR POR ENERGÍA: ${winner.name}!`);
        } else {
            uiController.showAnnouncer('¡TIEMPO AGOTADO!', '¡EMPATE!');
        }

        setTimeout(() => {
            if (this.p1Rounds >= 2 || this.p2Rounds >= 2) {
                this.finishMatch(winner);
            } else {
                this.currentRound++;
                this.setupRound();
            }
        }, 3000);
    }

    triggerFatalityState(winner, loser) {
        this.fatalityActive = true;
        this.fatalityTimer = 5;
        this.gameState = 'FATALITY';

        // Loser in exhausted kneeling stance (Posición antes de perder)
        loser.state = 'defeat_kneeling';
        loser.vx = 0;
        winner.state = 'idle';

        uiController.showFatalityPrompt(winner.data.moves.fatality.cmd);
        audioEngine.playAnnouncer('LIQUIDÁLO');

        if (this.fatalityInterval) clearInterval(this.fatalityInterval);
        this.fatalityInterval = setInterval(() => {
            this.fatalityTimer--;
            uiController.updateFatalityTimer(this.fatalityTimer);

            if (this.fatalityTimer <= 0) {
                clearInterval(this.fatalityInterval);
                uiController.hideFatalityPrompt();
                loser.state = 'defeat_dead';
                this.finishMatch(winner);
            }
        }, 1000);
    }

    executeFatality() {
        if (!this.fatalityActive || this.fatalityExecuted) return;

        this.fatalityExecuted = true;
        if (this.fatalityInterval) clearInterval(this.fatalityInterval);
        uiController.hideFatalityPrompt();

        const winner = (this.p1Rounds >= 2) ? this.p1 : this.p2;
        const loser = (winner === this.p1) ? this.p2 : this.p1;

        loser.state = 'defeat_dead';
        winner.state = 'victory';

        uiController.showAnnouncer('¡FATALITY!', winner.data.moves.fatality.name);
        audioEngine.playAnnouncer('FATALITY');

        this.screenShake = 30;
        this.addSparkParticles(320, 180);

        setTimeout(() => {
            this.finishMatch(winner, true);
        }, 3500);
    }

    finishMatch(winner, withFatality = false) {
        this.gameState = 'VICTORY';
        if (winner) winner.state = 'victory';
        const loser = (winner === this.p1) ? this.p2 : this.p1;
        if (loser) loser.state = 'defeat_dead';

        audioEngine.startBgm('labalada');
        uiController.showVictoryScreen(winner, withFatality, this.mode === 'arcade');
    }

    render() {
        this.ctx.save();

        // Apply Screen Shake transform
        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake;
            const dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }

        // 1. Draw Stage Background
        stageRenderer.render(this.ctx, 640, 360);

        // 2. Render Animated Fighters & Combat FX via Phaser 3
        let phaserRendered = false;
        if (typeof phaserAnimationEngine !== 'undefined' && phaserAnimationEngine.isActive) {
            try {
                const allProjectiles = [];
                if (this.p1 && this.p1.projectiles) allProjectiles.push(...this.p1.projectiles);
                if (this.p2 && this.p2.projectiles) allProjectiles.push(...this.p2.projectiles);
                phaserAnimationEngine.updateAndRender(this.p1, this.p2, allProjectiles, this.particles);
                phaserRendered = true;
            } catch (err) {
                phaserRendered = false;
            }
        }

        // Fallback to 2D Canvas Renderer if Phaser 3 is still preparing scenes or unavailable
        if (!phaserRendered) {
            // 2a. Draw Projectiles
            if (this.p1) this.p1.projectiles.forEach(p => pixelRenderer.drawProjectile(this.ctx, p));
            if (this.p2) this.p2.projectiles.forEach(p => pixelRenderer.drawProjectile(this.ctx, p));

            // 2b. Draw Fighters
            if (this.p1) pixelRenderer.drawFighter(this.ctx, this.p1);
            if (this.p2) pixelRenderer.drawFighter(this.ctx, this.p2);

            // 2c. Draw Particles
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, 4, 4);
            });
        }

        this.ctx.restore();
    }
}

const gameEngine = new GameEngine();
window.gameEngine = gameEngine;
