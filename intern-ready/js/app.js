/**
 * InternReady Core Engine & Interactive State Controller
 */

class InternReadyApp {
    constructor() {
        // CV state
        this.cvData = {
            fullName: 'Wendy Simanjuntak',
            roleTitle: 'Software Engineering Intern',
            email: 'wendy.simanjuntak@del.ac.id',
            phone: '+62 812-3456-7890',
            linkedin: 'linkedin.com/in/wendysimanjuntak',
            github: 'github.com/wendysimanjuntak',
            summary: 'Mahasiswa Informatika Institut Teknologi Del yang berdedikasi tinggi dengan ketertarikan mendalam pada pengembangan Fullstack Web, API backend, dan algoritma. Memiliki pengalaman mengembangkan aplikasi kampus dan proyek kolaboratif berbasis Git.',
            education: 'Institut Teknologi Del (2022 - Sekarang)\nS1 Informatika • IPK: 3.65 / 4.00',
            skills: 'JavaScript, Python, PostgreSQL, React, Node.js, Git, REST API, Docker, Agile Scrum',
            projects: '• RoomCheck IT Del: Mengembangkan sistem pelaporan asrama real-time untuk 1.000+ mahasiswa.\n• SpotFinder Del: Merancang visualisasi keterisian kursi perpustakaan dengan reservasi kilat.\n• LifeQuest RPG: Membangun mesin gamifikasi produktivitas harian dengan Web Audio API.'
        };

        // Interview state
        this.selectedInterviewCategory = 'hr_star';
        this.currentQuestionIdx = 0;
        this.interviewHistory = [];

        // Skills state
        this.checkedSkillIds = new Set();

        // Simulation state
        this.simulationStep = 0;
        this.simulationScore = 0;

        this.init();
    }

    init() {
        this.loadState();
        this.setupEventListeners();
        this.renderAll();
    }

    loadState() {
        try {
            const savedCV = localStorage.getItem('internready_cv_v1');
            const savedSkills = localStorage.getItem('internready_skills_v1');
            if (savedCV) this.cvData = Object.assign(this.cvData, JSON.parse(savedCV));
            if (savedSkills) this.checkedSkillIds = new Set(JSON.parse(savedSkills));
        } catch (e) {
            console.error("Gagal memuat state InternReady:", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem('internready_cv_v1', JSON.stringify(this.cvData));
            localStorage.setItem('internready_skills_v1', JSON.stringify(Array.from(this.checkedSkillIds)));
        } catch (e) {
            console.error("Gagal menyimpan state InternReady:", e);
        }
    }

    // ==========================================
    // Render Functions
    // ==========================================
    renderAll() {
        this.renderCVEditor();
        this.renderCVPreview();
        this.calculateATSScore();
        this.renderInterviewQuestion();
        this.renderSkillsRoadmap();
        this.renderSimulation();
        this.calculateGlobalReadiness();
    }

    renderCVEditor() {
        const nameInput = document.getElementById('cv-input-name');
        const roleInput = document.getElementById('cv-input-role');
        const emailInput = document.getElementById('cv-input-email');
        const phoneInput = document.getElementById('cv-input-phone');
        const summaryInput = document.getElementById('cv-input-summary');
        const eduInput = document.getElementById('cv-input-edu');
        const skillsInput = document.getElementById('cv-input-skills');
        const projInput = document.getElementById('cv-input-projects');

        if (nameInput) nameInput.value = this.cvData.fullName;
        if (roleInput) roleInput.value = this.cvData.roleTitle;
        if (emailInput) emailInput.value = this.cvData.email;
        if (phoneInput) phoneInput.value = this.cvData.phone;
        if (summaryInput) summaryInput.value = this.cvData.summary;
        if (eduInput) eduInput.value = this.cvData.education;
        if (skillsInput) skillsInput.value = this.cvData.skills;
        if (projInput) projInput.value = this.cvData.projects;
    }

    renderCVPreview() {
        const preview = document.getElementById('cv-preview-content');
        if (!preview) return;

        preview.innerHTML = `
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
                <h1 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0;">${this.cvData.fullName}</h1>
                <div style="font-size: 1rem; font-weight: 700; color: #2563eb; margin-top: 2px;">${this.cvData.roleTitle}</div>
                <div style="font-size: 0.85rem; color: #64748b; margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <span>📧 ${this.cvData.email}</span>
                    <span>📱 ${this.cvData.phone}</span>
                    <span>🔗 ${this.cvData.github}</span>
                </div>
            </div>

            <div style="margin-bottom: 14px;">
                <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Ringkasan Profesional</h3>
                <p style="font-size: 0.88rem; line-height: 1.5; color: #334155;">${this.cvData.summary}</p>
            </div>

            <div style="margin-bottom: 14px;">
                <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Pendidikan</h3>
                <p style="font-size: 0.88rem; line-height: 1.5; color: #334155; white-space: pre-line;">${this.cvData.education}</p>
            </div>

            <div style="margin-bottom: 14px;">
                <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Keahlian Teknis</h3>
                <p style="font-size: 0.88rem; line-height: 1.5; color: #334155;">${this.cvData.skills}</p>
            </div>

            <div>
                <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">Proyek Unggulan</h3>
                <p style="font-size: 0.88rem; line-height: 1.5; color: #334155; white-space: pre-line;">${this.cvData.projects}</p>
            </div>
        `;
    }

    calculateATSScore() {
        let score = 50; // Base score
        const fullText = (this.cvData.summary + ' ' + this.cvData.skills + ' ' + this.cvData.projects).toLowerCase();

        // Check action verbs
        ATS_VERBS.forEach(verb => {
            if (fullText.includes(verb.toLowerCase())) score += 4;
        });

        // Check metrics / numbers in projects
        if (/\d+/.test(this.cvData.projects)) score += 10;
        if (this.cvData.skills.length > 20) score += 10;
        if (this.cvData.summary.length > 50) score += 10;

        score = Math.min(98, score);

        const meterVal = document.getElementById('ats-score-val');
        const meterBar = document.getElementById('ats-score-bar');
        const meterTip = document.getElementById('ats-score-tip');

        if (meterVal) meterVal.textContent = `${score}%`;
        if (meterBar) meterBar.style.width = `${score}%`;
        if (meterTip) {
            if (score >= 85) meterTip.textContent = '✅ Skor ATS Sangat Bagus! CV Anda siap dikirim ke rekruter magang.';
            else meterTip.textContent = '💡 Tambahkan kata kerja aksi terukur dan angka dampak pada deskripsi proyek Anda.';
        }
    }

    // ==========================================
    // Mock Interview Simulation
    // ==========================================
    renderInterviewQuestion() {
        const bank = INTERVIEW_BANKS[this.selectedInterviewCategory];
        if (!bank || !bank.questions) return;

        const currentQ = bank.questions[this.currentQuestionIdx % bank.questions.length];
        const roleLabel = document.getElementById('interview-role-label');
        const questionEl = document.getElementById('interview-question-text');
        const tipsEl = document.getElementById('interview-tips-text');
        const feedbackContainer = document.getElementById('interview-feedback-box');

        if (roleLabel) roleLabel.textContent = bank.roleTitle;
        if (questionEl) questionEl.textContent = currentQ.question;
        if (tipsEl) tipsEl.textContent = currentQ.tips;
        if (feedbackContainer) feedbackContainer.style.display = 'none';

        const answerInput = document.getElementById('interview-answer-input');
        if (answerInput) answerInput.value = '';
    }

    speakCurrentQuestion() {
        const bank = INTERVIEW_BANKS[this.selectedInterviewCategory];
        if (!bank) return;
        const currentQ = bank.questions[this.currentQuestionIdx % bank.questions.length];
        window.internAudio.playInterviewerChime();
        window.internAudio.speakQuestion(currentQ.question);
    }

    evaluateInterviewAnswer() {
        const answerInput = document.getElementById('interview-answer-input');
        if (!answerInput || !answerInput.value.trim()) {
            alert("Silakan ketik atau sampaikan jawaban Anda terlebih dahulu.");
            return;
        }

        const answer = answerInput.value.toLowerCase();
        const bank = INTERVIEW_BANKS[this.selectedInterviewCategory];
        const currentQ = bank.questions[this.currentQuestionIdx % bank.questions.length];

        let matchedKeywords = [];
        currentQ.keywords.forEach(kw => {
            if (answer.includes(kw.toLowerCase())) {
                matchedKeywords.push(kw);
            }
        });

        const scorePercent = Math.min(100, Math.max(50, Math.round((matchedKeywords.length / currentQ.keywords.length) * 100)));
        const feedbackContainer = document.getElementById('interview-feedback-box');
        const scoreEl = document.getElementById('feedback-score');
        const notesEl = document.getElementById('feedback-notes');

        if (scoreEl) scoreEl.textContent = `Skor Kesesuaian Jawaban: ${scorePercent}%`;
        if (notesEl) {
            notesEl.innerHTML = `
                <div><strong>Kata Kunci Teridentifikasi:</strong> ${matchedKeywords.length > 0 ? matchedKeywords.join(', ') : 'Belum spesifik'}</div>
                <div style="margin-top: 6px;"><strong>Evaluasi Pewawancara:</strong> ${scorePercent >= 75 ? 'Penyampaian terstruktur dan menjawab inti pertanyaan dengan baik!' : 'Jawaban Anda cukup baik, namun cobalah menambahkan contoh konkret situasi nyata dengan metode STAR.'}</div>
            `;
        }

        if (feedbackContainer) feedbackContainer.style.display = 'block';
        window.internAudio.playSuccess();
        this.calculateGlobalReadiness();
    }

    nextInterviewQuestion() {
        const bank = INTERVIEW_BANKS[this.selectedInterviewCategory];
        this.currentQuestionIdx = (this.currentQuestionIdx + 1) % bank.questions.length;
        this.renderInterviewQuestion();
        window.internAudio.playClick();
    }

    // ==========================================
    // Skills Checklist & Roadmap
    // ==========================================
    renderSkillsRoadmap() {
        const container = document.getElementById('skills-roadmap-container');
        if (!container) return;

        container.innerHTML = '';

        SKILL_ROADMAPS.forEach(group => {
            const section = document.createElement('div');
            section.style.marginBottom = '20px';

            section.innerHTML = `
                <h4 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 10px;">${group.role}</h4>
                <div class="skills-grid">
                    ${group.skills.map(sk => {
                        const isChecked = this.checkedSkillIds.has(sk.id);
                        return `
                            <div class="skill-card ${isChecked ? 'checked' : ''}" onclick="app.toggleSkill('${sk.id}')">
                                <div class="custom-checkbox">${isChecked ? '✓' : ''}</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.92rem; font-weight: 700; color: #f8fafc;">${sk.name}</div>
                                    <span style="font-size: 0.72rem; font-weight: 800; color: var(--primary-light); text-transform: uppercase;">
                                        Level: ${sk.level}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            container.appendChild(section);
        });
    }

    toggleSkill(skillId) {
        if (this.checkedSkillIds.has(skillId)) {
            this.checkedSkillIds.delete(skillId);
        } else {
            this.checkedSkillIds.add(skillId);
            window.internAudio.playSuccess();
        }

        this.saveState();
        this.renderSkillsRoadmap();
        this.calculateGlobalReadiness();
    }

    // ==========================================
    // Day-1 Simulation
    // ==========================================
    renderSimulation() {
        const container = document.getElementById('simulation-stage');
        if (!container) return;

        const currentSim = ONBOARDING_SIMULATION[this.simulationStep % ONBOARDING_SIMULATION.length];

        container.innerHTML = `
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 28px;">
                <span style="font-size: 0.78rem; font-weight: 800; background: rgba(16, 185, 129, 0.2); color: var(--emerald); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
                    Skenario Interaktif Hari Pertama Magang
                </span>
                <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 8px;">${currentSim.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 6px; line-height: 1.5;">${currentSim.scenario}</p>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                    ${currentSim.options.map((opt, i) => `
                        <button class="btn-secondary" style="text-align: left; padding: 14px 18px; border-radius: var(--radius-md); font-size: 0.92rem; line-height: 1.4;"
                                onclick="app.chooseSimulationOption(${i})">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>

                <div id="sim-feedback-box" style="display: none; margin-top: 16px; background: rgba(37, 99, 235, 0.12); border: 1px solid var(--primary); padding: 16px; border-radius: var(--radius-md);">
                    <div id="sim-feedback-score" style="font-weight: 800; color: #fff;"></div>
                    <div id="sim-feedback-text" style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;"></div>
                </div>
            </div>
        `;
    }

    chooseSimulationOption(idx) {
        const currentSim = ONBOARDING_SIMULATION[this.simulationStep % ONBOARDING_SIMULATION.length];
        const chosen = currentSim.options[idx];

        const box = document.getElementById('sim-feedback-box');
        const scoreEl = document.getElementById('sim-feedback-score');
        const textEl = document.getElementById('sim-feedback-text');

        if (scoreEl) scoreEl.textContent = `Skor Keputusan Profesional: ${chosen.score} / 100`;
        if (textEl) textEl.textContent = chosen.feedback;
        if (box) box.style.display = 'block';

        if (chosen.score === 100) window.internAudio.playSuccess();
        else window.internAudio.playClick();
    }

    calculateGlobalReadiness() {
        const totalSkills = 11;
        const checkedCount = this.checkedSkillIds.size;
        const skillRatio = checkedCount / totalSkills;

        const globalScore = Math.min(100, Math.round(50 + skillRatio * 50));
        const scoreEl = document.getElementById('global-readiness-val');
        if (scoreEl) scoreEl.textContent = `${globalScore}%`;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tabId = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const target = document.getElementById(tabId);
                if (target) target.classList.add('active');
                window.internAudio.playClick();
            };
        });

        // CV Form live updating
        const bindInput = (id, key) => {
            const el = document.getElementById(id);
            if (el) {
                el.oninput = (e) => {
                    this.cvData[key] = e.target.value;
                    this.renderCVPreview();
                    this.calculateATSScore();
                    this.saveState();
                };
            }
        };

        bindInput('cv-input-name', 'fullName');
        bindInput('cv-input-role', 'roleTitle');
        bindInput('cv-input-email', 'email');
        bindInput('cv-input-phone', 'phone');
        bindInput('cv-input-summary', 'summary');
        bindInput('cv-input-edu', 'education');
        bindInput('cv-input-skills', 'skills');
        bindInput('cv-input-projects', 'projects');

        // Interview Category select
        const roleSelect = document.getElementById('interview-category-select');
        if (roleSelect) {
            roleSelect.onchange = (e) => {
                this.selectedInterviewCategory = e.target.value;
                this.currentQuestionIdx = 0;
                this.renderInterviewQuestion();
            };
        }

        // Print CV
        const btnPrint = document.getElementById('btn-print-cv');
        if (btnPrint) {
            btnPrint.onclick = () => window.print();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new InternReadyApp();
});
