// 🎯 Configuración global
const APP = {
    recipes: [],
    favorites: new Set(),
    currentTimer: null,
    timerInterval: null,
    isDarkMode: false
};

// 🚀 Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserPreferences();
});

function initializeApp() {
    // Simular carga de datos
    simulateDataLoad();
    
    // Configurar recipes del DOM
    setTimeout(() => {
        cacheRecipes();
        updateStats();
        setupSmoothScrolling();
        initializeAnimations();
    }, 1000);
}

function simulateDataLoad() {
    // Mostrar loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.body.style.opacity = '1';
    }, 2000);
}

function cacheRecipes() {
    APP.recipes = Array.from(document.querySelectorAll('.recipe-card'));
    console.log(`📊 ${APP.recipes.length} recetas cargadas`);
}

// 🎨 Modo Oscuro
function toggleDarkMode() {
    APP.isDarkMode = !APP.isDarkMode;
    document.documentElement.setAttribute('data-theme', APP.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', APP.isDarkMode);
    
    const icon = document.querySelector('#darkModeToggle i');
    icon.className = APP.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    
    showNotification(APP.isDarkMode ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado', 'info');
}

// 🔍 Sistema de Búsqueda
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value);
    }, 300));
    
    searchBtn.addEventListener('click', () => performSearch(searchInput.value));
    
    // Buscar con Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value);
    });
}

function performSearch(query) {
    if (!query.trim()) {
        resetSearch();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    let results = 0;
    
    APP.recipes.forEach(recipe => {
        const title = recipe.querySelector('h3').textContent.toLowerCase();
        const desc = recipe.querySelector('.recipe-desc').textContent.toLowerCase();
        const tags = Array.from(recipe.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(searchTerm) || 
                       desc.includes(searchTerm) || 
                       tags.some(tag => tag.includes(searchTerm));
        
        recipe.style.display = matches ? 'block' : 'none';
        if (matches) results++;
    });
    
    showNotification(`🔍 Encontradas ${results} recetas para "${query}"`, results > 0 ? 'success' : 'warning');
}

function resetSearch() {
    APP.recipes.forEach(recipe => recipe.style.display = 'block');
}

// ❤️ Sistema de Favoritos Mejorado
function toggleFavorite(button) {
    const card = button.closest('.recipe-card');
    const recipeId = card.querySelector('h3').textContent;
    
    if (APP.favorites.has(recipeId)) {
        removeFromFavorites(recipeId, button);
    } else {
        addToFavorites(recipeId, button);
    }
    
    updateStats();
    updateFavoritesSection();
}

function addToFavorites(recipeId, button) {
    APP.favorites.add(recipeId);
    button.classList.add('active');
    button.innerHTML = '<i class="fas fa-heart"></i>';
    
    // Animación especial
    button.classList.add('glow');
    setTimeout(() => button.classList.remove('glow'), 2000);
    
    showNotification(`❤️ "${recipeId}" añadido a favoritos`, 'success');
    saveFavorites();
}

function removeFromFavorites(recipeId, button) {
    APP.favorites.delete(recipeId);
    button.classList.remove('active');
    button.innerHTML = '<i class="far fa-heart"></i>';
    
    showNotification(`💔 "${recipeId}" removido de favoritos`, 'info');
    saveFavorites();
}

function saveFavorites() {
    localStorage.setItem('recipeFavorites', JSON.stringify([...APP.favorites]));
}

function loadFavorites() {
    const saved = JSON.parse(localStorage.getItem('recipeFavorites')) || [];
    APP.favorites = new Set(saved);
    
    // Actualizar botones
    APP.recipes.forEach(card => {
        const recipeId = card.querySelector('h3').textContent;
        const button = card.querySelector('.btn-favorite');
        
        if (APP.favorites.has(recipeId)) {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i>';
        }
    });
}

// 👁️ Vista Rápida Mejorada
function quickView(button) {
    const card = button.closest('.recipe-card');
    const modal = document.getElementById('quickModal');
    const modalContent = document.getElementById('modalContent');
    
    const recipeData = {
        title: card.querySelector('h3').textContent,
        image: card.querySelector('img').src,
        time: card.querySelector('.fa-clock').parentElement.textContent,
        servings: card.querySelector('.fa-users').parentElement.textContent,
        calories: card.querySelector('.fa-fire').parentElement.textContent,
        description: card.querySelector('.recipe-desc').textContent,
        difficulty: card.dataset.difficulty,
        tags: Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent)
    };
    
    modalContent.innerHTML = createModalContent(recipeData);
    modal.style.display = 'block';
    
    // Configurar cerrar modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

function createModalContent(recipe) {
    return `
        <div class="modal-recipe">
            <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; height:200px; object-fit:cover; border-radius:15px; margin-bottom:1rem;">
            <h2>${recipe.title}</h2>
            <div class="recipe-meta">
                <span>${recipe.time}</span>
                <span>${recipe.servings}</span>
                <span>${recipe.calories}</span>
            </div>
            <p>${recipe.description}</p>
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div style="margin-top:2rem; display:flex; gap:1rem;">
                <button class="btn-cook" onclick="startCookingModal('${recipe.title}')" style="flex:1;">
                    <i class="fas fa-play"></i> Empezar a Cocinar
                </button>
                <button class="btn-favorite ${APP.favorites.has(recipe.title) ? 'active' : ''}" 
                        onclick="toggleFavoriteModal('${recipe.title}', this)" style="padding:1rem;">
                    <i class="${APP.favorites.has(recipe.title) ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        </div>
    `;
}

function toggleFavoriteModal(recipeId, button) {
    if (APP.favorites.has(recipeId)) {
        APP.favorites.delete(recipeId);
        button.classList.remove('active');
        button.innerHTML = '<i class="far fa-heart"></i>';
    } else {
        APP.favorites.add(recipeId);
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i>';
    }
    saveFavorites();
    updateStats();
}

// ⏱️ Sistema de Timer de Cocina
function startCooking(button) {
    const card = button.closest('.recipe-card');
    const time = parseInt(card.dataset.time);
    const title = card.querySelector('h3').textContent;
    
    startCookingTimer(time, title);
}

function startCookingModal(title) {
    const time = 30; // Tiempo por defecto para modal
    startCookingTimer(time, title);
    document.getElementById('quickModal').style.display = 'none';
}

function startCookingTimer(minutes, recipeTitle) {
    const timer = document.getElementById('cookingTimer');
    const display = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    const resetBtn = document.getElementById('resetTimer');
    
    let timeLeft = minutes * 60;
    let isRunning = false;
    
    timer.classList.remove('hidden');
    
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambiar color cuando quede poco tiempo
        if (timeLeft < 60) {
            display.style.color = 'var(--danger)';
            display.classList.add('glow');
        } else {
            display.style.color = 'var(--primary)';
            display.classList.remove('glow');
        }
    }
    
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        
        APP.timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(APP.timerInterval);
                showNotification(`🎉 ¡Tiempo completado! "${recipeTitle}" debe estar listo`, 'success');
                isRunning = false;
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(APP.timerInterval);
        isRunning = false;
    }
    
    function resetTimer() {
        clearInterval(APP.timerInterval);
        timeLeft = minutes * 60;
        isRunning = false;
        updateDisplay();
        display.style.color = 'var(--primary)';
        display.classList.remove('glow');
    }
    
    // Configurar eventos
    startBtn.onclick = startTimer;
    pauseBtn.onclick = pauseTimer;
    resetBtn.onclick = resetTimer;
    
    updateDisplay();
    showNotification(`⏱️ Timer iniciado para "${recipeTitle}" - ${minutes} minutos`, 'info');
}

// 📊 Estadísticas en Tiempo Real
function updateStats() {
    const totalRecipes = APP.recipes.length;
    const favoriteCount = APP.favorites.size;
    const avgTime = calculateAverageTime();
    
    document.getElementById('totalRecipes').textContent = `📊 Total recetas: ${totalRecipes}`;
    document.getElementById('favoriteCount').textContent = `❤️ Favoritos: ${favoriteCount}`;
    document.getElementById('cookingTime').textContent = `⏱️ Tiempo promedio: ${avgTime}min`;
}

function calculateAverageTime() {
    if (APP.recipes.length === 0) return 0;
    
    const totalTime = APP.recipes.reduce((sum, recipe) => {
        return sum + parseInt(recipe.dataset.time || 0);
    }, 0);
    
    return Math.round(totalTime / APP.recipes.length);
}

// 🔧 Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Eliminar notificación existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer; margin-left:1rem;">✕</button>
        </div>
    `;
    
    // Estilos de notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'var(--success)' : 
                   type === 'warning' ? 'var(--warning)' : 
                   type === 'danger' ? 'var(--danger)' : 'var(--primary)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '15px',
        boxShadow: 'var(--shadow)',
        zIndex: '1000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
    });
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// 🎭 Animaciones
function initializeAnimations() {
    // Intersection Observer para animaciones al scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observar todas las cards de recetas
    document.querySelectorAll('.recipe-card').forEach(card => {
        observer.observe(card);
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function loadUserPreferences() {
    // Cargar modo oscuro
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        APP.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
    }
    
    // Cargar favoritos
    loadFavorites();
    
    // Cargar última posición de scroll
    const savedScroll = localStorage.getItem('scrollPosition');
    if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
    }
}

function setupEventListeners() {
    // Toggle modo oscuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Toggle barra de búsqueda
    document.getElementById('searchToggle').addEventListener('click', function() {
        const searchBar = document.getElementById('searchBar');
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        }
    });
    
    // Configurar búsqueda
    setupSearch();
    
    // Guardar posición de scroll
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('scrollPosition', window.scrollY);
    });
    
    // Efectos de hover en cards
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.recipe-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });
}

// 🎵 Efectos de sonido (opcional)
function playSound(effect) {
    // Podrías añadir efectos de sonido aquí
    console.log(`🔊 Reproduciendo sonido: ${effect}`);
}

// 🌟 Inicializar efectos especiales
function initializeSpecialEffects() {
    // Añadir efecto de partículas en el header
    createParticles();
}

function createParticles() {
    // Efecto de partículas simples para el header
    const header = document.querySelector('header');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${5 + Math.random() * 10}s linear infinite;
        `;
        header.appendChild(particle);
    }
}

// Añadir keyframes para partículas
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
    
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

// 🚀 Inicializar efectos especiales cuando todo esté listo
window.addEventListener('load', initializeSpecialEffects);

// 📱 Soporte para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

console.log('🍳 Recetas Pro :V - ¡Aplicación cargada con éxito! :V');
