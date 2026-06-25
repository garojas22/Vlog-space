
// =============================================
// VLOG SPACE — index.js
// Gabriel Alejandro Rojas González
// =============================================

// ====== 1. ESTADO ACTIVO AUTOMÁTICO EN NAVBAR ======
// Detecta en qué archivo HTML se encuentra el navegador y activa el enlace correspondiente.
const currentPath = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll('.nav-link').forEach(link => {
    // Obtenemos el nombre del archivo del atributo href (ej: "sobremi.html")
    const linkPath = link.getAttribute('href').split('#')[0]; 
    if (linkPath === currentPath) {
        link.classList.add('active');
    }
});

// ====== 2. TYPING ANIMATION (MÁQUINA DE ESCRIBIR) ======
// Guard: solo se ejecuta si el elemento existe en la página actual (index.html)
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
                setTimeout(type, 2200); // Tiempo que se queda la palabra completa
                return;
            }
        } else {
            typingEl.textContent = word.slice(0, --cIdx);
            if (cIdx === 0) {
                deleting = false;
                pIdx = (pIdx + 1) % phrases.length; // Pasa a la siguiente frase
            }
        }
        setTimeout(type, deleting ? 42 : 88); // Velocidad al borrar o escribir
    }
    type();
}

// ====== 3. SCROLL REVEAL (APARICIÓN DE ELEMENTOS) ======
// Hace aparecer los elementos con la clase .reveal de forma escalonada al hacer scroll
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            // El delay multiplicando el índice (i * 90) crea el efecto de cascada
            setTimeout(() => e.target.classList.add('visible'), i * 90);
            revealObserver.unobserve(e.target); // Deja de observar una vez visible
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ====== 4. EFECTOS GLOBALES DE SCROLL ======
const sections = document.querySelectorAll('section[id]');
const navLinksAnchors = document.querySelectorAll('.nav-link[href^="#"]');
const navbar   = document.querySelector('.navbar');
const backTop  = document.getElementById('backTop');

window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Cambio estético de la Navbar al bajar scroll
    navbar.classList.toggle('scrolled', y > 60);
    
    // Mostrar/ocultar botón "Volver arriba"
    if (backTop) {
        backTop.classList.toggle('visible', y > 420);
    }

    // Navegación activa interna (solo para anchors '#' en la misma página)
    if (navLinksAnchors.length > 0) {
        let current = '';
        sections.forEach(s => {
            if (y >= s.offsetTop - 140) current = s.id;
        });
        navLinksAnchors.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }
}, { passive: true }); // passive: true mejora el rendimiento del scroll

// Evento para el botón de volver arriba
if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}