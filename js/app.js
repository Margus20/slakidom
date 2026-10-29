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
            if (horasTranscurridas < HORAS_ACTUALIZACION) {
                console.log('✅ [NERD-DEBUG]: El tiempo es relativo, pero la tasa en caché es absoluta. Usando:', tasaGuardada);
                return parseFloat(tasaGuardada);
            }
        }
        
        console.log('🔄 [NERD-DEBUG]: Consultando los oráculos de la API del BCV...');
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        
        const datos = await respuesta.json();
        console.log('📊 [NERD-DEBUG]: Los oráculos hablaron. Datos recibidos:', datos);
        
        const tasaBCV = datos.precio || datos.promedio;
        
        if (!tasaBCV || tasaBCV <= 0) {
            throw new Error('Tasa inválida recibida: ' + tasaBCV);
        }
        
        localStorage.setItem(TASA_CACHE_KEY, tasaBCV);
        localStorage.setItem(TASA_TIMESTAMP_KEY, Date.now().toString());
        
        console.log('✅ [NERD-DEBUG]: Tasa BCV grabada en la memoria del universo:', tasaBCV);
        return tasaBCV;
    } catch (error) {
        console.error('❌ [NERD-DEBUG]: La API falló, pero nosotros no. Error:', error);
        const tasaVieja = localStorage.getItem(TASA_CACHE_KEY);
        if (tasaVieja) {
            console.log('📦 [NERD-DEBUG]: Rescatando la tasa antigua del baúl de los recuerdos:', tasaVieja);
            return parseFloat(tasaVieja);
        }
        console.log('⚠️ [NERD-DEBUG]: Activando protocolo de emergencia. Tasa de respaldo:', TASA_RESPALDO);
        return TASA_RESPALDO;
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
        console.error('❌ [NERD-DEBUG]: Error al cargar los cimientos (componentes):', error);
    }
}

cargarComponentes();

document.addEventListener('componentesListos', () => {
    console.log('🌟 [NERD-DEBUG]: El escenario está montado. Los componentes han llegado.');
    
    let tasaCambio = TASA_RESPALDO;
    let monedaSeleccionada = 'USD';

    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');
    const tasaInfo = document.getElementById('tasaBcvInfo');

    // ✅ FUNCIÓN BRAVA 1: Formateo de números al estilo venezolano (puntos de mil)
    function formatearConPuntosDeMil(numero) {
        return new Intl.NumberFormat('es-VE').format(numero);
    }

    // ✅ FUNCIÓN BRAVA 2: Reconstrucción total del precio (Infalible)
    function actualizarVistaDePrecios(moneda) {
        console.log(`🎭 [NERD-DEBUG]: Transformando la realidad visual a moneda: ${moneda}`);
        const precios = document.querySelectorAll('.producto-precio');
        console.log(`📦 [NERD-DEBUG]: Encontrados ${precios.length} artefactos de precio para transformar.`);
        
        precios.forEach((precioEl, index) => {
            const usd = parseFloat(precioEl.dataset.precioUsd);
            const ves = parseFloat(precioEl.dataset.precioVes);
            
            const [enteroUSD, decimalesUSD] = usd.toFixed(2).split('.');
            const vesFormateado = formatearConPuntosDeMil(ves);

            if (moneda === 'VES') {
                console.log(`  ✨ Producto ${index}: El Bolívar toma el protagonismo (Bs.${vesFormateado})`);
                precioEl.innerHTML = `
                    <div class="precio-ves activo-grande">
                        <span class="simbolo">Bs.</span>
                        <span class="entero">${vesFormateado}</span>
                    </div>
                    <div class="precio-usd activo-pequeno">
                        <span class="simbolo">$</span>
                        <span class="entero">${enteroUSD}</span>
                        <span class="decimales">.${decimalesUSD}</span>
                    </div>
                `;
            } else {
                console.log(`  ✨ Producto ${index}: El Dólar recupera su trono ($${usd})`);
                precioEl.innerHTML = `
                    <div class="precio-usd activo-grande">
                        <span class="simbolo">$</span>
                        <span class="entero">${enteroUSD}</span>
                        <span class="decimales">.${decimalesUSD}</span>
                    </div>
                    <div class="precio-ves activo-pequeno">
                        <span class="simbolo">Bs.</span>
                        <span class="entero">${vesFormateado}</span>
                    </div>
                `;
            }
        });
    }

    function renderizarProductos() {
        const gridProductos = document.getElementById("productos-grid");
        if (!gridProductos) return;
        
        console.log('🏗️ [NERD-DEBUG]: Construyendo la vitrina de productos...');
        gridProductos.innerHTML = "";
        PRODUCTOS.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.dataset.categoria = producto.categoria;
            card.dataset.nombre = producto.nombre.toLowerCase();
            
            const precioUSD = producto.precio.toFixed(2);
            const [enteroUSD, decimalesUSD] = precioUSD.split('.');
            
            const precioEnBolivares = producto.precio * tasaCambio;
            const precioVESRedondeado = redondearBolivares(precioEnBolivares);
            
            console.log(`🍪 [NERD-DEBUG]: ${producto.nombre} | $${producto.precio} × ${tasaCambio} = Bs.${precioEnBolivares} → Bs.${formatearConPuntosDeMil(precioVESRedondeado)}`);
            
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
                        <span class="entero">${formatearConPuntosDeMil(precioVESRedondeado)}</span>
                    </div>
                </div>
                <button class="btn-agregar-carrito" data-id="${producto.id}">Agregar</button>
            `;
            gridProductos.appendChild(card);
        });
    }

    // ✅ Obtenemos la tasa PRIMERO y luego renderizamos
    (async () => {
        tasaCambio = await obtenerTasaBCV();
        console.log('💰 [NERD-DEBUG]: La tasa sagrada ha sido establecida en:', tasaCambio);
        if (tasaInfo) tasaInfo.textContent = `Tasa BCV: Bs. ${formatearConPuntosDeMil(tasaCambio)} por $`;
        renderizarProductos();
    })();

    // ==========================================
    // ✅ BLINDAJE TOTAL DEL SELECTOR (MODO BRAVO)
    // ==========================================
    if (selectorMoneda) {
        selectorMoneda.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation(); // 🔥 DETIENE CUALQUIER OTRO EVENTO EN SU CAMINO
            console.log('🛡️ [NERD-DEBUG]: Escudo activado. Clic en selector principal interceptado.');
            if (dropdownMonedas) dropdownMonedas.classList.toggle('activo');
            selectorMoneda.classList.toggle('activo');
        });
    }

    opcionesMoneda.forEach(opcion => {
        // Bloqueamos mousedown para que no robe el foco ni seleccione texto/productos
        opcion.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        opcion.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation(); // 🔥 EL GOLPE FINAL CONTRA LA INTERFERENCIA
            
            const moneda = opcion.dataset.moneda;
            const simbolo = opcion.dataset.simbolo;
            
            console.log(`🚨 [NERD-DEBUG]: ¡ACCIÓN CONFIRMADA! El usuario eligió: ${moneda} (${simbolo})`);
            
            opcionesMoneda.forEach(o => o.classList.remove('seleccionada'));
            opcion.classList.add('seleccionada');
            
            if (monedaActualText) monedaActualText.textContent = `Venezuela (${simbolo})`;
            if (dropdownMonedas) dropdownMonedas.classList.remove('activo');
            if (selectorMoneda) selectorMoneda.classList.remove('activo');
            
            monedaSeleccionada = moneda;
            
            // Ejecutamos la reconstrucción total del DOM
            actualizarVistaDePrecios(moneda);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-moneda') && !e.target.closest('.dropdown-monedas')) {
            if (dropdownMonedas) dropdownMonedas.classList.remove('activo');
            if (selectorMoneda) selectorMoneda.classList.remove('activo');
        }
    });

    function redondearBolivares(precio) {
        const parteDecimal = Math.floor((precio % 1) * 100);
        const parteEntera = Math.floor(precio);
        return (parteDecimal >= 50) ? parteEntera + 1 : parteEntera;
    }

    const PRODUCTOS = [
        { id: 1, nombre: "Galletas de Coco y Vainilla", precio: 3.00, categoria: "galletas" },
        { id: 2, nombre: "Galletas de Limón", precio: 3.00, categoria: "galletas" },
        { id: 3, nombre: "Galletas con Chispas de Chocolate", precio: 3.50, categoria: "galletas" },
        { id: 4, nombre: "Mermelada de Fresa", precio: 4.00, categoria: "mermeladas" },
        { id: 5, nombre: "Mermelada de Guayaba", precio: 4.00, categoria: "mermeladas" },
        { id: 6, nombre: "Mermelada de Durazno", precio: 4.00, categoria: "mermeladas" }
    ];

    // ... (El resto del código del menú, buscador, carrito y nieve se mantiene intacto y funcional) ...
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
        if (!sinResultados && document.getElementById("productos-grid")) {
            sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.textContent = 'No se encontraron productos ';
            document.getElementById("productos-grid").appendChild(sinResultados);
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

    function crearCopoDeNieve() {
        const copo = document.createElement('div');
        copo.className = 'snowflake';
        copo.innerHTML = '❄';
        copo.style.left = Math.random() * 100 + 'vw';
        copo.style.animationDuration = Math.random() * 3 + 2 + 's';
        copo.style.opacity = Math.random() * 0.7 + 0.3;
        copo.style.fontSize = Math.random() * 15 + 10 + 'px';
        document.body.appendChild(copo);
        setTimeout(() => { copo.remove(); }, 5000);
    }
    setInterval(crearCopoDeNieve, 100);

    console.log('🎉 [NERD-DEBUG]: ¡Sistema SLAKIDOM completamente activo, blindado y poético!');
});
