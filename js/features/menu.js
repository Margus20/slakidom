// ==========================================
// GESTIÓN DE MENÚS
// ==========================================

export function inicializarMenus() {
    // 1. Menú hamburguesa móvil
    const menuFlotante = document.getElementById('menu-flotante');
    const menuClose = document.getElementById('menuClose');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuProductosToggle = document.getElementById('menuProductosToggle');
    const menuProductosDropdown = document.getElementById('menuProductosDropdown');

    const abrirMenu = () => menuOverlay?.classList.add('active');
    const cerrarMenu = () => {
        menuOverlay?.classList.remove('active');
        menuProductosDropdown?.classList.remove('activo');
    };

    menuFlotante?.addEventListener('click', abrirMenu);
    menuClose?.addEventListener('click', cerrarMenu);
    
    menuProductosToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        menuProductosDropdown?.classList.toggle('activo');
    });
    
    menuOverlay?.addEventListener('click', (e) => { 
        if (e.target === menuOverlay) cerrarMenu(); 
    });

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.menu-item:not(.menu-toggle-dropdown), .menu-subitem').forEach(item => {
        item.addEventListener('click', () => setTimeout(() => cerrarMenu(), 150));
    });

    // 2. Menú horizontal desktop - Dropdown de Productos
    const navProductosToggleBtn = document.getElementById('navProductosToggle');
    const navProductosDropdownMenu = document.getElementById('navProductosDropdown');
    
    if (navProductosToggleBtn && navProductosDropdownMenu) {
        // ✅ El botón SOLO despliega/oculta el menú, NO navega a ninguna página
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Blindaje: prevenir cualquier intento de navegación
            e.stopPropagation();
            
            const estaActivo = navProductosDropdownMenu.classList.contains('activo');
            
            // Primero cerramos todo
            navProductosDropdownMenu.classList.remove('activo');
            navProductosToggleBtn.classList.remove('activo');
            
            // Si no estaba activo, lo abrimos (efecto toggle)
            if (!estaActivo) {
                navProductosDropdownMenu.classList.add('activo');
                navProductosToggleBtn.classList.add('activo');
            }
        });
        
        // Cerrar el dropdown si se hace clic fuera del área del menú
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                navProductosDropdownMenu.classList.remove('activo');
                navProductosToggleBtn.classList.remove('activo');
            }
        });
    }
}
