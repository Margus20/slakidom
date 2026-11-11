// ==========================================
// CONFIGURACIÓN Y CONSTANTES GLOBALES
// ==========================================

// ✅ CONFIG: Centraliza todos los valores que pueden cambiar con el tiempo
export const CONFIG = {
    TASA_CACHE_KEY: 'slakidom_tasa_bcv',
    TASA_TIMESTAMP_KEY: 'slakidom_tasa_timestamp',
    HORAS_ACTUALIZACION: 6, // Horas antes de volver a consultar la API
    TASA_RESPALDO: 36.50,   // Tasa de emergencia si la API falla y no hay caché
    API_URL: 'https://ve.dolarapi.com/v1/dolares/oficial' // API confiable y gratuita
};

// ✅ PRODUCTOS: Catálogo maestro. 
// Nota: Los precios deben ser números (ej: 7.00, no "7.00") para que los cálculos matemáticos funcionen.
export const PRODUCTOS = [
    { 
        id: 10, 
        nombre: "Galletas Personalizadas", 
        precio: 2.50, 
        categoria: "galletas", 
        imagen: "img/galletas/personalizada.jpg", 
        url: "galletas/personalizada.html",
        esPersonalizado: true,  // ← NUEVO: Indica que es un producto personalizado
        whatsappLink: "https://wa.me/584122879803?text=Hola%20SLAKIDOM,%20quiero%20cotizar%20galletas%20personalizadas%20con%20la%20siguiente%20idea:"  // ← NUEVO: Link directo a WhatsApp
    },
    { 
        id: 1, 
        nombre: "Galletas de Coco y Vainilla", 
        precio: 2.00, 
        categoria: "galletas", 
        imagen: "img/galletas/coco_vainilla.jpg", 
        url: "galletas/coco-vainilla.html" 
    },
    { 
        id: 2, 
        nombre: "Galletas de Limón", 
        precio: 2.00, 
        categoria: "galletas", 
        imagen: "img/galletas/limon.jpg", 
        url: "galletas/limon.html" 
    },
    { 
        id: 3, 
        nombre: "Galletas con Chispas de Chocolate", 
        precio: 2.50, 
        categoria: "galletas", 
        imagen: "img/galletas/chispas_de_chocolate.jpg", 
        url: "galletas/chispas-de-chocolate.html" 
    },
    { 
        id: 7, 
        nombre: "Galletas de Mermelada", 
        precio: 2.50, 
        categoria: "galletas", 
        imagen: "img/galletas/mermelada.jpg", 
        url: "galletas/mermelada.html" 
    },
    { 
        id: 8, 
        nombre: "Galletas de Chocolate", 
        precio: 2.00, 
        categoria: "galletas", 
        imagen: "img/galletas/chocolate.jpg", 
        url: "galletas/chocolate.html" 
    },
    { 
        id: 9, 
        nombre: "Galletas de Canela", 
        precio: 2.00, 
        categoria: "galletas", 
        imagen: "img/galletas/canela.jpg", 
        url: "galletas/canela.html" 
    },
    { 
        id: 4, 
        nombre: "Mermelada de Fresa", 
        precio: 7.00, 
        categoria: "mermeladas", 
        imagen: "img/mermeladas/fresa.jpg", 
        url: "mermeladas/fresa.html" 
    },
    { 
        id: 5, 
        nombre: "Mermelada de Guayaba", 
        precio: 7.00, 
        categoria: "mermeladas", 
        imagen: "img/mermeladas/guayaba.jpg", 
        url: "mermeladas/guayaba.html" 
    },
    { 
        id: 6, 
        nombre: "Mermelada de Durazno", 
        precio: 7.00, 
        categoria: "mermeladas", 
        imagen: "img/mermeladas/durazno.jpg", 
        url: "mermeladas/durazno.html" 
    }
];
