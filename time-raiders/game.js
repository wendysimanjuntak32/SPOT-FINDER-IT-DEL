/**
 * TIME RAIDERS 5v5 - Main Game Engine
 * 60 FPS HTML5 Canvas MOBA Arena with Time Rewind, Chrono Freeze, AI Bots & Team Combat
 */

class TimeRaidersGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundEngine();

        // Arena Map Dimension
        this.mapWidth = 2400;
        this.mapHeight = 1400;

        // Camera Viewport
        this.camera = { x: 0, y: 0, width: 1280, height: 720 };

        // Game States
        this.state = 'MENU'; // 'MENU', 'SELECT', 'PLAYING', 'GAMEOVER'
        this.playerHeroRole = 'fighter';
        this.player = null;
        this.heroes = [];
        this.minions = [];
        this.turrets = [];
        this.nexusList = [];
        this.projectiles = [];
        this.particles = [];
        this.damageTexts = [];
        this.freezeDomes = [];
        this.shrines = [];

        // Timers & Spawners
        this.gameTime = 0;
        this.minionSpawnTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];

        // Input Handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };
        this.virtualJoystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initInputListeners();
        this.startLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    initInputListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.keys[e.key.toUpperCase()] = true;

            if (this.state === 'PLAYING' && this.player && this.player.alive) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.triggerPlayerRewind();
                } else if (e.code === 'KeyQ' || e.key === '1') {
                    this.castPlayerSkill(0);
                } else if (e.code === 'KeyW' || e.key === '2') {
                    this.castPlayerSkill(1);
                } else if (e.code === 'KeyE' || e.key === '3') {
                    this.castPlayerSkill(2);
                } else if (e.code === 'KeyR' || e.key === '4') {
                    this.castPlayerSkill(3);
                } else if (e.code === 'Tab') {
                    e.preventDefault();
                    document.getElementById('scoreboardModal').classList.toggle('active');
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key.toUpperCase()] = false;
        });

        // Mouse
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
                    this.playerBasicAttack();
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /* ==========================================================================
       Start Match & 5v5 Setup
       ========================================================================== */
    startMatch(chosenRoleKey) {
        this.sound.init();
        this.playerHeroRole = chosenRoleKey;
        this.state = 'PLAYING';
        this.gameTime = 0;
        this.minionSpawnTimer = 0;
        this.blueScore = 0;
        this.redScore = 0;
        this.killFeed = [];
        this.heroes = [];
        this.minions = [];
        this.turrets = [];
        this.nexusList = [];
        this.projectiles = [];
        this.particles = [];
        this.damageTexts = [];
        this.freezeDomes = [];

        // 1. Build Bases, Towers & Temporal Shrines
        this.buildMapEntities();

        // 2. Draft 5v5 Teams
        const roles = ['fighter', 'tank', 'marksman', 'support', 'timemage'];

        // Blue Team (Player + 4 AI Bots)
        roles.forEach((roleKey, idx) => {
            const isHuman = (roleKey === chosenRoleKey);
            const heroConfig = Object.values(HERO_ROLES).find(r => r.id === roleKey);
            const startX = 200 + Math.random() * 80;
            const startY = 600 + idx * 50;

            const hero = new HeroEntity(heroConfig, 'BLUE', startX, startY, isHuman);
            hero.name = isHuman ? 'You (P1)' : `Ally ${heroConfig.name}`;
            this.heroes.push(hero);

            if (isHuman) {
                this.player = hero;
            }
        });

        // Red Team (5 AI Bots)
        roles.forEach((roleKey, idx) => {
            const heroConfig = Object.values(HERO_ROLES).find(r => r.id === roleKey);
            const startX = 2200 - Math.random() * 80;
            const startY = 600 + idx * 50;

            const hero = new HeroEntity(heroConfig, 'RED', startX, startY, false);
            hero.name = `Enemy ${heroConfig.name}`;
            this.heroes.push(hero);
        });

        // Spawn initial minion wave
        this.spawnMinionWave();

        // Audio announcer start
        this.sound.announce('Welcome to Time Raiders 5v5! Battle begins.');
        this.addKillFeed('System', 'Pertandingan 5v5 Dimulai! Hancurkan Nexus Musuh.', 'system');

        // Hide UI screens, show battle HUD
        document.getElementById('screenHeroSelect').style.display = 'none';
        document.getElementById('screenBattleHUD').style.display = 'block';
        document.getElementById('screenGameOver').style.display = 'none';
        this.updateHUDHeroInfo();
    }

    buildMapEntities() {
        // Blue Turrets (Outer & Inner)
        this.turrets.push(new TurretEntity(550, 700, 'BLUE', 'Outer Turret'));
        this.turrets.push(new TurretEntity(380, 700, 'BLUE', 'Inner Turret'));
        
        // Red Turrets (Outer & Inner)
        this.turrets.push(new TurretEntity(1850, 700, 'RED', 'Outer Turret'));
        this.turrets.push(new TurretEntity(2020, 700, 'RED', 'Inner Turret'));

        // Core Nexus
        this.nexusList.push(new NexusEntity(180, 700, 'BLUE'));
        this.nexusList.push(new NexusEntity(2220, 700, 'RED'));

        // Neutral Mid Temporal Shrine (x=1200, y=700)
        this.shrines.push(new TemporalShrineEntity(1200, 700));
    }

    spawnMinionWave() {
        for (let i = 0; i < 3; i++) {
            // Blue Minions
            this.minions.push(new MinionEntity(240, 680 + (i - 1) * 30, 'BLUE'));
            // Red Minions
            this.minions.push(new MinionEntity(2160, 680 + (i - 1) * 30, 'RED'));
        }
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
        this.gameTime += dt;
        this.minionSpawnTimer += dt;

        // Minion Spawner every 22 seconds
        if (this.minionSpawnTimer >= 22) {
            this.minionSpawnTimer = 0;
            this.spawnMinionWave();
        }

        // 1. Update Player Input & Movement
        if (this.player && this.player.alive) {
            this.handlePlayerMovement(dt);
        }

        // 2. Update Heroes & AI
        this.heroes.forEach(h => h.update(dt, this));

        // 3. Update Minions
        this.minions.forEach(m => m.update(dt, this));
        this.minions = this.minions.filter(m => m.alive);

        // 4. Update Turrets & Nexus
        this.turrets.forEach(t => t.update(dt, this));
        this.turrets = this.turrets.filter(t => t.alive);

        this.nexusList.forEach(n => n.update(dt, this));

        // 5. Update Projectiles
        this.projectiles.forEach(p => p.update(dt, this));
        this.projectiles = this.projectiles.filter(p => p.alive);

        // 6. Update Freeze Domes
        this.freezeDomes.forEach(f => f.update(dt));
        this.freezeDomes = this.freezeDomes.filter(f => f.alive);

        // 7. Update Shrines
        this.shrines.forEach(s => s.update(dt, this));

        // 8. Update Particles & Floating Text
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.alive);

        this.damageTexts.forEach(t => t.update(dt));
        this.damageTexts = this.damageTexts.filter(t => t.alive);

        // 9. Camera Smoothing (Follow Player)
        if (this.player) {
            const targetCamX = this.player.x - this.camera.width / 2;
            const targetCamY = this.player.y - this.camera.height / 2;
            this.camera.x += (targetCamX - this.camera.x) * 0.1;
            this.camera.y += (targetCamY - this.camera.y) * 0.1;

            // Clamp Camera to Arena Bounds
            this.camera.x = Math.max(0, Math.min(this.mapWidth - this.camera.width, this.camera.x));
            this.camera.y = Math.max(0, Math.min(this.mapHeight - this.camera.height, this.camera.y));
        }

        // 10. Update HUD Elements
        this.updateHUD();

        // 11. Check Victory / Defeat
        const blueNexus = this.nexusList.find(n => n.team === 'BLUE');
        const redNexus = this.nexusList.find(n => n.team === 'RED');

        if (redNexus && !redNexus.alive) {
            this.endMatch('VICTORY');
        } else if (blueNexus && !blueNexus.alive) {
            this.endMatch('DEFEAT');
        }
    }

    handlePlayerMovement(dt) {
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

            // Check Freeze Dome slow factor
            let speedFactor = 1.0;
            if (this.isInsideFreezeDome(this.player.x, this.player.y, 'RED')) {
                speedFactor = 0.25; // Slowed by 75%
            }

            this.player.x += mx * this.player.speed * speedFactor * 60 * dt;
            this.player.y += my * this.player.speed * speedFactor * 60 * dt;

            // Clamp Arena Bounds
            this.player.x = Math.max(60, Math.min(this.mapWidth - 60, this.player.x));
            this.player.y = Math.max(60, Math.min(this.mapHeight - 60, this.player.y));
        }

        // Player faces mouse
        this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
    }

    /* ==========================================================================
       Player Combat & Universal Time Rewind
       ========================================================================== */
    playerBasicAttack() {
        if (!this.player || !this.player.alive || this.player.attackCooldown > 0) return;
        this.player.attackCooldown = 1.0 / this.player.attackSpeed;

        if (this.player.role.attackRange > 120) {
            // Ranged projectile
            this.projectiles.push(new Projectile(
                this.player.x, this.player.y,
                this.mouse.worldX, this.mouse.worldY,
                this.player.role.attackDamage,
                'BLUE', this.player, 11, 'arrow'
            ));
            this.sound.playShoot();
        } else {
            // Melee Slash
            this.sound.playSlash();
            this.createSlashEffect(this.player.x, this.player.y, this.player.angle, 80, '#f43f5e');

            // Find enemies in melee range
            this.getEnemiesOf('BLUE').forEach(e => {
                const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
                const angleToEnemy = Math.atan2(e.y - this.player.y, e.x - this.player.x);
                const angleDiff = Math.abs(this.angleDifference(this.player.angle, angleToEnemy));

                if (dist < this.player.role.attackRange + e.radius && angleDiff < Math.PI / 2.2) {
                    e.takeDamage(this.player.role.attackDamage, this.player, this);
                }
            });
        }
    }

    castPlayerSkill(skillIdx) {
        if (!this.player || !this.player.alive) return;
        this.player.castSkill(skillIdx, this, this.mouse.worldX, this.mouse.worldY);
    }

    triggerPlayerRewind() {
        if (!this.player || !this.player.alive) return;
        this.player.triggerTimeRewind(this);
    }

    isInsideFreezeDome(x, y, casterTeam) {
        for (let dome of this.freezeDomes) {
            if (dome.team === casterTeam) {
                const dist = Math.hypot(dome.x - x, dome.y - y);
                if (dist <= dome.radius) return true;
            }
        }
        return false;
    }

    getEnemiesOf(team) {
        const enemies = [];
        this.heroes.filter(h => h.team !== team && h.alive).forEach(h => enemies.push(h));
        this.minions.filter(m => m.team !== team && m.alive).forEach(m => enemies.push(m));
        this.turrets.filter(t => t.team !== team && t.alive).forEach(t => enemies.push(t));
        this.nexusList.filter(n => n.team !== team && n.alive).forEach(n => enemies.push(n));
        return enemies;
    }

    getAlliesOf(team) {
        return this.heroes.filter(h => h.team === team && h.alive);
    }

    angleDifference(a1, a2) {
        return Math.atan2(Math.sin(a1 - a2), Math.cos(a1 - a2));
    }

    /* ==========================================================================
       Visual Effects & Particle Engine
       ========================================================================== */
    createSlashEffect(x, y, angle, radius, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                x + Math.cos(angle) * (radius * 0.7),
                y + Math.sin(angle) * (radius * 0.7),
                (Math.cos(angle + (Math.random() - 0.5)) * 4),
                (Math.sin(angle + (Math.random() - 0.5)) * 4),
                color, 4, 0.25
            ));
        }
    }

    createExplosion(x, y, color = '#fbbf24', count = 25) {
        this.sound.playExplosion();
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 6 + 2;
            this.particles.push(new Particle(x, y, Math.cos(ang) * spd, Math.sin(ang) * spd, color, Math.random() * 5 + 2, 0.45));
        }
    }

    showDamageText(x, y, damage, isCrit = false, isHeal = false) {
        this.damageTexts.push(new DamageText(x, y, damage, isCrit, isHeal));
    }

    addKillFeed(killerName, victimName, type = 'kill') {
        const item = { killerName, victimName, type, time: 4.0 };
        this.killFeed.unshift(item);
        if (this.killFeed.length > 5) this.killFeed.pop();

        const feedEl = document.getElementById('killFeedContainer');
        if (feedEl) {
            feedEl.innerHTML = this.killFeed.map(k => {
                if (k.type === 'system') {
                    return `<div class="feed-item system"><i class="fa-solid fa-bell"></i> ${k.victimName}</div>`;
                }
                return `<div class="feed-item"><span class="k-name">${k.killerName}</span> <i class="fa-solid fa-crosshairs"></i> <span class="v-name">${k.victimName}</span></div>`;
            }).join('');
        }
    }

    /* ==========================================================================
       HUD Updates & Minimap
       ========================================================================== */
    updateHUDHeroInfo() {
        if (!this.player) return;
        const hero = this.player.role;
        document.getElementById('hudHeroName').textContent = `${hero.name} (${hero.title})`;
        document.getElementById('hudHeroIcon').textContent = hero.icon;
        
        // Skill Icons and Keys
        hero.skills.forEach((s, idx) => {
            const keyEl = document.getElementById(`skillKey${idx}`);
            const nameEl = document.getElementById(`skillName${idx}`);
            if (keyEl) keyEl.textContent = s.key;
            if (nameEl) nameEl.textContent = s.name;
        });
    }

    updateHUD() {
        if (!this.player) return;

        // Health & Mana Bar
        const hpPercent = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
        document.getElementById('playerHpFill').style.width = `${hpPercent}%`;
        document.getElementById('playerHpText').textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;

        // Rewind Cooldown Dial
        const rewindBtn = document.getElementById('btnTimeRewind');
        const rewindCdText = document.getElementById('rewindCdText');
        if (this.player.rewindCooldown > 0) {
            rewindBtn.classList.add('disabled');
            rewindCdText.textContent = this.player.rewindCooldown.toFixed(1);
        } else {
            rewindBtn.classList.remove('disabled');
            rewindCdText.textContent = 'SPACE';
        }

        // Skill Cooldowns
        for (let i = 0; i < 4; i++) {
            const skillBtn = document.getElementById(`skillBtn${i}`);
            const cdText = document.getElementById(`skillCdText${i}`);
            const cd = this.player.skillCooldowns[i] || 0;
            if (cd > 0) {
                skillBtn.classList.add('on-cd');
                cdText.textContent = cd.toFixed(1);
            } else {
                skillBtn.classList.remove('on-cd');
                cdText.textContent = this.player.role.skills[i].key;
            }
        }

        // Scores
        document.getElementById('scoreBlueTeam').textContent = this.blueScore;
        document.getElementById('scoreRedTeam').textContent = this.redScore;
        
        const m = Math.floor(this.gameTime / 60);
        const s = Math.floor(this.gameTime % 60);
        document.getElementById('matchTimer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        // Render Minimap
        this.renderMinimap();
    }

    renderMinimap() {
        const miniCanvas = document.getElementById('minimapCanvas');
        if (!miniCanvas) return;
        const mctx = miniCanvas.getContext('2d');
        const mw = miniCanvas.width;
        const mh = miniCanvas.height;

        mctx.fillStyle = 'rgba(10, 15, 25, 0.9)';
        mctx.fillRect(0, 0, mw, mh);

        // Lane grid line
        mctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        mctx.lineWidth = 2;
        mctx.beginPath();
        mctx.moveTo(0, mh / 2);
        mctx.lineTo(mw, mh / 2);
        mctx.stroke();

        // Shrines
        this.shrines.forEach(s => {
            const sx = (s.x / this.mapWidth) * mw;
            const sy = (s.y / this.mapHeight) * mh;
            mctx.fillStyle = '#a855f7';
            mctx.beginPath();
            mctx.arc(sx, sy, 4, 0, Math.PI * 2);
            mctx.fill();
        });

        // Turrets
        this.turrets.forEach(t => {
            const tx = (t.x / this.mapWidth) * mw;
            const ty = (t.y / this.mapHeight) * mh;
            mctx.fillStyle = t.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
            mctx.fillRect(tx - 3, ty - 3, 6, 6);
        });

        // Heroes
        this.heroes.forEach(h => {
            if (!h.alive) return;
            const hx = (h.x / this.mapWidth) * mw;
            const hy = (h.y / this.mapHeight) * mh;
            mctx.fillStyle = h.isPlayer ? '#22c55e' : (h.team === 'BLUE' ? '#38bdf8' : '#ef4444');
            mctx.beginPath();
            mctx.arc(hx, hy, h.isPlayer ? 4.5 : 3, 0, Math.PI * 2);
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
            desc.textContent = 'Tim Biru Anda berhasil menghancurkan Nexus Waktu musuh!';
            this.sound.announce('Victory! Well played.');
        } else {
            title.textContent = '💀 DEFEAT';
            title.style.color = '#f43f5e';
            desc.textContent = 'Nexus Waktu tim Anda telah dihancurkan oleh musuh.';
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

        // 1. Draw Sci-Fi Cyber Grid Arena Floor
        this.drawArenaGrid(ctx);

        // 2. Draw Shrines
        this.shrines.forEach(s => s.draw(ctx));

        // 3. Draw Freeze Domes
        this.freezeDomes.forEach(f => f.draw(ctx));

        // 4. Draw Turrets & Nexus
        this.turrets.forEach(t => t.draw(ctx));
        this.nexusList.forEach(n => n.draw(ctx));

        // 5. Draw Minions
        this.minions.forEach(m => m.draw(ctx));

        // 6. Draw Heroes & Rewind Ghost Trail
        this.heroes.forEach(h => h.draw(ctx));

        // 7. Draw Projectiles
        this.projectiles.forEach(p => p.draw(ctx));

        // 8. Draw Particles & Damage Text
        this.particles.forEach(p => p.draw(ctx));
        this.damageTexts.forEach(t => t.draw(ctx));

        ctx.restore();
    }

    drawArenaGrid(ctx) {
        const cw = this.mapWidth;
        const ch = this.mapHeight;

        // Dark Floor
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, cw, ch);

        // Grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= cw; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
        }
        for (let y = 0; y <= ch; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cw, y);
            ctx.stroke();
        }

        // Mid Lane Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, ch / 2 - 120, cw, 240);

        // Base glow zones
        const blueGrad = ctx.createRadialGradient(180, ch / 2, 50, 180, ch / 2, 350);
        blueGrad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
        blueGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = blueGrad;
        ctx.fillRect(0, 0, 600, ch);

        const redGrad = ctx.createRadialGradient(2220, ch / 2, 50, 2220, ch / 2, 350);
        redGrad.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
        redGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = redGrad;
        ctx.fillRect(cw - 600, 0, 600, ch);

        // Outer Arena Border Glow
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, cw - 20, ch - 20);
    }
}

/* ==========================================================================
   Hero Entity Class (With Time Rewind Circular Buffer)
   ========================================================================== */
class HeroEntity {
    constructor(role, team, x, y, isPlayer = false) {
        this.role = role;
        this.team = team;
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.radius = 24;
        this.maxHp = role.baseHp;
        this.hp = this.maxHp;
        this.speed = role.baseSpeed;
        this.attackSpeed = role.attackSpeed;
        this.attackCooldown = 0;
        this.angle = team === 'BLUE' ? 0 : Math.PI;
        this.alive = true;
        this.respawnTimer = 0;
        this.shield = 0;

        // Rewind & Skill Cooldowns
        this.skillCooldowns = [0, 0, 0, 0];
        this.rewindCooldown = 0;

        // Circular History Buffer for 3-Second Time Rewind (180 frames)
        this.historyBuffer = [];
        this.maxHistoryFrames = 180;

        // AI specific variables
        this.aiTarget = null;
        this.aiStateTimer = 0;
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
    }

    update(dt, game) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.respawn(game);
            }
            return;
        }

        // 1. Record Time History Buffer for Rewind
        this.historyBuffer.push({
            x: this.x,
            y: this.y,
            hp: this.hp,
            timestamp: game.gameTime
        });
        if (this.historyBuffer.length > this.maxHistoryFrames) {
            this.historyBuffer.shift();
        }

        // 2. Decrement Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.rewindCooldown > 0) this.rewindCooldown -= dt;
        for (let i = 0; i < 4; i++) {
            if (this.skillCooldowns[i] > 0) this.skillCooldowns[i] -= dt;
        }

        // 3. AI Bot Logic
        if (!this.isPlayer) {
            this.updateAI(dt, game);
        }
    }

    updateAI(dt, game) {
        // AI Clutch Time Rewind: If HP < 30% and had higher HP in past, REWIND!
        if (this.hp < this.maxHp * 0.32 && this.rewindCooldown <= 0 && this.historyBuffer.length > 80) {
            const past = this.historyBuffer[0];
            if (past && past.hp > this.hp + 120) {
                this.triggerTimeRewind(game);
                return;
            }
        }

        // Find Target
        const enemies = game.getEnemiesOf(this.team);
        let nearestEnemy = null;
        let minDist = 99999;

        enemies.forEach(e => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) {
                minDist = d;
                nearestEnemy = e;
            }
        });

        this.aiTarget = nearestEnemy;

        if (this.aiTarget) {
            this.angle = Math.atan2(this.aiTarget.y - this.y, this.aiTarget.x - this.x);
            const range = this.role.attackRange;

            // Attack or Move
            if (minDist <= range + 10) {
                if (this.attackCooldown <= 0) {
                    this.performAIAttack(game);
                }
            } else {
                // Move towards target
                const mx = Math.cos(this.angle);
                const my = Math.sin(this.angle);
                let speedFactor = 1.0;
                if (game.isInsideFreezeDome(this.x, this.y, this.team === 'BLUE' ? 'RED' : 'BLUE')) {
                    speedFactor = 0.25;
                }
                this.x += mx * this.speed * speedFactor * 60 * dt;
                this.y += my * this.speed * speedFactor * 60 * dt;
            }

            // AI Skills
            for (let i = 0; i < 4; i++) {
                if (this.skillCooldowns[i] <= 0 && Math.random() < 0.05) {
                    this.castSkill(i, game, this.aiTarget.x, this.aiTarget.y);
                }
            }
        } else {
            // Push towards enemy base
            const targetX = this.team === 'BLUE' ? 2200 : 200;
            const dx = targetX - this.x;
            this.x += Math.sign(dx) * this.speed * 60 * dt;
        }

        // Clamp
        this.x = Math.max(60, Math.min(game.mapWidth - 60, this.x));
        this.y = Math.max(60, Math.min(game.mapHeight - 60, this.y));
    }

    performAIAttack(game) {
        if (this.attackCooldown > 0 || !this.aiTarget) return;
        this.attackCooldown = 1.0 / this.attackSpeed;

        if (this.role.attackRange > 120) {
            game.projectiles.push(new Projectile(
                this.x, this.y, this.aiTarget.x, this.aiTarget.y,
                this.role.attackDamage, this.team, this, 10, 'arrow'
            ));
        } else {
            this.aiTarget.takeDamage(this.role.attackDamage, this, game);
            game.createSlashEffect(this.x, this.y, this.angle, 70, this.role.color);
        }
    }

    // THE FLASHBACK TIME REWIND (Kemampuan Memutar Balikkan Waktu)
    triggerTimeRewind(game) {
        if (this.rewindCooldown > 0 || this.historyBuffer.length < 10) return;
        this.rewindCooldown = TIME_REWIND_CONFIG.cooldown;

        // Retrieve past state from 3 seconds ago
        const pastState = this.historyBuffer[0];
        if (!pastState) return;

        game.sound.playRewind();

        // Create Rewind Ghost Echo Trail
        for (let i = 0; i < this.historyBuffer.length; i += 15) {
            const h = this.historyBuffer[i];
            game.particles.push(new TimeGhostParticle(h.x, h.y, this.role.color, this.radius));
        }

        // Teleport back in time & Restore Past Health
        const healedAmount = Math.max(0, pastState.hp - this.hp);
        this.x = pastState.x;
        this.y = pastState.y;
        this.hp = Math.max(this.hp, pastState.hp);

        if (healedAmount > 0) {
            game.showDamageText(this.x, this.y - 30, `+${Math.round(healedAmount)} REWIND`, false, true);
        }

        // Visual Chrono Wave Ripple
        game.createExplosion(this.x, this.y, '#06b6d4', 30);
        game.addKillFeed(this.name, 'memutar waktu ke 3 detik lalu!', 'system');
    }

    castSkill(idx, game, targetX, targetY) {
        if (this.skillCooldowns[idx] > 0) return;
        const skill = this.role.skills[idx];
        this.skillCooldowns[idx] = skill.cooldown;

        const ang = Math.atan2(targetY - this.y, targetX - this.x);

        if (skill.type === 'cone') {
            // Fighter Time Slash
            game.sound.playSlash();
            game.createSlashEffect(this.x, this.y, ang, skill.range, '#f43f5e');
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) < skill.range) {
                    e.takeDamage(skill.damage, this, game);
                }
            });
        } else if (skill.type === 'dash') {
            // Leap Strike
            this.x += Math.cos(ang) * skill.range;
            this.y += Math.sin(ang) * skill.range;
            game.createExplosion(this.x, this.y, '#f43f5e', 20);
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) < 100) {
                    e.takeDamage(skill.damage, this, game);
                }
            });
        } else if (skill.type === 'buff') {
            this.shield += skill.shield || 200;
            game.sound.playHeal();
        } else if (skill.type === 'aoe' || skill.type === 'collapse') {
            // Ultimate Burst
            game.sound.playUltimate();
            game.createExplosion(this.x, this.y, '#a855f7', 40);
            game.getEnemiesOf(this.team).forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) < skill.range) {
                    e.takeDamage(skill.damage, this, game);
                }
            });
        } else if (skill.type === 'freeze_dome') {
            // Chrono Freeze Dome
            game.sound.playFreezeDome();
            game.freezeDomes.push(new FreezeDome(targetX, targetY, skill.radius, this.team, 4.0));
        } else if (skill.type === 'laser' || skill.type === 'projectile_aoe') {
            game.projectiles.push(new Projectile(this.x, this.y, targetX, targetY, skill.damage, this.team, this, 14, 'laser'));
            game.sound.playShoot();
        } else if (skill.type === 'heal') {
            game.sound.playHeal();
            game.getAlliesOf(this.team).forEach(a => {
                if (Math.hypot(a.x - this.x, a.y - this.y) < skill.range) {
                    a.hp = Math.min(a.maxHp, a.hp + skill.heal);
                    game.showDamageText(a.x, a.y - 20, `+${skill.heal}`, false, true);
                }
            });
        }
    }

    takeDamage(amount, attacker, game) {
        if (!this.alive) return;

        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                return;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }

        this.hp -= amount;
        game.showDamageText(this.x, this.y - 15, Math.round(amount));

        if (this.hp <= 0) {
            this.die(attacker, game);
        }
    }

    die(attacker, game) {
        this.alive = false;
        this.hp = 0;
        this.respawnTimer = 10.0;
        game.createExplosion(this.x, this.y, '#ef4444', 30);

        if (attacker) {
            attacker.kills += 1;
            if (attacker.team === 'BLUE') game.blueScore += 1;
            else game.redScore += 1;

            game.addKillFeed(attacker.name, this.name, 'kill');
            if (this.isPlayer) {
                game.sound.announce('You have been slain!');
            } else if (attacker.isPlayer) {
                game.sound.announce('You have slain an enemy!');
            }
        }
    }

    respawn(game) {
        this.alive = true;
        this.hp = this.maxHp;
        this.x = this.team === 'BLUE' ? 200 : 2200;
        this.y = 700 + (Math.random() - 0.5) * 100;
        this.historyBuffer = [];
        game.createExplosion(this.x, this.y, '#06b6d4', 20);
    }

    draw(ctx) {
        if (!this.alive) return;

        // 1. Draw Past Time Echo Ghost
        if (this.historyBuffer.length > 60) {
            const past = this.historyBuffer[0];
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = this.role.color;
            ctx.beginPath();
            ctx.arc(past.x, past.y, this.radius * 0.85, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();

            // Connect line between ghost and current hero
            ctx.beginPath();
            ctx.moveTo(past.x, past.y);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.stroke();
            ctx.restore();
        }

        // 2. Draw Hero Body
        ctx.save();
        ctx.translate(this.x, this.y);

        // Team Ring Aura
        ctx.strokeStyle = this.isPlayer ? '#22c55e' : (this.team === 'BLUE' ? '#38bdf8' : '#ef4444');
        ctx.lineWidth = this.isPlayer ? 4 : 3;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Body Core
        ctx.fillStyle = this.role.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        // Role Icon
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.role.icon, 0, 0);

        // Direction Pointer
        ctx.rotate(this.angle);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.radius + 6, 0);
        ctx.lineTo(this.radius - 2, -6);
        ctx.lineTo(this.radius - 2, 6);
        ctx.fill();

        ctx.restore();

        // 3. Health Bar
        const barW = 44;
        const barH = 6;
        const barX = this.x - barW / 2;
        const barY = this.y - this.radius - 16;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX, barY, barW, barH);

        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = this.team === 'BLUE' ? '#22c55e' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpPct, barH);

        // Name tag
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, barY - 4);
    }
}

/* ==========================================================================
   Entities: Minion, Turret, Nexus, FreezeDome, Projectile, Particle
   ========================================================================== */
class MinionEntity {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.radius = 12;
        this.maxHp = 180;
        this.hp = this.maxHp;
        this.speed = 1.8;
        this.damage = 15;
        this.attackRange = 60;
        this.attackCooldown = 0;
        this.alive = true;
    }

    update(dt, game) {
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // Move along mid lane
        const targetX = this.team === 'BLUE' ? 2220 : 180;
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

        if (nearest && minDist < 180) {
            if (minDist <= this.attackRange) {
                if (this.attackCooldown <= 0) {
                    this.attackCooldown = 1.2;
                    nearest.takeDamage(this.damage, null, game);
                }
            } else {
                const ang = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                this.x += Math.cos(ang) * this.speed * 60 * dt;
                this.y += Math.sin(ang) * this.speed * 60 * dt;
            }
        } else {
            const dx = targetX - this.x;
            this.x += Math.sign(dx) * this.speed * 60 * dt;
        }
    }

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, this.team === 'BLUE' ? '#38bdf8' : '#f43f5e', 8);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#0284c7' : '#e11d48';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - 12, this.y - 18, 24, 3);
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.fillRect(this.x - 12, this.y - 18, 24 * hpPct, 3);
    }
}

class TurretEntity {
    constructor(x, y, team, name) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.name = name;
        this.radius = 35;
        this.maxHp = 1600;
        this.hp = this.maxHp;
        this.range = 280;
        this.damage = 95;
        this.shootTimer = 0;
        this.alive = true;
    }

    update(dt, game) {
        this.shootTimer += dt;
        if (this.shootTimer >= 1.2) {
            const enemies = game.getEnemiesOf(this.team).filter(e => Math.hypot(e.x - this.x, e.y - this.y) <= this.range);
            if (enemies.length > 0) {
                this.shootTimer = 0;
                const target = enemies[0];
                game.projectiles.push(new Projectile(this.x, this.y, target.x, target.y, this.damage, this.team, this, 12, 'turret_beam'));
                game.sound.playShoot();
            }
        }
    }

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 30, Math.round(amount));
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#f59e0b', 40);
            game.addKillFeed(attacker ? attacker.name : 'Team', `${this.name} (${this.team}) Hancur!`, 'system');
        }
    }

    draw(ctx) {
        // Base Turret Structure
        ctx.fillStyle = this.team === 'BLUE' ? '#0f2b48' : '#45121b';
        ctx.strokeStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Crystal Core
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // HP bar
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(this.x - 30, this.y - 50, 60, 6);
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.fillRect(this.x - 30, this.y - 50, 60 * hpPct, 6);
    }
}

class NexusEntity {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.radius = 55;
        this.maxHp = 3000;
        this.hp = this.maxHp;
        this.alive = true;
    }

    update(dt, game) {}

    takeDamage(amount, attacker, game) {
        this.hp -= amount;
        game.showDamageText(this.x, this.y - 40, Math.round(amount));
        if (this.hp <= 0) {
            this.alive = false;
            game.createExplosion(this.x, this.y, '#ffffff', 60);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.team === 'BLUE' ? '#0369a1' : '#be123c';
        ctx.strokeStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 6;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Nexus Core Symbol
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', this.x, this.y);

        // HP Bar
        const hpPct = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.x - 45, this.y - 75, 90, 8);
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.fillRect(this.x - 45, this.y - 75, 90 * hpPct, 8);
    }
}

class TemporalShrineEntity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
        this.captureProgress = 0;
        this.capturedTeam = 'NEUTRAL';
    }

    update(dt, game) {
        let blueCount = 0;
        let redCount = 0;

        game.heroes.filter(h => h.alive && Math.hypot(h.x - this.x, h.y - this.y) < 120).forEach(h => {
            if (h.team === 'BLUE') blueCount++;
            else redCount++;
        });

        if (blueCount > redCount) {
            this.captureProgress += dt * 30;
            if (this.captureProgress >= 100 && this.capturedTeam !== 'BLUE') {
                this.capturedTeam = 'BLUE';
                game.addKillFeed('Blue Team', 'Merebut Titik Kristal Waktu!', 'system');
            }
        } else if (redCount > blueCount) {
            this.captureProgress -= dt * 30;
            if (this.captureProgress <= -100 && this.capturedTeam !== 'RED') {
                this.capturedTeam = 'RED';
                game.addKillFeed('Red Team', 'Merebut Titik Kristal Waktu!', 'system');
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.capturedTeam === 'BLUE' ? '#38bdf8' : (this.capturedTeam === 'RED' ? '#f43f5e' : '#a855f7');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 120, 0, Math.PI * 2);
        ctx.setLineDash([8, 8]);
        ctx.stroke();

        ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⏳', this.x, this.y);
        ctx.restore();
    }
}

class FreezeDome {
    constructor(x, y, radius, team, duration) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.team = team;
        this.duration = duration;
        this.alive = true;
    }

    update(dt) {
        this.duration -= dt;
        if (this.duration <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class Projectile {
    constructor(startX, startY, targetX, targetY, damage, team, owner, speed, type = 'arrow') {
        this.x = startX;
        this.y = startY;
        this.damage = damage;
        this.team = team;
        this.owner = owner;
        this.speed = speed;
        this.type = type;
        this.alive = true;

        const ang = Math.atan2(targetY - startY, targetX - startX);
        this.vx = Math.cos(ang) * speed;
        this.vy = Math.sin(ang) * speed;
        this.life = 2.5;
    }

    update(dt, game) {
        this.life -= dt;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        // Check if projectile slowed by Chrono Freeze Dome
        let spd = 1.0;
        if (game.isInsideFreezeDome(this.x, this.y, this.team === 'BLUE' ? 'RED' : 'BLUE')) {
            spd = 0.25;
        }

        this.x += this.vx * spd * 60 * dt;
        this.y += this.vy * spd * 60 * dt;

        // Collision detection with enemies
        const enemies = game.getEnemiesOf(this.team);
        for (let e of enemies) {
            if (Math.hypot(e.x - this.x, e.y - this.y) < e.radius + 6) {
                e.takeDamage(this.damage, this.owner, game);
                this.alive = false;
                break;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.team === 'BLUE' ? '#38bdf8' : '#f43f5e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, vx, vy, color, radius, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.maxLife = life;
        this.life = life;
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

class TimeGhostParticle {
    constructor(x, y, color, radius) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.life = 0.6;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = (this.life / 0.6) * 0.5;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class DamageText {
    constructor(x, y, text, isCrit, isHeal) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y;
        this.text = text;
        this.isCrit = isCrit;
        this.isHeal = isHeal;
        this.life = 0.8;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        this.y -= 30 * dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / 0.8);
        ctx.font = `bold ${this.isCrit ? '18px' : '14px'} 'Outfit', sans-serif`;
        ctx.fillStyle = this.isHeal ? '#22c55e' : (this.isCrit ? '#fbbf24' : '#ffffff');
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Global Launcher
window.addEventListener('DOMContentLoaded', () => {
    window.timeRaiders = new TimeRaidersGame();
});
