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
                console.log('✅ [DEBUG]: Usando tasa en caché:', tasaGuardada);
                return parseFloat(tasaGuardada);
            }
        }
        
        console.log('🔄 [DEBUG]: Consultando API del BCV...');
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        
        const datos = await respuesta.json();
        console.log('📊 [DEBUG]: Datos recibidos:', datos);
        
        const tasaBCV = datos.precio || datos.promedio;
        
        if (!tasaBCV || tasaBCV <= 0) {
            throw new Error('Tasa inválida recibida: ' + tasaBCV);
        }
        
        localStorage.setItem(TASA_CACHE_KEY, tasaBCV);
        localStorage.setItem(TASA_TIMESTAMP_KEY, Date.now().toString());
        
        console.log('✅ [DEBUG]: Tasa BCV actualizada:', tasaBCV);
        return tasaBCV;
    } catch (error) {
        console.error('❌ [DEBUG]: Error al obtener tasa BCV:', error);
        const tasaVieja = localStorage.getItem(TASA_CACHE_KEY);
        if (tasaVieja) {
            console.log('📦 [DEBUG]: Usando tasa antigua del caché:', tasaVieja);
            return parseFloat(tasaVieja);
        }
        console.log('⚠️ [DEBUG]: Usando tasa de respaldo:', TASA_RESPALDO);
        return TASA_RESPALDO;
    }
}

async function cargarComponentes() {
    try {
        const path = window.location.pathname;
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        const basePath = isSubfolder ? '../' : '';
        
        console.log('📂 [DEBUG]: Buscando header en:', `${basePath}componentes/header.html`);
        
        const headerRes = await fetch(`${basePath}componentes/header.html`);
        if (headerRes.ok) {
            document.getElementById('header-container').innerHTML = await headerRes.text();
            console.log('✅ [DEBUG]: Header cargado correctamente');
        } else {
            console.error('❌ [DEBUG]: No se pudo cargar header.html. Status:', headerRes.status);
        }
        
        const footerRes = await fetch(`${basePath}componentes/footer.html`);
        if (footerRes.ok) {
            document.getElementById('footer-container').innerHTML = await footerRes.text();
            console.log('✅ [DEBUG]: Footer cargado correctamente');
        } else {
            console.error('❌ [DEBUG]: No se pudo cargar footer.html. Status:', footerRes.status);
        }
        
        document.dispatchEvent(new Event('componentesListos'));
    } catch (error) {
        console.error('❌ [DEBUG]: Error al cargar los componentes:', error);
    }
}

cargarComponentes();

document.addEventListener('componentesListos', () => {
    console.log('🌟 [DEBUG]: Componentes cargados. Iniciando aplicación...');
    
    let tasaCambio = TASA_RESPALDO;
    let monedaSeleccionada = 'USD';

    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');
    const tasaInfo = document.getElementById('tasaBcvInfo');

    function formatearConPuntosDeMil(numero) {
        return new Intl.NumberFormat('es-VE').format(numero);
    }

    function actualizarVistaDePrecios(moneda) {
        const precios = document.querySelectorAll('.producto-precio');
        
        precios.forEach((precioEl) => {
            const usd = parseFloat(precioEl.dataset.precioUsd);
            const ves = parseFloat(precioEl.dataset.precioVes);
            const [enteroUSD, decimalesUSD] = usd.toFixed(2).split('.');
            const vesFormateado = formatearConPuntosDeMil(ves);

            if (moneda === 'VES') {
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

    function renderizarProductos(listaProductos) {
        const gridProductos = document.getElementById("productos-grid");
        if (!gridProductos) return;
        
        console.log('️ [DEBUG]: Renderizando productos...');
        gridProductos.innerHTML = "";

        if (listaProductos.length === 0) {
            gridProductos.innerHTML = "<p style='text-align:center; color: var(--chocolate); padding: 40px;'>No hay productos en esta categoría por ahora.</p>";
            return;
        }
        
        const path = window.location.pathname;
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        const imgBasePath = isSubfolder ? '../' : '';
        
        listaProductos.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.dataset.categoria = producto.categoria;
            card.dataset.nombre = producto.nombre.toLowerCase();
            
            const precioUSD = producto.precio.toFixed(2);
            const [enteroUSD, decimalesUSD] = precioUSD.split('.');
            
            const precioEnBolivares = producto.precio * tasaCambio;
            const precioVESRedondeado = redondearBolivares(precioEnBolivares);
            
            const imagenSrc = producto.imagen ? `${imgBasePath}${producto.imagen}` : null;
            
            const imagenHTML = imagenSrc
                ? `<img src="${imagenSrc}" alt="${producto.nombre}" style="width:100%; height:200px; object-fit:cover; border-radius:10px 10px 0 0; background:#fff;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'producto-img-placeholder\\'></div>'">` 
                : `<div class="producto-img-placeholder">🫙</div>`;
            
            card.innerHTML = `
                ${imagenHTML}
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

    (async () => {
        tasaCambio = await obtenerTasaBCV();
        if (tasaInfo) tasaInfo.textContent = `Tasa BCV: Bs. ${formatearConPuntosDeMil(tasaCambio)} por $`;
        
        const path = window.location.pathname;
        let productosAMostrar = PRODUCTOS;

        if (path.includes('/galletas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'galletas');
        } else if (path.includes('/mermeladas/')) {
            productosAMostrar = PRODUCTOS.filter(p => p.categoria === 'mermeladas');
        }

        renderizarProductos(productosAMostrar);
    })();

    if (selectorMoneda) {
        selectorMoneda.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
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
            e.stopImmediatePropagation();
            
            const moneda = opcion.dataset.moneda;
            const simbolo = opcion.dataset.simbolo;
            
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

    // ✅ ACTUALIZADO: Imágenes reales de galletas y precios a $2.00
    const PRODUCTOS = [
        { id: 1, nombre: "Galletas de Coco y Vainilla", precio: 2.00, categoria: "galletas", imagen: "img/galletas/coco_vainilla.jpg" },
        { id: 2, nombre: "Galletas de Limón", precio: 2.00, categoria: "galletas", imagen: "img/galletas/limon.jpg" },
        { id: 3, nombre: "Galletas con Chispas de Chocolate", precio: 2.00, categoria: "galletas", imagen: "img/galletas/chispas_de_chocolate.jpg" },
        { id: 4, nombre: "Mermelada de Fresa", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/fresa.jpg" },
        { id: 5, nombre: "Mermelada de Guayaba", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/guayaba.jpg" },
        { id: 6, nombre: "Mermelada de Durazno", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/durazno.jpg" }
    ];

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

    const navProductosToggleBtn = document.getElementById('navProductosToggle');
    const navProductosDropdownMenu = document.getElementById('navProductosDropdown');
    
    if (navProductosToggleBtn && navProductosDropdownMenu) {
        navProductosToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navProductosDropdownMenu.classList.toggle('activo');
            navProductosToggleBtn.classList.toggle('activo');
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                navProductosDropdownMenu.classList.remove('activo');
                navProductosToggleBtn.classList.remove('activo');
            }
        });
    }

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
    
    const btnCarritoFlotante = document.querySelector('.abrir-modal-carrito');
    if (btnCarritoFlotante) {
        let img = btnCarritoFlotante.querySelector('img');
        if (!img) {
            const contador = btnCarritoFlotante.querySelector('.contador-flotante');
            img = document.createElement('img');
            img.alt = 'Excalibur Carrito';
            img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; pointer-events: none; display: block;';
            if (contador) {
                btnCarritoFlotante.insertBefore(img, contador);
            } else {
                btnCarritoFlotante.appendChild(img);
            }
        }
        img.src = '/slakidom/img/excalibur_carrito.png';
    }

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

    console.log('🎉 [DEBUG]: ¡Sistema SLAKIDOM activo y listo!');
});
