/**
 * CYBER SURVIVOR: PROTOCOL ZERO - Audio Synthesizer
 * Dynamic Procedural Synthwave BGM + Sci-Fi SFX using Web Audio API
 */

class CyberSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.currentStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play Synthwave Procedural BGM
    startBGM() {
        if (!this.enabled || this.bgmPlaying) return;
        this.init();
        this.bgmPlaying = true;
        this.currentStep = 0;

        // Cyberpunk bassline notes (Frequencies in Hz)
        const bassNotes = [110, 110, 130.81, 110, 146.83, 110, 130.81, 98.00]; // A2, C3, D3, G2
        const melodyNotes = [220, 0, 261.63, 293.66, 329.63, 0, 261.63, 196];

        const tempoMs = 150; // ~100 BPM 16th notes

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;
            const step = this.currentStep % bassNotes.length;

            // 1. Synth Bass Note
            const bassFreq = bassNotes[step];
            if (bassFreq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(bassFreq, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.15);
            }

            // 2. High Cyber Pulse Melody (Every other step)
            const melFreq = melodyNotes[step];
            if (melFreq > 0 && Math.random() > 0.3) {
                const mOsc = this.ctx.createOscillator();
                const mGain = this.ctx.createGain();

                mOsc.type = 'square';
                mOsc.frequency.setValueAtTime(melFreq, now);

                mGain.gain.setValueAtTime(0.04, now);
                mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                mOsc.connect(mGain);
                mGain.connect(this.ctx.destination);

                mOsc.start(now);
                mOsc.stop(now + 0.2);
            }

            this.currentStep++;
        }, tempoMs);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // Sound FX: Katana Slash
    playSlash() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    // Sound FX: Laser Shot
    playLaser() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    // Sound FX: Rocket Launch
    playRocket() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(420, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Sound FX: Explosion
    playExplosion() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Sound FX: XP Gem Pickup
    playGemPickup() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const freqs = [880, 1046.5, 1318.51, 1567.98];
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Sound FX: Level Up Fanfare
    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.5]; // C E G C

        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.2, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.4);
        });
    }

    // Sound FX: Boss Warning Siren
    playBossSiren() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now + i * 0.35);
            osc.frequency.linearRampToValueAtTime(640, now + i * 0.35 + 0.18);
            osc.frequency.linearRampToValueAtTime(320, now + i * 0.35 + 0.32);

            gain.gain.setValueAtTime(0.25, now + i * 0.35);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.35 + 0.33);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.35);
            osc.stop(now + i * 0.35 + 0.34);
        }
    }
}

window.CyberSoundEngine = CyberSoundEngine;
