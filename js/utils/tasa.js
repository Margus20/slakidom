// ==========================================
// GESTIÓN DE TASA BCV
// ==========================================

import { CONFIG } from '../config.js';

export async function obtenerTasaBCV() {
    try {
        const tasaGuardada = localStorage.getItem(CONFIG.TASA_CACHE_KEY);
        const timestamp = localStorage.getItem(CONFIG.TASA_TIMESTAMP_KEY);
        
        if (tasaGuardada && timestamp) {
            const horasTranscurridas = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (horasTranscurridas < CONFIG.HORAS_ACTUALIZACION) {
                console.log('✅ [TASA]: Usando tasa en caché:', tasaGuardada);
                return parseFloat(tasaGuardada);
            }
        }
        
        console.log('🔄 [TASA]: Consultando API del BCV...');
        const respuesta = await fetch(CONFIG.API_URL);
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        
        const datos = await respuesta.json();
        console.log('📊 [TASA]: Datos recibidos:', datos);
        
        const tasaBCV = datos.precio || datos.promedio;
        
        if (!tasaBCV || tasaBCV <= 0) {
            throw new Error('Tasa inválida recibida: ' + tasaBCV);
        }
        
        localStorage.setItem(CONFIG.TASA_CACHE_KEY, tasaBCV);
        localStorage.setItem(CONFIG.TASA_TIMESTAMP_KEY, Date.now().toString());
        
        console.log('✅ [TASA]: Tasa BCV actualizada:', tasaBCV);
        return tasaBCV;
    } catch (error) {
        console.error('❌ [TASA]: Error al obtener tasa BCV:', error);
        const tasaVieja = localStorage.getItem(CONFIG.TASA_CACHE_KEY);
        if (tasaVieja) {
            console.log('📦 [TASA]: Usando tasa antigua del caché:', tasaVieja);
            return parseFloat(tasaVieja);
        }
        console.log('⚠️ [TASA]: Usando tasa de respaldo:', CONFIG.TASA_RESPALDO);
        return CONFIG.TASA_RESPALDO;
    }
}
