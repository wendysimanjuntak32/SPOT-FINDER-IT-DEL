/**
 * CHRONO MATIKA: 5v5 Legends of Numeria
 * High-Performance 60 FPS HTML5 Canvas Engine
 * Fusing 5v5 MOBA 3-Lanes, Jungle Camps, Bushes, Item Shop, Leveling 1-15,
 * with Mathematical Critical Surges, River Math Runes, and Titan Lord of Numeria!
 */

class MLBBGameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new MLBBSoundEngine();

        // Map Dimensions (Numeria Runic Arena: 3000 x 2000 px)
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
        this.riverRunes = [];
        this.projectiles = [];
        this.particles = [];
        this.ambientMathMotes = [];
        this.damageTexts = [];
        this.summonedLord = null;

        // Game Match State
        this.gameTime = 0;
        this.minionTimer = 0;
        this.runeTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];
        this.firstBloodClaimed = false;

        // Math Surge State
        this.mathSurgeActive = false;
        this.mathSurgeTimer = 0;
        this.mathSurgeQuestion = null;
        this.mathSurgeCooldown = 0;

        // Shop Discount State
        this.shopDiscountActive = false;
        this.shopMathQuestion = null;

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
        this.initAmbientMotes();
        this.startLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    initAmbientMotes() {
        this.ambientMathMotes = [];
        const symbols = ['π', '∑', '∫', '∞', '√x', '∆', 'θ', 'λ', 'e', 'x²', '∇', '±', '≠', '≈'];
        for (let i = 0; i < 65; i++) {
            this.ambientMathMotes.push({
                x: Math.random() * this.mapWidth,
                y: Math.random() * this.mapHeight,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                size: 14 + Math.random() * 18,
                speedY: -0.2 - Math.random() * 0.4,
                speedX: (Math.random() - 0.5) * 0.3,
                opacity: 0.15 + Math.random() * 0.25,
                color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24'
            });
        }
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keys[e.key.toUpperCase()] = true;

            // Math Surge Keyboard Options (Keys 1, 2, 3, 4 during surge)
            if (this.mathSurgeActive && this.mathSurgeQuestion) {
                if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
                    const optIdx = parseInt(e.key) - 1;
                    if (optIdx >= 0 && optIdx < this.mathSurgeQuestion.options.length) {
                        this.answerMathSurge(this.mathSurgeQuestion.options[optIdx]);
                        return;
                    }
                }
            }

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
       Match Initialization (Draft 5v5, Map Entities, Jungle, Runes, Turrets)
       ========================================================================== */
    startMatch(chosenHeroId, chosenSpellId) {
        this.sound.init();
        this.state = 'PLAYING';
        this.gameTime = 0;
        this.minionTimer = 0;
        this.runeTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];
        this.firstBloodClaimed = false;
        this.summonedLord = null;
        this.mathSurgeActive = false;
        this.mathSurgeCooldown = 15;
        this.shopDiscountActive = false;

        this.heroes = [];
        this.minions = [];
        this.turrets = [];
        this.nexusList = [];
        this.jungleCamps = [];
        this.bushes = [];
        this.riverRunes = [];
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

            const hero = new MLBBHeroEntity(cfg, 'BLUE', startPos.x, startPos.y, isHuman, spell, idx % 3);
            this.heroes.push(hero);
            if (isHuman) this.player = hero;
        });

        // Red Team (5 AI Opponents)
        const redHeroKeys = allHeroKeys.slice(0, 5);
        redHeroKeys.forEach((key, idx) => {
            const cfg = MLBB_HEROES.find(h => h.id === key);
            const startPos = this.getHeroSpawnPoint('RED', idx);
            const spell = MLBB_BATTLE_SPELLS[(idx + 2) % MLBB_BATTLE_SPELLS.length];

            const hero = new MLBBHeroEntity(cfg, 'RED', startPos.x, startPos.y, false, spell, idx % 3);
            this.heroes.push(hero);
        });

        // 3. Spawn Initial River Math Runes & Initial Minions
        this.spawnRiverRunes();
        this.spawn3LaneMinions();

        // 4. Switch Screens
        document.getElementById('screenHeroDraft').style.display = 'none';
        document.getElementById('screenBattleHUD').style.display = 'block';

        // Update HUD Hero Icons & Names
        document.getElementById('hudPlayerAvatar').textContent = this.player.heroData.icon;
        document.getElementById('hudPlayerName').textContent = `${this.player.heroData.name} (Lv.1)`;
        document.getElementById('hudPlayerSpellIcon').textContent = this.player.battleSpell.icon;

        for (let i = 0; i < 3; i++) {
            document.getElementById(`skillName${i}`).textContent = this.player.heroData.skills[i].name.split(' ')[0];
        }

        this.renderInventorySlots();
        this.addKillFeed('system', '⚔️ Selamat datang di CHRONO MATIKA: Legends of Numeria!');
        this.sound.announce('Welcome to Chrono Matika, Legends of Numeria!');
    }

    getHeroSpawnPoint(team, index) {
        const base = team === 'BLUE' ? { x: 220, y: 1780 } : { x: 2780, y: 220 };
        const offsets = [
            { x: 0, y: 0 },
            { x: 40, y: -40 },
            { x: -40, y: 40 },
            { x: 50, y: 50 },
            { x: -50, y: -50 }
        ];
        return {
            x: base.x + offsets[index % offsets.length].x,
            y: base.y + offsets[index % offsets.length].y
        };
    }

    buildMapEntities() {
        // 2 Nexus Base Crystals (Blue & Red)
        this.nexusList.push(new MLBBBaseNexus(220, 1780, 'BLUE', 8000));
        this.nexusList.push(new MLBBBaseNexus(2780, 220, 'RED', 8000));

        // 9 Blue Turrets (Top, Mid, Bot lanes)
        // Top Lane Blue
        this.turrets.push(new MLBBTurret(300, 1200, 'BLUE', 'Top Outer'));
        this.turrets.push(new MLBBTurret(300, 600, 'BLUE', 'Top Inner'));
        this.turrets.push(new MLBBTurret(450, 1550, 'BLUE', 'Top Base'));

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

        // Bushes (Runic Foliage)
        const bushLocations = [
            { x: 1500, y: 1000, w: 130, h: 75 }, // Mid River Bush
            { x: 1350, y: 850, w: 110, h: 85 },  // River Upper
            { x: 1650, y: 1150, w: 110, h: 85 }, // River Lower
            { x: 800, y: 800, w: 95, h: 65 },    // Blue Jungle Bush
            { x: 2200, y: 1200, w: 95, h: 65 },  // Red Jungle Bush
            { x: 450, y: 400, w: 120, h: 75 },   // Top Corner
            { x: 2550, y: 1600, w: 120, h: 75 }  // Bot Corner
        ];
        bushLocations.forEach(b => this.bushes.push(new MLBBBush(b.x, b.y, b.w, b.h)));

        // Jungle Camps: Blue Buff, Red Buff, Turtle, Lord
        this.jungleCamps.push(new MLBBJungleMonster(850, 1150, 'BLUE_BUFF', 'Quantum Fiend (Blue Buff)', 3200));
        this.jungleCamps.push(new MLBBJungleMonster(1150, 1550, 'RED_BUFF', 'Matrix Beast (Red Buff)', 3400));
        this.jungleCamps.push(new MLBBJungleMonster(2150, 850, 'BLUE_BUFF', 'Quantum Fiend (Blue Buff)', 3200));
        this.jungleCamps.push(new MLBBJungleMonster(1850, 450, 'RED_BUFF', 'Matrix Beast (Red Buff)', 3400));

        // River Bosses: Geometry Turtle & Ancient Math Titan Lord
        this.jungleCamps.push(new MLBBJungleMonster(1250, 650, 'TURTLE', 'Geometric Turtle', 7000));
        this.jungleCamps.push(new MLBBJungleMonster(1750, 1350, 'LORD', 'Math Titan of Numeria', 13500));
    }

    spawnRiverRunes() {
        this.riverRunes = [];
        // 4 River Math Runes
        this.riverRunes.push(new MLBBRiverRune(1400, 900, 'PI', 'π (Pi Shield 600)'));
        this.riverRunes.push(new MLBBRiverRune(1600, 1100, 'SIGMA', '∑ (Sigma Gold +200)'));
        this.riverRunes.push(new MLBBRiverRune(1100, 500, 'INFINITY', '∞ (Infinite Mana & CDR)'));
        this.riverRunes.push(new MLBBRiverRune(1900, 1500, 'SQRT', '√x (Akar Pemulihan 50%)'));
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
        this.runeTimer += dt;
        if (this.mathSurgeCooldown > 0) this.mathSurgeCooldown -= dt;

        // Minion Spawner every 25 seconds
        if (this.minionTimer >= 25.0) {
            this.minionTimer = 0;
            this.spawn3LaneMinions();
        }

        // River Rune Respawn every 45 seconds
        if (this.runeTimer >= 45.0) {
            this.runeTimer = 0;
            this.spawnRiverRunes();
            this.addKillFeed('system', '✨ Runic Math Nodes telah muncul di sepanjang sungai!');
        }

        // 1. Update Player Controls
        if (this.player && this.player.alive) {
            this.handlePlayerInput(dt);
        }

        // 2. Update Ambient Math Motes
        this.ambientMathMotes.forEach(mote => {
            mote.y += mote.speedY;
            mote.x += mote.speedX;
            if (mote.y < 0) mote.y = this.mapHeight;
            if (mote.x < 0) mote.x = this.mapWidth;
            if (mote.x > this.mapWidth) mote.x = 0;
        });

        // 3. Update Heroes & AI
        this.heroes.forEach(h => h.update(dt, this));

        // 4. Update Minions
        this.minions.forEach(m => m.update(dt, this));
        this.minions = this.minions.filter(m => m.alive);

        // 5. Update Jungle Camps
        this.jungleCamps.forEach(j => j.update(dt, this));

        // 6. Update River Math Runes
        this.riverRunes.forEach(r => r.update(dt, this));
        this.riverRunes = this.riverRunes.filter(r => r.alive);

        // 7. Update Turrets & Base Crystals
        this.turrets.forEach(t => t.update(dt, this));
        this.turrets = this.turrets.filter(t => t.alive);
        this.nexusList.forEach(n => n.update(dt, this));

        // 8. Update Summoned Math Titan Lord
        if (this.summonedLord) {
            this.summonedLord.update(dt, this);
            if (!this.summonedLord.alive) this.summonedLord = null;
        }

        // 9. Update Projectiles
        this.projectiles.forEach(p => p.update(dt, this));
        this.projectiles = this.projectiles.filter(p => p.alive);

        // 10. Update Particles & Damage Texts
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.alive);

        this.damageTexts.forEach(t => t.update(dt));
        this.damageTexts = this.damageTexts.filter(t => t.alive);

        // 11. Update Math Surge Popup Timer
        if (this.mathSurgeActive) {
            this.mathSurgeTimer -= dt;
            const pct = Math.max(0, (this.mathSurgeTimer / 2.5) * 100);
            const fill = document.getElementById('mathTimerFill');
            const timerTxt = document.getElementById('mathSurgeTimerText');
            if (fill) fill.style.width = `${pct}%`;
            if (timerTxt) timerTxt.textContent = `${this.mathSurgeTimer.toFixed(1)}s`;

            if (this.mathSurgeTimer <= 0) {
                this.closeMathSurge(false);
            }
        }

        // 12. Camera Smoothing
        if (this.player) {
            const tx = this.player.x - this.camera.width / 2;
            const ty = this.player.y - this.camera.height / 2;
            this.camera.x += (tx - this.camera.x) * 0.1;
            this.camera.y += (ty - this.camera.y) * 0.1;

            this.camera.x = Math.max(0, Math.min(this.mapWidth - this.camera.width, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.mapHeight - this.camera.height, this.camera.y));
        }

        // 13. Update HUD
        this.updateHUD();

        // 14. Check Victory / Defeat
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

            this.player.isRecalling = false;
            this.player.x += mx * this.player.moveSpeed * 60 * dt;
            this.player.y += my * this.player.moveSpeed * 60 * dt;

            this.player.x = Math.max(60, Math.min(this.mapWidth - 60, this.player.x));
            this.player.y = Math.max(60, Math.min(this.mapHeight - 60, this.player.y));
        }

        this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
    }

    /* ==========================================================================
       Mathematical Critical Surge Engine
       ========================================================================== */
    triggerMathSurge() {
        if (this.mathSurgeActive || this.mathSurgeCooldown > 0) return;
        this.mathSurgeActive = true;
        this.mathSurgeTimer = 2.5;
        this.mathSurgeCooldown = 18;

        // Generate Math Question (Arithmetic, Power, Roots, Algebra)
        const types = ['mul', 'add_mul', 'sqrt', 'power'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        let qText = '';
        let ans = 0;

        if (chosenType === 'mul') {
            const a = Math.floor(Math.random() * 8) + 6;
            const b = Math.floor(Math.random() * 8) + 6;
            ans = a * b;
            qText = `${a} × ${b} = ?`;
        } else if (chosenType === 'add_mul') {
            const a = Math.floor(Math.random() * 15) + 10;
            const b = Math.floor(Math.random() * 5) + 3;
            const c = Math.floor(Math.random() * 10) + 2;
            ans = a + b * c;
            qText = `${a} + (${b} × ${c}) = ?`;
        } else if (chosenType === 'sqrt') {
            const roots = [9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
            const chosenRoot = roots[Math.floor(Math.random() * roots.length)];
            ans = Math.sqrt(chosenRoot);
            qText = `√${chosenRoot} = ?`;
        } else {
            const base = Math.floor(Math.random() * 6) + 4;
            ans = base * base;
            qText = `${base}² = ?`;
        }

        // Generate 3 options (1 correct, 2 distractors)
        const options = [ans];
        while (options.length < 3) {
            const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
            const fake = ans + delta;
            if (fake > 0 && !options.includes(fake)) {
                options.push(fake);
            }
        }
        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        this.mathSurgeQuestion = { qText, ans, options };

        // Render to HUD
        const card = document.getElementById('mathSurgeCard');
        document.getElementById('mathEquationText').textContent = qText;
        const grid = document.getElementById('mathOptionsGrid');
        grid.innerHTML = '';

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-math-opt';
            btn.innerHTML = `<span style="color: var(--chrono-gold); font-size: 0.75rem; margin-right: 4px;">[${idx + 1}]</span> ${opt}`;
            btn.onclick = () => this.answerMathSurge(opt);
            grid.appendChild(btn);
        });

        card.classList.add('active');
        this.sound.playLevelUp();
    }

    answerMathSurge(selectedAns) {
        if (!this.mathSurgeActive || !this.mathSurgeQuestion) return;
        const isCorrect = (selectedAns === this.mathSurgeQuestion.ans);
        this.closeMathSurge(isCorrect);
    }

    closeMathSurge(success) {
        this.mathSurgeActive = false;
        const card = document.getElementById('mathSurgeCard');
        if (card) card.classList.remove('active');

        if (success && this.player && this.player.alive) {
            // Apply 250% True Critical Surge Buff
            this.player.mathSurgeStacks = 3;
            this.player.mathSurgeBonusSpeed = 1.6;
            this.player.skillCooldowns = [0, 0, 0]; // Reset all skill CDs!
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 500);

            this.showDamageText(this.player.x, this.player.y - 45, '★ MATH CRITICAL SURGE +250% TRUE DMG! ★', true, true);
            this.createExplosion(this.player.x, this.player.y, '#38bdf8', 35);
            this.sound.playBuyItem();
            this.sound.announce('Mathematical Critical Surge Activated!');
        }
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
        const allies = [];
        this.heroes.filter(h => h.team === team && h.alive).forEach(h => allies.push(h));
        this.minions.filter(m => m.team === team && m.alive).forEach(m => allies.push(m));
        this.turrets.filter(t => t.team === team && t.alive).forEach(t => allies.push(t));
        this.nexusList.filter(n => n.team === team && n.alive).forEach(n => allies.push(n));
        if (this.summonedLord && this.summonedLord.team === team && this.summonedLord.alive) {
            allies.push(this.summonedLord);
        }
        return allies;
    }

    createExplosion(x, y, color = '#fbbf24', count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new MLBBParticle(x, y, color));
        }
    }

    showDamageText(x, y, text, isCrit = false, isHeal = false) {
        this.damageTexts.push(new MLBBFloatingText(x, y, text, isCrit, isHeal));
    }

    addKillFeed(type, text) {
        const feedBox = document.getElementById('killFeedBox');
        if (!feedBox) return;

        const msg = document.createElement('div');
        msg.className = `feed-msg ${type}`;
        msg.innerHTML = text;
        feedBox.prepend(msg);

        setTimeout(() => {
            if (msg.parentNode) msg.parentNode.removeChild(msg);
        }, 5000);
    }

    showKillStreakBanner(text) {
        const banner = document.getElementById('killStreakBanner');
        if (!banner) return;
        banner.textContent = text;
        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 2200);
    }

    /* ==========================================================================
       HUD Updating & UI Widgets
       ========================================================================== */
    updateHUD() {
        if (!this.player) return;

        // Player Bars
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        const manaPct = Math.max(0, (this.player.mana / this.player.maxMana) * 100);

        document.getElementById('playerHpBar').style.width = `${hpPct}%`;
        document.getElementById('playerManaBar').style.width = `${manaPct}%`;
        document.getElementById('playerHpLabel').textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;
        document.getElementById('hudPlayerName').textContent = `${this.player.heroData.name} (Lv.${this.player.level})`;
        document.getElementById('playerGoldCount').textContent = `${Math.round(this.player.gold)} G`;

        // Active Runes Indicator
        const runeIndicator = document.getElementById('hudRunesIndicator');
        if (runeIndicator) {
            let activeHtml = '';
            if (this.player.piShieldTimer > 0) activeHtml += `<span class="rune-active-badge">🛡️ Pi Shield (${this.player.piShieldTimer.toFixed(0)}s)</span>`;
            if (this.player.infinityTimer > 0) activeHtml += `<span class="rune-active-badge" style="color: #fbbf24; border-color: #fbbf24;">∞ Infinity CDR (${this.player.infinityTimer.toFixed(0)}s)</span>`;
            if (this.player.mathSurgeStacks > 0) activeHtml += `<span class="rune-active-badge" style="color: #f43f5e; border-color: #f43f5e;">⚡ Critical Surge (${this.player.mathSurgeStacks})</span>`;
            runeIndicator.innerHTML = activeHtml;
        }

        // Skills Cooldowns
        for (let i = 0; i < 3; i++) {
            const cd = this.player.skillCooldowns[i];
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
        const affordable = unownedItems.find(item => {
            const price = this.shopDiscountActive ? Math.round(item.price * 0.75) : item.price;
            return price <= this.player.gold;
        });

        const quickBox = document.getElementById('quickBuyBox');
        if (affordable && this.player.inventory.length < 6) {
            quickBox.style.display = 'flex';
            document.getElementById('quickItemIcon').textContent = affordable.icon;
            document.getElementById('quickItemName').textContent = affordable.name;
            const finalPrice = this.shopDiscountActive ? Math.round(affordable.price * 0.75) : affordable.price;
            document.getElementById('quickItemPrice').textContent = `${finalPrice} G`;
            quickBox.onclick = () => this.buyItem(affordable.id);
        } else {
            quickBox.style.display = 'none';
        }
    }

    buyItem(itemId) {
        if (!this.player || this.player.inventory.length >= 6) return;
        const item = MLBB_ITEMS.find(i => i.id === itemId);
        const finalPrice = this.shopDiscountActive ? Math.round(item.price * 0.75) : item.price;

        if (item && this.player.gold >= finalPrice) {
            this.player.gold -= finalPrice;
            this.player.inventory.push(item);
            this.player.applyItemStats(item);
            this.sound.playBuyItem();
            this.showDamageText(this.player.x, this.player.y - 30, `+${item.name}`, false, true);
            this.renderInventorySlots();
            this.renderShopItems('ALL');
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
            this.renderShopDiscountChallenge();
            this.renderShopItems('ALL');
        }
    }

    renderShopDiscountChallenge() {
        const banner = document.getElementById('shopMathDiscountBanner');
        const qTxt = document.getElementById('shopMathQuestionText');
        const optContainer = document.getElementById('shopMathOptionsContainer');
        if (!banner || !qTxt || !optContainer) return;

        if (this.shopDiscountActive) {
            qTxt.innerHTML = '<span style="color: #22c55e; font-weight: 800;">✓ Diskon 25% Aktif untuk semua item!</span>';
            optContainer.innerHTML = '';
            return;
        }

        const a = Math.floor(Math.random() * 8) + 7;
        const b = Math.floor(Math.random() * 8) + 4;
        const ans = a * b;
        qTxt.innerHTML = `Berapa <strong>${a} × ${b}</strong>? Jawab untuk diskon 25%:`;

        const opts = [ans, ans + 3, ans - 4].sort(() => Math.random() - 0.5);
        optContainer.innerHTML = '';

        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-buy';
            btn.style.padding = '0.3rem 0.6rem';
            btn.style.fontSize = '0.78rem';
            btn.textContent = opt;
            btn.onclick = () => {
                if (opt === ans) {
                    this.shopDiscountActive = true;
                    this.sound.playBuyItem();
                    this.showDamageText(this.player.x, this.player.y - 25, '25% SHOP DISCOUNT ACTIVE!', true, true);
                    this.renderShopDiscountChallenge();
                    this.renderShopItems('ALL');
                } else {
                    btn.disabled = true;
                    btn.style.background = '#ef4444';
                }
            };
            optContainer.appendChild(btn);
        });
    }

    renderShopItems(category = 'ALL') {
        const container = document.getElementById('shopItemsGrid');
        if (!container) return;
        container.innerHTML = '';

        const items = category === 'ALL' ? MLBB_ITEMS : MLBB_ITEMS.filter(i => i.category === category);
        items.forEach(item => {
            const finalPrice = this.shopDiscountActive ? Math.round(item.price * 0.75) : item.price;
            const isOwned = this.player.inventory.some(i => i.id === item.id);
            const isFull = this.player.inventory.length >= 6;

            const card = document.createElement('div');
            card.className = 'shop-item-card';
            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <h4>${item.name}</h4>
                    <span class="price-tag">
                        ${this.shopDiscountActive ? `<s style="color:#94a3b8; font-size:0.7rem; margin-right:4px;">${item.price}</s>` : ''}
                        ${finalPrice} Gold
                    </span>
                    <p>${item.desc}</p>
                </div>
                <button class="btn-buy" ${isOwned || isFull || this.player.gold < finalPrice ? 'disabled' : ''}>
                    ${isOwned ? 'Dimiliki' : 'Beli'}
                </button>
            `;
            const btn = card.querySelector('.btn-buy');
            if (!isOwned && !isFull) {
                btn.onclick = () => this.buyItem(item.id);
            }
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

        mctx.fillStyle = '#060d17';
        mctx.fillRect(0, 0, mw, mh);

        // Draw 3 Lanes on Radar
        mctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
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

        // River Math Runes
        this.riverRunes.forEach(r => {
            if (!r.alive) return;
            const rx = (r.x / this.mapWidth) * mw;
            const ry = (r.y / this.mapHeight) * mh;
            mctx.fillStyle = '#38bdf8';
            mctx.beginPath();
            mctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
            mctx.fill();
        });

        // Jungle Bosses
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
            desc.textContent = 'Tim Anda berhasil menghancurkan Nexus Crystal musuh! Kemenangan Matematika Spektakuler!';
            this.sound.announce('Victory!');
        } else {
            title.textContent = '💀 DEFEAT';
            title.style.color = '#f43f5e';
            desc.textContent = 'Nexus Crystal Anda telah hancur. Evaluasi rumus strategi dan bangkit kembali!';
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

        // 1. Draw 3-Lane Runic Arena Map Terrain
        this.drawMapTerrain(ctx);

        // 2. Draw Bushes
        this.bushes.forEach(b => b.draw(ctx));

        // 3. Draw River Math Runes
        this.riverRunes.forEach(r => r.draw(ctx));

        // 4. Draw Jungle Camps
        this.jungleCamps.forEach(j => j.draw(ctx));

        // 5. Draw Turrets & Base Crystals
        this.turrets.forEach(t => t.draw(ctx));
        this.nexusList.forEach(n => n.draw(ctx));

        // 6. Draw Summoned Math Titan Lord
        if (this.summonedLord) this.summonedLord.draw(ctx);

        // 7. Draw Minions
        this.minions.forEach(m => m.draw(ctx));

        // 8. Draw Heroes
        this.heroes.forEach(h => h.draw(ctx, this));

        // 9. Draw Projectiles
        this.projectiles.forEach(p => p.draw(ctx));

        // 10. Draw Particles & Damage Texts
        this.particles.forEach(p => p.draw(ctx));
        this.damageTexts.forEach(t => t.draw(ctx));

        ctx.restore();
    }

    drawMapTerrain(ctx) {
        const cw = this.mapWidth;
        const ch = this.mapHeight;

        // 1. Base Terrain Dark Grid
        ctx.fillStyle = '#070d18';
        ctx.fillRect(0, 0, cw, ch);

        // 2. Geometric Hexagonal Ley-Grid Lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
        ctx.lineWidth = 1;
        const hexSize = 80;
        for (let x = 0; x < cw; x += hexSize * 1.5) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
        }
        for (let y = 0; y < ch; y += hexSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cw, y);
            ctx.stroke();
        }

        // 3. Luminescent Runic River (Diagonal Sine Flow)
        const time = this.gameTime;
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 160;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(cw * 0.3 + Math.sin(time) * 30, ch * 0.4, cw * 0.7 - Math.cos(time) * 30, ch * 0.6, cw, ch);
        ctx.stroke();

        // Inner glowing river stream
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 70;
        ctx.stroke();
        ctx.restore();

        // 4. Mathematical Ley-Line Lanes (Gold & Cyan Circuits)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
        ctx.lineWidth = 120;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Top Lane
        ctx.beginPath();
        ctx.moveTo(220, 1780);
        ctx.lineTo(300, 300);
        ctx.lineTo(2780, 220);
        ctx.stroke();

        // Mid Lane (Diagonal Vector)
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

        // Central Lane Core Circuit Lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.moveTo(220, 1780);
        ctx.lineTo(2780, 220);
        ctx.stroke();
        ctx.setLineDash([]);

        // 5. Blue & Red Base Mathematical Runes
        // Blue Base Circle (Hexagon Ring)
        ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
        ctx.beginPath();
        ctx.arc(220, 1780, 240, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Red Base Circle
        ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
        ctx.beginPath();
        ctx.arc(2780, 220, 240, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 6. Ambient Floating Mathematical Motes
        this.ambientMathMotes.forEach(mote => {
            ctx.fillStyle = mote.color;
            ctx.globalAlpha = mote.opacity;
            ctx.font = `bold ${mote.size}px monospace`;
            ctx.fillText(mote.symbol, mote.x, mote.y);
        });
        ctx.globalAlpha = 1.0;
    }
}

/* ==========================================================================
   RIVER MATH RUNE ENTITY CLASS (π, ∑, ∞, √x)
   ========================================================================== */
class MLBBRiverRune {
    constructor(x, y, runeType, name) {
        this.x = x;
        this.y = y;
        this.runeType = runeType; // 'PI', 'SIGMA', 'INFINITY', 'SQRT'
        this.name = name;
        this.radius = 26;
        this.alive = true;
        this.pulse = 0;
    }

    update(dt, game) {
        this.pulse += dt * 3;

        // Check hero collection
        game.heroes.forEach(h => {
            if (h.alive && Math.hypot(h.x - this.x, h.y - this.y) <= this.radius + h.radius) {
                this.collect(h, game);
            }
        });
    }

    collect(hero, game) {
        this.alive = false;
        game.sound.playBuyItem();
        game.createExplosion(this.x, this.y, '#38bdf8', 20);

        if (this.runeType === 'PI') {
            hero.piShieldTimer = 8.0;
            hero.shield += 600;
            game.showDamageText(hero.x, hero.y - 35, '★ RUNE π: PERISAI GEOMETRI +600 ★', true, true);
            if (hero.isHuman) game.sound.announce('Pi Shield Activated!');
        } else if (this.runeType === 'SIGMA') {
            hero.gainExpAndGold(300, 200, game);
            game.showDamageText(hero.x, hero.y - 35, '★ RUNE ∑: +200 GOLD & EXP ★', true, true);
        } else if (this.runeType === 'INFINITY') {
            hero.infinityTimer = 6.0;
            hero.mana = hero.maxMana;
            game.showDamageText(hero.x, hero.y - 35, '★ RUNE ∞: INFINITY MANA & 50% CDR ★', true, true);
            if (hero.isHuman) game.sound.announce('Infinity Power!');
        } else if (this.runeType === 'SQRT') {
            hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * 0.5);
            hero.mana = Math.min(hero.maxMana, hero.mana + hero.maxMana * 0.5);
            game.showDamageText(hero.x, hero.y - 35, '★ RUNE √x: RESTORE 50% HP & MANA ★', false, true);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        const p = Math.sin(this.pulse) * 4;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glowing Rune Platform
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + p, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Symbol
        let symbol = 'π';
        if (this.runeType === 'SIGMA') symbol = '∑';
        else if (this.runeType === 'INFINITY') symbol = '∞';
        else if (this.runeType === 'SQRT') symbol = '√x';

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 0, 0);

        ctx.restore();
    }
}

/* ==========================================================================
   MLBB Hero Entity Class (Leveling 1-15, Inventory, Skills, Math Mechanics)
   ========================================================================== */
class MLBBHeroEntity {
    constructor(heroData, team, x, y, isHuman, battleSpell, laneIndex = 1) {
        this.heroData = heroData;
        this.team = team;
        this.x = x;
        this.y = y;
        this.isHuman = isHuman;
        this.battleSpell = battleSpell;
        this.laneIndex = laneIndex; // 0: Top, 1: Mid, 2: Bot

        this.radius = 24;
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

        // Math Buffs
        this.piShieldTimer = 0;
        this.infinityTimer = 0;
        this.mathSurgeStacks = 0;
        this.mathSurgeBonusSpeed = 1.0;

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
        if (this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + 4.5 * dt);
        if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 3.0 * dt);

        // Update Math Buff Timers
        if (this.piShieldTimer > 0) {
            this.piShieldTimer -= dt;
            if (this.piShieldTimer <= 0) this.shield = 0;
        }
        if (this.infinityTimer > 0) {
            this.infinityTimer -= dt;
            this.mana = this.maxMana;
        }

        // Cooldowns (Faster if Infinity Rune is active)
        const cdMult = this.infinityTimer > 0 ? 2.0 : 1.0;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.spellCooldown > 0) this.spellCooldown -= dt * cdMult;
        for (let i = 0; i < 3; i++) {
            if (this.skillCooldowns[i] > 0) this.skillCooldowns[i] -= dt * cdMult;
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

        if (nearest && minDist < 340) {
            this.angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);

            if (minDist <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.0 / this.attackSpeed;
                    if (this.attackRange > 150) {
                        game.projectiles.push(new MLBBProjectile(this.x, this.y, nearest.x, nearest.y, this.attackDamage, this.team, this, 13, 'laser'));
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
                if (this.skillCooldowns[i] <= 0 && Math.random() < 0.05) {
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

        let dmg = this.attackDamage;
        let isMathCrit = false;

        if (this.mathSurgeStacks > 0) {
            dmg *= 2.5; // +250% True Critical Surge
            this.mathSurgeStacks--;
            isMathCrit = true;
        }

        if (this.attackRange > 150) {
            game.projectiles.push(new MLBBProjectile(this.x, this.y, game.mouse.worldX, game.mouse.worldY, dmg, this.team, this, 14, 'laser', isMathCrit));
            game.sound.playLaser();
        } else {
            game.sound.playSlash();
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= this.attackRange + e.radius) {
                    e.takeDamage(dmg, this, game, isMathCrit);
                    game.createExplosion(e.x, e.y, isMathCrit ? '#38bdf8' : '#f43f5e', 12);
                }
            });
        }
    }

    castSkill(idx, game) {
        if (this.skillCooldowns[idx] > 0) return;
        const skill = this.heroData.skills[idx];
        if (this.mana < skill.manaCost && this.infinityTimer <= 0) return;

        if (this.infinityTimer <= 0) {
            this.mana -= skill.manaCost;
        }
        this.skillCooldowns[idx] = skill.cooldown;
        this.isRecalling = false;

        // Chance to trigger Math Critical Surge during combat/skills for the player
        if (this.isHuman && Math.random() < 0.4) {
            game.triggerMathSurge();
        }

        const targetX = this.isHuman ? game.mouse.worldX : this.x + Math.cos(this.angle) * 200;
        const targetY = this.isHuman ? game.mouse.worldY : this.y + Math.sin(this.angle) * 200;
        const ang = Math.atan2(targetY - this.y, targetX - this.x);

        let dmgMult = this.mathSurgeStacks > 0 ? 2.2 : 1.0;
        if (this.mathSurgeStacks > 0) this.mathSurgeStacks--;

        if (skill.type === 'flip' || skill.type === 'airborne_lock') {
            game.sound.playSlash();
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= skill.range) {
                    e.takeDamage(this.attackDamage * 2.4 * dmgMult, this, game, dmgMult > 1);
                    e.x = this.x - Math.cos(this.angle) * 70;
                    e.y = this.y - Math.sin(this.angle) * 70;
                }
            });
        } else if (skill.type === 'dash_target' || skill.type === 'dash_straight') {
            this.x += Math.cos(ang) * skill.range;
            this.y += Math.sin(ang) * skill.range;
            game.sound.playSlash();
            game.createExplosion(this.x, this.y, '#38bdf8', 18);
        } else if (skill.type === 'fan_lightning' || skill.type === 'thunder_smite') {
            game.sound.playThunder();
            game.createExplosion(targetX, targetY, '#3b82f6', 35);
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - targetX, e.y - targetY) <= 150) {
                    e.takeDamage((skill.manaCost * 5.0 + this.magicPower) * dmgMult, this, game, dmgMult > 1);
                }
            });
        } else if (skill.type === 'global_laser' || skill.type === 'straight_bomb') {
            game.sound.playLaser();
            game.projectiles.push(new MLBBProjectile(this.x, this.y, targetX, targetY, this.attackDamage * 3.8 * dmgMult, this.team, this, 24, 'global_beam', dmgMult > 1));
        } else if (skill.type === 'heal_link' || skill.type === 'mass_heal') {
            game.sound.playHeal();
            game.getAlliesOf(this.team).forEach(a => {
                if (Math.hypot(a.x - this.x, a.y - this.y) <= skill.range) {
                    a.hp = Math.min(a.maxHp, a.hp + 500 + this.magicPower);
                    game.showDamageText(a.x, a.y - 20, `+${Math.round(500 + this.magicPower)} HP`, false, true);
                }
            });
        }
    }

    castBattleSpell(game) {
        if (this.spellCooldown > 0) return;
        this.spellCooldown = this.battleSpell.cooldown;

        if (this.battleSpell.id === 'flicker') {
            const ang = this.angle;
            this.x += Math.cos(ang) * 200;
            this.y += Math.sin(ang) * 200;
            game.createExplosion(this.x, this.y, '#fbbf24', 25);
        } else if (this.battleSpell.id === 'execute') {
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= 190) {
                    const missingHp = e.maxHp - e.hp;
                    const dmg = 250 + missingHp * 0.22;
                    e.takeDamage(dmg, this, game, true);
                    game.showDamageText(e.x, e.y - 25, `${Math.round(dmg)} TRUE DMG`, true);
                }
            });
        } else if (this.battleSpell.id === 'retribution') {
            game.jungleCamps.filter(j => j.alive && Math.hypot(j.x - this.x, j.y - this.y) <= 240).forEach(j => {
                j.takeDamage(900, this, game, true);
                game.showDamageText(j.x, j.y - 25, '900 RETRI', true);
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

    takeDamage(amount, attacker, game, isTrueDamage = false) {
        if (!this.alive) return;
        this.isRecalling = false;

        let effectiveDmg = amount;
        if (!isTrueDamage) {
            const reduction = this.armor / (this.armor + 100);
            effectiveDmg = amount * (1 - reduction);
        }

        if (this.shield > 0) {
            if (this.shield >= effectiveDmg) {
                this.shield -= effectiveDmg;
                effectiveDmg = 0;
            } else {
                effectiveDmg -= this.shield;
                this.shield = 0;
            }
        }

        this.hp -= effectiveDmg;
        game.showDamageText(this.x, this.y - 15, Math.round(effectiveDmg), isTrueDamage);

        if (this.hp <= 0) {
            this.die(attacker, game);
        }
    }

    die(killer, game) {
        this.alive = false;
        this.deaths++;
        this.killStreak = 0;
        this.respawnTimer = 6 + this.level * 2;

        if (killer && killer.team !== this.team) {
            killer.kills++;
            killer.killStreak++;
            killer.gainExpAndGold(250 + this.level * 30, 200 + this.level * 20, game);

            if (killer.team === 'BLUE') game.blueScore++;
            else game.redScore++;

            game.addKillFeed(
                killer.team === 'BLUE' ? 'blue' : 'red',
                `<span class="k">${killer.heroData.name}</span> mengeliminasi <span class="v">${this.heroData.name}</span>`
            );

            // Announcer Streek Checks
            if (!game.firstBloodClaimed) {
                game.firstBloodClaimed = true;
                game.sound.announce('First Blood!', true);
                game.showKillStreakBanner('FIRST BLOOD!');
            } else if (killer.killStreak === 2) {
                game.sound.announce('Double Kill!');
                game.showKillStreakBanner('DOUBLE KILL!');
            } else if (killer.killStreak === 3) {
                game.sound.announce('Triple Kill!');
                game.showKillStreakBanner('TRIPLE KILL!');
            } else if (killer.killStreak === 4) {
                game.sound.announce('Maniac!');
                game.showKillStreakBanner('MANIAC!');
            } else if (killer.killStreak >= 5) {
                game.sound.announce('Savage!', true);
                game.showKillStreakBanner('★ SAVAGE! ★');
            }
        }
    }

    respawn(game) {
        this.alive = true;
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        this.x = this.team === 'BLUE' ? 220 : 2780;
        this.y = this.team === 'BLUE' ? 1780 : 220;
        game.showDamageText(this.x, this.y - 30, 'RESPAWNED', true, true);
    }

    draw(ctx, game) {
        if (!this.alive) return;
        if (this.team === 'RED' && this.isInBush && !game.player.isInBush) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Recall Beam Animation
        if (this.isRecalling) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Pi Shield Geometric Aura
        if (this.piShieldTimer > 0) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Hero Base Circle (Team Colored)
        ctx.fillStyle = this.heroData.avatarBg || (this.team === 'BLUE' ? '#38bdf8' : '#f43f5e');
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.isHuman ? '#fbbf24' : (this.team === 'BLUE' ? '#0284c7' : '#be123c');
        ctx.lineWidth = this.isHuman ? 4 : 2.5;
        ctx.stroke();

        // Direction indicator pointer
        ctx.rotate(this.angle);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.radius + 6, 0);
        ctx.lineTo(this.radius - 2, -5);
        ctx.lineTo(this.radius - 2, 5);
        ctx.closePath();
        ctx.fill();
        ctx.rotate(-this.angle);

        // Hero Icon
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.heroData.icon, 0, 0);

        // HP & Mana Bars above Hero
        const barW = 48;
        const barH = 5;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barW / 2, -this.radius - 14, barW, barH);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -this.radius - 14, barW * hpRatio, barH);

        // Level & Name Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${this.heroData.name} Lv.${this.level}`, 0, -this.radius - 18);

        ctx.restore();
    }
}

/* ==========================================================================
   MINION ENTITY CLASS (3-Lanes Top/Mid/Bot)
   ========================================================================== */
class MLBBMinion {
    constructor(x, y, team, lane, index) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.lane = lane;
        this.index = index;
        this.radius = 14;
        this.maxHp = 600;
        this.hp = this.maxHp;
        this.attackDamage = 35;
        this.attackRange = index === 2 ? 140 : 50; // Siege/Caster or Melee
        this.moveSpeed = 2.4;
        this.attackCooldown = 0;
        this.alive = true;
    }

    update(dt, game) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

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

        if (nearest && minDist <= 240) {
            if (minDist <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.2;
                    nearest.takeDamage(this.attackDamage, this, game);
                    game.createExplosion(nearest.x, nearest.y, this.team === 'BLUE' ? '#38bdf8' : '#f43f5e', 4);
                }
            } else {
                const ang = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                this.x += Math.cos(ang) * this.moveSpeed * 60 * dt;
                this.y += Math.sin(ang) * this.moveSpeed * 60 * dt;
            }
        } else {
            // Lane Path Following
            const target = this.getLaneWaypoint(game);
            const ang = Math.atan2(target.y - this.y, target.x - this.x);
            this.x += Math.cos(ang) * this.moveSpeed * 60 * dt;
            this.y += Math.sin(ang) * this.moveSpeed * 60 * dt;
        }
    }

    getLaneWaypoint(game) {
        const dest = this.team === 'BLUE' ? { x: 2780, y: 220 } : { x: 220, y: 1780 };
        if (this.lane === 'TOP') {
            if (this.team === 'BLUE' && this.y > 350) return { x: 300, y: 300 };
            if (this.team === 'RED' && this.x > 350) return { x: 300, y: 300 };
        } else if (this.lane === 'BOT') {
            if (this.team === 'BLUE' && this.x < 2650) return { x: 2700, y: 1750 };
            if (this.team === 'RED' && this.y < 1650) return { x: 2700, y: 1750 };
        }
        return dest;
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            if (attacker && attacker.gainExpAndGold) {
                attacker.gainExpAndGold(65, 55, game);
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.team === 'BLUE' ? '#0284c7' : '#be123c';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // HP bar
        const barW = 24;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#000';
        ctx.fillRect(-barW / 2, -this.radius - 6, barW, 3);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -this.radius - 6, barW * hpRatio, 3);

        ctx.restore();
    }
}

/* ==========================================================================
   TURRET & BASE NEXUS ENTITY CLASSES
   ========================================================================== */
class MLBBTurret {
    constructor(x, y, team, name) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.name = name;
        this.radius = 34;
        this.maxHp = 4500;
        this.hp = this.maxHp;
        this.attackDamage = 180;
        this.attackRange = 260;
        this.attackCooldown = 0;
        this.alive = true;
    }

    update(dt, game) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        if (this.attackCooldown <= 0) {
            const enemies = game.getEnemiesOf(this.team);
            let target = null;
            let minDist = 9999;

            enemies.forEach(e => {
                const d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d <= this.attackRange && d < minDist) {
                    minDist = d;
                    target = e;
                }
            });

            if (target) {
                this.attackCooldown = 1.3;
                game.projectiles.push(new MLBBProjectile(this.x, this.y, target.x, target.y, this.attackDamage, this.team, this, 14, 'laser'));
                game.sound.playLaser();
            }
        }
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 20, Math.round(amount));

        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, this.team === 'BLUE' ? '#38bdf8' : '#f43f5e', 30);
            game.addKillFeed(
                this.team === 'BLUE' ? 'red' : 'blue',
                `💥 Turret ${this.name} (${this.team}) telah dihancurkan!`
            );
            if (attacker && attacker.gainExpAndGold) {
                attacker.gainExpAndGold(400, 250, game);
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.team === 'BLUE' ? '#0369a1' : '#9f1239';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🗼', 0, 0);

        // HP bar
        const barW = 50;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#000';
        ctx.fillRect(-barW / 2, -this.radius - 12, barW, 6);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -this.radius - 12, barW * hpRatio, 6);

        ctx.restore();
    }
}

class MLBBBaseNexus {
    constructor(x, y, team, maxHp) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.radius = 50;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.alive = true;
        this.pulse = 0;
    }

    update(dt) {
        this.pulse += dt * 2.5;
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 25, Math.round(amount), true);

        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#fbbf24', 60);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        const p = Math.sin(this.pulse) * 6;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.team === 'BLUE' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + p, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', 0, 0);

        // HP bar
        const barW = 80;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#000';
        ctx.fillRect(-barW / 2, -this.radius - 16, barW, 8);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -this.radius - 16, barW * hpRatio, 8);

        ctx.restore();
    }
}

/* ==========================================================================
   JUNGLE CAMPS & ANCIENT MATH TITAN LORD
   ========================================================================== */
class MLBBJungleMonster {
    constructor(x, y, type, name, maxHp) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.type = type; // 'BLUE_BUFF', 'RED_BUFF', 'TURTLE', 'LORD'
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.radius = type === 'LORD' ? 44 : (type === 'TURTLE' ? 36 : 26);
        this.attackDamage = type === 'LORD' ? 220 : (type === 'TURTLE' ? 140 : 80);
        this.attackRange = 85;
        this.alive = true;
        this.respawnTimer = 0;
        this.attackCooldown = 0;
    }

    update(dt, game) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.alive = true;
                this.hp = this.maxHp;
                this.x = this.startX;
                this.y = this.startY;
            }
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // Target nearest player or hero attacking it
        const nearby = game.heroes.filter(h => h.alive && Math.hypot(h.x - this.x, h.y - this.y) <= 200);
        if (nearby.length > 0) {
            const target = nearby[0];
            if (Math.hypot(target.x - this.x, target.y - this.y) <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.3;
                    target.takeDamage(this.attackDamage, this, game);
                    game.createExplosion(target.x, target.y, '#fbbf24', 6);
                }
            }
        }
    }

    takeDamage(amount, attacker, game, isTrueDamage = false) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 20, Math.round(amount), isTrueDamage);

        if (this.hp <= 0) {
            this.die(attacker, game);
        }
    }

    die(killer, game) {
        this.alive = false;
        this.respawnTimer = this.type === 'LORD' ? 90 : (this.type === 'TURTLE' ? 60 : 35);
        game.createExplosion(this.x, this.y, '#fbbf24', 35);

        if (killer) {
            killer.gainExpAndGold(350, 250, game);

            if (this.type === 'LORD') {
                game.sound.playLordRoar();
                game.sound.announce('Lord of Numeria has been slain!', true);
                game.addKillFeed('system', `👑 Tim ${killer.team} telah menundukkan ${this.name}!`);
                game.summonedLord = new MLBBMathTitan(killer.team, 220, 1780);
            } else if (this.type === 'TURTLE') {
                game.sound.announce('Turtle slain!');
                game.addKillFeed('system', `🐢 Tim ${killer.team} mengeliminasi Turtle (+Gold & Shield Tim)!`);
                game.getAlliesOf(killer.team).forEach(a => {
                    if (a.gainExpAndGold) a.gainExpAndGold(200, 150, game);
                });
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.type === 'LORD' ? '#b45309' : (this.type === 'TURTLE' ? '#047857' : '#6d28d9');
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();

        let icon = '👾';
        if (this.type === 'LORD') icon = '👑';
        else if (this.type === 'TURTLE') icon = '🐢';
        else if (this.type === 'BLUE_BUFF') icon = '🔮';
        else if (this.type === 'RED_BUFF') icon = '🔥';

        ctx.fillStyle = '#fff';
        ctx.font = `${this.radius}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, 0);

        // HP bar
        const barW = this.radius * 2;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#000';
        ctx.fillRect(-barW / 2, -this.radius - 12, barW, 5);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-barW / 2, -this.radius - 12, barW * hpRatio, 5);

        ctx.restore();
    }
}

/* ==========================================================================
   SUMMONED MATH TITAN (Lord of Numeria Marching Down Mid Lane)
   ========================================================================== */
class MLBBMathTitan {
    constructor(team, x, y) {
        this.team = team;
        this.x = team === 'BLUE' ? 300 : 2700;
        this.y = team === 'BLUE' ? 1700 : 300;
        this.radius = 42;
        this.maxHp = 12000;
        this.hp = this.maxHp;
        this.attackDamage = 320;
        this.attackRange = 160;
        this.moveSpeed = 2.1;
        this.attackCooldown = 0;
        this.alive = true;
    }

    update(dt, game) {
        if (!this.alive) return;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

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

        if (nearest && minDist <= 280) {
            if (minDist <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.5;
                    nearest.takeDamage(this.attackDamage, this, game, true);
                    game.createExplosion(nearest.x, nearest.y, '#fbbf24', 25);
                    game.sound.playThunder();
                }
            } else {
                const ang = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                this.x += Math.cos(ang) * this.moveSpeed * 60 * dt;
                this.y += Math.sin(ang) * this.moveSpeed * 60 * dt;
            }
        } else {
            // March down Mid Lane
            const dest = this.team === 'BLUE' ? { x: 2780, y: 220 } : { x: 220, y: 1780 };
            const ang = Math.atan2(dest.y - this.y, dest.x - this.x);
            this.x += Math.cos(ang) * this.moveSpeed * 60 * dt;
            this.y += Math.sin(ang) * this.moveSpeed * 60 * dt;
        }
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 25, Math.round(amount));

        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#fbbf24', 50);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.team === 'BLUE' ? '#0284c7' : '#be123c';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', 0, 0);

        // HP bar
        const barW = 75;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = '#000';
        ctx.fillRect(-barW / 2, -this.radius - 14, barW, 7);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -this.radius - 14, barW * hpRatio, 7);

        ctx.restore();
    }
}

/* ==========================================================================
   BUSH, PROJECTILES, PARTICLES & FLOATING TEXTS
   ========================================================================== */
class MLBBBush {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(6, 78, 59, 0.8)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 16);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class MLBBProjectile {
    constructor(x, y, tx, ty, damage, team, owner, speed = 14, type = 'laser', isMathCrit = false) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.team = team;
        this.owner = owner;
        this.speed = speed;
        this.type = type;
        this.isMathCrit = isMathCrit;
        this.angle = Math.atan2(ty - y, tx - x);
        this.radius = type === 'global_beam' ? 24 : 8;
        this.alive = true;
        this.life = type === 'global_beam' ? 1.5 : 1.0;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;

        this.x += Math.cos(this.angle) * this.speed * 60 * dt;
        this.y += Math.sin(this.angle) * this.speed * 60 * dt;

        // Collision detection with enemies
        game.getEnemiesOf(this.team).forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius + e.radius) {
                e.takeDamage(this.damage, this.owner, game, this.isMathCrit);
                game.createExplosion(this.x, this.y, this.isMathCrit ? '#38bdf8' : '#fbbf24', 8);
                if (this.type !== 'global_beam') {
                    this.alive = false;
                }
            }
        });
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.isMathCrit ? '#38bdf8' : (this.team === 'BLUE' ? '#06b6d4' : '#f43f5e');
        if (this.type === 'global_beam') {
            ctx.fillRect(-40, -12, 80, 24);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class MLBBParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 0.5 + Math.random() * 0.3;
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

class MLBBFloatingText {
    constructor(x, y, text, isCrit = false, isHeal = false) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y;
        this.text = text;
        this.isCrit = isCrit;
        this.isHeal = isHeal;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
        this.y -= 35 * dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.font = this.isCrit ? 'bold 18px sans-serif' : 'bold 14px sans-serif';
        ctx.fillStyle = this.isHeal ? '#22c55e' : (this.isCrit ? '#fbbf24' : '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.mlbbGame = new MLBBGameEngine();
});
