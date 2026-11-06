// ==========================================
// LIGHTBOX PARA GALERÍAS DE PROCESO
// ==========================================

export function inicializarLightboxProceso() {
    const modal = document.getElementById('lightbox-modal');
    const imagenModal = modal?.querySelector('.lightbox-imagen');
    const btnCerrar = modal?.querySelector('.lightbox-cerrar');
    const btnAnterior = modal?.querySelector('.lightbox-anterior');
    const btnSiguiente = modal?.querySelector('.lightbox-siguiente');
    const contador = modal?.querySelector('.lightbox-contador');
    
    // Si no estamos en la página de proceso, no hacer nada
    if (!modal || !imagenModal) return;
    
    let fotosActuales = [];
    let indiceActual = 0;
    
    // ✅ Base de datos de fotos por etapa (Fácil de expandir en el futuro)
    const galerias = {
        seleccionamos: [
            'img/procesos/seleccionamos/foto1.jpg',
            'img/procesos/seleccionamos/foto2.jpg'
        ],
        preparamos: [
            'img/procesos/preparamos/foto1.jpg',
            'img/procesos/preparamos/foto2.jpg',
            'img/procesos/preparamos/foto3.jpg'
        ],
        horneamos: [
            'img/procesos/horneamos/foto1.jpg'
        ],
        empacamos: [
            'img/procesos/empacamos/foto1.jpg',
            'img/procesos/empacamos/foto2.jpg'
        ]
    };
    
    // ✅ Abrir modal al hacer clic en una mini galería
    document.querySelectorAll('.mini-galeria').forEach(galeria => {
        galeria.addEventListener('click', () => {
            const etapa = galeria.dataset.etapa;
            fotosActuales = galerias[etapa] || [];
            
            if (fotosActuales.length > 0) {
                indiceActual = 0;
                mostrarFoto(indiceActual);
                modal.classList.add('activo');
            }
        });
    });
    
    // ✅ Mostrar foto específica y actualizar contador
    function mostrarFoto(indice) {
        if (indice >= 0 && indice < fotosActuales.length) {
            imagenModal.src = fotosActuales[indice];
            contador.textContent = `${indice + 1} / ${fotosActuales.length}`;
        }
    }
    
    // ✅ Foto anterior (circular)
    btnAnterior?.addEventListener('click', () => {
        indiceActual = (indiceActual - 1 + fotosActuales.length) % fotosActuales.length;
        mostrarFoto(indiceActual);
    });
    
    // ✅ Foto siguiente (circular)
    btnSiguiente?.addEventListener('click', () => {
        indiceActual = (indiceActual + 1) % fotosActuales.length;
        mostrarFoto(indiceActual);
    });
    
    // ✅ Cerrar modal
    const cerrarModal = () => modal.classList.remove('activo');
    
    btnCerrar?.addEventListener('click', cerrarModal);
    
    // ✅ Cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });
    
    // ✅ Navegación con teclado (Flechas y ESC)
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('activo')) {
            if (e.key === 'Escape') cerrarModal();
            if (e.key === 'ArrowLeft') btnAnterior?.click();
            if (e.key === 'ArrowRight') btnSiguiente?.click();
        }
    });
    
    console.log('🖼️ [LIGHTBOX PROCESO]: Inicializado correctamente.');
}
