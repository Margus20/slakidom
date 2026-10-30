// ==========================================
// ✅ CONSOLA NERUDA - Panel visual de depuración para tablet
// ==========================================
(function() {
    // Crear el botón flotante
    const btn = document.createElement('button');
    btn.innerHTML = '🔍';
    btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:#333;color:#fff;border:2px solid #fff;border-radius:50%;width:45px;height:45px;font-size:22px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.5);';
    btn.title = 'Abrir Consola Neruda';
    document.body.appendChild(btn);

    // Crear el panel
    const panel = document.createElement('div');
    panel.id = 'consola-neruda';
    panel.style.cssText = 'display:none;position:fixed;top:0;right:0;width:90%;max-width:500px;height:70vh;background:rgba(0,0,0,0.92);color:#0f0;font-family:monospace;font-size:12px;z-index:99998;border:2px solid #0f0;border-radius:10px 0 0 10px;overflow:hidden;flex-direction:column;';
    
    // Header del panel
    const header = document.createElement('div');
    header.style.cssText = 'background:#222;padding:10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #0f0;';
    header.innerHTML = '<strong style="color:#ff0;">🧠 Consola Neruda</strong><div><button id="neruda-limpiar" style="background:#ff0;color:#000;border:none;padding:5px 10px;border-radius:5px;margin-right:5px;cursor:pointer;font-weight:bold;">Limpiar</button><button id="neruda-cerrar" style="background:#f00;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-weight:bold;">✕</button></div>';
    panel.appendChild(header);

    // Contenedor de mensajes
    const mensajes = document.createElement('div');
    mensajes.id = 'neruda-mensajes';
    mensajes.style.cssText = 'flex:1;overflow-y:auto;padding:10px;';
    panel.appendChild(mensajes);

    document.body.appendChild(panel);

    // Función para agregar mensajes
    function agregarMensaje(tipo, args) {
        const linea = document.createElement('div');
        linea.style.cssText = 'margin:3px 0;padding:4px 8px;border-left:3px solid;word-wrap:break-word;';
        
        let color = '#0f0';
        let borde = '#0f0';
        let prefijo = '📝';
        
        if (tipo === 'error') { color = '#f55'; borde = '#f00'; prefijo = '❌'; }
        else if (tipo === 'warn') { color = '#ff0'; borde = '#fa0'; prefijo = '⚠️'; }
        else if (tipo === 'info') { color = '#0ff'; borde = '#0ff'; prefijo = 'ℹ️'; }
        
        linea.style.color = color;
        linea.style.borderLeftColor = borde;
        
        const texto = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        linea.textContent = `${prefijo} ${texto}`;
        
        mensajes.appendChild(linea);
        mensajes.scrollTop = mensajes.scrollHeight;
    }

    // Interceptar console.log, error, warn, info
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;
    const origInfo = console.info;

    console.log = function(...args) { origLog.apply(console, args); agregarMensaje('log', args); };
    console.error = function(...args) { origError.apply(console, args); agregarMensaje('error', args); };
    console.warn = function(...args) { origWarn.apply(console, args); agregarMensaje('warn', args); };
    console.info = function(...args) { origInfo.apply(console, args); agregarMensaje('info', args); };

    // Eventos de botones
    btn.addEventListener('click', () => { panel.style.display = 'flex'; });
    document.getElementById('neruda-cerrar').addEventListener('click', () => { panel.style.display = 'none'; });
    document.getElementById('neruda-limpiar').addEventListener('click', () => { mensajes.innerHTML = ''; });

    // Mensaje de bienvenida
    setTimeout(() => {
        agregarMensaje('info', ['🧠 Consola Neruda activada. Toca el botón 🔍 para ver los mensajes.']);
    }, 500);
})();
// ==========================================
// FIN CONSOLA NERUDA
// ==========================================


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

// ✅ CORRECCIÓN CLAVE: Rutas relativas dinámicas para GitHub Pages
async function cargarComponentes() {
    try {
        // Detectamos si estamos en una subcarpeta para ajustar la ruta (../)
        const path = window.location.pathname;
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        const basePath = isSubfolder ? '../' : '';
        
        console.log('📂 [NERUDA]: Buscando header en:', `${basePath}componentes/header.html`);
        
        const headerRes = await fetch(`${basePath}componentes/header.html`);
        if (headerRes.ok) {
            document.getElementById('header-container').innerHTML = await headerRes.text();
            console.log('✅ [NERUDA]: Header cargado correctamente');
        } else {
            console.error('❌ [NERUDA]: No se pudo cargar header.html. Status:', headerRes.status, 'Ruta buscada:', `${basePath}componentes/header.html`);
        }
        
        const footerRes = await fetch(`${basePath}componentes/footer.html`);
        if (footerRes.ok) {
            document.getElementById('footer-container').innerHTML = await footerRes.text();
            console.log('✅ [NERUDA]: Footer cargado correctamente');
        } else {
            console.error('❌ [NERUDA]: No se pudo cargar footer.html. Status:', footerRes.status, 'Ruta buscada:', `${basePath}componentes/footer.html`);
        }
        
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

    // ✅ FUNCIÓN PARA RENDERIZAR PRODUCTOS
    function renderizarProductos(listaProductos) {
        const gridProductos = document.getElementById("productos-grid");
        if (!gridProductos) {
            console.warn('⚠️ [NERUDA]: No se encontró el elemento #productos-grid en esta página.');
            return;
        }
        
        console.log('🏗️ [NERD-DEBUG]: Construyendo la vitrina de productos...');
        gridProductos.innerHTML = "";

        if (listaProductos.length === 0) {
            gridProductos.innerHTML = "<p style='text-align:center; color: var(--chocolate); padding: 40px;'>No hay productos en esta categoría por ahora.</p>";
            return;
        }
        
        listaProductos.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.dataset.categoria = producto.categoria;
            card.dataset.nombre = producto.nombre.toLowerCase();
            
            const precioUSD = producto.precio.toFixed(2);
            const [enteroUSD, decimalesUSD] = precioUSD.split('.');
            
            const precioEnBolivares = producto.precio * tasaCambio;
            const precioVESRedondeado = redondearBolivares(precioEnBolivares);
            
            // ✅ AJUSTE: Emoji dinámico (Frasco 🫙 para mermeladas, Galleta 🍪 para lo demás)
            const emoji = producto.categoria === 'mermeladas' ? '🫙' : '🍪';
            
            console.log(`${emoji} [NERD-DEBUG]: ${producto.nombre} | $${producto.precio} × ${tasaCambio} = Bs.${precioEnBolivares} → Bs.${formatearConPuntosDeMil(precioVESRedondeado)}`);
            
            card.innerHTML = `
                <div class="producto-img-placeholder">${emoji}</div>
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
        
        // ✅ Detectar la URL y filtrar los productos
        const path = window.location.pathname; // Ej: "/", "/galletas/", "/mermeladas/"
        console.log('📍 [NERUDA]: URL actual detectada:', path);
        
        let productosAMostrar = PRODUCTOS; // Por defecto, muestra TODOS (para index.html)

        if (path.includes('/galletas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'galletas');
            console.log('🍪 [NERD-DEBUG]: Modo Galletas activado. Filtrando productos.');
        } else if (path.includes('/mermeladas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'mermeladas');
            console.log('🫙 [NERD-DEBUG]: Modo Mermeladas activado. Filtrando productos.');
        }

        // Renderizamos con la lista filtrada (o completa)
        renderizarProductos(productosAMostrar);
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

    // ==========================================
    // EL RESTO DEL CÓDIGO (MENÚ, BUSCADOR, CARRITO, NIEVE) SE MANTIENE INTACTO
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
        document.querySelectorAll('.producto-ca
