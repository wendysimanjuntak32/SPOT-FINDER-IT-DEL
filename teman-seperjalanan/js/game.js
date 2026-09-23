/**
 * TemanSeperjalanan - Mini Arcade Game: "Eco-Ride Del: Jemput Teman Seperjalanan"
 * Game interaktif menyetir mobil/motor keliling rute kampus IT Del untuk menjemput mahasiswa
 */

class EcoRideGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.score = 0;
        this.pickedStudents = 0;
        this.savedCarbon = 0;
        this.totalSharedCost = 0;

        this.car = {
            x: 200,
            y: 460,
            width: 50,
            height: 80,
            speed: 5,
            color: '#10b981'
        };

        this.roadLines = [];
        this.students = [];
        this.obstacles = [];
        this.keys = {};
        this.animationId = null;
        this.lastSpawn = 0;
    }

    initCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 440;
        this.canvas.height = 560;

        this.setupControls();
        this.initRoad();
    }

    initRoad() {
        this.roadLines = [];
        for (let i = 0; i < 6; i++) {
            this.roadLines.push({ y: i * 100 });
        }
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch buttons for mobile
        const leftBtn = document.getElementById('game-btn-left');
        const rightBtn = document.getElementById('game-btn-right');

        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = true; });
            leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = false; });
            leftBtn.addEventListener('mousedown', () => { this.keys['ArrowLeft'] = true; });
            leftBtn.addEventListener('mouseup', () => { this.keys['ArrowLeft'] = false; });
        }

        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowRight'] = true; });
            rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowRight'] = false; });
            rightBtn.addEventListener('mousedown', () => { this.keys['ArrowRight'] = true; });
            rightBtn.addEventListener('mouseup', () => { this.keys['ArrowRight'] = false; });
        }
    }

    startGame() {
        this.score = 0;
        this.pickedStudents = 0;
        this.savedCarbon = 0;
        this.totalSharedCost = 0;
        this.students = [];
        this.obstacles = [];
        this.car.x = this.canvas.width / 2 - this.car.width / 2;
        this.isRunning = true;
        this.lastSpawn = Date.now();

        this.updateStatsUI();
        this.loop();
    }

    stopGame() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    spawnEntities() {
        const now = Date.now();
        if (now - this.lastSpawn > 1400) {
            this.lastSpawn = now;

            const lanes = [70, 160, 250, 330];
            const lane = lanes[Math.floor(Math.random() * lanes.length)];

            if (Math.random() > 0.4) {
                // Spawn Student
                const studentNames = ["Putri (Balige)", "Kevin (Silangit)", "Samuel (Porsea)", "David (GD 7)", "Grace (Bulbul)"];
                const name = studentNames[Math.floor(Math.random() * studentNames.length)];
                this.students.push({
                    x: lane,
                    y: -40,
                    width: 32,
                    height: 32,
                    name: name,
                    fare: 15000
                });
            } else {
                // Spawn Obstacle (Traffic cone / Lubang)
                this.obstacles.push({
                    x: lane + 5,
                    y: -40,
                    width: 30,
                    height: 30,
                    type: 'cone'
                });
            }
        }
    }

    update() {
        // Move Car
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.car.x = Math.max(50, this.car.x - this.car.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.car.x = Math.min(this.canvas.width - 50 - this.car.width, this.car.x + this.car.speed);
        }

        // Move Road
        this.roadLines.forEach(line => {
            line.y += 6;
            if (line.y > this.canvas.height) {
                line.y = -40;
            }
        });

        // Move & Check Students
        for (let i = this.students.length - 1; i >= 0; i--) {
            const s = this.students[i];
            s.y += 4.5;

            // Collision with car
            if (
                this.car.x < s.x + s.width &&
                this.car.x + this.car.width > s.x &&
                this.car.y < s.y + s.height &&
                this.car.y + this.car.height > s.y
            ) {
                // Picked up student!
                this.pickedStudents++;
                this.score += 150;
                this.savedCarbon += 2.5;
                this.totalSharedCost += s.fare;
                this.students.splice(i, 1);
                this.updateStatsUI();
                continue;
            }

            if (s.y > this.canvas.height + 50) {
                this.students.splice(i, 1);
            }
        }

        // Move & Check Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            ob.y += 5;

            if (
                this.car.x < ob.x + ob.width &&
                this.car.x + this.car.width > ob.x &&
                this.car.y < ob.y + ob.height &&
                this.car.y + this.car.height > ob.y
            ) {
                // Hit obstacle
                this.score = Math.max(0, this.score - 50);
                this.obstacles.splice(i, 1);
                this.updateStatsUI();
                continue;
            }

            if (ob.y > this.canvas.height + 50) {
                this.obstacles.splice(i, 1);
            }
        }

        this.spawnEntities();
    }

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        // Background / Highway
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grass Borders
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, 0, 40, this.canvas.height);
        ctx.fillRect(this.canvas.width - 40, 0, 40, this.canvas.height);

        // Road markings
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);

        [135, 220, 305].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Draw Students
        this.students.forEach(s => {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(s.x + s.width / 2, s.y + s.height / 2, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.font = '14px sans-serif';
            ctx.fillText('🙋', s.x + 2, s.y + 20);

            // Speech Bubble Tag
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(s.x - 20, s.y - 18, 75, 16);
            ctx.fillStyle = '#0f172a';
            ctx.font = '9px sans-serif';
            ctx.fillText(s.name.split(' ')[0], s.x - 16, s.y - 6);
        });

        // Draw Obstacles
        this.obstacles.forEach(ob => {
            ctx.fillStyle = '#ef4444';
            ctx.font = '22px sans-serif';
            ctx.fillText('🚧', ob.x, ob.y + 22);
        });

        // Draw Car (Del Eco Shuttle)
        ctx.save();
        ctx.translate(this.car.x, this.car.y);

        // Car Body
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(0, 0, this.car.width, this.car.height, 12);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#059669';
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(6, 16, this.car.width - 12, 16);

        // Roof Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('IT DEL', 10, 48);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(6, 2, 8, 6);
        ctx.fillRect(this.car.width - 14, 2, 8, 6);

        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(6, this.car.height - 6, 8, 4);
        ctx.fillRect(this.car.width - 14, this.car.height - 6, 8, 4);

        ctx.restore();
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    updateStatsUI() {
        const scoreEl = document.getElementById('game-score');
        const studentsEl = document.getElementById('game-students');
        const carbonEl = document.getElementById('game-carbon');
        const costEl = document.getElementById('game-cost');

        if (scoreEl) scoreEl.textContent = this.score;
        if (studentsEl) studentsEl.textContent = `${this.pickedStudents} Orang`;
        if (carbonEl) carbonEl.textContent = `${this.savedCarbon.toFixed(1)} kg`;
        if (costEl) costEl.textContent = `Rp ${this.totalSharedCost.toLocaleString('id-ID')}`;
    }
}

window.ecoGame = new EcoRideGame();
