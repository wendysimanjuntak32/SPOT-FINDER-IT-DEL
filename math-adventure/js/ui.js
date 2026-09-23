/**
 * Math Quest - UI Manager & Visual Effects
 * Controls Screen Transitions, Canvas Particles, Confetti, Animations, and Modal Dialogs.
 */

class UIManager {
    constructor() {
        this.bgCanvas = document.getElementById('bg-canvas');
        this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;

        this.particles = [];
        this.confettis = [];
        this.isConfettiActive = false;

        this.initResize();
        this.initParticles();
        this.startParticleLoop();
    }

    initResize() {
        const resize = () => {
            if (this.bgCanvas) {
                this.bgCanvas.width = window.innerWidth;
                this.bgCanvas.height = window.innerHeight;
            }
            if (this.confettiCanvas) {
                this.confettiCanvas.width = window.innerWidth;
                this.confettiCanvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initParticles() {
        this.particles = [];
        const count = window.innerWidth < 768 ? 25 : 55;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 2.5 + 0.8,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4 - 0.2,
                color: ['#6366f1', '#38bdf8', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    startParticleLoop() {
        const loop = () => {
            if (this.bgCtx && this.bgCanvas) {
                this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
                for (let p of this.particles) {
                    p.x += p.speedX;
                    p.y += p.speedY;

                    if (p.x < 0) p.x = this.bgCanvas.width;
                    if (p.x > this.bgCanvas.width) p.x = 0;
                    if (p.y < 0) p.y = this.bgCanvas.height;
                    if (p.y > this.bgCanvas.height) p.y = 0;

                    this.bgCtx.beginPath();
                    this.bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    this.bgCtx.fillStyle = p.color;
                    this.bgCtx.globalAlpha = p.alpha;
                    this.bgCtx.shadowBlur = 8;
                    this.bgCtx.shadowColor = p.color;
                    this.bgCtx.fill();
                }
            }

            // Confetti loop
            if (this.isConfettiActive && this.confettiCtx && this.confettiCanvas) {
                this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
                for (let i = this.confettis.length - 1; i >= 0; i--) {
                    const c = this.confettis[i];
                    c.x += c.vx;
                    c.y += c.vy;
                    c.vy += 0.15; // gravity
                    c.rotation += c.vRot;
                    c.alpha -= 0.008;

                    this.confettiCtx.save();
                    this.confettiCtx.translate(c.x, c.y);
                    this.confettiCtx.rotate(c.rotation);
                    this.confettiCtx.fillStyle = c.color;
                    this.confettiCtx.globalAlpha = Math.max(0, c.alpha);
                    this.confettiCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 1.5);
                    this.confettiCtx.restore();

                    if (c.alpha <= 0 || c.y > this.confettiCanvas.height) {
                        this.confettis.splice(i, 1);
                    }
                }
                if (this.confettis.length === 0) {
                    this.isConfettiActive = false;
                }
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    launchConfetti() {
        this.isConfettiActive = true;
        const colors = ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#a855f7', '#fbbf24'];
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight * 0.4;

        for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            this.confettis.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.2,
                alpha: 1
            });
        }
    }

    // View Switching
    switchView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Floating combat text (Damage, Heal, Critical)
    spawnFloatingText(text, targetEl, type = 'damage') {
        if (!targetEl) return;
        const rect = targetEl.getBoundingClientRect();
        const span = document.createElement('span');
        span.className = `floating-text ${type}`;
        span.innerText = text;

        const offsetX = (Math.random() - 0.5) * 40;
        span.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
        span.style.top = `${rect.top + 20}px`;

        document.body.appendChild(span);
        setTimeout(() => span.remove(), 850);
    }

    // Show Custom Modal
    showModal(title, htmlContent, buttons = []) {
        const overlay = document.getElementById('game-modal-overlay');
        const titleEl = document.getElementById('modal-title-text');
        const bodyEl = document.getElementById('modal-body-content');
        const actionsEl = document.getElementById('modal-actions');

        if (!overlay) return;

        titleEl.innerHTML = title;
        bodyEl.innerHTML = htmlContent;
        actionsEl.innerHTML = '';

        buttons.forEach(btn => {
            const buttonEl = document.createElement('button');
            buttonEl.className = btn.className || 'btn-primary';
            buttonEl.innerHTML = btn.text;
            buttonEl.onclick = () => {
                window.sound.playClick();
                if (btn.onClick) btn.onClick();
                this.closeModal();
            };
            actionsEl.appendChild(buttonEl);
        });

        overlay.classList.add('active');
    }

    closeModal() {
        const overlay = document.getElementById('game-modal-overlay');
        if (overlay) overlay.classList.remove('active');
    }
}

window.ui = new UIManager();
