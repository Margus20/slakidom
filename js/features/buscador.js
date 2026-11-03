// ==========================================
// BUSCADOR DE PRODUCTOS
// ==========================================

// Función auxiliar para eliminar tildes y hacer la búsqueda más flexible
function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function inicializarBuscador() {
    const buscadorInput = document.getElementById('buscador-input');
    const productosGrid = document.getElementById('productos-grid');

    if (!buscadorInput || !productosGrid) {
        console.warn('⚠️ [BUSCADOR]: No se encontró el input de búsqueda o el grid de productos en esta página.');
        return;
    }

    console.log('🔍 [BUSCADOR]: Inicializado correctamente y escuchando eventos.');

    buscadorInput.addEventListener('input', (e) => {
        const termino = normalizarTexto(e.target.value);
        let visibles = 0;

        // Obtenemos las tarjetas en el momento del evento (por si se renderizaron después)
        const tarjetas = document.querySelectorAll('.producto-card');
        
        tarjetas.forEach(tarjeta => {
            // Obtenemos el nombre del dataset y lo normalizamos para comparar
            const nombreProducto = normalizarTexto(tarjeta.dataset.nombre || '');
            
            if (nombreProducto.includes(termino)) {
                tarjeta.classList.remove('oculto');
                visibles++;
            } else {
                tarjeta.classList.add('oculto');
            }
        });

        // Manejo del mensaje "Sin resultados"
        let sinResultados = productosGrid.querySelector('.sin-resultados');
        
        if (!sinResultados) {
            sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.textContent = 'No se encontraron productos que coincidan con tu búsqueda. 🍪';
            productosGrid.appendChild(sinResultados);
        }

        // Mostrar u ocultar el mensaje según corresponda
        if (termino !== '' && visibles === 0) {
            sinResultados.classList.add('visible');
        } else {
            sinResultados.classList.remove('visible');
        }
    });
}
