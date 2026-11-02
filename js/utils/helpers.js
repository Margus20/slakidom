// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

export function formatearConPuntosDeMil(numero) {
    return new Intl.NumberFormat('es-VE').format(numero);
}

export function redondearBolivares(precio) {
    const parteDecimal = Math.floor((precio % 1) * 100);
    const parteEntera = Math.floor(precio);
    return (parteDecimal >= 50) ? parteEntera + 1 : parteEntera;
}

export function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
