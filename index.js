
// ====== TYPING ANIMATION ======
// Guard: solo corre si el elemento existe (solo en index.html)
const typingEl = document.getElementById('typing');

if (typingEl) {
    const phrases = [
        "Desarrollador Frontend",
        "Estudiante TSU Informática",
        "Apasionado por el Backend",
        "Disponible para pasantías"
    ];
    let pIdx = 0, cIdx = 0, deleting = false;

    function type() {
        const word = phrases[pIdx];
        if (!deleting) {
            typingEl.textContent = word.slice(0, ++cIdx);
            if (cIdx === word.length) {
                deleting = true;
                setTimeout(type, 2200);
                return;
            }
        } else {
            typingEl.textContent = word.slice(0, --cIdx);
            if (cIdx === 0) {
                deleting = false;
                pIdx = (pIdx + 1) % phrases.length;
            }
        }
        setTimeout(type, deleting ? 42 : 88);
    }
    type();
}

// ====== SCROLL REVEAL ======
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 90);
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ====== ACTIVE NAV + SCROLL EFFECTS ======
// Solo activa el nav por scroll si hay secciones con anchor (#) en la página actual
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const navbar   = document.querySelector('.navbar');
const backTop  = document.getElementById('backTop');

window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Active nav (solo para links con anchor en la misma página)
    if (navLinks.length > 0) {
        let current = '';
        sections.forEach(s => {
            if (y >= s.offsetTop - 140) current = s.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    navbar.classList.toggle('scrolled', y > 60);
    if (backTop) backTop.classList.toggle('visible', y > 420);
}, { passive: true });

if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}