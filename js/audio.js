/* TORNEO ARGENTO 16-BIT - AUDIO ENGINE (TONE.JS ROCK NACIONAL CHIPTUNE SYNTHESIZER) */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.currentSong = null;
        this.bgmTimer = null;
        this.stepIndex = 0;
        this.tempo = 130;
        this.isInitialized = false;
        this.toneStarted = false;
        this.hasToneSynths = false;

        // Note Frequency Table (Hz)
        this.N = {
            REST: 0,
            A1: 55.00, As1: 58.27, B1: 61.74,
            C2: 65.41, Cs2: 69.30, D2: 73.42, Ds2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Gs2: 103.83, A2: 110.00, As2: 116.54, B2: 123.47,
            C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, As3: 233.08, B3: 246.94,
            C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
            C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, As5: 932.33, B5: 987.77,
            C6: 1046.50, D6: 1174.66, E6: 1318.51
        };

        this.songs = this.initSongLibrary();
        this.initToneSynths();
    }

    // Initialize Tone.js synthesizers and audio chain
    initToneSynths() {
        if (typeof Tone === 'undefined') {
            console.log("[AudioEngine] Tone.js not detected, using Web Audio fallback");
            return;
        }

        try {
            // 1. Lead Guitar / Solo Synth
            this.toneLead = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.45, release: 0.1 }
            });
            this.toneDistortion = new Tone.Distortion(0.18);
            this.toneLeadVol = new Tone.Volume(-6);
            this.toneLead.chain(this.toneDistortion, this.toneLeadVol, Tone.Destination);

            // 2. Harmony / Backing Chords Synth
            this.toneHarm = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.25, sustain: 0.35, release: 0.15 }
            });
            this.toneHarmVol = new Tone.Volume(-9);
            this.toneHarm.chain(this.toneHarmVol, Tone.Destination);

            // 3. Bass Guitar Synth (16-bit FM / Mega Drive style low-end)
            this.toneBass = new Tone.MonoSynth({
                oscillator: { type: 'square' },
                filter: { Q: 2.5, type: 'lowpass', rollover: -24 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.35, release: 0.15 },
                filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.25, release: 0.2, baseFrequency: 70, octaves: 2.5 }
            });
            this.toneBassVol = new Tone.Volume(-3);
            this.toneBass.chain(this.toneBassVol, Tone.Destination);

            // 4. Drums - Kick (deep punchy arcade bass drum)
            this.toneKick = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 5,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.18 }
            });
            this.toneKickVol = new Tone.Volume(-2);
            this.toneKick.chain(this.toneKickVol, Tone.Destination);

            // 5. Drums - Snare (crisp chiptune noise crack)
            this.toneSnare = new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.12, sustain: 0 }
            });
            this.toneSnareVol = new Tone.Volume(-7);
            this.toneSnare.chain(this.toneSnareVol, Tone.Destination);

            // 6. Drums - Hi-Hat (metallic arcade sizzle)
            this.toneHat = new Tone.MetalSynth({
                frequency: 280,
                envelope: { attack: 0.001, decay: 0.04, release: 0.02 },
                harmonicity: 5.1,
                modulationIndex: 28,
                resonance: 3800,
                octaves: 1.2
            });
            this.toneHatVol = new Tone.Volume(-17);
            this.toneHat.chain(this.toneHatVol, Tone.Destination);

            // 7. SFX - Hit Synth
            this.toneHitSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square' },
                envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.04 }
            });
            this.toneHitVol = new Tone.Volume(-2);
            this.toneHitSynth.chain(this.toneHitVol, Tone.Destination);

            // 8. SFX - Special Synth
            this.toneSpecialSynth = new Tone.Synth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.005, decay: 0.22, sustain: 0.1, release: 0.1 }
            });
            this.toneSpecialVol = new Tone.Volume(-4);
            this.toneSpecialSynth.chain(this.toneSpecialVol, Tone.Destination);

            // 9. SFX - Menu UI Synth
            this.toneMenuSynth = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.04 }
            });
            this.toneMenuVol = new Tone.Volume(-6);
            this.toneMenuSynth.chain(this.toneMenuVol, Tone.Destination);

            this.hasToneSynths = true;
            console.log("[AudioEngine] Tone.js synthesizers initialized successfully!");
        } catch (err) {
            console.warn("[AudioEngine] Failed to initialize Tone.js synths:", err);
            this.hasToneSynths = false;
        }
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
            this.isInitialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported:", e);
        }
    }

    isToneActive() {
        return this.hasToneSynths && typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running';
    }

    async resumeAudio() {
        if (typeof Tone !== 'undefined') {
            try {
                if (Tone.context && Tone.context.state !== 'running') {
                    await Tone.start();
                }
                this.toneStarted = true;
                if (!this.hasToneSynths) this.initToneSynths();
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (e) {}
        }
    }

    ensureContext() {
        this.resumeAudio();
    }

    // Play retro synthesized tone (fallback)
    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.2, dest = null) {
        if (!this.sfxEnabled || freq <= 0) return;
        this.ensureContext();

        if (this.isToneActive() && this.toneHitSynth) {
            try {
                this.toneHitSynth.triggerAttackRelease(freq, duration);
                return;
            } catch (e) {}
        }

        if (!this.ctx || this.ctx.state !== 'running') return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(dest || this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // Noise Generator (fallback)
    playNoise(duration = 0.15, gainVal = 0.25, isSnare = false) {
        if (!this.sfxEnabled) return;
        this.ensureContext();

        if (this.isToneActive() && this.toneSnare) {
            try {
                this.toneSnare.triggerAttackRelease(duration);
                return;
            } catch (e) {}
        }

        if (!this.ctx || this.ctx.state !== 'running') return;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = isSnare ? 'bandpass' : 'lowpass';
            filter.frequency.setValueAtTime(isSnare ? 1200 : 800, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(isSnare ? 200 : 50, this.ctx.currentTime + duration);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            whiteNoise.start();
            whiteNoise.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // --- SFX PRESETS ---
    playLightHit() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                this.toneHitSynth.triggerAttackRelease(320, 0.07);
                this.toneSnare.triggerAttackRelease(0.04);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(320, 'square', 0.08, 0.22);
            this.playNoise(0.04, 0.15);
        }
    }

    playHeavyHit() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                this.toneHitSynth.triggerAttackRelease(140, 0.16);
                this.toneKick.triggerAttackRelease("D1", 0.18);
                this.toneSnare.triggerAttackRelease(0.12);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(140, 'sawtooth', 0.16, 0.35);
            this.playNoise(0.18, 0.35);
        }
    }

    playBlock() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                this.toneHitSynth.triggerAttackRelease(440, 0.05);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(440, 'triangle', 0.05, 0.25);
        }
    }

    playJump() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                const now = Tone.now();
                this.toneSpecialSynth.frequency.setValueAtTime(160, now);
                this.toneSpecialSynth.frequency.exponentialRampToValueAtTime(640, now + 0.12);
                this.toneSpecialSynth.triggerAttackRelease(160, 0.12, now);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(300, 'square', 0.1);
        }
    }

    playSpecialMove() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                const now = Tone.now();
                this.toneSpecialSynth.frequency.setValueAtTime(220, now);
                this.toneSpecialSynth.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
                this.toneSpecialSynth.triggerAttackRelease(220, 0.22, now);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(700, 'sawtooth', 0.2);
        }
    }

    playLaser() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                const now = Tone.now();
                this.toneSpecialSynth.frequency.setValueAtTime(950, now);
                this.toneSpecialSynth.frequency.exponentialRampToValueAtTime(80, now + 0.28);
                this.toneSpecialSynth.triggerAttackRelease(950, 0.28, now);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playTone(850, 'sawtooth', 0.25);
        }
    }

    playFatalitySound() {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (this.isToneActive()) {
            try {
                this.toneKick.triggerAttackRelease("C1", 0.6);
                this.toneSnare.triggerAttackRelease(0.5);
                this.toneBass.triggerAttackRelease(55, 0.9);
                return;
            } catch (e) {}
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.playNoise(0.6, 0.6);
            this.playTone(70, 'sawtooth', 0.9, 0.5);
        }
    }

    playMenuSelect() {
        if (!this.sfxEnabled) return;
        const play = () => {
            if (this.isToneActive() && this.toneMenuSynth) {
                try {
                    this.toneMenuSynth.triggerAttackRelease(523.25, 0.08); // C5
                    return;
                } catch (e) {}
            }
            if (this.ctx && this.ctx.state === 'running') {
                this.playTone(523.25, 'square', 0.08, 0.18);
            }
        };

        if (this.isToneActive() || (this.ctx && this.ctx.state === 'running')) {
            play();
        } else {
            this.resumeAudio().then(() => play());
        }
    }

    playMenuConfirm() {
        if (!this.sfxEnabled) return;
        const play = () => {
            if (this.isToneActive() && this.toneMenuSynth) {
                try {
                    this.toneMenuSynth.triggerAttackRelease(659.25, 0.08); // E5
                    setTimeout(() => {
                        if (this.sfxEnabled && this.isToneActive() && this.toneMenuSynth) {
                            try {
                                this.toneMenuSynth.triggerAttackRelease(783.99, 0.12); // G5
                            } catch (e) {}
                        }
                    }, 60);
                    return;
                } catch (e) {}
            }
            if (this.ctx && this.ctx.state === 'running') {
                this.playTone(659.25, 'square', 0.08, 0.18);
                setTimeout(() => this.playTone(783.99, 'square', 0.12, 0.22), 60);
            }
        };

        if (this.isToneActive() || (this.ctx && this.ctx.state === 'running')) {
            play();
        } else {
            this.resumeAudio().then(() => play());
        }
    }

    playAnnouncer(text) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        const textUpper = text.toUpperCase();
        if (textUpper.includes("ROUND 1") || textUpper.includes("RONDA 1")) {
            this.playTone(180, 'sawtooth', 0.22, 0.35);
            setTimeout(() => this.playTone(320, 'sawtooth', 0.18, 0.35), 180);
        } else if (textUpper.includes("FIGHT") || textUpper.includes("PELEAR")) {
            this.playTone(400, 'square', 0.14, 0.45);
            setTimeout(() => this.playTone(620, 'sawtooth', 0.28, 0.5), 100);
        } else if (textUpper.includes("LIQUIDÁLO") || textUpper.includes("FINISH")) {
            this.playTone(110, 'sawtooth', 0.4, 0.5);
            this.playNoise(0.3, 0.35);
        } else if (textUpper.includes("FATALITY")) {
            this.playFatalitySound();
        } else if (textUpper.includes("VICTORIA") || textUpper.includes("WIN")) {
            this.playTone(523, 'triangle', 0.14, 0.28);
            setTimeout(() => this.playTone(659, 'triangle', 0.14, 0.28), 140);
            setTimeout(() => this.playTone(783, 'triangle', 0.28, 0.38), 280);
        }
    }

    // --- ROCK NACIONAL 16/32-BIT SONG LIBRARY (YOUTUBE STUDIO ACCURATE REPRODUCTIONS) ---
    initSongLibrary() {
        const N = this.N;
        return {
            // 1. LA LEYENDA DEL HADA Y EL MAGO - Rata Blanca (Walter Giardino / Magos, Espadas y Rosas 1990)
            // Original Studio Key: E minor (Em - D - C - B7) at 168 BPM
            hadaelmago: {
                title: 'La Leyenda del Hada y El Mago (Rata Blanca)',
                genre: 'metal',
                tempo: 168,
                leadType: 'sawtooth',
                lead: [
                    // Walter Giardino's exact intro neoclassical arpeggios in Em
                    // Bar 1: Em
                    N.E4, N.G4, N.B4, N.E5, N.B4, N.G4, N.E4, N.B3,
                    // Bar 2: D
                    N.D4, N.Fs4, N.A4, N.D5, N.A4, N.Fs4, N.D4, N.A3,
                    // Bar 3: C
                    N.C4, N.E4, N.G4, N.C5, N.G4, N.E4, N.C4, N.G3,
                    // Bar 4: B7
                    N.B3, N.Ds4, N.Fs4, N.B4, N.A4, N.Fs4, N.Ds4, N.B3,
                    // Bar 5: E harmonic minor fast scale run
                    N.E5, N.Ds5, N.E5, N.Fs5, N.G5, N.Fs5, N.E5, N.Ds5,
                    N.E5, N.C5, N.B4, N.A4, N.G4, N.Fs4, N.E4, N.Ds4,
                    // Bar 6-8: Chorus Vocal Melody ("Enamorados para siempre, el mago y el hada del amor...")
                    N.E4, N.E4, N.G4, N.Fs4, N.E4, N.D4, N.E4, N.REST,
                    N.B4, N.A4, N.G4, N.Fs4, N.G4, N.E4, N.REST, N.REST,
                    N.E4, N.E4, N.G4, N.A4, N.B4, N.A4, N.G4, N.Fs4,
                    N.G4, N.Fs4, N.E4, N.Ds4, N.E4, N.REST, N.REST, N.REST
                ],
                harmony: [
                    // Heavy metal power chords Em5 - D5 - C5 - B5
                    N.G3, N.B3, N.E4, N.G4, N.E4, N.B3, N.G3, N.Fs3,
                    N.Fs3, N.A3, N.D4, N.Fs4, N.D4, N.A3, N.Fs3, N.E3,
                    N.E3, N.G3, N.C4, N.E4, N.C4, N.G3, N.E3, N.Ds3,
                    N.Ds3, N.Fs3, N.B3, N.Ds4, N.B3, N.Fs3, N.Ds3, N.Fs3,
                    N.E3, N.G3, N.B3, N.E4, N.E4, N.B3, N.G3, N.E3,
                    N.G3, N.B3, N.E4, N.G4, N.E4, N.B3, N.G3, N.REST,
                    N.G3, N.B3, N.E4, N.B3, N.A3, N.C4, N.E4, N.REST,
                    N.B3, N.Ds4, N.Fs4, N.Ds4, N.E4, N.REST, N.REST, N.REST
                ],
                bass: [
                    // Galloping 16th-note heavy metal double-kick bass
                    N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2,
                    N.D2, N.D2, N.D2, N.D2, N.D2, N.D2, N.D2, N.D2,
                    N.C2, N.C2, N.C2, N.C2, N.C2, N.C2, N.C2, N.C2,
                    N.B1, N.B1, N.B1, N.B1, N.B1, N.B1, N.B1, N.B1,
                    N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2,
                    N.E2, N.E2, N.E2, N.E2, N.D2, N.D2, N.D2, N.D2,
                    N.C2, N.C2, N.C2, N.C2, N.B1, N.B1, N.B1, N.B1,
                    N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2, N.E2
                ]
            },

            // 2. DE MÚSICA LIGERA - Soda Stereo (Canción Animal 1990)
            // Original Studio Key: B minor (Bm - G - D - A) at 132 BPM
            demusicaligera: {
                title: 'De Música Ligera (Soda Stereo)',
                genre: 'rock',
                tempo: 132,
                leadType: 'sawtooth',
                lead: [
                    // Gustavo Cerati's syncopated strumming riff
                    // Bm
                    N.B3, N.B3, N.D4, N.D4, N.Cs4, N.Cs4, N.B3, N.Fs3,
                    // G
                    N.G3, N.G3, N.B3, N.B3, N.A3, N.A3, N.G3, N.D3,
                    // D
                    N.D4, N.D4, N.Fs4, N.Fs4, N.E4, N.E4, N.D4, N.A3,
                    // A
                    N.A3, N.A3, N.Cs4, N.Cs4, N.B3, N.B3, N.A3, N.Fs3,
                    // Chorus: "Ella durmió al calor de las masas... y yo desperté queriendo soñarla..."
                    N.Fs4, N.Fs4, N.Fs4, N.G4, N.Fs4, N.E4, N.D4, N.E4,
                    N.Fs4, N.Fs4, N.E4, N.D4, N.B3, N.D4, N.E4, N.REST,
                    // "De aquel amor... de música ligera..."
                    N.D4, N.D4, N.D4, N.E4, N.D4, N.Cs4, N.B3, N.A3,
                    // "¡Nada más queda!... ¡Nada más queda!..."
                    N.B3, N.D4, N.B3, N.REST, N.B3, N.D4, N.B3, N.REST
                ],
                harmony: [
                    // Warm chorused backing rhythm
                    N.Fs3, N.Fs3, N.Fs3, N.Fs3, N.Fs3, N.Fs3, N.Fs3, N.Fs3,
                    N.D3, N.D3, N.D3, N.D3, N.D3, N.D3, N.D3, N.D3,
                    N.A3, N.A3, N.A3, N.A3, N.A3, N.A3, N.A3, N.A3,
                    N.E3, N.E3, N.E3, N.E3, N.E3, N.E3, N.E3, N.E3,
                    N.D4, N.D4, N.D4, N.D4, N.B3, N.B3, N.B3, N.B3,
                    N.D4, N.D4, N.B3, N.A3, N.G3, N.G3, N.A3, N.REST,
                    N.Fs3, N.Fs3, N.Fs3, N.G3, N.Fs3, N.E3, N.D3, N.Cs3,
                    N.D3, N.Fs3, N.D3, N.REST, N.D3, N.Fs3, N.D3, N.REST
                ],
                bass: [
                    // Zeta Bosio's punchy eighth-note bassline
                    N.B2, N.B2, N.B2, N.B2, N.G2, N.G2, N.G2, N.G2,
                    N.D3, N.D3, N.D3, N.D3, N.A2, N.A2, N.A2, N.A2,
                    N.B2, N.B2, N.B2, N.B2, N.G2, N.G2, N.G2, N.G2,
                    N.D3, N.D3, N.D3, N.D3, N.A2, N.A2, N.A2, N.A2
                ]
            },

            // 3. HOMERO - Viejas Locas (Especial 1999)
            // Original Studio Key: E major (E5 - G#5 - A5 - F#5) at 126 BPM
            homero: {
                title: 'Homero (Viejas Locas)',
                genre: 'blues',
                tempo: 126,
                leadType: 'square',
                lead: [
                    // Pity's authentic intro riff with 2h4-2-0 hammer-on
                    N.E3, N.B3, N.E4, N.Gs3, N.Ds4, N.Gs4, N.A3, N.E4,
                    N.A4, N.Fs3, N.Cs4, N.Fs4, N.Fs3, N.Gs3, N.Fs3, N.E3,
                    N.E3, N.B3, N.E4, N.Gs3, N.Ds4, N.Gs4, N.A3, N.E4,
                    N.A4, N.Fs3, N.Cs4, N.Fs4, N.Fs3, N.Gs3, N.Fs3, N.E3,
                    // Vocal melody: "Cuando sale del trabajo... Homero viene pensando..."
                    N.E4, N.E4, N.E4, N.D4, N.B3, N.A3, N.Gs3, N.E3,
                    N.E3, N.Gs3, N.A3, N.Gs3, N.E3, N.REST, N.E4, N.D4,
                    // "Que al bajar del colectivo lo espera una linda noche..."
                    N.B3, N.B3, N.A3, N.Gs3, N.E3, N.REST, N.E3, N.REST,
                    N.E4, N.E4, N.E4, N.D4, N.B3, N.Gs3, N.B3, N.E4
                ],
                harmony: [
                    // Power chords E5 - G#5 - A5 - F#5
                    N.B2, N.B2, N.B2, N.B2, N.Ds3, N.Ds3, N.Ds3, N.Ds3,
                    N.E3, N.E3, N.E3, N.E3, N.Cs3, N.Cs3, N.Cs3, N.Cs3,
                    N.B2, N.B2, N.B2, N.B2, N.Ds3, N.Ds3, N.Ds3, N.Ds3,
                    N.E3, N.E3, N.E3, N.E3, N.Cs3, N.Cs3, N.Cs3, N.Cs3,
                    N.B2, N.B2, N.B2, N.B2, N.Ds3, N.Ds3, N.Ds3, N.Ds3,
                    N.E3, N.E3, N.E3, N.E3, N.B2, N.B2, N.B2, N.B2
                ],
                bass: [
                    // Rolling boogie-woogie bassline
                    N.E2, N.E2, N.E2, N.E2, N.Gs2, N.Gs2, N.Gs2, N.Gs2,
                    N.A2, N.A2, N.A2, N.A2, N.Fs2, N.Fs2, N.Fs2, N.E2,
                    N.E2, N.E2, N.E2, N.E2, N.Gs2, N.Gs2, N.Gs2, N.Gs2,
                    N.A2, N.A2, N.A2, N.A2, N.Fs2, N.Fs2, N.Fs2, N.E2
                ]
            },

            // 4. HACELO POR MÍ - Attaque 77 (El Cielo Puede Esperar 1990)
            // Original Studio Key: E major (E - C#m - A - B) at 174 BPM
            hacelopormi: {
                title: 'Hacelo por Mí (Attaque 77)',
                genre: 'punk',
                tempo: 174,
                leadType: 'sawtooth',
                lead: [
                    // Ciro Pertusi's iconic opening guitar lick
                    // Over E:
                    N.E4, N.E4, N.Gs4, N.Fs4, N.Gs4, N.Gs4, N.Fs4, N.E4,
                    // Over C#m:
                    N.Cs4, N.Cs4, N.E4, N.Ds4, N.E4, N.E4, N.Ds4, N.Cs4,
                    // Over A:
                    N.A3, N.A3, N.Cs4, N.B3, N.Cs4, N.Cs4, N.B3, N.A3,
                    // Over B:
                    N.B3, N.B3, N.Ds4, N.Cs4, N.Ds4, N.Ds4, N.Cs4, N.B3,
                    // Chorus: "¡Hacelo por mí! ¡Hacelo por mí!..."
                    N.Gs4, N.Fs4, N.E4, N.Gs4, N.Fs4, N.E4, N.Ds4, N.E4,
                    N.REST, N.Gs4, N.Fs4, N.E4, N.Gs4, N.Fs4, N.E4, N.Ds4,
                    // "Yo no quiero que te vayas..."
                    N.E4, N.Gs4, N.A4, N.B4, N.A4, N.Gs4, N.Fs4, N.E4,
                    N.Ds4, N.E4, N.REST, N.REST, N.B4, N.A4, N.Gs4, N.E4
                ],
                harmony: [
                    // Fast punk rock power chords E5 - C#5 - A5 - B5
                    N.B3, N.B3, N.B3, N.B3, N.Gs3, N.Gs3, N.Gs3, N.Gs3,
                    N.E3, N.E3, N.E3, N.E3, N.Fs3, N.Fs3, N.Fs3, N.Fs3,
                    N.B3, N.B3, N.B3, N.B3, N.Gs3, N.Gs3, N.Gs3, N.Gs3,
                    N.E3, N.E3, N.E3, N.E3, N.Fs3, N.Fs3, N.Fs3, N.Fs3,
                    N.B3, N.B3, N.B3, N.B3, N.Gs3, N.Gs3, N.Gs3, N.Gs3,
                    N.E3, N.E3, N.E3, N.E3, N.Fs3, N.Fs3, N.Fs3, N.Fs3
                ],
                bass: [
                    // Driving punk octave bass E - C# - A - B
                    N.E2, N.E2, N.E2, N.E2, N.Cs2, N.Cs2, N.Cs2, N.Cs2,
                    N.A1, N.A1, N.A1, N.A1, N.B1, N.B1, N.B1, N.B1,
                    N.E2, N.E2, N.E2, N.E2, N.Cs2, N.Cs2, N.Cs2, N.Cs2,
                    N.A1, N.A1, N.A1, N.A1, N.B1, N.B1, N.B1, N.B1
                ]
            },

            // 5. FANKY - Charly García (Cómo Conseguir Chicas 1989)
            // Original Studio Key: E minor / E9 funk at 120 BPM
            fanky: {
                title: 'Fanky (Charly García)',
                genre: 'funk',
                tempo: 120,
                leadType: 'square',
                lead: [
                    // Brass Stabs
                    N.B4, N.D5, N.E5, N.REST, N.A4, N.C5, N.E5, N.REST,
                    N.G4, N.B4, N.D5, N.REST, N.E4, N.G4, N.B4, N.REST,
                    // Vocal hook: "Gozar... es tan necesario para conseguir..."
                    N.REST, N.E4, N.E4, N.G4, N.E4, N.D4, N.E4, N.REST,
                    N.G4, N.G4, N.A4, N.G4, N.E4, N.REST, N.D4, N.E4,
                    // "Gozar... liberar las trampas de la soledad..."
                    N.REST, N.E4, N.G4, N.A4, N.B4, N.A4, N.G4, N.E4,
                    N.D4, N.E4, N.REST, N.G4, N.E4, N.D4, N.E4, N.REST
                ],
                harmony: [
                    // 80s Synth Funk chords
                    N.G3, N.B3, N.E4, N.G3, N.B3, N.E4, N.REST, N.REST,
                    N.A3, N.C4, N.E4, N.A3, N.C4, N.E4, N.REST, N.REST,
                    N.B3, N.D4, N.Fs4, N.B3, N.D4, N.Fs4, N.REST, N.REST,
                    N.A3, N.C4, N.E4, N.G3, N.B3, N.E4, N.REST, N.REST
                ],
                bass: [
                    // Fernando Lupano's authentic slap bass groove
                    N.E2, N.REST, N.E2, N.G2, N.Gs2, N.A2, N.C3, N.A2,
                    N.E2, N.REST, N.E2, N.D3, N.E3, N.REST, N.E2, N.REST
                ]
            },

            // 6. LA BALADA DEL DIABLO Y LA MUERTE - La Renga (Despedazado por Mil Partes 1996)
            // Original Studio Key: E minor (Em - G - D - A) at 88 BPM
            labalada: {
                title: 'La Balada del Diablo y la Muerte (La Renga)',
                genre: 'blues',
                tempo: 88,
                leadType: 'sawtooth',
                lead: [
                    // Authentic open-string fingerpicked intro arpeggio
                    // Em
                    N.E3, N.B3, N.G4, N.E4, N.G4, N.B3,
                    // G
                    N.G3, N.D4, N.B4, N.G4, N.B4, N.D4,
                    // D
                    N.D3, N.A3, N.Fs4, N.D4, N.Fs4, N.A3,
                    // A
                    N.A2, N.E3, N.Cs4, N.A3, N.Cs4, N.E3,
                    // Chizzo's singing blues solo ("Estaba el diablo mal parado en la esquina de mi barrio...")
                    N.E4, N.E4, N.G4, N.Fs4, N.E4, N.D4, N.E4, N.REST,
                    N.G4, N.A4, N.B4, N.A4, N.G4, N.Fs4, N.E4, N.REST,
                    N.B4, N.B4, N.D5, N.B4, N.A4, N.G4, N.Fs4, N.E4,
                    N.G4, N.Fs4, N.E4, N.D4, N.E4, N.REST, N.REST, N.REST
                ],
                harmony: [
                    // Em - G - D - A acoustic strum
                    N.G3, N.B3, N.E4, N.G4, N.B3, N.D4, N.G4, N.B4,
                    N.Fs3, N.A3, N.D4, N.Fs4, N.E3, N.A3, N.Cs4, N.E4,
                    N.G3, N.B3, N.E4, N.G4, N.B3, N.D4, N.G4, N.B4,
                    N.Fs3, N.A3, N.D4, N.Fs4, N.E3, N.A3, N.Cs4, N.E4
                ],
                bass: [
                    // Deep heavy blues bass Em - G - D - A
                    N.E2, N.E2, N.E2, N.E2, N.G2, N.G2, N.G2, N.G2,
                    N.D2, N.D2, N.D2, N.D2, N.A1, N.A1, N.A1, N.A1,
                    N.E2, N.E2, N.E2, N.E2, N.G2, N.G2, N.G2, N.G2,
                    N.D2, N.D2, N.D2, N.D2, N.A1, N.A1, N.A1, N.A1
                ]
            }
        };
    }

    // --- BGM SEQUENCER (POWERED BY TONE.JS) ---
    startBgm(songKey = 'demusicaligera') {
        this.stopBgm();
        if (!this.musicEnabled) return;
        this.ensureContext();

        // Resolve aliases
        if (songKey === 'menu') songKey = 'demusicaligera';
        if (songKey === 'boss') songKey = 'hadaelmago';
        if (songKey === 'victory') songKey = 'demusicaligera';
        if (songKey === 'fight') songKey = 'hacelopormi';

        const song = this.songs[songKey] || this.songs.demusicaligera;
        this.currentSong = songKey;
        this.stepIndex = 0;
        this.tempo = song.tempo || 130;

        const leadNotes = song.lead;
        const harmNotes = song.harmony || [];
        const bassNotes = song.bass;
        const leadType = song.leadType || 'sawtooth';
        const genre = song.genre || 'rock';

        // 16th-note step interval (ms)
        const stepTime = 60000 / (this.tempo * 4);
        const stepSeconds = stepTime / 1000;

        this.bgmTimer = setInterval(() => {
            if (!this.musicEnabled) return;

            const step = this.stepIndex;
            const leadFreq = leadNotes[step % leadNotes.length];
            const bassFreq = bassNotes[Math.floor(step / 2) % bassNotes.length];

            const isToneActive = this.hasToneSynths && typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'running';

            if (isToneActive) {
                // --- TONE.JS HIGH FIDELITY SYNTH SEQUENCER ---
                try {
                    // 1. Lead Guitar / Melody
                    if (leadFreq && leadFreq > 0) {
                        this.toneLead.triggerAttackRelease(leadFreq, stepSeconds * 0.88);
                    }

                    // 2. Harmony / Rhythm Guitar (every 2nd 16th-note)
                    if (harmNotes.length > 0 && step % 2 === 0) {
                        const harmFreq = harmNotes[Math.floor(step / 2) % harmNotes.length];
                        if (harmFreq && harmFreq > 0) {
                            this.toneHarm.triggerAttackRelease(harmFreq, stepSeconds * 1.75);
                        }
                    }

                    // 3. Bass Guitar (every 2nd 16th-note)
                    if (step % 2 === 0 && bassFreq && bassFreq > 0) {
                        this.toneBass.triggerAttackRelease(bassFreq, stepSeconds * 1.65);
                    }

                    // 4. Authentic Drums Adapted by Genre
                    if (genre === 'metal') {
                        // Double-bass drum gallop for Rata Blanca
                        if (step % 4 === 0 || step % 8 === 2) {
                            this.toneKick.triggerAttackRelease("C1", 0.08);
                        }
                        if (step % 8 === 4) {
                            this.toneSnare.triggerAttackRelease(0.09);
                        } else if (step % 2 === 0) {
                            this.toneHat.triggerAttackRelease(0.025);
                        }
                    } else if (genre === 'punk') {
                        // Fast 2/4 double-time skate-punk for Attaque 77
                        if (step % 4 === 0) {
                            this.toneKick.triggerAttackRelease("C1", 0.07);
                        } else if (step % 4 === 2) {
                            this.toneSnare.triggerAttackRelease(0.08);
                        }
                        if (step % 2 === 0) {
                            this.toneHat.triggerAttackRelease(0.03);
                        }
                    } else if (genre === 'funk') {
                        // Funky backbeat with syncopations for Charly García
                        if (step % 16 === 0 || step % 16 === 6 || step % 16 === 10) {
                            this.toneKick.triggerAttackRelease("C1", 0.09);
                        }
                        if (step % 8 === 4) {
                            this.toneSnare.triggerAttackRelease(0.08);
                        }
                        if (step % 2 === 0) {
                            this.toneHat.triggerAttackRelease(0.02);
                        }
                    } else {
                        // Classic driving rock groove for Soda Stereo, Viejas Locas, La Renga
                        if (step % 8 === 0) {
                            this.toneKick.triggerAttackRelease("C1", 0.1);
                        } else if (step % 8 === 4) {
                            this.toneSnare.triggerAttackRelease(0.09);
                        } else if (step % 2 === 0) {
                            this.toneHat.triggerAttackRelease(0.025);
                        }
                    }
                } catch (e) {
                    // Silent fallback if interrupted
                }
            } else if (this.ctx && this.ctx.state === 'running') {
                // --- FALLBACK WEB AUDIO OSCILLATOR SEQUENCER ---
                if (leadFreq && leadFreq > 0) {
                    this.playTone(leadFreq, leadType, stepSeconds * 0.9, 0.12);
                }
                if (harmNotes.length > 0 && step % 2 === 0) {
                    const harmFreq = harmNotes[Math.floor(step / 2) % harmNotes.length];
                    if (harmFreq && harmFreq > 0) {
                        this.playTone(harmFreq, 'triangle', stepSeconds * 1.8, 0.08);
                    }
                }
                if (step % 2 === 0 && bassFreq && bassFreq > 0) {
                    this.playTone(bassFreq, 'triangle', stepSeconds * 1.7, 0.16);
                }
                if (step % 8 === 0) {
                    this.playTone(70, 'triangle', 0.08, 0.22);
                    this.playNoise(0.04, 0.15, false);
                } else if (step % 8 === 4) {
                    this.playNoise(0.08, 0.18, true);
                    this.playTone(180, 'square', 0.05, 0.1);
                } else if (step % 2 === 0) {
                    this.playNoise(0.02, 0.06, false);
                }
            }

            this.stepIndex++;
        }, stepTime);
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        if (this.hasToneSynths) {
            try {
                if (this.toneLead) this.toneLead.releaseAll();
                if (this.toneHarm) this.toneHarm.releaseAll();
            } catch (e) {}
        }
        this.currentSong = null;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopBgm();
        } else if (this.currentSong) {
            this.startBgm(this.currentSong);
        } else {
            this.startBgm('demusicaligera');
        }
        return this.musicEnabled;
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
}

const audioEngine = new SoundEngine();
window.audioEngine = audioEngine;
