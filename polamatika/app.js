/**
 * PolaMatika Game Controller Engine
 */

class PolaMatikaGame {
    constructor() {
        this.currentMode = 'adventure'; // 'adventure' | 'timeattack' | 'endless'
        this.currentLevelIdx = 0;
        this.score = 0;
        this.streak = 0;
        this.highScore = 0;
        this.bestStreak = 0;
        this.solvedCount = 0;
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.currentPuzzle = null;

        this.init();
    }

    init() {
        this.loadStorage();
        this.setupEvents();
        this.renderHomeStats();
    }

    loadStorage() {
        try {
            const saved = localStorage.getItem('polamatika_stats_v1');
            if (saved) {
                const data = JSON.parse(saved);
                this.highScore = data.highScore || 0;
                this.bestStreak = data.bestStreak || 0;
                this.solvedCount = data.solvedCount || 0;
            }
        } catch (e) {}
    }

    saveStorage() {
        try {
            localStorage.setItem('polamatika_stats_v1', JSON.stringify({
                highScore: Math.max(this.highScore, this.score),
                bestStreak: Math.max(this.bestStreak, this.streak),
                solvedCount: this.solvedCount
            }));
        } catch (e) {}
    }

    renderHomeStats() {
        const starsEl = document.getElementById('home-total-stars');
        const streakEl = document.getElementById('home-best-streak');
        const scoreEl = document.getElementById('home-high-score');

        if (starsEl) starsEl.textContent = `${this.solvedCount * 3} / 90`;
        if (streakEl) streakEl.textContent = `${this.bestStreak}x`;
        if (scoreEl) scoreEl.textContent = `${this.highScore}`;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        window.soundEngine.playClick();
    }

    startAdventure() {
        this.currentMode = 'adventure';
        this.currentLevelIdx = 0;
        this.score = 0;
        this.streak = 0;
        this.loadLevel(this.currentLevelIdx);
        this.showScreen('screen-game');
    }

    loadLevel(idx) {
        if (idx >= ADVENTURE_LEVELS.length) {
            alert("Selamat! Anda telah menuntaskan seluruh level di PolaMatika!");
            this.showScreen('screen-home');
            return;
        }

        const puzzle = ADVENTURE_LEVELS[idx];
        this.currentPuzzle = puzzle;

        const catEl = document.getElementById('game-category-pill');
        const titleEl = document.getElementById('puzzle-title');
        const scoreVal = document.getElementById('game-score-val');
        const streakVal = document.getElementById('game-streak-val');
        const hintBox = document.getElementById('hint-visualizer-box');

        if (catEl) catEl.textContent = puzzle.category;
        if (titleEl) titleEl.textContent = puzzle.title;
        if (scoreVal) scoreVal.textContent = this.score;
        if (streakVal) streakVal.textContent = `x${this.streak}`;
        if (hintBox) hintBox.style.display = 'none';

        // Render stage
        const stage = document.getElementById('puzzle-stage');
        stage.innerHTML = '';

        if (puzzle.isMatrix) {
            const matrixGrid = document.createElement('div');
            matrixGrid.className = 'matrix-grid';
            puzzle.matrix.forEach(row => {
                row.forEach(val => {
                    const box = document.createElement('div');
                    box.className = `seq-box ${val === '?' ? 'target' : ''}`;
                    box.textContent = val;
                    matrixGrid.appendChild(box);
                });
            });
            stage.appendChild(matrixGrid);
        } else {
            puzzle.sequence.forEach(val => {
                const box = document.createElement('div');
                box.className = `seq-box ${val === '?' ? 'target' : ''}`;
                box.textContent = val;
                stage.appendChild(box);
            });
        }

        // Render options
        const optsGrid = document.getElementById('options-grid');
        optsGrid.innerHTML = '';
        puzzle.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => this.handleAnswer(opt);
            optsGrid.appendChild(btn);
        });
    }

    handleAnswer(answer) {
        if (answer === this.currentPuzzle.correct) {
            window.soundEngine.playCorrect();
            this.streak++;
            this.score += 100 * this.streak;
            this.solvedCount++;
            this.saveStorage();

            this.showVictoryModal();
        } else {
            window.soundEngine.playWrong();
            this.streak = 0;
            const streakVal = document.getElementById('game-streak-val');
            if (streakVal) streakVal.textContent = `x0`;
            alert(`Jawaban salah! Coba amati polanya kembali dengan bantuan petunjuk.`);
        }
    }

    showVictoryModal() {
        const modal = document.getElementById('modal-victory');
        const ruleEl = document.getElementById('victory-rule');
        const formulaEl = document.getElementById('victory-formula');
        const expEl = document.getElementById('victory-explanation');

        if (ruleEl) ruleEl.textContent = this.currentPuzzle.rule;
        if (formulaEl) formulaEl.textContent = this.currentPuzzle.formula;
        if (expEl) expEl.textContent = this.currentPuzzle.explanation;

        if (modal) modal.classList.add('active');
    }

    nextLevel() {
        document.getElementById('modal-victory').classList.remove('active');
        this.currentLevelIdx++;
        this.loadLevel(this.currentLevelIdx);
    }

    showHint() {
        const hintBox = document.getElementById('hint-visualizer-box');
        const hintText = document.getElementById('hint-text-content');
        if (hintBox && hintText && this.currentPuzzle) {
            hintText.textContent = this.currentPuzzle.hint;
            hintBox.style.display = 'block';
            window.soundEngine.playClick();
        }
    }

    showFormulaModal() {
        const modal = document.getElementById('modal-formula');
        const ruleEl = document.getElementById('modal-formula-rule');
        const formulaEl = document.getElementById('modal-formula-math');
        const stepsEl = document.getElementById('modal-formula-steps');

        if (this.currentPuzzle) {
            if (ruleEl) ruleEl.textContent = this.currentPuzzle.rule;
            if (formulaEl) formulaEl.textContent = this.currentPuzzle.formula;
            if (stepsEl) stepsEl.textContent = this.currentPuzzle.explanation;
        }

        if (modal) modal.classList.add('active');
        window.soundEngine.playClick();
    }

    setupEvents() {
        const modeAdv = document.getElementById('mode-card-adventure');
        if (modeAdv) modeAdv.onclick = () => this.startAdventure();

        const btnQuit = document.getElementById('btn-quit-game');
        if (btnQuit) btnQuit.onclick = () => this.showScreen('screen-home');

        const btnHint = document.getElementById('btn-request-hint');
        if (btnHint) btnHint.onclick = () => this.showHint();

        const btnFormula = document.getElementById('btn-request-formula');
        if (btnFormula) btnFormula.onclick = () => this.showFormulaModal();

        const btnNext = document.getElementById('btn-victory-next');
        if (btnNext) btnNext.onclick = () => this.nextLevel();

        const btnReplay = document.getElementById('btn-victory-replay');
        if (btnReplay) btnReplay.onclick = () => {
            document.getElementById('modal-victory').classList.remove('active');
            this.loadLevel(this.currentLevelIdx);
        };

        const btnCloseFormula = document.getElementById('btn-close-formula');
        if (btnCloseFormula) btnCloseFormula.onclick = () => {
            document.getElementById('modal-formula').classList.remove('active');
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new PolaMatikaGame();
});
