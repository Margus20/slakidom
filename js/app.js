// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

// ==========================================
// ✅ OBTENCIÓN DE TASA BCV (Dólar oficial)
// ==========================================
const TASA_CACHE_KEY = 'slakidom_tasa_bcv';
const TASA_TIMESTAMP_KEY = 'slakidom_tasa_timestamp';
const HORAS_ACTUALIZACION = 6; // Actualizar cada 6 horas
const TASA_RESPALDO = 36.50; // Tasa manual por si falla la API

async function obtenerTasaBCV() {
    try {
        const tasaGuardada = localStorage.getItem(TASA_CACHE_KEY);
        const timestamp = localStorage.getItem(TASA_TIMESTAMP_KEY);
        
        if (tasaGuardada && timestamp) {
            const horasTranscurridas = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (horasTranscurridas < HORAS_ACTUALIZACION) {
                console.log('✅ Usando tasa BCV en caché:', tasaGuardada);
                return parseFloat(tasaGuardada);
            }
        }
        
        console.log('🔄 Consultando tasa BCV actualizada...');
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        
        const datos = await respuesta.json();
        const tasaBCV = datos.promedio; // Tasa oficial del BCV
        
        localStorage.setItem(TASA_CACHE_KEY, tasaBCV);
        localStorage.setItem(TASA_TIMESTAMP_KEY, Date.now().toString());
        
        console.log('✅ Tasa BCV actualizada:', tasaBCV);
        return tasaBCV;
        
    } catch (error) {
        console.warn('⚠️ No se pudo obtener la tasa BCV, usando tasa de respaldo:', TASA_RESPALDO);
        const tasaVieja = localStorage.getItem(TASA_CACHE_KEY);
        if (tasaVieja) return parseFloat(tasaVieja);
        return TASA_RESPALDO;
    }
}

function mostrarUltimaActualizacion() {
    const timestamp = localStorage.getItem(TASA_TIMESTAMP_KEY);
    if (timestamp) {
        const fecha = new Date(parseInt(timestamp));
        console.log('📅 Última actualización de tasa:', fecha.toLocaleString('es-VE'));
    }
}

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
    // ✅ SELECTOR DE MONEDA CON TASA BCV REAL
    // ==========================================
    let tasaCambio = TASA_RESPALDO;
    let monedaSeleccionada = 'USD';

    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');

    // Cargar la tasa BCV al iniciar
    (async () => {
        tasaCambio = await obtenerTasaBCV();
        mostrarUltimaActualizacion();
        
        // Mostrar la tasa en el header si existe el elemento
        const tasaInfo = document.getElementById('tasaBcvInfo');
        if (tasaInfo) {
            tasaInfo.textContent = `Tasa BCV: Bs. ${tasaCambio.toFixed(2)} por $`;
        }
    })();

    if (selectorMoneda) {
        selectorMoneda.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMonedas?.classList.toggle('activo');
            selectorMoneda.classList.toggle('activo');
        });
    }

    opcionesMoneda.forEach(opcion => {
        opcion.addEventListener('click', () => {
            const moneda = opcion.dataset.moneda;
            const simbolo = opcion.dataset.simbolo;
            
            opcionesMoneda.forEach(o => o.classList.remove('seleccionada'));
            opcion.classList.add('seleccionada');
            
            if (monedaActualText) {
                monedaActualText.textContent = `Venezuela (${simbolo})`;
            }
            
            dropdownMonedas?.classList.remove('activo');
            selectorMoneda?.classList.remove('activo');
            
            monedaSeleccionada = moneda;
            actualizarPreciosEnPagina(moneda, simbolo);
            
            console.log(`💱 Moneda cambiada a: ${moneda} (${simbolo}) - Tasa: ${tasaCambio}`);
        });
    });

    document.addEventListener('click', () => {
        dropdownMonedas?.classList.remove('activo');
        selectorMoneda?.classList.remove('activo');
    });

    // ✅ Función para actualizar precios en la página manteniendo el estilo EPA
    function actualizarPreciosEnPagina(moneda, simbolo) {
        const precios = document.querySelectorAll('.producto-precio');
        
        precios.forEach(precioEl => {
            let precioUSD = parseFloat(precioEl.dataset.precioUsd);
            
            if (!precioUSD) {
                const texto = precioEl.textContent.replace(/[^0-9.]/g, '');
                precioUSD = parseFloat(texto);
                precioEl.dataset.precioUsd = precioUSD;
            }
            
            if (moneda === 'VES') {
                const precioBS = (precioUSD * tasaCambio).toFixed(2);
                const [enteroBS, decimalesBS] = precioBS.split('.');
                precioEl.innerHTML = `
                    <span class="simbolo">${simbolo}</span>
                    <span class="entero">${enteroBS}</span>
                    <span class="decimales">.${decimalesBS}</span>
                `;
            } else {
                const precioFormateado = precioUSD.toFixed(2);
                const [entero, decimales] = precioFormateado.split('.');
                precioEl.innerHTML = `
                    <span class="simbolo">${simbolo}</span>
                    <span class="entero">${entero}</span>
                    <span class="decimales">.${decimales}</span>
                `;
            }
        });
    }

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
            
            // ✅ AGREGADO: data-precio-usd para que el conversor funcione
            card.innerHTML = `
                <div class="producto-img-placeholder">🍪</div>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div class="producto-precio" data-precio-usd="${producto.precio}">
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
    // C. MENÚ HAMBURGUESA CON CIERRE AUTOMÁTICO ✅
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
        e.stopPropagation();
        menuProductosDropdown?.classList.toggle('activo');
    });

    menuOverlay?.addEventListener('click', (e) => {
        if (e.target === menuOverlay) cerrarMenu();
    });

    document.querySelectorAll('.menu-item:not(.menu-toggle-dropdown), .menu-subitem').forEach(item => {
        item.addEventListener('click', () => {
            setTimeout(() => cerrarMenu(), 150);
        });
    });

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
        
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
        cerrarMenu();
    };

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

        let sinResultados = document.querySelector('.sin-resultados');
        if (!sinResultados && gridProductos) {
            sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.textContent = 'No se encontraron productos ';
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

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) {
            alert('✅ Producto agregado al carrito (Funcionalidad de demo)');
        }
    });

    console.log('🎉 ¡Sistema SLAKIDOM completamente activo y funcional!');
});
