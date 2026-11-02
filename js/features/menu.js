// ==========================================
// GESTIÓN DE MENÚS
// ==========================================

export function inicializarMenus() {
    // Menú hamburguesa móvil
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
    menuOverlay?.addEventListener('click', (e) => { if (e.target === menuOverlay) cerrarMenu(); });

    document.querySelectorAll('.menu-item:not(.menu-toggle-dropdown), .menu-subitem').forEach(item => {
        item.addEventListener('click', () => setTimeout(() => cerrarMenu(), 150));
    });

    // Menú horizontal desktop - Productos dropdown
    const navProductosToggleBtn = document.getElementById('navProductosToggle');
    const navProductosDropdownMenu = document.getElementById('navProductosDropdown');
    
    if (navProductosToggleBtn && navProductosDropdownMenu) {
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaActivo = navProductosDropdownMenu.classList.contains('activo');
            
            navProductosDropdownMenu.classList.remove('activo');
            navProductosToggleBtn.classList.remove('activo');
            
            if (!estaActivo) {
                navProductosDropdownMenu.classList.add('activo');
                navProductosToggleBtn.classList.add('activo');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                navProductosDropdownMenu.classList.remove('activo');
                navProductosToggleBtn.classList.remove('activo');
            }
        });
    }
}
