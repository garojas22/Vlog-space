/* =============================================
    VLOG SPACE — index.js
    Scroll reveal · Nav active · Back to top · Theme
   ============================================= */

// ── SCROLL REVEAL ────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── NAVBAR SCROLL ────────────────────────────
const navbar  = document.querySelector('.navbar');
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar)  navbar.classList.toggle('scrolled', y > 40);
    if (backTop) backTop.classList.toggle('visible', y > 400);

    // Nav link activo por sección (solo en index.html)
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');
    if (navLinks.length) {
        let current = '';
        sections.forEach(s => { if (y >= s.offsetTop - 100) current = s.id; });
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }
}, { passive: true });

// ── BACK TO TOP ───────────────────────────────
if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── THEME TOGGLE ──────────────────────────────
const THEME_KEY  = 'vlogspace-theme';
const html       = document.documentElement;
const toggleBtn  = document.getElementById('themeToggle');

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (toggleBtn) toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

// Aplica sin flash al cargar
html.style.transition = 'none';
applyTheme(getTheme());
requestAnimationFrame(() => { html.style.transition = ''; });

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    });
}

// Sincroniza si el usuario cambia el tema del SO (sin preferencia guardada)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
});