// ==========================================
// RENDERIZADO DE PRODUCTOS
// ==========================================

import { formatearConPuntosDeMil, redondearBolivares } from '../utils/helpers.js';

export function renderizarProductos(listaProductos, tasaCambio) {
    const gridProductos = document.getElementById("productos-grid");
    if (!gridProductos) return;
    
    console.log('[PRODUCTOS]: Iniciando renderizado...');
    gridProductos.innerHTML = "";

    if (listaProductos.length === 0) {
        // CORRECCION: Se agrego el backtick de cierre que faltaba
        gridProductos.innerHTML = `<p style="text-align: center; color: var(--chocolate); padding: var(--espacio-lg);">No hay productos en esta categoria por ahora.</p>`;
        return;
    }
    
    const path = window.location.pathname;
    const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
    const imgBasePath = isSubfolder ? '../' : '';
    
    // OPTIMIZACION: Usar DocumentFragment para insertar todo el HTML de una sola vez
    const fragment = document.createDocumentFragment();
    
    listaProductos.forEach(producto => {
        const card = document.createElement("div");
        card.className = "producto-card";
        card.dataset.categoria = producto.categoria;
        card.dataset.nombre = producto.nombre.toLowerCase();
        card.dataset.id = producto.id;
        card.dataset.precio = producto.precio;
        card.dataset.imagen = producto.imagen || '';
        
        const precioUSD = producto.precio.toFixed(2);
        const [enteroUSD, decimalesUSD] = precioUSD.split('.');
        
        const precioEnBolivares = producto.precio * tasaCambio;
        const precioVESRedondeado = redondearBolivares(precioEnBolivares);
        
        const imagenSrc = producto.imagen ? `${imgBasePath}${producto.imagen}` : null;
        
        // CORRECCION: Se eliminaron los estilos inline. La clase .producto-img en 05-productos.css ya maneja todo.
        const imagenHTML = imagenSrc
            ? `<img src="${imagenSrc}" alt="${producto.nombre}" class="producto-img" onerror="this.outerHTML='<div class=\\'producto-img-placeholder\\'></div>'">` 
            : `<div class="producto-img-placeholder"></div>`;
        
        const esClicable = !!producto.url;
        const productoURL = esClicable 
            ? (isSubfolder ? `../${producto.categoria}/${producto.url}` : `${producto.categoria}/${producto.url}`)
            : '#';
        
        const contenidoInfo = `
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
        `;

        // Se usa una clase 'card-link' en lugar de estilos inline para el enlace
        card.innerHTML = `
            ${esClicable ? `<a href="${productoURL}" class="card-link">${contenidoInfo}</a>` : contenidoInfo}
            <button class="btn-agregar-carrito" data-id="${producto.id}">Agregar</button>
        `;
        
        fragment.appendChild(card);
    });

    // Insercion unica en el DOM (mucho mas rapido que hacerlo en cada iteracion)
    gridProductos.appendChild(fragment);
    console.log(`[PRODUCTOS]: ${listaProductos.length} productos renderizados correctamente.`);
}
