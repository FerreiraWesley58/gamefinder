// API Key
const API_KEY = 'b321297792304a9fb30fa19edd47b057';
const API_BASE_URL = 'https://api.rawg.io/api';

// Elements
const popularGamesEl = document.getElementById('popularGames');
const trendingGamesEl = document.getElementById('trendingGames');
const upcomingGamesEl = document.getElementById('upcomingGames');
const favoriteGamesEl = document.getElementById('favoriteGames');
const noFavoritesEl = document.getElementById('noFavorites');
const gameDetailsModal = document.getElementById('gameDetailsModal');
const gameDetailsEl = document.getElementById('gameDetails');
const closeModalBtn = document.getElementById('closeModal');
const backToTopBtn = document.getElementById('backToTop');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const notificationEl = document.getElementById('notification');
const logoEl = document.getElementById('logo');
const popularFilters = document.getElementById('popularFilters');

// Favorites
let favorites = JSON.parse(localStorage.getItem('gameFavorites')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPopularGames();
    loadTrendingGames();
    loadUpcomingGames();
    displayFavorites();
    setupEventListeners();
    
    // Show animations on scroll
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'hero') {
            section.style.opacity = 0;
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'all 0.7s ease';
            observer.observe(section);
        }
    });
});

// Setup Event Listeners
function setupEventListeners() {
    // Menu navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            document.getElementById(section).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Modal close
    closeModalBtn.addEventListener('click', () => {
        gameDetailsModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Backdrop click to close modal
    gameDetailsModal.addEventListener('click', (e) => {
        if (e.target === gameDetailsModal) {
            gameDetailsModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
            document.querySelector('header').classList.add('scrolled');
        } else {
            backToTopBtn.classList.remove('visible');
            document.querySelector('header').classList.remove('scrolled');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Slider controls
    document.querySelectorAll('.slider-control').forEach(control => {
        control.addEventListener('click', () => {
            const direction = control.classList.contains('prev') ? -1 : 1;
            const slider = control.getAttribute('data-slider');
            const container = document.getElementById(`${slider}Games`);
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        });
    });
    
    // Search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Logo click
    logoEl.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Platform filters
    document.querySelectorAll('#popularFilters .category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('#popularFilters .category-filter').forEach(f => {
                f.classList.remove('active');
            });
            filter.classList.add('active');
            const platform = filter.getAttribute('data-platform');
            loadPopularGames(platform);
        });
    });
}

// Load Popular Games
function loadPopularGames(platform = 'all') {
    popularGamesEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    let url = `${API_BASE_URL}/games?key=${API_KEY}&ordering=-rating&page_size=12`;
    if (platform !== 'all') {
        url += `&platforms=${platform}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            popularGamesEl.innerHTML = '';
            
            data.results.forEach(game => {
                popularGamesEl.appendChild(createGameCard(game));
            });
        })
        .catch(err => {
            console.error('Error fetching popular games:', err);
            popularGamesEl.innerHTML = '<p>Erro ao carregar jogos. Por favor, tente novamente.</p>';
        });
}

// Load Trending Games
function loadTrendingGames() {
    trendingGamesEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
    const currentDate = new Date().toISOString().split('T')[0];
    
    fetch(`${API_BASE_URL}/games?key=${API_KEY}&dates=${lastMonth},${currentDate}&ordering=-added&page_size=10`)
        .then(response => response.json())
        .then(data => {
            trendingGamesEl.innerHTML = '';
            
            data.results.forEach(game => {
                trendingGamesEl.appendChild(createGameCard(game));
            });
        })
        .catch(err => {
            console.error('Error fetching trending games:', err);
            trendingGamesEl.innerHTML = '<p>Erro ao carregar jogos em destaque. Por favor, tente novamente.</p>';
        });
}

// Load Upcoming Games
function loadUpcomingGames() {
    upcomingGamesEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const currentDate = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    
    fetch(`${API_BASE_URL}/games?key=${API_KEY}&dates=${currentDate},${nextYear}&ordering=released&page_size=10`)
        .then(response => response.json())
        .then(data => {
            upcomingGamesEl.innerHTML = '';
            
            data.results.forEach(game => {
                upcomingGamesEl.appendChild(createGameCard(game));
            });
        })
        .catch(err => {
            console.error('Error fetching upcoming games:', err);
            upcomingGamesEl.innerHTML = '<p>Erro ao carregar próximos lançamentos. Por favor, tente novamente.</p>';
        });
}

// Create Game Card
function createGameCard(game) {
    const card = document.createElement('div');
    card.classList.add('game-card');
    card.setAttribute('data-id', game.id);
    
    // Check if game is favorite
    const isFavorite = favorites.includes(game.id);
    
    // Image fallback
    const imageUrl = game.background_image || '/api/placeholder/300/170';
    
    // Create rating
    const rating = game.rating ? `
        <div class="game-rating">
            <i class="fas fa-star"></i>
            ${game.rating.toFixed(1)}
        </div>
    ` : '';
    
    // Create platforms icons
    let platformsIcons = '';
    if (game.parent_platforms) {
        game.parent_platforms.forEach(p => {
            let icon = '';
            switch (p.platform.slug) {
                case 'pc':
                    icon = 'fa-desktop';
                    break;
                case 'playstation':
                    icon = 'fa-playstation';
                    break;
                case 'xbox':
                    icon = 'fa-xbox';
                    break;
                case 'nintendo':
                    icon = 'fa-gamepad';
                    break;
                case 'ios':
                    icon = 'fa-mobile-alt';
                    break;
                case 'android':
                    icon = 'fa-android';
                    break;
                default:
                    icon = 'fa-gamepad';
            }
            platformsIcons += `<i class="platform-icon fab ${icon}"></i>`;
        });
    }
    
    // Create tags
    let tags = '';
    if (game.genres && game.genres.length > 0) {
        game.genres.slice(0, 2).forEach(genre => {
            tags += `<div class="game-tag">${genre.name}</div>`;
        });
    }
    
    // Format release date
    let releaseDate = 'TBA';
    if (game.released) {
        const date = new Date(game.released);
        releaseDate = date.toLocaleDateString('pt-BR');
    }
    
    card.innerHTML = `
        <div class="favorite-button ${isFavorite ? 'active' : ''}" data-id="${game.id}">
            <i class="fas fa-heart"></i>
        </div>
        <img src="${imageUrl}" alt="${game.name}" class="game-image">
        ${rating}
        <div class="game-info">
            <h3 class="game-title">${game.name}</h3>
            <div class="game-meta">
                <span>${releaseDate}</span>
                <div class="game-platforms">
                    ${platformsIcons}
                </div>
            </div>
            <div class="game-tags">
                ${tags}
            </div>
        </div>
    `;
    
    // Add event listeners
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.favorite-button')) {
            openGameDetails(game.id);
        }
    });
    
    const favoriteBtn = card.querySelector('.favorite-button');
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(game.id, favoriteBtn);
    });
    
    return card;
}

// Open Game Details
function openGameDetails(gameId) {
    gameDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    gameDetailsEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    fetch(`${API_BASE_URL}/games/${gameId}?key=${API_KEY}`)
        .then(response => response.json())
        .then(game => {
            // Get screenshots
            fetch(`${API_BASE_URL}/games/${gameId}/screenshots?key=${API_KEY}`)
                .then(response => response.json())
                .then(screenshots => {
                    renderGameDetails(game, screenshots.results);
                })
                .catch(() => {
                    renderGameDetails(game, []);
                });
        })
        .catch(err => {
            console.error('Error fetching game details:', err);
            gameDetailsEl.innerHTML = '<p>Erro ao carregar detalhes do jogo. Por favor, tente novamente.</p>';
        });
}

// Render Game Details
function renderGameDetails(game, screenshots) {
    // Format release date
    let releaseDate = 'A ser anunciado';
    if (game.released) {
        const date = new Date(game.released);
        releaseDate = date.toLocaleDateString('pt-BR');
    }
    
    // Create platforms icons
    let platformsIcons = '';
    if (game.parent_platforms) {
        game.parent_platforms.forEach(p => {
            let icon = '';
            switch (p.platform.slug) {
                case 'pc':
                    icon = 'fa-desktop';
                    break;
                case 'playstation':
                    icon = 'fa-playstation';
                    break;
                case 'xbox':
                    icon = 'fa-xbox';
                    break;
                case 'nintendo':
                    icon = 'fa-gamepad';
                    break;
                case 'ios':
                    icon = 'fa-mobile-alt';
                    break;
                case 'android':
                    icon = 'fa-android';
                    break;
                default:
                    icon = 'fa-gamepad';
            }
            platformsIcons += `<i class="platform-icon fab ${icon}"></i>`;
        });
    }
    
    // Format genres
    let genres = 'N/A';
    if (game.genres && game.genres.length > 0) {
        genres = game.genres.map(genre => genre.name).join(', ');
    }
    
    // Format publishers
    let publishers = 'N/A';
    if (game.publishers && game.publishers.length > 0) {
        publishers = game.publishers.map(pub => pub.name).join(', ');
    }
    
    // Format developers
    let developers = 'N/A';
    if (game.developers && game.developers.length > 0) {
        developers = game.developers.map(dev => dev.name).join(', ');
    }
    
    // Format platforms
    let platforms = 'N/A';
    if (game.platforms && game.platforms.length > 0) {
        platforms = game.platforms.map(p => p.platform.name).join(', ');
    }
    
    // Check if game is favorite
    const isFavorite = favorites.includes(game.id);
    
    // Create screenshots
    let screenshotsHtml = '';
    if (screenshots && screenshots.length > 0) {
        screenshotsHtml = `
            <div class="game-screenshots">
                <h3>Screenshots</h3>
                <div class="screenshots-grid">
                    ${screenshots.slice(0, 6).map(screenshot => `
                        <div class="screenshot">
                            <img src="${screenshot.image}" alt="Screenshot do jogo">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    gameDetailsEl.innerHTML = `
        <div class="game-hero" style="background-image: url('${game.background_image || '/api/placeholder/800/450'}')">
            <div class="game-hero-overlay"></div>
            <div class="game-hero-content">
                <h1 class="game-detail-title">${game.name}</h1>
                <div class="game-detail-meta">
                    ${game.rating ? `
                        <div class="game-detail-rating">
                            <i class="fas fa-star"></i>
                            ${game.rating.toFixed(1)} / 5
                        </div>
                    ` : ''}
                    <div class="game-detail-release">
                        <i class="far fa-calendar-alt"></i>
                        ${releaseDate}
                    </div>
                    <div class="game-detail-platforms">
                        ${platformsIcons}
                    </div>
                    <div class="favorite-button ${isFavorite ? 'active' : ''}" data-id="${game.id}">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="game-detail-body">
            <div class="game-detail-description">
                ${game.description_raw || 'Sem descrição disponível.'}
            </div>
            
            <div class="game-detail-info">
                <div class="info-item">
                    <h3>Gêneros</h3>
                    <p>${genres}</p>
                </div>
                <div class="info-item">
                    <h3>Plataformas</h3>
                    <p>${platforms}</p>
                </div>
                <div class="info-item">
                    <h3>Desenvolvedores</h3>
                    <p>${developers}</p>
                </div>
                <div class="info-item">
                    <h3>Publicadores</h3>
                    <p>${publishers}</p>
                </div>
                ${game.website ? `
                    <div class="info-item">
                        <h3>Website</h3>
                        <p><a href="${game.website}" target="_blank">${game.website}</a></p>
                    </div>
                ` : ''}
            </div>
            
            ${screenshotsHtml}
        </div>
    `;
    
    // Add event listener to favorite button
    const favoriteBtn = gameDetailsEl.querySelector('.favorite-button');
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(game.id, favoriteBtn);
    });
}

// Toggle Favorite
function toggleFavorite(gameId, button) {
    const index = favorites.indexOf(gameId);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(gameId);
        button.classList.add('active');
        button.classList.add('pulse-animation');
        showNotification('Jogo adicionado aos favoritos!', 'success');
        
        setTimeout(() => {
            button.classList.remove('pulse-animation');
        }, 500);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        button.classList.remove('active');
        showNotification('Jogo removido dos favoritos.', 'error');
    }
    
    // Update localStorage
    localStorage.setItem('gameFavorites', JSON.stringify(favorites));
    
    // Update favorites view if visible
    displayFavorites();
    
    // Update any other instances of this game card
    document.querySelectorAll(`.favorite-button[data-id="${gameId}"]`).forEach(btn => {
        if (btn !== button) {
            if (index === -1) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Display Favorites
function displayFavorites() {
    if (favorites.length === 0) {
        favoriteGamesEl.innerHTML = '';
        noFavoritesEl.style.display = 'block';
        return;
    }
    
    noFavoritesEl.style.display = 'none';
    favoriteGamesEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const promises = favorites.map(id => {
        return fetch(`${API_BASE_URL}/games/${id}?key=${API_KEY}`)
            .then(response => response.json());
    });
    
    Promise.all(promises)
        .then(games => {
            favoriteGamesEl.innerHTML = '';
            games.forEach(game => {
                favoriteGamesEl.appendChild(createGameCard(game));
            });
        })
        .catch(err => {
            console.error('Error fetching favorite games:', err);
            favoriteGamesEl.innerHTML = '<p>Erro ao carregar jogos favoritos. Por favor, tente novamente.</p>';
        });
}

// Search Games
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 3) {
        showNotification('Digite pelo menos 3 caracteres para pesquisar.', 'error');
        return;
    }
    
    popularGamesEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Scroll to popular games section
    document.getElementById('popular').scrollIntoView({
        behavior: 'smooth'
    });
    
    document.querySelector('.section-title').textContent = `Resultados para "${searchTerm}"`;
    
    fetch(`${API_BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(searchTerm)}&page_size=12`)
        .then(response => response.json())
        .then(data => {
            popularGamesEl.innerHTML = '';
            
            if (data.results.length === 0) {
                popularGamesEl.innerHTML = `
                    <div style="text-align: center; grid-column: span 3; padding: 3rem 0;">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--secondary); margin-bottom: 1rem;"></i>
                        <h3>Nenhum resultado encontrado para "${searchTerm}"</h3>
                        <p>Tente pesquisar com outros termos.</p>
                    </div>
                `;
                return;
            }
            
            data.results.forEach(game => {
                popularGamesEl.appendChild(createGameCard(game));
            });
        })
        .catch(err => {
            console.error('Error searching games:', err);
            popularGamesEl.innerHTML = '<p>Erro ao pesquisar jogos. Por favor, tente novamente.</p>';
        });
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
} 