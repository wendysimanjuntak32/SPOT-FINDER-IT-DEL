// Procedural Web Audio Synthesizer & Speech Readout for LeaveCheck
class LeaveCheckAudio {
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
            console.warn("Audio Context tidak didukung:", e);
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

    // Sound when item is checked
    playCheck() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08); // A5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Sound when item is unchecked
    playUncheck() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Sound when 100% ready to leave
    playReadyFanfare() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);

            gain.gain.setValueAtTime(0, now + idx * 0.09);
            gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.32);
        });
    }

    // Voice assistant to read remaining missing items
    speakMissingItems(items) {
        if (!('speechSynthesis' in window)) {
            alert("Browser tidak mendukung sintesis suara.");
            return;
        }

        window.speechSynthesis.cancel();

        let text = '';
        if (items.length === 0) {
            text = 'Semua barang sudah lengkap dan siap di dalam tas. Selamat beraktivitas!';
        } else {
            text = `Perhatian! Anda masih memiliki ${items.length} barang yang belum dibawa: ${items.join(', ')}. Jangan sampai tertinggal!`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }
}

window.leaveAudio = new LeaveCheckAudio();
