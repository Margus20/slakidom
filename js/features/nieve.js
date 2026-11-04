// ==========================================
// EFECTO DE NIEVE
// ==========================================

export function crearCopoDeNieve() {
    const copo = document.createElement('div');
    copo.className = 'snowflake';
    copo.textContent = '❄'; // ✅ MEJORA: textContent es más seguro y rápido que innerHTML para texto plano
    
    // 1. Generamos los valores aleatorios
    const left = Math.random() * 100;
    const duration = Math.random() * 3 + 2; // Entre 2 y 5 segundos
    const opacity = Math.random() * 0.7 + 0.3; // Entre 0.3 y 1.0
    const size = Math.random() * 15 + 10; // Entre 10px y 25px

    // 2. ✅ CORRECCIÓN CRÍTICA: Inyectamos VARIABLES CSS, no estilos directos.
    // Esto permite que el CSS controle la animación y el diseño, mientras JS solo provee los datos.
    copo.style.setProperty('--snow-left', `${left}vw`);
    copo.style.setProperty('--snow-duration', `${duration}s`);
    copo.style.setProperty('--snow-opacity', opacity);
    copo.style.setProperty('--snow-size', `${size}px`);
    
    document.body.appendChild(copo);
    
    // 3. Eliminamos el copo dinámicamente basado en su propia duración + un margen de seguridad
    setTimeout(() => { 
        if (copo.parentNode) copo.remove(); 
    }, (duration * 1000) + 500);
}

export function iniciarEfectoNieve() {
    console.log('❄️ [NIEVE]: Iniciando efecto de nieve...');
    // 100ms = 10 copos por segundo. Ajustable según la intensidad deseada.
    setInterval(crearCopoDeNieve, 100);
}
