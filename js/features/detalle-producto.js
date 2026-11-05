// ==========================================
// LÓGICA DE DETALLE DE PRODUCTO (DEFINITIVO)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si estamos en una página de detalle de producto
    const detalleSection = document.querySelector('.producto-detalle');
    if (!detalleSection) return; // Si no existe, salir sin hacer nada

    // Selectores ajustados al HTML limpio
    const btnRestar = detalleSection.querySelector('[data-accion="restar"]');
    const btnSumar = detalleSection.querySelector('[data-accion="sumar"]');
    const inputCantidad = detalleSection.querySelector('.input-cantidad'); // ✅ CORREGIDO: ahora busca por clase
    const btnAgregar = detalleSection.querySelector('.btn-agregar-carrito'); // ✅ CORREGIDO: coincide con el HTML limpio
    const precioBsElement = document.getElementById('precio-bolivares');

    let cantidad = 1;
    let tasaBCV = 36.50; // Valor por defecto

    // 1. Función para formatear números
    function formatearNumero(numero) {
        return new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 }).format(numero);
    }

    // 2. Obtener tasa BCV
    async function obtenerTasa() {
        try {
            const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            const datos = await respuesta.json();
            tasaBCV = datos.precio || datos.promedio || 36.50;
            actualizarPrecio();
        } catch (error) {
            console.error('Error al obtener tasa:', error);
            actualizarPrecio(); // Usa el valor por defecto
        }
    }

    // 3. Actualizar el precio en pantalla
    function actualizarPrecio() {
        const precioUSD = 2.00; 
        const precioVES = Math.round(precioUSD * tasaBCV);
        if (precioBsElement) {
            precioBsElement.textContent = `Bs. ${formatearNumero(precioVES)}`;
        }
    }

    // 4. Manejo de cantidad
    if (btnRestar) {
        btnRestar.addEventListener('click', () => {
            if (cantidad > 1) {
                cantidad--;
                if (inputCantidad) inputCantidad.value = cantidad; // ✅ Ahora sí actualizará el input visualmente
            }
        });
    }

    if (btnSumar) {
        btnSumar.addEventListener('click', () => {
            if (cantidad < 50) {
                cantidad++;
                if (inputCantidad) inputCantidad.value = cantidad; // ✅ Ahora sí actualizará el input visualmente
            }
        });
    }

    // 5. Agregar al carrito
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const producto = {
                id: 1,
                nombre: "Galletas de Coco y Vainilla",
                precio: 2.00,
                cantidad: cantidad,
                imagen: "../img/galletas/coco_vainilla.jpg"
            };
            
            let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const existe = carrito.find(item => item.id === producto.id);
            
            if (existe) {
                existe.cantidad += cantidad;
            } else {
                carrito.push(producto);
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            // Actualizar contador global
            window.dispatchEvent(new Event('carritoActualizado'));
            
            alert(`✅ Agregaste ${cantidad} unidad(es) de Galletas de Coco y Vainilla al carrito`);
            
            // Resetear cantidad
            cantidad = 1;
            if (inputCantidad) inputCantidad.value = 1;
        });
    }

    // Inicializar
    obtenerTasa();
});
