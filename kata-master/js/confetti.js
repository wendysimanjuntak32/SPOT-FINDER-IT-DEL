/**
 * KataMaster - Canvas Confetti Celebration Engine
 */

class ConfettiEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animating = false;
        this.animationFrame = null;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        const colors = ['#58cc02', '#ffc800', '#ff4b4b', '#1cb0f6', '#ce82ff', '#ff9600', '#2ee0ca'];
        const shapes = ['rect', 'circle', 'ribbon'];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 6;

        return {
            x: x || this.canvas.width / 2,
            y: y || this.canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (Math.random() * 6 + 4),
            size: Math.random() * 10 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            opacity: 1,
            gravity: 0.28,
            friction: 0.96,
            decay: Math.random() * 0.008 + 0.006
        };
    }

    burst(x, y, count = 120) {
        this.resize();
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y));
        }

        if (!this.animating) {
            this.animating = true;
            this.render();
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.shape === 'ribbon') {
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size * 1.5, p.size / 2);
            } else {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.render());
        } else {
            this.animating = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    stop() {
        this.particles = [];
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animating = false;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

const confetti = new ConfettiEngine();
