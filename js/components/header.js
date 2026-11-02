// ==========================================
// CARGA DE HEADER Y FOOTER
// ==========================================

export async function cargarComponentes() {
    try {
        const path = window.location.pathname;
        const isSubfolder = path.includes('/galletas/') || path.includes('/mermeladas/');
        const basePath = isSubfolder ? '../' : '';
        
        console.log('📂 [HEADER]: Buscando header en:', `${basePath}componentes/header.html`);
        
        const headerRes = await fetch(`${basePath}componentes/header.html`);
        if (headerRes.ok) {
            document.getElementById('header-container').innerHTML = await headerRes.text();
            console.log('✅ [HEADER]: Cargado correctamente');
        } else {
            console.error('❌ [HEADER]: No se pudo cargar header.html. Status:', headerRes.status);
        }
        
        const footerRes = await fetch(`${basePath}componentes/footer.html`);
        if (footerRes.ok) {
            document.getElementById('footer-container').innerHTML = await footerRes.text();
            console.log('✅ [FOOTER]: Cargado correctamente');
        } else {
            console.error('❌ [FOOTER]: No se pudo cargar footer.html. Status:', footerRes.status);
        }
        
        document.dispatchEvent(new Event('componentesListos'));
    } catch (error) {
        console.error('❌ [HEADER]: Error al cargar los componentes:', error);
    }
}
