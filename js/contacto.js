/*
 * contacto.js — Lógica del formulario de contacto
 *
 * ¿Qué hace este archivo?
 * Escucha cuando el usuario presiona "Enviar",
 * toma los datos del formulario, los manda a la
 * API de Python via fetch() y muestra el resultado.
 *
 * fetch() es la función nativa de JS para hacer
 * peticiones HTTP — es como el "mensajero" entre
 * el formulario y la API de Python.
 */

// URL de la API — en desarrollo apunta a local,
// en producción apunta a Railway.
// Cambiar esta URL cuando la API esté deployada en Railway.
const API_URL = "http://localhost:8000/contacto";

export function initContacto() {

    // Buscar el botón de enviar en el DOM
    const btn     = document.getElementById("form-submit");
    const estado  = document.getElementById("form-estado");

    // Si no existe el formulario en esta página,
    // no hacer nada (evita errores en sobremi y proyectos)
    if (!btn) return;

    btn.addEventListener("click", async () => {

        // Leer los valores del formulario
        const nombre  = document.getElementById("form-nombre").value.trim();
        const email   = document.getElementById("form-email").value.trim();
        const mensaje = document.getElementById("form-mensaje").value.trim();

        // Validación básica antes de llamar a la API
        if (!nombre || !email || !mensaje) {
            mostrarEstado("error", "⚠ Por favor completa todos los campos.");
            return;
        }

        // Mostrar estado de carga y deshabilitar el botón
        // para evitar envíos duplicados
        setLoading(true);
        ocultarEstado();

        try {
            /*
             * fetch() hace la petición POST a la API de Python.
             * POST porque estamos ENVIANDO datos (no solo leyendo).
             *
             * El body convierte el objeto JS a JSON —
             * el formato que la API de Python espera recibir.
             */
            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre, email, mensaje })
            });

            // Convertir la respuesta de la API a objeto JS
            const datos = await respuesta.json();

            if (respuesta.ok) {
                // Todo salió bien — mostrar mensaje de éxito
                mostrarEstado("exito", `✓ ${datos.mensaje}`);
                limpiarFormulario();
            } else {
                // La API respondió pero con error controlado
                mostrarEstado("error", `✗ ${datos.detail}`);
            }

        } catch (err) {
            /*
             * Si llegamos aquí, hubo un error de red —
             * la API no respondió (puede estar caída o
             * la URL está mal configurada)
             */
            console.error("Error de conexión:", err);
            mostrarEstado(
                "error",
                "✗ No se pudo conectar con el servidor. Intenta por email directo."
            );
        } finally {
            // Siempre re-habilitar el botón al terminar
            setLoading(false);
        }
    });
}

/* ── FUNCIONES AUXILIARES ────────────────────────── */

// Muestra u oculta el spinner del botón
function setLoading(cargando) {
    const btn     = document.getElementById("form-submit");
    const texto   = document.getElementById("btn-texto");
    const spinner = document.getElementById("btn-spinner");
    btn.disabled     = cargando;
    texto.style.display   = cargando ? "none"   : "inline";
    spinner.style.display = cargando ? "inline" : "none";
}

// Muestra el mensaje de estado (éxito o error)
function mostrarEstado(tipo, mensaje) {
    const el = document.getElementById("form-estado");
    el.className  = `form-estado ${tipo}`;
    el.textContent = mensaje;
    el.style.display = "block";
}

// Oculta el mensaje de estado
function ocultarEstado() {
    const el = document.getElementById("form-estado");
    el.style.display = "none";
}

// Limpia los campos del formulario tras envío exitoso
function limpiarFormulario() {
    document.getElementById("form-nombre").value  = "";
    document.getElementById("form-email").value   = "";
    document.getElementById("form-mensaje").value = "";
}
