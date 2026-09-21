/* TORNEO ARGENTO 16-BIT - UI CONTROLLER */

class UIController {
    constructor() {
        // Selected Fighters
        this.p1SelectedKey = 'leon';
        this.p2SelectedKey = 'latina';

        // DOM Element Cache
        this.screens = {
            title: document.getElementById('screen-title'),
            charSelect: document.getElementById('screen-char-select'),
            tower: document.getElementById('screen-arcade-tower'),
            victory: document.getElementById('screen-victory'),
            pauseModal: document.getElementById('modal-pause'),
            optionsModal: document.getElementById('modal-options'),
            hud: document.getElementById('hud-overlay')
        };
    }

    init() {
        this.renderCharacterGrid();
        this.updateCharSelectPreview('p1', this.p1SelectedKey);
        this.updateCharSelectPreview('p2', this.p2SelectedKey);
    }

    showScreen(screenName) {
        console.log('UIController.showScreen called with:', screenName);
        Object.keys(this.screens).forEach(key => {
            if (this.screens[key]) this.screens[key].classList.add('hidden');
        });

        if (this.screens[screenName]) {
            this.screens[screenName].classList.remove('hidden');
        } else {
            console.warn('UIController.showScreen: unknown screenName', screenName);
        }

        if (screenName === 'hud') {
            document.getElementById('btn-in-game-pause').classList.remove('hidden');
        } else {
            document.getElementById('btn-in-game-pause').classList.add('hidden');
        }

        if (screenName === 'charSelect') {
            this.renderCharacterGrid();
            this.updateCharSelectPreview('p1', this.p1SelectedKey);
            if (window.gameEngine && gameEngine.mode === 'vs') {
                this.updateCharSelectPreview('p2', this.p2SelectedKey);
            }
        }
    }

    refreshPortraits() {
        const cards = document.querySelectorAll('.grid-char-card');
        cards.forEach(card => {
            const key = card.dataset.key;
            const canvas = card.querySelector('canvas');
            if (canvas && key && window.pixelRenderer) {
                const ctx = canvas.getContext('2d');
                pixelRenderer.drawPortrait(ctx, key, 40, 40);
            }
        });
        if (this.p1SelectedKey) this.updateCharSelectPreview('p1', this.p1SelectedKey);
        if (this.p2SelectedKey) this.updateCharSelectPreview('p2', this.p2SelectedKey);
    }

    renderCharacterGrid() {
        const grid = document.getElementById('character-grid');
        if (!grid) return;
        grid.innerHTML = '';

        ROSTER_KEYS.forEach(key => {
            const charData = CHARACTERS[key] || { name: key.toUpperCase(), alias: '' };
            const card = document.createElement('div');
            card.className = 'grid-char-card';
            if (key === this.p1SelectedKey) card.classList.add('selected-p1');
            if (key === this.p2SelectedKey) card.classList.add('selected-p2');
            card.dataset.key = key;

            const portraitCanvas = document.createElement('canvas');
            portraitCanvas.width = 40;
            portraitCanvas.height = 40;
            const pCtx = portraitCanvas.getContext('2d');
            if (window.pixelRenderer) {
                pixelRenderer.drawPortrait(pCtx, key, 40, 40);
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'grid-char-name';
            nameSpan.textContent = charData.name || key.toUpperCase();

            card.appendChild(portraitCanvas);
            card.appendChild(nameSpan);

            card.addEventListener('click', () => {
                this.selectCharacter('p1', key);
                audioEngine.playMenuSelect();
            });

            grid.appendChild(card);
        });
    }

    selectCharacter(player, key) {
        if (player === 'p1') {
            this.p1SelectedKey = key;
            this.updateCharSelectPreview('p1', key);
        } else {
            this.p2SelectedKey = key;
            this.updateCharSelectPreview('p2', key);
        }

        document.querySelectorAll('.grid-char-card').forEach(card => {
            card.classList.remove('selected-p1', 'selected-p2');
            if (card.dataset.key === this.p1SelectedKey) card.classList.add('selected-p1');
            if (card.dataset.key === this.p2SelectedKey) card.classList.add('selected-p2');
        });
    }

    updateCharSelectPreview(player, key) {
        const charData = CHARACTERS[key];
        if (!charData) return;

        const nameEl = document.getElementById(`${player}-select-name`);
        const aliasEl = document.getElementById(`${player}-select-alias`);
        const quoteEl = document.getElementById(`${player}-select-quote`);
        const atkEl = document.getElementById(`${player}-stat-atk`);
        const spdEl = document.getElementById(`${player}-stat-spd`);
        const spcEl = document.getElementById(`${player}-stat-spc`);

        if (nameEl) nameEl.textContent = charData.name;
        if (aliasEl) aliasEl.textContent = charData.alias;
        if (quoteEl) quoteEl.textContent = `"${charData.quote}"`;

        if (atkEl) atkEl.style.width = `${charData.stats.atk}%`;
        if (spdEl) spdEl.style.width = `${charData.stats.spd}%`;
        if (spcEl) spcEl.style.width = `${charData.stats.spc}%`;

        // Render Big Portrait
        const canvas = document.getElementById(`${player}-big-portrait`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            pixelRenderer.drawPortrait(ctx, key, 120, 140);
        }
    }

    renderTowerLadder(currentStep = 0) {
        const ladder = document.getElementById('tower-ladder');
        if (!ladder) return;
        ladder.innerHTML = '';

        const towerList = gameEngine.towerOpponents;
        towerList.forEach((key, index) => {
            const charData = CHARACTERS[key];
            const node = document.createElement('div');
            node.className = 'tower-node';
            if (index === towerList.length - 1) node.classList.add('boss');
            if (index === currentStep) node.classList.add('active');
            if (index < currentStep) node.classList.add('defeated');

            const num = document.createElement('span');
            num.className = 'tower-level-num';
            num.textContent = (index === towerList.length - 1) ? 'BOSS' : `P-${index + 1}`;

            const portraitCanvas = document.createElement('canvas');
            portraitCanvas.width = 36;
            portraitCanvas.height = 36;
            const pCtx = portraitCanvas.getContext('2d');
            pixelRenderer.drawPortrait(pCtx, key, 36, 36);

            const name = document.createElement('span');
            name.className = 'tower-node-name';
            name.textContent = charData.name;

            node.appendChild(num);
            node.appendChild(portraitCanvas);
            node.appendChild(name);

            ladder.appendChild(node);
        });

        // Update P1 and Next Opponent previews
        const p1Canvas = document.getElementById('tower-p1-portrait');
        if (p1Canvas) pixelRenderer.drawPortrait(p1Canvas.getContext('2d'), this.p1SelectedKey, 80, 90);
        document.getElementById('tower-p1-name').textContent = CHARACTERS[this.p1SelectedKey].name;

        const nextKey = towerList[currentStep] || 'inmortal';
        const nextCanvas = document.getElementById('tower-next-portrait');
        if (nextCanvas) pixelRenderer.drawPortrait(nextCanvas.getContext('2d'), nextKey, 80, 90);
        document.getElementById('tower-next-name').textContent = CHARACTERS[nextKey].name;
    }

    updateHUD(p1, p2, p1Wins = 0, p2Wins = 0, roundNum = 1, timerVal = 99) {
        document.getElementById('p1-name').textContent = p1.name;
        document.getElementById('p2-name').textContent = p2.name;

        const p1PortCtx = document.getElementById('hud-p1-portrait').getContext('2d');
        const p2PortCtx = document.getElementById('hud-p2-portrait').getContext('2d');
        pixelRenderer.drawPortrait(p1PortCtx, p1.id, 40, 40);
        pixelRenderer.drawPortrait(p2PortCtx, p2.id, 40, 40);

        this.updateHUDBars(p1, p2);
        this.updateRoundsDisplay(p1Wins, p2Wins);
        this.updateTimer(timerVal);
        document.getElementById('round-indicator').textContent = `RONDA ${roundNum}`;

        this.showScreen('hud');
    }

    updateHUDBars(p1, p2) {
        if (typeof gsap !== 'undefined') {
            gsap.to('#p1-health', { width: `${p1.hp}%`, duration: 0.15, ease: 'power1.out' });
            gsap.to('#p1-health-chip', { width: `${p1.hp}%`, duration: 0.6, delay: 0.25, ease: 'power2.out' });
            gsap.to('#p2-health', { width: `${p2.hp}%`, duration: 0.15, ease: 'power1.out' });
            gsap.to('#p2-health-chip', { width: `${p2.hp}%`, duration: 0.6, delay: 0.25, ease: 'power2.out' });
            gsap.to('#p1-meter', { width: `${p1.meter}%`, duration: 0.2, ease: 'power1.out' });
            gsap.to('#p2-meter', { width: `${p2.meter}%`, duration: 0.2, ease: 'power1.out' });
        } else {
            document.getElementById('p1-health').style.width = `${p1.hp}%`;
            document.getElementById('p2-health').style.width = `${p2.hp}%`;
            document.getElementById('p1-meter').style.width = `${p1.meter}%`;
            document.getElementById('p2-meter').style.width = `${p2.meter}%`;
        }

        if (p1.meter >= 100) document.getElementById('p1-meter').classList.add('full');
        else document.getElementById('p1-meter').classList.remove('full');

        if (p2.meter >= 100) document.getElementById('p2-meter').classList.add('full');
        else document.getElementById('p2-meter').classList.remove('full');
    }

    updateRoundsDisplay(p1Wins, p2Wins) {
        const p1Box = document.getElementById('p1-rounds');
        const p2Box = document.getElementById('p2-rounds');
        p1Box.innerHTML = '';
        p2Box.innerHTML = '';

        for (let i = 0; i < 2; i++) {
            const icon1 = document.createElement('div');
            icon1.className = `round-sun-icon ${i < p1Wins ? '' : 'empty'}`;
            p1Box.appendChild(icon1);

            const icon2 = document.createElement('div');
            icon2.className = `round-sun-icon ${i < p2Wins ? '' : 'empty'}`;
            p2Box.appendChild(icon2);
        }
    }

    updateTimer(val) {
        const el = document.getElementById('match-timer');
        el.textContent = val;
        if (val <= 10) el.classList.add('warning');
        else el.classList.remove('warning');
    }

    showAnnouncer(title, subtext) {
        const banner = document.getElementById('announcer-banner');
        document.getElementById('announcer-text').textContent = title;
        document.getElementById('announcer-subtext').textContent = subtext;
        banner.classList.remove('hidden');

        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf(banner);
            gsap.fromTo(banner, 
                { scale: 0.3, opacity: 0, rotation: -4 },
                { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.5)' }
            );
            gsap.to(banner, {
                scale: 1.15,
                opacity: 0,
                duration: 0.35,
                delay: 1.8,
                ease: 'power2.in',
                onComplete: () => banner.classList.add('hidden')
            });
        } else {
            setTimeout(() => {
                banner.classList.add('hidden');
            }, 2200);
        }
    }

    showCombo(player, hits) {
        const el = document.getElementById(`combo-${player}`);
        if (!el) return;
        el.textContent = `¡${hits} HITS! COMBO`;
        el.classList.remove('hidden');

        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf(el);
            gsap.fromTo(el,
                { scale: 1.7, y: -12, opacity: 1 },
                { scale: 1, y: 0, duration: 0.3, ease: 'elastic.out(1, 0.4)' }
            );
            gsap.to(el, {
                opacity: 0,
                y: -25,
                duration: 0.35,
                delay: 0.9,
                ease: 'power1.in',
                onComplete: () => el.classList.add('hidden')
            });
        } else {
            setTimeout(() => el.classList.add('hidden'), 1200);
        }
    }

    showFatalityPrompt(cmd) {
        document.getElementById('fatality-command').textContent = cmd;
        document.getElementById('fatality-prompt').classList.remove('hidden');
    }

    hideFatalityPrompt() {
        document.getElementById('fatality-prompt').classList.add('hidden');
    }

    updateFatalityTimer(seconds) {
        document.getElementById('fatality-countdown').textContent = seconds;
    }

    openPauseModal(activeFighter) {
        gameEngine.isPaused = true;
        const container = document.getElementById('movelist-detail');
        if (container && activeFighter) {
            const moves = activeFighter.data.moves;
            const combos = activeFighter.data.combos || [];
            
            let comboHtml = combos.map(c => {
                const navCombo = c.input.replace(/J/g, 'Insert').replace(/K/g, 'Inicio').replace(/L/g, 'Fin');
                return `
                <div class="move-row">
                    <span class="move-name">${c.name} (${c.hits} Golp.)</span>
                    <span class="move-input">${navCombo} <small style="opacity:0.7">(${c.input})</small></span>
                </div>`;
            }).join('');

            container.innerHTML = `
                <div class="movelist-title">PODERES & COMBOS DE ${activeFighter.name}</div>
                <div class="move-row">
                    <span class="move-name">Poder 1: ${moves.special1.name}</span>
                    <span class="move-input">Fin <small style="opacity:0.7">o ↓ + Insert</small></span>
                </div>
                <div class="move-row">
                    <span class="move-name">Poder 2: ${moves.special2.name}</span>
                    <span class="move-input">Av Pág <small style="opacity:0.7">o ↓ + Inicio</small></span>
                </div>
                <div class="move-row">
                    <span class="move-name">Poder 3: ${moves.special3.name}</span>
                    <span class="move-input">Despl Bloq / Fin <small style="opacity:0.7">o ↓ + Fin</small></span>
                </div>
                <div class="move-row">
                    <span class="move-name">Ataque Súper: ${moves.super.name}</span>
                    <span class="move-input">Re Pág <small style="opacity:0.7">(Barra 100%)</small></span>
                </div>
                <div class="move-row">
                    <span class="move-name">Cubrirse / Bloqueo:</span>
                    <span class="move-input">Supr <small style="opacity:0.7">(Mantener para -80% daño)</small></span>
                </div>
                <div class="move-row">
                    <span class="move-name">FATALITY: ${moves.fatality.name}</span>
                    <span class="move-input move-fatality">Fin / Re Pág / Supr / Insert</span>
                </div>
                <div class="movelist-title" style="margin-top:12px">COMBOS DE GOLPES</div>
                ${comboHtml}
            `;
        }
        this.screens.pauseModal.classList.remove('hidden');
    }

    closePauseModal() {
        gameEngine.isPaused = false;
        this.screens.pauseModal.classList.add('hidden');
    }

    showVictoryScreen(winner, withFatality = false, isArcadeMode = false) {
        document.getElementById('winner-name').textContent = winner.name;
        document.getElementById('victory-sub').textContent = `"${winner.quote}"`;

        const portraitCanvas = document.getElementById('victory-portrait');
        if (portraitCanvas) {
            pixelRenderer.drawPortrait(portraitCanvas.getContext('2d'), winner.id, 100, 120);
        }

        const fatalityBadge = document.getElementById('fatality-achievement');
        if (withFatality) fatalityBadge.classList.remove('hidden');
        else fatalityBadge.classList.add('hidden');

        const nextBtn = document.getElementById('btn-next-tower-stage');
        if (isArcadeMode && winner === gameEngine.p1 && gameEngine.towerIndex < gameEngine.towerOpponents.length - 1) {
            nextBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.add('hidden');
        }

        this.showScreen('victory');

        if (typeof gsap !== 'undefined') {
            gsap.fromTo('#screen-victory .victory-box', 
                { scale: 0.6, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }
            );
        }
    }
}

const uiController = new UIController();
window.uiController = uiController;
