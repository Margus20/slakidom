// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================

export const CONFIG = {
    TASA_CACHE_KEY: 'slakidom_tasa_bcv',
    TASA_TIMESTAMP_KEY: 'slakidom_tasa_timestamp',
    HORAS_ACTUALIZACION: 6,
    TASA_RESPALDO: 36.50,
    API_URL: 'https://ve.dolarapi.com/v1/dolares/oficial'
};

export const PRODUCTOS = [
    { id: 1, nombre: "Galletas de Coco y Vainilla", precio: 2.00, categoria: "galletas", imagen: "img/galletas/coco_vainilla.jpg", url: "coco-vainilla.html" },
    { id: 2, nombre: "Galletas de Limón", precio: 2.00, categoria: "galletas", imagen: "img/galletas/limon.jpg", url: "limon.html" },
    { id: 3, nombre: "Galletas con Chispas de Chocolate", precio: 2.00, categoria: "galletas", imagen: "img/galletas/chispas_de_chocolate.jpg", url: "chispas-de-chocolate.html" },
    { id: 4, nombre: "Mermelada de Fresa", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/fresa.jpg", url: "fresa.html" },
    { id: 5, nombre: "Mermelada de Guayaba", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/guayaba.jpg", url: "guayaba.html" },
    { id: 6, nombre: "Mermelada de Durazno", precio: 5.00, categoria: "mermeladas", imagen: "img/mermeladas/durazno.jpg", url: "durazno.html" }
];
