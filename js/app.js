// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

import { inicializarMenu } from './logica/menu.js';
import { inicializarAnimaciones } from './logica/animaciones.js';
import { PRODUCTOS } from './datos/productos.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🍪 SLAKIDOM - Iniciando módulos...');
    
    // 1. Inicializar el menú
    inicializarMenu();
    
    // 2. Inicializar animaciones y scroll
    inicializarAnimaciones();
    
    // 3. (Opcional/Futuro) Aquí podrías usar el array PRODUCTOS 
    // para generar el HTML de las tarjetas automáticamente.
    console.log('✅ Productos cargados en memoria:', PRODUCTOS.length);
    
    console.log('🎉 SLAKIDOM - Página cargada y módulos activos correctamente');
});
