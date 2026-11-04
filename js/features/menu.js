// ==========================================
// GESTIÓN DE MENÚS (Móvil y Desktop)
// ==========================================

export function inicializarMenus() {
    console.log('🍔 [MENÚ]: Inicializando sistemas de navegación...');
    
    // ==========================================
    // 1. MENÚ HAMBURGUESA MÓVIL (Overlay)
    // ==========================================
    const menuFlotante = document.getElementById('menu-flotante');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuProductosToggle = document.getElementById('menuProductosToggle');
    const menuProductosDropdown = document.getElementById('menuProductosDropdown');

    // Funciones auxiliares para mantener el código DRY
    const abrirMenu = () => menuOverlay?.classList.add('active');
    
    const cerrarMenu = () => {
        menuOverlay?.classList.remove('active');
        // Aseguramos que el submenú también se cierre al salir
        menuProductosDropdown?.classList.remove('activo');
    };

    // Asignación de eventos con validación de existencia
    if (menuFlotante) menuFlotante.addEventListener('click', abrirMenu);
    if (menuClose) menuClose.addEventListener('click', cerrarMenu);
    
    // Toggle del submenú de productos dentro del menú móvil
    if (menuProductosToggle && menuProductosDropdown) {
        menuProductosToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic cierre el menú principal
            menuProductosDropdown.classList.toggle('activo');
        });
    }
    
    // Cerrar al hacer clic en el fondo oscuro (overlay)
    if (menuOverlay) {
        menuOverlay.addEventListener('click', (e) => { 
            if (e.target === menuOverlay) cerrarMenu(); 
        });
    }

    // Cerrar menú móvil al hacer clic en cualquier enlace de navegación
    const mobileLinks = document.querySelectorAll('.menu-item:not(.menu-toggle-dropdown), .menu-subitem');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Pequeño delay para permitir que la animación de salida del menú se aprecie
            setTimeout(cerrarMenu, 150);
        });
    });

    // ==========================================
    // 2. MENÚ HORIZONTAL DESKTOP - DROPDOWN PRODUCTOS
    // ==========================================
    const navProductosToggleBtn = document.getElementById('navProductosToggle');
    const navProductosDropdownMenu = document.getElementById('navProductosDropdown');
    
    // ✅ MEJORA CRÍTICA: .closest() es la forma más robusta y compatible de encontrar el padre
    const navItemPadre = navProductosToggleBtn ? navProductosToggleBtn.closest('.nav-item') : null;
    
    if (navProductosToggleBtn && navProductosDropdownMenu && navItemPadre) {
        console.log('✅ [MENÚ]: Dropdown de productos desktop inicializado correctamente.');
        
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Blindaje: evita saltos de página o recargas
            e.stopPropagation(); // Evita que el evento burbujee al document y cierre el menú inmediatamente
            
            const estaActivo = navItemPadre.classList.contains('activo');
            
            // Lógica de toggle limpia
            if (estaActivo) {
                navItemPadre.classList.remove('activo');
                console.log('🍔 [MENÚ]: Dropdown desktop cerrado.');
            } else {
                navItemPadre.classList.add('activo');
                console.log('🍔 [MENÚ]: Dropdown desktop abierto.');
            }
        });
        
        // Cerrar el dropdown desktop si se hace clic en cualquier parte fuera del .nav-item
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                navItemPadre.classList.remove('activo');
            }
        });
    } else {
        console.warn('⚠️ [MENÚ]: Elementos del dropdown de productos no encontrados. Verifica los IDs en el HTML.');
    }
}
