/**
 * LifeQuest - Gamified RPG Productivity & Daily Habit Engine
 */

class LifeQuestApp {
    constructor() {
        this.user = {
            name: 'Wendy Simanjuntak',
            avatarId: 'scholar',
            level: 1,
            xp: 0,
            gold: 50,
            streak: 3,
            lastLoginDate: new Date().toISOString().split('T')[0],
            stats: { int: 12, vit: 10, fin: 8, soc: 9 },
            questsCompletedTotal: 0,
            pomodorosCompleted: 0,
            bossesDefeatedCount: 0,
            purchasedItems: [],
            dailyWaterMl: 1000
        };

        this.quests = JSON.parse(JSON.stringify(DEFAULT_DAILY_QUESTS));
        this.bosses = JSON.parse(JSON.stringify(EPIC_BOSSES));
        this.achievements = JSON.parse(JSON.stringify(ACHIEVEMENTS));
        this.currentTab = 'tab-quests';

        // Pomodoro State
        this.pomodoroTime = 25 * 60;
        this.pomodoroInitial = 25 * 60;
        this.pomodoroTimer = null;
        this.isPomodoroRunning = false;

        this.init();
    }

    init() {
        this.loadState();
        this.renderAll();
        this.setupEventListeners();
        this.checkAchievements(false);
    }

    // ==========================================
    // LocalStorage Persistence
    // ==========================================
    loadState() {
        try {
            const savedUser = localStorage.getItem('lifequest_user_profile_v1');
            const savedQuests = localStorage.getItem('lifequest_user_quests_v1');
            const savedBosses = localStorage.getItem('lifequest_user_bosses_v1');
            const savedAch = localStorage.getItem('lifequest_user_achievements_v1');

            if (savedUser) this.user = Object.assign(this.user, JSON.parse(savedUser));
            if (savedQuests) this.quests = JSON.parse(savedQuests);
            if (savedBosses) this.bosses = JSON.parse(savedBosses);
            if (savedAch) this.achievements = JSON.parse(savedAch);
        } catch (e) {
            console.error("Gagal memuat data LifeQuest:", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem('lifequest_user_profile_v1', JSON.stringify(this.user));
            localStorage.setItem('lifequest_user_quests_v1', JSON.stringify(this.quests));
            localStorage.setItem('lifequest_user_bosses_v1', JSON.stringify(this.bosses));
            localStorage.setItem('lifequest_user_achievements_v1', JSON.stringify(this.achievements));
        } catch (e) {
            console.error("Gagal menyimpan data LifeQuest:", e);
        }
    }

    // ==========================================
    // Render Functions
    // ==========================================
    renderAll() {
        this.renderCharacterCard();
        this.renderNavbarStats();
        this.renderQuestsList();
        this.renderBossesList();
        this.renderShopList();
        this.renderAchievementsList();
        this.renderHabitTracker();
    }

    renderCharacterCard() {
        const avatar = AVATARS.find(a => a.id === this.user.avatarId) || AVATARS[0];
        const nextLevelXp = getXpForNextLevel(this.user.level);
        const xpPercent = Math.min(100, Math.round((this.user.xp / nextLevelXp) * 100));

        // Rank title
        let rankTitle = 'Novice Adventurer';
        if (this.user.level >= 10) rankTitle = 'Legendary Master';
        else if (this.user.level >= 7) rankTitle = 'Master of Discipline';
        else if (this.user.level >= 5) rankTitle = 'Veteran Scholar';
        else if (this.user.level >= 3) rankTitle = 'Adept Explorer';

        const avatarIconEl = document.getElementById('char-avatar-icon');
        const nameEl = document.getElementById('char-name');
        const rankEl = document.getElementById('char-rank');
        const levelBadgeEl = document.getElementById('char-level-badge');
        const xpCurrentEl = document.getElementById('char-xp-current');
        const xpNextEl = document.getElementById('char-xp-next');
        const xpFillEl = document.getElementById('char-xp-fill');

        if (avatarIconEl) avatarIconEl.textContent = avatar.icon;
        if (nameEl) nameEl.textContent = this.user.name;
        if (rankEl) rankEl.textContent = `${rankTitle} • ${avatar.title}`;
        if (levelBadgeEl) levelBadgeEl.textContent = `Level ${this.user.level}`;
        if (xpCurrentEl) xpCurrentEl.textContent = `${this.user.xp} XP`;
        if (xpNextEl) xpNextEl.textContent = `${nextLevelXp} XP`;
        if (xpFillEl) xpFillEl.style.width = `${xpPercent}%`;

        // Attributes
        const statIntEl = document.getElementById('stat-int-val');
        const statVitEl = document.getElementById('stat-vit-val');
        const statFinEl = document.getElementById('stat-fin-val');
        const statSocEl = document.getElementById('stat-soc-val');

        if (statIntEl) statIntEl.textContent = this.user.stats.int;
        if (statVitEl) statVitEl.textContent = this.user.stats.vit;
        if (statFinEl) statFinEl.textContent = this.user.stats.fin;
        if (statSocEl) statSocEl.textContent = this.user.stats.soc;
    }

    renderNavbarStats() {
        const navLevel = document.getElementById('nav-level-val');
        const navGold = document.getElementById('nav-gold-val');
        const navStreak = document.getElementById('nav-streak-val');

        if (navLevel) navLevel.textContent = `Lv. ${this.user.level}`;
        if (navGold) navGold.textContent = `${this.user.gold} Gold`;
        if (navStreak) navStreak.textContent = `${this.user.streak} Hari Streak 🔥`;
    }

    renderQuestsList() {
        const container = document.getElementById('quests-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.quests.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
                    <p style="color: var(--text-muted); font-size: 1rem;">Belum ada misi harian yang ditambahkan.</p>
                </div>
            `;
            return;
        }

        this.quests.forEach(quest => {
            const cat = CATEGORIES[quest.category] || CATEGORIES.int;
            const card = document.createElement('div');
            card.className = `quest-card ${quest.completed ? 'completed' : ''}`;

            card.innerHTML = `
                <div>
                    <div class="quest-top">
                        <span class="quest-category-badge ${quest.category}">
                            ${cat.icon} ${cat.name.split(' ')[0]}
                        </span>
                        <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-subtle); text-transform: uppercase;">
                            ${quest.difficulty || 'Misi'}
                        </span>
                    </div>
                    <h3 class="quest-title">${quest.title}</h3>
                    <p class="quest-desc" style="margin-top: 6px;">${quest.description}</p>
                </div>

                <div>
                    <div class="quest-rewards-bar" style="margin-bottom: 12px;">
                        <span class="reward-xp">+${quest.xp} XP</span>
                        <span>•</span>
                        <span class="reward-gold">+${quest.gold} Gold</span>
                        <span>•</span>
                        <span class="reward-stat">+${Object.keys(quest.statGains || {})[0]?.toUpperCase() || 'STAT'}</span>
                    </div>

                    <button class="quest-btn-complete ${quest.completed ? 'done' : ''}" 
                            onclick="app.completeQuest('${quest.id}', event)">
                        ${quest.completed ? '✅ Misi Selesai Hari Ini' : '⚔️ Selesaikan Misi'}
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderBossesList() {
        const container = document.getElementById('bosses-container');
        if (!container) return;

        container.innerHTML = '';

        this.bosses.forEach(boss => {
            const card = document.createElement('div');
            card.className = 'boss-card';

            const hpPercent = Math.max(0, Math.round((boss.currentHp / boss.totalHp) * 100));
            const isDefeated = boss.currentHp <= 0;

            card.innerHTML = `
                <div class="boss-header">
                    <div class="boss-icon">${boss.icon}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                            <h3 style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${boss.name}</h3>
                            <span style="font-weight: 800; color: #f87171; font-size: 0.95rem;">
                                HP: ${boss.currentHp} / ${boss.totalHp} (${hpPercent}%)
                            </span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 2px;">${boss.title} • ${boss.desc}</p>
                        
                        <div class="boss-hp-bar">
                            <div class="boss-hp-fill" style="width: ${hpPercent}%;"></div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
                    <strong style="font-size: 0.85rem; color: #fbbf24; text-transform: uppercase;">Hadiah Kemenangan:</strong>
                    <span style="font-size: 0.88rem; color: var(--text-main); margin-left: 8px;">
                        +${boss.reward.xp} XP • +${boss.reward.gold} Gold • Gelar: "${boss.reward.badge}"
                    </span>
                </div>

                <div>
                    <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 10px; color: var(--text-main);">
                        Tantangan Serangan (Tuntaskan Sub-tugas untuk Menyerang):
                    </h4>
                    <div>
                        ${boss.tasks.map(task => `
                            <div class="boss-subtask-item ${task.done ? 'defeated' : ''}">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span>${task.done ? '⚔️' : '🎯'}</span>
                                    <span style="font-size: 0.92rem; font-weight: 700; color: var(--text-main);">${task.text}</span>
                                </div>
                                <button class="btn-secondary" 
                                        style="padding: 6px 14px; font-size: 0.82rem; ${task.done ? 'opacity: 0.5; pointer-events: none;' : 'border-color: #ef4444; color: #f87171;'}"
                                        onclick="app.attackBoss('${boss.id}', '${task.id}', event)">
                                    ${task.done ? 'Tuntas' : `Serang (-${task.damage} HP)`}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderShopList() {
        const container = document.getElementById('shop-container');
        if (!container) return;

        container.innerHTML = '';

        SHOP_ITEMS.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-card';

            const isReal = item.category === 'real';

            card.innerHTML = `
                <div>
                    <div class="shop-card-icon">${item.icon}</div>
                    <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: var(--radius-sm); color: ${isReal ? '#38bdf8' : '#c084fc'};">
                        ${isReal ? 'Hadiah Kehidupan Nyata' : 'Item Penguat RPG'}
                    </span>
                    <h3 style="font-size: 1.1rem; font-weight: 800; margin-top: 6px; color: var(--text-main);">${item.name}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">${item.desc}</p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 4px;">
                        🪙 ${item.price} Gold
                    </div>

                    <button class="btn-primary" style="padding: 8px 16px; font-size: 0.85rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; font-weight: 800;"
                            onclick="app.buyShopItem('${item.id}')">
                        Beli Voucher
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderAchievementsList() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        container.innerHTML = '';

        this.achievements.forEach(ach => {
            const card = document.createElement('div');
            card.className = `ach-card ${ach.unlocked ? 'unlocked' : ''}`;

            card.innerHTML = `
                <div class="ach-icon-box">
                    ${ach.icon}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main);">${ach.title}</h4>
                        <span style="font-size: 0.75rem; font-weight: 800; color: ${ach.unlocked ? '#fbbf24' : 'var(--text-subtle)'};">
                            ${ach.unlocked ? '🏆 TERBUKA' : 'TERKUNCI'}
                        </span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">${ach.desc}</p>
                    <div style="font-size: 0.78rem; font-weight: 700; color: #c084fc; margin-top: 4px;">
                        Hadiah: +${ach.rewardXP} XP • +${ach.rewardGold} Gold
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderHabitTracker() {
        const waterValEl = document.getElementById('water-val');
        if (waterValEl) waterValEl.textContent = `${this.user.dailyWaterMl} / 2000 ml`;

        const waterPercentEl = document.getElementById('water-percent');
        if (waterPercentEl) {
            const pct = Math.min(100, Math.round((this.user.dailyWaterMl / 2000) * 100));
            waterPercentEl.style.width = `${pct}%`;
        }
    }

    // ==========================================
    // Gameplay & Mechanics
    // ==========================================
    gainXp(amount, event) {
        this.user.xp += amount;
        let leveledUp = false;

        // Check level up
        let nextLvlXp = getXpForNextLevel(this.user.level);
        while (this.user.xp >= nextLvlXp) {
            this.user.xp -= nextLvlXp;
            this.user.level += 1;
            this.user.gold += 50; // Level up gold bonus
            leveledUp = true;
            nextLvlXp = getXpForNextLevel(this.user.level);
        }

        if (event) {
            this.showFloatingXP(`+${amount} XP`, event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2);
        }

        if (leveledUp) {
            window.soundFX.playLevelUp();
            window.confetti.fire(90);
            this.showToast(`🎉 LEVEL UP! Karakter Anda telah naik ke Level ${this.user.level}! (+50 Gold Bonus)`);
        }

        this.checkAchievements(true);
        this.saveState();
        this.renderAll();
    }

    completeQuest(questId, event) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest || quest.completed) return;

        quest.completed = true;
        this.user.gold += quest.gold;
        this.user.questsCompletedTotal += 1;

        // Apply attribute gains
        if (quest.statGains) {
            for (const [stat, val] of Object.entries(quest.statGains)) {
                if (this.user.stats[stat] !== undefined) {
                    this.user.stats[stat] += val;
                }
            }
        }

        window.soundFX.playQuestComplete();
        this.gainXp(quest.xp, event);
        this.showToast(`Misi "${quest.title}" selesai! Mendapatkan +${quest.xp} XP & +${quest.gold} Gold.`);
    }

    attackBoss(bossId, taskId, event) {
        const boss = this.bosses.find(b => b.id === bossId);
        if (!boss) return;

        const task = boss.tasks.find(t => t.id === taskId);
        if (!task || task.done) return;

        task.done = true;
        boss.currentHp = Math.max(0, boss.currentHp - task.damage);

        window.soundFX.playBossHit();
        this.gainXp(50, event);

        if (boss.currentHp <= 0) {
            this.user.bossesDefeatedCount += 1;
            this.user.gold += boss.reward.gold;
            window.soundFX.playLevelUp();
            window.confetti.fire(120);
            this.gainXp(boss.reward.xp, event);
            this.showToast(`🏆 BOSS DIKALAHKAN! Anda menumbangkan ${boss.name} dan meraih gelar "${boss.reward.badge}"!`);
        } else {
            this.showToast(`⚔️ Serangan berhasil! ${boss.name} kehilangan ${task.damage} HP!`);
        }

        this.saveState();
        this.renderAll();
    }

    buyShopItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        if (this.user.gold < item.price) {
            window.soundFX.playClick();
            this.showToast(`Koin Gold Anda tidak cukup (${this.user.gold}/${item.price} Gold). Selesaikan misi harian untuk mengumpulkan lebih banyak gold!`);
            return;
        }

        this.user.gold -= item.price;
        this.user.purchasedItems.push({
            id: item.id,
            name: item.name,
            purchasedAt: new Date().toLocaleTimeString('id-ID')
        });

        // Apply in-game effects
        if (item.id === 'item-xp-potion') {
            this.gainXp(50);
        } else if (item.id === 'item-stat-tome') {
            this.user.stats.int += 5;
        }

        window.soundFX.playPurchase();
        window.soundFX.playCoin();
        this.showToast(`Berhasil membeli "${item.name}" seharga ${item.price} Gold!`);
        this.saveState();
        this.renderAll();
    }

    logWater() {
        this.user.dailyWaterMl += 250;
        this.user.stats.vit += 1;
        this.gainXp(15);
        window.soundFX.playCoin();
        this.showToast(`+250ml Air diminum (+15 XP, +1 Vitality)!`);
        this.saveState();
        this.renderHabitTracker();
    }

    logExpense(amount, desc) {
        this.user.stats.fin += 2;
        this.gainXp(25);
        this.user.gold += 15;
        window.soundFX.playCoin();
        this.showToast(`Pengeluaran dicatat: "${desc}" (Rp ${amount.toLocaleString('id-ID')}) -> +25 XP, +15 Gold!`);
        this.saveState();
        this.renderAll();
    }

    // ==========================================
    // Pomodoro Study Timer
    // ==========================================
    togglePomodoro() {
        const btn = document.getElementById('btn-pomodoro-toggle');

        if (this.isPomodoroRunning) {
            clearInterval(this.pomodoroTimer);
            this.isPomodoroRunning = false;
            if (btn) btn.textContent = 'Mulai Sesi Belajar (25m)';
            window.soundFX.playClick();
        } else {
            this.isPomodoroRunning = true;
            if (btn) btn.textContent = 'Jeda Sesi Belajar';
            window.soundFX.playClick();

            this.pomodoroTimer = setInterval(() => {
                if (this.pomodoroTime > 0) {
                    this.pomodoroTime--;
                    this.updatePomodoroDisplay();
                } else {
                    clearInterval(this.pomodoroTimer);
                    this.isPomodoroRunning = false;
                    this.pomodoroTime = this.pomodoroInitial;
                    if (btn) btn.textContent = 'Mulai Sesi Belajar (25m)';

                    this.user.pomodorosCompleted += 1;
                    this.user.stats.int += 3;
                    this.user.gold += 35;
                    window.soundFX.playTimerAlarm();
                    window.confetti.fire(80);
                    this.gainXp(60);
                    this.showToast(`⏰ SESI POMODORO SELESAI! Fokus belajar 25 menit tuntas (+60 XP, +35 Gold, +3 INT)!`);
                    this.updatePomodoroDisplay();
                }
            }, 1000);
        }
    }

    resetPomodoro() {
        clearInterval(this.pomodoroTimer);
        this.isPomodoroRunning = false;
        this.pomodoroTime = this.pomodoroInitial;
        const btn = document.getElementById('btn-pomodoro-toggle');
        if (btn) btn.textContent = 'Mulai Sesi Belajar (25m)';
        this.updatePomodoroDisplay();
        window.soundFX.playClick();
    }

    updatePomodoroDisplay() {
        const displayEl = document.getElementById('pomodoro-display');
        if (!displayEl) return;

        const mins = Math.floor(this.pomodoroTime / 60);
        const secs = this.pomodoroTime % 60;
        displayEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // ==========================================
    // Achievements Check
    // ==========================================
    checkAchievements(showNotification = false) {
        this.achievements.forEach(ach => {
            if (ach.unlocked) return;

            let conditionMet = false;
            if (ach.reqType === 'quests_completed' && this.user.questsCompletedTotal >= ach.reqVal) {
                conditionMet = true;
            } else if (ach.reqType === 'level' && this.user.level >= ach.reqVal) {
                conditionMet = true;
            } else if (ach.reqType === 'gold_held' && this.user.gold >= ach.reqVal) {
                conditionMet = true;
            } else if (ach.reqType === 'stat_int' && this.user.stats.int >= ach.reqVal) {
                conditionMet = true;
            } else if (ach.reqType === 'pomodoro_done' && this.user.pomodorosCompleted >= ach.reqVal) {
                conditionMet = true;
            } else if (ach.reqType === 'bosses_defeated' && this.user.bossesDefeatedCount >= ach.reqVal) {
                conditionMet = true;
            }

            if (conditionMet) {
                ach.unlocked = true;
                this.user.gold += ach.rewardGold;
                this.user.xp += ach.rewardXP;

                if (showNotification) {
                    window.soundFX.playLevelUp();
                    window.confetti.fire(70);
                    this.showToast(`🏆 PENCAPAIAN TERBUKA: "${ach.title}"! (+${ach.rewardXP} XP, +${ach.rewardGold} Gold)`);
                }
            }
        });

        this.saveState();
    }

    // ==========================================
    // Add Custom Quest
    // ==========================================
    addCustomQuest(title, desc, category, difficulty) {
        let xp = 35;
        let gold = 20;
        if (difficulty === 'hard') { xp = 60; gold = 40; }
        else if (difficulty === 'easy') { xp = 20; gold = 10; }

        const newQuest = {
            id: 'custom-' + Date.now(),
            title,
            description: desc || 'Misi produktivitas harian yang disesuaikan pengguna.',
            category,
            xp,
            gold,
            statGains: { [category]: difficulty === 'hard' ? 3 : 2 },
            difficulty,
            completed: false
        };

        this.quests.unshift(newQuest);
        this.saveState();
        this.renderQuestsList();
        this.showToast(`Misi baru "${title}" berhasil ditambahkan!`);
    }

    resetDailyQuests() {
        this.quests.forEach(q => q.completed = false);
        this.user.dailyWaterMl = 0;
        this.saveState();
        this.renderAll();
        window.soundFX.playClick();
        this.showToast(`Misi harian telah direset untuk hari ini!`);
    }

    // ==========================================
    // UI Helpers & Floating Visuals
    // ==========================================
    showFloatingXP(text, x, y) {
        const el = document.createElement('div');
        el.className = 'floating-xp-text';
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 1200);
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ==========================================
    // Event Listeners
    // ==========================================
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const panel = document.getElementById(tabId);
                if (panel) panel.classList.add('active');
                window.soundFX.playClick();
            });
        });

        // Add Quest Modal
        const btnOpenAdd = document.getElementById('btn-open-add-quest');
        const modalAdd = document.getElementById('modal-add-quest');
        const formAdd = document.getElementById('form-add-quest');

        if (btnOpenAdd && modalAdd) {
            btnOpenAdd.addEventListener('click', () => {
                modalAdd.classList.add('active');
                window.soundFX.playClick();
            });
        }

        if (formAdd) {
            formAdd.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-quest-title').value;
                const desc = document.getElementById('new-quest-desc').value;
                const cat = document.getElementById('new-quest-cat').value;
                const diff = document.getElementById('new-quest-diff').value;

                this.addCustomQuest(title, desc, cat, diff);
                formAdd.reset();
                modalAdd.classList.remove('active');
            });
        }

        // Avatar Picker Modal
        const avatarSphere = document.getElementById('char-avatar-sphere');
        const modalAvatar = document.getElementById('modal-avatar');
        if (avatarSphere && modalAvatar) {
            avatarSphere.addEventListener('click', () => {
                modalAvatar.classList.add('active');
                window.soundFX.playClick();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            });
        });

        // Pomodoro buttons
        const btnPomoToggle = document.getElementById('btn-pomodoro-toggle');
        const btnPomoReset = document.getElementById('btn-pomodoro-reset');
        if (btnPomoToggle) btnPomoToggle.addEventListener('click', () => this.togglePomodoro());
        if (btnPomoReset) btnPomoReset.addEventListener('click', () => this.resetPomodoro());

        // Habit Water button
        const btnAddWater = document.getElementById('btn-add-water');
        if (btnAddWater) btnAddWater.addEventListener('click', () => this.logWater());

        // Expense Form
        const formExpense = document.getElementById('form-log-expense');
        if (formExpense) {
            formExpense.addEventListener('submit', (e) => {
                e.preventDefault();
                const amount = parseInt(document.getElementById('expense-amount').value, 10);
                const desc = document.getElementById('expense-desc').value;
                if (amount > 0 && desc) {
                    this.logExpense(amount, desc);
                    formExpense.reset();
                }
            });
        }

        // Reset Quests button
        const btnResetQuests = document.getElementById('btn-reset-daily');
        if (btnResetQuests) {
            btnResetQuests.addEventListener('click', () => {
                if (confirm("Reset status selesai semua misi harian untuk memulai hari baru?")) {
                    this.resetDailyQuests();
                }
            });
        }
    }

    selectAvatar(avatarId) {
        this.user.avatarId = avatarId;
        const av = AVATARS.find(a => a.id === avatarId);
        if (av && av.statBonus) {
            for (const [stat, val] of Object.entries(av.statBonus)) {
                this.user.stats[stat] += val;
            }
        }
        this.saveState();
        this.renderCharacterCard();
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        this.showToast(`Karakter diubah menjadi: ${av.name} (${av.title})!`);
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.app = new LifeQuestApp();
});
