// ==========================================
// ANIMACIONES Y SCROLL (js/features/animaciones.js)
// ==========================================

export function inicializarAnimaciones() {
    // 1. Scroll suave para los enlaces del menú (ej: ir a #contacto)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignorar enlaces vacíos
            
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 2. Función separada para animar las cards (se llama DESPUÉS de renderizar productos)
export function animarCardsDeProductos() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Dejar de observar una vez animado (mejor rendimiento)
            }
        });
    }, { threshold: 0.1 });

    // Aplicar a las cards de productos que ya existen en el DOM
    document.querySelectorAll('.producto-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}
