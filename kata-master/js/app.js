/**
 * KataMaster - Main Application Controller
 * Mengatur alur game, state Duolingo, navigasi view, dan interaksi kata
 */

class KataMasterApp {
    constructor() {
        this.state = {
            xp: 0,
            gems: 100,
            streak: 1,
            hearts: 5,
            unlockedLessons: ['u1-l1'],
            completedLessons: [],
            lastActiveDate: new Date().toDateString(),
            darkMode: false,
            soundEnabled: true,
            speechEnabled: true
        };

        this.currentSession = {
            mode: 'pathway', // 'pathway' | 'practice'
            unit: null,
            lesson: null,
            questions: [],
            questionIndex: 0,
            selectedWords: [],
            isAnswerChecked: false,
            mistakes: 0,
            correctCount: 0
        };

        this.init();
    }

    init() {
        this.loadState();
        this.setupEventListeners();
        this.renderHeaderStats();
        this.renderPathway();
        this.applyTheme();
    }

    // ==========================================
    // Local Storage Persistence
    // ==========================================
    loadState() {
        try {
            const saved = localStorage.getItem('katamaster_save');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
            this.checkStreak();
        } catch (e) {
            console.error("Gagal memuat save data:", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem('katamaster_save', JSON.stringify(this.state));
        } catch (e) {
            console.error("Gagal menyimpan save data:", e);
        }
        this.renderHeaderStats();
    }

    checkStreak() {
        const today = new Date().toDateString();
        if (this.state.lastActiveDate !== today) {
            // Cek apakah jeda lebih dari 1 hari untuk reset atau lanjut
            this.state.lastActiveDate = today;
            this.saveState();
        }
    }

    applyTheme() {
        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // ==========================================
    // Header & Stats
    // ==========================================
    renderHeaderStats() {
        const streakEl = document.getElementById('stat-streak-val');
        const gemsEl = document.getElementById('stat-gems-val');
        const heartsEl = document.getElementById('stat-hearts-val');
        const heartsBadge = document.getElementById('stat-hearts-badge');

        if (streakEl) streakEl.textContent = this.state.streak;
        if (gemsEl) gemsEl.textContent = this.state.gems;
        if (heartsEl) heartsEl.textContent = this.state.hearts;

        if (heartsBadge) {
            if (this.state.hearts <= 1) {
                heartsBadge.classList.add('low-hearts');
            } else {
                heartsBadge.classList.remove('low-hearts');
            }
        }
    }

    // ==========================================
    // Mascot SVG Generator
    // ==========================================
    renderMascotSVG(mood = 'idle') {
        let eyeSvg = '';
        let mouthSvg = '';
        let extraSvg = '';

        if (mood === 'cheer') {
            eyeSvg = `
                <path d="M 32 45 Q 40 38 48 45" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round" fill="none"/>
                <path d="M 56 45 Q 64 38 72 45" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round" fill="none"/>
            `;
            mouthSvg = `<path d="M 44 56 Q 52 66 60 56 Z" fill="#ff4b4b"/>`;
            extraSvg = `
                <!-- Cheering Stars -->
                <text x="10" y="25" font-size="16" fill="#ffc800">✨</text>
                <text x="80" y="25" font-size="16" fill="#ffc800">✨</text>
            `;
        } else if (mood === 'sad') {
            eyeSvg = `
                <circle cx="40" cy="45" r="4" fill="#3c3c3c"/>
                <circle cx="64" cy="45" r="4" fill="#3c3c3c"/>
                <path d="M 32 38 Q 40 44 48 40" stroke="#3c3c3c" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M 56 40 Q 64 44 72 38" stroke="#3c3c3c" stroke-width="3" stroke-linecap="round" fill="none"/>
            `;
            mouthSvg = `<path d="M 46 60 Q 52 54 58 60" stroke="#3c3c3c" stroke-width="3" stroke-linecap="round" fill="none"/>`;
            extraSvg = `
                <!-- Tear drop -->
                <path d="M 34 50 Q 32 55 35 56 Q 37 56 36 50 Z" fill="#1cb0f6"/>
            `;
        } else if (mood === 'party') {
            eyeSvg = `
                <path d="M 32 45 Q 40 38 48 45" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round" fill="none"/>
                <path d="M 56 45 Q 64 38 72 45" stroke="#3c3c3c" stroke-width="4" stroke-linecap="round" fill="none"/>
            `;
            mouthSvg = `<path d="M 44 56 Q 52 66 60 56 Z" fill="#ff4b4b"/>`;
            extraSvg = `
                <!-- Party Hat -->
                <polygon points="52,2 36,25 68,25" fill="#ff9600" stroke="#e07f00" stroke-width="2"/>
                <circle cx="52" cy="2" r="5" fill="#ffc800"/>
            `;
        } else {
            // Idle / Normal
            eyeSvg = `
                <circle cx="40" cy="44" r="8" fill="#ffffff" stroke="#3c3c3c" stroke-width="2"/>
                <circle cx="42" cy="44" r="4" fill="#3c3c3c"/>
                <circle cx="44" cy="42" r="1.5" fill="#ffffff"/>
                
                <circle cx="64" cy="44" r="8" fill="#ffffff" stroke="#3c3c3c" stroke-width="2"/>
                <circle cx="66" cy="44" r="4" fill="#3c3c3c"/>
                <circle cx="68" cy="42" r="1.5" fill="#ffffff"/>
            `;
            mouthSvg = `
                <polygon points="52,48 46,55 58,55" fill="#ff9600" stroke="#e07f00" stroke-width="1.5"/>
            `;
        }

        return `
            <svg class="mascot-svg" viewBox="0 0 104 104" xmlns="http://www.w3.org/2000/svg">
                <!-- Mascot Body (Kiko the Owl) -->
                <ellipse cx="52" cy="56" rx="36" ry="38" fill="#58cc02" stroke="#46a302" stroke-width="3"/>
                <!-- Tummy -->
                <ellipse cx="52" cy="64" rx="22" ry="24" fill="#d7ffb8"/>
                <!-- Cheeks -->
                <ellipse cx="30" cy="54" rx="6" ry="4" fill="#ff9600" opacity="0.3"/>
                <ellipse cx="74" cy="54" rx="6" ry="4" fill="#ff9600" opacity="0.3"/>
                <!-- Wings -->
                <path d="M 16 54 Q 10 65 20 75 Q 24 65 22 54 Z" fill="#46a302"/>
                <path d="M 88 54 Q 94 65 84 75 Q 80 65 82 54 Z" fill="#46a302"/>
                <!-- Feet -->
                <ellipse cx="40" cy="94" rx="8" ry="4" fill="#ff9600"/>
                <ellipse cx="64" cy="94" rx="8" ry="4" fill="#ff9600"/>
                ${eyeSvg}
                ${mouthSvg}
                ${extraSvg}
            </svg>
        `;
    }

    updateMascots(mood = 'idle') {
        const containers = document.querySelectorAll('.mascot-container');
        containers.forEach(c => {
            c.innerHTML = this.renderMascotSVG(mood);
        });
    }

    // ==========================================
    // Pathway View (Duolingo Home Tree)
    // ==========================================
    renderPathway() {
        const container = document.getElementById('pathway-content');
        if (!container) return;

        container.innerHTML = '';

        GAME_UNITS.forEach(unit => {
            const unitSection = document.createElement('div');
            unitSection.className = 'unit-section';

            // Unit Banner
            const banner = document.createElement('div');
            banner.className = 'unit-banner';
            banner.style.background = `linear-gradient(135deg, ${unit.color} 0%, rgba(0,0,0,0.15) 100%), ${unit.color}`;
            banner.innerHTML = `
                <div class="unit-info">
                    <span class="unit-badge-number">Unit ${unit.number}</span>
                    <h3>${unit.icon} ${unit.title}</h3>
                    <p>${unit.subtitle}</p>
                </div>
            `;
            unitSection.appendChild(banner);

            // Path Nodes
            const nodesContainer = document.createElement('div');
            nodesContainer.className = 'path-nodes';

            unit.lessons.forEach((lesson, lIdx) => {
                const isCompleted = this.state.completedLessons.includes(lesson.id);
                const isUnlocked = this.state.unlockedLessons.includes(lesson.id);
                const isCurrent = isUnlocked && !isCompleted;

                const wrapper = document.createElement('div');
                wrapper.className = 'path-node-wrapper';

                const nodeBtn = document.createElement('div');
                nodeBtn.className = `path-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`;
                
                let nodeIcon = '⭐';
                if (!isUnlocked) nodeIcon = '🔒';
                else if (isCompleted) nodeIcon = '🏆';
                else if (lIdx === unit.lessons.length - 1) nodeIcon = '👑';
                else nodeIcon = '📖';

                nodeBtn.innerHTML = `<span>${nodeIcon}</span>`;

                if (isUnlocked) {
                    nodeBtn.addEventListener('click', () => {
                        this.startLesson(unit, lesson);
                    });
                }

                const label = document.createElement('span');
                label.className = 'node-label';
                label.textContent = lesson.title;

                wrapper.appendChild(nodeBtn);
                wrapper.appendChild(label);
                nodesContainer.appendChild(wrapper);
            });

            unitSection.appendChild(nodesContainer);
            container.appendChild(unitSection);
        });
    }

    // ==========================================
    // Gameplay & Session Logic
    // ==========================================
    startLesson(unit, lesson) {
        if (this.state.hearts <= 0) {
            this.showNoHeartsModal();
            return;
        }

        this.currentSession = {
            mode: 'pathway',
            unit: unit,
            lesson: lesson,
            questions: [...lesson.questions],
            questionIndex: 0,
            selectedWords: [],
            isAnswerChecked: false,
            mistakes: 0,
            correctCount: 0
        };

        this.switchView('quiz-view');
        this.renderCurrentQuestion();
    }

    startQuickPractice() {
        const pool = [...QUICK_PRACTICE_POOL];
        // Acak soal
        pool.sort(() => Math.random() - 0.5);

        this.currentSession = {
            mode: 'practice',
            unit: { title: "Latihan Cepat" },
            lesson: { title: "Pemulihan Nyawa & Latihan", xp: 15 },
            questions: pool.slice(0, 4),
            questionIndex: 0,
            selectedWords: [],
            isAnswerChecked: false,
            mistakes: 0,
            correctCount: 0
        };

        this.switchView('quiz-view');
        this.renderCurrentQuestion();
    }

    renderCurrentQuestion() {
        const session = this.currentSession;
        const q = session.questions[session.questionIndex];
        if (!q) {
            this.finishLesson();
            return;
        }

        session.selectedWords = [];
        session.isAnswerChecked = false;

        // Reset Drawer & Button state
        this.hideBottomSheet();
        this.updateCheckButton();

        // Update Progress Bar
        const progressPercent = (session.questionIndex / session.questions.length) * 100;
        const progressFill = document.getElementById('quiz-progress-fill');
        if (progressFill) progressFill.style.width = `${progressPercent}%`;

        // Update Hearts Display
        const heartsDisplay = document.getElementById('quiz-hearts-val');
        if (heartsDisplay) heartsDisplay.textContent = this.state.hearts;

        // Render Mascot
        this.updateMascots('idle');

        // Render Instruction & Prompt
        const instrEl = document.getElementById('quiz-instruction');
        const promptEl = document.getElementById('quiz-prompt-text');
        const audioControls = document.getElementById('quiz-audio-controls');

        if (instrEl) instrEl.textContent = q.instruction || "Susun kalimat yang tepat:";
        if (promptEl) promptEl.textContent = q.prompt;

        // Audio TTS button
        if (audioControls) {
            audioControls.innerHTML = '';
            const btnNormal = document.createElement('button');
            btnNormal.className = 'audio-btn';
            btnNormal.title = 'Dengarkan suara normal';
            btnNormal.innerHTML = '🔊';
            btnNormal.addEventListener('click', () => {
                audio.speak(q.prompt, q.promptLang || 'id-ID', 1.0);
            });

            const btnSlow = document.createElement('button');
            btnSlow.className = 'audio-btn slow-btn';
            btnSlow.title = 'Dengarkan pelan-pelan';
            btnSlow.innerHTML = '🐢';
            btnSlow.addEventListener('click', () => {
                audio.speak(q.prompt, q.promptLang || 'id-ID', 0.65);
            });

            audioControls.appendChild(btnNormal);
            audioControls.appendChild(btnSlow);

            // Auto-speak on question open if listening type
            if (q.type === 'listening') {
                setTimeout(() => {
                    audio.speak(q.prompt, q.promptLang || 'en-US', 1.0);
                }, 400);
            }
        }

        // Render Answer Slots
        this.renderAnswerSlots();

        // Prepare & Shuffle Word Bank
        this.prepareWordBank(q);
    }

    prepareWordBank(q) {
        const bankContainer = document.getElementById('quiz-word-bank');
        if (!bankContainer) return;
        bankContainer.innerHTML = '';

        let words = [];
        if (q.type === 'scramble') {
            // Eja huruf/suku kata
            words = [...q.correctLetters, ...(q.distractors || [])];
        } else {
            // Kalimat
            words = [...q.correctWords, ...(q.distractors || [])];
        }

        // Shuffle
        words.sort(() => Math.random() - 0.5);

        words.forEach((word, idx) => {
            const chip = document.createElement('button');
            chip.className = 'word-chip';
            chip.textContent = word;
            chip.dataset.bankIndex = idx;
            chip.dataset.word = word;

            chip.addEventListener('click', () => {
                this.handleSelectWord(word, idx, chip);
            });

            bankContainer.appendChild(chip);
        });
    }

    handleSelectWord(word, bankIndex, chipEl) {
        if (this.currentSession.isAnswerChecked) return;

        audio.playPop();

        // Tambah ke selected
        this.currentSession.selectedWords.push({
            word: word,
            bankIndex: bankIndex
        });

        // Ubah visual di word bank menjadi used
        chipEl.classList.add('used');

        this.renderAnswerSlots();
        this.updateCheckButton();
    }

    handleRemoveWord(selectedIdx) {
        if (this.currentSession.isAnswerChecked) return;

        audio.playReturn();

        const item = this.currentSession.selectedWords[selectedIdx];
        if (!item) return;

        // Hapus dari selected
        this.currentSession.selectedWords.splice(selectedIdx, 1);

        // Aktifkan kembali di word bank
        const bankContainer = document.getElementById('quiz-word-bank');
        if (bankContainer) {
            const chipEl = bankContainer.querySelector(`[data-bank-index="${item.bankIndex}"]`);
            if (chipEl) chipEl.classList.remove('used');
        }

        this.renderAnswerSlots();
        this.updateCheckButton();
    }

    renderAnswerSlots() {
        const slotContainer = document.getElementById('quiz-answer-zone');
        if (!slotContainer) return;

        slotContainer.innerHTML = '';

        if (this.currentSession.selectedWords.length === 0) {
            slotContainer.classList.add('empty-placeholder');
            return;
        }

        slotContainer.classList.remove('empty-placeholder');

        this.currentSession.selectedWords.forEach((item, idx) => {
            const chip = document.createElement('button');
            chip.className = 'word-chip answer-chip';
            chip.textContent = item.word;
            chip.addEventListener('click', () => {
                this.handleRemoveWord(idx);
            });
            slotContainer.appendChild(chip);
        });
    }

    updateCheckButton() {
        const checkBtn = document.getElementById('quiz-check-btn');
        if (!checkBtn) return;

        const hasWords = this.currentSession.selectedWords.length > 0;
        checkBtn.disabled = !hasWords;
    }

    // ==========================================
    // Answer Evaluation
    // ==========================================
    checkAnswer() {
        if (this.currentSession.isAnswerChecked) {
            this.goToNextQuestion();
            return;
        }

        const session = this.currentSession;
        const q = session.questions[session.questionIndex];
        session.isAnswerChecked = true;

        const cleanString = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        const userAnswer = session.selectedWords.map(w => w.word).join(' ');
        
        let isCorrect = false;
        let targetAnswer = '';

        if (q.type === 'scramble') {
            const userWord = session.selectedWords.map(w => w.word).join('').replace(/\s+/g, '').toUpperCase();
            targetAnswer = q.targetWord.replace(/\s+/g, '').toUpperCase();
            isCorrect = (userWord === targetAnswer);
        } else {
            targetAnswer = q.correctWords.join(' ');
            isCorrect = (cleanString(userAnswer) === cleanString(targetAnswer));
        }

        if (isCorrect) {
            // BENAR
            audio.playCorrect();
            this.updateMascots('cheer');
            session.correctCount++;
            confetti.burst(window.innerWidth / 2, window.innerHeight * 0.7, 40);

            this.showBottomSheet({
                type: 'correct',
                title: this.getRandomCompliment(),
                message: q.tip || "Jawabanmu tepat sekali!"
            });
        } else {
            // SALAH
            audio.playWrong();
            this.updateMascots('sad');
            session.mistakes++;
            this.state.hearts = Math.max(0, this.state.hearts - 1);
            this.saveState();

            // Efek guncang di answer zone
            const answerZone = document.getElementById('quiz-answer-zone');
            if (answerZone) {
                answerZone.classList.add('shake');
                setTimeout(() => answerZone.classList.remove('shake'), 500);
            }

            const formattedTarget = q.type === 'scramble' ? q.targetWord : q.correctWords.join(' ');
            this.showBottomSheet({
                type: 'wrong',
                title: "Jawaban Kurang Tepat",
                message: `Solusi yang benar: <strong>${formattedTarget}</strong><br><small style="opacity: 0.85;">${q.tip || ''}</small>`
            });

            if (this.state.hearts <= 0) {
                setTimeout(() => {
                    this.showNoHeartsModal();
                }, 1200);
            }
        }
    }

    getRandomCompliment() {
        const compliments = [
            "Hebat sekali! 🌟",
            "Luar biasa! 🔥",
            "Tepat sekali! 🎯",
            "Kerja bagus! 👏",
            "Pintar sekali! 💡",
            "Sempurna! ✨"
        ];
        return compliments[Math.floor(Math.random() * compliments.length)];
    }

    showBottomSheet({ type, title, message }) {
        const sheet = document.getElementById('bottom-result-sheet');
        const iconEl = document.getElementById('sheet-icon');
        const titleEl = document.getElementById('sheet-title');
        const descEl = document.getElementById('sheet-desc');
        const continueBtn = document.getElementById('sheet-continue-btn');

        if (!sheet) return;

        sheet.className = `bottom-sheet show ${type}`;
        if (iconEl) iconEl.innerHTML = (type === 'correct') ? '✓' : '✗';
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.innerHTML = message;

        if (continueBtn) {
            continueBtn.className = (type === 'correct') ? 'duo-btn duo-btn-green' : 'duo-btn duo-btn-red';
            continueBtn.focus();
        }
    }

    hideBottomSheet() {
        const sheet = document.getElementById('bottom-result-sheet');
        if (sheet) {
            sheet.classList.remove('show', 'correct', 'wrong');
        }
    }

    goToNextQuestion() {
        this.currentSession.questionIndex++;
        if (this.currentSession.questionIndex >= this.currentSession.questions.length) {
            this.finishLesson();
        } else {
            this.renderCurrentQuestion();
        }
    }

    // ==========================================
    // Finish & Celebration
    // ==========================================
    finishLesson() {
        const session = this.currentSession;
        audio.playVictory();
        confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 160);

        // Hitung Hadiah
        const xpEarned = session.lesson ? session.lesson.xp : 20;
        const gemsEarned = 10;
        this.state.xp += xpEarned;
        this.state.gems += gemsEarned;

        // Pemulihan 1 nyawa jika mode latihan
        if (session.mode === 'practice') {
            this.state.hearts = Math.min(5, this.state.hearts + 2);
        }

        // Buka lesson berikutnya di pathway
        if (session.mode === 'pathway' && session.lesson) {
            if (!this.state.completedLessons.includes(session.lesson.id)) {
                this.state.completedLessons.push(session.lesson.id);
            }

            // Cari lesson index berikutnya
            const currentUnit = session.unit;
            const currentLIdx = currentUnit.lessons.findIndex(l => l.id === session.lesson.id);
            if (currentLIdx !== -1 && currentLIdx + 1 < currentUnit.lessons.length) {
                const nextLesson = currentUnit.lessons[currentLIdx + 1];
                if (!this.state.unlockedLessons.includes(nextLesson.id)) {
                    this.state.unlockedLessons.push(nextLesson.id);
                }
            } else {
                // Buka unit berikutnya jika ada
                const nextUnitNum = currentUnit.number + 1;
                const nextUnit = GAME_UNITS.find(u => u.number === nextUnitNum);
                if (nextUnit && nextUnit.lessons[0]) {
                    if (!this.state.unlockedLessons.includes(nextUnit.lessons[0].id)) {
                        this.state.unlockedLessons.push(nextUnit.lessons[0].id);
                    }
                }
            }
        }

        this.saveState();
        this.renderPathway();

        // Tampilkan Modal Kemenangan
        const victoryModal = document.getElementById('victory-modal');
        const xpVal = document.getElementById('victory-xp-val');
        const accuracyVal = document.getElementById('victory-acc-val');
        const mascotContainer = document.getElementById('victory-mascot');

        if (xpVal) xpVal.textContent = `+${xpEarned} XP`;
        
        const totalQ = session.questions.length;
        const accuracy = Math.round((session.correctCount / Math.max(1, totalQ)) * 100);
        if (accuracyVal) accuracyVal.textContent = `${accuracy}%`;

        if (mascotContainer) {
            mascotContainer.innerHTML = this.renderMascotSVG('party');
        }

        if (victoryModal) {
            victoryModal.classList.add('active');
        }
    }

    // ==========================================
    // Modals & Navigation
    // ==========================================
    showNoHeartsModal() {
        const modal = document.getElementById('no-hearts-modal');
        if (modal) modal.classList.add('active');
    }

    refillHeartsWithGems() {
        if (this.state.gems >= 30) {
            this.state.gems -= 30;
            this.state.hearts = 5;
            this.saveState();
            audio.playCorrect();
            this.closeAllModals();
        } else {
            alert("Permata kamu tidak cukup! Silakan selesaikan mode Latihan Cepat untuk memulihkan nyawa.");
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    switchView(viewId) {
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
    }

    // ==========================================
    // Event Listeners
    // ==========================================
    setupEventListeners() {
        // Tombol Periksa Jawaban
        const checkBtn = document.getElementById('quiz-check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswer());
        }

        // Tombol Lanjut di Bottom Sheet
        const continueBtn = document.getElementById('sheet-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideBottomSheet();
                this.goToNextQuestion();
            });
        }

        // Tombol Kembali / Tutup Quiz
        const closeQuizBtn = document.getElementById('quiz-close-btn');
        if (closeQuizBtn) {
            closeQuizBtn.addEventListener('click', () => {
                if (confirm("Apakah kamu yakin ingin keluar dari sesi latihan ini?")) {
                    this.switchView('pathway-view');
                    this.renderPathway();
                }
            });
        }

        // Tombol Latihan Cepat di Home
        const quickPracticeBtn = document.getElementById('start-quick-practice-btn');
        if (quickPracticeBtn) {
            quickPracticeBtn.addEventListener('click', () => this.startQuickPractice());
        }

        // Modal Kemenangan Selesai
        const victoryNextBtn = document.getElementById('victory-next-btn');
        if (victoryNextBtn) {
            victoryNextBtn.addEventListener('click', () => {
                this.closeAllModals();
                this.switchView('pathway-view');
                this.renderPathway();
            });
        }

        // Modal Kehabisan Nyawa: Latihan
        const practiceRefillBtn = document.getElementById('btn-refill-practice');
        if (practiceRefillBtn) {
            practiceRefillBtn.addEventListener('click', () => {
                this.closeAllModals();
                this.startQuickPractice();
            });
        }

        // Modal Kehabisan Nyawa: Beli Permata
        const gemRefillBtn = document.getElementById('btn-refill-gems');
        if (gemRefillBtn) {
            gemRefillBtn.addEventListener('click', () => this.refillHeartsWithGems());
        }

        // Modal Kehabisan Nyawa: Kembali ke Menu
        const exitRefillBtn = document.getElementById('btn-refill-exit');
        if (exitRefillBtn) {
            exitRefillBtn.addEventListener('click', () => {
                this.closeAllModals();
                this.switchView('pathway-view');
            });
        }

        // Tombol Pengaturan / Settings
        const settingsBtn = document.getElementById('btn-open-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const modal = document.getElementById('settings-modal');
                if (modal) modal.classList.add('active');
            });
        }

        // Toggle Dark Mode
        const toggleThemeBtn = document.getElementById('toggle-theme-btn');
        if (toggleThemeBtn) {
            toggleThemeBtn.addEventListener('click', () => {
                this.state.darkMode = !this.state.darkMode;
                this.applyTheme();
                this.saveState();
            });
        }

        // Toggle Sound
        const toggleSoundBtn = document.getElementById('toggle-sound-btn');
        if (toggleSoundBtn) {
            toggleSoundBtn.addEventListener('click', () => {
                this.state.soundEnabled = !this.state.soundEnabled;
                audio.setSoundEnabled(this.state.soundEnabled);
                toggleSoundBtn.textContent = this.state.soundEnabled ? "🔊 Suara: AKTIF" : "🔇 Suara: MATI";
                this.saveState();
            });
        }

        // Tutup Modal Settings
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.closeAllModals());
        }

        // Reset Data Game
        const resetDataBtn = document.getElementById('reset-data-btn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm("Reset seluruh progres dan mulai dari awal?")) {
                    localStorage.removeItem('katamaster_save');
                    location.reload();
                }
            });
        }

        // Keyboard Shortcuts (Enter untuk Check/Continue)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const sheet = document.getElementById('bottom-result-sheet');
                if (sheet && sheet.classList.contains('show')) {
                    const continueBtn = document.getElementById('sheet-continue-btn');
                    if (continueBtn) continueBtn.click();
                } else {
                    const checkBtn = document.getElementById('quiz-check-btn');
                    if (checkBtn && !checkBtn.disabled) checkBtn.click();
                }
            }
        });
    }
}

// Inisialisasi Game saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KataMasterApp();
});
