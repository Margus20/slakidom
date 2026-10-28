// ==========================================
// LÓGICA DEL MENÚ FULL-SCREEN
// ==========================================

export function inicializarMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (!menuToggle || !menuOverlay) return; // Protección por si no existe

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
}
