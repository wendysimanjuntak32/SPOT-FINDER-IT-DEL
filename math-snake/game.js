/**
 * MATH SNAKE: NUMEROUS QUEST - Main Game Engine
 * Grid-based 60 FPS Canvas with Math Question Spawner, Orbs & Power-ups
 */

class MathSnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new MathSnakeAudio();

        // Grid dimensions
        this.gridCols = 24;
        this.gridRows = 18;
        this.cellSize = 26;

        // Game State
        this.mode = 'ADDITION'; // 'ADDITION', 'MULTIPLICATION', 'MIXED', 'TARGET_BUILDER'
        this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'

        // Snake properties
        this.snake = [];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.moveInterval = 0.14; // seconds per step
        this.moveTimer = 0;

        // Math Questions & Orbs
        this.currentQuestion = null;
        this.orbs = []; // { x, y, value, isCorrect, isPowerUp, type }
        this.particles = [];
        this.floatingTexts = [];

        // Player Stats
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('math_snake_highscore') || '0');
        this.lives = 3;
        this.streak = 0;
        this.streakMultiplier = 1;

        // Power-ups active
        this.doubleScoreTimer = 0;
        this.slowTimer = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInputs();
        this.resetGame();
        this.startLoop();
    }

    resize() {
        // Fit canvas resolution to container aspect ratio
        this.canvas.width = this.gridCols * this.cellSize;
        this.canvas.height = this.gridRows * this.cellSize;
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'KeyW'].includes(e.code) && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
            else if (['ArrowDown', 'KeyS'].includes(e.code) && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
            else if (['ArrowLeft', 'KeyA'].includes(e.code) && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
            else if (['ArrowRight', 'KeyD'].includes(e.code) && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
            else if (e.code === 'KeyP' || e.code === 'Space') {
                this.togglePause();
            }
        });

        // Mobile Touch D-Pad bindings
        const bindBtn = (id, nx, ny) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if ((nx !== 0 && this.dir.x === 0) || (ny !== 0 && this.dir.y === 0)) {
                    this.nextDir = { x: nx, y: ny };
                }
            });
        };

        bindBtn('dpadUp', 0, -1);
        bindBtn('dpadDown', 0, 1);
        bindBtn('dpadLeft', -1, 0);
        bindBtn('dpadRight', 1, 0);
    }

    setMode(newMode) {
        this.mode = newMode;
        document.querySelectorAll('.btn-mode').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === newMode);
        });
        this.resetGame();
    }

    resetGame() {
        this.snake = [
            { x: 6, y: 9 },
            { x: 5, y: 9 },
            { x: 4, y: 9 }
        ];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.moveInterval = 0.14;
        this.moveTimer = 0;

        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.streakMultiplier = 1;
        this.doubleScoreTimer = 0;
        this.slowTimer = 0;
        this.particles = [];
        this.floatingTexts = [];

        this.generateNewMathQuestion();
        this.updateHUD();

        document.getElementById('modalGameOver').classList.remove('active');
        document.getElementById('modalPause').classList.remove('active');
        this.state = 'PLAYING';
        this.audio.startBGM();
    }

    /* ==========================================================================
       Math Question & Orbs Generation
       ========================================================================== */
    generateNewMathQuestion() {
        let formula = '';
        let answer = 0;

        if (this.mode === 'ADDITION') {
            const a = Math.floor(Math.random() * 40) + 10;
            const b = Math.floor(Math.random() * 40) + 5;
            answer = a + b;
            formula = `${a} + ${b}`;
        } else if (this.mode === 'MULTIPLICATION') {
            const a = Math.floor(Math.random() * 10) + 3;
            const b = Math.floor(Math.random() * 10) + 2;
            answer = a * b;
            formula = `${a} × ${b}`;
        } else if (this.mode === 'MIXED') {
            if (Math.random() > 0.5) {
                const a = Math.floor(Math.random() * 10) + 2;
                const b = Math.floor(Math.random() * 8) + 2;
                const c = Math.floor(Math.random() * 15) + 5;
                answer = a * b + c;
                formula = `(${a} × ${b}) + ${c}`;
            } else {
                const a = Math.floor(Math.random() * 50) + 20;
                const b = Math.floor(Math.random() * 40) + 10;
                answer = a + b;
                formula = `${a} + ${b}`;
            }
        } else {
            // Target Builder Mode
            const a = Math.floor(Math.random() * 6) + 3;
            const b = Math.floor(Math.random() * 6) + 2;
            answer = a * b;
            formula = `Cari Hasil: ${a} × ${b}`;
        }

        this.currentQuestion = { formula, answer };
        document.getElementById('hudEquationText').textContent = `${formula} = ?`;

        // Spawn Orbs on free grid cells
        this.orbs = [];

        // 1 Correct Answer Orb
        const correctPos = this.getRandomFreeGridCell();
        this.orbs.push({
            x: correctPos.x,
            y: correctPos.y,
            value: answer,
            isCorrect: true,
            isPowerUp: false
        });

        // 3-4 Wrong Distractor Orbs
        const distractors = new Set([answer]);
        while (distractors.size < 4) {
            const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1);
            const fake = answer + offset;
            if (fake > 0) distractors.add(fake);
        }

        distractors.forEach(val => {
            if (val !== answer) {
                const pos = this.getRandomFreeGridCell();
                this.orbs.push({
                    x: pos.x,
                    y: pos.y,
                    value: val,
                    isCorrect: false,
                    isPowerUp: false
                });
            }
        });

        // Occasional Power-up fruit (20% chance)
        if (Math.random() < 0.25) {
            const pos = this.getRandomFreeGridCell();
            const types = ['DOUBLE', 'FREEZE', 'HEART'];
            const chosenType = types[Math.floor(Math.random() * types.length)];
            this.orbs.push({
                x: pos.x,
                y: pos.y,
                value: chosenType === 'DOUBLE' ? '⚡' : (chosenType === 'FREEZE' ? '❄️' : '💖'),
                isCorrect: false,
                isPowerUp: true,
                type: chosenType
            });
        }
    }

    getRandomFreeGridCell() {
        let attempts = 0;
        while (attempts < 100) {
            const x = Math.floor(Math.random() * (this.gridCols - 2)) + 1;
            const y = Math.floor(Math.random() * (this.gridRows - 2)) + 1;

            const onSnake = this.snake.some(s => s.x === x && s.y === y);
            const onOrb = this.orbs.some(o => o.x === x && o.y === y);

            if (!onSnake && !onOrb) {
                return { x, y };
            }
            attempts++;
        }
        return { x: 2, y: 2 };
    }

    /* ==========================================================================
       Main 60 FPS Loop
       ========================================================================== */
    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (this.state === 'PLAYING') {
                this.update(dt);
            }
            this.render();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        // Power-up timers
        if (this.doubleScoreTimer > 0) this.doubleScoreTimer -= dt;
        if (this.slowTimer > 0) this.slowTimer -= dt;

        // Step speed
        let curInterval = this.moveInterval;
        if (this.slowTimer > 0) curInterval *= 1.5;

        this.moveTimer += dt;
        if (this.moveTimer >= curInterval) {
            this.moveTimer = 0;
            this.stepSnake();
        }

        // Update Particles & Floating Texts
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.alive);

        this.floatingTexts.forEach(t => t.update(dt));
        this.floatingTexts = this.floatingTexts.filter(t => t.alive);
    }

    stepSnake() {
        this.dir = { ...this.nextDir };
        const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

        // Wrap around walls for smooth arcade flow
        if (head.x < 0) head.x = this.gridCols - 1;
        if (head.x >= this.gridCols) head.x = 0;
        if (head.y < 0) head.y = this.gridRows - 1;
        if (head.y >= this.gridRows) head.y = 0;

        // Self-collision check
        const selfHit = this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
        if (selfHit) {
            this.handleSelfCollision();
            return;
        }

        this.snake.unshift(head);

        // Check Orb Collisions
        const eatenOrbIdx = this.orbs.findIndex(o => o.x === head.x && o.y === head.y);
        if (eatenOrbIdx !== -1) {
            const orb = this.orbs[eatenOrbIdx];
            this.handleOrbEaten(orb);
        } else {
            // Keep tail moving
            this.snake.pop();
        }
    }

    handleOrbEaten(orb) {
        const hx = orb.x * this.cellSize + this.cellSize / 2;
        const hy = orb.y * this.cellSize + this.cellSize / 2;

        if (orb.isPowerUp) {
            this.audio.playPowerUp();
            this.createExplosion(hx, hy, '#38bdf8', 20);

            if (orb.type === 'DOUBLE') {
                this.doubleScoreTimer = 10.0;
                this.showFloatingText(hx, hy, '⚡ 2X SCORE!');
            } else if (orb.type === 'FREEZE') {
                this.slowTimer = 8.0;
                this.showFloatingText(hx, hy, '❄️ SLOW MOTION!');
            } else if (orb.type === 'HEART') {
                this.lives = Math.min(5, this.lives + 1);
                this.showFloatingText(hx, hy, '💖 +1 NYAWA!');
            }
            // Remove power up orb
            this.orbs = this.orbs.filter(o => o !== orb);
            this.updateHUD();
            return;
        }

        if (orb.isCorrect) {
            // Correct Math Answer!
            this.audio.playCorrect();
            this.createExplosion(hx, hy, '#10b981', 30);

            this.streak++;
            this.streakMultiplier = Math.min(5, 1 + Math.floor(this.streak / 3));

            const basePts = 100;
            const mult = (this.doubleScoreTimer > 0 ? 2 : 1) * this.streakMultiplier;
            const ptsGained = basePts * mult;
            this.score += ptsGained;

            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('math_snake_highscore', this.highScore.toString());
            }

            // Gradually speed up
            this.moveInterval = Math.max(0.08, 0.14 - (this.score / 6000));

            this.showFloatingText(hx, hy, `+${ptsGained} BENAR!`);

            if (this.streak >= 3 && this.streak % 3 === 0) {
                this.showStreakToast(`🔥 COMBO ${this.streak}X!`);
            }

            // Spawn next question
            this.generateNewMathQuestion();
        } else {
            // Wrong Answer!
            this.audio.playWrong();
            this.createExplosion(hx, hy, '#f43f5e', 25);
            this.lives--;
            this.streak = 0;
            this.streakMultiplier = 1;

            this.showFloatingText(hx, hy, '❌ SALAH (-1 NYAWA)');

            // Shrink snake if possible
            if (this.snake.length > 3) this.snake.pop();

            if (this.lives <= 0) {
                this.triggerGameOver();
                return;
            }
        }

        this.updateHUD();
    }

    handleSelfCollision() {
        this.audio.playWrong();
        this.lives--;
        this.streak = 0;
        this.streakMultiplier = 1;
        this.updateHUD();

        if (this.lives <= 0) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        this.audio.stopBGM();
        this.audio.playGameOver();

        document.getElementById('finalScoreText').textContent = this.score;
        document.getElementById('finalHighScoreText').textContent = this.highScore;
        document.getElementById('finalStreakText').textContent = this.streak;
        document.getElementById('modalGameOver').classList.add('active');
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.audio.stopBGM();
            document.getElementById('modalPause').classList.add('active');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.audio.startBGM();
            document.getElementById('modalPause').classList.remove('active');
        }
    }

    createExplosion(x, y, color = '#10b981', count = 15) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new MathSnakeParticle(x, y, color));
        }
    }

    showFloatingText(x, y, text) {
        this.floatingTexts.push(new MathSnakeFloatingText(x, y, text));
    }

    showStreakToast(text) {
        const toast = document.getElementById('streakToast');
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    }

    updateHUD() {
        document.getElementById('hudScoreVal').textContent = this.score;
        document.getElementById('hudHighScoreVal').textContent = this.highScore;

        // Render Hearts
        const heartsContainer = document.getElementById('hudLivesContainer');
        heartsContainer.innerHTML = '❤️'.repeat(Math.max(0, this.lives));

        // Combo Badge
        const comboBadge = document.getElementById('hudComboBadge');
        if (this.streakMultiplier > 1) {
            comboBadge.style.display = 'inline-block';
            comboBadge.textContent = `🔥 ${this.streakMultiplier}x Multiplier`;
        } else {
            comboBadge.style.display = 'none';
        }
    }

    /* ==========================================================================
       Canvas Rendering
       ========================================================================== */
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Grid Lines
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }

        // 2. Draw Math Orbs
        this.orbs.forEach(orb => {
            const cx = orb.x * this.cellSize + this.cellSize / 2;
            const cy = orb.y * this.cellSize + this.cellSize / 2;

            ctx.save();
            if (orb.isPowerUp) {
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.arc(cx, cy, this.cellSize * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = '16px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(orb.value, cx, cy);
            } else {
                // Number Orb (Identical styling for all options - NO spoiler hints!)
                ctx.fillStyle = '#d97706';
                ctx.beginPath();
                ctx.arc(cx, cy, this.cellSize * 0.45, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(orb.value, cx, cy);
            }
            ctx.restore();
        });

        // 3. Draw Snake
        this.snake.forEach((segment, idx) => {
            const cx = segment.x * this.cellSize + this.cellSize / 2;
            const cy = segment.y * this.cellSize + this.cellSize / 2;

            ctx.save();
            if (idx === 0) {
                // Head
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.arc(cx, cy, this.cellSize * 0.48, 0, Math.PI * 2);
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#000';
                const eyeOffset = 4;
                ctx.beginPath();
                ctx.arc(cx + this.dir.x * eyeOffset - this.dir.y * eyeOffset, cy + this.dir.y * eyeOffset + this.dir.x * eyeOffset, 2.5, 0, Math.PI * 2);
                ctx.arc(cx + this.dir.x * eyeOffset + this.dir.y * eyeOffset, cy + this.dir.y * eyeOffset - this.dir.x * eyeOffset, 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Body
                const ratio = 1 - (idx / this.snake.length) * 0.4;
                ctx.fillStyle = idx % 2 === 0 ? '#10b981' : '#059669';
                ctx.beginPath();
                ctx.arc(cx, cy, (this.cellSize * 0.44) * ratio, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // 4. Draw Particles & Damage Texts
        this.particles.forEach(p => p.draw(ctx));
        this.floatingTexts.forEach(t => t.draw(ctx));
    }
}

class MathSnakeParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 0.4 + Math.random() * 0.3;
        this.maxLife = this.life;
        this.radius = 2 + Math.random() * 3;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class MathSnakeFloatingText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
        this.y -= 25 * dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.mathSnakeGame = new MathSnakeGame();
});
