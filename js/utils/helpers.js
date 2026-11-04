// ==========================================
// FUNCIONES AUXILIARES (HELPERS)
// ==========================================

// 1. Formatea números al estilo venezolano (ej: 1500.50 -> "1.500,50")
export function formatearConPuntosDeMil(numero) {
    return new Intl.NumberFormat('es-VE').format(numero);
}

// 2. Redondea al entero más cercano (ej: 10.40 -> 10, 10.60 -> 11)
// Ideal para precios en Bolívares, eliminando la complejidad de los céntimos.
export function redondearBolivares(precio) {
    return Math.round(precio);
}

// 3. Convierte la primera letra en mayúscula y el resto en minúscula
// (ej: "galleta DE chocolate" -> "Galleta de chocolate")
export function capitalizarPrimeraLetra(texto) {
    if (!texto) return ''; // ✅ Seguridad: evita errores si el texto es nulo o vacío
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
