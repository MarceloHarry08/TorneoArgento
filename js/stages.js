/* TORNEO ARGENTO 16-BIT - ARGENTINE MYTHIC STAGES RENDERER (16-BIT PIXEL ART) */

class StageRenderer {
    constructor() {
        this.stages = {
            obelisco: {
                id: 'obelisco',
                name: 'Obelisco de Buenos Aires',
                file: 'assets/stages/stage_obelisco.jpg',
                skyColor: '#0a081a',
                groundColor: '#22222b'
            },
            casarosada: {
                id: 'casarosada',
                name: 'Plaza de Mayo / Casa Rosada',
                file: 'assets/stages/stage_casarosada.jpg',
                skyColor: '#1a102f',
                groundColor: '#3a251e'
            },
            caminito: {
                id: 'caminito',
                name: 'Caminito (La Boca)',
                file: 'assets/stages/stage_caminito.jpg',
                skyColor: '#190e24',
                groundColor: '#3a2e2b'
            },
            glaciar: {
                id: 'glaciar',
                name: 'Glaciar Perito Moreno',
                file: 'assets/stages/stage_glaciar.jpg',
                skyColor: '#061729',
                groundColor: '#1d3557'
            },
            mesaza: {
                id: 'mesaza',
                name: 'Templo Inmortal de la Mesaza',
                file: 'assets/stages/stage_mesaza.jpg',
                skyColor: '#1e001e',
                groundColor: '#4a0e2e'
            }
        };

        this.currentStageKey = 'obelisco';
        this.animTime = 0;

        // Preload 16-bit background images
        this.stageImages = {};
        for (const [key, data] of Object.entries(this.stages)) {
            const img = new Image();
            img.src = data.file;
            this.stageImages[key] = {
                img: img,
                loaded: false
            };
            img.onload = () => {
                this.stageImages[key].loaded = true;
            };
            img.onerror = () => {
                console.warn(`Could not load stage image for: ${key}, falling back to canvas art.`);
            };
        }

        // Snow particles for Glacier
        this.snowFlakes = [];
        for (let i = 0; i < 45; i++) {
            this.snowFlakes.push({
                x: Math.random() * 640,
                y: Math.random() * 360,
                speed: 1 + Math.random() * 2,
                size: Math.random() > 0.6 ? 2 : 1,
                drift: Math.random() * 1.5 - 0.5
            });
        }
    }

    setStage(key) {
        if (this.stages[key]) {
            this.currentStageKey = key;
        } else {
            this.currentStageKey = 'obelisco';
        }
    }

    render(ctx, width = 640, height = 360) {
        this.animTime += 0.05;
        const key = this.currentStageKey;
        const stageImgObj = this.stageImages[key];

        ctx.save();

        // 1. RENDER 16-BIT BACKGROUND IMAGE OR FALLBACK
        if (stageImgObj && stageImgObj.loaded) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(stageImgObj.img, 0, 0, width, height);
        } else {
            // Procedural fallback if image is still loading
            this.renderFallbackStage(ctx, key, width, height);
        }

        // 2. DYNAMIC 16-BIT ATMOSPHERIC OVERLAYS & ANIMATIONS
        this.renderStageAnimations(ctx, key, width, height);

        ctx.restore();
    }

    renderStageAnimations(ctx, key, width, height) {
        const time = this.animTime;

        if (key === 'obelisco') {
            // Lamppost warm light halo (left corner)
            const lampPulse = 0.35 + Math.sin(time * 3) * 0.08;
            const lampGrad = ctx.createRadialGradient(31, 125, 2, 31, 125, 36);
            lampGrad.addColorStop(0, `rgba(255, 230, 140, ${lampPulse})`);
            lampGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
            ctx.fillStyle = lampGrad;
            ctx.beginPath();
            ctx.arc(31, 125, 36, 0, Math.PI * 2);
            ctx.fill();

            // Traffic light blink cycle
            const semCycle = Math.floor((time * 1.5) % 3);
            const semColors = ['#ff3333', '#ffbb00', '#00ff66'];
            ctx.fillStyle = semColors[semCycle];
            ctx.fillRect(215, 137, 3, 3);
            ctx.fillRect(426, 137, 3, 3);

            // Neon signs subtle electric buzz (Quilmes & Clarin)
            if (Math.sin(time * 8) > 0.8) {
                ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
                ctx.fillRect(530, 95, 45, 25);
            }
            if (Math.sin(time * 6 + 1) > 0.7) {
                ctx.fillStyle = 'rgba(255, 50, 50, 0.2)';
                ctx.fillRect(595, 65, 42, 25);
            }

            // Distant headlights flashing on 9 de Julio
            const carX1 = (160 + (time * 15) % 120);
            ctx.fillStyle = '#fffbb0';
            ctx.fillRect(carX1, 210, 2, 1);
            ctx.fillRect(carX1 + 4, 210, 2, 1);

        } else if (key === 'casarosada') {
            // Argentine Flag waving wave on main flagpole
            const flagWave = Math.sin(time * 4) * 3;
            ctx.fillStyle = 'rgba(117, 170, 219, 0.4)';
            ctx.fillRect(320 + flagWave, 22, 5, 20);

            // Sun of May shimmer
            const sunPulse = 0.5 + Math.sin(time * 5) * 0.4;
            ctx.fillStyle = `rgba(255, 215, 0, ${sunPulse})`;
            ctx.fillRect(336, 31 + flagWave * 0.5, 4, 4);

            // Plaza street lamps golden halo
            const lampGlow = 0.3 + Math.sin(time * 3) * 0.05;
            const leftLamp = ctx.createRadialGradient(50, 115, 2, 50, 115, 30);
            leftLamp.addColorStop(0, `rgba(255, 230, 120, ${lampGlow})`);
            leftLamp.addColorStop(1, 'rgba(255, 200, 50, 0)');
            ctx.fillStyle = leftLamp;
            ctx.beginPath();
            ctx.arc(50, 115, 30, 0, Math.PI * 2);
            ctx.fill();

            const rightLamp = ctx.createRadialGradient(590, 115, 2, 590, 115, 30);
            rightLamp.addColorStop(0, `rgba(255, 230, 120, ${lampGlow})`);
            rightLamp.addColorStop(1, 'rgba(255, 200, 50, 0)');
            ctx.fillStyle = rightLamp;
            ctx.beginPath();
            ctx.arc(590, 115, 30, 0, Math.PI * 2);
            ctx.fill();

        } else if (key === 'caminito') {
            // Clothes swaying on the balcony
            const sway = Math.sin(time * 3) * 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(135 + sway, 108, 4, 12);
            ctx.fillStyle = 'rgba(255, 40, 40, 0.3)';
            ctx.fillRect(163 - sway, 108, 4, 12);

            // Caminito street lamp flickers
            const flicker = 0.35 + (Math.sin(time * 12) > 0.85 ? -0.15 : 0.05);
            const camLamp = ctx.createRadialGradient(230, 165, 2, 230, 165, 25);
            camLamp.addColorStop(0, `rgba(255, 220, 120, ${flicker})`);
            camLamp.addColorStop(1, 'rgba(255, 180, 0, 0)');
            ctx.fillStyle = camLamp;
            ctx.beginPath();
            ctx.arc(230, 165, 25, 0, Math.PI * 2);
            ctx.fill();

            // Blinking cat eyes on the bench/curb
            if (Math.sin(time * 2) > 0.95) {
                ctx.fillStyle = '#00ffcc';
                ctx.fillRect(209, 276, 1, 1);
                ctx.fillRect(211, 276, 1, 1);
            }

        } else if (key === 'glaciar') {
            // Falling snow flakes
            ctx.fillStyle = '#ffffff';
            for (let flake of this.snowFlakes) {
                flake.y += flake.speed;
                flake.x += flake.drift;
                if (flake.y > height) {
                    flake.y = 0;
                    flake.x = Math.random() * width;
                }
                if (flake.x > width) flake.x = 0;
                if (flake.x < 0) flake.x = width;

                ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), flake.size, flake.size);
            }

            // Cold glacial mist over the water
            const mistAlpha = 0.06 + Math.sin(time * 1.5) * 0.03;
            ctx.fillStyle = `rgba(200, 240, 255, ${mistAlpha})`;
            ctx.fillRect(0, 190, width, 40);

            // Ice glint sparkle
            if (Math.sin(time * 4) > 0.8) {
                const sparkleX = 270 + Math.floor(Math.sin(time * 2) * 50);
                const sparkleY = 120 + Math.floor(Math.cos(time * 2) * 20);
                this.drawSparkle(ctx, sparkleX, sparkleY, '#a8dadc');
            }

        } else if (key === 'mesaza') {
            // Crystal Chandelier sparkle stars
            const s1 = Math.sin(time * 4);
            if (s1 > 0.5) this.drawSparkle(ctx, 135, 80, '#ffffff');
            const s2 = Math.sin(time * 4 + 2);
            if (s2 > 0.5) this.drawSparkle(ctx, 505, 80, '#ffffff');
            const s3 = Math.sin(time * 3 + 1);
            if (s3 > 0.6) this.drawSparkle(ctx, 320, 45, '#ffd700');

            // Candelabra dancing flame highlights
            const flameFlicker = Math.sin(time * 10) * 1.5;
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(235, 186 + flameFlicker, 2, 3);
            ctx.fillRect(247, 184 - flameFlicker, 2, 3);
            ctx.fillRect(393, 186 - flameFlicker, 2, 3);
            ctx.fillRect(405, 184 + flameFlicker, 2, 3);

            // Subtle gold ambient shimmer on marble floor
            const shimmer = 0.05 + Math.sin(time * 2) * 0.03;
            ctx.fillStyle = `rgba(255, 215, 0, ${shimmer})`;
            ctx.fillRect(0, 260, width, 100);
        }
    }

    drawSparkle(ctx, x, y, color = '#ffffff') {
        ctx.fillStyle = color;
        ctx.fillRect(x - 2, y, 5, 1);
        ctx.fillRect(x, y - 2, 1, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, 1, 1);
    }

    renderFallbackStage(ctx, key, width, height) {
        let skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (key === 'obelisco') {
            skyGrad.addColorStop(0, '#0a081d');
            skyGrad.addColorStop(0.7, '#241b4b');
            skyGrad.addColorStop(1, '#4a2545');
        } else if (key === 'casarosada') {
            skyGrad.addColorStop(0, '#150a21');
            skyGrad.addColorStop(0.6, '#3a1b38');
            skyGrad.addColorStop(1, '#75adb0');
        } else if (key === 'glaciar') {
            skyGrad.addColorStop(0, '#040d1a');
            skyGrad.addColorStop(0.6, '#0f2b48');
            skyGrad.addColorStop(1, '#a8dadc');
        } else if (key === 'caminito') {
            skyGrad.addColorStop(0, '#180a1c');
            skyGrad.addColorStop(0.6, '#4a1535');
            skyGrad.addColorStop(1, '#f77f00');
        } else if (key === 'mesaza') {
            skyGrad.addColorStop(0, '#1a001a');
            skyGrad.addColorStop(0.6, '#4a004a');
            skyGrad.addColorStop(1, '#8b0000');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Ground line
        const floorY = 260;
        let groundGrad = ctx.createLinearGradient(0, floorY, 0, height);
        const stageInfo = this.stages[key] || this.stages.obelisco;
        groundGrad.addColorStop(0, stageInfo.groundColor);
        groundGrad.addColorStop(1, '#08060c');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, floorY, width, height - floorY);
    }
}

const stageRenderer = new StageRenderer();
window.stageRenderer = stageRenderer;
