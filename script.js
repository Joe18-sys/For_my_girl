const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class FloatingParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * -1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -20) {
            this.y = canvas.height + 20;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(255, 133, 161, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 40; i++) {
        particles.push(new FloatingParticle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

let score = 0;
const targetScore = 10;
let gameTimer = null;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function playSound(freq, type, duration) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

function startReflexGame() {
    score = 0;
    document.getElementById('reflex-score').innerText = score;
    showScreen('screen-reflex-game');
    spawnTarget();
}

function spawnTarget() {
    const area = document.getElementById('game-area');
    area.innerHTML = '';

    if (score >= targetScore) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        showScreen('screen-envelope');
        return;
    }

    const target = document.createElement('div');
    target.className = 'target-item';
    target.innerText = '💖';

    const maxX = area.clientWidth - 70;
    const maxY = area.clientHeight - 70;

    const randomX = Math.max(10, Math.floor(Math.random() * maxX));
    const randomY = Math.max(10, Math.floor(Math.random() * maxY));

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    target.onclick = () => {
        score++;
        document.getElementById('reflex-score').innerText = score;
        playSound(659.25, 'sine', 0.15);
        spawnTarget();
    };

    area.appendChild(target);

    clearTimeout(gameTimer);
    gameTimer = setTimeout(() => {
        spawnTarget();
    }, 900);
}

function openEnvelope() {
    const env = document.getElementById('envelope');
    env.classList.add('open');
    playSound(440, 'triangle', 0.3);
    
    setTimeout(() => {
        showScreen('screen-letter');
        document.querySelector('.letter').style.display = 'block';
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    }, 800);
}

function goToCoupons() {
    showScreen('screen-coupons');
}

function redeemCoupon(id) {
    const dateInput = document.getElementById(`date-${id}`);
    const selectedDate = dateInput.value;

    if (!selectedDate) {
        alert('Por favor selecciona una fecha primero ❤️');
        return;
    }

    const coupon = document.getElementById(`coupon-${id}`);
    const badge = document.getElementById(`badge-${id}`);

    coupon.classList.add('redeemed');
    badge.innerText = `Agendado para: ${selectedDate}`;

    playSound(880, 'sine', 0.2);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
}
