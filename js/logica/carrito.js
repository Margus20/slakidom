// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS (carrito.js)
// ==========================================

const NUMERO_WHATSAPP = "584122879803";

// ✅ 1. Inicializar el carrito desde localStorage (Fuente de verdad)
let carrito = JSON.parse(localStorage.getItem('slakidom_carrito') || '[]');

export function inicializarCarrito() {
    actualizarContadorCarrito();
    
    // ✅ 2. Escuchar los clics en los botones "Agregar" generados por app.js
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = e.target.closest('.producto-card');
            if (!card) return;
            
            // Leer datos del HTML
            const producto = {
                id: parseInt(card.dataset.id),
                nombre: card.dataset.nombre.charAt(0).toUpperCase() + card.dataset.nombre.slice(1),
                precio: parseFloat(card.dataset.precio), // ✅ Precio como número
                imagen: card.dataset.imagen || ''
            };
            
            agregarAlCarrito(producto);
        }
    });

    // Hacer funciones accesibles globalmente para los botones del HTML (modal)
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.cerrarCarritoModal = cerrarCarritoModal;
    window.finalizarPedidoWhatsApp = finalizarPedidoWhatsApp;
}

export function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    
    // ✅ Disparar evento para que el modal (si está abierto) se actualice
    window.dispatchEvent(new Event('carritoActualizado'));
    
    mostrarNotificacion(`¡${producto.nombre} agregado!`);
}

function guardarCarrito() {
    localStorage.setItem('slakidom_carrito', JSON.stringify(carrito));
}

export function actualizarContadorCarrito() {
    // ✅ Busca tanto el contador del header como el flotante de Excalibur
    const contadores = document.querySelectorAll('#contador-carrito, #contador-carrito-flotante');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    contadores.forEach(contador => {
        if (contador) {
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

export function mostrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    const lista = document.getElementById("lista-carrito");
    const totalElement = document.getElementById("total-carrito");
    
    if (!modal || !lista) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<p style='text-align:center; padding: 20px; color: #666;'>Tu carrito está vacío 🍪</p>";
        if (totalElement) totalElement.textContent = "$0.00";
    } else {
        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad; // ✅ Precio ya es número
            total += subtotal;

            // ✅ Construir ruta de imagen correcta para el modal
            const path = window.location.pathname;
            const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
            const imgBasePath = isSubfolder ? '../' : '';
            const imgSrc = item.imagen ? `${imgBasePath}${item.imagen}` : `${imgBasePath}img/slaky_cuadrado.jpg`;

            const div = document.createElement("div");
            div.className = "item-carrito";
            div.style.cssText = "display:flex; align-items:center; gap:15px; padding:15px 0; border-bottom:1px solid #eee;";
            div.innerHTML = `
                <img src="${imgSrc}" alt="${item.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; background:#fff;">
                <div style="flex:1;">
                    <strong style="display:block; font-size:0.95rem; color:#333;">${item.nombre}</strong>
                    <span style="font-size:0.85rem; color:#666;">${item.cantidad} x $${item.precio.toFixed(2)}</span>
                </div>
                <div style="text-align:right;">
                    <p style="margin:0; font-weight:bold; color:var(--chocolate, #5D4037);">$${subtotal.toFixed(2)}</p>
                    <button onclick="window.eliminarDelCarrito(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:0.8rem; margin-top:5px; text-decoration:underline;">Eliminar</button>
                </div>
            `;
            lista.appendChild(div);
        });
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    modal.classList.add("activo");
}

export function cerrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    if (modal) modal.classList.remove("activo");
}

export function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarritoModal(); // Refrescar la vista del modal
}

export function finalizarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let mensaje = "¡Hola SLAKIDOM! 🍪 Quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `▪️ ${item.cantidad} x ${item.nombre} - $${subtotal.toFixed(2)}%0A`;
    });

    mensaje += `%0A💰 *Total a pagar: $${total.toFixed(2)}*`;
    mensaje += "%0A%0AQuedo atento a los datos de Pago Móvil para realizar la transferencia. ¡Gracias!";

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, "_blank");
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement("div");
    notif.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--chocolate, #5D4037); color:white; padding:12px 20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2); z-index:9999; opacity:0; transform:translateY(20px); transition:all 0.3s ease; font-weight:bold;";
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    // Forzar reflow para la animación
    setTimeout(() => {
        notif.style.opacity = "1";
        notif.style.transform = "translateY(0)";
    }, 10);
    
    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(20px)";
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}
