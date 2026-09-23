// Procedural Web Audio API Sound Synthesizer for LifeQuest
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio API tidak didukung:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Play button tap
    playClick() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Quest completed fanfare
    playQuestComplete() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
        });
    }

    // Gold coin sound
    playCoin() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Level up majestic fanfare
    playLevelUp() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.12 }, // G5
            { f: 1046.50, d: 0.20 }, // C6
            { f: 880.00, d: 0.12 }, // A5
            { f: 1046.50, d: 0.45 }  // C6 grand
        ];

        let timeOffset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(item.f, now + timeOffset);

            // Filter for warm brass sound
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1600, now + timeOffset);

            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + item.d);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + item.d + 0.05);
            timeOffset += item.d;
        });
    }

    // Boss damage / hit sound
    playBossHit() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Shop purchase chime
    playPurchase() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        [783.99, 1046.50, 1318.51].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.06);

            gain.gain.setValueAtTime(0.12, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.2);
        });
    }

    // Timer chime (Pomodoro finish)
    playTimerAlarm() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now + i * 0.25);
            gain.gain.setValueAtTime(0.2, now + i * 0.25);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.25);
            osc.stop(now + i * 0.25 + 0.22);
        }
    }
}

window.soundFX = new SoundEffects();
