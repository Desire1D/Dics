// Variables globales
let currentTimer = null;
let timerInterval = null;
let timeLeft = 0;
let isTimerRunning = false;

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍲 Sabores Ancestrales Perú cargado! 🌄');
    
    // Cargar modo oscuro si estaba guardado
    loadDarkMode();
    
    // Cargar favoritos
    loadFavorites();
    
    // Configurar el botón de modo oscuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Configurar navegación suave
    setupSmoothScroll();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showNotification('🌄 Bienvenido a Sabores Ancestrales Perú - Rescatando nuestra herencia culinaria', 'success');
    }, 1000);
});

// Modo oscuro
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
        showNotification('🌙 Modo oscuro activado - Como una noche andina');
    }
}

function loadDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
    }
}

// Sistema de favoritos
function toggleFavorite(button) {
    const card = button.closest('.recipe-card');
    const recipeTitle = card.querySelector('h3').textContent;
    const recipeSection = card.closest('.recipe-section').id;
    
    // Obtener favoritos actuales
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Buscar si ya existe
    const existingIndex = favorites.findIndex(fav => fav.title === recipeTitle);
    
    if (existingIndex !== -1) {
        // Quitar de favoritos
        favorites.splice(existingIndex, 1);
        button.classList.remove('active');
        button.innerHTML = '<i class="far fa-heart"></i> Favorito';
        card.classList.remove('favorite-recipe');
        showNotification(`💔 "${recipeTitle}" removido de favoritos`);
    } else {
        // Agregar a favoritos
        const recipeData = {
            title: recipeTitle,
            section: recipeSection,
            time: card.dataset.time,
            difficulty: card.dataset.difficulty,
            image: card.querySelector('img').src,
            description: card.querySelector('.recipe-desc').textContent
        };
        
        favorites.push(recipeData);
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
        card.classList.add('favorite-recipe');
        showNotification(`❤️ "${recipeTitle}" agregado a tus recetas ancestrales`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Actualizar sección de favoritos
    updateFavoritesSection();
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Marcar botones de favoritos y tarjetas
    document.querySelectorAll('.recipe-card').forEach(card => {
        const title = card.querySelector('h3').textContent;
        const button = card.querySelector('.btn-favorite');
        const isFavorite = favorites.some(fav => fav.title === title);
        
        if (isFavorite) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
            card.classList.add('favorite-recipe');
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
                <h3>Aún no tienes recetas favoritas</h3>
                <p>¡Haz clic en el corazón de las recetas que te gusten para rescatarlas!</p>
            </div>
        `;
        return;
    }
    
    // Mostrar recetas favoritas
    container.innerHTML = favorites.map(recipe => `
        <div class="recipe-card favorite-recipe" data-time="${recipe.time}" data-difficulty="${recipe.difficulty}">
            <div class="card-header">
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="card-badge ${recipe.difficulty}">${getDifficultyText(recipe.difficulty)}</div>
            </div>
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.time}min</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${getRegionName(recipe.section)}</span>
                </div>
                <p class="recipe-desc">${recipe.description}</p>
                <div class="card-actions">
                    <button class="btn-favorite active" onclick="toggleFavorite(this)">
                        <i class="fas fa-heart"></i> En Favoritos
                    </button>
                    <button class="btn-timer" onclick="startTimer(${recipe.time}, this)">
                        <i class="fas fa-clock"></i> Timer
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getDifficultyText(difficulty) {
    const texts = {
        'facil': 'Fácil',
        'medio': 'Medio',
        'dificil': 'Tradicional'
    };
    return texts[difficulty] || difficulty;
}

function getRegionName(section) {
    const regions = {
        'costa': 'Costa',
        'sierra': 'Sierra',
        'selva': 'Selva'
    };
    return regions[section] || section;
}

// Timer de cocina
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
            showNotification('🎉 ¡Tiempo completado! Tu platillo ancestral está listo 🌄', 'success');
            // Sonido opcional (solo si el usuario ha interactuado)
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
                audio.play();
            } catch (e) {}
        }
    }, 1000);
    
    showNotification(`⏱️ Timer ancestral iniciado: ${minutes} minutos`);
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
    showNotification('🛑 Timer ancestral detenido');
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

// Navegación suave
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

// Notificaciones
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
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }, 4000);
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
    
    .favorite-recipe {
        position: relative;
        border: 2px solid var(--primary) !important;
        background: linear-gradient(135deg, var(--light), #fff8e1);
    }
    
    .favorite-recipe::before {
        content: '❤️';
        position: absolute;
        top: -10px;
        right: -10px;
        background: var(--primary);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        z-index: 10;
    }
`;
document.head.appendChild(style);

console.log('✅ ¡Sabores Ancestrales Perú cargado correctamente! ¡A cocinar como nuestros abuelos! 🌄');
