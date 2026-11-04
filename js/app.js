// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

import { cargarComponentes } from './components/header.js';
import { renderizarProductos } from './components/productos.js';
import { obtenerTasaBCV } from './utils/tasa.js';
import { formatearConPuntosDeMil } from './utils/helpers.js';
import { PRODUCTOS } from './config.js';

// CORRECCION: Importar funciones del carrito directamente para evitar usar window
import { inicializarCarrito, mostrarCarritoModal, finalizarPedidoWhatsApp } from './features/carrito.js';

import { inicializarMenus } from './features/menu.js';
import { inicializarSelectorMoneda } from './features/moneda.js';
import { inicializarBuscador } from './features/buscador.js';
import { iniciarEfectoNieve } from './features/nieve.js';
import { inicializarAnimaciones, animarCardsDeProductos } from './features/animaciones.js';

// NUEVO: Importar la funcion del slider
import { inicializarSlider } from './features/slider.js';

// 1. Iniciar carga de componentes (Header y Footer)
cargarComponentes();

// 2. Esperar a que el HTML dinamico este listo en el DOM
document.addEventListener('componentesListos', () => {
    console.log('[APP]: Componentes cargados. Iniciando aplicacion...');
    
    // Inicializar todas las caracteristicas independientes
    inicializarCarrito();
    inicializarMenus();
    inicializarSelectorMoneda();
    inicializarBuscador();
    iniciarEfectoNieve();
    inicializarAnimaciones(); 
    inicializarSlider();      
    
    // 3. Configurar eventos del Modal del Carrito
    const modalCarrito = document.getElementById('modal-carrito');
    const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
    const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');
    
    // Abrir modal
    document.querySelectorAll('.abrir-modal-carrito').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            mostrarCarritoModal(); 
        });
    });
    
    // Cerrar modal con el boton X
    btnCerrarCarrito?.addEventListener('click', () => {
        modalCarrito?.classList.remove('activo');
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modalCarrito?.addEventListener('click', (e) => { 
        if (e.target === modalCarrito) {
            modalCarrito.classList.remove('activo');
        }
    });

    // CORRECCION: Usar la funcion importada
    btnFinalizarPedido?.addEventListener('click', (e) => {
        e.preventDefault();
        finalizarPedidoWhatsApp();
    });

    // 4. Cargar datos y renderizar el catalogo
    (async () => {
        try {
            const tasaCambio = await obtenerTasaBCV();
            
            const tasaInfo = document.getElementById('tasaBcvInfo');
            if (tasaInfo) {
                tasaInfo.textContent = 'Tasa BCV: Bs. ' + formatearConPuntosDeMil(tasaCambio) + ' por $';
            }
            
            const path = window.location.pathname;
            let productosAMostrar = PRODUCTOS;

            if (path.includes('/galletas/')) {
                productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'galletas');
            } else if (path.includes('/mermeladas/')) {
                productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'mermeladas');
            }

            renderizarProductos(productosAMostrar, tasaCambio);
            animarCardsDeProductos();
            
        } catch (error) {
            console.error('[APP]: Error critico al iniciar el catalogo:', error);
        }
    })();

    console.log('[APP]: Sistema SLAKIDOM activo y listo!');
});
