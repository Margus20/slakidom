// ==========================================
// CARGA DE HEADER Y FOOTER (Optimizado y a prueba de GitHub Pages)
// ==========================================

export async function cargarComponentes() {
    try {
        // 1. Detectar el entorno para ajustar la ruta base correctamente
        const path = window.location.pathname;
        const isGitHubPages = path.includes('/slakidom/');
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        
        let basePath = '';
        if (isGitHubPages) {
            // En GitHub Pages, la ruta absoluta desde la raíz del repositorio es lo más seguro
            basePath = '/slakidom/';
        } else {
            // En entorno local, usamos rutas relativas
            basePath = isSubfolder ? '../' : './';
        }
        
        // 2. Función auxiliar para evitar repetir código (Principio DRY)
        const cargarHTML = async (idContenedor, nombreArchivo) => {
            const contenedor = document.getElementById(idContenedor);
            
            // Seguridad: Si el contenedor no existe en esta página, no hacemos nada
            if (!contenedor) {
                console.warn(`[CARGA]: No se encontró el contenedor #${idContenedor} en esta página.`);
                return;
            }

            const ruta = `${basePath}componentes/${nombreArchivo}`;
            console.log(`[CARGA]: Buscando ${nombreArchivo} en: ${ruta}`);

            const response = await fetch(ruta);
            
            if (response.ok) {
                contenedor.innerHTML = await response.text();
                console.log(`[CARGA]: ${nombreArchivo} cargado correctamente.`);
            } else {
                console.error(`[CARGA]: Error ${response.status} al cargar ${nombreArchivo}.`);
                // Plan B: Mostrar un mensaje visual si falla la carga (Sin estilos inline)
                contenedor.innerHTML = `<p class="error-carga-componente">Error al cargar el ${nombreArchivo}. Por favor, recarga la página.</p>`;
            }
        };

        // 3. Cargar ambos archivos AL MISMO TIEMPO (Promise.all) para mayor velocidad
        await Promise.all([
            cargarHTML('header-container', 'header.html'),
            cargarHTML('footer-container', 'footer.html')
        ]);

        // 4. Avisar al resto del sistema que el HTML ya está listo
        document.dispatchEvent(new Event('componentesListos'));
        console.log('[SISTEMA]: Todos los componentes están listos y el evento fue disparado.');

    } catch (error) {
        console.error('[SISTEMA]: Error crítico al cargar los componentes:', error);
    }
}
