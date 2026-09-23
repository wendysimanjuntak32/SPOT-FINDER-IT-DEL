/**
 * Math Quest - Web Audio API Synthesizer
 * Generates all SFX and dynamic BGM procedurally without needing external audio files.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.bgmVolume = 0.25;
        this.sfxVolume = 0.45;
        this.currentTrack = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.isMuted) {
            this.stopBGM();
        }
    }

    // --- SFX GENERATORS ---
    playClick() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playCorrect() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // Two ascending bright chimes (C5 -> G5 -> C6)
        const notes = [523.25, 659.25, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (idx * 0.08);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(this.sfxVolume * 0.6, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.25);
        });
    }

    playWrong() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);

        gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playAttack() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // White noise for sword slash + pitch drop
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    playSpell(type = 'lightning') {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        if (type === 'heal') {
            // Magical soothing rising arpeggio
            [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = now + (i * 0.07);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t);
                gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + 0.3);
            });
        } else if (type === 'shield') {
            // Metallic resonating chime
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
            gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'meteor') {
            // Heavy explosion rumble
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
            gain.gain.setValueAtTime(this.sfxVolume * 0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.6);
        } else {
            // Lightning zap
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
            gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    }

    playHurt() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.18);

        gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playMonsterDefeat() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [300, 240, 180, 120, 80];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (idx * 0.07);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(this.sfxVolume * 0.5, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.1);
        });
    }

    playCoin() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        [987.77, 1318.51].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (idx * 0.08);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(this.sfxVolume * 0.6, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.2);
        });
    }

    playLevelUp() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (idx * 0.08);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(this.sfxVolume * 0.7, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.35);
        });
    }

    playVictory() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.35 },
            { f: 587.33, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.60 }
        ];

        let offset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + offset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, start);

            gain.gain.setValueAtTime(this.sfxVolume * 0.7, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + item.d);

            offset += item.d * 0.9;
        });
    }

    // --- PROCEDURAL DYNAMIC BGM SYSTEM ---
    startBGM(track = 'map') {
        if (this.isMuted) return;
        this.init();
        if (this.currentTrack === track && this.bgmPlaying) return;
        
        this.stopBGM();
        this.currentTrack = track;
        this.bgmPlaying = true;

        let step = 0;
        const tempo = track === 'battle' ? 140 : (track === 'boss' ? 160 : 110);
        const intervalMs = (60 / tempo) * 1000 / 2; // 8th note steps

        // Basslines and arpeggios
        const scales = {
            map: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major pentatonic
            battle: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00], // A Minor
            boss: [196.00, 207.65, 233.08, 261.63, 293.66, 311.13] // Dark harmonic
        };

        const currentScale = scales[track] || scales.map;

        this.bgmInterval = setInterval(() => {
            if (!this.bgmPlaying || this.isMuted) return;
            const now = this.ctx.currentTime;

            // Bass note on every 4th step
            if (step % 4 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                const rootFreq = currentScale[0] / 2;

                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(rootFreq, now);

                bassGain.gain.setValueAtTime(this.bgmVolume * 0.35, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                bassOsc.connect(bassGain);
                bassGain.connect(this.ctx.destination);

                bassOsc.start(now);
                bassOsc.stop(now + 0.35);
            }

            // Lead Melody note
            if (Math.random() > 0.3) {
                const noteIdx = Math.floor(Math.random() * currentScale.length);
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();

                leadOsc.type = 'sine';
                leadOsc.frequency.setValueAtTime(currentScale[noteIdx], now);

                leadGain.gain.setValueAtTime(this.bgmVolume * 0.25, now);
                leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                leadOsc.connect(leadGain);
                leadGain.connect(this.ctx.destination);

                leadOsc.start(now);
                leadOsc.stop(now + 0.2);
            }

            step = (step + 1) % 32;
        }, intervalMs);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmPlaying = false;
        this.currentTrack = null;
    }
}

// Global sound singleton
window.sound = new SoundEngine();
