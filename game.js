// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 16;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;

// Audio System
class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.masterGain);
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(this.masterGain);
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.musicPlaying = false;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        this.musicGain.gain.value = this.musicEnabled ? 0.15 : 0;
        return this.musicEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        this.sfxGain.gain.value = this.sfxEnabled ? 0.4 : 0;
        return this.sfxEnabled;
    }

    // Play a note with specified frequency and duration
    playNote(frequency, duration, type = 'square', gainNode = this.sfxGain) {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(gainNode);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Sound effects
    playAttack() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playHit() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.15);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    playDamage() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.2);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playFollowerCall() {
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.1, 'sine'), i * 50);
        });
    }

    playFollowerDismiss() {
        const frequencies = [783.99, 659.25, 523.25]; // G5, E5, C5
        frequencies.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.1, 'sine'), i * 50);
        });
    }

    playEnemyDeath() {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    playStep() {
        this.playNote(100 + Math.random() * 50, 0.05, 'triangle');
    }

    // NES-style Pikmin-inspired music - whimsical garden exploration theme
    playNESNote(frequency, duration, type, gainNode, volume = 0.3, delay = 0) {
        const now = this.audioContext.currentTime + delay;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        // NES-style envelope: quick attack, sustain, quick release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01);
        gain.gain.setValueAtTime(volume * 0.7, now + 0.02);
        gain.gain.linearRampToValueAtTime(volume * 0.6, now + duration * 0.8);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        oscillator.connect(gain);
        gain.connect(gainNode);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    // Pulse wave with duty cycle simulation (more NES-authentic)
    playPulseNote(frequency, duration, gainNode, volume = 0.25, delay = 0) {
        const now = this.audioContext.currentTime + delay;

        // Create two oscillators for richer pulse sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(frequency, now);
        osc2.frequency.setValueAtTime(frequency * 1.002, now); // Slight detune for richness

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.008);
        gain.gain.setValueAtTime(volume * 0.8, now + 0.02);
        gain.gain.linearRampToValueAtTime(volume * 0.6, now + duration * 0.7);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    // Noise channel for percussion
    playNoise(duration, gainNode, volume = 0.15, delay = 0) {
        const now = this.audioContext.currentTime + delay;
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(gainNode);

        noise.start(now);
        noise.stop(now + duration);
    }

    startBackgroundMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;

        const BPM = 140;
        const beatDuration = 60 / BPM;
        const sixteenth = beatDuration / 4;
        const eighth = beatDuration / 2;
        const quarter = beatDuration;
        const half = beatDuration * 2;

        // Note frequencies
        const notes = {
            C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
            A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
            F5: 698.46, G5: 783.99, A5: 880.00,
            C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00,
            A3: 220.00, B3: 246.94,
            C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00,
            A2: 110.00, B2: 123.47
        };

        // Pikmin-inspired melody - bouncy, optimistic, nature-themed
        // Reminiscent of "The Forest of Hope" / exploration themes
        const melody = [
            // Phrase 1 - cheerful opening
            { n: 'G4', d: eighth }, { n: 'A4', d: eighth }, { n: 'C5', d: quarter },
            { n: 'E5', d: eighth }, { n: 'D5', d: eighth }, { n: 'C5', d: quarter },
            { n: 'G4', d: eighth }, { n: 'A4', d: eighth }, { n: 'C5', d: eighth }, { n: 'D5', d: eighth },
            { n: 'E5', d: half },
            // Phrase 2 - playful response
            { n: 'E5', d: eighth }, { n: 'D5', d: eighth }, { n: 'C5', d: quarter },
            { n: 'A4', d: eighth }, { n: 'G4', d: eighth }, { n: 'A4', d: quarter },
            { n: 'G4', d: eighth }, { n: 'E4', d: eighth }, { n: 'G4', d: quarter },
            { n: 'A4', d: half },
            // Phrase 3 - building up
            { n: 'C5', d: eighth }, { n: 'D5', d: eighth }, { n: 'E5', d: quarter },
            { n: 'G5', d: eighth }, { n: 'E5', d: eighth }, { n: 'D5', d: quarter },
            { n: 'C5', d: eighth }, { n: 'D5', d: eighth }, { n: 'E5', d: eighth }, { n: 'G5', d: eighth },
            { n: 'A5', d: quarter }, { n: 'G5', d: quarter },
            // Phrase 4 - resolution
            { n: 'E5', d: eighth }, { n: 'D5', d: eighth }, { n: 'C5', d: quarter },
            { n: 'A4', d: eighth }, { n: 'C5', d: eighth }, { n: 'G4', d: quarter },
            { n: 'E4', d: eighth }, { n: 'G4', d: eighth }, { n: 'A4', d: eighth }, { n: 'G4', d: eighth },
            { n: 'C5', d: half },
        ];

        // Harmony/countermelody
        const harmony = [
            { n: 'E4', d: quarter }, { n: 'E4', d: quarter }, { n: 'G4', d: quarter }, { n: 'G4', d: quarter },
            { n: 'E4', d: quarter }, { n: 'G4', d: quarter }, { n: 'A4', d: half },
            { n: 'G4', d: quarter }, { n: 'E4', d: quarter }, { n: 'D4', d: quarter }, { n: 'E4', d: quarter },
            { n: 'D4', d: quarter }, { n: 'C4', d: quarter }, { n: 'D4', d: half },
            { n: 'E4', d: quarter }, { n: 'G4', d: quarter }, { n: 'A4', d: quarter }, { n: 'G4', d: quarter },
            { n: 'E4', d: quarter }, { n: 'G4', d: quarter }, { n: 'C5', d: quarter }, { n: 'B4', d: quarter },
            { n: 'G4', d: quarter }, { n: 'E4', d: quarter }, { n: 'D4', d: quarter }, { n: 'E4', d: quarter },
            { n: 'C4', d: quarter }, { n: 'D4', d: quarter }, { n: 'E4', d: half },
        ];

        // Bass line - triangle wave like NES
        const bass = [
            { n: 'C3', d: quarter }, { n: 'C3', d: quarter }, { n: 'G2', d: quarter }, { n: 'G2', d: quarter },
            { n: 'A2', d: quarter }, { n: 'A2', d: quarter }, { n: 'E2', d: quarter }, { n: 'G2', d: quarter },
            { n: 'C3', d: quarter }, { n: 'E3', d: quarter }, { n: 'G2', d: quarter }, { n: 'C3', d: quarter },
            { n: 'F2', d: quarter }, { n: 'G2', d: quarter }, { n: 'A2', d: half },
            { n: 'C3', d: quarter }, { n: 'C3', d: quarter }, { n: 'E3', d: quarter }, { n: 'G3', d: quarter },
            { n: 'A2', d: quarter }, { n: 'C3', d: quarter }, { n: 'E3', d: quarter }, { n: 'D3', d: quarter },
            { n: 'C3', d: quarter }, { n: 'G2', d: quarter }, { n: 'A2', d: quarter }, { n: 'B2', d: quarter },
            { n: 'C3', d: quarter }, { n: 'G2', d: quarter }, { n: 'C3', d: half },
        ];

        // Drum pattern using noise
        const drumPattern = [
            { type: 'kick', d: quarter }, { type: 'hat', d: eighth }, { type: 'hat', d: eighth },
            { type: 'snare', d: quarter }, { type: 'hat', d: eighth }, { type: 'hat', d: eighth },
        ];

        const loopDuration = melody.reduce((sum, n) => sum + (n.d || quarter), 0) * 1000;

        const playLoop = () => {
            let melodyTime = 0;
            melody.forEach(note => {
                if (note.n && notes[note.n]) {
                    this.playPulseNote(notes[note.n], note.d * 0.9, this.musicGain, 0.2, melodyTime);
                }
                melodyTime += note.d;
            });

            let harmonyTime = 0;
            harmony.forEach(note => {
                if (note.n && notes[note.n]) {
                    this.playNESNote(notes[note.n], note.d * 0.85, 'square', this.musicGain, 0.1, harmonyTime);
                }
                harmonyTime += note.d;
            });

            let bassTime = 0;
            bass.forEach(note => {
                if (note.n && notes[note.n]) {
                    this.playNESNote(notes[note.n], note.d * 0.8, 'triangle', this.musicGain, 0.25, bassTime);
                }
                bassTime += note.d;
            });

            // Drums
            const totalBeats = Math.floor(loopDuration / 1000 / quarter) * quarter;
            for (let t = 0; t < totalBeats; t += quarter * 2) {
                // Kick on 1
                this.playNoise(0.08, this.musicGain, 0.08, t);
                // Hi-hat
                this.playNoise(0.03, this.musicGain, 0.04, t + eighth);
                this.playNoise(0.03, this.musicGain, 0.04, t + eighth * 2);
                // Snare on 2
                this.playNoise(0.1, this.musicGain, 0.06, t + quarter);
                // Hi-hat
                this.playNoise(0.03, this.musicGain, 0.04, t + quarter + eighth);
                this.playNoise(0.03, this.musicGain, 0.04, t + quarter + eighth * 2);
            }

            if (this.musicPlaying) {
                setTimeout(playLoop, loopDuration);
            }
        };

        playLoop();
    }
}

const audio = new AudioManager();

// Input handling
const keys = {};
const keysPressed = {};
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // Prevent spacebar from scrolling
    if (e.key === ' ') {
        e.preventDefault();
    }

    // Start game with spacebar
    if (!gameStarted && e.key === ' ') {
        gameStarted = true;
        document.getElementById('startScreen').classList.add('hidden');
        audio.startBackgroundMusic();
        return;
    }

    // Restart game from won screen with spacebar
    if (game && game.gameWon && e.key === ' ') {
        location.reload();
        return;
    }

    // Skip level transition with spacebar (after first half)
    if (game && game.levelTransition && game.transitionTimer > game.transitionMaxTime / 2 && e.key === ' ') {
        game.level++;
        if (game.level > 6) {
            game.gameWon = true;
            game.gameWonTimer = 0;
            return;
        }
        game.initLevel();
        game.levelTransition = false;
        game.transitionTimer = 0;
        game.levelStartTimer = 60;
        return;
    }

    // Toggle mute with 'M' key
    if (key === 'm' && !keysPressed['m']) {
        keysPressed['m'] = true;
        const isMuted = audio.masterGain.gain.value === 0;
        audio.masterGain.gain.value = isMuted ? 0.3 : 0;
    }

    // Reset game with 'R' key
    if (key === 'r' && !keysPressed['r']) {
        keysPressed['r'] = true;
        location.reload();
    }

    keys[key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
    keysPressed[key] = false;
});

// Auto-mute when tab loses focus
let savedVolume = 0.3;
window.addEventListener('blur', () => {
    savedVolume = audio.masterGain.gain.value;
    audio.masterGain.gain.value = 0;
});
window.addEventListener('focus', () => {
    audio.masterGain.gain.value = savedVolume;
});

// Utility functions
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

// Shockwave effect
class Shockwave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 30;
        this.speed = 2;
        this.alpha = 1;
        this.done = false;
    }

    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
        if (this.radius >= this.maxRadius) {
            this.done = true;
        }
    }

    draw(camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.strokeStyle = `rgba(239, 68, 68, ${this.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(252, 165, 165, ${this.alpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius - 4, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Treasure class
class Treasure {
    constructor(x, y, type, name) {
        this.x = x;
        this.y = y;
        this.type = type; // 0-6 for different treasure types
        this.name = name;
        this.collected = false;
        this.collectionTimer = 0;
        this.collectionMaxTime = 60;
    }

    draw(camera) {
        if (this.collected && this.collectionTimer >= this.collectionMaxTime) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (this.collected) {
            // Sparkle effect during collection
            const progress = this.collectionTimer / this.collectionMaxTime;
            const alpha = 1 - progress;
            const scale = 1 + progress * 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(screenX, screenY);
            ctx.scale(scale, scale);
            this.drawTreasureSprite(0, 0);

            // Sparkles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + progress * Math.PI;
                const dist = progress * 20;
                const sx = Math.cos(angle) * dist;
                const sy = Math.sin(angle) * dist;
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(sx - 1, sy - 1, 2, 2);
            }
            ctx.restore();
            return;
        }

        this.drawTreasureSprite(screenX, screenY);
    }

    drawTreasureSprite(x, y) {
        switch(this.type) {
            case 0: // Bottle cap (red with ridged edges)
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(x - 12, y - 12, 24, 24);
                // Ridged edge pattern
                ctx.fillStyle = '#991b1b';
                for (let i = 0; i < 24; i += 3) {
                    ctx.fillRect(x - 12 + i, y - 12, 1, 2);
                    ctx.fillRect(x - 12 + i, y + 10, 1, 2);
                    ctx.fillRect(x - 12, y - 12 + i, 2, 1);
                    ctx.fillRect(x + 10, y - 12 + i, 2, 1);
                }
                // Center logo area
                ctx.fillStyle = '#fca5a5';
                ctx.fillRect(x - 6, y - 6, 12, 12);
                ctx.fillStyle = '#7f1d1d';
                ctx.fillRect(x - 4, y - 1, 8, 2);
                break;
            case 1: // Pop tab (aluminum can pull tab)
                ctx.fillStyle = '#d4d4d8';
                // Main tab body
                ctx.fillRect(x - 10, y - 6, 20, 12);
                // Oval hole
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(x - 6, y - 3, 8, 6);
                // Pull ring
                ctx.fillStyle = '#d4d4d8';
                ctx.fillRect(x + 6, y - 8, 6, 4);
                ctx.fillRect(x + 8, y - 12, 2, 8);
                // Highlights
                ctx.fillStyle = '#f4f4f5';
                ctx.fillRect(x - 8, y - 4, 2, 8);
                ctx.fillRect(x + 7, y - 10, 2, 2);
                break;
            case 2: // Screw (with threads visible)
                ctx.fillStyle = '#71717a';
                // Screw head
                ctx.fillRect(x - 8, y - 12, 16, 6);
                // Cross slot
                ctx.fillStyle = '#27272a';
                ctx.fillRect(x - 1, y - 11, 2, 5);
                ctx.fillRect(x - 6, y - 10, 12, 2);
                // Screw shaft
                ctx.fillStyle = '#a1a1aa';
                ctx.fillRect(x - 5, y - 6, 10, 18);
                // Thread lines
                ctx.fillStyle = '#52525b';
                for (let i = -4; i < 14; i += 3) {
                    ctx.fillRect(x - 6, y + i, 12, 1);
                }
                break;
            case 3: // Light bulb
                ctx.fillStyle = '#fef3c7';
                // Glass bulb (rounded)
                ctx.fillRect(x - 8, y - 12, 16, 3);
                ctx.fillRect(x - 10, y - 9, 20, 9);
                ctx.fillRect(x - 8, y, 16, 3);
                // Filament
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(x - 2, y - 8, 4, 6);
                ctx.fillRect(x - 4, y - 6, 2, 2);
                ctx.fillRect(x + 2, y - 6, 2, 2);
                // Metal base
                ctx.fillStyle = '#71717a';
                ctx.fillRect(x - 6, y + 3, 12, 3);
                ctx.fillRect(x - 5, y + 6, 10, 3);
                ctx.fillRect(x - 4, y + 9, 8, 2);
                // Screw threads on base
                ctx.fillStyle = '#52525b';
                ctx.fillRect(x - 6, y + 4, 12, 1);
                ctx.fillRect(x - 5, y + 7, 10, 1);
                break;
            case 4: // Spoon
                ctx.fillStyle = '#d4d4d8';
                // Spoon bowl (oval)
                ctx.fillRect(x - 8, y - 12, 16, 10);
                ctx.fillRect(x - 10, y - 10, 20, 6);
                // Bowl indent
                ctx.fillStyle = '#a1a1aa';
                ctx.fillRect(x - 6, y - 9, 12, 5);
                // Handle
                ctx.fillStyle = '#d4d4d8';
                ctx.fillRect(x - 3, y - 2, 6, 18);
                ctx.fillRect(x - 4, y + 12, 8, 3);
                // Shine/highlight
                ctx.fillStyle = '#f4f4f5';
                ctx.fillRect(x - 6, y - 10, 3, 6);
                ctx.fillRect(x - 2, y, 2, 10);
                break;
            case 5: // Button (circular with thread holes)
                // Random button color
                const buttonColors = ['#3b82f6', '#ef4444', '#fbbf24', '#22c55e'];
                const buttonColor = buttonColors[Math.floor((x + y) * 7) % buttonColors.length];
                ctx.fillStyle = buttonColor;
                // Circular button body
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                // Four thread holes
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(x - 5, y - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 5, y - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x - 5, y + 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 6: // Lego brick
                ctx.fillStyle = '#ef4444';
                // Brick base
                ctx.fillRect(x - 12, y - 6, 24, 12);
                // Studs on top
                ctx.fillStyle = '#dc2626';
                for (let i = 0; i < 3; i++) {
                    const studX = x - 10 + i * 10;
                    ctx.fillRect(studX, y - 10, 6, 4);
                }
                // Brick details
                ctx.fillStyle = '#991b1b';
                ctx.fillRect(x - 12, y, 24, 1);
                ctx.fillRect(x, y - 6, 1, 12);
                break;
            case 7: // Switch cartridge
                ctx.fillStyle = '#1e293b';
                // Cartridge body
                ctx.fillRect(x - 10, y - 12, 20, 24);
                // Label area
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(x - 8, y - 10, 16, 12);
                // Nintendo Switch logo placeholder
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x - 6, y - 8, 4, 4);
                ctx.fillRect(x + 2, y - 8, 4, 4);
                // Contacts
                ctx.fillStyle = '#fbbf24';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(x - 8 + i * 4, y + 8, 2, 3);
                }
                break;
            case 8: // Coin (with detailed face)
                ctx.fillStyle = '#fbbf24';
                // Coin body
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
                // Outer ring
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, 11, 0, Math.PI * 2);
                ctx.stroke();
                // Inner design (profile/number)
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(x - 4, y - 6, 8, 12);
                ctx.fillRect(x - 6, y - 4, 12, 8);
                // Detail marks
                ctx.fillStyle = '#d97706';
                ctx.fillRect(x - 2, y - 4, 4, 8);
                ctx.fillRect(x - 1, y - 6, 2, 12);
                break;
        }
    }
}

// Heart (health pickup)
class Heart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.collectionTimer = 0;
        this.collectionMaxTime = 40;
        this.pulseTimer = 0;
    }

    draw(camera) {
        if (this.collected && this.collectionTimer >= this.collectionMaxTime) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        if (this.collected) {
            // Float up and fade out
            const progress = this.collectionTimer / this.collectionMaxTime;
            const alpha = 1 - progress;
            const offsetY = -progress * 30;

            ctx.save();
            ctx.globalAlpha = alpha;
            this.drawHeartSprite(screenX, screenY + offsetY);
            ctx.restore();
            return;
        }

        // Pulse effect
        this.pulseTimer++;
        const scale = 1 + Math.sin(this.pulseTimer * 0.1) * 0.1;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);
        this.drawHeartSprite(0, 0);
        ctx.restore();
    }

    drawHeartSprite(x, y) {
        // Heart shape (same as health bar)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - 4, y - 3, 3, 2);
        ctx.fillRect(x + 1, y - 3, 3, 2);
        ctx.fillRect(x - 5, y - 1, 10, 5);
        ctx.fillRect(x - 4, y + 4, 8, 2);
        ctx.fillRect(x - 3, y + 6, 6, 2);
        ctx.fillRect(x - 2, y + 8, 4, 1);
        ctx.fillRect(x - 1, y + 9, 2, 1);
    }

    update() {
        if (this.collected && this.collectionTimer < this.collectionMaxTime) {
            this.collectionTimer++;
        }
    }
}

// Camera
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    follow(target) {
        this.x = target.x - canvas.width / 2;
        this.y = target.y - canvas.height / 2;

        // Clamp camera to world bounds
        this.x = Math.max(0, Math.min(this.x, WORLD_WIDTH * TILE_SIZE - canvas.width));
        this.y = Math.max(0, Math.min(this.y, WORLD_HEIGHT * TILE_SIZE - canvas.height));
    }
}

// Player
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.speed = 2;
        this.direction = 'down';
        this.health = 6;
        this.maxHealth = 6;
        this.attackCooldown = 0;
        this.attackRange = 20;
        this.invulnerable = 0;
        this.isAttacking = false;
    }

    update() {
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const norm = normalize(dx, dy);
            this.x += norm.x * this.speed;
            this.y += norm.y * this.speed;

            if (Math.abs(norm.x) > Math.abs(norm.y)) {
                this.direction = norm.x > 0 ? 'right' : 'left';
            } else {
                this.direction = norm.y > 0 ? 'down' : 'up';
            }

            // Footstep sounds
            if (Math.random() < 0.05) {
                audio.playStep();
            }
        }

        // World bounds
        this.x = Math.max(6, Math.min(this.x, WORLD_WIDTH * TILE_SIZE - 6));
        this.y = Math.max(6, Math.min(this.y, WORLD_HEIGHT * TILE_SIZE - 6));

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.invulnerable > 0) this.invulnerable--;

        // Attack
        if (keys[' '] && this.attackCooldown === 0) {
            this.isAttacking = true;
            this.attackCooldown = 20;
        } else {
            this.isAttacking = false;
        }
    }

    getAttackPosition() {
        const attackX = this.x + (this.direction === 'right' ? 15 : this.direction === 'left' ? -15 : 0);
        const attackY = this.y + (this.direction === 'down' ? 15 : this.direction === 'up' ? -15 : 0);
        return { x: attackX, y: attackY };
    }

    takeDamage(amount) {
        if (this.invulnerable === 0) {
            this.health -= amount;
            this.invulnerable = 60;
            audio.playDamage();
        }
    }

    draw(camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Flicker when invulnerable
        if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) return;

        // Authentic Olimar sprite
        // Body (yellow spacesuit - wider/chubbier)
        ctx.fillStyle = '#fbbf24'; // Yellow suit
        ctx.fillRect(screenX - 5, screenY - 1, 10, 7);

        // Arms (yellow suit)
        ctx.fillStyle = '#f59e0b'; // Darker yellow for arms
        ctx.fillRect(screenX - 7, screenY, 2, 4);
        ctx.fillRect(screenX + 5, screenY, 2, 4);

        // Legs/boots
        ctx.fillStyle = '#78716c'; // Gray boots
        ctx.fillRect(screenX - 4, screenY + 6, 3, 3);
        ctx.fillRect(screenX + 1, screenY + 6, 3, 3);

        // Glass globe helmet (transparent with outline)
        ctx.strokeStyle = '#d1d5db'; // Light gray outline
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY - 5, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Helmet shine/reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(screenX - 3, screenY - 8, 2, 2);

        // Pink round head inside helmet
        ctx.fillStyle = '#fda4af'; // Pink flesh
        ctx.beginPath();
        ctx.arc(screenX, screenY - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes on head
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX - 2, screenY - 6, 1, 1);
        ctx.fillRect(screenX + 1, screenY - 6, 1, 1);

        // Nose
        ctx.fillStyle = '#f87171';
        ctx.fillRect(screenX, screenY - 5, 1, 2);

        // Silver antenna with ball on end
        ctx.strokeStyle = '#d4d4d8'; // Silver antenna
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - 10);
        ctx.lineTo(screenX + 1, screenY - 13);
        ctx.stroke();

        // Silver ball on antenna tip
        ctx.fillStyle = '#d4d4d8';
        ctx.beginPath();
        ctx.arc(screenX + 1, screenY - 13, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator (turn head slightly)
        if (this.direction === 'right') {
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX + 1, screenY - 6, 1, 1);
        } else if (this.direction === 'left') {
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 2, screenY - 6, 1, 1);
        }
    }
}

// Follower (Pikmin-style)
class Follower {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || '#ef4444';
        this.isPurple = color === '#a855f7';
        this.width = this.isPurple ? 10 : 8;
        this.height = this.isPurple ? 10 : 8;
        this.size = this.isPurple ? 5 : 4; // Head radius
        this.speed = 1.8;
        this.followDistance = 20;
        this.attackDistance = 50;
        this.currentTarget = null;
        this.collectingTreasure = false;
        this.treasureTarget = null;
        this.dead = false;
    }

    update(player, followers, enemies, world, treasures) {
        if (this.dead) return;

        // Check for environmental hazards
        const tileType = world.getTileAt(this.x, this.y);
        const isBlue = this.color === '#3b82f6';
        const isRed = this.color === '#ef4444';

        // Water kills non-blue Pikmin
        if (tileType === 3 && !isBlue) {
            this.dead = true;
            audio.playDamage();
            return;
        }

        // Fire kills non-red Pikmin
        if (tileType === 4 && !isRed) {
            this.dead = true;
            audio.playDamage();
            return;
        }

        // Rocks kill non-purple Pikmin
        if (tileType === 5 && !this.isPurple) {
            this.dead = true;
            audio.playDamage();
            return;
        }

        // Check if collecting treasure
        if (this.collectingTreasure && this.treasureTarget) {
            const dist = distance(this.x, this.y, this.treasureTarget.x, this.treasureTarget.y);
            if (dist < 3) {
                // Stay near treasure
                return;
            } else {
                // Move toward treasure
                const norm = normalize(this.treasureTarget.x - this.x, this.treasureTarget.y - this.y);
                this.x += norm.x * this.speed * 0.8;
                this.y += norm.y * this.speed * 0.8;
                return;
            }
        }

        // Always follow the player (or follow the pikmin in front)
        const index = followers.indexOf(this);
        const targetX = index === 0 ? player.x : followers[index - 1].x;
        const targetY = index === 0 ? player.y : followers[index - 1].y;

        // Check for nearby enemies to attack
        const nearestEnemy = this.findNearestEnemy(enemies);

        if (nearestEnemy && distance(this.x, this.y, nearestEnemy.x, nearestEnemy.y) < this.attackDistance) {
            // Attack mode - move toward and attack enemy
            this.currentTarget = nearestEnemy;
            this.attackEnemy(nearestEnemy);
        } else {
            // Follow mode
            this.currentTarget = null;
            const dist = distance(this.x, this.y, targetX, targetY);
            if (dist > this.followDistance) {
                const norm = normalize(targetX - this.x, targetY - this.y);
                this.x += norm.x * this.speed;
                this.y += norm.y * this.speed;
            }
        }
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = Infinity;
        enemies.forEach(enemy => {
            if (!enemy.dead) {
                const dist = distance(this.x, this.y, enemy.x, enemy.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = enemy;
                }
            }
        });
        return nearest;
    }

    attackEnemy(enemy) {
        const norm = normalize(enemy.x - this.x, enemy.y - this.y);
        this.x += norm.x * 3;
        this.y += norm.y * 3;

        if (distance(this.x, this.y, enemy.x, enemy.y) < 12) {
            enemy.takeDamage(0.5);
        }
    }

    draw(camera) {
        if (this.dead) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        const scale = this.isPurple ? 1.3 : 1;

        // Lower stem (below head)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(screenX - 1 * scale, screenY + 2 * scale, 2 * scale, 4 * scale);

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Upper stem (above head)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(screenX - 1 * scale, screenY - 8 * scale, 2 * scale, 5 * scale);

        // Leaf - more organic shape
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - 8 * scale);
        ctx.quadraticCurveTo(screenX - 4 * scale, screenY - 10 * scale, screenX - 2 * scale, screenY - 13 * scale);
        ctx.quadraticCurveTo(screenX, screenY - 11 * scale, screenX, screenY - 12 * scale);
        ctx.quadraticCurveTo(screenX, screenY - 11 * scale, screenX + 2 * scale, screenY - 13 * scale);
        ctx.quadraticCurveTo(screenX + 4 * scale, screenY - 10 * scale, screenX, screenY - 8 * scale);
        ctx.fill();

        // Leaf vein
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - 8 * scale);
        ctx.lineTo(screenX, screenY - 12 * scale);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX - 2 * scale, screenY - 1 * scale, 1 * scale, 1 * scale);
        ctx.fillRect(screenX + 1 * scale, screenY - 1 * scale, 1 * scale, 1 * scale);
    }
}

// Enemy
class Enemy {
    constructor(x, y, type = 'bulborb') {
        this.x = x;
        this.y = y;
        this.width = 21; // 14 * 1.5
        this.height = 21;
        this.type = type;
        this.speed = 0.8;
        this.health = 3;
        this.maxHealth = 3;
        this.dead = false;
        this.attackCooldown = 0;
        this.direction = 'down';
    }

    update(player) {
        if (this.dead) return;

        const dist = distance(this.x, this.y, player.x, player.y);

        if (dist < 150) {
            const norm = normalize(player.x - this.x, player.y - this.y);
            this.x += norm.x * this.speed;
            this.y += norm.y * this.speed;

            if (Math.abs(norm.x) > Math.abs(norm.y)) {
                this.direction = norm.x > 0 ? 'right' : 'left';
            } else {
                this.direction = norm.y > 0 ? 'down' : 'up';
            }

            if (dist < 15 && this.attackCooldown === 0) {
                player.takeDamage(1);
                this.attackCooldown = 60;
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
    }

    takeDamage(amount, game = null) {
        this.health -= amount;
        audio.playHit();
        if (this.health <= 0 && !this.dead) {
            this.dead = true;
            this.deathX = this.x;
            this.deathY = this.y;
            audio.playEnemyDeath();
            // Create shockwave effect
            if (game && game.shockwaves) {
                game.shockwaves.push(new Shockwave(this.x, this.y));
            }
        }
    }

    draw(camera) {
        if (this.dead) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Bulborb sprite (side view, scaled 1.5x from original 14px to 21px)
        // Bottom/Body (beige/tan fleshy part)
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(screenX - 9, screenY + 3, 18, 6); // Bottom body
        ctx.fillRect(screenX - 10, screenY - 1, 8, 4); // Front fleshy part

        // Red spotted back
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(screenX - 2, screenY - 5, 14, 8); // Main red back

        // White spots on red back
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(screenX, screenY - 4, 4, 3);
        ctx.fillRect(screenX + 6, screenY - 3, 4, 3);
        ctx.fillRect(screenX + 3, screenY, 3, 3);

        // Fleshy head/face area (front part)
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(screenX - 10, screenY - 5, 8, 8); // Head area

        // Eye stalk (fleshy)
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(screenX - 8, screenY - 8, 3, 4); // Stalk

        // Single eye (white with black pupil)
        ctx.fillStyle = '#fff';
        ctx.fillRect(screenX - 9, screenY - 9, 5, 5); // White of eye

        // Eye pupil
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX - 7, screenY - 8, 2, 3); // Pupil

        // Nose/snout detail
        ctx.fillStyle = '#78350f';
        ctx.fillRect(screenX - 11, screenY - 1, 2, 2);

        // Mouth line
        ctx.fillStyle = '#78350f';
        ctx.fillRect(screenX - 9, screenY + 1, 5, 1);

        // Legs (small tan stubs)
        ctx.fillStyle = '#a8845a';
        ctx.fillRect(screenX - 8, screenY + 9, 3, 2); // Front left
        ctx.fillRect(screenX + 5, screenY + 9, 3, 2); // Front right
        ctx.fillRect(screenX - 6, screenY + 7, 3, 2); // Back left
        ctx.fillRect(screenX + 3, screenY + 7, 3, 2); // Back right

        // Health bar
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 10, screenY - 15, 21, 3);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(screenX - 10, screenY - 15, (this.health / this.maxHealth) * 21, 3);
        }
    }
}

// World
class World {
    constructor() {
        this.tiles = [];
        this.generateWorld();
    }

    generateWorld() {
        // Initialize with grass
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_WIDTH; x++) {
                const rand = Math.random();
                if (rand > 0.92) {
                    this.tiles[y][x] = 2; // Flower
                } else if (rand > 0.85) {
                    this.tiles[y][x] = 1; // Dark grass
                } else {
                    this.tiles[y][x] = 0; // Grass
                }
            }
        }

        // Generate water bodies (lakes and rivers)
        this.generateWaterBodies();

        // Generate fire patches
        this.generateFirePatches();

        // Generate rocky areas
        this.generateRockyAreas();
    }

    generateWaterBodies() {
        // Create 2-4 water lakes
        const numLakes = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numLakes; i++) {
            const centerX = Math.floor(Math.random() * WORLD_WIDTH);
            const centerY = Math.floor(Math.random() * WORLD_HEIGHT);
            const radius = 3 + Math.floor(Math.random() * 4);

            // Create irregular lake shape
            for (let y = -radius; y <= radius; y++) {
                for (let x = -radius; x <= radius; x++) {
                    const dist = Math.sqrt(x * x + y * y);
                    const wobble = Math.random() * 1.5;
                    if (dist < radius + wobble) {
                        const tileX = centerX + x;
                        const tileY = centerY + y;
                        if (tileX >= 0 && tileX < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
                            this.tiles[tileY][tileX] = 3;
                        }
                    }
                }
            }
        }

        // Create 1-2 rivers
        const numRivers = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numRivers; i++) {
            const startX = Math.floor(Math.random() * WORLD_WIDTH);
            const startY = Math.floor(Math.random() * WORLD_HEIGHT);
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const width = 2 + Math.floor(Math.random() * 2);

            let x = startX;
            let y = startY;
            const steps = 15 + Math.floor(Math.random() * 20);

            for (let step = 0; step < steps; step++) {
                // Draw river segment
                for (let w = -width; w <= width; w++) {
                    if (direction === 'horizontal') {
                        const tileY = y + w;
                        if (x >= 0 && x < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
                            this.tiles[tileY][x] = 3;
                        }
                    } else {
                        const tileX = x + w;
                        if (tileX >= 0 && tileX < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
                            this.tiles[y][tileX] = 3;
                        }
                    }
                }

                // Move river forward with slight meandering
                if (direction === 'horizontal') {
                    x++;
                    if (Math.random() < 0.3) y += Math.random() < 0.5 ? 1 : -1;
                } else {
                    y++;
                    if (Math.random() < 0.3) x += Math.random() < 0.5 ? 1 : -1;
                }
            }
        }
    }

    generateFirePatches() {
        // Create 3-6 fire patches (smaller, more scattered)
        const numPatches = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numPatches; i++) {
            const centerX = Math.floor(Math.random() * WORLD_WIDTH);
            const centerY = Math.floor(Math.random() * WORLD_HEIGHT);
            const radius = 2 + Math.floor(Math.random() * 3);

            // Create irregular fire patch
            for (let y = -radius; y <= radius; y++) {
                for (let x = -radius; x <= radius; x++) {
                    const dist = Math.sqrt(x * x + y * y);
                    const wobble = Math.random() * 2;
                    if (dist < radius + wobble - 1) {
                        const tileX = centerX + x;
                        const tileY = centerY + y;
                        if (tileX >= 0 && tileX < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
                            // Don't overwrite water
                            if (this.tiles[tileY][tileX] !== 3) {
                                this.tiles[tileY][tileX] = 4;
                            }
                        }
                    }
                }
            }
        }
    }

    generateRockyAreas() {
        // Create 2-4 rocky areas
        const numRocks = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numRocks; i++) {
            const centerX = Math.floor(Math.random() * WORLD_WIDTH);
            const centerY = Math.floor(Math.random() * WORLD_HEIGHT);
            const radius = 2 + Math.floor(Math.random() * 3);

            // Create irregular rocky area
            for (let y = -radius; y <= radius; y++) {
                for (let x = -radius; x <= radius; x++) {
                    const dist = Math.sqrt(x * x + y * y);
                    const wobble = Math.random() * 1.5;
                    if (dist < radius + wobble - 0.5) {
                        const tileX = centerX + x;
                        const tileY = centerY + y;
                        if (tileX >= 0 && tileX < WORLD_WIDTH && tileY >= 0 && tileY < WORLD_HEIGHT) {
                            // Don't overwrite water or fire
                            if (this.tiles[tileY][tileX] !== 3 && this.tiles[tileY][tileX] !== 4) {
                                this.tiles[tileY][tileX] = 5; // Rocky terrain
                            }
                        }
                    }
                }
            }
        }
    }

    findSafeSpawn() {
        // Find a safe spawn location (grass, no hazards)
        for (let attempts = 0; attempts < 100; attempts++) {
            const x = Math.floor(Math.random() * WORLD_WIDTH);
            const y = Math.floor(Math.random() * WORLD_HEIGHT);

            // Check 5x5 area around spawn
            let safe = true;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const checkX = x + dx;
                    const checkY = y + dy;
                    if (checkX >= 0 && checkX < WORLD_WIDTH && checkY >= 0 && checkY < WORLD_HEIGHT) {
                        const tile = this.tiles[checkY][checkX];
                        if (tile === 3 || tile === 4 || tile === 5) {
                            safe = false;
                            break;
                        }
                    }
                }
                if (!safe) break;
            }

            if (safe) {
                return { x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 };
            }
        }

        // Fallback to center
        return { x: WORLD_WIDTH * TILE_SIZE / 2, y: WORLD_HEIGHT * TILE_SIZE / 2 };
    }

    findHazardIslandSpawn() {
        // Find a spawn on a grass island surrounded by hazards
        for (let attempts = 0; attempts < 100; attempts++) {
            const x = Math.floor(Math.random() * WORLD_WIDTH);
            const y = Math.floor(Math.random() * WORLD_HEIGHT);
            const tile = this.tiles[y][x];

            // Must be on grass
            if (tile === 0 || tile === 1 || tile === 2) {
                // Check if surrounded by hazards (water, fire, or rock)
                let hazardCount = 0;
                let totalChecked = 0;
                for (let dy = -3; dy <= 3; dy++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) continue; // Skip center grass pad
                        const checkX = x + dx;
                        const checkY = y + dy;
                        if (checkX >= 0 && checkX < WORLD_WIDTH && checkY >= 0 && checkY < WORLD_HEIGHT) {
                            const checkTile = this.tiles[checkY][checkX];
                            if (checkTile === 3 || checkTile === 4 || checkTile === 5) {
                                hazardCount++;
                            }
                            totalChecked++;
                        }
                    }
                }

                // If mostly surrounded by hazards (island effect)
                if (totalChecked > 0 && hazardCount / totalChecked > 0.6) {
                    return { x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 };
                }
            }
        }

        // Fallback: create a small grass island in a hazard area
        for (let attempts = 0; attempts < 50; attempts++) {
            const x = Math.floor(Math.random() * (WORLD_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (WORLD_HEIGHT - 4)) + 2;

            // Create 2x2 grass pad
            this.tiles[y][x] = 0;
            this.tiles[y][x + 1] = 0;
            this.tiles[y + 1][x] = 0;
            this.tiles[y + 1][x + 1] = 0;

            return { x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 };
        }

        return this.findSafeSpawn();
    }

    getTileAt(worldX, worldY) {
        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);
        if (tileX < 0 || tileX >= WORLD_WIDTH || tileY < 0 || tileY >= WORLD_HEIGHT) {
            return 0;
        }
        return this.tiles[tileY][tileX];
    }

    draw(camera) {
        const startX = Math.floor(camera.x / TILE_SIZE);
        const startY = Math.floor(camera.y / TILE_SIZE);
        const endX = Math.min(startX + Math.ceil(canvas.width / TILE_SIZE) + 1, WORLD_WIDTH);
        const endY = Math.min(startY + Math.ceil(canvas.height / TILE_SIZE) + 1, WORLD_HEIGHT);

        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const screenX = x * TILE_SIZE - camera.x;
                const screenY = y * TILE_SIZE - camera.y;

                switch(this.tiles[y][x]) {
                    case 0:
                        ctx.fillStyle = '#2d5016'; // Grass
                        break;
                    case 1:
                        ctx.fillStyle = '#254012'; // Dark grass
                        break;
                    case 2:
                        ctx.fillStyle = '#2d5016'; // Flower base
                        break;
                    case 3:
                        ctx.fillStyle = '#3b82f6'; // Water
                        break;
                    case 4:
                        ctx.fillStyle = '#dc2626'; // Fire
                        break;
                    case 5:
                        ctx.fillStyle = '#78716c'; // Rocky
                        break;
                }
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                // Add details for special tiles
                if (this.tiles[y][x] === 2) {
                    // Flower
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillRect(screenX + 6, screenY + 6, 4, 4);
                } else if (this.tiles[y][x] === 3) {
                    // Water waves
                    ctx.fillStyle = '#60a5fa';
                    ctx.fillRect(screenX + 4, screenY + 4, 8, 2);
                    ctx.fillRect(screenX + 2, screenY + 10, 8, 2);
                } else if (this.tiles[y][x] === 4) {
                    // Fire flicker
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillRect(screenX + 6, screenY + 4, 4, 4);
                    ctx.fillStyle = '#fb923c';
                    ctx.fillRect(screenX + 4, screenY + 8, 8, 4);
                } else if (this.tiles[y][x] === 5) {
                    // Rocky details
                    ctx.fillStyle = '#57534e';
                    ctx.fillRect(screenX + 3, screenY + 3, 4, 4);
                    ctx.fillRect(screenX + 9, screenY + 7, 3, 3);
                    ctx.fillStyle = '#a8a29e';
                    ctx.fillRect(screenX + 4, screenY + 4, 2, 2);
                }
            }
        }
    }
}

// UI
function drawUI(player, score, pikminCount, treasureCollected, treasureTotal, level, message, dayTimer, dayDuration, treasures = [], camera = null, followers = []) {
    // Define HUD regions for collision detection
    const hudRegions = {
        leftPanel: { x: 10, y: 10, width: 180, height: 185 },
        topCenter: { x: canvas.width / 2 - 200, y: 10, width: 400, height: 55 },
        compass: { x: canvas.width - 85, y: 15, width: 70, height: 85 }
    };

    // Check if player or followers overlap with a HUD region
    function checkOverlap(region) {
        if (!camera) return false;

        // Check player
        const playerScreenX = player.x - camera.x;
        const playerScreenY = player.y - camera.y;
        if (playerScreenX + player.width > region.x &&
            playerScreenX < region.x + region.width &&
            playerScreenY + player.height > region.y &&
            playerScreenY < region.y + region.height) {
            return true;
        }

        // Check followers (pikmin)
        for (const follower of followers) {
            const followerScreenX = follower.x - camera.x;
            const followerScreenY = follower.y - camera.y;
            if (followerScreenX + 8 > region.x &&
                followerScreenX < region.x + region.width &&
                followerScreenY + 8 > region.y &&
                followerScreenY < region.y + region.height) {
                return true;
            }
        }
        return false;
    }

    // Calculate opacity for left panel
    const leftPanelOpacity = checkOverlap(hudRegions.leftPanel) ? 0.3 : 1.0;

    // Draw left panel HUD elements
    ctx.save();
    ctx.globalAlpha = leftPanelOpacity;

    // Health hearts
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 10, player.maxHealth * 20, 25);

    for (let i = 0; i < player.maxHealth; i++) {
        if (i < player.health) {
            ctx.fillStyle = '#dc2626';
        } else {
            ctx.fillStyle = '#3f3f3f';
        }

        const x = 15 + i * 20;
        const y = 15;

        // Simple heart shape using rectangles
        ctx.fillRect(x + 2, y + 4, 4, 4);
        ctx.fillRect(x + 8, y + 4, 4, 4);
        ctx.fillRect(x, y + 6, 14, 6);
        ctx.fillRect(x + 2, y + 12, 10, 2);
        ctx.fillRect(x + 4, y + 14, 6, 2);
    }

    // Score
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 45, 150, 30);
    ctx.fillStyle = '#4ade80';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`Score: ${score}`, 20, 65);

    // Pixmin count
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 85, 150, 30);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`Pixmin: ${pikminCount}`, 20, 105);

    // Treasure count
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 125, 180, 30);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Treasure: ${treasureCollected}/${treasureTotal}`, 20, 145);

    // Level
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 165, 120, 30);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`Level: ${level}`, 20, 185);

    ctx.restore();

    // Message (treasure collected)
    if (message && message.timer > 0) {
        const alpha = Math.min(1, message.timer / 30);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(canvas.width / 2 - 150, 50, 300, 40);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(message.text, canvas.width / 2, 75);
        ctx.textAlign = 'left';
        ctx.restore();
    }

    // Day/Night timer (top center)
    const topCenterOpacity = checkOverlap(hudRegions.topCenter) ? 0.3 : 1.0;
    ctx.save();
    ctx.globalAlpha = topCenterOpacity;

    const dayProgress = dayTimer / dayDuration;
    const timerWidth = 400;
    const timerHeight = 40;
    const timerX = canvas.width / 2 - timerWidth / 2;
    const timerY = 10;

    // Background track
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(timerX, timerY, timerWidth, timerHeight);

    // Sky gradient based on time - blue morning to red midday to dark evening
    const skyGradient = ctx.createLinearGradient(timerX, timerY, timerX, timerY + timerHeight);
    if (dayProgress < 0.33) {
        // Morning: bright blue
        const morningProgress = dayProgress / 0.33;
        skyGradient.addColorStop(0, `rgb(${135 + morningProgress * 40}, ${206 - morningProgress * 40}, 235)`);
        skyGradient.addColorStop(1, `rgb(${100 + morningProgress * 50}, ${150 - morningProgress * 20}, ${220 - morningProgress * 20})`);
    } else if (dayProgress < 0.66) {
        // Midday: blue to red/orange
        const middayProgress = (dayProgress - 0.33) / 0.33;
        skyGradient.addColorStop(0, `rgb(${175 + middayProgress * 80}, ${166 - middayProgress * 66}, ${235 - middayProgress * 135})`);
        skyGradient.addColorStop(1, `rgb(${150 + middayProgress * 105}, ${130 - middayProgress * 80}, ${200 - middayProgress * 150})`);
    } else {
        // Evening: red to dark blue/purple
        const eveningProgress = (dayProgress - 0.66) / 0.34;
        skyGradient.addColorStop(0, `rgb(${255 - eveningProgress * 215}, ${100 - eveningProgress * 75}, ${100 - eveningProgress * 70})`);
        skyGradient.addColorStop(1, `rgb(${255 - eveningProgress * 235}, ${50 - eveningProgress * 30}, ${50 - eveningProgress * 10})`);
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(timerX + 2, timerY + 2, timerWidth - 4, timerHeight - 4);

    // Sun/Moon position
    const celestialX = timerX + 20 + dayProgress * (timerWidth - 40);
    const celestialY = timerY + timerHeight / 2;

    if (dayProgress < 0.5) {
        // Draw Sun
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = celestialX + Math.cos(angle) * 14;
            const startY = celestialY + Math.sin(angle) * 14;
            const endX = celestialX + Math.cos(angle) * 18;
            const endY = celestialY + Math.sin(angle) * 18;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    } else {
        // Draw Moon
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(celestialX, celestialY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Moon craters
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.arc(celestialX - 4, celestialY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(celestialX + 3, celestialY + 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Time remaining text
    const secondsRemaining = Math.ceil((dayDuration - dayTimer) / 60);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, timerX + timerWidth / 2, timerY + timerHeight + 15);
    ctx.textAlign = 'left';

    ctx.restore();

    // Compass pointing to nearest uncollected treasure
    const uncollectedTreasures = treasures.filter(t => !t.collected);
    if (uncollectedTreasures.length > 0) {
        // Find closest treasure
        let closestTreasure = null;
        let closestDist = Infinity;
        uncollectedTreasures.forEach(treasure => {
            const dx = treasure.x - player.x;
            const dy = treasure.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist) {
                closestDist = dist;
                closestTreasure = treasure;
            }
        });

        if (closestTreasure) {
            const compassX = canvas.width - 50;
            const compassY = 50;
            const compassRadius = 30;

            // Check compass opacity
            const compassOpacity = checkOverlap(hudRegions.compass) ? 0.3 : 1.0;
            ctx.save();
            ctx.globalAlpha = compassOpacity;

            // Compass background
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(compassX, compassY, compassRadius + 5, 0, Math.PI * 2);
            ctx.fill();

            // Compass outer ring
            ctx.strokeStyle = '#4a4a4a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Compass inner circle
            ctx.fillStyle = '#2a2a2a';
            ctx.beginPath();
            ctx.arc(compassX, compassY, compassRadius - 3, 0, Math.PI * 2);
            ctx.fill();

            // Cardinal directions
            ctx.fillStyle = '#666';
            ctx.font = '10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('N', compassX, compassY - compassRadius + 12);
            ctx.fillText('S', compassX, compassY + compassRadius - 5);
            ctx.fillText('E', compassX + compassRadius - 8, compassY + 3);
            ctx.fillText('W', compassX - compassRadius + 8, compassY + 3);

            // Calculate angle to treasure
            const dx = closestTreasure.x - player.x;
            const dy = closestTreasure.y - player.y;
            const angle = Math.atan2(dy, dx);

            // Draw needle pointing to treasure
            const needleLength = compassRadius - 8;
            const needleWidth = 6;

            ctx.save();
            ctx.translate(compassX, compassY);
            ctx.rotate(angle);

            // Needle (pointing direction - gold/yellow for treasure)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(needleLength, 0);
            ctx.lineTo(0, -needleWidth / 2);
            ctx.lineTo(4, 0);
            ctx.lineTo(0, needleWidth / 2);
            ctx.closePath();
            ctx.fill();

            // Needle tail (opposite direction - darker)
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.moveTo(-needleLength + 8, 0);
            ctx.lineTo(0, -needleWidth / 2 + 1);
            ctx.lineTo(4, 0);
            ctx.lineTo(0, needleWidth / 2 - 1);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // Center dot
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(compassX, compassY, 3, 0, Math.PI * 2);
            ctx.fill();

            // Distance indicator
            const distInTiles = Math.round(closestDist / TILE_SIZE);
            ctx.fillStyle = '#fbbf24';
            ctx.font = '10px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${distInTiles}`, compassX, compassY + compassRadius + 15);

            ctx.restore();
        }
    }
}

// Game
class Game {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.message = null;
        this.levelTransition = false;
        this.transitionTimer = 0;
        this.transitionMaxTime = 120;
        this.levelStartTimer = 60;
        this.dayTimer = 0;
        this.dayDuration = 10800; // 3 minutes at 60fps (180 seconds * 60)
        this.gameWon = false;
        this.gameWonTimer = 0;

        this.initLevel();
    }

    initLevel() {
        this.dayTimer = 0; // Reset day timer for new level
        this.camera = new Camera();
        this.world = new World();

        // Find safe spawn location
        const spawnPos = this.world.findSafeSpawn();
        this.player = new Player(spawnPos.x, spawnPos.y);

        this.followers = [];
        this.enemies = [];
        this.shockwaves = [];
        this.treasures = [];
        this.hearts = [];

        // Spawn initial followers at safe location
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];
        for (let i = 0; i < 5; i++) {
            this.followers.push(new Follower(
                spawnPos.x + (i - 2) * 30,
                spawnPos.y + 40,
                colors[i]
            ));
        }

        // Spawn enemies (more per level, max 25)
        const numEnemies = Math.min(10 + this.level * 2, 25);
        for (let i = 0; i < numEnemies; i++) {
            const enemyPos = this.world.findSafeSpawn();
            this.enemies.push(new Enemy(enemyPos.x, enemyPos.y));
        }

        // Spawn treasures (5-12 per level)
        const numTreasures = Math.min(5 + this.level, 12);
        const treasureNames = [
            'Bottle Cap', 'Pop Tab', 'Screw', 'Light Bulb',
            'Spoon', 'Button', 'Lego Brick', 'Switch Cartridge', 'Coin'
        ];

        // 30% of treasures spawn on hazard islands
        const numHazardTreasures = Math.floor(numTreasures * 0.3);

        for (let i = 0; i < numTreasures; i++) {
            let treasurePos;
            if (i < numHazardTreasures) {
                // Spawn on hazard island
                treasurePos = this.world.findHazardIslandSpawn();
            } else {
                // Spawn on safe ground
                treasurePos = this.world.findSafeSpawn();
            }

            const type = Math.floor(Math.random() * 9);
            this.treasures.push(new Treasure(
                treasurePos.x,
                treasurePos.y,
                type,
                treasureNames[type]
            ));
        }

        // Spawn hearts (1-3 per level)
        const numHearts = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numHearts; i++) {
            let heartPos;
            // 40% chance to spawn on hazard island
            if (Math.random() < 0.4) {
                heartPos = this.world.findHazardIslandSpawn();
            } else {
                heartPos = this.world.findSafeSpawn();
            }
            this.hearts.push(new Heart(heartPos.x, heartPos.y));
        }
    }

    update() {
        // Level start message
        if (this.levelStartTimer > 0) {
            this.levelStartTimer--;
            if (this.levelStartTimer === 0 && this.level > 1) {
                // Level started, no actions yet
            }
            return;
        }

        // Game won state
        if (this.gameWon) {
            this.gameWonTimer++;
            return;
        }

        // Level transition effect
        if (this.levelTransition) {
            this.transitionTimer++;
            if (this.transitionTimer >= this.transitionMaxTime) {
                this.level++;
                if (this.level > 6) {
                    // Game won
                    this.gameWon = true;
                    this.gameWonTimer = 0;
                    return;
                }
                this.initLevel();
                this.levelTransition = false;
                this.transitionTimer = 0;
                this.levelStartTimer = 60;
            }
            return;
        }

        this.player.update();
        this.camera.follow(this.player);

        // Check for treasure collection
        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                const dist = distance(this.player.x, this.player.y, treasure.x, treasure.y);
                if (dist < 50) { // Increased from 30 to 50 for larger treasures
                    // Pikmin swarm to treasure
                    this.followers.forEach(follower => {
                        follower.collectingTreasure = true;
                        follower.treasureTarget = treasure;
                    });

                    // Check if enough Pikmin are near treasure
                    let nearCount = 0;
                    this.followers.forEach(follower => {
                        if (distance(follower.x, follower.y, treasure.x, treasure.y) < 25) { // Increased from 15 to 25
                            nearCount++;
                        }
                    });

                    if (nearCount >= 1) { // Only need 1 Pikmin now (treasures are larger and more valuable)
                        treasure.collected = true;
                        this.score += 500;
                        this.message = { text: `Found: ${treasure.name}!`, timer: 120 };
                        audio.playFollowerCall();

                        // Spawn a random Pikmin as reward
                        const colors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        this.followers.push(new Follower(treasure.x, treasure.y, randomColor));

                        // Release Pikmin
                        this.followers.forEach(f => {
                            f.collectingTreasure = false;
                            f.treasureTarget = null;
                        });
                    }
                } else {
                    // Release Pikmin if player moves away
                    this.followers.forEach(f => {
                        if (f.treasureTarget === treasure) {
                            f.collectingTreasure = false;
                            f.treasureTarget = null;
                        }
                    });
                }
            } else if (treasure.collectionTimer < treasure.collectionMaxTime) {
                treasure.collectionTimer++;
            }
        });

        // Check for heart collection
        this.hearts.forEach(heart => {
            if (!heart.collected) {
                const dist = distance(this.player.x, this.player.y, heart.x, heart.y);
                if (dist < 20) {
                    // Check if player has room for health
                    if (this.player.health < this.player.maxHealth) {
                        heart.collected = true;
                        this.player.health = Math.min(this.player.health + 1, this.player.maxHealth);
                        this.message = { text: 'Health +1!', timer: 60 };
                        audio.playFollowerCall();
                    }
                }
            }
            heart.update();
        });

        this.followers.forEach(follower => {
            follower.update(this.player, this.followers, this.enemies, this.world, this.treasures);
        });

        this.enemies.forEach(enemy => {
            enemy.update(this.player);
        });

        // Update shockwaves
        this.shockwaves.forEach(shockwave => {
            shockwave.update();
        });

        // Check for dead enemies and spawn new Pikmin
        const deadEnemies = this.enemies.filter(e => e.dead);
        deadEnemies.forEach(enemy => {
            this.score += 100;

            const colors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            this.followers.push(new Follower(enemy.x, enemy.y, randomColor));
        });

        this.enemies = this.enemies.filter(e => !e.dead);
        this.followers = this.followers.filter(f => !f.dead);
        this.shockwaves = this.shockwaves.filter(s => !s.done);

        // Update message timer
        if (this.message && this.message.timer > 0) {
            this.message.timer--;
        }

        // Update day timer
        this.dayTimer++;
        if (this.dayTimer >= this.dayDuration) {
            // Day ended - game over
            location.reload();
            return;
        }

        // Check for level completion
        const collectedCount = this.treasures.filter(t => t.collected).length;
        if (collectedCount === this.treasures.length && !this.levelTransition) {
            this.levelTransition = true;
            this.transitionTimer = 0;
        }

        // Check game over conditions
        if (this.player.health <= 0 || this.followers.length === 0) {
            location.reload();
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Game won screen
        if (this.gameWon) {
            // Black background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Victory title
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 64px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('VICTORY!', canvas.width / 2, 150);

            // Subtitle
            ctx.fillStyle = '#fbbf24';
            ctx.font = '24px "Courier New", monospace';
            ctx.fillText('All Levels Complete!', canvas.width / 2, 200);

            // Final score
            ctx.fillStyle = '#fff';
            ctx.font = '20px "Courier New", monospace';
            ctx.fillText(`Final Score: ${this.score}`, canvas.width / 2, 260);
            ctx.fillText(`Pikmin Survived: ${this.followers.length}`, canvas.width / 2, 290);

            // Draw Olimar celebrating
            const centerY = canvas.height / 2 + 40;
            const oX = canvas.width / 2;
            const oY = centerY;

            // Olimar (scaled 3x, arms raised)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(oX - 15, oY - 3, 30, 21);

            // Arms raised (celebrating)
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(oX - 24, oY - 15, 6, 12); // Left arm up
            ctx.fillRect(oX + 18, oY - 15, 6, 12); // Right arm up

            // Helmet
            ctx.fillStyle = '#d4d4d8';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(oX, oY - 15, 15, 0, Math.PI * 2);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.arc(oX, oY - 15, 9, 0, Math.PI * 2);
            ctx.fill();

            // Antenna
            ctx.fillStyle = '#d4d4d8';
            ctx.fillRect(oX - 4, oY - 33, 3, 12);
            ctx.beginPath();
            ctx.arc(oX - 3, oY - 36, 4, 0, Math.PI * 2);
            ctx.fill();

            // Confetti/sparkles
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = (this.gameWonTimer * 2 + i * 10) % canvas.height;
                const color = ['#fbbf24', '#4ade80', '#3b82f6', '#ec4899'][i % 4];
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 4, 4);
            }

            // Press spacebar to restart
            const alpha = Math.sin(this.gameWonTimer * 0.05) * 0.5 + 0.5;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#aaa';
            ctx.font = '18px "Courier New", monospace';
            ctx.fillText('Press SPACEBAR to play again', canvas.width / 2, canvas.height - 50);
            ctx.restore();

            ctx.textAlign = 'left';
            return;
        }

        // Level start message
        if (this.levelStartTimer > 0) {
            const alpha = this.levelStartTimer > 30 ? (60 - this.levelStartTimer) / 30 : this.levelStartTimer / 30;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 40, 300, 80);
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 32px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL ${this.level}`, canvas.width / 2, canvas.height / 2);
            ctx.textAlign = 'left';
            ctx.restore();
        }

        // Level transition screen (black screen with Olimar and Pikmin lineup)
        if (this.levelTransition) {
            // Black background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Level text
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 48px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL ${this.level + 1}`, canvas.width / 2, 100);

            // "Press spacebar to continue" if past first half
            if (this.transitionTimer > this.transitionMaxTime / 2) {
                const alpha = Math.sin((this.transitionTimer - this.transitionMaxTime / 2) * 0.1) * 0.5 + 0.5;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#aaa';
                ctx.font = '18px "Courier New", monospace';
                ctx.fillText('Press SPACEBAR to continue', canvas.width / 2, 550);
                ctx.restore();
            }

            // Draw Olimar
            const startX = canvas.width / 2 - (this.followers.length * 25) / 2;
            const centerY = canvas.height / 2;

            // Olimar (scaled 2x, using exact game sprite)
            const oX = startX - 40;
            const oY = centerY;
            const oScale = 2;

            // Body (yellow spacesuit)
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(oX - 5 * oScale, oY - 1 * oScale, 10 * oScale, 7 * oScale);

            // Arms
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(oX - 7 * oScale, oY, 2 * oScale, 4 * oScale);
            ctx.fillRect(oX + 5 * oScale, oY, 2 * oScale, 4 * oScale);

            // Legs/boots
            ctx.fillStyle = '#78716c';
            ctx.fillRect(oX - 4 * oScale, oY + 6 * oScale, 3 * oScale, 3 * oScale);
            ctx.fillRect(oX + 1 * oScale, oY + 6 * oScale, 3 * oScale, 3 * oScale);

            // Glass helmet
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = oScale;
            ctx.beginPath();
            ctx.arc(oX, oY - 5 * oScale, 5 * oScale, 0, Math.PI * 2);
            ctx.stroke();

            // Helmet shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(oX - 3 * oScale, oY - 8 * oScale, 2 * oScale, 2 * oScale);

            // Pink head
            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.arc(oX, oY - 5 * oScale, 3 * oScale, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(oX - 2 * oScale, oY - 6 * oScale, 1 * oScale, 1 * oScale);
            ctx.fillRect(oX + 1 * oScale, oY - 6 * oScale, 1 * oScale, 1 * oScale);

            // Nose
            ctx.fillStyle = '#f87171';
            ctx.fillRect(oX, oY - 5 * oScale, 1 * oScale, 2 * oScale);

            // Antenna
            ctx.strokeStyle = '#d4d4d8';
            ctx.lineWidth = oScale;
            ctx.beginPath();
            ctx.moveTo(oX, oY - 10 * oScale);
            ctx.lineTo(oX + 1 * oScale, oY - 13 * oScale);
            ctx.stroke();

            // Antenna ball
            ctx.fillStyle = '#d4d4d8';
            ctx.beginPath();
            ctx.arc(oX + 1 * oScale, oY - 13 * oScale, 1.5 * oScale, 0, Math.PI * 2);
            ctx.fill();

            // Draw Pikmin lineup (using exact game sprites scaled 2x)
            this.followers.forEach((follower, i) => {
                const x = startX + i * 25;
                const y = centerY;
                const scale = follower.isPurple ? 2.6 : 2;

                // Lower stem (below head)
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(x - 1 * scale, y + 2 * scale, 2 * scale, 4 * scale);

                // Head
                ctx.fillStyle = follower.color;
                ctx.beginPath();
                ctx.arc(x, y, follower.size * scale, 0, Math.PI * 2);
                ctx.fill();

                // Upper stem (above head)
                ctx.fillStyle = '#15803d';
                ctx.fillRect(x - 1 * scale, y - 8 * scale, 2 * scale, 5 * scale);

                // Leaf - organic shape
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.moveTo(x, y - 8 * scale);
                ctx.quadraticCurveTo(x - 4 * scale, y - 10 * scale, x - 2 * scale, y - 13 * scale);
                ctx.quadraticCurveTo(x, y - 11 * scale, x, y - 12 * scale);
                ctx.quadraticCurveTo(x, y - 11 * scale, x + 2 * scale, y - 13 * scale);
                ctx.quadraticCurveTo(x + 4 * scale, y - 10 * scale, x, y - 8 * scale);
                ctx.fill();

                // Leaf vein
                ctx.strokeStyle = '#16a34a';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y - 8 * scale);
                ctx.lineTo(x, y - 12 * scale);
                ctx.stroke();

                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(x - 2 * scale, y - 1 * scale, 1 * scale, 1 * scale);
                ctx.fillRect(x + 1 * scale, y - 1 * scale, 1 * scale, 1 * scale);
            });

            ctx.textAlign = 'left';
            return;
        }

        this.world.draw(this.camera);
        this.treasures.forEach(treasure => treasure.draw(this.camera));
        this.hearts.forEach(heart => heart.draw(this.camera));
        this.followers.forEach(follower => follower.draw(this.camera));
        this.enemies.forEach(enemy => enemy.draw(this.camera));
        this.shockwaves.forEach(shockwave => shockwave.draw(this.camera));
        this.player.draw(this.camera);

        drawUI(this.player, this.score, this.followers.length,
               this.treasures.filter(t => t.collected).length,
               this.treasures.length, this.level, this.message,
               this.dayTimer, this.dayDuration, this.treasures, this.camera, this.followers);
    }
}

// Game loop
const game = new Game();
let gameStarted = false;

function gameLoop() {
    if (gameStarted) {
        game.update();
    }
    game.draw();
    requestAnimationFrame(gameLoop);
}

// Start screen functionality
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const toggleMusicBtn = document.getElementById('toggleMusic');
const toggleSFXBtn = document.getElementById('toggleSFX');

startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameStarted = true;

    // Resume audio context (required by browsers)
    if (audio.audioContext.state === 'suspended') {
        audio.audioContext.resume();
    }

    // Start background music
    if (!audio.musicPlaying) {
        audio.startBackgroundMusic();
        audio.musicPlaying = true;
    }

    // Play a start sound
    audio.playFollowerCall();
});

toggleMusicBtn.addEventListener('click', () => {
    const enabled = audio.toggleMusic();
    toggleMusicBtn.textContent = `Music: ${enabled ? 'ON' : 'OFF'}`;
});

toggleSFXBtn.addEventListener('click', () => {
    const enabled = audio.toggleSFX();
    toggleSFXBtn.textContent = `SFX: ${enabled ? 'ON' : 'OFF'}`;
});

gameLoop();
