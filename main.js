document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    
    // Función para manejar el envío del formulario de búsqueda desde cualquier página
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('search-input').value;
            window.location.href = `catalogo.html?q=${encodeURIComponent(query)}`;
        });
    }

    // Lógica inteligente para la página del catálogo
    if (window.location.pathname.includes('catalogo.html')) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        
        if (query) {
            const queryLower = query.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            let found = false;
            
            // Buscar coincidencias
            products.forEach(product => {
                const title = product.querySelector('h3').innerText.toLowerCase();
                if (title.includes(queryLower)) {
                    product.style.display = 'block';
                    found = true;
                } else {
                    product.style.display = 'none';
                }
            });
            
            // Si no hay coincidencias, mostrar mensaje y el catálogo entero
            if (!found) {
                const noFoundMsg = document.getElementById('no-found-msg');
                noFoundMsg.style.display = 'block';
                noFoundMsg.innerHTML = `Producto no encontrado para "<strong>${query}</strong>". Mostrando catálogo completo:`;
                
                products.forEach(product => {
                    product.style.display = 'block'; 
                });
            }
        }
    }

    // Lógica para revelar elementos al hacer scroll (Para la galería)
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        
        reveals.forEach(reveal => {
            revealObserver.observe(reveal);
        });
    }
});