// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

let carrito = [];
const NUMERO_WHATSAPP = "584122879803"; // Tu número

export function agregarAlCarrito(producto) {
    // Verificar si el producto ya está en el carrito
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    actualizarContadorCarrito();
    mostrarNotificacion(`¡${producto.nombre} agregado!`);
}

export function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? "flex" : "none";
    }
}

export function mostrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    const lista = document.getElementById("lista-carrito");
    const totalElement = document.getElementById("total-carrito");
    
    if (!modal || !lista) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<p style='text-align:center; padding: 20px;'>Tu carrito está vacío 🍪</p>";
        totalElement.textContent = "$0.00";
    } else {
        carrito.forEach((item, index) => {
            // Convertir precio a número para sumar (quitamos el signo $)
            const precioNumerico = parseFloat(item.precio.replace("$", ""));
            const subtotal = precioNumerico * item.cantidad;
            total += subtotal;

            const div = document.createElement("div");
            div.className = "item-carrito";
            div.innerHTML = `
                <div class="info-item">
                    <strong>${item.nombre}</strong>
                    <span>${item.cantidad} x ${item.precio}</span>
                </div>
                <button class="btn-eliminar" onclick="window.eliminarDelCarrito(${index})">🗑️</button>
            `;
            lista.appendChild(div);
        });
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    modal.classList.add("activo");
}

export function cerrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    if (modal) modal.classList.remove("activo");
}

export function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarContadorCarrito();
    mostrarCarritoModal(); // Refrescar la vista del modal
}

export function finalizarPedidoWhatsApp() {
    if (carrito.length === 0) return;

    let mensaje = "¡Hola SLAKIDOM! 🍪 Quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        const precioNumerico = parseFloat(item.precio.replace("$", ""));
        const subtotal = precioNumerico * item.cantidad;
        total += subtotal;
        mensaje += `▪️ ${item.cantidad} x ${item.nombre} (${item.precio})%0A`;
    });

    mensaje += `%0A💰 *Total a pagar: $${total.toFixed(2)}*`;
    mensaje += "%0A%0AQuedo atento a los datos de Pago Móvil para realizar la transferencia. ¡Gracias!";

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, "_blank");
}

// Hacer la función de eliminar accesible globalmente para el HTML
window.eliminarDelCarrito = eliminarDelCarrito;

function mostrarNotificacion(mensaje) {
    // Creamos una notificación flotante simple
    const notif = document.createElement("div");
    notif.className = "notificacion-flotante";
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add("mostrar");
    }, 10);
    
    setTimeout(() => {
        notif.classList.remove("mostrar");
        setTimeout(() => notif.remove(), 300);
    }, 2000);
               }
