/**
 * KataMaster - Audio Engine
 * Menggunakan Web Audio API (prosedural, tanpa aset eksternal) dan Web Speech API (TTS)
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.speechEnabled = true;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        } catch (e) {
            console.warn("Web Audio API not supported:", e);
        }
    }

    ensureContext() {
        if (!this.ctx) {
            this.initAudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    setSpeechEnabled(enabled) {
        this.speechEnabled = enabled;
    }

    // Suara klik / pop saat memilih kata
    playPop(pitch = 1) {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const baseFreq = 420 * pitch;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Suara kembali / un-pop saat membatalkan kata
    playReturn() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Suara Benar (Duolingo chime: arpeggio cerah C5 -> E5 -> G5 -> C6)
    playCorrect() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0.0, d: 0.12 }, // C5
            { f: 659.25, t: 0.08, d: 0.12 }, // E5
            { f: 783.99, t: 0.16, d: 0.14 }, // G5
            { f: 1046.50, t: 0.24, d: 0.35 } // C6
        ];

        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0.0, now + note.t);
            gain.gain.linearRampToValueAtTime(0.28, now + note.t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + note.t);
            osc.stop(now + note.t + note.d + 0.01);
        });
    }

    // Suara Salah (Duolingo low buzz / gentle boing)
    playWrong() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.25);

        osc2.frequency.setValueAtTime(207.65, now);
        osc2.frequency.exponentialRampToValueAtTime(130, now + 0.25);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }

    // Suara Selesai Level / Kemenangan
    playVictory() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, t: 0.0, d: 0.12 }, // C5
            { f: 659.25, t: 0.12, d: 0.12 }, // E5
            { f: 783.99, t: 0.24, d: 0.12 }, // G5
            { f: 1046.50, t: 0.36, d: 0.2 }, // C6
            { f: 880.00, t: 0.58, d: 0.15 }, // A5
            { f: 1046.50, t: 0.75, d: 0.45 } // C6 panjang
        ];

        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0.0, now + note.t);
            gain.gain.linearRampToValueAtTime(0.3, now + note.t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + note.t);
            osc.stop(now + note.t + note.d + 0.02);
        });
    }

    // Suara Streak / Api bertambah
    playStreak() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
    }

    // Text to Speech (TTS) menggunakan Web Speech API
    speak(text, lang = 'id-ID', rate = 1.0) {
        if (!this.speechEnabled || !('speechSynthesis' in window)) return;

        try {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = 1.05;
            utterance.lang = lang;

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) || v.lang.includes(lang));
                if (matchedVoice) {
                    utterance.voice = matchedVoice;
                }
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("TTS Error:", e);
        }
    }
}

const audio = new AudioEngine();
