/**
 * MLBB WEB - Complete Sound Synthesizer & Voice Announcer
 * Synthesizes classic Mobile Legends SFX & Voice Announcer using Web Audio API & Speech Synthesis
 */

class MLBBSoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.voiceAnnouncer = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play Sword Slash
    playSlash() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Play Ranged Cannon / Laser Shot (Layla)
    playLaser() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
    }

    // Play Thunder Blast (Eudora)
    playThunder() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
    }

    // Play Heal (Estes)
    playHeal() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.05);

            gain.gain.setValueAtTime(0.15, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.3);
        });
    }

    // Play Item Purchase (Gold Chime)
    playBuyItem() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        [987.77, 1318.51].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.08);

            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
        });
    }

    // Play Level Up Fanfare
    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        [440, 554.37, 659.25, 880].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.07);

            gain.gain.setValueAtTime(0.2, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.35);
        });
    }

    // Play Lord Roar
    playLordRoar() {
        if (!this.enabled || !this.ctx) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
    }

    // Voice Announcer System
    announce(text, priority = false) {
        if (!this.voiceAnnouncer || !('speechSynthesis' in window)) return;
        try {
            if (priority) {
                window.speechSynthesis.cancel();
            }
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1.05;
            utter.pitch = 0.95;
            utter.lang = 'en-US';
            window.speechSynthesis.speak(utter);
        } catch (e) {
            console.warn('Announcer error:', e);
        }
    }
}

window.MLBBSoundEngine = MLBBSoundEngine;
