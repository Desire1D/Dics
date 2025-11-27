// Variables globales
let currentTimer = null;
let timerInterval = null;
let timeLeft = 0;
let isTimerRunning = false;
let recognition = null;
let isListening = false;
let currentAudio = null;
let currentRegion = null;
let isMusicPlaying = false;

// Música por región
const regionMusic = {
    costa: [
        {
            title: "Musica endemica de la costa",
            artist: "Deyvis",
            src: "phonk.mp3",
            region: "Costa"
        },
        {
            title: "Vals Peruano",
            artist: "Tradicional Costeño",
            src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            region: "Costa"
        }
    ],
    sierra: [
        {
            title: "Huayno Andino",
            artist: "Música de los Andes",
            src: "Sierra.mp3",
            region: "Sierra"
        },
        {
            title: "Danza de Tijeras",
            artist: "Música Huancavelicana",
            src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            region: "Sierra"
        }
    ],
    selva: [
        {
            title: "Ritmo Amazónico",
            artist: "Música de la Selva",
            src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            region: "Selva"
        },
        {
            title: "Danza Shipiba",
            artist: "Tradición Amazónica",
            src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            region: "Selva"
        }
    ]
};

let currentTrackIndex = 0;
let currentPlaylist = [];

// Función para mejorar navegación en móviles
function setupMobileNavigation() {
    const navLinks = document.querySelector('.nav-links');
    const navContainer = document.querySelector('.nav-container');
    
    // Asegurar que la navegación sea responsive
    function handleResize() {
        if (window.innerWidth <= 768) {
            // En móviles, asegurar que los enlaces sean visibles
            navLinks.style.display = 'flex';
            navLinks.style.overflowX = 'auto';
            navLinks.style.flexWrap = 'nowrap';
        } else {
            // En desktop, comportamiento normal
            navLinks.style.overflowX = 'visible';
            navLinks.style.flexWrap = 'wrap';
        }
    }
    
    // Ejecutar al cargar y al redimensionar
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Mejorar experiencia táctil
    navLinks.addEventListener('touchstart', function() {
        this.style.cursor = 'grabbing';
    });
    
    navLinks.addEventListener('touchend', function() {
        this.style.cursor = 'grab';
    });
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍲 Sabores Ancestrales Perú cargado! 🌄');
    
    // Cargar modo oscuro si estaba guardado
    loadDarkMode();
    
    // Cargar favoritos
    loadFavorites();
    
    // Configurar navegación móvil
    setupMobileNavigation();
    
    // Configurar el botón de modo oscuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Configurar música
    document.getElementById('musicToggle').addEventListener('click', toggleMusicPlayer);
    document.getElementById('playPause').addEventListener('click', togglePlayPause);
    document.getElementById('prevTrack').addEventListener('click', prevTrack);
    document.getElementById('nextTrack').addEventListener('click', nextTrack);
    document.getElementById('closePlayer').addEventListener('click', closeMusicPlayer);
    
    // Configurar navegación suave
    setupSmoothScroll();
    
    // Configurar animaciones de scroll
    setupScrollAnimations();
    
    // Configurar navegación activa
    setupActiveNavigation();
    
    // Configurar búsqueda
    setupSearch();
    
    // Configurar búsqueda por voz
    setupVoiceSearch();
    
    // Configurar modal
    setupModal();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar música por región
    setupRegionMusic();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showNotification('🌄 Bienvenido a Sabores Ancestrales Perú', 'success');
    }, 1000);
});

// Sistema de Música
function setupRegionMusic() {
    document.querySelectorAll('.region-music-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const region = this.dataset.region;
            playRegionMusic(region);
        });
    });
}

function playRegionMusic(region) {
    currentRegion = region;
    currentPlaylist = regionMusic[region] || [];
    currentTrackIndex = 0;
    
    if (currentPlaylist.length > 0) {
        showMusicPlayer();
        loadTrack(currentTrackIndex);
        playCurrentTrack();
        showNotification(`🎵 Reproduciendo música ${getRegionName(region)}`, 'success');
    }
}

function showMusicPlayer() {
    document.getElementById('musicPlayer').classList.remove('hidden');
}

function closeMusicPlayer() {
    document.getElementById('musicPlayer').classList.add('hidden');
    stopMusic();
}

function toggleMusicPlayer() {
    const player = document.getElementById('musicPlayer');
    if (player.classList.contains('hidden')) {
        if (currentRegion) {
            showMusicPlayer();
        } else {
            showNotification('🎵 Selecciona una región para escuchar su música', 'info');
        }
    } else {
        closeMusicPlayer();
    }
}

function loadTrack(index) {
    if (currentPlaylist.length === 0) return;
    
    const track = currentPlaylist[index];
    const audioPlayer = document.getElementById('audioPlayer');
    
    document.getElementById('currentTrack').textContent = track.title;
    document.getElementById('currentRegion').textContent = `${track.artist} - ${track.region}`;
    
    audioPlayer.src = track.src;
    audioPlayer.load();
}

function playCurrentTrack() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playPause');
    
    audioPlayer.play().then(() => {
        isMusicPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(error => {
        console.log('Error reproduciendo audio:', error);
        showNotification('❌ Error reproduciendo música. Usa archivos locales para mejor experiencia.', 'warning');
    });
}

function togglePlayPause() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playPause');
    
    if (isMusicPlaying) {
        audioPlayer.pause();
        isMusicPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        if (currentPlaylist.length === 0) {
            showNotification('🎵 Selecciona una región primero', 'info');
            return;
        }
        playCurrentTrack();
    }
}

function prevTrack() {
    if (currentPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) {
        playCurrentTrack();
    }
}

function nextTrack() {
    if (currentPlaylist.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    loadTrack(currentTrackIndex);
    if (isMusicPlaying) {
        playCurrentTrack();
    }
}

function stopMusic() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playPause');
    
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isMusicPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// Configurar eventos del reproductor de audio
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    
    audioPlayer.addEventListener('ended', function() {
        nextTrack();
    });
    
    audioPlayer.addEventListener('error', function() {
        showNotification('❌ Error cargando la pista de audio', 'danger');
    });
});

// Sistema de Filtros Simplificado
function setupFilters() {
    const filtersToggle = document.getElementById('filtersToggle');
    const showFilters = document.getElementById('showFilters');
    const closeFilters = document.querySelector('.close-filters');
    const clearFilters = document.getElementById('clearFilters');
    const timeFilter = document.getElementById('timeFilter');
    const ingredientsInput = document.getElementById('ingredientsInput');
    const voiceIngredientsBtn = document.getElementById('voiceIngredientsBtn');
    const timeOptions = document.querySelectorAll('.time-options button');
    
    // Toggle panel de filtros
    [filtersToggle, showFilters].forEach(btn => {
        btn?.addEventListener('click', toggleFiltersPanel);
    });
    
    closeFilters?.addEventListener('click', toggleFiltersPanel);
    
    // Limpiar filtros
    clearFilters?.addEventListener('click', clearAllFilters);
    
    // Actualizar display del tiempo y aplicar filtros automáticamente
    timeFilter?.addEventListener('input', function() {
        updateTimeDisplay();
        applyAllFilters();
    });
    
    // Botones de tiempo rápido
    timeOptions?.forEach(btn => {
        btn.addEventListener('click', function() {
            const time = parseInt(this.dataset.time);
            document.getElementById('timeFilter').value = time;
            updateTimeDisplay();
            applyAllFilters();
        });
    });
    
    // Ingredientes con Enter - aplicar automáticamente
    ingredientsInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addIngredientTag(this.value.trim());
            this.value = '';
            applyAllFilters();
        }
    });
    
    // Voz para ingredientes
    setupVoiceIngredients(voiceIngredientsBtn);
}

function toggleFiltersPanel() {
    const panel = document.getElementById('filtersPanel');
    panel.classList.toggle('active');
    
    // Crear overlay si no existe
    let overlay = document.querySelector('.filters-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'filters-overlay';
        overlay.addEventListener('click', toggleFiltersPanel);
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('active');
}

function updateTimeDisplay() {
    const timeValue = document.getElementById('timeFilter').value;
    document.getElementById('currentTime').textContent = `Tengo ${timeValue} minutos`;
}

function addIngredientTag(ingredient) {
    if (!ingredient) return;
    
    const tagsContainer = document.getElementById('ingredientsTags');
    const tag = document.createElement('div');
    tag.className = 'ingredient-tag';
    tag.innerHTML = `
        ${ingredient}
        <button onclick="removeIngredientTag(this)">&times;</button>
    `;
    tagsContainer.appendChild(tag);
}

function removeIngredientTag(button) {
    button.parentElement.remove();
    applyAllFilters();
}

function setupVoiceIngredients(button) {
    if (!button) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onstart = function() {
            button.classList.add('voice-listening');
            showNotification('🎤 Dime los ingredientes que tienes...', 'info');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            const ingredients = transcript.toLowerCase().split(/ y |,|\.| /).filter(i => i.length > 2);
            
            ingredients.forEach(ingredient => {
                addIngredientTag(ingredient.trim());
            });
            
            button.classList.remove('voice-listening');
            showNotification(`✅ Ingredientes agregados: ${ingredients.join(', ')}`, 'success');
            applyAllFilters();
        };
        
        recognition.onerror = function(event) {
            console.error('Error en reconocimiento de voz:', event.error);
            button.classList.remove('voice-listening');
            showNotification('❌ Error en reconocimiento de voz', 'danger');
        };
        
        button.addEventListener('click', function() {
            recognition.start();
        });
    } else {
        button.style.display = 'none';
    }
}

function applyAllFilters() {
    const maxTime = parseInt(document.getElementById('timeFilter').value);
    const ingredientTags = Array.from(document.querySelectorAll('.ingredient-tag'))
        .map(tag => tag.textContent.replace('×', '').trim().toLowerCase());
    
    // Filtrar recetas
    const recipes = document.querySelectorAll('.recipe-card');
    let visibleCount = 0;
    
    recipes.forEach(recipe => {
        const recipeTime = parseInt(recipe.dataset.time);
        const recipeIngredients = recipe.dataset.ingredients?.split(',') || [];
        
        const timeMatch = recipeTime <= maxTime;
        const ingredientsMatch = ingredientTags.length === 0 || 
            ingredientTags.every(tag => recipeIngredients.some(ing => ing.includes(tag)));
        
        if (timeMatch && ingredientsMatch) {
            recipe.style.display = 'flex';
            visibleCount++;
        } else {
            recipe.style.display = 'none';
        }
    });
    
    // Mostrar notificación solo si hay filtros activos
    if (maxTime < 240 || ingredientTags.length > 0) {
        showNotification(`🔍 Mostrando ${visibleCount} recetas con los filtros aplicados`, 'success');
    }
}

function clearAllFilters() {
    // Restablecer tiempo
    document.getElementById('timeFilter').value = 240;
    updateTimeDisplay();
    
    // Limpiar ingredientes
    document.getElementById('ingredientsTags').innerHTML = '';
    document.getElementById('ingredientsInput').value = '';
    
    // Mostrar todas las recetas
    document.querySelectorAll('.recipe-card').forEach(recipe => {
        recipe.style.display = 'flex';
    });
    
    showNotification('✨ Filtros limpiados - Mostrando todas las recetas', 'info');
}

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
            description: card.querySelector('.recipe-desc').textContent,
            ingredients: Array.from(card.querySelectorAll('.ingredients li')).map(li => li.textContent),
            preparation: Array.from(card.querySelectorAll('.preparation li')).map(li => li.textContent),
            id: card.dataset.id
        };
        
        favorites.push(recipeData);
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
        card.classList.add('favorite-recipe');
        showNotification(`❤️ "${recipeTitle}" agregado a favoritos`);
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
                <p>Haz clic en el corazón de las recetas que más te gusten para agregarlas a esta sección.</p>
            </div>
        `;
        return;
    }
    
    // Mostrar recetas favoritas
    container.innerHTML = favorites.map(recipe => `
        <div class="recipe-card favorite-recipe" data-time="${recipe.time}" data-difficulty="${recipe.difficulty}" data-id="${recipe.id}">
            <div class="card-header">
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="card-overlay">
                    <span class="card-badge ${recipe.difficulty}">${getDifficultyText(recipe.difficulty)}</span>
                </div>
            </div>
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.time}min</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${getRegionName(recipe.section)}</span>
                    <span><i class="fas fa-fire"></i> ${getCalories(recipe.time)} cal</span>
                </div>
                <p class="recipe-desc">${recipe.description}</p>
                
                ${recipe.ingredients ? `
                <div class="ingredients">
                    <h4><i class="fas fa-list"></i> Ingredientes</h4>
                    <ul>
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${recipe.preparation ? `
                <div class="preparation">
                    <h4><i class="fas fa-blender"></i> Preparación</h4>
                    <ol>
                        ${recipe.preparation.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                ` : ''}
                
                <div class="card-actions">
                    <button class="btn-favorite active" onclick="toggleFavorite(this)">
                        <i class="fas fa-heart"></i> En Favoritos
                    </button>
                    <button class="btn-timer" onclick="startTimer(${recipe.time}, this)">
                        <i class="fas fa-clock"></i> Timer
                    </button>
                    <button class="btn-view" onclick="viewRecipe('${recipe.id}')">
                        <i class="fas fa-expand"></i> Ver más
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

function getCalories(time) {
    // Cálculo simple de calorías basado en el tiempo de preparación
    return Math.floor(time * 8 + 150);
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
            
            // Notificación cuando queden 5 minutos
            if (timeLeft === 300) {
                showNotification('⏰ ¡Quedan 5 minutos! Prepárate para finalizar', 'warning');
            }
            
            // Notificación cuando quede 1 minuto
            if (timeLeft === 60) {
                showNotification('🔔 ¡Último minuto! Revisa tu preparación', 'danger');
            }
        } else if (timeLeft === 0) {
            clearInterval(timerInterval);
            showNotification('🎉 ¡Tiempo completado! Tu platillo ancestral está listo', 'success');
            playCompletionSound();
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
    } else if (timeLeft < 300) {
        display.style.color = 'var(--warning)';
    } else {
        display.style.color = 'var(--primary)';
    }
}

function playCompletionSound() {
    // Crear un sonido simple usando el Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (e) {
        console.log('El audio no está disponible en este navegador');
    }
}

// Navegación suave
function setupSmoothScroll() {
    document.querySelectorAll('nav a, .hero-buttons a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Ocultar todas las secciones primero
                    document.querySelectorAll('.recipe-section').forEach(section => {
                        section.style.display = 'none';
                    });
                    
                    // Mostrar solo la sección seleccionada
                    targetSection.style.display = 'block';
                    
                    // Actualizar navegación activa
                    updateActiveNavigation(targetId);
                    
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Navegación activa
function setupActiveNavigation() {
    // Observar las secciones para actualizar la navegación
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveNavigation(`#${id}`);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function updateActiveNavigation(targetId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Animaciones al hacer scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observar todas las tarjetas de recetas
    document.querySelectorAll('.recipe-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observar elementos del hero
    document.querySelectorAll('.hero h1, .hero p, .hero-buttons').forEach(el => {
        el.classList.add('fade-in');
    });
}

// Sistema de búsqueda
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (query === '') {
        showNotification('🔍 Escribe algo para buscar', 'warning');
        return;
    }
    
    const results = searchRecipes(query);
    
    if (results.length > 0) {
        // Mostrar resultados en modal
        showSearchResults(results, query);
        showNotification(`🔍 Encontradas ${results.length} recetas para "${query}"`, 'success');
    } else {
        showNotification(`❌ No se encontraron recetas para "${query}"`, 'danger');
    }
}

function searchRecipes(query) {
    const recipes = document.querySelectorAll('.recipe-card');
    const results = [];
    
    recipes.forEach(recipe => {
        const title = recipe.querySelector('h3').textContent.toLowerCase();
        const description = recipe.querySelector('.recipe-desc').textContent.toLowerCase();
        const ingredients = Array.from(recipe.querySelectorAll('.ingredients li'))
            .map(li => li.textContent.toLowerCase())
            .join(' ');
        
        if (title.includes(query.toLowerCase()) || 
            description.includes(query.toLowerCase()) || 
            ingredients.includes(query.toLowerCase())) {
            results.push({
                element: recipe,
                title: recipe.querySelector('h3').textContent,
                id: recipe.dataset.id,
                section: recipe.closest('.recipe-section').id
            });
        }
    });
    
    return results;
}

function showSearchResults(results, query) {
    const modalContent = document.getElementById('modalRecipeContent');
    
    modalContent.innerHTML = `
        <div class="search-results-header">
            <h2>Resultados de búsqueda: "${query}"</h2>
            <p>Se encontraron ${results.length} recetas</p>
        </div>
        <div class="search-results-list">
            ${results.map(result => `
                <div class="search-result-item" onclick="viewRecipe('${result.id}')">
                    <h3>${result.title}</h3>
                    <p>${getRegionName(result.section)}</p>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('')}
        </div>
    `;
    
    // Mostrar modal
    document.getElementById('recipeModal').style.display = 'block';
}

// Búsqueda por voz
function setupVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    
    // Verificar si el navegador soporta reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onstart = function() {
            isListening = true;
            voiceBtn.classList.add('voice-listening');
            showNotification('🎤 Escuchando... Habla ahora', 'info');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('searchInput').value = transcript;
            voiceBtn.classList.remove('voice-listening');
            isListening = false;
            
            // Realizar búsqueda automáticamente
            setTimeout(() => {
                performSearch();
            }, 500);
        };
        
        recognition.onerror = function(event) {
            console.error('Error en reconocimiento de voz:', event.error);
            voiceBtn.classList.remove('voice-listening');
            isListening = false;
            showNotification('❌ Error en reconocimiento de voz', 'danger');
        };
        
        recognition.onend = function() {
            voiceBtn.classList.remove('voice-listening');
            isListening = false;
        };
        
        voiceBtn.addEventListener('click', function() {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        // El navegador no soporta reconocimiento de voz
        voiceBtn.style.display = 'none';
        console.log('El reconocimiento de voz no es compatible con este navegador');
    }
}

// Modal para mostrar recetas
function setupModal() {
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function viewRecipe(recipeId) {
    const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
    
    if (!recipeCard) {
        showNotification('❌ Receta no encontrada', 'danger');
        return;
    }
    
    const modalContent = document.getElementById('modalRecipeContent');
    const title = recipeCard.querySelector('h3').textContent;
    const image = recipeCard.querySelector('img').src;
    const time = recipeCard.dataset.time;
    const difficulty = recipeCard.dataset.difficulty;
    const description = recipeCard.querySelector('.recipe-desc').textContent;
    const ingredients = Array.from(recipeCard.querySelectorAll('.ingredients li')).map(li => li.textContent);
    const preparation = Array.from(recipeCard.querySelectorAll('.preparation li')).map(li => li.textContent);
    
    modalContent.innerHTML = `
        <div class="modal-recipe">
            <div class="card-header">
                <img src="${image}" alt="${title}">
                <div class="card-overlay">
                    <span class="card-badge ${difficulty}">${getDifficultyText(difficulty)}</span>
                </div>
            </div>
            <div class="recipe-content">
                <h2>${title}</h2>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${time} min</span>
                    <span><i class="fas fa-users"></i> 4-6 personas</span>
                    <span><i class="fas fa-fire"></i> ${getCalories(time)} cal</span>
                </div>
                <p class="recipe-desc">${description}</p>
                
                <div class="ingredients">
                    <h3><i class="fas fa-list"></i> Ingredientes</h3>
                    <ul>
                        ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>

                <div class="preparation">
                    <h3><i class="fas fa-blender"></i> Preparación</h3>
                    <ol>
                        ${preparation.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>

                <div class="card-actions">
                    <button class="btn-favorite" onclick="toggleFavoriteInModal('${recipeId}')">
                        <i class="far fa-heart"></i> Favorito
                    </button>
                    <button class="btn-timer" onclick="startTimer(${time}, this)">
                        <i class="fas fa-clock"></i> Timer
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Marcar como favorito si ya lo es
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(fav => fav.id === recipeId);
    
    if (isFavorite) {
        const favoriteBtn = modalContent.querySelector('.btn-favorite');
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
    }
    
    // Mostrar modal
    document.getElementById('recipeModal').style.display = 'block';
}

function toggleFavoriteInModal(recipeId) {
    const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);
    
    if (recipeCard) {
        const favoriteBtn = recipeCard.querySelector('.btn-favorite');
        toggleFavorite(favoriteBtn);
        
        // Actualizar botón en el modal
        const modalFavoriteBtn = document.querySelector('#modalRecipeContent .btn-favorite');
        const isFavorite = favoriteBtn.classList.contains('active');
        
        if (isFavorite) {
            modalFavoriteBtn.classList.add('active');
            modalFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> En Favoritos';
        } else {
            modalFavoriteBtn.classList.remove('active');
            modalFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favorito';
        }
    }
}

// Notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 
                     type === 'warning' ? 'var(--warning)' : 
                     type === 'danger' ? 'var(--danger)' : 'var(--primary)'};
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
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Estilos para resultados de búsqueda */
    .search-results-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--primary-light);
    }
    
    .search-results-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .search-result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--light);
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: var(--transition);
        border: 2px solid transparent;
    }
    
    .search-result-item:hover {
        border-color: var(--primary);
        transform: translateY(-3px);
        box-shadow: var(--shadow-hover);
    }
    
    .search-result-item h3 {
        margin-bottom: 0.5rem;
        color: var(--primary);
    }
    
    .search-result-item p {
        margin-bottom: 0;
        color: var(--gray);
        font-size: 0.9rem;
    }
    
    .search-result-item i {
        color: var(--primary);
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

// Utilidades adicionales
function filterByRegion(region) {
    const sections = document.querySelectorAll('.recipe-section');
    
    sections.forEach(section => {
        if (region === 'all' || section.id === region) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Exportar funciones para uso global
window.toggleFavorite = toggleFavorite;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.hideTimer = hideTimer;
window.viewRecipe = viewRecipe;
window.searchRecipes = searchRecipes;
window.filterByRegion = filterByRegion;
window.addIngredientTag = addIngredientTag;
window.removeIngredientTag = removeIngredientTag;
window.toggleFiltersPanel = toggleFiltersPanel;
window.applyAllFilters = applyAllFilters;
window.clearAllFilters = clearAllFilters;

console.log('✅ ¡Sabores Ancestrales Perú cargado correctamente!');
