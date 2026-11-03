// ==========================================
// GESTIÓN DE MENÚS
// ==========================================

export function inicializarMenus() {
    console.log('🍔 [MENÚ]: Inicializando menús...');
    
    // ==========================================
    // 1. MENÚ HAMBURGUESA MÓVIL
    // ==========================================
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

    if (menuFlotante) menuFlotante.addEventListener('click', abrirMenu);
    if (menuClose) menuClose.addEventListener('click', cerrarMenu);
    
    if (menuProductosToggle) {
        menuProductosToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuProductosDropdown?.classList.toggle('activo');
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', (e) => { 
            if (e.target === menuOverlay) cerrarMenu(); 
        });
    }

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.menu-item:not(.menu-toggle-dropdown), .menu-subitem').forEach(item => {
        item.addEventListener('click', () => setTimeout(() => cerrarMenu(), 150));
    });

    // ==========================================
    // 2. MENÚ HORIZONTAL DESKTOP - DROPDOWN PRODUCTOS
    // ==========================================
    const navProductosToggleBtn = document.getElementById('navProductosToggle');
    const navProductosDropdownMenu = document.getElementById('navProductosDropdown');
    
    // ✅ MEJORA CRÍTICA: Usar .closest() es mucho más seguro y compatible que :has()
    // Busca el elemento <li class="nav-item"> que contiene al botón
    const navItemPadre = navProductosToggleBtn ? navProductosToggleBtn.closest('.nav-item') : null;
    
    if (navProductosToggleBtn && navProductosDropdownMenu && navItemPadre) {
        console.log('🍔 [MENÚ]: Botón Productos encontrado, activando dropdown');
        
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // ✅ Blindaje: evita cualquier intento de navegación
            e.stopPropagation(); // ✅ Evita que el clic se propague al document y cierre el menú inmediatamente
            
            // Verificamos si ya está activo
            const estaActivo = navItemPadre.classList.contains('activo');
            
            // Primero cerramos (quitamos la clase)
            navItemPadre.classList.remove('activo');
            
            // Si no estaba activo, lo abrimos (el CSS .nav-item.activo .nav-dropdown lo mostrará)
            if (!estaActivo) {
                navItemPadre.classList.add('activo');
                console.log('🍔 [MENÚ]: Dropdown abierto');
            } else {
                console.log('🍔 [MENÚ]: Dropdown cerrado');
            }
        });
        
        // Cerrar el dropdown si se hace clic fuera del área del menú (.nav-item)
        document.addEventListener('click', (e) => {
            // Si el clic NO fue dentro del .nav-item, cerramos
            if (!e.target.closest('.nav-item')) {
                navItemPadre.classList.remove('activo');
            }
        });
    } else {
        console.warn('⚠️ [MENÚ]: No se encontraron los elementos del dropdown de Productos. Verifica los IDs en el HTML.');
        console.log('Estado:', {
            btn: !!navProductosToggleBtn,
            menu: !!navProductosDropdownMenu,
            padre: !!navItemPadre
        });
    }
}
