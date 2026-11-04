// ==========================================
// LÓGICA DEL CARRITO DE COMPRAS
// ==========================================

const NUMERO_WHATSAPP = "584122879803";
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

export function inicializarCarrito() {
    console.log('🛒 [CARRITO]: Inicializando... Productos actuales:', carrito.length);
    actualizarContadorCarrito();
    
    // ✅ Delegación de eventos para botones "Agregar" dinámicos
    document.addEventListener('click', manejarClickAgregar);
    
    // ✅ Delegación de eventos para botones "Eliminar" dentro del modal
    document.addEventListener('click', manejarClickEliminar);
    
    // Escuchar actualizaciones desde otras partes (ej. páginas individuales)
    window.addEventListener('carritoActualizado', () => {
        carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        actualizarContadorCarrito();
    });
}

function manejarClickAgregar(e) {
    if (e.target.classList.contains('btn-agregar-carrito')) {
        e.preventDefault();
        e.stopPropagation(); 
        
        const card = e.target.closest('.producto-card');
        if (!card) return;
        
        const producto = {
            id: parseInt(card.dataset.id),
            nombre: card.dataset.nombre.charAt(0).toUpperCase() + card.dataset.nombre.slice(1),
            precio: parseFloat(card.dataset.precio),
            imagen: card.dataset.imagen || '',
            cantidad: 1
        };
        
        console.log('🛒 [CARRITO]: Agregando producto:', producto);
        agregarAlCarrito(producto);
    }
}

function manejarClickEliminar(e) {
    // Detectar si se hizo clic en el botón de eliminar del modal
    if (e.target.classList.contains('btn-eliminar')) {
        e.preventDefault();
        const index = parseInt(e.target.dataset.index);
        if (!isNaN(index)) {
            eliminarDelCarrito(index);
        }
    }
}

function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push(producto);
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    window.dispatchEvent(new Event('carritoActualizado'));
    mostrarNotificacion(`¡${producto.nombre} agregado al carrito!`);
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    const contadores = document.querySelectorAll('#contador-carrito, #contador-carrito-flotante');
    contadores.forEach(contador => {
        if (contador) {
            contador.textContent = totalItems;
            // Usamos clases en lugar de style.display
            if (totalItems > 0) {
                contador.classList.add('activo');
                contador.style.display = 'flex'; // Mantenemos flex solo si la clase no lo garantiza
            } else {
                contador.classList.remove('activo');
                contador.style.display = 'none';
            }
        }
    });
}

export function mostrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    const lista = document.getElementById("lista-carrito");
    const totalElement = document.getElementById("total-carrito");
    
    if (!modal || !lista) {
        console.error('❌ [CARRITO]: No se encontró el modal o la lista');
        return;
    }

    carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<p class='carrito-vacio'>Tu carrito está vacío 🍪</p>";
        if (totalElement) totalElement.textContent = "$0.00";
    } else {
        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const path = window.location.pathname;
            const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
            const imgBasePath = isSubfolder ? '../' : '';
            const imgSrc = item.imagen ? `${imgBasePath}${item.imagen}` : `${imgBasePath}img/slaky_cuadrado.jpg`;

            // ✅ CONSTRUCCIÓN LIMPIA DEL DOM SIN ESTILOS INLINE
            const div = document.createElement("div");
            div.className = "item-carrito"; // Clase ya definida en 10-animaciones.css

            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = item.nombre;
            // La clase .resultado-item img o estilos generales de img en el modal pueden aplicarse aquí
            
            const infoDiv = document.createElement("div");
            infoDiv.className = "info-item"; // Clase ya definida en 10-animaciones.css

            const strong = document.createElement("strong");
            strong.textContent = item.nombre;

            const span = document.createElement("span");
            span.textContent = `${item.cantidad} x $${item.precio.toFixed(2)}`;

            infoDiv.appendChild(strong);
            infoDiv.appendChild(span);

            const accionesDiv = document.createElement("div");
            accionesDiv.className = "acciones-carrito";
            accionesDiv.style.textAlign = "right"; // Único estilo inline aceptable para layout específico

            const precioP = document.createElement("p");
            precioP.className = "precio-subtotal";
            precioP.textContent = `$${subtotal.toFixed(2)}`;

            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn-eliminar"; // Clase ya definida en 10-animaciones.css
            btnEliminar.textContent = "Eliminar";
            btnEliminar.dataset.index = index; // Guardamos el índice para la delegación

            accionesDiv.appendChild(precioP);
            accionesDiv.appendChild(btnEliminar);

            div.appendChild(img);
            div.appendChild(infoDiv);
            div.appendChild(accionesDiv);
            
            lista.appendChild(divPY);
        });
        
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    modal.classList.add("activo");
}

export function cerrarCarritoModal() {
    const modal = document.getElementById("modal-carrito");
    if (modal) modal.classList.remove("activo");
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarritoModal(); // Re-renderizar el modal
}

export function finalizarPedidoWhatsApp() {
    carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío");
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

export function mostrarNotificacion(mensaje) {
    // Evitar múltiples notificaciones apiladas
    const existente = document.querySelector('.notificacion-flotante.mostrar');
    if (existente) existente.remove();

    const notif = document.createElement("div");
    // ✅ REUTILIZAMOS LA CLASE QUE YA EXISTE EN 10-animaciones.css
    notif.className = "notificacion-flotante";
    notif.innerHTML = `<span>✅</span> ${mensaje}`;
    
    document.body.appendChild(notif);
    
    // Forzar reflow para que la transición CSS funcione
    requestAnimationFrame(() => {
        notif.classList.add('mostrar');
    });
    
    // Desaparecer automáticamente (3s + 0.3s de transición de salida)
    setTimeout(() => {
        notif.classList.remove('mostrar');
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 300);
    }, 3000);
}
