// ==========================================
// GESTIÓN DE TASA BCV
// ==========================================

import { CONFIG } from '../config.js';

export async function obtenerTasaBCV() {
    try {
        const tasaGuardada = localStorage.getItem(CONFIG.TASA_CACHE_KEY);
        const timestamp = localStorage.getItem(CONFIG.TASA_TIMESTAMP_KEY);
        
        // ✅ MEJORA: Validar que ambos existan y sean números válidos antes de calcular
        if (tasaGuardada && timestamp && !isNaN(parseFloat(tasaGuardada)) && !isNaN(parseInt(timestamp, 10))) {
            const horasTranscurridas = (Date.now() - parseInt(timestamp, 10)) / (1000 * 60 * 60);
            
            if (horasTranscurridas < CONFIG.HORAS_ACTUALIZACION) {
                console.log('✅ [TASA]: Usando tasa en caché válida:', tasaGuardada);
                return parseFloat(tasaGuardada);
            }
            console.log('⏳ [TASA]: Caché expirado. Actualizando...');
        }
        
        console.log('🔄 [TASA]: Consultando API del BCV...');
        const respuesta = await fetch(CONFIG.API_URL);
        if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
        
        const datos = await respuesta.json();
        
        // 🕵️‍♂️ DIAGNÓSTICO: Esto nos dirá exactamente qué nombres de variables envía la API hoy
        console.log('📊 [TASA]: Claves disponibles en la respuesta:', Object.keys(datos));
        console.log('📊 [TASA]: Datos completos recibidos:', datos);
        
        // ✅ MEJORA: Búsqueda aún más flexible de la tasa (se agregaron DolarBCV, dolar, value)
        const tasaBCV = datos.precio || datos.promedio || datos.tasa || datos.USD || datos.DolarBCV || datos.dolar || datos.value; 
        
        if (!tasaBCV || isNaN(parseFloat(tasaBCV)) || parseFloat(tasaBCV) <= 0) {
            throw new Error('Tasa inválida o no encontrada en la respuesta de la API');
        }
        
        const tasaNumerica = parseFloat(tasaBCV);
        
        localStorage.setItem(CONFIG.TASA_CACHE_KEY, tasaNumerica.toString());
        localStorage.setItem(CONFIG.TASA_TIMESTAMP_KEY, Date.now().toString());
        
        console.log('✅ [TASA]: Tasa BCV actualizada y guardada en caché:', tasaNumerica);
        return tasaNumerica;
        
    } catch (error) {
        console.error('❌ [TASA]: Error al obtener tasa BCV:', error.message);
        
        // 1. Intentar usar la tasa antigua del caché (aunque esté expirada, es mejor que nada)
        const tasaVieja = localStorage.getItem(CONFIG.TASA_CACHE_KEY);
        if (tasaVieja && !isNaN(parseFloat(tasaVieja))) {
            console.log('📦 [TASA]: Usando tasa antigua del caché como respaldo:', tasaVieja);
            return parseFloat(tasaVieja);
        }
        
        // 2. Último recurso: usar la tasa de respaldo configurada en CONFIG
        console.log('⚠️ [TASA]: Usando tasa de respaldo de CONFIG:', CONFIG.TASA_RESPALDO);
        return parseFloat(CONFIG.TASA_RESPALDO);
    }
}
