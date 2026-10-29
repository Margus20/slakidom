// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

// 1. CARGAR COMPONENTES (Header y Footer)
async function cargarComponentes() {
    try {
        const headerRes = await fetch('componentes/header.html');
        if (headerRes.ok) {
            document.getElementById('header-container').innerHTML = await headerRes.text();
        }
        
        const footerRes = await fetch('componentes/footer.html');
        if (footerRes.ok) {
            document.getElementById('footer-container').innerHTML = await footerRes.text();
        }
        
        // Avisar al sistema que los componentes ya están en el HTML
        document.dispatchEvent(new Event('componentesListos'));
    } catch (error) {
        console.error('❌ Error al cargar componentes. Asegúrate de usar un servidor local (Live Server).', error);
    }
}

// Iniciar la carga inmediatamente
cargarComponentes();

// 2. INICIALIZAR LA APLICACIÓN (Se ejecuta SOLO cuando el HTML está listo)
document.addEventListener('componentesListos', () => {
    console.log('✅ Componentes cargados. Iniciando sistema SLAKIDOM...');

    // ==========================================
    // A. DATOS DE PRODUCTOS
    // ==========================================
    const PRODUCTOS = [
        { id: 1, nombre: "Galletas de Coco y Vainilla", precio: 3.00, categoria: "galletas" },
        { id: 2, nombre: "Galletas de Limón", precio: 3.00, categoria: "galletas" },
        { id: 3, nombre: "Galletas con Chispas de Chocolate", precio: 3.50, categoria: "galletas" },
        { id: 4, nombre: "Mermelada de Fresa", precio: 4.00, categoria: "mermeladas" },
        { id: 5, nombre: "Mermelada de Guayaba", precio: 4.00, categoria: "mermeladas" },
        { id: 6, nombre: "Mermelada de Durazno", precio: 4.00, categoria: "mermeladas" }
    ];

    // ==========================================
    // B. RENDERIZAR PRODUCTOS (Estilo EPA)
    // ==========================================
    const gridProductos = document.getElementById("productos-grid");
    if (gridProductos) {
        gridProductos.innerHTML = ""; // Limpiar "Cargando..."
        
        PRODUCTOS.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.dataset.categoria = producto.categoria;
            card.dataset.nombre = producto.nombre.toLowerCase();
            
            const precioFormateado = producto.precio.toFixed(2);
            const [entero, decimales] = precioFormateado.split('.');
            
            card.innerHTML = `
                <div class="producto-img-placeholder">🍪</div>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div class="producto-precio">
                    <span class="simbolo">$</span>
                    <span class="entero">${entero}</span>
                    <span class="decimales">.${decimales}</span>
                </div>
                <button class="btn-agregar-carrito" data-id="${producto.id}">Agregar</button>
            `;
            gridProductos.appendChild(card);
        });
    }

    // ==========================================
    // C. MENÚ HAMBURGUESA Y DROPDOWNS
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

    menuFlotante?.addEventListener('click', abrirMenu);
    menuClose?.addEventListener('click', cerrarMenu);
    
    menuProductosToggle?.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que se cierre el menú al tocar el botón
        menuProductosDropdown?.classList.toggle('activo');
    });

    menuOverlay?.addEventListener('click', (e) => {
        if (e.target === menuOverlay) cerrarMenu();
    });

    // Dropdown del menú horizontal (Desktop: se activa con hover)
    const navProductos = document.querySelector('.nav-item:has(.nav-dropdown)');
    navProductos?.addEventListener('mouseenter', () => navProductos.classList.add('activo'));
    navProductos?.addEventListener('mouseleave', () => navProductos.classList.remove('activo'));

    // ==========================================
    // D. FILTRADO POR CATEGORÍA
    // ==========================================
    window.filtrarYCerrar = (categoria) => {
        document.querySelectorAll('.producto-card').forEach(tarjeta => {
            if (tarjeta.dataset.categoria === categoria) {
                tarjeta.classList.remove('oculto');
            } else {
                tarjeta.classList.add('oculto');
            }
        });
        
        // Scroll suave hacia la sección de productos
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
        cerrarMenu();
    };

    // Asignar eventos a los links de filtrado (tanto en menú horizontal como móvil)
    document.querySelectorAll('[data-categoria]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filtrarYCerrar(link.dataset.categoria);
        });
    });

    // ==========================================
    // E. BUSCADOR EN TIEMPO REAL
    // ==========================================
    const buscadorInput = document.getElementById('buscador-input');
    buscadorInput?.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        let visibles = 0;
        
        document.querySelectorAll('.producto-card').forEach(tarjeta => {
            if (tarjeta.dataset.nombre.includes(termino)) {
                tarjeta.classList.remove('oculto');
                visibles++;
            } else {
                tarjeta.classList.add('oculto');
            }
        });

        // Mostrar/ocultar mensaje de "No se encontraron productos"
        let sinResultados = document.querySelector('.sin-resultados');
        if (!sinResultados && gridProductos) {
            sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.textContent = 'No se encontraron productos 😕';
            gridProductos.appendChild(sinResultados);
        }
        
        if (sinResultados) {
            sinResultados.classList.toggle('visible', visibles === 0 && termino !== '');
        }
    });

    // ==========================================
    // F. CARRITO DE COMPRAS (Apertura y cierre)
    // ==========================================
    const modalCarrito = document.getElementById('modal-carrito');
    const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
    const botonesAbrir = document.querySelectorAll('.abrir-modal-carrito');

    botonesAbrir.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modalCarrito?.classList.add('activo');
        });
    });

    btnCerrarCarrito?.addEventListener('click', () => modalCarrito?.classList.remove('activo'));
    
    modalCarrito?.addEventListener('click', (e) => {
        if (e.target === modalCarrito) modalCarrito.classList.remove('activo');
    });

    // Demo: Botones de agregar al carrito
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) {
            alert('✅ Producto agregado al carrito (Funcionalidad de demo)');
        }
    });

    console.log('🎉 ¡Sistema SLAKIDOM completamente activo y funcional!');
});
