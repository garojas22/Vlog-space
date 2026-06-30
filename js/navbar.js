/* =============================================
   navbar.js — Scroll effect + nav link activo
   ============================================= */

export function initNavbar() {
    const navbar  = document.querySelector('.navbar');
    const backTop = document.getElementById('backTop');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;

        // Borde inferior al scrollear
        if (navbar) navbar.classList.toggle('scrolled', y > 40);

        // Botón back to top
        if (backTop) backTop.classList.toggle('visible', y > 400);

        // Nav link activo por sección (solo funciona con anchors # en la misma página)
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        if (navLinks.length) {
            let current = '';
            sections.forEach(s => { if (y >= s.offsetTop - 100) current = s.id; });
            navLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + current);
            });
        }
    }, { passive: true });

    // Back to top click
    if (backTop) {
        backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}
