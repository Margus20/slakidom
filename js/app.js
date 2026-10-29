// ==========================================
// SLAKIDOM - ORQUESTADOR PRINCIPAL (app.js)
// ==========================================

const TASA_CACHE_KEY = 'slakidom_tasa_bcv';
const TASA_TIMESTAMP_KEY = 'slakidom_tasa_timestamp';
const HORAS_ACTUALIZACION = 6;
const TASA_RESPALDO = 36.50;

async function obtenerTasaBCV() {
    try {
        const tasaGuardada = localStorage.getItem(TASA_CACHE_KEY);
        const timestamp = localStorage.getItem(TASA_TIMESTAMP_KEY);
        if (tasaGuardada && timestamp) {
            const horasTranscurridas = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (horasTranscurridas < HORAS_ACTUALIZACION) return parseFloat(tasaGuardada);
        }
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        const datos = await respuesta.json();
        const tasaBCV = datos.promedio;
        localStorage.setItem(TASA_CACHE_KEY, tasaBCV);
        localStorage.setItem(TASA_TIMESTAMP_KEY, Date.now().toString());
        return tasaBCV;
    } catch (error) {
        const tasaVieja = localStorage.getItem(TASA_CACHE_KEY);
        return tasaVieja ? parseFloat(tasaVieja) : TASA_RESPALDO;
    }
}

async function cargarComponentes() {
    try {
        const headerRes = await fetch('componentes/header.html');
        if (headerRes.ok) document.getElementById('header-container').innerHTML = await headerRes.text();
        const footerRes = await fetch('componentes/footer.html');
        if (footerRes.ok) document.getElementById('footer-container').innerHTML = await footerRes.text();
        document.dispatchEvent(new Event('componentesListos'));
    } catch (error) {
        console.error('❌ Error al cargar componentes:', error);
    }
}

cargarComponentes();

document.addEventListener('componentesListos', () => {
    let tasaCambio = TASA_RESPALDO;
    let monedaSeleccionada = 'USD';

    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');
    const tasaInfo = document.getElementById('tasaBcvInfo');

    (async () => {
        tasaCambio = await obtenerTasaBCV();
        if (tasaInfo) tasaInfo.textContent = `Tasa BCV: Bs. ${tasaCambio.toFixed(2)} por $`;
    })();

    if (selectorMoneda) {
        selectorMoneda.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdownMonedas) dropdownMonedas.classList.toggle('activo');
            selectorMoneda.classList.toggle('activo');
        });
    }

    // ✅ CAMBIO 1: Agregado (e) y e.stopPropagation() para que el clic no interfiera
    opcionesMoneda.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            e.stopPropagation(); // ✅ CLAVE: Evita que el clic burbujee al document
            const moneda = opcion.dataset.moneda;
            const simbolo = opcion.dataset.simbolo;
            
            opcionesMoneda.forEach(o => o.classList.remove('seleccionada'));
            opcion.classList.add('seleccionada');
            
            if (monedaActualText) monedaActualText.textContent = `Venezuela (${simbolo})`;
            if (dropdownMonedas) dropdownMonedas.classList.remove('activo');
            if (selectorMoneda) selectorMoneda.classList.remove('activo');
            
            monedaSeleccionada = moneda;
            alternarPreciosEnPagina(moneda);
            
            console.log('💱 Moneda cambiada a:', moneda, '- Ejecutando alternarPreciosEnPagina');
        });
    });

    // ✅ CAMBIO 2: El document ahora solo cierra si el clic fue FUERA del selector/dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-moneda') && !e.target.closest('.dropdown-monedas')) {
            if (dropdownMonedas) dropdownMonedas.classList.remove('activo');
            if (selectorMoneda) selectorMoneda.classList.remove('activo');
        }
    });

    // ✅ Función que alterna las clases "grande" y "pequeño"
    function alternarPreciosEnPagina(moneda) {
        const precios = document.querySelectorAll('.producto-precio');
        precios.forEach(precioEl => {
            const divUsd = precioEl.querySelector('.precio-usd');
            const divVes = precioEl.querySelector('.precio-ves');
            
            if (moneda === 'VES') {
                divUsd.classList.remove('activo-grande');
                divUsd.classList.add('activo-pequeno');
                divVes.classList.remove('activo-pequeno');
                divVes.classList.add('activo-grande');
            } else {
                divVes.classList.remove('activo-grande');
                divVes.classList.add('activo-pequeno');
                divUsd.classList.remove('activo-pequeno');
                divUsd.classList.add('activo-grande');
            }
        });
    }

    // ✅ Función de redondeo inteligente: 5+ sube, 4- mantiene
    function redondearBolivares(precio) {
        const parteDecimal = Math.floor((precio % 1) * 100);
        const parteEntera = Math.floor(precio);
        
        if (parteDecimal >= 50) {
            return parteEntera + 1;
        } else {
            return parteEntera;
        }
    }

    const PRODUCTOS = [
        { id: 1, nombre: "Galletas de Coco y Vainilla", precio: 3.00, categoria: "galletas" },
        { id: 2, nombre: "Galletas de Limón", precio: 3.00, categoria: "galletas" },
        { id: 3, nombre: "Galletas con Chispas de Chocolate", precio: 3.50, categoria: "galletas" },
        { id: 4, nombre: "Mermelada de Fresa", precio: 4.00, categoria: "mermeladas" },
        { id: 5, nombre: "Mermelada de Guayaba", precio: 4.00, categoria: "mermeladas" },
        { id: 6, nombre: "Mermelada de Durazno", precio: 4.00, categoria: "mermeladas" }
    ];

    const gridProductos = document.getElementById("productos-grid");
    if (gridProductos) {
        gridProductos.innerHTML = "";
        PRODUCTOS.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.dataset.categoria = producto.categoria;
            card.dataset.nombre = producto.nombre.toLowerCase();
            
            const precioUSD = producto.precio.toFixed(2);
            const [enteroUSD, decimalesUSD] = precioUSD.split('.');
            
            // ✅ Aplicar redondeo inteligente
            const precioVESRedondeado = redondearBolivares(producto.precio * tasaCambio);
            
            card.innerHTML = `
                <div class="producto-img-placeholder">🍪</div>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div class="producto-precio" data-precio-usd="${producto.precio}" data-precio-ves="${precioVESRedondeado}">
                    <div class="precio-usd activo-grande">
                        <span class="simbolo">$</span>
                        <span class="entero">${enteroUSD}</span>
                        <span class="decimales">.${decimalesUSD}</span>
                    </div>
                    <div class="precio-ves activo-pequeno">
                        <span class="simbolo">Bs.</span>
                        <span class="entero">${precioVESRedondeado}</span>
                    </div>
                </div>
                <button class="btn-agregar-carrito" data-id="${producto.id}">Agregar</button>
            `;
            gridProductos.appendChild(card);
        });
    }

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

    const navProductos = document.querySelector('.nav-item:has(.nav-dropdown)');
    navProductos?.addEventListener('mouseenter', () => navProductos.classList.add('activo'));
    navProductos?.addEventListener('mouseleave', () => navProductos.classList.remove('activo'));

    window.filtrarYCerrar = (categoria) => {
        document.querySelectorAll('.producto-card').forEach(tarjeta => {
            tarjeta.classList.toggle('oculto', tarjeta.dataset.categoria !== categoria);
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
        if (sinResultados) sinResultados.classList.toggle('visible', visibles === 0 && termino !== '');
    });

    const modalCarrito = document.getElementById('modal-carrito');
    const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
    document.querySelectorAll('.abrir-modal-carrito').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); modalCarrito?.classList.add('activo'); });
    });
    btnCerrarCarrito?.addEventListener('click', () => modalCarrito?.classList.remove('activo'));
    modalCarrito?.addEventListener('click', (e) => { if (e.target === modalCarrito) modalCarrito.classList.remove('activo'); });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar-carrito')) alert('✅ Producto agregado al carrito');
    });

    // ==========================================
    // ✅ EFECTO DE NIEVE CAYENDO (INTENSIDAD AUMENTADA)
    // ==========================================
    function crearCopoDeNieve() {
        const copo = document.createElement('div');
        copo.className = 'snowflake';
        copo.innerHTML = '❄';
        copo.style.left = Math.random() * 100 + 'vw';
        copo.style.animationDuration = Math.random() * 3 + 2 + 's'; // Caída entre 2 y 5 segundos
        copo.style.opacity = Math.random() * 0.7 + 0.3; // ✅ Más visibles (entre 0.3 y 1.0)
        copo.style.fontSize = Math.random() * 15 + 10 + 'px'; // ✅ Ligeramente más grandes (10px a 25px)
        
        document.body.appendChild(copo);
        
        setTimeout(() => {
            copo.remove();
        }, 5000);
    }

    // ✅ CAMBIO CLAVE: De 300ms a 100ms. ¡Esto crea 3 veces más nieve por segundo!
    setInterval(crearCopoDeNieve, 100);

    console.log('🎉 ¡Sistema SLAKIDOM activo!');
});
