// Variables globales simples
let currentTimer = null;
let timerInterval = null;
let timeLeft = 0;
let isTimerRunning = false;

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍳 Recetas Pro cargado! :V');
    
    // Cargar modo oscuro si estaba guardado
    loadDarkMode();
    
    // Cargar favoritos
    loadFavorites();
    
    // Configurar el botón de modo oscuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Configurar navegación suave
    setupSmoothScroll();
});

// Modo oscuro simple
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'false');
        document.querySelector('#darkModeToggle i').className = 'fas fa-moon';
        showNotification('☀️ Modo claro activado');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
        showNotification('🌙 Modo oscuro activado');
    }
}

function loadDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
    }
}

// Sistema de favoritos simple
function toggleFavorite(button) {
    const card = button.closest('.recipe-card');
    const recipeTitle = card.querySelector('h3').textContent;
    
    // Obtener favoritos actuales
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (button.classList.contains('active')) {
        // Quitar de favoritos
        favorites = favorites.filter(title => title !== recipeTitle);
        button.classList.remove('active');
        button.innerHTML = '<i class="far fa-heart"></i> Favorito';
        showNotification(`💔 "${recipeTitle}" removido de favoritos`);
    } else {
        // Agregar a favoritos
        favorites.push(recipeTitle);
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
        showNotification(`❤️ "${recipeTitle}" agregado a favoritos`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Actualizar sección de favoritos
    updateFavoritesSection();
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Marcar botones de favoritos
    document.querySelectorAll('.recipe-card').forEach(card => {
        const title = card.querySelector('h3').textContent;
        const button = card.querySelector('.btn-favorite');
        
        if (favorites.includes(title)) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
        }
    });
    
    updateFavoritesSection();
}

function updateFavoritesSection() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('favorites-container');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-heart-broken"></i>
                <h3>Aún no tienes favoritos</h3>
                <p>¡Haz clic en el corazón de las recetas que te gusten!</p>
            </div>
        `;
        return;
    }
    
    // Mostrar recetas favoritas (simplificado por ahora)
    container.innerHTML = `
        <div class="empty-favorites">
            <i class="fas fa-heart"></i>
            <h3>Tienes ${favorites.length} favoritos</h3>
            <p>¡Sigue agregando más recetas que te gusten!</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--gray);">
                ${favorites.join(', ')}
            </p>
        </div>
    `;
}

// Timer simple y funcional
function startTimer(minutes, button) {
    // Detener timer anterior si existe
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timeLeft = minutes * 60;
    isTimerRunning = true;
    
    // Mostrar timer
    const timer = document.getElementById('timer');
    timer.classList.remove('timer-hidden');
    
    // Actualizar display
    updateTimerDisplay();
    
    // Iniciar cuenta regresiva
    timerInterval = setInterval(() => {
        if (timeLeft > 0 && isTimerRunning) {
            timeLeft--;
            updateTimerDisplay();
        } else if (timeLeft === 0) {
            clearInterval(timerInterval);
            showNotification('🎉 ¡Tiempo completado! La comida debe estar lista :V', 'success');
            timer.classList.add('timer-hidden');
        }
    }, 1000);
    
    showNotification(`⏱️ Timer iniciado: ${minutes} minutos`);
}

function pauseTimer() {
    isTimerRunning = !isTimerRunning;
    showNotification(isTimerRunning ? '▶️ Timer reanudado' : '⏸️ Timer pausado');
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 0;
    isTimerRunning = false;
    document.getElementById('timer').classList.add('timer-hidden');
    showNotification('🛑 Timer detenido');
}

function hideTimer() {
    document.getElementById('timer').classList.add('timer-hidden');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = document.getElementById('timer-display');
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Cambiar color cuando quede poco tiempo
    if (timeLeft < 60) {
        display.style.color = 'var(--danger)';
    } else {
        display.style.color = 'var(--primary)';
    }
}

// Navegación suave simple
function setupSmoothScroll() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Notificaciones simples
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Añadir los keyframes para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
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

console.log('✅ ¡Todo cargado correctamente! ¡A cocinar! :V');
