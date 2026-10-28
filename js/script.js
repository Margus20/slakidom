// ==========================================
// SLAKIDOM - JAVASCRIPT PRINCIPAL
// ==========================================

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // MENÚ FULL-SCREEN (abrir/cerrar)
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Abrir menú
    menuToggle.addEventListener('click', function() {
        menuOverlay.classList.add('active');
    });
    
    // Cerrar menú
    menuClose.addEventListener('click', function() {
        menuOverlay.classList.remove('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            menuOverlay.classList.remove('active');
        });
    });
    
    // ==========================================
    // SCROLL SUAVE para los enlaces del menú
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ==========================================
    // ANIMACIÓN: Cards aparecen al hacer scroll
    // ==========================================
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Aplicar a las cards de productos
    document.querySelectorAll('.producto-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    console.log('🍪 SLAKIDOM - Página cargada correctamente');
});
