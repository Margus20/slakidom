// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

import { inicializarMenu } from './logica/menu.js';
import { inicializarAnimaciones } from './logica/animaciones.js';
import { PRODUCTOS } from './datos/productos.js';
import { 
    agregarAlCarrito, 
    actualizarContadorCarrito, 
    mostrarCarritoModal, 
    cerrarCarritoModal, 
    finalizarPedidoWhatsApp 
} from './logica/carrito.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🍪 SLAKIDOM - Iniciando módulos...');
    
    // 1. Inicializar funcionalidades base
    inicializarMenu();
    inicializarAnimaciones();
    actualizarContadorCarrito();
    
    // 2. Renderizar productos dinámicamente desde el archivo de datos
    const gridProductos = document.getElementById("productos-grid");
    if (gridProductos) {
        gridProductos.innerHTML = ""; // Limpiar el "Cargando..."
        
        PRODUCTOS.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            
            // Si no hay imagen real, usamos un placeholder con emoji
            const imagenHTML = producto.imagen.includes("placeholder") 
                ? `<div class="producto-img-placeholder">🍪</div>` 
                : `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="producto-img-placeholder" style="display:none;">🍪</div>`;

            card.innerHTML = `
                ${imagenHTML}
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <span class="producto-precio">${producto.precio}</span>
                <button class="btn-agregar-carrito" data-id="${producto.id}">
                    🛒 Agregar al pedido
                </button>
            `;
            
            // Evento para agregar al carrito
            const btnAgregar = card.querySelector(".btn-agregar-carrito");
            btnAgregar.addEventListener("click", () => {
                agregarAlCarrito(producto);
            });
            
            gridProductos.appendChild(card);
        });
    }

    // 3. Conectar botones del modal del carrito
    const btnVerCarrito = document.getElementById("btn-ver-carrito");
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const btnFinalizar = document.getElementById("btn-finalizar-pedido");

    if (btnVerCarrito) btnVerCarrito.addEventListener("click", mostrarCarritoModal);
    if (btnCerrarCarrito) btnCerrarCarrito.addEventListener("click", cerrarCarritoModal);
    if (btnFinalizar) btnFinalizar.addEventListener("click", finalizarPedidoWhatsApp);
    
    console.log('🎉 SLAKIDOM - Sistema de carrito y productos activo');
});
