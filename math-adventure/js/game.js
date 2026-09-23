/**
 * Math Quest - Main Game Engine & Controller
 */

class GameEngine {
    constructor() {
        this.saveData = null;
        this.currentStage = null;
        this.currentWorld = null;
        this.currentMonster = null;
        this.monsterHp = 0;
        this.monsterMaxHp = 0;
        
        this.playerHp = 100;
        this.playerMaxHp = 100;
        this.playerMana = 100;
        this.playerMaxMana = 100;
        
        this.currentQuestion = null;
        this.comboStreak = 0;
        this.turnTimer = null;
        this.timeLeft = 0;
        this.shieldActive = 0;
        this.spellCooldowns = {};
        this.keypadBuffer = '';
        this.isInputLocked = false;
    }

    init() {
        this.saveData = window.storageManager.load();
        this.applySettings();
        this.renderTopNav();
        this.renderTitleScreen();
        this.renderWorldMap();
        this.renderShop();
        this.renderInventory();
        this.renderAchievements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();

        // Start title screen
        window.ui.switchView('view-title');
    }

    applySettings() {
        if (this.saveData.settings.muted) {
            window.sound.setMuted(true);
            const btn = document.getElementById('btn-sound-toggle');
            if (btn) btn.innerText = '🔇';
        }
    }

    setupEventListeners() {
        // Sound toggle
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.onclick = () => {
                this.saveData.settings.muted = !this.saveData.settings.muted;
                window.sound.setMuted(this.saveData.settings.muted);
                soundBtn.innerText = this.saveData.settings.muted ? '🔇' : '🔊';
                window.storageManager.save(this.saveData);
            };
        }

        // Reset game
        const resetBtn = document.getElementById('btn-reset-game');
        if (resetBtn) {
            resetBtn.onclick = () => {
                window.ui.showModal(
                    '⚠️ Reset Permainan?',
                    '<p>Apakah Anda yakin ingin menghapus semua progres dan mengulang dari awal?</p>',
                    [
                        { text: 'Batal', className: 'btn-secondary', onClick: () => {} },
                        {
                            text: 'Ya, Reset',
                            className: 'btn-primary',
                            onClick: () => {
                                window.storageManager.reset();
                                location.reload();
                            }
                        }
                    ]
                );
            };
        }

        // Nav shortcuts
        const navMapBtn = document.getElementById('nav-map-btn');
        if (navMapBtn) {
            navMapBtn.onclick = () => {
                window.sound.playClick();
                this.returnToMap();
            };
        }

        const navShopBtn = document.getElementById('nav-shop-btn');
        if (navShopBtn) {
            navShopBtn.onclick = () => {
                window.sound.playClick();
                this.renderShop();
                window.ui.switchView('view-shop');
            };
        }

        const navInvBtn = document.getElementById('nav-inv-btn');
        if (navInvBtn) {
            navInvBtn.onclick = () => {
                window.sound.playClick();
                this.renderInventory();
                window.ui.switchView('view-inventory');
            };
        }

        const navAchBtn = document.getElementById('nav-ach-btn');
        if (navAchBtn) {
            navAchBtn.onclick = () => {
                window.sound.playClick();
                this.renderAchievements();
                window.ui.switchView('view-achievements');
            };
        }
    }

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            const battleView = document.getElementById('view-battle');
            if (!battleView || !battleView.classList.contains('active') || this.isInputLocked) return;

            if (e.key >= '0' && e.key <= '9') {
                this.appendKeypad(e.key);
            } else if (e.key === 'Backspace') {
                this.backspaceKeypad();
            } else if (e.key === 'Enter') {
                this.submitKeypad();
            }
        });
    }

    // --- NAVIGATION & STATUS ---
    renderTopNav() {
        const goldEl = document.getElementById('player-gold-display');
        const levelEl = document.getElementById('player-level-display');
        const nameEl = document.getElementById('player-name-display');

        if (goldEl) goldEl.innerText = this.saveData.gold;
        if (levelEl) levelEl.innerText = `Lv. ${this.saveData.level}`;
        if (nameEl) nameEl.innerText = this.saveData.playerName;
    }

    // --- TITLE SCREEN & AVATAR SELECTION ---
    renderTitleScreen() {
        const container = document.getElementById('avatar-selection-list');
        if (!container) return;

        container.innerHTML = '';
        GAME_DATA.avatars.forEach(avatar => {
            const card = document.createElement('div');
            card.className = `avatar-card ${this.saveData.avatarId === avatar.id ? 'selected' : ''}`;
            card.onclick = () => {
                window.sound.playClick();
                this.saveData.avatarId = avatar.id;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                window.storageManager.save(this.saveData);
            };

            card.innerHTML = `
                <div class="avatar-preview">${avatar.svg}</div>
                <div class="avatar-name">${avatar.name}</div>
                <div class="avatar-role">${avatar.title}</div>
                <p style="font-size:0.85rem; color:#94a3b8; line-height:1.4;">${avatar.desc}</p>
                <div class="avatar-stats-mini">
                    <span>❤️ HP: ${avatar.baseHp}</span>
                    <span>⚔️ ATK: ${avatar.baseAtk}</span>
                </div>
            `;
            container.appendChild(card);
        });

        const startBtn = document.getElementById('btn-start-adventure');
        if (startBtn) {
            startBtn.onclick = () => {
                window.sound.playClick();
                this.returnToMap();
            };
        }
    }

    // --- WORLD MAP & STAGE SELECT ---
    renderWorldMap() {
        const container = document.getElementById('worlds-list-container');
        if (!container) return;

        container.innerHTML = '';
        GAME_DATA.worlds.forEach((world, wIdx) => {
            const worldCard = document.createElement('div');
            worldCard.className = 'world-card';

            let stagesHtml = '';
            world.stages.forEach((stage, sIdx) => {
                const isUnlocked = this.saveData.unlockedStages.includes(stage.id);
                const stars = this.saveData.stageStars[stage.id] || 0;
                const monster = GAME_DATA.monsters[stage.monsterId];

                let starIcons = '';
                for (let i = 1; i <= 3; i++) {
                    starIcons += i <= stars ? '⭐' : '☆';
                }

                stagesHtml += `
                    <div class="stage-card ${isUnlocked ? '' : 'locked'} ${stage.isBoss ? 'boss-stage' : ''}" 
                         onclick="window.game.startStage('${world.id}', '${stage.id}')">
                        <div class="stage-info">
                            <span class="stage-badge">${stage.id} ${stage.isBoss ? '👑 BOS' : ''}</span>
                            <span class="stage-name">${stage.name}</span>
                            <span style="font-size:0.8rem; color:#94a3b8;">Musuh: ${monster ? monster.name : 'Unknown'}</span>
                            <div class="stage-stars">${isUnlocked ? starIcons : '🔒 Terkunci'}</div>
                        </div>
                        <div class="stage-action">
                            ${isUnlocked ? '<button class="btn-primary" style="padding:0.4rem 0.9rem; font-size:0.9rem;">Mulai ⚔️</button>' : '🔒'}
                        </div>
                    </div>
                `;
            });

            worldCard.innerHTML = `
                <div class="world-header" onclick="this.parentElement.querySelector('.stages-grid').classList.toggle('hidden')">
                    <div class="world-title-wrap">
                        <div class="world-icon">${world.icon}</div>
                        <div>
                            <div class="world-name">${world.name}</div>
                            <div class="world-subtitle">${world.subtitle}</div>
                        </div>
                    </div>
                    <span style="font-size:1.3rem;">▼</span>
                </div>
                <div class="stages-grid">
                    ${stagesHtml}
                </div>
            `;
            container.appendChild(worldCard);
        });
    }

    returnToMap() {
        clearInterval(this.turnTimer);
        window.sound.startBGM('map');
        this.renderWorldMap();
        this.renderTopNav();
        window.ui.switchView('view-map');
    }

    // --- BATTLE SYSTEM ---
    startStage(worldId, stageId) {
        if (!this.saveData.unlockedStages.includes(stageId)) {
            window.sound.playWrong();
            return;
        }

        const world = GAME_DATA.worlds.find(w => w.id === worldId);
        const stage = world.stages.find(s => s.id === stageId);
        const monster = GAME_DATA.monsters[stage.monsterId];

        this.currentWorld = world;
        this.currentStage = stage;
        this.currentMonster = monster;

        // Player Stats calculation
        const avatar = GAME_DATA.avatars.find(a => a.id === this.saveData.avatarId) || GAME_DATA.avatars[0];
        const weaponBonus = this.saveData.equipment.weapon ? this.saveData.equipment.weapon.atkBonus : 0;
        const armorBonus = this.saveData.equipment.armor ? this.saveData.equipment.armor.hpBonus : 0;

        this.playerMaxHp = avatar.baseHp + (this.saveData.level * 15) + armorBonus;
        this.playerHp = this.playerMaxHp;
        this.playerMaxMana = 100;
        this.playerMana = 100;
        this.playerAtk = avatar.baseAtk + (this.saveData.level * 4) + weaponBonus;

        // Monster Stats
        this.monsterMaxHp = monster.hp;
        this.monsterHp = monster.hp;

        // Reset Battle state
        this.comboStreak = 0;
        this.shieldActive = 0;
        this.spellCooldowns = {};
        this.keypadBuffer = '';
        this.isInputLocked = false;

        // Sound & BGM
        window.sound.startBGM(stage.isBoss ? 'boss' : 'battle');

        // Render Battle Stage View
        this.renderBattleUI();
        window.ui.switchView('view-battle');

        // Start first turn
        this.nextTurn();
    }

    renderBattleUI() {
        const avatar = GAME_DATA.avatars.find(a => a.id === this.saveData.avatarId) || GAME_DATA.avatars[0];
        
        // Render Sprites
        const heroSpriteEl = document.getElementById('hero-sprite-container');
        const monsterSpriteEl = document.getElementById('monster-sprite-container');
        const heroNameEl = document.getElementById('battle-hero-name');
        const monsterNameEl = document.getElementById('battle-monster-name');

        if (heroSpriteEl) heroSpriteEl.innerHTML = avatar.svg;
        if (monsterSpriteEl) monsterSpriteEl.innerHTML = this.currentMonster.svg;
        if (heroNameEl) heroNameEl.innerText = `${this.saveData.playerName} (Lv. ${this.saveData.level})`;
        if (monsterNameEl) monsterNameEl.innerText = this.currentMonster.name;

        // Monster quote bubble
        const bubble = document.getElementById('monster-dialogue-bubble');
        if (bubble) {
            bubble.innerText = `"${this.currentMonster.quote}"`;
        }

        // Render Spells Bar
        this.renderSpellsBar();
        this.updateBars();
    }

    renderSpellsBar() {
        const bar = document.getElementById('battle-spells-bar');
        if (!bar) return;

        bar.innerHTML = '';
        GAME_DATA.spells.forEach(spell => {
            const btn = document.createElement('button');
            const cd = this.spellCooldowns[spell.id] || 0;
            btn.className = 'spell-btn';
            btn.disabled = cd > 0 || this.playerMana < spell.manaCost || this.isInputLocked;
            btn.innerHTML = `${spell.icon} ${spell.name} <span style="font-size:0.75rem; color:#60a5fa;">(${spell.manaCost} MP)</span> ${cd > 0 ? `[${cd}]` : ''}`;
            btn.onclick = () => this.castSpell(spell);
            bar.appendChild(btn);
        });
    }

    updateBars() {
        const heroHpPercent = Math.max(0, (this.playerHp / this.playerMaxHp) * 100);
        const heroManaPercent = Math.max(0, (this.playerMana / this.playerMaxMana) * 100);
        const monsterHpPercent = Math.max(0, (this.monsterHp / this.monsterMaxHp) * 100);

        const heroHpFill = document.getElementById('hero-hp-bar');
        const heroManaFill = document.getElementById('hero-mana-bar');
        const monsterHpFill = document.getElementById('monster-hp-bar');

        const heroHpText = document.getElementById('hero-hp-text');
        const heroManaText = document.getElementById('hero-mana-text');
        const monsterHpText = document.getElementById('monster-hp-text');

        if (heroHpFill) heroHpFill.style.width = `${heroHpPercent}%`;
        if (heroManaFill) heroManaFill.style.width = `${heroManaPercent}%`;
        if (monsterHpFill) monsterHpFill.style.width = `${monsterHpPercent}%`;

        if (heroHpText) heroHpText.innerText = `${Math.ceil(this.playerHp)} / ${this.playerMaxHp}`;
        if (heroManaText) heroManaText.innerText = `${Math.ceil(this.playerMana)} / ${this.playerMaxMana}`;
        if (monsterHpText) monsterHpText.innerText = `${Math.ceil(this.monsterHp)} / ${this.monsterMaxHp}`;

        const comboBadge = document.getElementById('battle-combo-badge');
        if (comboBadge) {
            comboBadge.innerText = `🔥 Combo: ${this.comboStreak}x`;
            if (this.comboStreak >= 3) {
                document.getElementById('battle-arena-card')?.classList.add('frenzy-active');
            } else {
                document.getElementById('battle-arena-card')?.classList.remove('frenzy-active');
            }
        }
    }

    nextTurn() {
        if (this.monsterHp <= 0) {
            this.handleVictory();
            return;
        }
        if (this.playerHp <= 0) {
            this.handleDefeat();
            return;
        }

        // Reduce spell cooldowns
        for (let sId in this.spellCooldowns) {
            if (this.spellCooldowns[sId] > 0) this.spellCooldowns[sId]--;
        }

        this.isInputLocked = false;
        this.keypadBuffer = '';
        this.updateKeypadDisplay();
        this.renderSpellsBar();

        // Generate Math Question
        const stageIdx = parseInt(this.currentStage.id.split('-')[1]) || 1;
        this.currentQuestion = window.mathEngine.generateQuestion(
            this.currentWorld.operation,
            stageIdx,
            this.currentStage.isBoss
        );

        // Render question in UI
        const promptEl = document.getElementById('question-prompt-text');
        const eqEl = document.getElementById('question-equation-text');
        if (promptEl) promptEl.innerText = this.currentQuestion.prompt;
        if (eqEl) eqEl.innerText = this.currentQuestion.equation;

        // Render Choices
        const choicesGrid = document.getElementById('battle-choices-grid');
        if (choicesGrid) {
            choicesGrid.innerHTML = '';
            this.currentQuestion.choices.forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.innerText = val;
                btn.onclick = () => this.handleAnswer(val, btn);
                choicesGrid.appendChild(btn);
            });
        }

        // Start Turn Countdown Timer
        this.startTimer(this.currentStage.timePerTurn || 15);
    }

    startTimer(seconds) {
        clearInterval(this.turnTimer);
        this.timeLeft = seconds;
        const timerText = document.getElementById('battle-timer-seconds');
        if (timerText) timerText.innerText = this.timeLeft;

        this.turnTimer = setInterval(() => {
            this.timeLeft--;
            if (timerText) timerText.innerText = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(this.turnTimer);
                this.handleTimeout();
            }
        }, 1000);
    }

    // Keypad Input Handlers
    appendKeypad(num) {
        if (this.isInputLocked) return;
        if (this.keypadBuffer.length < 5) {
            this.keypadBuffer += num;
            window.sound.playClick();
            this.updateKeypadDisplay();
        }
    }

    backspaceKeypad() {
        if (this.isInputLocked) return;
        this.keypadBuffer = this.keypadBuffer.slice(0, -1);
        window.sound.playClick();
        this.updateKeypadDisplay();
    }

    clearKeypad() {
        if (this.isInputLocked) return;
        this.keypadBuffer = '';
        window.sound.playClick();
        this.updateKeypadDisplay();
    }

    updateKeypadDisplay() {
        const display = document.getElementById('keypad-input-display');
        if (display) {
            display.innerText = this.keypadBuffer || '?';
        }
    }

    submitKeypad() {
        if (this.isInputLocked || !this.keypadBuffer) return;
        const enteredVal = parseInt(this.keypadBuffer);
        this.handleAnswer(enteredVal);
    }

    // --- ANSWER EVALUATION ---
    handleAnswer(userVal, buttonEl = null) {
        if (this.isInputLocked) return;
        this.isInputLocked = true;
        clearInterval(this.turnTimer);

        const isCorrect = userVal === this.currentQuestion.answer;

        if (isCorrect) {
            if (buttonEl) buttonEl.classList.add('correct-glow');
            window.sound.playCorrect();
            this.comboStreak++;
            this.saveData.stats.correctAnswers++;
            if (this.comboStreak > this.saveData.stats.highestCombo) {
                this.saveData.stats.highestCombo = this.comboStreak;
            }
            this.checkAchievements();

            // Hero Attacks!
            const heroSprite = document.getElementById('hero-sprite-container');
            const monsterSprite = document.getElementById('monster-sprite-container');
            heroSprite?.classList.add('attacking');
            window.sound.playAttack();

            // Calculate Damage
            const comboMultiplier = 1 + (this.comboStreak * 0.15);
            const isCrit = Math.random() < 0.25 || this.timeLeft >= (this.currentStage.timePerTurn * 0.7);
            let finalDmg = Math.round(this.playerAtk * comboMultiplier * (isCrit ? 1.6 : 1));

            this.monsterHp = Math.max(0, this.monsterHp - finalDmg);
            this.playerMana = Math.min(this.playerMaxMana, this.playerMana + 15);

            setTimeout(() => {
                heroSprite?.classList.remove('attacking');
                monsterSprite?.classList.add('hurt');
                window.sound.playHurt();

                window.ui.spawnFloatingText(
                    isCrit ? `⚡ CRIT! -${finalDmg}` : `-${finalDmg}`,
                    monsterSprite,
                    isCrit ? 'crit' : 'damage'
                );

                this.updateBars();

                setTimeout(() => {
                    monsterSprite?.classList.remove('hurt');
                    this.nextTurn();
                }, 600);
            }, 300);

        } else {
            if (buttonEl) buttonEl.classList.add('wrong-glow');
            window.sound.playWrong();
            this.comboStreak = 0;
            this.updateBars();

            // Monster Counter-Attacks!
            setTimeout(() => {
                this.monsterAttack();
            }, 500);
        }
    }

    handleTimeout() {
        this.isInputLocked = true;
        window.sound.playWrong();
        this.comboStreak = 0;
        this.updateBars();
        this.monsterAttack();
    }

    monsterAttack() {
        const heroSprite = document.getElementById('hero-sprite-container');
        const monsterSprite = document.getElementById('monster-sprite-container');

        monsterSprite?.classList.add('attacking');
        window.sound.playAttack();

        let incomingDmg = Math.round(this.currentMonster.atk * (Math.random() * 0.3 + 0.85));
        if (this.shieldActive > 0) {
            incomingDmg = Math.round(incomingDmg * (1 - this.shieldActive));
            this.shieldActive = 0;
        }

        this.playerHp = Math.max(0, this.playerHp - incomingDmg);

        setTimeout(() => {
            monsterSprite?.classList.remove('attacking');
            heroSprite?.classList.add('hurt');
            window.sound.playHurt();

            window.ui.spawnFloatingText(`-${incomingDmg}`, heroSprite, 'damage');
            this.updateBars();

            setTimeout(() => {
                heroSprite?.classList.remove('hurt');
                this.nextTurn();
            }, 600);
        }, 300);
    }

    // --- SPELLS ---
    castSpell(spell) {
        if (this.playerMana < spell.manaCost || (this.spellCooldowns[spell.id] || 0) > 0 || this.isInputLocked) return;

        this.playerMana -= spell.manaCost;
        this.spellCooldowns[spell.id] = spell.cooldownTurns;
        this.updateBars();
        this.renderSpellsBar();

        window.sound.playSpell(spell.type);
        const heroSprite = document.getElementById('hero-sprite-container');
        const monsterSprite = document.getElementById('monster-sprite-container');

        heroSprite?.classList.add('casting');
        setTimeout(() => heroSprite?.classList.remove('casting'), 600);

        if (spell.type === 'heal') {
            const healAmount = Math.round(this.playerMaxHp * spell.healPercent);
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
            window.ui.spawnFloatingText(`+${healAmount} HP`, heroSprite, 'heal');
            this.updateBars();
        } else if (spell.type === 'shield') {
            this.shieldActive = spell.defenseBoost;
            window.ui.spawnFloatingText(`🛡️ PERISAI AKTIF!`, heroSprite, 'heal');
        } else if (spell.type === 'lightning' || spell.type === 'meteor') {
            const spellDmg = Math.round(this.playerAtk * spell.damageMultiplier);
            this.monsterHp = Math.max(0, this.monsterHp - spellDmg);
            window.ui.spawnFloatingText(`💥 -${spellDmg}`, monsterSprite, 'crit');
            this.updateBars();
            if (this.monsterHp <= 0) {
                clearInterval(this.turnTimer);
                setTimeout(() => this.handleVictory(), 600);
            }
        }
    }

    // --- VICTORY & DEFEAT ---
    handleVictory() {
        clearInterval(this.turnTimer);
        window.sound.playMonsterDefeat();
        window.sound.playVictory();
        window.ui.launchConfetti();

        this.saveData.stats.totalWins++;
        this.saveData.stats.totalBattles++;

        // Star calculation (3 stars if HP > 60%, 2 stars if > 30%, 1 star otherwise)
        let stars = 1;
        const hpPercent = this.playerHp / this.playerMaxHp;
        if (hpPercent >= 0.6) stars = 3;
        else if (hpPercent >= 0.3) stars = 2;

        this.saveData.stageStars[this.currentStage.id] = Math.max(this.saveData.stageStars[this.currentStage.id] || 0, stars);

        // Gold & XP Rewards
        const goldEarned = this.currentStage.rewardGold;
        const xpEarned = this.currentStage.rewardXp;
        this.saveData.gold += goldEarned;
        this.saveData.xp += xpEarned;

        // Unlock next stage
        this.unlockNextStage();

        // Level up check
        let levelUpHtml = '';
        const xpNeeded = this.saveData.level * 100;
        if (this.saveData.xp >= xpNeeded) {
            this.saveData.level++;
            this.saveData.xp -= xpNeeded;
            window.sound.playLevelUp();
            levelUpHtml = `<div style="color:#38bdf8; font-weight:800; font-size:1.1rem; margin-top:0.5rem;">🎉 LEVEL UP! Sekarang Level ${this.saveData.level}!</div>`;
        }

        this.checkAchievements();
        window.storageManager.save(this.saveData);

        let starText = '';
        for (let i = 0; i < stars; i++) starText += '⭐';

        window.ui.showModal(
            '🏆 KEMENANGAN GEMILANG!',
            `
                <div class="stars-earned">${starText}</div>
                <p>Kamu berhasil menaklukkan <b>${this.currentMonster.name}</b> dengan kecerdasan matematikamu!</p>
                <div class="rewards-summary">
                    <div>💰 +${goldEarned} Koin Emas</div>
                    <div>✨ +${xpEarned} XP</div>
                </div>
                ${levelUpHtml}
            `,
            [
                {
                    text: 'Kembali ke Peta 🗺️',
                    className: 'btn-primary',
                    onClick: () => this.returnToMap()
                }
            ]
        );
    }

    unlockNextStage() {
        const curId = this.currentStage.id;
        const parts = curId.split('-');
        const worldNum = parseInt(parts[0]);
        const stageNum = parseInt(parts[1]);

        if (stageNum < 3) {
            const nextStageId = `${worldNum}-${stageNum + 1}`;
            if (!this.saveData.unlockedStages.includes(nextStageId)) {
                this.saveData.unlockedStages.push(nextStageId);
            }
        } else if (worldNum < 5) {
            const nextWorldStageId = `${worldNum + 1}-1`;
            if (!this.saveData.unlockedStages.includes(nextWorldStageId)) {
                this.saveData.unlockedStages.push(nextWorldStageId);
            }
        }
    }

    handleDefeat() {
        clearInterval(this.turnTimer);
        window.sound.playWrong();
        this.saveData.stats.totalBattles++;
        window.storageManager.save(this.saveData);

        window.ui.showModal(
            '💀 PERTAHANAN RUNTUH',
            `
                <p>Monster berhasil mengalahkanmu! Jangan berkecil hati, asah perhitunganmu dan coba kembali!</p>
            `,
            [
                {
                    text: 'Coba Lagi ⚔️',
                    className: 'btn-primary',
                    onClick: () => this.startStage(this.currentWorld.id, this.currentStage.id)
                },
                {
                    text: 'Kembali ke Peta 🗺️',
                    className: 'btn-secondary',
                    onClick: () => this.returnToMap()
                }
            ]
        );
    }

    // --- SHOP & INVENTORY ---
    renderShop() {
        const container = document.getElementById('shop-items-grid');
        if (!container) return;

        container.innerHTML = '';
        GAME_DATA.shopItems.forEach(item => {
            const isOwned = (this.saveData.equipment.weapon && this.saveData.equipment.weapon.id === item.id) ||
                            (this.saveData.equipment.armor && this.saveData.equipment.armor.id === item.id);

            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-icon">${item.icon}</div>
                    <div>
                        <div class="item-name">${item.name}</div>
                        <span style="font-size:0.8rem; color:#a5b4fc;">${item.type.toUpperCase()}</span>
                    </div>
                </div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-footer">
                    <div class="item-price">💰 ${item.cost}</div>
                    <button class="btn-primary" style="padding:0.4rem 1rem; font-size:0.85rem;" 
                            ${isOwned ? 'disabled' : ''} onclick="window.game.buyItem('${item.id}')">
                        ${isOwned ? 'Sudah Dipakai' : 'Beli 🛒'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    buyItem(itemId) {
        const item = GAME_DATA.shopItems.find(i => i.id === itemId);
        if (!item || this.saveData.gold < item.cost) {
            window.sound.playWrong();
            window.ui.showModal('Koin Tidak Cukup', '<p>Kamu membutuhkan lebih banyak koin emas untuk membeli barang ini!</p>', [
                { text: 'Oke', className: 'btn-primary' }
            ]);
            return;
        }

        this.saveData.gold -= item.cost;
        window.sound.playCoin();

        if (item.type === 'weapon') {
            this.saveData.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.saveData.equipment.armor = item;
        } else if (item.isConsumable) {
            const existing = this.saveData.inventory.find(i => i.id === item.id);
            if (existing) existing.count++;
            else this.saveData.inventory.push({ id: item.id, name: item.name, count: 1, icon: item.icon });
        }

        window.storageManager.save(this.saveData);
        this.renderTopNav();
        this.renderShop();
    }

    renderInventory() {
        const container = document.getElementById('inventory-items-grid');
        const eqWeapon = document.getElementById('equipped-weapon-display');
        const eqArmor = document.getElementById('equipped-armor-display');

        if (eqWeapon) eqWeapon.innerText = this.saveData.equipment.weapon ? `${this.saveData.equipment.weapon.icon} ${this.saveData.equipment.weapon.name}` : 'Kosong';
        if (eqArmor) eqArmor.innerText = this.saveData.equipment.armor ? `${this.saveData.equipment.armor.icon} ${this.saveData.equipment.armor.name}` : 'Kosong';

        if (!container) return;
        container.innerHTML = '';

        if (this.saveData.inventory.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8;">Inventori Anda masih kosong. Beli ramuan di Toko!</p>';
            return;
        }

        this.saveData.inventory.forEach(invItem => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-header">
                    <div class="item-icon">${invItem.icon}</div>
                    <div>
                        <div class="item-name">${invItem.name}</div>
                        <span style="font-size:0.85rem; color:#f59e0b;">Jumlah: ${invItem.count}</span>
                    </div>
                </div>
                <div class="item-desc">Dapat digunakan untuk memulihkan status pahlawan.</div>
            `;
            container.appendChild(card);
        });
    }

    // --- ACHIEVEMENTS ---
    renderAchievements() {
        const container = document.getElementById('achievements-list-grid');
        if (!container) return;

        container.innerHTML = '';
        GAME_DATA.achievements.forEach(ach => {
            const isUnlocked = this.saveData.achievements.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div style="font-size:2.2rem;">${ach.icon}</div>
                <div>
                    <div style="font-weight:700; font-size:1.05rem;">${ach.name}</div>
                    <div style="font-size:0.85rem; color:#94a3b8;">${ach.desc}</div>
                    <span style="font-size:0.75rem; color:${isUnlocked ? '#34d399' : '#94a3b8'}; font-weight:700;">
                        ${isUnlocked ? '✅ TERCAPAI' : '🔒 TERKUNCI'}
                    </span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    checkAchievements() {
        const unlock = (id) => {
            if (!this.saveData.achievements.includes(id)) {
                this.saveData.achievements.push(id);
                window.sound.playLevelUp();
            }
        };

        if (this.saveData.stats.totalWins >= 1) unlock('first_win');
        if (this.saveData.stats.highestCombo >= 5) unlock('combo_5');
        if (this.saveData.stats.highestCombo >= 10) unlock('combo_10');
        if (this.saveData.gold >= 500) unlock('rich');
        if (this.saveData.stageStars['1-3']) unlock('world_1');
        if (this.saveData.stageStars['2-3']) unlock('world_2');
        if (this.saveData.stageStars['3-3']) unlock('world_3');
        if (this.saveData.stageStars['5-3']) unlock('all_boss');
    }
}

// Global Game Engine Instance
window.game = new GameEngine();
window.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});
