// ==========================================
// ANIMACIONES Y SCROLL
// ==========================================

export function inicializarAnimaciones() {
    // ✅ OPTIMIZACIÓN 1: Delegación de eventos.
    // En lugar de buscar los enlaces al inicio (cuando el header quizás aún no cargó),
    // escuchamos los clics en todo el documento. Así funciona siempre, incluso con carga dinámica.
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return; // Si no es un enlace con #, ignorar

        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return; // Ignorar enlaces vacíos
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            
            // ✅ OPTIMIZACIÓN 2: Compensar la altura del header sticky
            const header = document.querySelector('.header');
            const headerOffset = header ? header.offsetHeight : 0;
            
            // Calculamos la posición exacta restando la altura del header y un pequeño margen (20px)
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
}

// ✅ OPTIMIZACIÓN 3: Usar clases CSS en lugar de estilos inline para la animación
export function animarCardsDeProductos() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // En lugar de modificar estilos inline, agregamos una clase
                entry.target.classList.add('card-visible');
                observer.unobserve(entry.target); // Dejar de observar para ahorrar rendimiento
            }
        });
    }, { threshold: 0.1 });

    // Aplicar la clase inicial a las cards que ya existen en el DOM
    document.querySelectorAll('.producto-card').forEach(card => {
        card.classList.add('card-hidden');
        observer.observe(card);
    });
}
