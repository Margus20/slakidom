// ==========================================
// EFECTO DE NIEVE
// ==========================================

export function crearCopoDeNieve() {
    const copo = document.createElement('div');
    copo.className = 'snowflake';
    copo.innerHTML = '❄';  // ✅ CORREGIDO: Antes estaba vacío ''
    copo.style.left = Math.random() * 100 + 'vw';
    copo.style.animationDuration = Math.random() * 3 + 2 + 's';
    copo.style.opacity = Math.random() * 0.7 + 0.3;
    copo.style.fontSize = Math.random() * 15 + 10 + 'px';
    document.body.appendChild(copo);
    setTimeout(() => { copo.remove(); }, 5000);
}

export function iniciarEfectoNieve() {
    console.log('❄️ [NIEVE]: Iniciando efecto de nieve...');  // ✅ Para verificar en consola
    setInterval(crearCopoDeNieve, 100);
}
