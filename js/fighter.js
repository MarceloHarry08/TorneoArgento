/* TORNEO ARGENTO 16-BIT - FIGHTER PHYSICS, COMBOS & SPECIAL POWERS ENGINE */

class Fighter {
    constructor(charKey, x, facing = 'right', isCPU = false, difficulty = 'normal') {
        const charData = CHARACTERS[charKey] || CHARACTERS.leon;
        this.id = charData.id;
        this.name = charData.name;
        this.alias = charData.alias;
        this.quote = charData.quote;
        this.data = charData;

        // Position & Physics
        this.groundY = 315; // Placed firmly on stage street/floor
        this.x = x;
        this.y = this.groundY;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing; // 'right' or 'left'
        this.isCPU = isCPU;
        this.difficulty = difficulty;

        // Attributes & Stats
        this.maxHp = 100;
        this.hp = 100;
        this.meter = 0; // Super meter (0 to 100)
        this.speed = (charData.stats.spd / 100) * 4 + 2;
        this.atkPower = (charData.stats.atk / 100);

        // State Machine
        // idle, walk, jump, crouch, light_attack, heavy_attack, special1, special2, special3, special_attack, super_attack, block, hurt, dizzy, defeat_kneeling, defeat_dead, ko, victory
        this.state = 'idle';
        this.stateTimer = 0;
        this.animFrame = 0;
        this.isGrounded = true;

        // Status Ailments
        this.isFrozen = false;
        this.freezeTimer = 0;
        this.isPoisoned = false;
        this.poisonTimer = 0;

        // Combat Hitbox/Hurtbox (120% larger arcade scale)
        this.width = 75;
        this.height = 150;
        this.hitbox = null;

        // Combo Tracking & Input Buffer
        this.comboHits = 0;
        this.comboTimer = 0;
        this.inputBuffer = [];

        // Projectiles spawned by fighter
        this.projectiles = [];

        // AI Logic Timer
        this.aiTimer = 0;
    }

    reset(x, facing) {
        this.x = x;
        this.y = this.groundY;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.hp = 100;
        this.meter = 0;
        this.state = 'idle';
        this.stateTimer = 0;
        this.hitbox = null;
        this.comboHits = 0;
        this.comboTimer = 0;
        this.inputBuffer = [];
        this.projectiles = [];
        this.isFrozen = false;
        this.freezeTimer = 0;
        this.isPoisoned = false;
        this.poisonTimer = 0;
    }

    freeze(frames = 80) {
        this.isFrozen = true;
        this.freezeTimer = frames;
        this.vx = 0;
        this.hitbox = null;
    }

    poison(frames = 120) {
        this.isPoisoned = true;
        this.poisonTimer = frames;
    }

    update(opponent, stageWidth = 640) {
        this.animFrame += 0.2;
        this.stateTimer++;

        // Status Effects
        if (this.isFrozen) {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
            }
            return; // Frozen fighters cannot move, attack or fall
        }

        if (this.isPoisoned) {
            this.poisonTimer--;
            if (this.poisonTimer % 20 === 0) {
                this.hp = Math.max(1, this.hp - 1);
            }
            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
            }
        }

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboHits = 0;
            }
        }

        // Attack state timers
        if (this.state === 'light_attack' && this.stateTimer > 12) {
            this.state = 'idle';
            this.hitbox = null;
        } else if (this.state === 'heavy_attack' && this.stateTimer > 18) {
            this.state = 'idle';
            this.hitbox = null;
        } else if ((this.state === 'special1' || this.state === 'special2' || this.state === 'special3' || this.state === 'special_attack') && this.stateTimer > 25) {
            this.state = 'idle';
            this.hitbox = null;
        } else if (this.state === 'super_attack' && this.stateTimer > 35) {
            this.state = 'idle';
            this.hitbox = null;
        } else if (this.state === 'hurt' && this.stateTimer > 15) {
            this.state = 'idle';
        } else if (this.state === 'dizzy' && this.stateTimer > 60) {
            this.state = 'idle';
        }

        // Physics Integration
        this.x += this.vx;
        this.y += this.vy;

        // Gravity & Ground Physics
        if (!this.isGrounded) {
            this.vy += 0.7;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isGrounded = true;
                if (this.state === 'jump') this.state = 'idle';
            }
        }

        // Friction
        if (this.isGrounded && this.state !== 'walk') {
            this.vx *= 0.7;
        }

        // Stage Boundaries
        if (this.x < 45) this.x = 45;
        if (this.x > stageWidth - 45) this.x = stageWidth - 45;

        // Auto face opponent during neutral states
        if (opponent && (this.state === 'idle' || this.state === 'walk' || this.state === 'jump')) {
            this.facing = (this.x < opponent.x) ? 'right' : 'left';
        }

        // Projectiles Update
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx;
            p.y += (p.vy || 0);
            p.life--;

            // Hit collision (scaled to larger body size)
            if (opponent && Math.abs(p.x - opponent.x) < 55 && Math.abs(p.y - (opponent.y - 75)) < 75) {
                opponent.takeDamage(p.dmg, p.vx > 0 ? 'right' : 'left');
                audioEngine.playHeavyHit();

                // Sub-Zero freeze effect on hit
                if (p.type === 'ice_blast') {
                    opponent.freeze(90);
                }
                // Poison effect on hit
                if (p.type === 'poison_lips' || p.type === 'poison_cloud') {
                    opponent.poison(120);
                }

                this.projectiles.splice(i, 1);
                continue;
            }

            if (p.life <= 0 || p.x < -60 || p.x > stageWidth + 60) {
                this.projectiles.splice(i, 1);
            }
        }

        // CPU AI execution
        if (this.isCPU && opponent && this.state !== 'ko' && this.state !== 'defeat_dead' && this.state !== 'defeat_kneeling') {
            this.updateAI(opponent);
        }
    }

    move(dir) {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling' || this.state === 'defeat_dead' || this.state === 'victory') return;
        if (this.state === 'light_attack' || this.state === 'heavy_attack' || this.state === 'special1' || this.state === 'special2' || this.state === 'special3' || this.state === 'super_attack') return;

        if (dir === 'left') {
            this.vx = -this.speed;
            if (this.isGrounded) this.state = 'walk';
        } else if (dir === 'right') {
            this.vx = this.speed;
            if (this.isGrounded) this.state = 'walk';
        } else if (dir === 'stop') {
            if (this.state === 'walk') this.state = 'idle';
        }
    }

    jump() {
        if (this.isFrozen || !this.isGrounded || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        this.vy = -14;
        this.isGrounded = false;
        this.state = 'jump';
        audioEngine.playJump();
    }

    crouch(isCrouching) {
        if (this.isFrozen || !this.isGrounded || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.state === 'idle' || this.state === 'walk' || this.state === 'crouch') {
            this.state = isCrouching ? 'crouch' : 'idle';
        }
    }

    block(isBlocking) {
        if (this.isFrozen || !this.isGrounded || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.state === 'idle' || this.state === 'walk' || this.state === 'block') {
            this.state = isBlocking ? 'block' : 'idle';
        }
    }

    lightAttack() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling' || this.state === 'light_attack' || this.state === 'heavy_attack') return;
        this.state = 'light_attack';
        this.stateTimer = 0;
        audioEngine.playLightHit();

        const hitX = (this.facing === 'right') ? this.x + 30 : this.x - 90;
        this.hitbox = { x: hitX, y: this.y - 110, w: 60, h: 55, dmg: 8 * this.atkPower };
    }

    heavyAttack() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling' || this.state === 'light_attack' || this.state === 'heavy_attack') return;
        this.state = 'heavy_attack';
        this.stateTimer = 0;
        audioEngine.playHeavyHit();

        const hitX = (this.facing === 'right') ? this.x + 35 : this.x - 105;
        this.hitbox = { x: hitX, y: this.y - 120, w: 70, h: 60, dmg: 15 * this.atkPower };
    }

    // SPECIAL MOVE 1 (e.g. ↓ → + J)
    special1() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.meter < 15) return;

        this.meter -= 15;
        this.state = 'special1';
        this.stateTimer = 0;
        audioEngine.playSpecialMove();

        const moveData = this.data.moves.special1;
        const dir = (this.facing === 'right') ? 1 : -1;

        if (moveData.type === 'projectile' || moveData.type === 'freeze_projectile') {
            this.projectiles.push({
                x: this.x + dir * 45,
                y: this.y - 85,
                vx: dir * 8,
                vy: 0,
                type: moveData.projType || 'energy',
                dmg: moveData.dmg * this.atkPower,
                life: 90
            });
        } else if (moveData.type === 'vertical_beam') {
            this.projectiles.push({
                x: this.x + dir * 85,
                y: this.y - 140,
                vx: dir * 2,
                vy: 9,
                type: moveData.projType || 'pyramids',
                dmg: moveData.dmg * this.atkPower,
                life: 45
            });
        } else {
            const hitX = (this.facing === 'right') ? this.x + 40 : this.x - 110;
            this.hitbox = { x: hitX, y: this.y - 110, w: 75, h: 60, dmg: moveData.dmg * this.atkPower };
            this.vx = dir * 7;
        }
    }

    // SPECIAL MOVE 2 (e.g. ↓ ← + K)
    special2() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.meter < 20) return;

        this.meter -= 20;
        this.state = 'special2';
        this.stateTimer = 0;
        audioEngine.playSpecialMove();

        const moveData = this.data.moves.special2;
        const dir = (this.facing === 'right') ? 1 : -1;

        if (moveData.type === 'projectile' || moveData.type === 'ground_hazard') {
            this.projectiles.push({
                x: this.x + dir * 40,
                y: (moveData.type === 'ground_hazard') ? this.y - 12 : this.y - 80,
                vx: dir * 6.5,
                vy: 0,
                type: moveData.projType || 'kittens',
                dmg: moveData.dmg * this.atkPower,
                life: 90
            });
        } else if (moveData.type === 'summon_crush' || moveData.type === 'summon_drop') {
            this.projectiles.push({
                x: this.x + dir * 110,
                y: 20,
                vx: 0,
                vy: 10,
                type: moveData.projType || 'ice_sculpture',
                dmg: moveData.dmg * this.atkPower,
                life: 40
            });
        } else {
            const hitX = (this.facing === 'right') ? this.x + 40 : this.x - 110;
            this.hitbox = { x: hitX, y: this.y - 110, w: 75, h: 60, dmg: moveData.dmg * this.atkPower };
            this.vx = dir * 8;
        }
    }

    // SPECIAL MOVE 3 (e.g. ↓ → + L)
    special3() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.meter < 25) return;

        this.meter -= 25;
        this.state = 'special3';
        this.stateTimer = 0;
        audioEngine.playSpecialMove();

        const moveData = this.data.moves.special3;
        const dir = (this.facing === 'right') ? 1 : -1;

        if (moveData.type === 'projectile') {
            this.projectiles.push({
                x: this.x + dir * 45,
                y: this.y - 85,
                vx: dir * 8.5,
                vy: 0,
                type: moveData.projType || 'lion_roar',
                dmg: moveData.dmg * this.atkPower,
                life: 90
            });
        } else {
            const hitX = (this.facing === 'right') ? this.x + 40 : this.x - 115;
            this.hitbox = { x: hitX, y: this.y - 110, w: 80, h: 60, dmg: moveData.dmg * this.atkPower };
            this.vx = dir * 9;
        }
    }

    // Super Attack (Requires 100% Meter)
    superAttack() {
        if (this.isFrozen || this.state === 'hurt' || this.state === 'ko' || this.state === 'defeat_kneeling') return;
        if (this.meter < 100) return;

        this.meter = 0;
        this.state = 'super_attack';
        this.stateTimer = 0;
        audioEngine.playLaser();

        const hitX = (this.facing === 'right') ? this.x + 40 : this.x - 140;
        this.hitbox = { x: hitX, y: this.y - 130, w: 100, h: 90, dmg: 48 * this.atkPower };

        // Also launch visual super projectile
        const dir = (this.facing === 'right') ? 1 : -1;
        this.projectiles.push({
            x: this.x + dir * 50,
            y: this.y - 85,
            vx: dir * 11,
            vy: 0,
            type: 'gold_ball',
            dmg: 25 * this.atkPower,
            life: 60
        });
    }

    takeDamage(dmg, hitDir) {
        if (this.state === 'block') {
            this.hp -= dmg * 0.2;
            audioEngine.playBlock();
            this.meter = Math.min(100, this.meter + 5);
            return;
        }

        this.hp -= dmg;
        this.state = 'hurt';
        this.stateTimer = 0;
        this.vx = (hitDir === 'right') ? 5 : -5;
        this.meter = Math.min(100, this.meter + 10);

        if (this.hp <= 0) {
            this.hp = 0;
            // Enter exhausted kneeling position before KO / Fatality (Posición antes de perder)
            this.state = 'defeat_kneeling';
            this.stateTimer = 0;
            this.vx = 0;
        }
    }

    // CPU AI DECISION ENGINE
    updateAI(opponent) {
        this.aiTimer++;
        const dist = Math.abs(this.x - opponent.x);

        let decisionInterval = 28;
        if (this.difficulty === 'easy') decisionInterval = 45;
        if (this.difficulty === 'hard') decisionInterval = 16;
        if (this.difficulty === 'extremo') decisionInterval = 8;

        if (this.aiTimer % decisionInterval !== 0) return;

        // Reactive Block
        if ((this.difficulty === 'hard' || this.difficulty === 'extremo') && opponent.hitbox) {
            this.block(true);
            return;
        } else {
            if (this.state === 'block') this.block(false);
        }

        // Combat Strategy
        if (dist > 160) {
            // Long range: Specials or approach
            if (this.meter >= 25 && Math.random() < 0.45) {
                if (Math.random() < 0.5) this.special1();
                else this.special3();
            } else {
                this.move(this.x < opponent.x ? 'right' : 'left');
            }
        } else if (dist < 95) {
            // Close range: Combos, Supers or Punches
            if (this.meter >= 100 && Math.random() < 0.7) {
                this.superAttack();
            } else if (this.meter >= 20 && Math.random() < 0.5) {
                this.special2();
            } else if (Math.random() < 0.5) {
                this.heavyAttack();
            } else {
                this.lightAttack();
            }
        }
    }
}
