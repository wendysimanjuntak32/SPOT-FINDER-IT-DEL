/**
 * CuacaSmart - Canvas Weather Particle System
 * High performance, 60fps dynamic visual effects (Rain, Thunderstorm, Sunshine, Snow, Fog)
 */

class WeatherEffectsManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.currentMode = 'clear'; // 'clear', 'rain', 'thunderstorm', 'snow', 'cloudy', 'hot'
        this.particles = [];
        this.splashes = [];
        this.clouds = [];
        this.lightningTimer = 0;
        this.lightningFlash = 0;
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.start();
    }

    resize() {
        if (!this.canvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.createParticles();
    }

    setWeatherMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        this.splashes = [];

        if (this.currentMode === 'rain' || this.currentMode === 'thunderstorm') {
            const count = this.currentMode === 'thunderstorm' ? 220 : 140;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    length: Math.random() * 20 + 15,
                    speedY: Math.random() * 12 + 18,
                    speedX: -2.5 - Math.random() * 1.5,
                    opacity: Math.random() * 0.4 + 0.3,
                    width: Math.random() * 1.5 + 0.8
                });
            }
        } else if (this.currentMode === 'snow' || this.currentMode === 'cold') {
            const count = 75;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 2.5 + 1,
                    speedY: Math.random() * 1.5 + 0.8,
                    speedX: Math.random() * 1 - 0.5,
                    swayFactor: Math.random() * 2 + 1,
                    angle: Math.random() * Math.PI * 2,
                    opacity: Math.random() * 0.6 + 0.3
                });
            }
        } else if (this.currentMode === 'clear' || this.currentMode === 'hot') {
            const count = 40;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 3 + 1,
                    speedY: -(Math.random() * 0.5 + 0.2),
                    speedX: Math.random() * 0.6 - 0.3,
                    opacity: Math.random() * 0.35 + 0.1,
                    color: this.currentMode === 'hot' ? 'rgba(251, 191, 36, ' : 'rgba(56, 189, 248, '
                });
            }
        }
    }

    createSplash(x, y) {
        if (this.splashes.length > 40) return;
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
            this.splashes.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -(Math.random() * 3 + 1.5),
                radius: Math.random() * 1.5 + 0.5,
                alpha: 0.8,
                decay: 0.05 + Math.random() * 0.03
            });
        }
    }

    start() {
        const loop = () => {
            this.render();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Thunderstorm lightning effect
        if (this.currentMode === 'thunderstorm') {
            this.lightningTimer++;
            if (this.lightningTimer > 180 + Math.random() * 200) {
                this.lightningFlash = 0.85;
                this.lightningTimer = 0;
            }
            if (this.lightningFlash > 0) {
                ctx.fillStyle = `rgba(230, 240, 255, ${this.lightningFlash})`;
                ctx.fillRect(0, 0, this.width, this.height);
                this.lightningFlash -= 0.04;
            }
        }

        // Draw Rain
        if (this.currentMode === 'rain' || this.currentMode === 'thunderstorm') {
            ctx.lineWidth = 1.2;
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                ctx.beginPath();
                ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.speedX, p.y + p.length);
                ctx.stroke();

                p.x += p.speedX;
                p.y += p.speedY;

                // Hit ground splash
                if (p.y > this.height - 20) {
                    if (Math.random() > 0.6) {
                        this.createSplash(p.x, this.height - 10);
                    }
                    p.y = -p.length;
                    p.x = Math.random() * (this.width + 100);
                }
                if (p.x < -20) {
                    p.x = this.width + 20;
                }
            }

            // Draw Splashes
            for (let i = this.splashes.length - 1; i >= 0; i--) {
                const s = this.splashes[i];
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(186, 230, 253, ${s.alpha})`;
                ctx.fill();

                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.2; // gravity
                s.alpha -= s.decay;

                if (s.alpha <= 0) {
                    this.splashes.splice(i, 1);
                }
            }
        }

        // Draw Snow / Cold Crystals
        else if (this.currentMode === 'snow' || this.currentMode === 'cold') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.angle += 0.02;
                const sway = Math.sin(p.angle) * p.swayFactor;

                ctx.beginPath();
                ctx.arc(p.x + sway, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity})`;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 4;
                ctx.fill();
                ctx.shadowBlur = 0;

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > this.height) {
                    p.y = -5;
                    p.x = Math.random() * this.width;
                }
            }
        }

        // Draw Sunny / Ambient Dust Particles
        else if (this.currentMode === 'clear' || this.currentMode === 'hot') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color}${p.opacity})`;
                ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y < 0) {
                    p.y = this.height + 10;
                    p.x = Math.random() * this.width;
                }
            }
        }
    }
}

// Attach globally
window.WeatherEffectsManager = WeatherEffectsManager;
