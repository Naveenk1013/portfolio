// Web Audio API Synthesizer for Anime Sound Effects
// 100% self-contained, zero external audio assets, works instantly in any browser.

class AnimeAudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = typeof window !== 'undefined' 
            ? localStorage.getItem('anime-sfx-enabled') !== 'false' 
            : true;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('anime-sfx-enabled', this.enabled ? 'true' : 'false');
        }
        if (this.enabled) {
            this.playDenDenMushi();
        }
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }

    // ── 1. Katana Slash (Sword whoosh + high metallic ring) ──
    playKatanaSlash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // White noise whoosh
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // High-pass filter sweep
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(7000, now + 0.15);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.01, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.7, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);

        // Resonant metallic blade chime
        const metalOsc = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metalOsc.type = 'sine';
        metalOsc.frequency.setValueAtTime(2400, now + 0.03);
        metalOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

        metalGain.gain.setValueAtTime(0.01, now + 0.03);
        metalGain.gain.linearRampToValueAtTime(0.4, now + 0.06);
        metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        metalOsc.connect(metalGain);
        metalGain.connect(this.ctx.destination);
        metalOsc.start(now + 0.03);
        metalOsc.stop(now + 0.45);
    }

    // ── 2. Taiko Drum "DON!!" (One Piece dramatic impact) ──
    playDonImpact() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Sub bass drop
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

        subGain.gain.setValueAtTime(0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.65);

        // Impact punch transient
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'sine';
        punchOsc.frequency.setValueAtTime(320, now);
        punchOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        punchGain.gain.setValueAtTime(0.8, now);
        punchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        punchOsc.connect(punchGain);
        punchGain.connect(this.ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.12);
    }

    // ── 3. Conqueror's Haki Aura Pulse ──
    playHakiCharge(step = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Higher pitch & intensity as step increases (1 to 6)
        const baseFreq = 90 + step * 25;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.18);

        // Low pass to give it that deep anime pressure vibration
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300 + step * 100, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.15 + step * 0.04, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // ── 4. Bounty Fanfare / Level Up (Chime Arpeggio) ──
    playBountyFanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.01, start);
            gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + 0.45);
        });
    }

    // ── 5. Den-Den Mushi / Button Chirp ──
    playDenDenMushi() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [700, 950, 700];

        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + i * 0.06;

            osc.type = 'square';
            osc.frequency.setValueAtTime(f, start);

            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + 0.06);
        });
    }

    // ── 6. Gomu Gomu Rubber Snap ──
    playRubberSnap() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
    }
    // ── 7. Futuristic Chrono Quantum Blip ──
    playChronoBlip(freq = 880) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
}

export const animeAudio = new AnimeAudioEngine();
