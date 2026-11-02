// ==========================================
// SELECTOR DE MONEDA
// ==========================================

import { formatearConPuntosDeMil } from '../utils/helpers.js';

export function inicializarSelectorMoneda() {
    const selectorMoneda = document.getElementById('selectorMoneda');
    const dropdownMonedas = document.getElementById('dropdownMonedas');
    const opcionesMoneda = document.querySelectorAll('.opcion-moneda');
    const monedaActualText = document.querySelector('.moneda-actual');

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
            
            actualizarVistaDePrecios(moneda);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-moneda') && !e.target.closest('.dropdown-monedas')) {
            if (dropdownMonedas) dropdownMonedas.classList.remove('activo');
            if (selectorMoneda) selectorMoneda.classList.remove('activo');
        }
    });
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
