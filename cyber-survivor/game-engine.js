/**
 * CYBER SURVIVOR: PROTOCOL ZERO
 * 60 FPS HTML5 Canvas Action Roguelite Bullet-Hell Engine
 */

class CyberSurvivorEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new CyberSoundEngine();

        // World & Camera
        this.worldWidth = 6000;
        this.worldHeight = 6000;
        this.camera = { x: 0, y: 0, width: 1280, height: 720 };
        this.screenShake = 0;

        // Game State
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'LEVELUP', 'GAMEOVER', 'VICTORY'
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.gems = [];
        this.particles = [];
        this.damageTexts = [];
        this.vortices = [];

        // Progression & Timers
        this.survivalTime = 0;
        this.killCount = 0;
        this.totalGoldEarned = 0;
        this.spawnTimer = 0;
        this.bossActive = null;
        this.bossSpawnedMinutes = new Set();

        // Meta Upgrades (Stored in LocalStorage)
        this.metaUpgrades = this.loadMetaUpgrades();

        // Inputs
        this.keys = {};
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };

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

    loadMetaUpgrades() {
        try {
            const saved = localStorage.getItem('cyber_meta_upgrades');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            gold: 0,
            attackBonus: 0,   // level 0-5
            healthBonus: 0,   // level 0-5
            speedBonus: 0,    // level 0-5
            cdrBonus: 0,      // level 0-5
            magnetBonus: 0    // level 0-5
        };
    }

    saveMetaUpgrades() {
        try {
            localStorage.setItem('cyber_meta_upgrades', JSON.stringify(this.metaUpgrades));
        } catch (e) {}
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keys[e.key.toUpperCase()] = true;

            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.state === 'PLAYING') this.togglePause();
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

        this.canvas.addEventListener('mousedown', () => {
            this.sound.init();
            this.mouse.isDown = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });
    }

    /* ==========================================================================
       Match Start & Character Setup
       ========================================================================== */
    startMatch(heroId) {
        this.sound.init();
        this.sound.startBGM();

        const heroCfg = CYBER_HEROES.find(h => h.id === heroId) || CYBER_HEROES[0];
        this.player = new CyberPlayerEntity(heroCfg, this.worldWidth / 2, this.worldHeight / 2, this);

        // Reset state
        this.state = 'PLAYING';
        this.survivalTime = 0;
        this.killCount = 0;
        this.totalGoldEarned = 0;
        this.spawnTimer = 0;
        this.bossActive = null;
        this.bossSpawnedMinutes.clear();

        this.enemies = [];
        this.projectiles = [];
        this.gems = [];
        this.particles = [];
        this.damageTexts = [];
        this.vortices = [];

        // Hide menus, show HUD
        document.getElementById('screenTitle').style.display = 'none';
        document.getElementById('battleHUD').style.display = 'block';

        this.updateHUDLoadout();
    }

    /* ==========================================================================
       Main 60 FPS Game Loop
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
        this.survivalTime += dt;

        // Screen Shake decay
        if (this.screenShake > 0) this.screenShake -= dt * 15;

        // 1. Update Player
        if (this.player && this.player.alive) {
            this.player.update(dt, this);
        }

        // 2. Spawn Enemies Wave
        this.spawnTimer += dt;
        const spawnInterval = Math.max(0.25, 1.2 - (this.survivalTime / 300));
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemySwarm();
        }

        // 3. Check Boss Spawns (Minute 2, Minute 4, Minute 6)
        this.checkBossSpawns();

        // 4. Update Enemies
        this.enemies.forEach(e => e.update(dt, this));
        this.enemies = this.enemies.filter(e => e.alive);

        // 5. Update Projectiles
        this.projectiles.forEach(p => p.update(dt, this));
        this.projectiles = this.projectiles.filter(p => p.alive);

        // 6. Update Vortices
        this.vortices.forEach(v => v.update(dt, this));
        this.vortices = this.vortices.filter(v => v.alive);

        // 7. Update Gems & Pickups
        this.gems.forEach(g => g.update(dt, this));
        this.gems = this.gems.filter(g => g.alive);

        // 8. Update Particles & Texts
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.alive);

        this.damageTexts.forEach(t => t.update(dt));
        this.damageTexts = this.damageTexts.filter(t => t.alive);

        // 9. Camera Viewport Smoothing
        if (this.player) {
            const tx = this.player.x - this.camera.width / 2;
            const ty = this.player.y - this.camera.height / 2;
            this.camera.x += (tx - this.camera.x) * 0.12;
            this.camera.y += (ty - this.camera.y) * 0.12;
        }

        // 10. Update Battle HUD
        this.updateHUD();
    }

    spawnEnemySwarm() {
        const count = 1 + Math.floor(this.survivalTime / 45);
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const dist = 650 + Math.random() * 150;
            const x = this.player.x + Math.cos(ang) * dist;
            const y = this.player.y + Math.sin(ang) * dist;

            // Pick enemy type based on time
            let type = 'stalker';
            const r = Math.random();
            if (this.survivalTime > 60 && r < 0.3) type = 'mech';
            else if (this.survivalTime > 120 && r < 0.25) type = 'laser_drone';
            else if (this.survivalTime > 180 && r < 0.2) type = 'kamikaze';

            this.enemies.push(new CyberEnemyEntity(x, y, type, this.survivalTime));
        }
    }

    checkBossSpawns() {
        const min = Math.floor(this.survivalTime / 60);

        if (min === 2 && !this.bossSpawnedMinutes.has(2)) {
            this.bossSpawnedMinutes.add(2);
            this.spawnBoss('ARACHNID_DREADNOUGHT', 'Cyber Arachnid Dreadnought', 4500);
        } else if (min === 4 && !this.bossSpawnedMinutes.has(4)) {
            this.bossSpawnedMinutes.add(4);
            this.spawnBoss('TITAN_GOLIATH', 'Titan Goliath Mech', 9500);
        } else if (min === 6 && !this.bossSpawnedMinutes.has(6)) {
            this.bossSpawnedMinutes.add(6);
            this.spawnBoss('PROTOCOL_ZERO', 'PROTOCOL ZERO AI OVERLORD', 18000);
        }
    }

    spawnBoss(type, name, hp) {
        const ang = Math.random() * Math.PI * 2;
        const x = this.player.x + Math.cos(ang) * 500;
        const y = this.player.y + Math.sin(ang) * 500;

        const boss = new CyberEnemyEntity(x, y, type, this.survivalTime, true, hp, name);
        this.enemies.push(boss);
        this.bossActive = boss;

        this.sound.playBossSiren();
        const banner = document.getElementById('bossAlertBanner');
        document.getElementById('bossAlertName').textContent = `⚠️ BOSS DETECTED: ${name}!`;
        banner.style.display = 'flex';
        setTimeout(() => banner.style.display = 'none', 3000);
    }

    /* ==========================================================================
       Level Up & Upgrade Selection
       ========================================================================== */
    triggerLevelUp() {
        this.state = 'LEVELUP';
        this.sound.playLevelUp();

        const modal = document.getElementById('levelUpModal');
        const container = document.getElementById('levelUpCardsRow');
        container.innerHTML = '';

        // Generate 3 available weapon or passive upgrades
        const availableChoices = [];

        // Check Weapons
        CYBER_WEAPONS.forEach(w => {
            const owned = this.player.weapons.find(ow => ow.id === w.id);
            if (!owned) {
                if (this.player.weapons.length < 6) {
                    availableChoices.push({ type: 'WEAPON_NEW', item: w, nextLvl: 1 });
                }
            } else if (owned.level < owned.maxLevel) {
                availableChoices.push({ type: 'WEAPON_UPGRADE', item: owned, nextLvl: owned.level + 1 });
            } else if (owned.level === owned.maxLevel && !owned.isEvolved) {
                // Check synergy passive
                const hasSynergy = this.player.passives.some(p => p.id === owned.evolutionPair);
                if (hasSynergy) {
                    availableChoices.push({ type: 'WEAPON_EVOLUTION', item: owned, nextLvl: 'EVO' });
                }
            }
        });

        // Check Passives
        CYBER_PASSIVES.forEach(p => {
            const owned = this.player.passives.find(op => op.id === p.id);
            if (!owned) {
                if (this.player.passives.length < 6) {
                    availableChoices.push({ type: 'PASSIVE_NEW', item: p, nextLvl: 1 });
                }
            } else if (owned.level < owned.maxLevel) {
                availableChoices.push({ type: 'PASSIVE_UPGRADE', item: owned, nextLvl: owned.level + 1 });
            }
        });

        // Pick 3 random
        const chosen = [];
        const pool = [...availableChoices];
        while (chosen.length < 3 && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            chosen.push(pool.splice(idx, 1)[0]);
        }

        // Render Cards
        chosen.forEach(choice => {
            const card = document.createElement('div');
            card.className = 'levelup-card';

            let typeBadge = 'NEW WEAPON';
            let name = choice.item.name;
            let desc = choice.item.desc;

            if (choice.type === 'WEAPON_UPGRADE') {
                typeBadge = `WEAPON LV.${choice.nextLvl}`;
                desc = choice.item.upgrades[choice.nextLvl - 1].desc;
            } else if (choice.type === 'WEAPON_EVOLUTION') {
                typeBadge = '★ SUPER EVOLUTION ★';
                name = choice.item.evolutionName;
                desc = choice.item.evolutionDesc;
            } else if (choice.type === 'PASSIVE_NEW') {
                typeBadge = 'NEW CYBERWARE';
            } else if (choice.type === 'PASSIVE_UPGRADE') {
                typeBadge = `CYBERWARE LV.${choice.nextLvl}`;
            }

            card.innerHTML = `
                <div class="levelup-icon-circle">${choice.item.icon}</div>
                <span class="levelup-type-tag">${typeBadge}</span>
                <h3 class="levelup-name">${name}</h3>
                <p class="levelup-desc">${desc}</p>
            `;

            card.onclick = () => {
                this.applyUpgrade(choice);
                modal.style.display = 'none';
                this.state = 'PLAYING';
            };

            container.appendChild(card);
        });

        modal.style.display = 'flex';
    }

    applyUpgrade(choice) {
        if (choice.type === 'WEAPON_NEW') {
            const newW = JSON.parse(JSON.stringify(choice.item));
            newW.timer = 0;
            newW.level = 1;
            this.player.weapons.push(newW);
        } else if (choice.type === 'WEAPON_UPGRADE') {
            choice.item.level++;
            const up = choice.item.upgrades[choice.item.level - 1];
            if (up.damage) choice.item.baseDamage += up.damage;
            if (up.cooldown) choice.item.cooldown = Math.max(0.1, choice.item.cooldown + up.cooldown);
            if (up.range) choice.item.range += up.range;
            if (up.count) choice.item.count = (choice.item.count || 1) + up.count;
            if (up.radius) choice.item.radius = (choice.item.radius || 80) + up.radius;
        } else if (choice.type === 'WEAPON_EVOLUTION') {
            choice.item.isEvolved = true;
            choice.item.name = choice.item.evolutionName;
            choice.item.baseDamage *= 2.2;
            choice.item.cooldown *= 0.7;
            this.createExplosion(this.player.x, this.player.y, '#00f0ff', 40);
        } else if (choice.type === 'PASSIVE_NEW') {
            const newP = JSON.parse(JSON.stringify(choice.item));
            newP.level = 1;
            this.player.passives.push(newP);
            this.player.applyPassiveStat(newP);
        } else if (choice.type === 'PASSIVE_UPGRADE') {
            choice.item.level++;
            this.player.applyPassiveStat(choice.item);
        }

        this.updateHUDLoadout();
    }

    updateHUDLoadout() {
        const row = document.getElementById('hudWeaponsRow');
        if (!row || !this.player) return;
        row.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const w = this.player.weapons[i];
            const slot = document.createElement('div');
            slot.className = 'loadout-slot-box';
            if (w) {
                slot.innerHTML = `${w.icon} <span class="slot-level-badge">${w.isEvolved ? 'EVO' : `L${w.level}`}</span>`;
                slot.title = `${w.name} (Lv.${w.level})`;
            }
            row.appendChild(slot);
        }

        const pRow = document.getElementById('hudPassivesRow');
        if (pRow) {
            pRow.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                const p = this.player.passives[i];
                const slot = document.createElement('div');
                slot.className = 'loadout-slot-box';
                if (p) {
                    slot.innerHTML = `${p.icon} <span class="slot-level-badge">L${p.level}</span>`;
                    slot.title = `${p.name} (Lv.${p.level})`;
                }
                pRow.appendChild(slot);
            }
        }
    }

    updateHUD() {
        if (!this.player) return;

        // Player HP
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        document.getElementById('hudPlayerHpBar').style.width = `${hpPct}%`;
        document.getElementById('hudPlayerHpText').textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;

        // EXP Bar
        const expPct = Math.max(0, (this.player.exp / this.player.expToNext) * 100);
        document.getElementById('hudExpBar').style.width = `${expPct}%`;
        document.getElementById('hudPlayerLevelText').textContent = `Lv.${this.player.level}`;

        // Timer
        const m = Math.floor(this.survivalTime / 60);
        const s = Math.floor(this.survivalTime % 60);
        document.getElementById('hudTimerClock').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        // Kill Count & Gold
        document.getElementById('hudKillCount').textContent = this.killCount;
        document.getElementById('hudGoldCount').textContent = this.totalGoldEarned;

        // Boss Bar
        const bossBar = document.getElementById('bossHpContainer');
        if (this.bossActive && this.bossActive.alive) {
            bossBar.style.display = 'flex';
            document.getElementById('bossNameLabel').textContent = this.bossActive.name;
            const bPct = Math.max(0, (this.bossActive.hp / this.bossActive.maxHp) * 100);
            document.getElementById('bossHpFill').style.width = `${bPct}%`;
        } else {
            bossBar.style.display = 'none';
        }
    }

    createExplosion(x, y, color = '#ff007f', count = 12) {
        this.screenShake = 0.25;
        this.sound.playExplosion();
        for (let i = 0; i < count; i++) {
            this.particles.push(new CyberParticle(x, y, color));
        }
    }

    showDamageText(x, y, text, isCrit = false) {
        this.damageTexts.push(new CyberFloatingText(x, y, text, isCrit));
    }

    endGame(isVictory = false) {
        this.state = 'GAMEOVER';
        this.sound.stopBGM();

        this.metaUpgrades.gold += this.totalGoldEarned;
        this.saveMetaUpgrades();

        const modal = document.getElementById('gameOverModal');
        document.getElementById('gameOverTitle').textContent = isVictory ? '🏆 PROTOCOL CLEARED!' : '💀 PROTOCOL TERMINATED';
        document.getElementById('gameOverTitle').style.color = isVictory ? '#00f0ff' : '#ff007f';
        document.getElementById('gameOverStats').innerHTML = `
            <p>Waktu Bertahan: <strong>${Math.floor(this.survivalTime / 60)}m ${Math.floor(this.survivalTime % 60)}s</strong></p>
            <p>Musuh Tereliminasi: <strong>${this.killCount}</strong></p>
            <p>Level Akhir: <strong>${this.player.level}</strong></p>
            <p>Gold Diperoleh: <strong style="color:#ffe600;">+${this.totalGoldEarned} G</strong></p>
        `;

        modal.style.display = 'flex';
    }

    /* ==========================================================================
       Canvas Renderer
       ========================================================================== */
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        // Screen Shake offset
        const shakeX = (Math.random() - 0.5) * this.screenShake * 20;
        const shakeY = (Math.random() - 0.5) * this.screenShake * 20;
        ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);

        // 1. Draw Infinite Cyberpunk Grid Floor
        this.drawCyberGrid(ctx);

        // 2. Draw Vortices
        this.vortices.forEach(v => v.draw(ctx));

        // 3. Draw Gems
        this.gems.forEach(g => g.draw(ctx));

        // 4. Draw Enemies
        this.enemies.forEach(e => e.draw(ctx));

        // 5. Draw Player
        if (this.player) this.player.draw(ctx);

        // 6. Draw Projectiles
        this.projectiles.forEach(p => p.draw(ctx));

        // 7. Draw Particles & Damage Texts
        this.particles.forEach(p => p.draw(ctx));
        this.damageTexts.forEach(t => t.draw(ctx));

        ctx.restore();
    }

    drawCyberGrid(ctx) {
        const gridSize = 120;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const endX = startX + this.camera.width + gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endY = startY + this.camera.height + gridSize;

        ctx.fillStyle = '#050811';
        ctx.fillRect(this.camera.x, this.camera.y, this.camera.width, this.camera.height);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;

        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }
}

/* ==========================================================================
   PLAYER ENTITY CLASS
   ========================================================================== */
class CyberPlayerEntity {
    constructor(heroCfg, x, y, game) {
        this.heroCfg = heroCfg;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.alive = true;

        // Base & Meta stats
        const meta = game.metaUpgrades;
        this.maxHp = heroCfg.hp + (meta.healthBonus * 25);
        this.hp = this.maxHp;
        this.moveSpeed = heroCfg.speed * (1 + meta.speedBonus * 0.06);
        this.armor = heroCfg.armor;
        this.critChance = heroCfg.critChance;
        this.damageMult = 1.0 + (meta.attackBonus * 0.1);
        this.cdr = meta.cdrBonus * 0.08;
        this.magnetRange = 120 + (meta.magnetBonus * 40);

        this.level = 1;
        this.exp = 0;
        this.expToNext = 12;

        this.weapons = [];
        this.passives = [];

        // Add Starting Weapon
        const startW = CYBER_WEAPONS.find(w => w.id === heroCfg.startingWeapon) || CYBER_WEAPONS[0];
        const initialW = JSON.parse(JSON.stringify(startW));
        initialW.timer = 0;
        initialW.level = 1;
        this.weapons.push(initialW);

        this.facingAngle = 0;
    }

    applyPassiveStat(passive) {
        if (passive.stat === 'damageMultiplier') this.damageMult += passive.valPerLevel;
        if (passive.stat === 'cooldownReduction') this.cdr = Math.min(0.6, this.cdr + passive.valPerLevel);
        if (passive.stat === 'maxHp') {
            this.maxHp += passive.valPerLevel;
            this.hp += passive.valPerLevel;
        }
        if (passive.stat === 'magnetRange') this.magnetRange += passive.valPerLevel;
        if (passive.stat === 'moveSpeed') this.moveSpeed += passive.valPerLevel;
        if (passive.stat === 'armor') this.armor += passive.valPerLevel;
    }

    update(dt, game) {
        if (!this.alive) return;

        // Player Controls
        let mx = 0;
        let my = 0;
        if (game.keys['KeyW'] || game.keys['ArrowUp']) my -= 1;
        if (game.keys['KeyS'] || game.keys['ArrowDown']) my += 1;
        if (game.keys['KeyA'] || game.keys['ArrowLeft']) mx -= 1;
        if (game.keys['KeyD'] || game.keys['ArrowRight']) mx += 1;

        const len = Math.hypot(mx, my);
        if (len > 0) {
            mx /= len;
            my /= len;
            this.x += mx * this.moveSpeed * 60 * dt;
            this.y += my * this.moveSpeed * 60 * dt;
            this.facingAngle = Math.atan2(my, mx);
        }

        // Keep inside world bounds
        this.x = Math.max(50, Math.min(game.worldWidth - 50, this.x));
        this.y = Math.max(50, Math.min(game.worldHeight - 50, this.y));

        // Weapons Update & Auto-Fire
        this.weapons.forEach(w => {
            w.timer -= dt;
            const effectiveCD = w.cooldown * (1 - this.cdr);
            if (w.timer <= 0) {
                w.timer = effectiveCD;
                this.fireWeapon(w, game);
            }
        });
    }

    fireWeapon(w, game) {
        const dmg = w.baseDamage * this.damageMult;
        const nearest = this.getNearestEnemy(game);

        if (w.id === 'katana') {
            game.sound.playSlash();
            const ang = nearest ? Math.atan2(nearest.y - this.y, nearest.x - this.x) : this.facingAngle;
            game.projectiles.push(new CyberMeleeSlash(this.x, this.y, ang, w.range, dmg, w.isEvolved));
        } else if (w.id === 'gatling') {
            game.sound.playLaser();
            const ang = nearest ? Math.atan2(nearest.y - this.y, nearest.x - this.x) : this.facingAngle;
            game.projectiles.push(new CyberBullet(this.x, this.y, ang, dmg, w.speed, w.isEvolved));
        } else if (w.id === 'missiles') {
            game.sound.playRocket();
            const count = w.count || 2;
            for (let i = 0; i < count; i++) {
                const spread = (i - (count - 1) / 2) * 0.35;
                const ang = (nearest ? Math.atan2(nearest.y - this.y, nearest.x - this.x) : this.facingAngle) + spread;
                game.projectiles.push(new CyberMissile(this.x, this.y, ang, dmg, w.isEvolved));
            }
        } else if (w.id === 'drone') {
            const count = w.isEvolved ? 4 : (w.count || 1);
            for (let i = 0; i < count; i++) {
                const angOffset = (i * Math.PI * 2) / count;
                const orbRadius = w.range || 150;
                const dx = this.x + Math.cos(game.survivalTime * 3 + angOffset) * orbRadius;
                const dy = this.y + Math.sin(game.survivalTime * 3 + angOffset) * orbRadius;
                // Shock nearby enemy
                game.enemies.forEach(e => {
                    if (Math.hypot(e.x - dx, e.y - dy) <= 80) {
                        e.takeDamage(dmg * 0.4, game);
                        game.createExplosion(e.x, e.y, '#00f0ff', 4);
                    }
                });
            }
        } else if (w.id === 'singularity') {
            const tx = nearest ? nearest.x : this.x + Math.cos(this.facingAngle) * 180;
            const ty = nearest ? nearest.y : this.y + Math.sin(this.facingAngle) * 180;
            game.vortices.push(new CyberVortex(tx, ty, w.radius, dmg, w.isEvolved));
        } else if (w.id === 'tesla') {
            const rad = w.radius || 100;
            game.enemies.forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) <= rad) {
                    e.takeDamage(dmg, game);
                    game.createExplosion(e.x, e.y, '#ffe600', 3);
                }
            });
        }
    }

    getNearestEnemy(game) {
        let nearest = null;
        let minDist = 9999;
        game.enemies.forEach(e => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        });
        return nearest;
    }

    gainExp(amount, game) {
        this.exp += amount;
        if (this.exp >= this.expToNext) {
            this.level++;
            this.exp -= this.expToNext;
            this.expToNext = Math.round(this.expToNext * 1.45);
            game.triggerLevelUp();
        }
    }

    takeDamage(amount, game) {
        if (!this.alive) return;
        const reduction = this.armor / (this.armor + 100);
        const actualDmg = amount * (1 - reduction);

        this.hp -= actualDmg;
        game.screenShake = 0.2;
        game.showDamageText(this.x, this.y - 20, Math.round(actualDmg));

        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#ff007f', 40);
            game.endGame(false);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Character Base Circle
        ctx.fillStyle = this.heroCfg.avatarBg;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.heroCfg.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.heroCfg.icon, 0, 0);

        // Magnet Aura Circle
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.magnetRange, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

/* ==========================================================================
   ENEMY ENTITY CLASS & BOSS LOGIC
   ========================================================================== */
class CyberEnemyEntity {
    constructor(x, y, type, time, isBoss = false, maxHp = 0, name = '') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isBoss = isBoss;
        this.name = name;
        this.alive = true;

        const timeMult = 1 + (time / 180);

        if (isBoss) {
            this.radius = 48;
            this.maxHp = maxHp;
            this.hp = maxHp;
            this.moveSpeed = 1.8;
            this.attackDamage = 35;
            this.attackCooldown = 0;
            this.expVal = 500;
            this.goldVal = 150;
        } else if (type === 'mech') {
            this.radius = 28;
            this.maxHp = 180 * timeMult;
            this.hp = this.maxHp;
            this.moveSpeed = 1.6;
            this.attackDamage = 20;
            this.expVal = 8;
            this.goldVal = 3;
        } else if (type === 'laser_drone') {
            this.radius = 18;
            this.maxHp = 70 * timeMult;
            this.hp = this.maxHp;
            this.moveSpeed = 2.6;
            this.attackDamage = 12;
            this.expVal = 6;
            this.goldVal = 2;
            this.shootTimer = 2.0;
        } else if (type === 'kamikaze') {
            this.radius = 16;
            this.maxHp = 45 * timeMult;
            this.hp = this.maxHp;
            this.moveSpeed = 4.0;
            this.attackDamage = 35;
            this.expVal = 10;
            this.goldVal = 4;
        } else {
            // Stalker
            this.radius = 15;
            this.maxHp = 40 * timeMult;
            this.hp = this.maxHp;
            this.moveSpeed = 2.4 + Math.random() * 0.5;
            this.attackDamage = 10;
            this.expVal = 3;
            this.goldVal = 1;
        }
    }

    update(dt, game) {
        if (!this.alive) return;

        const p = game.player;
        if (!p || !p.alive) return;

        const dx = p.x - this.x;
        const dy = p.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.moveSpeed * 60 * dt;
            this.y += (dy / dist) * this.moveSpeed * 60 * dt;
        }

        // Attack Player on touch
        if (dist <= this.radius + p.radius) {
            p.takeDamage(this.attackDamage, game);
            if (this.type === 'kamikaze') {
                this.alive = false;
                game.createExplosion(this.x, this.y, '#f59e0b', 20);
            }
        }

        // Boss Special Bullet Hell Attack
        if (this.isBoss) {
            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) {
                this.attackCooldown = 2.5;
                // Fire ring of 8 bullets
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2) / 8;
                    game.projectiles.push(new CyberEnemyBullet(this.x, this.y, ang, 15));
                }
            }
        }
    }

    takeDamage(amount, game) {
        if (!this.alive) return;
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 15, Math.round(amount));

        if (this.hp <= 0) {
            this.alive = false;
            game.killCount++;
            game.totalGoldEarned += this.goldVal;
            game.createExplosion(this.x, this.y, this.isBoss ? '#ff007f' : '#00f0ff', this.isBoss ? 50 : 8);

            // Drop Gem
            game.gems.push(new CyberGem(this.x, this.y, this.expVal));

            if (this.isBoss) {
                game.bossActive = null;
                if (this.type === 'PROTOCOL_ZERO') {
                    game.endGame(true);
                }
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = this.isBoss ? '#f43f5e' : (this.type === 'mech' ? '#b45309' : '#6d28d9');
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.isBoss ? '#ffe600' : '#ff007f';
        ctx.lineWidth = this.isBoss ? 4 : 2;
        ctx.stroke();

        let icon = '👾';
        if (this.isBoss) icon = '👑';
        else if (this.type === 'mech') icon = '🛡️';
        else if (this.type === 'laser_drone') icon = '🛸';
        else if (this.type === 'kamikaze') icon = '💣';

        ctx.font = `${this.radius}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, 0);

        ctx.restore();
    }
}

/* ==========================================================================
   PROJECTILE, VORTEX, GEM, AND PARTICLE CLASSES
   ========================================================================== */
class CyberMeleeSlash {
    constructor(x, y, ang, range, dmg, isEvolved) {
        this.x = x;
        this.y = y;
        this.ang = ang;
        this.range = range;
        this.dmg = dmg;
        this.isEvolved = isEvolved;
        this.life = 0.18;
        this.alive = true;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;

        const arcAngle = this.isEvolved ? Math.PI * 2 : Math.PI * 0.75;
        game.enemies.forEach(e => {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.range + e.radius) {
                const diffAng = Math.abs(Math.atan2(e.y - this.y, e.x - this.x) - this.ang);
                if (this.isEvolved || diffAng < arcAngle / 2) {
                    e.takeDamage(this.dmg, game);
                    game.createExplosion(e.x, e.y, '#ff007f', 4);
                }
            }
        });
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);

        ctx.fillStyle = this.isEvolved ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 127, 0.4)';
        ctx.strokeStyle = this.isEvolved ? '#00f0ff' : '#ff007f';
        ctx.lineWidth = 4;

        ctx.beginPath();
        if (this.isEvolved) {
            ctx.arc(0, 0, this.range, 0, Math.PI * 2);
        } else {
            ctx.arc(0, 0, this.range, -Math.PI * 0.35, Math.PI * 0.35);
        }
        ctx.stroke();
        ctx.restore();
    }
}

class CyberBullet {
    constructor(x, y, ang, dmg, speed, isEvolved) {
        this.x = x;
        this.y = y;
        this.ang = ang;
        this.dmg = dmg;
        this.speed = speed;
        this.isEvolved = isEvolved;
        this.radius = isEvolved ? 14 : 7;
        this.life = 1.2;
        this.alive = true;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;

        this.x += Math.cos(this.ang) * this.speed * 60 * dt;
        this.y += Math.sin(this.ang) * this.speed * 60 * dt;

        game.enemies.forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= this.radius + e.radius) {
                e.takeDamage(this.dmg, game);
                game.createExplosion(this.x, this.y, '#00f0ff', 4);
                if (!this.isEvolved) this.alive = false;
            }
        });
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.fillStyle = this.isEvolved ? '#00f0ff' : '#ffe600';
        ctx.fillRect(-12, -4, 24, 8);
        ctx.restore();
    }
}

class CyberMissile {
    constructor(x, y, ang, dmg, isEvolved) {
        this.x = x;
        this.y = y;
        this.ang = ang;
        this.dmg = dmg;
        this.speed = 10;
        this.isEvolved = isEvolved;
        this.life = 2.5;
        this.alive = true;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;

        // Home in on nearest enemy
        const nearest = game.player ? game.player.getNearestEnemy(game) : null;
        if (nearest) {
            const targetAng = Math.atan2(nearest.y - this.y, nearest.x - this.x);
            this.ang += (targetAng - this.ang) * 0.12;
        }

        this.x += Math.cos(this.ang) * this.speed * 60 * dt;
        this.y += Math.sin(this.ang) * this.speed * 60 * dt;

        game.enemies.forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) <= 18 + e.radius) {
                this.alive = false;
                const blastRadius = this.isEvolved ? 150 : 80;
                game.createExplosion(this.x, this.y, '#f43f5e', 25);
                game.enemies.forEach(ne => {
                    if (Math.hypot(ne.x - this.x, ne.y - this.y) <= blastRadius) {
                        ne.takeDamage(this.dmg, game);
                    }
                });
            }
        });
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-10, -5, 20, 10);
        ctx.restore();
    }
}

class CyberEnemyBullet {
    constructor(x, y, ang, dmg) {
        this.x = x;
        this.y = y;
        this.ang = ang;
        this.dmg = dmg;
        this.speed = 4.5;
        this.radius = 8;
        this.life = 3.5;
        this.alive = true;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;

        this.x += Math.cos(this.ang) * this.speed * 60 * dt;
        this.y += Math.sin(this.ang) * this.speed * 60 * dt;

        const p = game.player;
        if (p && p.alive && Math.hypot(p.x - this.x, p.y - this.y) <= this.radius + p.radius) {
            p.takeDamage(this.dmg, game);
            this.alive = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class CyberVortex {
    constructor(x, y, rad, dmg, isEvolved) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.dmg = dmg;
        this.isEvolved = isEvolved;
        this.life = isEvolved ? 4.5 : 2.5;
        this.alive = true;
        this.tickTimer = 0;
    }

    update(dt, game) {
        this.life -= dt;
        this.tickTimer += dt;
        if (this.life <= 0) this.alive = false;

        // Pull enemies in
        game.enemies.forEach(e => {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist <= this.rad * 1.5) {
                const ang = Math.atan2(this.y - e.y, this.x - e.x);
                e.x += Math.cos(ang) * 1.8;
                e.y += Math.sin(ang) * 1.8;

                if (this.tickTimer >= 0.25) {
                    e.takeDamage(this.dmg * 0.35, game);
                }
            }
        });

        if (this.tickTimer >= 0.25) this.tickTimer = 0;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.life * 4);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, this.rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }
}

class CyberGem {
    constructor(x, y, val) {
        this.x = x;
        this.y = y;
        this.val = val;
        this.radius = val >= 10 ? 9 : 6;
        this.alive = true;
    }

    update(dt, game) {
        const p = game.player;
        if (!p || !p.alive) return;

        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist <= p.magnetRange) {
            const ang = Math.atan2(p.y - this.y, p.x - this.x);
            const spd = Math.max(5, (p.magnetRange - dist) * 0.15);
            this.x += Math.cos(ang) * spd;
            this.y += Math.sin(ang) * spd;

            if (dist <= p.radius + this.radius) {
                this.alive = false;
                p.gainExp(this.val, game);
                game.sound.playGemPickup();
            }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.val >= 10 ? '#a855f7' : '#00f0ff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class CyberParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 0.4 + Math.random() * 0.2;
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

class CyberFloatingText {
    constructor(x, y, text, isCrit = false) {
        this.x = x + (Math.random() - 0.5) * 15;
        this.y = y;
        this.text = text;
        this.isCrit = isCrit;
        this.life = 0.8;
        this.maxLife = 0.8;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
        this.y -= 30 * dt;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.font = this.isCrit ? 'bold 18px monospace' : 'bold 13px monospace';
        ctx.fillStyle = this.isCrit ? '#ffe600' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.cyberEngine = new CyberSurvivorEngine();
});
