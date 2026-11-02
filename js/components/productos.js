// ==========================================
// RENDERIZADO DE PRODUCTOS
// ==========================================

import { formatearConPuntosDeMil, redondearBolivares } from '../utils/helpers.js';

export function renderizarProductos(listaProductos, tasaCambio) {
    const gridProductos = document.getElementById("productos-grid");
    if (!gridProductos) return;
    
    console.log('🏗️ [PRODUCTOS]: Renderizando productos...');
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
        card.dataset.id = producto.id;
        card.dataset.precio = producto.precio;
        card.dataset.imagen = producto.imagen || '';
        
        const precioUSD = producto.precio.toFixed(2);
        const [enteroUSD, decimalesUSD] = precioUSD.split('.');
        
        const precioEnBolivares = producto.precio * tasaCambio;
        const precioVESRedondeado = redondearBolivares(precioEnBolivares);
        
        const imagenSrc = producto.imagen ? `${imgBasePath}${producto.imagen}` : null;
        
        const imagenHTML = imagenSrc
            ? `<img src="${imagenSrc}" alt="${producto.nombre}" style="width:100%; height:200px; object-fit:cover; border-radius:10px 10px 0 0; background:#fff;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'producto-img-placeholder\\'>🫙</div>'">` 
            : `<div class="producto-img-placeholder">🫙</div>`;
        
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

        card.innerHTML = `
            ${esClicable ? `<a href="${productoURL}" style="text-decoration: none; color: inherit; display: block;">${contenidoInfo}</a>` : contenidoInfo}
            <button class="btn-agregar-carrito" data-id="${producto.id}" ${esClicable ? 'onclick="event.stopPropagation();"' : ''}>Agregar</button>
        `;
        gridProductos.appendChild(card);
    });
}
