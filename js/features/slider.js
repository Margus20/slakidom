// ==========================================
// SLIDER DE IMÁGENES (Hero)
// ==========================================

export function inicializarSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    // Si no hay slider en esta página, no hace nada y evita errores
    if (slides.length === 0 || dots.length === 0) return;

    let currentSlideIndex = 0;
    let previousSlideIndex = 0;
    const slideInterval = 5000; // Cambia cada 5 segundos

    function showSlide(index) {
        slides[previousSlideIndex].classList.remove('active');
        slides[previousSlideIndex].classList.add('exit');
        
        setTimeout(() => {
            slides[previousSlideIndex].classList.remove('exit');
        }, 800);

        previousSlideIndex = currentSlideIndex;
        if (index >= slides.length) currentSlideIndex = 0;
        else if (index < 0) currentSlideIndex = slides.length - 1;
        else currentSlideIndex = index;

        slides[currentSlideIndex].classList.add('active');
        
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlideIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    setInterval(nextSlide, slideInterval);
    console.log('🖼️ [SLIDER]: Inicializado correctamente.');
}
