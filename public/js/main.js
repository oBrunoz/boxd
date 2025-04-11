let debounceTimeout;
let player;

document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('toggle-password');
    const password = document.getElementById('password');
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    // verifica se o campo de busca existe e chama a função de configuração
    if (searchInput && searchResults) {
        setupSearch(searchInput, searchResults);
    }
    
    const detailsTrailerBtn = document.getElementById('details-trailer');
    if (detailsTrailerBtn) {
        setupDetailsPageTrailer(detailsTrailerBtn);
    }
    
    // verifica se o botão de trailer da página inicial existe
    const homeTrailerBtn = document.getElementById('movie-trailer');
    if (homeTrailerBtn && document.getElementById('movie-skeleton')) {
        setTimeout(() => {
            getTrendingMovies();
        }, 1500);
        
        setupHomePageTrailer(homeTrailerBtn);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    if (window.location.pathname.includes('login')) {
        // Alternar visibilidade da senha
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
});

// Função para configurar a busca com debounce
function setupSearch(searchInput, searchResults) {
    let debounceTimeout;
    
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();

        // Limpa o debounce anterior
        clearTimeout(debounceTimeout);

        // Espera 400ms antes de buscar novamente
        debounceTimeout = setTimeout(async () => {
            if (!query) {
                renderSearchResults([]); // limpa resultados
                return;
            }

            try {
                const results = await searchMulti(query);
                renderSearchResults(results);
            } catch (error) {
                console.error("Erro na busca:", error);
            }
        }, 400);
    });
    
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            hideSearchResults(searchResults);
        }, 150);
    });
}

// Funcão para configurar o trailer na página de detalhes
function setupDetailsPageTrailer(trailerBtn) {
    const trailerContainer = document.getElementById('details-trailer-container');
    const trailerPlayer = document.getElementById('details-player');
    const backgroundImg = document.getElementById('details-container-image');
    
    // Try to fetch and set trailer URL if not already set
    if (trailerBtn.getAttribute('data-trailer-url') === '#') {
        // Extract content type and ID from URL
        const urlParts = window.location.pathname.split('/');
        const contentType = urlParts[urlParts.length - 2]; // 'movies', 'series', etc.
        const contentId = urlParts[urlParts.length - 1]; // ID
        
        getTrailerUrl(contentId, contentType === 'movies' ? 'movie' : 'tv')
            .then(url => {
                trailerBtn.setAttribute('data-trailer-url', url);
            })
            .catch(err => {
                console.error("Erro ao buscar trailer:", err);
            });
    }
    
    trailerBtn.addEventListener('click', (e) => {
        e.preventDefault();
    
        const youtubeTrailerUrl = trailerBtn.getAttribute('data-trailer-url');
        if (!youtubeTrailerUrl || youtubeTrailerUrl === "#") return;
    
        // Oculta a imagem de fundo com efeito
        backgroundImg.classList.add('opacity-0');
    
        // Ativa o container do trailer
        trailerContainer.classList.remove('opacity-0', 'pointer-events-none');
        trailerContainer.classList.add('opacity-100', 'pointer-events-auto', 'transition-all', 'duration-1000');

        const content = document.getElementById("details-content");
        content.classList.add('pointer-events-none', 'opacity-0', 'transition-all', 'duration-1000');
    
        // Insere o vídeo com autoplay
        const embedUrl = youtubeTrailerUrl + "?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&enablejsapi=1";
        trailerPlayer.src = embedUrl;
    });
    
    // Fechar ao clicar fora do vídeo
    trailerContainer.addEventListener('click', (e) => {
        // Verifica se o clique não foi no iframe
        if (!e.target.closest('iframe')) {
            closeDetailsTrailer();
        }
    });
}

// Função para configurar o trailer na página inicial
function setupHomePageTrailer(trailerBtn) {
    const trailerContainer = document.getElementById('trailer-container');
    const trailerPlayer = document.getElementById('player');
    const backgroundImg = document.getElementById('container-image');
    
    trailerBtn.addEventListener('click', (e) => {
        e.preventDefault();
    
        const youtubeTrailerUrl = trailerBtn.getAttribute('data-trailer-url');
        if (!youtubeTrailerUrl || youtubeTrailerUrl === "#") return;
    
        // Oculta a imagem de fundo com efeito
        backgroundImg.classList.add('opacity-0');
    
        // Ativa o container do trailer
        trailerContainer.classList.remove('opacity-0', 'pointer-events-none');
        trailerContainer.classList.add('opacity-100', 'pointer-events-auto', 'transition-all', 'duration-1000');

        const content = document.getElementById("movie-content");
        content.classList.add('pointer-events-none', 'opacity-0', 'transition-all', 'duration-1000');
    
        // Insere o vídeo com autoplay
        const embedUrl = youtubeTrailerUrl + "?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&enablejsapi=1";
        trailerPlayer.src = embedUrl;
    });
    
    // Fechar ao clicar fora do vídeo
    trailerContainer.addEventListener('click', (e) => {
        // Verifica se o clique não foi no iframe
        if (!e.target.closest('iframe')) {
            closeHomeTrailer();
        }
    });
}

// Função para fechar o trailer e restaurar a UI na página de detalhes
function closeDetailsTrailer() {
    const trailerContainer = document.getElementById('details-trailer-container');
    const trailerPlayer = document.getElementById('details-player');
    const content = document.getElementById("details-content");
    const backgroundImg = document.getElementById('details-container-image');
    
    // Oculta o trailer
    trailerContainer.classList.add('opacity-0', 'pointer-events-none');
    trailerContainer.classList.remove('opacity-100', 'pointer-events-auto');
    
    // Exibe o fundo e conteúdo
    backgroundImg.classList.remove('opacity-0');
    content.classList.remove('pointer-events-none', 'opacity-0');
    
    // Limpa o src do iframe para parar o vídeo
    trailerPlayer.src = '';
}

// Função para fechar o trailer e restaurar a UI
function closeHomeTrailer() {
    const trailerContainer = document.getElementById('trailer-container');
    const trailerPlayer = document.getElementById('player');
    const content = document.getElementById("movie-content");
    const backgroundImg = document.getElementById('container-image');
    
    // Oculta o trailer
    trailerContainer.classList.add('opacity-0', 'pointer-events-none');
    trailerContainer.classList.remove('opacity-100', 'pointer-events-auto');
    
    // Exibe o fundo e conteúdo
    backgroundImg.classList.remove('opacity-0');
    content.classList.remove('pointer-events-none', 'opacity-0');
    
    // Limpa o src do iframe para parar o vídeo
    trailerPlayer.src = '';
}

// Função para buscar filmes populares e atualizar a UI
async function getTrendingMovies() {
    const skeleton = document.getElementById("movie-skeleton");
    const content = document.getElementById("movie-content");
  
    skeleton.classList.remove("hidden");
    content.classList.add("hidden");

    try {
        const movie = await updateMain()
      try {
        updateSecondary(movie)

      } catch (err) {
        console.error("Erro ao buscar detalhes do filme:", err);
        document.getElementById("movie-genre").textContent = "Desconhecido";
      }
  
      // Trailer
      try {
        const trailerUrl = await getTrailerUrl(movie.id);
        document.getElementById("movie-trailer").href = trailerUrl;
        document.getElementById("movie-trailer").setAttribute("data-trailer-url", trailerUrl);
      } catch (err) {
        console.error("Erro ao buscar trailer:", err);
        document.getElementById("movie-trailer").href = "#";
      }
  
    } catch (error) {
      console.error("Erro ao buscar filmes populares:", error);
    }
}
  
// Função para obter o nome do gênero baseado no ID
async function getGenreName(genreId) {
    const genreResponse = await fetch("/api/genres");
    const genreData = await genreResponse.json();

    const genre = genreData.genres.find(g => g.id === genreId);
    return genre ? genre.name : "Desconhecido";
}

// Função para obter a URL do trailer do filme
async function getTrailerUrl(id, type = 'movie') {
    const endpoint = type === 'movie' ? 'movies' : 'tv';
    
    let response = await fetch(`/api/${endpoint}/${id}/videos?language=pt-BR`);
    let data = await response.json();
    
    if (!data?.results?.length) {
        response = await fetch(`/api/${endpoint}/${id}/videos?language=${encodeURIComponent("en-US")}`);
        data = await response.json();
    }
    
    const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : "#";
}

// Função para buscar filmes, séries e pessoas
async function searchMulti(query) {
    const multiResponse = await fetch(`/api/movies/multi?q=${encodeURIComponent(query)}`);
    if (!multiResponse.ok) {
        throw new Error('Erro ao buscar dados multi');
    }
    const multiData = await multiResponse.json();

    return multiData.results;
}

// Renderiza os resultados da busca
function renderSearchResults(results) {
    const container = document.getElementById("search-results");
    const template = document.getElementById("search-result-template");
    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML = `<p class="p-4 text-sm text-zinc-400">Nenhum resultado encontrado.</p>`;
        showSearchResults(container);
        return;
    }

    results.forEach(item => {
        const title = item.title || item.name || item.original_name || item.original_title;
        if (!title) return;
        
        const type = item.media_type === "movie" ? "🎬 Filme" :
                    item.media_type === "tv" ? "📺 Série" :
                    item.media_type === "person" ? "👤 Pessoa" : "🎲 Outro";
        
        const year = item.release_date 
        ? new Date(item.release_date).getFullYear() 
        : item.first_air_date 
        ? new Date(item.first_air_date).getFullYear() 
        : "";
        
        const imagePath = item.poster_path || item.profile_path || item.backdrop_path;
        const imageUrl = imagePath 
            ? `https://image.tmdb.org/t/p/w92${imagePath}` 
            : "/images/image_not_found.png";
        
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector("a");
        const img = clone.querySelector("img");
        const titleEl = clone.querySelector(".title");
        const yearEl = clone.querySelector(".year");
        const typeEl = clone.querySelector(".type");
        
        card.href = `/search/${item.media_type === 'movie' ? 'movies' : item.media_type === 'tv' ? 'series' : 'people'}/${item.id}`;
        img.classList.add("animate-pulse");
        img.src = imageUrl;
        
        img.onload = () => {
            img.classList.remove("animate-pulse");
        }

        titleEl.textContent = title;
        yearEl.textContent = year;
        typeEl.textContent = type;
        
        container.appendChild(clone);
        });    
        
    showSearchResults(container);
}

// Exibe os resultados da busca
function showSearchResults(container) {
    container.classList.remove('scale-y-0', 'opacity-0', 'pointer-events-none');
    container.classList.add('scale-y-100', 'opacity-100', 'pointer-events-auto');
}

// Esconde os resultados da busca
function hideSearchResults(container) {
    container.classList.remove('scale-y-100', 'opacity-100', 'pointer-events-auto');
    container.classList.add('scale-y-0', 'opacity-0', 'pointer-events-none');
}

// 
async function updateMain() {
    const response = await fetch("/api/movies/popular");
    const data = await response.json();

    const movie = data.results[3];
    if (!movie) return;

    // Atualiza os elementos principais
    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("movie-rating").textContent = movie.vote_average.toFixed(1);
    document.getElementById("movie-year").textContent = new Date(movie.release_date).getFullYear();
    document.querySelector('.sinopse').textContent = movie.overview;

    const bgImg = document.getElementById("background-img");
    const containerImg = document.getElementById("container-image");
    const skeleton = document.getElementById("movie-skeleton");
    const content = document.getElementById("movie-content");

    const newSrc = await getBackgroundImage(movie.id);
    // Pré-carrega a imagem antes de exibir
    const imgPreload = new Image();

    imgPreload.onload = () => {
        bgImg.src = newSrc;
        requestAnimationFrame(() => {
            bgImg.classList.remove("opacity-0");
            bgImg.classList.add("opacity-30");
            containerImg.classList.remove("animate-pulse");

            skeleton.classList.add("hidden");
            content.classList.remove("hidden");
        });
    };

    imgPreload.src = newSrc;

    return movie;
}

async function updateSecondary(movie) {
    const detailRes = await fetch(`/api/movies/${movie.id}`);
    const { runtime, tagline, genres } = await detailRes.json();
    const genresContainer = document.getElementById("movie-genres");

    document.querySelector("#movie-duration").textContent = `${Math.floor(runtime / 60)}h ${runtime % 60}min`;
    document.querySelector("#movie-tagline").textContent = tagline || "";
    genresContainer.innerHTML = ""; // limpa antes de inserir

    genres.forEach(({ name }) => {
        const badge = document.createElement("span");
        badge.textContent = name;
        badge.className = "bg-yellow-400/10 border border-yellow-500 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full";
        genresContainer.appendChild(badge);
    });
}

// Função para buscar a imagem de fundo do filme
async function getBackgroundImage(movieId) {
    images = await fetch(`/api/movies/${movieId}/images`);
    data = await images.json()
    const backdrops = data['backdrops'][0]
    const file_path = backdrops['file_path']
    
    return `https://image.tmdb.org/t/p/original/${file_path}`
}