// ==========================================
// LOGICA DEL CARRITO DE COMPRAS
// ==========================================

const NUMERO_WHATSAPP = "584122879803";
const CART_KEY = 'slakidom_carrito';          // ✅ Clave única para no cruzarse con otros proyectos
const CART_TIME_KEY = 'slakidom_carrito_time'; // ✅ Clave para guardar la hora de la última actualización
const EXPIRATION_HOURS = 12;                   // ✅ El carrito se borra automáticamente después de 12 horas

// ✅ Función para obtener el carrito verificando si ya expiró
function obtenerCarrito() {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedTime = localStorage.getItem(CART_TIME_KEY);

    if (savedCart && savedTime) {
        const now = Date.now();
        const expirationTime = parseInt(savedTime, 10) + (EXPIRATION_HOURS * 60 * 60 * 1000);

        if (now > expirationTime) {
            // El tiempo expiró, limpiamos el carrito
            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(CART_TIME_KEY);
            console.log('[CARRITO]: Carrito expirado (más de 12 horas) y limpiado automáticamente.');
            return [];
        }
        return JSON.parse(savedCart);
    }
    return [];
}

// Inicializamos el carrito con la función segura
let carrito = obtenerCarrito();

export function inicializarCarrito() {
    console.log('[CARRITO]: Inicializando... Productos actuales:', carrito.length);
    actualizarContadorCarrito();
    
    // Delegacion de eventos para botones "Agregar" dinamicos
    document.addEventListener('click', manejarClickAgregar);
    
    // Delegacion de eventos para botones "Eliminar" dentro del modal
    document.addEventListener('click', manejarClickEliminar);
    
    // Escuchar actualizaciones desde otras partes
    window.addEventListener('carritoActualizado', () => {
        carrito = obtenerCarrito();
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
        
        console.log('[CARRITO]: Agregando producto:', producto);
        agregarAlCarrito(producto);
    }
}

function manejarClickEliminar(e) {
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
    mostrarNotificacion('¡Producto agregado al carrito!');
}

function guardarCarrito() {
    // ✅ Guardamos el carrito Y la hora actual para controlar la expiración
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    localStorage.setItem(CART_TIME_KEY, Date.now().toString());
}

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    const contadores = document.querySelectorAll('#contador-carrito, #contador-carrito-flotante');
    contadores.forEach(contador => {
        if (contador) {
            contador.textContent = totalItems;
            if (totalItems > 0) {
                contador.classList.add('activo');
                contador.style.display = 'flex';
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
        console.error('[CARRITO]: No se encontro el modal o la lista');
        return;
    }

    // ✅ Usamos la función segura para leer el carrito
    carrito = obtenerCarrito();
    lista.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<p class='carrito-vacio'>Tu carrito esta vacio.</p>";
        if (totalElement) totalElement.textContent = "$0.00";
    } else {
        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const path = window.location.pathname;
            const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
            const imgBasePath = isSubfolder ? '../' : '';
            const imgSrc = item.imagen ? `${imgBasePath}${item.imagen}` : `${imgBasePath}img/slaky_cuadrado.jpg`;

            const div = document.createElement("div");
            div.className = "item-carrito";

            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = item.nombre;
            
            const infoDiv = document.createElement("div");
            infoDiv.className = "info-item";

            const strong = document.createElement("strong");
            strong.textContent = item.nombre;

            const span = document.createElement("span");
            span.textContent = `${item.cantidad} x $${item.precio.toFixed(2)}`;

            infoDiv.appendChild(strong);
            infoDiv.appendChild(span);

            const accionesDiv = document.createElement("div");
            accionesDiv.className = "acciones-carrito";
            accionesDiv.style.textAlign = "right";

            const precioP = document.createElement("p");
            precioP.className = "precio-subtotal";
            precioP.textContent = `$${subtotal.toFixed(2)}`;

            const btnEliminar = document.createElement("button");
            btnEliminar.className = "btn-eliminar";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.dataset.index = index;

            accionesDiv.appendChild(precioP);
            accionesDiv.appendChild(btnEliminar);

            div.appendChild(img);
            div.appendChild(infoDiv);
            div.appendChild(accionesDiv);
            
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

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarritoModal();
}

export function finalizarPedidoWhatsApp() {
    carrito = obtenerCarrito();
    
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito esta vacio");
        return;
    }

    let mensaje = "Hola SLAKIDOM! Quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `- ${item.cantidad} x ${item.nombre} - $${subtotal.toFixed(2)}%0A`;
    });

    mensaje += `%0A*Total a pagar: $${total.toFixed(2)}*`;
    mensaje += "%0A%0AQuedo atento a los datos de Pago Movil para realizar la transferencia. Gracias!";

    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, "_blank");
}

export function mostrarNotificacion(mensaje) {
    const existente = document.querySelector('.notificacion-flotante.mostrar');
    if (existente) existente.remove();

    const notif = document.createElement("div");
    notif.className = "notificacion-flotante";
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    requestAnimationFrame(() => {
        notif.classList.add('mostrar');
    });
    
    setTimeout(() => {
        notif.classList.remove('mostrar');
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 300);
    }, 3000);
}
