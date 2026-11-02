// ==========================================
// GESTIÓN DE MENÚS
// ==========================================

export function inicializarMenus() {
    console.log('🍔 [MENÚ]: Inicializando menús...');
    
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
    
    // ✅ Buscamos el elemento <li> padre que contiene el dropdown
    const navItemPadre = document.querySelector('.nav-item:has(#navProductosDropdown)');
    
    if (navProductosToggleBtn && navProductosDropdownMenu && navItemPadre) {
        console.log('🍔 [MENÚ]: Botón Productos encontrado, activando dropdown');
        
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // ✅ Verificamos si el <li> padre ya tiene la clase 'activo'
            const estaActivo = navItemPadre.classList.contains('activo');
            
            // Primero cerramos todo (quitamos la clase del <li> padre)
            navItemPadre.classList.remove('activo');
            
            // Si no estaba activo, lo abrimos (el CSS .nav-item.activo .nav-dropdown lo mostrará)
            if (!estaActivo) {
                navItemPadre.classList.add('activo');
                console.log('🍔 [MENÚ]: Dropdown abierto');
            } else {
                console.log('🍔 [MENÚ]: Dropdown cerrado');
            }
        });
        
        // Cerrar el dropdown si se hace clic fuera del área del menú
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                navItemPadre.classList.remove('activo');
            }
        });
    } else {
        console.warn('⚠️ [MENÚ]: No se encontraron los elementos del dropdown de Productos');
    }
}
