// ==========================================
// LÓGICA DE DETALLE DE PRODUCTO (DINÁMICA Y UNIVERSAL)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si estamos en una página de detalle de producto
    const detalleSection = document.querySelector('.producto-detalle');
    if (!detalleSection) return; // Si no existe, salir sin hacer nada

    // 2. LEER LOS DATOS DIRECTAMENTE DEL HTML (¡Esto lo hace universal!)
    const productoId = parseInt(detalleSection.dataset.id);
    const productoNombre = detalleSection.dataset.nombre;
    const productoPrecio = parseFloat(detalleSection.dataset.precio);
    const productoImagen = detalleSection.dataset.imagen;

    // Selectores de elementos
    const btnRestar = detalleSection.querySelector('[data-accion="restar"]');
    const btnSumar = detalleSection.querySelector('[data-accion="sumar"]');
    const inputCantidad = detalleSection.querySelector('.input-cantidad');
    const btnAgregar = detalleSection.querySelector('.btn-agregar-carrito');
    const precioBsElement = document.getElementById('precio-bolivares');

    let cantidad = 1;
    let tasaBCV = 36.50; // Valor por defecto

    // 3. Función para formatear números
    function formatearNumero(numero) {
        return new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 }).format(numero);
    }

    // 4. Obtener tasa BCV
    async function obtenerTasa() {
        try {
            const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            const datos = await respuesta.json();
            tasaBCV = datos.precio || datos.promedio || 36.50;
            actualizarPrecio();
        } catch (error) {
            console.error('Error al obtener tasa:', error);
            actualizarPrecio();
        }
    }

    // 5. Actualizar el precio en pantalla usando el precio leído del HTML
    function actualizarPrecio() {
        const precioVES = Math.round(productoPrecio * tasaBCV);
        if (precioBsElement) {
            precioBsElement.textContent = `Bs. ${formatearNumero(precioVES)}`;
        }
    }

    // 6. Manejo de cantidad
    if (btnRestar) {
        btnRestar.addEventListener('click', () => {
            if (cantidad > 1) {
                cantidad--;
                if (inputCantidad) inputCantidad.value = cantidad;
            }
        });
    }

    if (btnSumar) {
        btnSumar.addEventListener('click', () => {
            if (cantidad < 50) {
                cantidad++;
                if (inputCantidad) inputCantidad.value = cantidad;
            }
        });
    }

    // 7. Agregar al carrito (¡Usando los datos dinámicos!)
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const producto = {
                id: productoId,
                nombre: productoNombre,
                precio: productoPrecio,
                cantidad: cantidad,
                imagen: productoImagen
            };
            
            let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const existe = carrito.find(item => item.id === producto.id);
            
            if (existe) {
                existe.cantidad += cantidad;
            } else {
                carrito.push(producto);
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            window.dispatchEvent(new Event('carritoActualizado'));
            
            alert(`✅ Agregaste ${cantidad} unidad(es) de ${productoNombre} al carrito`);
            
            // Resetear cantidad
            cantidad = 1;
            if (inputCantidad) inputCantidad.value = 1;
        });
    }

    // Inicializar
    obtenerTasa();
});
