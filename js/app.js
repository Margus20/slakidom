// ==========================================
// ✅ CONSOLA VISUAL PARA TABLET (Estilo Terminal Verde/Negro)
// ==========================================
(function() {
    // 1. Botón flotante para abrir/cerrar
    const btn = document.createElement('button');
    btn.innerHTML = '>_';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:100000;background:#000;color:#0f0;border:2px solid #0f0;border-radius:50%;width:55px;height:55px;font-size:26px;font-weight:bold;cursor:pointer;box-shadow:0 4px 15px rgba(0,255,0,0.4);font-family:monospace;';
    btn.title = 'Abrir Consola';
    document.body.appendChild(btn);

    // 2. Panel de la consola (Parte inferior de la pantalla)
    const panel = document.createElement('div');
    panel.id = 'tablet-console';
    panel.style.cssText = 'display:none;position:fixed;bottom:0;left:0;width:100%;height:50vh;background:#0a0a0a;color:#0f0;font-family:"Courier New",monospace;font-size:14px;z-index:99999;border-top:3px solid #0f0;flex-direction:column;box-shadow:0 -5px 20px rgba(0,0,0,0.9);';
    
    // 3. Header del panel
    const header = document.createElement('div');
    header.style.cssText = 'background:#111;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #333;';
    header.innerHTML = '<span style="color:#0f0;font-weight:bold;font-size:16px;">📟 CONSOLA DE DEPURACIÓN</span><div><button id="console-clear" style="background:#333;color:#fff;border:1px solid #555;padding:6px 15px;border-radius:4px;margin-right:8px;cursor:pointer;font-family:monospace;font-weight:bold;">Limpiar</button><button id="console-close" style="background:#f00;color:#fff;border:none;padding:6px 15px;border-radius:4px;cursor:pointer;font-weight:bold;">✕ Cerrar</button></div>';
    panel.appendChild(header);

    // 4. Contenedor de mensajes
    const messages = document.createElement('div');
    messages.id = 'console-messages';
    messages.style.cssText = 'flex:1;overflow-y:auto;padding:15px;scroll-behavior:smooth;';
    panel.appendChild(messages);
    document.body.appendChild(panel);

    // 5. Función para agregar mensajes
    function addMessage(type, args) {
        const line = document.createElement('div');
        line.style.cssText = 'margin:5px 0;padding:8px 12px;border-left:4px solid;word-wrap:break-word;font-size:14px;line-height:1.5;border-radius:0 4px 4px 0;';
        
        let color = '#0f0'; // Verde por defecto
        let border = '#0f0';
        let prefix = '>';
        
        if (type === 'error') { 
            color = '#ff5555'; border = '#ff0000'; prefix = '❌ ERROR'; 
            line.style.background = 'rgba(255, 0, 0, 0.15)';
        } else if (type === 'warn') { 
            color = '#ffaa00'; border = '#ffaa00'; prefix = '⚠️ WARN'; 
            line.style.background = 'rgba(255, 170, 0, 0.15)';
        } else if (type === 'info') { 
            color = '#00ffff'; border = '#00ffff'; prefix = 'ℹ️ INFO'; 
            line.style.background = 'rgba(0, 255, 255, 0.1)';
        }
        
        line.style.color = color;
        line.style.borderLeftColor = border;
        
        const text = args.map(a => {
            if (typeof a === 'object') {
                try { return JSON.stringify(a, null, 2); } 
                catch(e) { return String(a); }
            }
            return String(a);
        }).join(' ');
        
        line.innerHTML = `<strong>${prefix}</strong> ${text}`;
        messages.appendChild(line);
        messages.scrollTop = messages.scrollHeight; // Auto-scroll al fondo
    }

    // 6. Interceptar consola nativa del navegador
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;
    const origInfo = console.info;

    console.log = function(...args) { origLog.apply(console, args); addMessage('log', args); };
    console.error = function(...args) { origError.apply(console, args); addMessage('error', args); };
    console.warn = function(...args) { origWarn.apply(console, args); addMessage('warn', args); };
    console.info = function(...args) { origInfo.apply(console, args); addMessage('info', args); };

    // 7. Eventos de los botones
    btn.addEventListener('click', () => { 
        panel.style.display = (panel.style.display === 'flex') ? 'none' : 'flex'; 
    });
    document.getElementById('console-close').addEventListener('click', () => { panel.style.display = 'none'; });
    document.getElementById('console-clear').addEventListener('click', () => { messages.innerHTML = ''; });

    // Mensaje inicial de bienvenida
    setTimeout(() => {
        addMessage('info', ['Consola visual activada. Toca el botón ">_" abajo a la derecha para ver los mensajes y errores.']);
    }, 500);
})();
// ==========================================
// FIN CONSOLA VISUAL
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
        
        console.log('📂 [RUTA]: Buscando header en:', `${basePath}componentes/header.html`);
        
        const headerRes = await fetch(`${basePath}componentes/header.html`);
        if (headerRes.ok) {
            document.getElementById('header-container').innerHTML = await headerRes.text();
            console.log('✅ [ÉXITO]: Header cargado correctamente');
        } else {
            console.error('❌ [FALLÓ]: No se pudo cargar header.html. Status:', headerRes.status, 'Ruta buscada:', `${basePath}componentes/header.html`);
        }
        
        const footerRes = await fetch(`${basePath}componentes/footer.html`);
        if (footerRes.ok) {
            document.getElementById('footer-container').innerHTML = await footerRes.text();
            console.log('✅ [ÉXITO]: Footer cargado correctamente');
        } else {
            console.error('❌ [FALLÓ]: No se pudo cargar footer.html. Status:', footerRes.status, 'Ruta buscada:', `${basePath}componentes/footer.html`);
        }
        
        document.dispatchEvent(new Event('componentesListos'));
    } catch (error) {
        console.error('❌ [FALLÓ]: Error al cargar los cimientos (componentes):', error);
    }
}

cargarComponentes();

document.addEventListener('componentesListos', () => {
    console.log('🌟 [ÉXITO]: El escenario está montado. Los componentes han llegado.');
    
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
        console.log(`🎭 [PROCESO]: Transformando la realidad visual a moneda: ${moneda}`);
        const precios = document.querySelectorAll('.producto-precio');
        console.log(`📦 [PROCESO]: Encontrados ${precios.length} artefactos de precio para transformar.`);
        
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
            console.warn('⚠️ [ADVERTENCIA]: No se encontró el elemento #productos-grid en esta página.');
            return;
        }
        
        console.log('🏗️ [PROCESO]: Construyendo la vitrina de productos...');
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
            
            console.log(`${emoji} [PROCESO]: ${producto.nombre} | $${producto.precio} × ${tasaCambio} = Bs.${precioEnBolivares} → Bs.${formatearConPuntosDeMil(precioVESRedondeado)}`);
            
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
        console.log('💰 [ÉXITO]: La tasa sagrada ha sido establecida en:', tasaCambio);
        if (tasaInfo) tasaInfo.textContent = `Tasa BCV: Bs. ${formatearConPuntosDeMil(tasaCambio)} por $`;
        
        // ✅ Detectar la URL y filtrar los productos
        const path = window.location.pathname; // Ej: "/", "/galletas/", "/mermeladas/"
        console.log('📍 [INFO]: URL actual detectada:', path);
        
        let productosAMostrar = PRODUCTOS; // Por defecto, muestra TODOS (para index.html)

        if (path.includes('/galletas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'galletas');
            console.log('🍪 [PROCESO]: Modo Galletas activado. Filtrando productos.');
        } else if (path.includes('/mermeladas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'mermeladas');
            console.log('🫙 [PROCESO]: Modo Mermeladas activado. Filtrando productos.');
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
            console.log('🛡️ [PROCESO]: Escudo activado. Clic en selector principal interceptado.');
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
            
            console.log(`🚨 [ÉXITO]: ¡ACCIÓN CONFIRMADA! El usuario eligió: ${moneda} (${simbolo})`);
            
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
        docume
