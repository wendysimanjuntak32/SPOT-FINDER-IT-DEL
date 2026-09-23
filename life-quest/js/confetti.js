// Confetti particle system for LifeQuest Level-up and Quest Victories
class ConfettiCannon {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false;

        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire(count = 70) {
        this.resize();
        this.active = true;
        const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#38bdf8', '#fbbf24'];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: window.innerWidth * (0.3 + Math.random() * 0.4),
                y: window.innerHeight * 0.6,
                vx: (Math.random() - 0.5) * 16,
                vy: -(Math.random() * 14 + 10),
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
                decay: Math.random() * 0.015 + 0.01
            });
        }

        if (!this.looping) {
            this.looping = true;
            this.update();
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4; // gravity
            p.vx *= 0.98;
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.update());
        } else {
            this.looping = false;
        }
    }
}

window.confetti = new ConfettiCannon();
