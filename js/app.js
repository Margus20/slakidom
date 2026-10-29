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
    
    // 2. Renderizar productos dinámicamente con el NUEVO estilo EPA
    const gridProductos = document.getElementById("productos-grid");
    if (gridProductos) {
        gridProductos.innerHTML = ""; // Limpiar el "Cargando..."
        
        PRODUCTOS.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            
            // Si no hay imagen real, usamos un placeholder con emoji
            const imagenHTML = producto.imagen.includes("placeholder") || !producto.imagen
                ? `<div class="producto-img-placeholder">🍪</div>` 
                : `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="producto-img-placeholder" style="display:none;">🍪</div>`;

            // ✅ Separar el precio para el estilo EPA (Ej: 3.50 -> entero: 3, decimales: .50)
            // Maneja tanto números (3.50) como strings ("$3.50") de forma segura
            const precioLimpio = String(producto.precio).replace(/[^0-9.]/g, '');
            const precioFormateado = parseFloat(precioLimpio).toFixed(2);
            const partesPrecio = precioFormateado.split('.');
            const entero = partesPrecio[0];
            const decimales = '.' + partesPrecio[1];
            
            // Enlace a la página individual (usa el del dato o genera uno por defecto)
            const enlaceProducto = producto.enlace || `producto.html?id=${producto.id}`;

            // ✅ HTML actualizado: Descripción como enlace y precio dividido en 3 partes
            card.innerHTML = `
                ${imagenHTML}
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">
                    <a href="${enlaceProducto}" title="Ver detalles de ${producto.nombre}">${producto.descripcion}</a>
                </p>
                <div class="producto-precio">
                    <span class="simbolo">$</span>
                    <span class="entero">${entero}</span>
                    <span class="decimales">${decimales}</span>
                </div>
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

    // ✅ 3. Conectar botones del modal del carrito
    // Seleccionamos TODOS los elementos que deben abrir el carrito (header, flotante y cualquier otro con la clase)
    const botonesAbrirCarrito = document.querySelectorAll('#btn-ver-carrito, .btn-flotante-excalibur, .abrir-modal-carrito');
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const btnFinalizar = document.getElementById("btn-finalizar-pedido");

    // Asignar el evento a todos los botones de abrir
    botonesAbrirCarrito.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Evita que la página salte si es un enlace <a>
            mostrarCarritoModal();
        });
    });

    // Asignar eventos de cerrar y finalizar
    if (btnCerrarCarrito) {
        btnCerrarCarrito.addEventListener("click", cerrarCarritoModal);
    }
    
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", finalizarPedidoWhatsApp);
    }
    
    // ✅ Extra: Cerrar el modal si se hace clic fuera del contenido (en el fondo oscuro)
    const modalCarrito = document.getElementById("modal-carrito");
    if (modalCarrito) {
        modalCarrito.addEventListener("click", (e) => {
            if (e.target === modalCarrito) {
                cerrarCarritoModal();
            }
        });
    }
    
    console.log('🎉 SLAKIDOM - Sistema de carrito y productos activo');
});
