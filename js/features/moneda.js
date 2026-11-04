// ==========================================
// SELECTOR DE MONEDA
// ==========================================

import { formatearConPuntosDeMil } from '../utils/helpers.js';

export function inicializarSelectorMoneda() {
    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');

    // Salida temprana si los elementos no existen en esta página
    if (!selectorMoneda || !dropdownMonedas) return;

    // 1. Toggle del dropdown principal
    selectorMoneda.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el click se propague al document y cierre el menú inmediatamente
        dropdownMonedas.classList.toggle('activo');
        selectorMoneda.classList.toggle('activo');
        selectorMoneda.setAttribute('aria-expanded', selectorMoneda.classList.contains('activo'));
    });

    // 2. Selección de moneda
    opcionesMoneda.forEach(opcion => {
        opcion.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el click cierre el dropdown
            
            const moneda = opcion.dataset.moneda;
            const simbolo = opcion.dataset.simbolo;
            
            // Actualizar estado visual de las opciones
            opcionesMoneda.forEach(o => o.classList.remove('seleccionada'));
            opcion.classList.add('seleccionada');
            
            // Actualizar texto del selector
            if (monedaActualText) {
                monedaActualText.textContent = `Venezuela (${simbolo})`;
            }
            
            // Cerrar dropdown
            dropdownMonedas.classList.remove('activo');
            selectorMoneda.classList.remove('activo');
            selectorMoneda.setAttribute('aria-expanded', 'false');
            
            // Actualizar precios en el DOM
            actualizarVistaDePrecios(moneda);
        });
    });

    // 3. Cerrar al hacer click fuera del componente
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-moneda') && !e.target.closest('.dropdown-monedas')) {
            dropdownMonedas.classList.remove('activo');
            selectorMoneda.classList.remove('activo');
            selectorMoneda.setAttribute('aria-expanded', 'false');
        }
    });
}

function actualizarVistaDePrecios(moneda) {
    const precios = document.querySelectorAll('.producto-precio');
    
    precios.forEach((precioEl) => {
        // Buscar los contenedores que YA existen en el HTML (generados por renderizarProductos)
        const divUsd = precioEl.querySelector('.precio-usd');
        const divVes = precioEl.querySelector('.precio-ves');
        
        if (!divUsd || !divVes) return; // Seguridad

        if (moneda === 'VES') {
            // ✅ CORRECCIÓN CRÍTICA: Solo cambiamos clases, NO reescribimos innerHTML
            divVes.classList.add('activo-grande');
            divVes.classList.remove('activo-pequeno');
            divUsd.classList.add('activo-pequeno');
            divUsd.classList.remove('activo-grande');
            
            // Opcional: Actualizar el texto formateado de VES si no se hizo al renderizar
            const enteroVes = divVes.querySelector('.entero');
            if (enteroVes && precioEl.dataset.precioVes) {
                enteroVes.textContent = formatearConPuntosDeMil(parseFloat(precioEl.dataset.precioVes));
            }
        } else {
            // Mostrar USD grande, VES pequeño
            divUsd.classList.add('activo-grande');
            divUsd.classList.remove('activo-pequeno');
            divVes.classList.add('activo-pequeno');
            divVes.classList.remove('activo-grande');
        }
    });
}
