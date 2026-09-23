/**
 * MLBB WEB - Main Game Engine
 * 60 FPS MOBA Arena: 3 Lanes, Jungle Camps (Blue/Red Buff, Turtle, Lord),
 * Bushes Camouflage, 5v5 AI Heroes, Gold Economy, Leveling 1-15, and Item Shop
 */

class MLBBGameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new MLBBSoundEngine();

        // Map Dimensions (Land of Dawn: 3000 x 2000 px)
        this.mapWidth = 3000;
        this.mapHeight = 2000;

        // Camera Viewport
        this.camera = { x: 0, y: 0, width: 1280, height: 720 };

        // Game Entities
        this.state = 'MENU';
        this.player = null;
        this.heroes = [];
        this.minions = [];
        this.turrets = [];
        this.nexusList = [];
        this.jungleCamps = [];
        this.bushes = [];
        this.projectiles = [];
        this.particles = [];
        this.damageTexts = [];
        this.summonedLord = null;

        // Game Match State
        this.gameTime = 0;
        this.minionTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];
        this.firstBloodClaimed = false;

        // Inputs
        this.keys = {};
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };
        this.virtualJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInputs();
        this.startLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keys[e.key.toUpperCase()] = true;

            if (this.state === 'PLAYING' && this.player && this.player.alive) {
                if (e.code === 'KeyQ' || e.key === '1') this.player.castSkill(0, this);
                else if (e.code === 'KeyW' || e.key === '2') this.player.castSkill(1, this);
                else if (e.code === 'KeyE' || e.key === '3') this.player.castSkill(2, this);
                else if (e.code === 'Space' || e.code === 'KeyD') this.player.castBattleSpell(this);
                else if (e.code === 'KeyB') this.player.startRecall(this);
                else if (e.code === 'KeyP') this.toggleItemShop();
                else if (e.code === 'Tab') {
                    e.preventDefault();
                    this.toggleScoreboard();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key.toUpperCase()] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.worldX = this.mouse.x + this.camera.x;
            this.mouse.worldY = this.mouse.y + this.camera.y;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.sound.init();
                this.mouse.isDown = true;
                if (this.state === 'PLAYING' && this.player && this.player.alive) {
                    this.player.performBasicAttack(this);
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /* ==========================================================================
       Match Initialization (Draft 5v5, Map Entities, Jungle, Turrets)
       ========================================================================== */
    startMatch(chosenHeroId, chosenSpellId) {
        this.sound.init();
        this.state = 'PLAYING';
        this.gameTime = 0;
        this.minionTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];
        this.firstBloodClaimed = false;
        this.summonedLord = null;

        this.heroes = [];
        this.minions = [];
        this.turrets = [];
        this.nexusList = [];
        this.jungleCamps = [];
        this.bushes = [];
        this.projectiles = [];
        this.particles = [];
        this.damageTexts = [];

        // 1. Build 3-Lane Map & Jungle Entities
        this.buildMapEntities();

        // 2. Draft 5v5 Teams (6 available heroes)
        const allHeroKeys = ['zilong', 'layla', 'saber', 'eudora', 'tigreal', 'estes'];
        
        // Blue Team (Player + 4 AI Teammates)
        const blueHeroKeys = [chosenHeroId, ...allHeroKeys.filter(k => k !== chosenHeroId).slice(0, 4)];
        blueHeroKeys.forEach((key, idx) => {
            const isHuman = (key === chosenHeroId);
            const cfg = MLBB_HEROES.find(h => h.id === key);
            const startPos = this.getHeroSpawnPoint('BLUE', idx);
            const spell = isHuman ? MLBB_BATTLE_SPELLS.find(s => s.id === chosenSpellId) : MLBB_BATTLE_SPELLS[idx % MLBB_BATTLE_SPELLS.length];

            const hero = new MLBBHeroEntity(cfg, 'BLUE', startPos.x, startPos.y, isHuman, spell, idx);
            this.heroes.push(hero);
            if (isHuman) this.player = hero;
        });

        // Red Team (5 AI Opponents)
        const redHeroKeys = allHeroKeys.filter(k => k !== chosenHeroId).slice(0, 5);
        redHeroKeys.forEach((key, idx) => {
            const cfg = MLBB_HEROES.find(h => h.id === key);
            const startPos = this.getHeroSpawnPoint('RED', idx);
            const spell = MLBB_BATTLE_SPELLS[idx % MLBB_BATTLE_SPELLS.length];

            const hero = new MLBBHeroEntity(cfg, 'RED', startPos.x, startPos.y, false, spell, idx);
            this.heroes.push(hero);
        });

        // Spawn initial minion wave
        this.spawn3LaneMinions();

        // Voice Announcer Intro
        this.sound.announce('Welcome to Mobile Legends! 5 seconds till the enemy reaches the battlefield. Smash them! All troops deployed.');
        this.addKillFeed('System', 'Pertandingan Dimulai! Hancurkan Base Crystal Musuh.', 'system');

        // Hide Draft Screen & Open Battle HUD
        document.getElementById('screenHeroDraft').style.display = 'none';
        document.getElementById('screenBattleHUD').style.display = 'block';
        document.getElementById('screenGameOver').style.display = 'none';

        this.updateHUDHeroProfile();
    }

    getHeroSpawnPoint(team, laneIdx) {
        if (team === 'BLUE') {
            return { x: 220 + Math.random() * 60, y: 1750 + (Math.random() - 0.5) * 80 };
        } else {
            return { x: 2780 - Math.random() * 60, y: 250 + (Math.random() - 0.5) * 80 };
        }
    }

    buildMapEntities() {
        // Base Nexus Crystals (Blue at Bottom-Left, Red at Top-Right)
        this.nexusList.push(new MLBBBaseCrystal(220, 1780, 'BLUE'));
        this.nexusList.push(new MLBBBaseCrystal(2780, 220, 'RED'));

        // 9 Blue Turrets (Top, Mid, Bot lanes)
        // Top Lane Blue
        this.turrets.push(new MLBBTurret(300, 1200, 'BLUE', 'Top Outer'));
        this.turrets.push(new MLBBTurret(300, 600, 'BLUE', 'Top Inner'));
        this.turrets.push(new MLBBTurret(450, 1600, 'BLUE', 'Top Base'));

        // Mid Lane Blue
        this.turrets.push(new MLBBTurret(1050, 1300, 'BLUE', 'Mid Outer'));
        this.turrets.push(new MLBBTurret(750, 1500, 'BLUE', 'Mid Inner'));
        this.turrets.push(new MLBBTurret(550, 1650, 'BLUE', 'Mid Base'));

        // Bot Lane Blue
        this.turrets.push(new MLBBTurret(1800, 1750, 'BLUE', 'Bot Outer'));
        this.turrets.push(new MLBBTurret(2400, 1750, 'BLUE', 'Bot Inner'));
        this.turrets.push(new MLBBTurret(700, 1800, 'BLUE', 'Bot Base'));

        // 9 Red Turrets (Top, Mid, Bot lanes)
        // Top Lane Red
        this.turrets.push(new MLBBTurret(1200, 250, 'RED', 'Top Outer'));
        this.turrets.push(new MLBBTurret(600, 250, 'RED', 'Top Inner'));
        this.turrets.push(new MLBBTurret(2300, 250, 'RED', 'Top Base'));

        // Mid Lane Red
        this.turrets.push(new MLBBTurret(1950, 700, 'RED', 'Mid Outer'));
        this.turrets.push(new MLBBTurret(2250, 500, 'RED', 'Mid Inner'));
        this.turrets.push(new MLBBTurret(2450, 350, 'RED', 'Mid Base'));

        // Bot Lane Red
        this.turrets.push(new MLBBTurret(2700, 800, 'RED', 'Bot Outer'));
        this.turrets.push(new MLBBTurret(2700, 1400, 'RED', 'Bot Inner'));
        this.turrets.push(new MLBBTurret(2550, 450, 'RED', 'Bot Base'));

        // Bushes (Rumput Semak untuk Kamuflase)
        const bushLocations = [
            { x: 1500, y: 1000, w: 120, h: 70 }, // Mid River Bush
            { x: 1350, y: 850, w: 100, h: 80 },  // River Upper
            { x: 1650, y: 1150, w: 100, h: 80 }, // River Lower
            { x: 800, y: 800, w: 90, h: 60 },    // Blue Jungle Bush
            { x: 2200, y: 1200, w: 90, h: 60 },  // Red Jungle Bush
            { x: 450, y: 400, w: 110, h: 70 },   // Top Corner
            { x: 2550, y: 1600, w: 110, h: 70 }  // Bot Corner
        ];
        bushLocations.forEach(b => this.bushes.push(new MLBBBush(b.x, b.y, b.w, b.h)));

        // Jungle Camps: Blue Buff, Red Buff, Turtle, Lord
        this.jungleCamps.push(new MLBBJungleMonster(850, 1150, 'BLUE_BUFF', 'Fiend (Blue Buff)', 3000));
        this.jungleCamps.push(new MLBBJungleMonster(1150, 1550, 'RED_BUFF', 'Beast (Red Buff)', 3200));
        this.jungleCamps.push(new MLBBJungleMonster(2150, 850, 'BLUE_BUFF', 'Fiend (Blue Buff)', 3000));
        this.jungleCamps.push(new MLBBJungleMonster(1850, 450, 'RED_BUFF', 'Beast (Red Buff)', 3200));

        // River Bosses: Turtle & Lord
        this.jungleCamps.push(new MLBBJungleMonster(1250, 650, 'TURTLE', 'Turtle', 6500));
        this.jungleCamps.push(new MLBBJungleMonster(1750, 1350, 'LORD', 'Lord', 12000));
    }

    spawn3LaneMinions() {
        ['TOP', 'MID', 'BOT'].forEach(lane => {
            // Blue Minions
            for (let i = 0; i < 3; i++) {
                this.minions.push(new MLBBMinion(260, 1740, 'BLUE', lane, i));
            }
            // Red Minions
            for (let i = 0; i < 3; i++) {
                this.minions.push(new MLBBMinion(2740, 260, 'RED', lane, i));
            }
        });
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
        this.gameTime += dt;
        this.minionTimer += dt;

        // Minion Spawner every 25 seconds
        if (this.minionTimer >= 25.0) {
            this.minionTimer = 0;
            this.spawn3LaneMinions();
        }

        // 1. Update Player Controls
        if (this.player && this.player.alive) {
            this.handlePlayerInput(dt);
        }

        // 2. Update Heroes & AI
        this.heroes.forEach(h => h.update(dt, this));

        // 3. Update Minions
        this.minions.forEach(m => m.update(dt, this));
        this.minions = this.minions.filter(m => m.alive);

        // 4. Update Jungle Camps
        this.jungleCamps.forEach(j => j.update(dt, this));

        // 5. Update Turrets & Base Crystals
        this.turrets.forEach(t => t.update(dt, this));
        this.turrets = this.turrets.filter(t => t.alive);

        this.nexusList.forEach(n => n.update(dt, this));

        // 6. Update Summoned Lord
        if (this.summonedLord) {
            this.summonedLord.update(dt, this);
            if (!this.summonedLord.alive) this.summonedLord = null;
        }

        // 7. Update Projectiles
        this.projectiles.forEach(p => p.update(dt, this));
        this.projectiles = this.projectiles.filter(p => p.alive);

        // 8. Update Particles & Damage Texts
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.alive);

        this.damageTexts.forEach(t => t.update(dt));
        this.damageTexts = this.damageTexts.filter(t => t.alive);

        // 9. Camera Smoothing
        if (this.player) {
            const tx = this.player.x - this.camera.width / 2;
            const ty = this.player.y - this.camera.height / 2;
            this.camera.x += (tx - this.camera.x) * 0.1;
            this.camera.y += (ty - this.camera.y) * 0.1;

            this.camera.x = Math.max(0, Math.min(this.mapWidth - this.camera.width, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.mapHeight - this.camera.height, this.camera.y));
        }

        // 10. Update HUD
        this.updateHUD();

        // 11. Check Victory / Defeat
        const blueCore = this.nexusList.find(n => n.team === 'BLUE');
        const redCore = this.nexusList.find(n => n.team === 'RED');

        if (redCore && !redCore.alive) this.endMatch('VICTORY');
        else if (blueCore && !blueCore.alive) this.endMatch('DEFEAT');
    }

    handlePlayerInput(dt) {
        let mx = 0;
        let my = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) my -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) my += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;

        if (this.virtualJoystick.active) {
            mx = this.virtualJoystick.dx;
            my = this.virtualJoystick.dy;
        }

        const len = Math.hypot(mx, my);
        if (len > 0) {
            mx /= len;
            my /= len;

            this.player.isRecalling = false; // Cancel recall if moving
            this.player.x += mx * this.player.moveSpeed * 60 * dt;
            this.player.y += my * this.player.moveSpeed * 60 * dt;

            this.player.x = Math.max(60, Math.min(this.mapWidth - 60, this.player.x));
            this.player.y = Math.max(60, Math.min(this.mapHeight - 60, this.player.y));
        }

        this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
    }

    /* ==========================================================================
       Targeting, Bush Camouflage & Helpers
       ========================================================================== */
    isInsideBush(x, y) {
        for (let b of this.bushes) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                return b;
            }
        }
        return null;
    }

    getEnemiesOf(team) {
        const enemies = [];
        this.heroes.filter(h => h.team !== team && h.alive).forEach(h => enemies.push(h));
        this.minions.filter(m => m.team !== team && m.alive).forEach(m => enemies.push(m));
        this.turrets.filter(t => t.team !== team && t.alive).forEach(t => enemies.push(t));
        this.nexusList.filter(n => n.team !== team && n.alive).forEach(n => enemies.push(n));
        if (this.summonedLord && this.summonedLord.team !== team && this.summonedLord.alive) {
            enemies.push(this.summonedLord);
        }
        return enemies;
    }

    getAlliesOf(team) {
        return this.heroes.filter(h => h.team === team && h.alive);
    }

    showDamageText(x, y, damage, isCrit = false, isHeal = false) {
        this.damageTexts.push(new MLBBFloatingText(x, y, damage, isCrit, isHeal));
    }

    createExplosion(x, y, color = '#fbbf24', count = 20) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 5 + 2;
            this.particles.push(new MLBBParticle(x, y, Math.cos(ang) * spd, Math.sin(ang) * spd, color, Math.random() * 4 + 2, 0.4));
        }
    }

    addKillFeed(killerName, victimName, type = 'kill') {
        this.killFeed.unshift({ killerName, victimName, type });
        if (this.killFeed.length > 5) this.killFeed.pop();

        const feedEl = document.getElementById('killFeedBox');
        if (feedEl) {
            feedEl.innerHTML = this.killFeed.map(k => {
                if (k.type === 'system') return `<div class="feed-msg system">${k.victimName}</div>`;
                return `<div class="feed-msg"><span class="k">${k.killerName}</span> <i class="fa-solid fa-skull"></i> <span class="v">${k.victimName}</span></div>`;
            }).join('');
        }
    }

    triggerMultiKillAnnounce(streak, isPlayer) {
        const streaks = {
            1: 'First Blood!',
            2: 'Double Kill!',
            3: 'Triple Kill!',
            4: 'Maniac!',
            5: 'Savage!'
        };
        const text = streaks[streak] || 'Legendary!';
        this.sound.announce(text, true);

        // Show banner overlay
        const banner = document.getElementById('killStreakBanner');
        if (banner) {
            banner.textContent = text;
            banner.className = 'kill-streak-banner show';
            setTimeout(() => banner.className = 'kill-streak-banner', 2400);
        }
    }

    /* ==========================================================================
       HUD & Shop Management
       ========================================================================== */
    updateHUDHeroProfile() {
        if (!this.player) return;
        document.getElementById('hudPlayerName').textContent = this.player.heroData.name;
        document.getElementById('hudPlayerRole').textContent = this.player.heroData.role;
        document.getElementById('hudPlayerAvatar').textContent = this.player.heroData.icon;
        document.getElementById('hudPlayerSpellIcon').textContent = this.player.battleSpell.icon;

        // Skill names
        this.player.heroData.skills.forEach((s, idx) => {
            const nameEl = document.getElementById(`skillName${idx}`);
            if (nameEl) nameEl.textContent = s.name;
        });
    }

    updateHUD() {
        if (!this.player) return;

        // HP & Mana Bars
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        const manaPct = Math.max(0, (this.player.mana / this.player.maxMana) * 100);
        document.getElementById('playerHpBar').style.width = `${hpPct}%`;
        document.getElementById('playerManaBar').style.width = `${manaPct}%`;
        document.getElementById('playerHpLabel').textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;
        document.getElementById('playerLevelBadge').textContent = this.player.level;
        document.getElementById('playerGoldCount').textContent = `${Math.round(this.player.gold)} G`;

        // Skill Cooldowns
        for (let i = 0; i < 3; i++) {
            const cd = this.player.skillCooldowns[i] || 0;
            const slot = document.getElementById(`skillSlot${i}`);
            const cdText = document.getElementById(`skillCdText${i}`);
            if (cd > 0) {
                slot.classList.add('on-cd');
                cdText.textContent = cd.toFixed(1);
            } else {
                slot.classList.remove('on-cd');
                cdText.textContent = '';
            }
        }

        // Spell Cooldown
        const spellSlot = document.getElementById('spellSlot');
        const spellCdText = document.getElementById('spellCdText');
        if (this.player.spellCooldown > 0) {
            spellSlot.classList.add('on-cd');
            spellCdText.textContent = this.player.spellCooldown.toFixed(1);
        } else {
            spellSlot.classList.remove('on-cd');
            spellCdText.textContent = '';
        }

        // Match Scores & Timer
        document.getElementById('scoreBlueTeam').textContent = this.blueScore;
        document.getElementById('scoreRedTeam').textContent = this.redScore;
        const m = Math.floor(this.gameTime / 60);
        const s = Math.floor(this.gameTime % 60);
        document.getElementById('matchTimer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        // Quick-Buy Item Recommendation
        this.updateQuickBuyWidget();

        // Minimap Radar
        this.renderMinimap();
    }

    updateQuickBuyWidget() {
        if (!this.player) return;
        const unownedItems = MLBB_ITEMS.filter(item => !this.player.inventory.some(i => i.id === item.id));
        const affordable = unownedItems.find(item => item.price <= this.player.gold);

        const quickBox = document.getElementById('quickBuyBox');
        if (affordable && this.player.inventory.length < 6) {
            quickBox.style.display = 'flex';
            document.getElementById('quickItemIcon').textContent = affordable.icon;
            document.getElementById('quickItemName').textContent = affordable.name;
            document.getElementById('quickItemPrice').textContent = `${affordable.price} G`;
            quickBox.onclick = () => this.buyItem(affordable.id);
        } else {
            quickBox.style.display = 'none';
        }
    }

    buyItem(itemId) {
        if (!this.player || this.player.inventory.length >= 6) return;
        const item = MLBB_ITEMS.find(i => i.id === itemId);
        if (item && this.player.gold >= item.price) {
            this.player.gold -= item.price;
            this.player.inventory.push(item);
            this.player.applyItemStats(item);
            this.sound.playBuyItem();
            this.showDamageText(this.player.x, this.player.y - 30, `+${item.name}`, false, true);
            this.renderInventorySlots();
        }
    }

    renderInventorySlots() {
        const container = document.getElementById('hudInventoryRow');
        if (!container || !this.player) return;
        container.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const item = this.player.inventory[i];
            const slot = document.createElement('div');
            slot.className = 'item-icon-slot';
            slot.innerHTML = item ? item.icon : '';
            slot.title = item ? `${item.name}: ${item.desc}` : 'Slot Kosong';
            container.appendChild(slot);
        }
    }

    toggleItemShop() {
        const modal = document.getElementById('shopModal');
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            this.renderShopItems('ALL');
        }
    }

    renderShopItems(category = 'ALL') {
        const container = document.getElementById('shopItemsGrid');
        if (!container) return;
        container.innerHTML = '';

        const items = category === 'ALL' ? MLBB_ITEMS : MLBB_ITEMS.filter(i => i.category === category);
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item-card';
            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <h4>${item.name}</h4>
                    <span class="price-tag">${item.price} Gold</span>
                    <p>${item.desc}</p>
                </div>
                <button class="btn-buy" ${this.player.gold < item.price ? 'disabled' : ''}>Beli</button>
            `;
            card.querySelector('.btn-buy').onclick = () => {
                this.buyItem(item.id);
                this.renderShopItems(category);
            };
            container.appendChild(card);
        });
    }

    toggleScoreboard() {
        const modal = document.getElementById('scoreboardModal');
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            this.renderScoreboard();
        }
    }

    renderScoreboard() {
        const blueList = document.getElementById('scoreListBlue');
        const redList = document.getElementById('scoreListRed');
        if (!blueList || !redList) return;

        blueList.innerHTML = this.heroes.filter(h => h.team === 'BLUE').map(h => `
            <div class="score-row">
                <span>${h.heroData.icon} <strong>${h.heroData.name}</strong> (Lv.${h.level})</span>
                <span>${h.kills}/${h.deaths}/${h.assists}</span>
                <span>${Math.round(h.gold)} G</span>
            </div>
        `).join('');

        redList.innerHTML = this.heroes.filter(h => h.team === 'RED').map(h => `
            <div class="score-row">
                <span>${h.heroData.icon} <strong>${h.heroData.name}</strong> (Lv.${h.level})</span>
                <span>${h.kills}/${h.deaths}/${h.assists}</span>
                <span>${Math.round(h.gold)} G</span>
            </div>
        `).join('');
    }

    renderMinimap() {
        const miniCanvas = document.getElementById('minimapCanvas');
        if (!miniCanvas) return;
        const mctx = miniCanvas.getContext('2d');
        const mw = miniCanvas.width;
        const mh = miniCanvas.height;

        mctx.fillStyle = '#0a101d';
        mctx.fillRect(0, 0, mw, mh);

        // Draw 3 Lanes on Radar
        mctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        mctx.lineWidth = 3;

        // Top lane
        mctx.beginPath();
        mctx.moveTo(0, mh * 0.9);
        mctx.lineTo(0, mh * 0.1);
        mctx.lineTo(mw * 0.9, mh * 0.1);
        mctx.stroke();

        // Mid lane (Diagonal)
        mctx.beginPath();
        mctx.moveTo(0, mh * 0.9);
        mctx.lineTo(mw * 0.9, mh * 0.1);
        mctx.stroke();

        // Bot lane
        mctx.beginPath();
        mctx.moveTo(0, mh * 0.9);
        mctx.lineTo(mw * 0.9, mh * 0.9);
        mctx.lineTo(mw * 0.9, mh * 0.1);
        mctx.stroke();

        // Jungle Bosses (Turtle & Lord)
        this.jungleCamps.forEach(j => {
            if (!j.alive) return;
            const jx = (j.x / this.mapWidth) * mw;
            const jy = (j.y / this.mapHeight) * mh;
            mctx.fillStyle = j.type === 'LORD' ? '#fbbf24' : (j.type === 'TURTLE' ? '#22c55e' : '#a855f7');
            mctx.beginPath();
            mctx.arc(jx, jy, 3.5, 0, Math.PI * 2);
            mctx.fill();
        });

        // Turrets
        this.turrets.forEach(t => {
            const tx = (t.x / this.mapWidth) * mw;
            const ty = (t.y / this.mapHeight) * mh;
            mctx.fillStyle = t.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
            mctx.fillRect(tx - 2.5, ty - 2.5, 5, 5);
        });

        // Heroes
        this.heroes.forEach(h => {
            if (!h.alive) return;
            // Hide enemy in bush from radar if not visible
            if (h.team === 'RED' && h.isInBush && !this.player.isInBush) return;

            const hx = (h.x / this.mapWidth) * mw;
            const hy = (h.y / this.mapHeight) * mh;
            mctx.fillStyle = h.isHuman ? '#22c55e' : (h.team === 'BLUE' ? '#38bdf8' : '#ef4444');
            mctx.beginPath();
            mctx.arc(hx, hy, h.isHuman ? 4.5 : 3, 0, Math.PI * 2);
            mctx.fill();
        });
    }

    endMatch(result) {
        this.state = 'GAMEOVER';
        const modal = document.getElementById('screenGameOver');
        const title = document.getElementById('gameOverTitle');
        const desc = document.getElementById('gameOverDesc');

        if (result === 'VICTORY') {
            title.textContent = '🏆 VICTORY!';
            title.style.color = '#38bdf8';
            desc.textContent = 'Tim Anda berhasil menghancurkan Base Crystal musuh! Luar biasa!';
            this.sound.announce('Victory!');
        } else {
            title.textContent = '💀 DEFEAT';
            title.style.color = '#f43f5e';
            desc.textContent = 'Base Crystal Anda telah hancur. Jangan menyerah!';
            this.sound.announce('Defeat!');
        }

        modal.style.display = 'flex';
    }

    /* ==========================================================================
       Canvas Renderer
       ========================================================================== */
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // 1. Draw 3-Lane Land of Dawn Map Arena
        this.drawMapTerrain(ctx);

        // 2. Draw Bushes
        this.bushes.forEach(b => b.draw(ctx));

        // 3. Draw Jungle Camps
        this.jungleCamps.forEach(j => j.draw(ctx));

        // 4. Draw Turrets & Base Crystals
        this.turrets.forEach(t => t.draw(ctx));
        this.nexusList.forEach(n => n.draw(ctx));

        // 5. Draw Summoned Lord
        if (this.summonedLord) this.summonedLord.draw(ctx);

        // 6. Draw Minions
        this.minions.forEach(m => m.draw(ctx));

        // 7. Draw Heroes
        this.heroes.forEach(h => h.draw(ctx, this));

        // 8. Draw Projectiles
        this.projectiles.forEach(p => p.draw(ctx));

        // 9. Draw Particles & Damage Texts
        this.particles.forEach(p => p.draw(ctx));
        this.damageTexts.forEach(t => t.draw(ctx));

        ctx.restore();
    }

    drawMapTerrain(ctx) {
        const cw = this.mapWidth;
        const ch = this.mapHeight;

        // Ground Grass
        ctx.fillStyle = '#0e1815';
        ctx.fillRect(0, 0, cw, ch);

        // River diagonal stream
        ctx.fillStyle = '#0a2538';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cw, ch);
        ctx.lineWidth = 140;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.stroke();

        // 3-Lanes Path Surfaces
        ctx.strokeStyle = 'rgba(217, 180, 110, 0.18)';
        ctx.lineWidth = 110;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Top Lane
        ctx.beginPath();
        ctx.moveTo(220, 1780);
        ctx.lineTo(300, 300);
        ctx.lineTo(2780, 220);
        ctx.stroke();

        // Mid Lane (Diagonal)
        ctx.beginPath();
        ctx.moveTo(220, 1780);
        ctx.lineTo(2780, 220);
        ctx.stroke();

        // Bot Lane
        ctx.beginPath();
        ctx.moveTo(220, 1780);
        ctx.lineTo(2700, 1750);
        ctx.lineTo(2780, 220);
        ctx.stroke();

        // Base Circles
        ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
        ctx.beginPath();
        ctx.arc(220, 1780, 220, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.beginPath();
        ctx.arc(2780, 220, 220, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ==========================================================================
   MLBB Hero Entity Class (Leveling 1-15, Inventory, Skills, AI)
   ========================================================================== */
class MLBBHeroEntity {
    constructor(heroData, team, x, y, isHuman, battleSpell, laneIndex = 1) {
        this.heroData = heroData;
        this.team = team;
        this.x = x;
        this.y = y;
        this.isHuman = isHuman;
        this.battleSpell = battleSpell;
        this.laneIndex = laneIndex; // 0: Top, 1: Mid, 2: Bot, 3: Jungle

        this.radius = 22;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 180;
        this.gold = 300;

        // Base & Scaled Stats
        this.maxHp = heroData.baseHp;
        this.hp = this.maxHp;
        this.maxMana = heroData.baseMana;
        this.mana = this.maxMana;
        this.attackDamage = heroData.baseAttack;
        this.magicPower = heroData.magicPower || 0;
        this.armor = heroData.baseArmor;
        this.moveSpeed = heroData.moveSpeed;
        this.attackSpeed = heroData.attackSpeed;
        this.attackRange = heroData.attackRange;

        this.inventory = [];
        this.alive = true;
        this.respawnTimer = 0;
        this.angle = team === 'BLUE' ? -Math.PI / 4 : (3 * Math.PI) / 4;
        this.attackCooldown = 0;
        this.skillCooldowns = [0, 0, 0];
        this.spellCooldown = 0;

        this.isRecalling = false;
        this.recallTimer = 0;
        this.isInBush = false;
        this.shield = 0;

        // Stats
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
        this.killStreak = 0;
    }

    update(dt, game) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) this.respawn(game);
            return;
        }

        // Bush Camouflage Detection
        this.isInBush = !!game.isInsideBush(this.x, this.y);

        // Passive Mana & HP Regen
        if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + 3.5 * dt);

        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.spellCooldown > 0) this.spellCooldown -= dt;
        for (let i = 0; i < 3; i++) {
            if (this.skillCooldowns[i] > 0) this.skillCooldowns[i] -= dt;
        }

        // Recall Teleporter
        if (this.isRecalling) {
            this.recallTimer += dt;
            if (this.recallTimer >= 4.0) {
                this.isRecalling = false;
                this.x = this.team === 'BLUE' ? 220 : 2780;
                this.y = this.team === 'BLUE' ? 1780 : 220;
                this.hp = this.maxHp;
                this.mana = this.maxMana;
                game.sound.playHeal();
            }
        }

        // AI Bot Behavior
        if (!this.isHuman) {
            this.updateAI(dt, game);
        }
    }

    updateAI(dt, game) {
        // AI Buys Items automatically when gold is enough
        const affordable = MLBB_ITEMS.find(item => item.price <= this.gold && !this.inventory.some(i => i.id === item.id));
        if (affordable && this.inventory.length < 6) {
            this.gold -= affordable.price;
            this.inventory.push(affordable);
            this.applyItemStats(affordable);
        }

        // Target Nearest Enemy
        const enemies = game.getEnemiesOf(this.team);
        let nearest = null;
        let minDist = 9999;

        enemies.forEach(e => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        });

        if (nearest && minDist < 320) {
            this.angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);

            if (minDist <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.0 / this.attackSpeed;
                    if (this.attackRange > 150) {
                        game.projectiles.push(new MLBBProjectile(this.x, this.y, nearest.x, nearest.y, this.attackDamage, this.team, this, 12, 'laser'));
                    } else {
                        nearest.takeDamage(this.attackDamage, this, game);
                        game.createExplosion(nearest.x, nearest.y, '#f43f5e', 6);
                    }
                }
            } else {
                // Advance
                this.x += Math.cos(this.angle) * this.moveSpeed * 60 * dt;
                this.y += Math.sin(this.angle) * this.moveSpeed * 60 * dt;
            }

            // Cast AI Skills
            for (let i = 0; i < 3; i++) {
                if (this.skillCooldowns[i] <= 0 && Math.random() < 0.04) {
                    this.castSkill(i, game);
                }
            }
        } else {
            // Push Lane Towards Enemy Base
            const targetX = this.team === 'BLUE' ? 2780 : 220;
            const targetY = this.team === 'BLUE' ? 220 : 1780;
            const ang = Math.atan2(targetY - this.y, targetX - this.x);
            this.x += Math.cos(ang) * this.moveSpeed * 60 * dt;
            this.y += Math.sin(ang) * this.moveSpeed * 60 * dt;
        }
    }

    performBasicAttack(game) {
        if (this.attackCooldown > 0) return;
        this.attackCooldown = 1.0 / this.attackSpeed;
        this.isRecalling = false;

        if (this.attackRange > 150) {
            game.projectiles.push(new MLBBProjectile(this.x, this.y, game.mouse.worldX, game.mouse.worldY, this.attackDamage, this.team, this, 13, 'laser'));
            game.sound.playLaser();
        } else {
            game.sound.playSlash();
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= this.attackRange + e.radius) {
                    e.takeDamage(this.attackDamage, this, game);
                    game.createExplosion(e.x, e.y, '#f43f5e', 8);
                }
            });
        }
    }

    castSkill(idx, game) {
        if (this.skillCooldowns[idx] > 0) return;
        const skill = this.heroData.skills[idx];
        if (this.mana < skill.manaCost) return;

        this.mana -= skill.manaCost;
        this.skillCooldowns[idx] = skill.cooldown;
        this.isRecalling = false;

        const targetX = this.isHuman ? game.mouse.worldX : this.x + Math.cos(this.angle) * 200;
        const targetY = this.isHuman ? game.mouse.worldY : this.y + Math.sin(this.angle) * 200;
        const ang = Math.atan2(targetY - this.y, targetX - this.x);

        if (skill.type === 'flip' || skill.type === 'airborne_lock') {
            game.sound.playSlash();
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= skill.range) {
                    e.takeDamage(this.attackDamage * 2.2, this, game);
                    e.x = this.x - Math.cos(this.angle) * 60; // Flip behind
                    e.y = this.y - Math.sin(this.angle) * 60;
                }
            });
        } else if (skill.type === 'dash_target' || skill.type === 'dash_straight') {
            this.x += Math.cos(ang) * skill.range;
            this.y += Math.sin(ang) * skill.range;
            game.sound.playSlash();
            game.createExplosion(this.x, this.y, '#38bdf8', 15);
        } else if (skill.type === 'fan_lightning' || skill.type === 'thunder_smite') {
            game.sound.playThunder();
            game.createExplosion(targetX, targetY, '#3b82f6', 30);
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - targetX, e.y - targetY) <= 140) {
                    e.takeDamage(skill.manaCost * 4.5, this, game);
                }
            });
        } else if (skill.type === 'global_laser') {
            game.sound.playLaser();
            game.projectiles.push(new MLBBProjectile(this.x, this.y, targetX, targetY, this.attackDamage * 3.5, this.team, this, 22, 'global_beam'));
        } else if (skill.type === 'heal_link' || skill.type === 'mass_heal') {
            game.sound.playHeal();
            game.getAlliesOf(this.team).forEach(a => {
                if (Math.hypot(a.x - this.x, a.y - this.y) <= skill.range) {
                    a.hp = Math.min(a.maxHp, a.hp + 450);
                    game.showDamageText(a.x, a.y - 20, '+450 HP', false, true);
                }
            });
        }
    }

    castBattleSpell(game) {
        if (this.spellCooldown > 0) return;
        this.spellCooldown = this.battleSpell.cooldown;

        if (this.battleSpell.id === 'flicker') {
            const ang = this.angle;
            this.x += Math.cos(ang) * 180;
            this.y += Math.sin(ang) * 180;
            game.createExplosion(this.x, this.y, '#fbbf24', 20);
        } else if (this.battleSpell.id === 'execute') {
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= 180) {
                    const missingHp = e.maxHp - e.hp;
                    const dmg = 200 + missingHp * 0.2;
                    e.takeDamage(dmg, this, game);
                    game.showDamageText(e.x, e.y - 20, `${Math.round(dmg)} TRUE`, true);
                }
            });
        } else if (this.battleSpell.id === 'retribution') {
            game.jungleCamps.filter(j => j.alive && Math.hypot(j.x - this.x, j.y - this.y) <= 220).forEach(j => {
                j.takeDamage(800, this, game);
                game.showDamageText(j.x, j.y - 25, '800 RETRI', true);
            });
        }
    }

    startRecall(game) {
        this.isRecalling = true;
        this.recallTimer = 0;
    }

    applyItemStats(item) {
        if (item.stats.attack) this.attackDamage += item.stats.attack;
        if (item.stats.magic) this.magicPower += item.stats.magic;
        if (item.stats.hp) {
            this.maxHp += item.stats.hp;
            this.hp += item.stats.hp;
        }
        if (item.stats.armor) this.armor += item.stats.armor;
        if (item.stats.speed) this.moveSpeed += item.stats.speed;
        if (item.stats.atkSpeed) this.attackSpeed += item.stats.atkSpeed;
    }

    gainExpAndGold(expGained, goldGained, game) {
        this.gold += goldGained;
        this.exp += expGained;

        if (this.exp >= this.expToNext && this.level < 15) {
            this.level += 1;
            this.exp -= this.expToNext;
            this.expToNext = Math.round(this.expToNext * 1.35);
            this.maxHp += this.heroData.hpPerLevel;
            this.hp += this.heroData.hpPerLevel;
            this.attackDamage += this.heroData.attackPerLevel;

            if (this.isHuman) game.sound.playLevelUp();
            game.showDamageText(this.x, this.y - 35, `LEVEL UP! (${this.level})`, true, true);
        }
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.isRecalling = false;

        this.hp -= amount;
        game.showDamageText(this.x, this.y - 15, Math.round(amount));

        if (this.hp <= 0) {
            this.die(attacker, game);
        }
    }

    die(attacker, game) {
        this.alive = false;
        this.hp = 0;
        this.deaths += 1;
        this.respawnTimer = 6.0 + this.level * 1.5;

        if (attacker) {
            attacker.kills += 1;
            attacker.killStreak += 1;
            attacker.gainExpAndGold(250, 200, game);

            if (attacker.team === 'BLUE') game.blueScore += 1;
            else game.redScore += 1;

            game.addKillFeed(attacker.heroData.name, this.heroData.name, 'kill');

            if (!game.firstBloodClaimed) {
                game.firstBloodClaimed = true;
                game.sound.announce('First Blood!');
            } else {
                game.triggerMultiKillAnnounce(attacker.killStreak, attacker.isHuman);
            }
        }
    }

    respawn(game) {
        this.alive = true;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        this.x = this.team === 'BLUE' ? 220 : 2780;
        this.y = this.team === 'BLUE' ? 1780 : 220;
        this.killStreak = 0;
    }

    draw(ctx, game) {
        if (!this.alive) return;

        // Hide enemy in bush if player is outside
        if (this.team === 'RED' && this.isInBush && !game.player.isInBush) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Recall Animation
        if (this.isRecalling) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Bush Transparency
        if (this.isInBush) ctx.globalAlpha = 0.55;

        // Team Ring
        ctx.strokeStyle = this.isHuman ? '#22c55e' : (this.team === 'BLUE' ? '#38bdf8' : '#ef4444');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Hero Icon Core
        ctx.fillStyle = this.heroData.avatarColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.heroData.icon, 0, 0);

        ctx.restore();

        // Health Bar & Level Badge
        const barW = 46;
        const barH = 5;
        const barX = this.x - barW / 2;
        const barY = this.y - this.radius - 14;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);

        // Level text
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${this.level} ${this.heroData.name}`, this.x, barY - 3);
    }
}

/* ==========================================================================
   Map Structures, Minions, Jungle Monsters, Turrets
   ========================================================================== */
class MLBBBush {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(21, 128, 61, 0.45)';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = '16px sans-serif';
        ctx.fillText('🌿', this.x + this.w / 2, this.y + this.h / 2 + 5);
    }
}

class MLBBJungleMonster {
    constructor(x, y, type, name, hp) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.name = name;
        this.maxHp = hp;
        this.hp = hp;
        this.radius = type === 'LORD' ? 45 : (type === 'TURTLE' ? 35 : 24);
        this.damage = type === 'LORD' ? 140 : 45;
        this.alive = true;
        this.respawnTimer = 0;
    }

    update(dt, game) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.alive = true;
                this.hp = this.maxHp;
            }
        }
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 20, Math.round(amount));

        if (this.hp <= 0) {
            this.alive = false;
            this.respawnTimer = this.type === 'LORD' ? 180 : 90;
            game.createExplosion(this.x, this.y, '#fbbf24', 35);

            if (attacker) {
                attacker.gainExpAndGold(400, 250, game);

                if (this.type === 'TURTLE') {
                    game.sound.announce('The Turtle has been slain!');
                    game.getAlliesOf(attacker.team).forEach(a => a.shield += 300);
                    game.addKillFeed(attacker.heroData.name, 'Mengalahkan Turtle!', 'system');
                } else if (this.type === 'LORD') {
                    game.sound.announce('The Lord has been summoned!');
                    game.sound.playLordRoar();
                    game.summonedLord = new MLBBLord(this.x, this.y, attacker.team);
                    game.addKillFeed(attacker.heroData.name, 'Memanggil LORD untuk Push!', 'system');
                }
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = this.type === 'LORD' ? '#fbbf24' : (this.type === 'TURTLE' ? '#10b981' : '#a855f7');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = { LORD: '👑', TURTLE: '🐢', BLUE_BUFF: '🔷', RED_BUFF: '🔴' };
        ctx.fillText(icons[this.type] || '👾', this.x, this.y);

        // HP bar
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - 25, this.y - this.radius - 12, 50, 4);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(this.x - 25, this.y - this.radius - 12, 50 * hpPct, 4);
    }
}

class MLBBLord {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.radius = 45;
        this.maxHp = 10000;
        this.hp = this.maxHp;
        this.damage = 220;
        this.speed = 1.4;
        this.alive = true;
    }

    update(dt, game) {
        const targetX = this.team === 'BLUE' ? 2780 : 220;
        const targetY = this.team === 'BLUE' ? 220 : 1780;
        const ang = Math.atan2(targetY - this.y, targetX - this.x);

        this.x += Math.cos(ang) * this.speed * 60 * dt;
        this.y += Math.sin(ang) * this.speed * 60 * dt;

        // Attack enemy turrets/base
        game.getEnemiesOf(this.team).forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= 120) {
                e.takeDamage(this.damage * dt, null, game);
            }
        });
    }

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#fbbf24', 40);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👹', this.x, this.y);
        ctx.restore();
    }
}

class MLBBMinion {
    constructor(x, y, team, lane, idx) {
        this.x = x + idx * 15;
        this.y = y + idx * 15;
        this.team = team;
        this.lane = lane;
        this.radius = 12;
        this.maxHp = 220;
        this.hp = this.maxHp;
        this.speed = 1.7;
        this.damage = 18;
        this.alive = true;
    }

    update(dt, game) {
        const targetX = this.team === 'BLUE' ? 2780 : 220;
        const targetY = this.team === 'BLUE' ? 220 : 1780;
        const ang = Math.atan2(targetY - this.y, targetX - this.x);

        this.x += Math.cos(ang) * this.speed * 60 * dt;
        this.y += Math.sin(ang) * this.speed * 60 * dt;

        // Attack enemies
        game.getEnemiesOf(this.team).forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= 60) {
                e.takeDamage(this.damage * dt, null, game);
            }
        });
    }

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            if (attacker) attacker.gainExpAndGold(60, 45, game);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#0284c7' : '#be123c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class MLBBTurret {
    constructor(x, y, team, name) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.name = name;
        this.radius = 32;
        this.maxHp = 2200;
        this.hp = this.maxHp;
        this.range = 260;
        this.damage = 110;
        this.shootTimer = 0;
        this.alive = true;
    }

    update(dt, game) {
        this.shootTimer += dt;
        if (this.shootTimer >= 1.1) {
            const targets = game.getEnemiesOf(this.team).filter(e => Math.hypot(e.x - this.x, e.y - this.y) <= this.range);
            if (targets.length > 0) {
                this.shootTimer = 0;
                game.projectiles.push(new MLBBProjectile(this.x, this.y, targets[0].x, targets[0].y, this.damage, this.team, this, 14, 'turret_beam'));
                game.sound.playLaser();
            }
        }
    }

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 25, Math.round(amount));
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#fbbf24', 35);
            game.sound.announce(this.team === 'BLUE' ? 'Our turret has been destroyed!' : 'Enemy turret has been destroyed!');
            game.addKillFeed(attacker ? attacker.heroData.name : 'Team', `${this.name} Hancur!`, 'system');
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#0c2d48' : '#3d121c';
        ctx.strokeStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - 25, this.y - 45, 50, 5);
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.fillRect(this.x - 25, this.y - 45, 50 * hpPct, 5);
    }
}

class MLBBBaseCrystal {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.radius = 50;
        this.maxHp = 4500;
        this.hp = this.maxHp;
        this.alive = true;
    }

    update() {}

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 35, Math.round(amount));
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#ffffff', 50);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#0284c7' : '#be123c';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', this.x, this.y);
    }
}

class MLBBProjectile {
    constructor(sx, sy, tx, ty, damage, team, owner, speed, type) {
        this.x = sx;
        this.y = sy;
        this.damage = damage;
        this.team = team;
        this.owner = owner;
        this.speed = speed;
        this.type = type;
        this.alive = true;
        this.life = 2.5;

        const ang = Math.atan2(ty - sy, tx - sx);
        this.vx = Math.cos(ang) * speed;
        this.vy = Math.sin(ang) * speed;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        this.x += this.vx * 60 * dt;
        this.y += this.vy * 60 * dt;

        game.getEnemiesOf(this.team).forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) < e.radius + 6) {
                e.takeDamage(this.damage, this.owner, game);
                this.alive = false;
            }
        });
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class MLBBParticle {
    constructor(x, y, vx, vy, color, radius, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.life = life;
        this.maxLife = life;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        this.x += this.vx;
        this.y += this.vy;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class MLBBFloatingText {
    constructor(x, y, text, isCrit, isHeal) {
        this.x = x + (Math.random() - 0.5) * 15;
        this.y = y;
        this.text = text;
        this.isCrit = isCrit;
        this.isHeal = isHeal;
        this.life = 0.8;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        this.y -= 25 * dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / 0.8);
        ctx.font = `bold ${this.isCrit ? '16px' : '13px'} "Outfit", sans-serif`;
        ctx.fillStyle = this.isHeal ? '#22c55e' : (this.isCrit ? '#fbbf24' : '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Attach globally
window.addEventListener('DOMContentLoaded', () => {
    window.mlbbGame = new MLBBGameEngine();
});
