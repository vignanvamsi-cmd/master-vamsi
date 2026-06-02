// --- Matrix Rain Background ---
class MatrixBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890".split('');
        this.fontSize = 16;
        this.drops = [];
        this.init();
    }

    init() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        const columns = Math.floor(this.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < columns; i++) {
            this.drops[i] = 1;
        }
    }

    draw() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = "#0F0"; 
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            this.ctx.fillText(text, x, y);

            if (y > this.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
    }
}

// --- Cursor Driven Particle Typography ---
class Particle {
    constructor(x, y, particleSize, particleColor, dispersionStrength, returnSpeed) {
        this.x = x + (Math.random() - 0.5) * 10;
        this.y = y + (Math.random() - 0.5) * 10;
        this.originX = x;
        this.originY = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.size = particleSize;
        this.color = particleColor;
        this.dispersion = dispersionStrength;
        this.returnSpd = returnSpeed;
    }

    update(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 120;

        if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (interactionRadius - distance) / interactionRadius;

            const repulsionX = forceDirectionX * force * this.dispersion;
            const repulsionY = forceDirectionY * force * this.dispersion;

            this.vx -= repulsionX;
            this.vy -= repulsionY;
        }

        this.vx += (this.originX - this.x) * this.returnSpd;
        this.vy += (this.originY - this.y) * this.returnSpd;

        this.vx *= 0.85;
        this.vy *= 0.85;

        const distToOrigin = Math.sqrt(
            Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
        );
        if (distToOrigin < 1 && Math.random() > 0.95) {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleTypography {
    constructor(containerId, canvasId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // Configuration
        this.text = "MASTER VAMSI";
        this.fontSize = 140;
        this.fontFamily = "'Inter', sans-serif";
        this.particleSize = 1.8;
        this.particleDensity = 6;
        this.dispersionStrength = 15;
        this.returnSpeed = 0.08;
        this.particleColor = "#FFFFFF";

        this.particles = [];
        this.mouseX = -1000;
        this.mouseY = -1000;

        this.init();
        this.setupEvents();
    }

    init() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Split text on small screens for better visibility
        const textLines = this.width < 768 ? ["MASTER", "VAMSI"] : [this.text];
        
        // Adjust font size based on screen size
        const effectiveFontSize = this.width < 768 
            ? Math.min(this.fontSize, this.width * 0.25)
            : Math.min(this.fontSize, this.width * 0.15);

        this.ctx.fillStyle = this.particleColor;
        this.ctx.font = `900 ${effectiveFontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // Draw multiple lines if necessary
        const lineHeight = effectiveFontSize * 1.1;
        const totalHeight = lineHeight * textLines.length;
        let startY = (this.height - totalHeight) / 2 + (lineHeight / 2);

        textLines.forEach(line => {
            this.ctx.fillText(line, this.width / 2, startY);
            startY += lineHeight;
        });

        const textCoordinates = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];

        const step = Math.max(1, Math.floor(this.particleDensity * dpr));
        for (let y = 0; y < textCoordinates.height; y += step) {
            for (let x = 0; x < textCoordinates.width; x += step) {
                const index = (y * textCoordinates.width + x) * 4;
                const alpha = textCoordinates.data[index + 3] || 0;

                if (alpha > 128) {
                    this.particles.push(new Particle(
                        x / dpr, y / dpr, 
                        this.particleSize, this.particleColor, 
                        this.dispersionStrength, this.returnSpeed
                    ));
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = this.particleColor;

        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (!e.touches[0]) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!e.touches[0]) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        });

        this.canvas.addEventListener('touchend', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });
    }
}

// --- Callout Manager ---
class CalloutManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.phrases = [
            "He is hot!",
            "So hot!",
            "Too hot to handle!",
            "Absolute fire!",
            "Smokin'!"
        ];
        this.spawnRate = 2000; // spawn every ~2 seconds
        this.lastSpawnTime = 0;
    }

    spawn(timestamp) {
        if (timestamp - this.lastSpawnTime > this.spawnRate) {
            // Randomize slightly
            if (Math.random() > 0.3) {
                this.createCallout();
            }
            this.lastSpawnTime = timestamp;
        }
    }

    createCallout() {
        const callout = document.createElement('div');
        callout.className = 'callout';
        callout.textContent = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        
        // Random position within the window, keeping it somewhat centered
        const x = window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6);
        const y = window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.6);
        
        callout.style.left = `${x}px`;
        callout.style.top = `${y}px`;

        this.container.appendChild(callout);

        // Remove element after animation ends (3s)
        setTimeout(() => {
            if (callout.parentNode === this.container) {
                this.container.removeChild(callout);
            }
        }, 3000);
    }
}

// --- App Controller ---
class App {
    constructor() {
        this.matrix = new MatrixBackground('matrix-canvas');
        this.typography = null; // initialized after font load
        this.callouts = new CalloutManager('callouts-container');
        
        this.lastMatrixFrame = 0;
        this.matrixFps = 20;
        this.matrixInterval = 1000 / this.matrixFps;

        this.setupEvents();
        this.start();
    }

    setupEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.matrix.init();
                if (this.typography) {
                    this.typography.init();
                }
            }, 200);
        });
    }

    start() {
        document.fonts.ready.then(() => {
            this.typography = new ParticleTypography('text-container', 'text-canvas');
            requestAnimationFrame(this.loop.bind(this));
        });
    }

    loop(timestamp) {
        // Matrix Rain uses a separate, slower interval logically
        if (timestamp - this.lastMatrixFrame > this.matrixInterval) {
            this.matrix.draw();
            this.lastMatrixFrame = timestamp;
        }

        if (this.typography) {
            this.typography.draw();
        }

        this.callouts.spawn(timestamp);

        requestAnimationFrame(this.loop.bind(this));
    }
}

// Initialize App
new App();
