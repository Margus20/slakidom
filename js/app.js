// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL
// ==========================================

import { cargarComponentes } from './components/header.js';
import { renderizarProductos } from './components/productos.js';
import { obtenerTasaBCV } from './utils/tasa.js';
import { formatearConPuntosDeMil } from './utils/helpers.js';
import { PRODUCTOS } from './config.js';
import { inicializarCarrito, mostrarCarritoModal } from './features/carrito.js';
import { inicializarMenus } from './features/menu.js';
import { inicializarSelectorMoneda } from './features/moneda.js';
import { inicializarBuscador } from './features/buscador.js';
import { iniciarEfectoNieve } from './features/nieve.js';

// Iniciar carga de componentes
cargarComponentes();

document.addEventListener('componentesListos', () => {
    console.log('🌟 [APP]: Componentes cargados. Iniciando aplicación...');
    
    // ✅ Inicializar todas las características
    inicializarCarrito();
    inicializarMenus();
    inicializarSelectorMoneda();
    inicializarBuscador();
    iniciarEfectoNieve();
    
    // Configurar modal del carrito
    const modalCarrito = document.getElementById('modal-carrito');
    const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
    
    document.querySelectorAll('.abrir-modal-carrito').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            mostrarCarritoModal(); 
        });
    });
    
    btnCerrarCarrito?.addEventListener('click', () => modalCarrito?.classList.remove('activo'));
    modalCarrito?.addEventListener('click', (e) => { if (e.target === modalCarrito) modalCarrito.classList.remove('activo'); });
    document.getElementById('btn-finalizar-pedido')?.addEventListener('click', window.finalizarPedidoWhatsApp);

    // Cargar tasa y renderizar productos
    (async () => {
        const tasaCambio = await obtenerTasaBCV();
        const tasaInfo = document.getElementById('tasaBcvInfo');
        if (tasaInfo) tasaInfo.textContent = `Tasa BCV: Bs. ${formatearConPuntosDeMil(tasaCambio)} por $`;
        
        const path = window.location.pathname;
        let productosAMostrar = PRODUCTOS;

        if (path.includes('/galletas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'galletas');
        } else if (path.includes('/mermeladas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'mermeladas');
        }

        renderizarProductos(productosAMostrar, tasaCambio);
    })();

    console.log('🎉 [APP]: ¡Sistema SLAKIDOM activo y listo!');
});
