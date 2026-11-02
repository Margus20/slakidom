// ==========================================
// BUSCADOR DE PRODUCTOS
// ==========================================

export function inicializarBuscador() {
    const buscadorInput = document.getElementById('buscador-input');
    buscadorInput?.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        let visibles = 0;
        document.querySelectorAll('.producto-card').forEach(tarjeta => {
            if (tarjeta.dataset.nombre.includes(termino)) {
                tarjeta.classList.remove('oculto');
                visibles++;
            } else {
                tarjeta.classList.add('oculto');
            }
        });
        let sinResultados = document.querySelector('.sin-resultados');
        if (!sinResultados && document.getElementById("productos-grid")) {
            sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.textContent = 'No se encontraron productos ';
            document.getElementById("productos-grid").appendChild(sinResultados);
        }
        if (sinResultados) sinResultados.classList.toggle('visible', visibles === 0 && termino !== '');
    });
}
