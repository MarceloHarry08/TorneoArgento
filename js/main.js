/* TORNEO ARGENTO 16-BIT - MAIN ENTRY & INPUT CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI and Game Engine
console.log('Main script initialized');
    uiController.init();
    gameEngine.init();

    // Universal user gesture handler to resume AudioContext (Tone.js / Web Audio) cleanly
    const unlockAudio = () => {
        if (window.audioEngine && audioEngine.resumeAudio) {
            audioEngine.resumeAudio();
        }
    };
    ['pointerdown', 'click', 'keydown', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { once: true, passive: true });
    });

    // --- EVENT BINDINGS FOR BUTTONS & MENUS ---

    // Title Screen Buttons
    document.getElementById('btn-start-arcade').addEventListener('click', () => {
        console.log('Start Arcade button clicked');
        try {
            gameEngine.mode = 'arcade';
            gameEngine.towerIndex = 0;
            document.getElementById('select-mode-title').textContent = 'TORRE ARCADE: SELECCIONA TU LUCHADOR';
            uiController.showScreen('charSelect');
        } catch (e) {
            console.error('Error in Arcade start handler:', e);
        }
        try {
            audioEngine.playMenuConfirm();
        } catch (e) {
            console.warn('audioEngine.playMenuConfirm failed:', e);
        }
    });

    document.getElementById('btn-start-vs').addEventListener('click', () => {
        console.log('Start VS button clicked');
        try {
            gameEngine.mode = 'vs';
            document.getElementById('select-mode-title').textContent = 'VERSUS 2P: SELECCIONA LOS LUCHADORES';
            uiController.showScreen('charSelect');
        } catch (e) {
            console.error('Error in VS start handler:', e);
        }
        try {
            audioEngine.playMenuConfirm();
        } catch (e) {
            console.warn('audioEngine.playMenuConfirm failed:', e);
        }
    });




    // --- GSAP SPRITE STUDIO CONTROLLER & EVENT BINDINGS ---
    const openGsapStudio = () => {
        document.getElementById('modal-spritesheet').classList.remove('hidden');
        if (window.gsapSpriteAnimator) {
            gsapSpriteAnimator.init(document.getElementById('gsap-animator-canvas'));
            gsapSpriteAnimator.play();
        }
        try {
            audioEngine.playMenuConfirm();
        } catch (e) {}
    };

    const btnOpenGsapStudio = document.getElementById('btn-open-gsap-studio');
    if (btnOpenGsapStudio) {
        btnOpenGsapStudio.addEventListener('click', openGsapStudio);
    }

    document.getElementById('btn-close-spritesheet').addEventListener('click', () => {
        document.getElementById('modal-spritesheet').classList.add('hidden');
        if (window.gsapSpriteAnimator) {
            gsapSpriteAnimator.pause();
        }
    });

    const btnViewSprites = document.getElementById('btn-view-sprites-from-options');
    if (btnViewSprites) {
        btnViewSprites.addEventListener('click', () => {
            uiController.screens.optionsModal.classList.add('hidden');
            openGsapStudio();
        });
    }

    // GSAP Character Selector
    const gsapSelectChar = document.getElementById('gsap-select-character');
    if (gsapSelectChar) {
        gsapSelectChar.addEventListener('change', (e) => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.buildAnimation(e.target.value, gsapSpriteAnimator.currentAction, gsapSpriteAnimator.currentMode);
                gsapSpriteAnimator.play();
            }
        });
    }

    // GSAP Action Selector
    const gsapSelectAction = document.getElementById('gsap-select-action');
    if (gsapSelectAction) {
        gsapSelectAction.addEventListener('change', (e) => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.buildAnimation(gsapSpriteAnimator.currentChar, e.target.value, gsapSpriteAnimator.currentMode);
                gsapSpriteAnimator.play();
            }
        });
    }

    // GSAP Stage Background Selector
    const gsapSelectBg = document.getElementById('gsap-select-bg');
    if (gsapSelectBg) {
        gsapSelectBg.addEventListener('change', (e) => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.setBackground(e.target.value);
            }
        });
    }

    // GSAP Versus Opponent Selector
    const gsapSelectOpponent = document.getElementById('gsap-select-opponent');
    if (gsapSelectOpponent) {
        gsapSelectOpponent.addEventListener('change', (e) => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.versusOpponent = e.target.value;
                if (gsapSpriteAnimator.currentMode === 'versus') {
                    gsapSpriteAnimator.buildAnimation(gsapSpriteAnimator.currentChar, gsapSpriteAnimator.currentAction, 'versus');
                    gsapSpriteAnimator.play();
                }
            }
        });
    }

    // GSAP Mode Buttons (Solo Cuadros, Movimiento Cinético, Combo Completo, Duelo 1 vs 1)
    const modeButtons = document.querySelectorAll('.btn-gsap-mode');
    const groupVersus = document.getElementById('group-versus-opponent');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            if (groupVersus) {
                groupVersus.style.display = (mode === 'versus') ? 'flex' : 'none';
            }
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.buildAnimation(gsapSpriteAnimator.currentChar, gsapSpriteAnimator.currentAction, mode);
                gsapSpriteAnimator.play();
            }
            try { audioEngine.playMenuSelect(); } catch(e) {}
        });
    });

    // Zoom Buttons
    const zoomButtons = document.querySelectorAll('.btn-zoom-opt');
    zoomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            zoomButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.setZoom(btn.dataset.zoom);
            }
        });
    });

    // Speed Buttons
    const speedButtons = document.querySelectorAll('.btn-speed-opt');
    speedButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            speedButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.setSpeed(btn.dataset.speed);
            }
        });
    });

    // Transport buttons (Play/Pause, Prev, Next, Loop)
    const playToggleBtn = document.getElementById('btn-gsap-play-toggle');
    if (playToggleBtn) {
        playToggleBtn.addEventListener('click', () => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.togglePlay();
            }
        });
    }

    const prevFrameBtn = document.getElementById('btn-gsap-prev-frame');
    if (prevFrameBtn) {
        prevFrameBtn.addEventListener('click', () => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.stepBackward();
            }
        });
    }

    const nextFrameBtn = document.getElementById('btn-gsap-next-frame');
    if (nextFrameBtn) {
        nextFrameBtn.addEventListener('click', () => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.stepForward();
            }
        });
    }

    const loopToggleBtn = document.getElementById('btn-gsap-loop-toggle');
    if (loopToggleBtn) {
        loopToggleBtn.addEventListener('click', () => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.isLooping = !gsapSpriteAnimator.isLooping;
                loopToggleBtn.classList.toggle('active', gsapSpriteAnimator.isLooping);
                loopToggleBtn.textContent = gsapSpriteAnimator.isLooping ? '🔁 BUCLE' : '➡️ UNA VEZ';
                if (gsapSpriteAnimator.timeline) {
                    gsapSpriteAnimator.timeline.repeat(gsapSpriteAnimator.isLooping ? -1 : 0);
                }
            }
        });
    }

    // Scrubber Slider
    const timelineSlider = document.getElementById('gsap-timeline-slider');
    if (timelineSlider) {
        timelineSlider.addEventListener('input', (e) => {
            if (window.gsapSpriteAnimator) {
                gsapSpriteAnimator.scrubTo(parseFloat(e.target.value));
            }
        });
    }

    // Raw Sheet Toggle
    const btnToggleRawSheet = document.getElementById('btn-toggle-raw-sheet');
    const rawSheetContainer = document.getElementById('gsap-raw-sheet-container');
    if (btnToggleRawSheet && rawSheetContainer) {
        btnToggleRawSheet.addEventListener('click', () => {
            rawSheetContainer.classList.toggle('hidden');
            const isHidden = rawSheetContainer.classList.contains('hidden');
            btnToggleRawSheet.textContent = isHidden ? '🖼️ VER HOJA RAW' : '⚡ VOLVER AL ESTUDIO';
        });
    }

    const selectSpriteView = document.getElementById('select-spritesheet-view');
    if (selectSpriteView) {
        selectSpriteView.addEventListener('change', (e) => {
            const img = document.getElementById('spritesheet-display-img');
            if (img) {
                img.src = e.target.value;
            }
        });
    }

    // Title Screen GSAP Entrance & Breathing Animations
    if (typeof gsap !== 'undefined') {
        gsap.from('.retro-badge', { y: -25, opacity: 0, duration: 0.9, ease: 'bounce.out' });
        gsap.from('.game-title', { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.2, ease: 'back.out(2)' });
        gsap.from('.game-subtitle', { opacity: 0, y: 15, duration: 0.7, delay: 0.4 });
        gsap.to('.btn-gsap-studio', { scale: 1.03, yoyo: true, repeat: -1, duration: 1.4, ease: 'sine.inOut' });
    }

    document.getElementById('btn-open-movelist').addEventListener('click', () => {
        uiController.openPauseModal(gameEngine.p1);
        audioEngine.playMenuConfirm();
    });

    document.getElementById('btn-open-options').addEventListener('click', () => {
        uiController.screens.optionsModal.classList.remove('hidden');
        audioEngine.playMenuConfirm();
    });

    document.getElementById('btn-back-to-title').addEventListener('click', () => {
        uiController.showScreen('title');
        audioEngine.playMenuSelect();
    });

    // Character Select Confirm
    document.getElementById('btn-confirm-select').addEventListener('click', () => {
        audioEngine.playMenuConfirm();
        const diff = document.getElementById('select-difficulty').value;
        const prefStage = document.getElementById('select-stage').value;

        if (gameEngine.mode === 'arcade') {
            uiController.renderTowerLadder(0);
            uiController.showScreen('tower');
        } else {
            // Start Local 2P match
            let stage = prefStage;
            if (stage === 'auto') {
                const allStages = ['obelisco', 'casarosada', 'caminito', 'glaciar', 'mesaza'];
                stage = allStages[Math.floor(Math.random() * allStages.length)];
            }
            gameEngine.startMatch(uiController.p1SelectedKey, uiController.p2SelectedKey, false, diff, stage);
        }
    });

    // Arcade Tower Match Start
    document.getElementById('btn-start-tower-match').addEventListener('click', () => {
        audioEngine.playMenuConfirm();
        const opponentKey = gameEngine.towerOpponents[gameEngine.towerIndex];
        const prefStage = document.getElementById('select-stage') ? document.getElementById('select-stage').value : 'auto';
        let stage = 'obelisco';

        if (prefStage && prefStage !== 'auto') {
            stage = prefStage;
        } else if (opponentKey === 'inmortal') {
            stage = 'mesaza';
        } else if (['leon', 'latina', 'ojosazules'].includes(opponentKey)) {
            stage = 'casarosada';
        } else if (['elmesias', 'pepeargento', 'hugo', 'pergolas'].includes(opponentKey)) {
            stage = 'caminito';
        } else if (['sangrejaponesa', 'eleternauta'].includes(opponentKey)) {
            stage = 'glaciar';
        } else {
            const cycle = ['obelisco', 'casarosada', 'caminito', 'glaciar'];
            stage = cycle[gameEngine.towerIndex % cycle.length];
        }

        const diff = document.getElementById('select-difficulty').value;
        gameEngine.startMatch(uiController.p1SelectedKey, opponentKey, true, diff, stage);
    });

    // Next Tower Stage Button (On Victory)
    document.getElementById('btn-next-tower-stage').addEventListener('click', () => {
        gameEngine.towerIndex++;
        if (gameEngine.towerIndex < gameEngine.towerOpponents.length) {
            uiController.renderTowerLadder(gameEngine.towerIndex);
            uiController.showScreen('tower');
        } else {
            // Arcade Tower Completed!
            alert('¡FELICIDADES! HAS CONQUISTADO EL TORNEO ARGENTO Y DERROTADO A MIRTHA LEGRAND.');
            uiController.showScreen('title');
        }
    });

    document.getElementById('btn-rematch').addEventListener('click', () => {
        const diff = document.getElementById('select-difficulty').value;
        const opponentKey = (gameEngine.mode === 'arcade') ? gameEngine.towerOpponents[gameEngine.towerIndex] : uiController.p2SelectedKey;
        const isCPU = (gameEngine.mode === 'arcade');
        const currentStage = stageRenderer.currentStageKey || 'obelisco';

        gameEngine.startMatch(uiController.p1SelectedKey, opponentKey, isCPU, diff, currentStage);
    });

    document.getElementById('btn-victory-char-select').addEventListener('click', () => {
        uiController.showScreen('charSelect');
    });

    // In-game Pause & Modals
    document.getElementById('btn-in-game-pause').addEventListener('click', () => {
        uiController.openPauseModal(gameEngine.p1);
    });

    document.getElementById('btn-close-pause').addEventListener('click', () => {
        uiController.closePauseModal();
    });

    document.getElementById('btn-resume-game').addEventListener('click', () => {
        uiController.closePauseModal();
    });

    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
        uiController.closePauseModal();
        gameEngine.gameState = 'TITLE';
        audioEngine.startBgm('menu');
        uiController.showScreen('title');
    });

    document.getElementById('btn-close-options').addEventListener('click', () => {
        uiController.screens.optionsModal.classList.add('hidden');
    });

    // Option Toggles
    document.getElementById('btn-toggle-crt').addEventListener('click', (e) => {
        const overlay = document.getElementById('crt-overlay');
        overlay.classList.toggle('disabled');
        e.target.textContent = overlay.classList.contains('disabled') ? 'DESACTIVADO' : 'ACTIVADO';
    });

    document.getElementById('btn-toggle-music').addEventListener('click', (e) => {
        const state = audioEngine.toggleMusic();
        e.target.textContent = state ? 'ACTIVADO' : 'DESACTIVADO';
    });

    document.getElementById('btn-toggle-sfx').addEventListener('click', (e) => {
        const state = audioEngine.toggleSfx();
        e.target.textContent = state ? 'ACTIVADO' : 'DESACTIVADO';
    });

    // Rock Nacional Song Select in Options
    const rockSongSelect = document.getElementById('select-rock-song');
    if (rockSongSelect) {
        rockSongSelect.addEventListener('change', (e) => {
            const song = e.target.value;
            if (song && song !== 'auto') {
                audioEngine.startBgm(song);
            } else if (gameEngine.gameState === 'FIGHT') {
                audioEngine.startBgm('hacelopormi');
            } else {
                audioEngine.startBgm('demusicaligera');
            }
        });
    }

    // --- KEYBOARD CONTROLS LISTENERS ---

    // --- KEYBOARD CONTROLS LISTENERS ---

    const keysDown = {};

    window.addEventListener('keydown', (e) => {
        // Prevent default browser scrolling/navigation on fight game keys
        const navGameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
            'ScrollLock', 'Pause', 'PrintScreen', 'Space'
        ];
        if (navGameKeys.includes(e.code) || navGameKeys.includes(e.key)) {
            if (gameEngine.gameState === 'FIGHT' || gameEngine.gameState === 'FATALITY' || gameEngine.gameState === 'TITLE') {
                e.preventDefault();
            }
        }

        if (keysDown[e.code]) return; // Avoid key repeat spam
        keysDown[e.code] = true;

        // Initialize Audio context on first user key press
        audioEngine.ensureContext();

        // Title Screen Start with Space, Enter, or any action key
        if (gameEngine.gameState === 'TITLE' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Insert' || e.code === 'Home')) {
            const btnArcade = document.getElementById('btn-start-arcade');
            if (btnArcade) btnArcade.click();
            return;
        }

        // Pause Game with Escape, KeyP, or Pause key
        if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Pause') {
            if (gameEngine.gameState === 'FIGHT') {
                if (gameEngine.isPaused) uiController.closePauseModal();
                else uiController.openPauseModal(gameEngine.p1);
            }
            return;
        }

        // FATALITY Execution Trigger Input check
        if (gameEngine.gameState === 'FATALITY') {
            const fatalityKeys = [
                'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
                'ScrollLock', 'PrintScreen', 'KeyL', 'KeyI', 'Numpad3', 'Numpad5'
            ];
            if (fatalityKeys.includes(e.code)) {
                gameEngine.executeFatality();
            }
            return;
        }

        if (gameEngine.gameState !== 'FIGHT' || gameEngine.isPaused) return;

        // ==========================================
        // P1 PRIMARY CONTROLS (ARROWS + NAV CLUSTER)
        // Círculo Rojo: Flechas (Movimiento)
        // Círculo Azul: Insert, Inicio, Supr, Fin, Re Pág, Av Pág (Combate)
        // ==========================================

        const isDown = keysDown['ArrowDown'] || keysDown['KeyS'];

        // Directional special move combos (Mortal Kombat Style: ↓ + Golpe)
        if (isDown && (e.code === 'Insert' || e.code === 'KeyJ')) {
            gameEngine.p1.special1();
            return;
        }
        if (isDown && (e.code === 'Home' || e.code === 'KeyK')) {
            gameEngine.p1.special2();
            return;
        }
        if (isDown && (e.code === 'End' || e.code === 'PageDown' || e.code === 'KeyL')) {
            gameEngine.p1.special3();
            return;
        }

        // 1. Movimiento del Personaje (Círculo Rojo: Flechas) & Secundario (WASD)
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            gameEngine.p1.move('left');
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            gameEngine.p1.move('right');
        }
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            gameEngine.p1.jump();
        }
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            gameEngine.p1.crouch(true);
        }

        // 2. Acciones de Combate (Círculo Azul: Bloque de Navegación) & Secundario (JKL / UIO)
        // Pegar (Golpe Liviano / Rápido)
        if (e.code === 'Insert' || e.code === 'KeyJ') {
            gameEngine.p1.lightAttack();
        }
        // Pegar (Golpe Pesado / Fuerte)
        if (e.code === 'Home' || e.code === 'KeyK') {
            gameEngine.p1.heavyAttack();
        }
        // Cubrirse (Bloqueo Defensivo)
        if (e.code === 'Delete' || e.code === 'KeyB') {
            gameEngine.p1.block(true);
        }
        // Poder Especial 1
        if (e.code === 'End' || e.code === 'KeyU') {
            gameEngine.p1.special1();
        }
        // Poder Especial 2
        if (e.code === 'PageDown' || e.code === 'KeyO') {
            gameEngine.p1.special2();
        }
        // Poder Especial 3
        if (e.code === 'ScrollLock' || e.code === 'PrintScreen' || e.code === 'KeyL') {
            gameEngine.p1.special3();
        }
        // Ataque Súper (Con barra al 100%)
        if (e.code === 'PageUp' || e.code === 'KeyI') {
            gameEngine.p1.superAttack();
        }

        // ==========================================
        // P2 CONTROLS (NUMPAD FOR LOCAL 2P)
        // ==========================================
        if (!gameEngine.p2.isCPU) {
            if (keysDown['Numpad2'] && (e.code === 'Numpad1' || e.code === 'Digit1')) {
                gameEngine.p2.special1();
                return;
            }
            if (keysDown['Numpad2'] && (e.code === 'Numpad3' || e.code === 'Digit3')) {
                gameEngine.p2.special2();
                return;
            }

            if (e.code === 'Numpad4') gameEngine.p2.move('left');
            if (e.code === 'Numpad6') gameEngine.p2.move('right');
            if (e.code === 'Numpad8') gameEngine.p2.jump();
            if (e.code === 'Numpad2' || e.code === 'Numpad5') gameEngine.p2.crouch(true);
            if (e.code === 'Numpad0') gameEngine.p2.block(true);
            if (e.code === 'Numpad1' || e.code === 'Digit1') gameEngine.p2.lightAttack();
            if (e.code === 'Numpad3' || e.code === 'Digit2') gameEngine.p2.heavyAttack();
            if (e.code === 'Numpad7' || e.code === 'Digit4') gameEngine.p2.special1();
            if (e.code === 'Numpad9' || e.code === 'Digit6') gameEngine.p2.special2();
            if (e.code === 'NumpadDecimal' || e.code === 'Digit3') gameEngine.p2.special3();
            if (e.code === 'NumpadEnter' || e.code === 'Digit5') gameEngine.p2.superAttack();
        }
    });

    window.addEventListener('keyup', (e) => {
        delete keysDown[e.code];

        if (gameEngine.gameState !== 'FIGHT' || gameEngine.isPaused) return;

        // P1 Movimiento al soltar teclas
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            if (keysDown['ArrowRight'] || keysDown['KeyD']) {
                gameEngine.p1.move('right');
            } else {
                gameEngine.p1.move('stop');
            }
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            if (keysDown['ArrowLeft'] || keysDown['KeyA']) {
                gameEngine.p1.move('left');
            } else {
                gameEngine.p1.move('stop');
            }
        }
        // P1 Agacharse al soltar tecla
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            if (!keysDown['ArrowDown'] && !keysDown['KeyS']) {
                gameEngine.p1.crouch(false);
            }
        }
        // P1 Cubrirse / Bloqueo al soltar tecla
        if (e.code === 'Delete' || e.code === 'KeyB') {
            gameEngine.p1.block(false);
        }

        // P2 Al soltar teclas
        if (!gameEngine.p2.isCPU) {
            if (e.code === 'Numpad4') {
                if (keysDown['Numpad6']) gameEngine.p2.move('right');
                else gameEngine.p2.move('stop');
            }
            if (e.code === 'Numpad6') {
                if (keysDown['Numpad4']) gameEngine.p2.move('left');
                else gameEngine.p2.move('stop');
            }
            if (e.code === 'Numpad2' || e.code === 'Numpad5') gameEngine.p2.crouch(false);
            if (e.code === 'Numpad0') gameEngine.p2.block(false);
        }
    });

    // Start title music on load (De Música Ligera - Soda Stereo)
    try {
        audioEngine.startBgm('demusicaligera');
    } catch (e) {
        console.warn('Audio startBgm failed:', e);
    }
});
