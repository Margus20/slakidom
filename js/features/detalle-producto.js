// ==========================================
// LÓGICA DE DETALLE DE PRODUCTO (DINÁMICA Y UNIVERSAL)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si estamos en una página de detalle de producto
    const detalleSection = document.querySelector('.producto-detalle');
    if (!detalleSection) return; // Si no existe, salir sin hacer nada (ahorra recursos)

    // 2. LEER LOS DATOS DIRECTAMENTE DEL HTML (¡Esto lo hace 100% universal!)
    const productoId = parseInt(detalleSection.dataset.id);
    const productoNombre = detalleSection.dataset.nombre;
    const productoPrecio = parseFloat(detalleSection.dataset.precio);
    const productoImagen = detalleSection.dataset.imagen;

    // Validación de seguridad: si falta algún dato, no ejecutamos
    if (!productoId || !productoNombre || isNaN(productoPrecio)) {
        console.warn('Faltan datos del producto en el HTML');
        return;
    }

    // Selectores de elementos dentro de esta sección específica
    const btnRestar = detalleSection.querySelector('[data-accion="restar"]');
    const btnSumar = detalleSection.querySelector('[data-accion="sumar"]');
    const inputCantidad = detalleSection.querySelector('.input-cantidad');
    const btnAgregar = detalleSection.querySelector('.btn-agregar-carrito');
    const precioBsElement = document.getElementById('precio-bolivares');

    let cantidad = 1;
    let tasaBCV = 36.50; // Valor de respaldo por defecto

    // 3. Función para formatear números al estilo venezolano (ej: 1.790)
    function formatearNumero(numero) {
        return new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 }).format(numero);
    }

    // 4. Obtener tasa BCV de la API
    async function obtenerTasa() {
        try {
            const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            if (!respuesta.ok) throw new Error('Error en la respuesta de la API');
            
            const datos = await respuesta.json();
            // La API puede devolver 'precio' o 'promedio', usamos el que exista
            tasaBCV = datos.precio || datos.promedio || 36.50;
            actualizarPrecio();
        } catch (error) {
            console.warn('No se pudo obtener la tasa BCV, usando valor de respaldo:', error);
            actualizarPrecio(); // Usa el valor de respaldo (36.50)
        }
    }

    // 5. Actualizar el precio en pantalla usando el precio leído del HTML
    function actualizarPrecio() {
        const precioVES = Math.round(productoPrecio * tasaBCV);
        if (precioBsElement) {
            precioBsElement.textContent = `Bs. ${formatearNumero(precioVES)}`;
        }
    }

    // 6. Manejo de cantidad (Restar)
    if (btnRestar && inputCantidad) {
        btnRestar.addEventListener('click', () => {
            if (cantidad > 1) {
                cantidad--;
                inputCantidad.value = cantidad;
            }
        });
    }

    // 7. Manejo de cantidad (Sumar)
    if (btnSumar && inputCantidad) {
        btnSumar.addEventListener('click', () => {
            if (cantidad < 50) {
                cantidad++;
                inputCantidad.value = cantidad;
            }
        });
    }

    // 8. Agregar al carrito (¡Usando los datos dinámicos del HTML!)
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            // Creamos el objeto producto con los datos leídos
            const producto = {
                id: productoId,
                nombre: productoNombre,
                precio: productoPrecio,
                cantidad: cantidad,
                imagen: productoImagen
            };
            
            // Leemos el carrito actual
            let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const existe = carrito.find(item => item.id === producto.id);
            
            // Si existe, sumamos la cantidad. Si no, lo agregamos nuevo.
            if (existe) {
                existe.cantidad += cantidad;
            } else {
                carrito.push(producto);
            }
            
            // Guardamos y notificamos al sistema global
            localStorage.setItem('carrito', JSON.stringify(carrito));
            window.dispatchEvent(new Event('carritoActualizado'));
            
            // Feedback al usuario
            alert(`✅ Agregaste ${cantidad} unidad(es) de ${productoNombre} al carrito`);
            
            // Resetear cantidad a 1 visualmente
            cantidad = 1;
            if (inputCantidad) inputCantidad.value = 1;
        });
    }

    // 9. Inicializar el proceso
    obtenerTasa();
});
