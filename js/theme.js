/* =============================================
    theme.js — Dark / Light mode
   ============================================= */

const STORAGE_KEY = 'vlogspace-theme';
const html        = document.documentElement;

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function getTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export function initTheme() {
    // Aplica sin flash al cargar
    html.style.transition = 'none';
    applyTheme(getTheme());
    requestAnimationFrame(() => { html.style.transition = ''; });

    // Botón toggle
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
        });
    }

    // Sincroniza si el usuario cambia el tema del SO (sin preferencia guardada)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
}
