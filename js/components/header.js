// ==========================================
// CARGA DE HEADER Y FOOTER (Optimizado)
// ==========================================

export async function cargarComponentes() {
    try {
        // 1. Detectar si estamos en una subcarpeta para ajustar la ruta
        const path = window.location.pathname;
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        const basePath = isSubfolder ? '../' : '';
        
        // 2. Función auxiliar para evitar repetir código (Principio DRY)
        const cargarHTML = async (idContenedor, nombreArchivo) => {
            const contenedor = document.getElementById(idContenedor);
            
            // Seguridad: Si el contenedor no existe en esta página, no hacemos nada
            if (!contenedor) {
                console.warn(`⚠️ [CARGA]: No se encontró el contenedor #${idContenedor} en esta página.`);
                return;
            }

            const ruta = `${basePath}componentes/${nombreArchivo}`;
            console.log(`📂 [CARGA]: Buscando ${nombreArchivo} en: ${ruta}`);

            const response = await fetch(ruta);
            
            if (response.ok) {
                contenedor.innerHTML = await response.text();
                console.log(`✅ [CARGA]: ${nombreArchivo} cargado correctamente.`);
            } else {
                console.error(`❌ [CARGA]: Error ${response.status} al cargar ${nombreArchivo}.`);
                // Plan B: Mostrar un mensaje visual si falla la carga
                contenedor.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error al cargar el ${nombreArchivo}. Recarga la página.</p>`;
            }
        };

        // 3. Cargar ambos archivos AL MISMO TIEMPO (Promise.all) para mayor velocidad
        await Promise.all([
            cargarHTML('header-container', 'header.html'),
            cargarHTML('footer-container', 'footer.html')
        ]);

        // 4. Avisar al resto del sistema que el HTML ya está listo
        document.dispatchEvent(new Event('componentesListos'));
        console.log('🎉 [SISTEMA]: Todos los componentes están listos y el evento fue disparado.');

    } catch (error) {
        console.error('❌ [SISTEMA]: Error crítico al cargar los componentes:', error);
    }
}
