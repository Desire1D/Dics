// Función para alternar favoritos
function toggleFavorite(button) {
    const recipeTitle = button.parentElement.querySelector('h3').textContent;
    
    if (button.classList.contains('active')) {
        // Quitar de favoritos
        button.classList.remove('active');
        button.textContent = '❤️ Añadir a Favoritos';
        removeFromFavorites(recipeTitle);
        showNotification(`"${recipeTitle}" removido de favoritos`, 'info');
    } else {
        // Añadir a favoritos
        button.classList.add('active');
        button.textContent = '✅ En Favoritos';
        addToFavorites(recipeTitle);
        showNotification(`"${recipeTitle}" añadido a favoritos`, 'success');
    }
}

// Gestión de favoritos en localStorage
function addToFavorites(recipeTitle) {
    let favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
    if (!favorites.includes(recipeTitle)) {
        favorites.push(recipeTitle);
        localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
    }
}

function removeFromFavorites(recipeTitle) {
    let favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
    favorites = favorites.filter(title => title !== recipeTitle);
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Colores según el tipo
    const colors = {
        success: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
        info: 'linear-gradient(135deg, #ffd93d, #ff9a3d)',
        error: 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Añadir al documento
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Animaciones CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll para navegación
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Cargar estado de favoritos al iniciar
    loadFavoritesState();
});

// Cargar estado de los botones de favoritos
function loadFavoritesState() {
    const favorites = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
    const buttons = document.querySelectorAll('.favorite-btn');
    
    buttons.forEach(button => {
        const recipeTitle = button.parentElement.querySelector('h3').textContent;
        
        if (favorites.includes(recipeTitle)) {
            button.classList.add('active');
            button.textContent = '✅ En Favoritos';
        }
    });
}

// Efecto de carga inicial
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Contador de visitas
function updateVisitCounter() {
    let visits = parseInt(localStorage.getItem('pageVisits')) || 0;
    visits++;
    localStorage.setItem('pageVisits', visits);
    
    // Podrías mostrar esto en algún lugar de la página
    console.log(`¡Bienvenido! Esta página ha sido visitada ${visits} veces`);
}

// Llamar al contador de visitas cuando se carga la página
document.addEventListener('DOMContentLoaded', updateVisitCounter);
