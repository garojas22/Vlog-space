/* =============================================
    index.js — Punto de entrada
    Importa e inicializa todos los módulos JS
   ============================================= */

import { initReveal } from './reveal.js';
import { initNavbar  } from './navbar.js';
import { initTheme   } from './theme.js';

initReveal();
initNavbar();
initTheme();
