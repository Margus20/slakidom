// Función para cargar un componente HTML en un contenedor específico
async function cargarComponente(rutaArchivo, idContenedor) {
    try {
        const respuesta = await fetch(rutaArchivo);
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${rutaArchivo}`);
        }
        const html = await respuesta.text();
        document.getElementById(idContenedor).innerHTML = html;
    } catch (error) {
        console.error('Error al cargar el componente:', error);
    }
}

// Cargar Header y Footer cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarComponente('componentes/header.html', 'header-container');
    cargarComponente('componentes/footer.html', 'footer-container');
});
