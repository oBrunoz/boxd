let debounceTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('toggle-password');
    const password = document.getElementById('password');
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    if (document.getElementById('movie-skeleton')) {
        setTimeout(() => {
            getTrendingMovies();
        }, 1500);
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

    if (document.getElementById('search-input')) {
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
})

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
      } catch (err) {
        console.error("Erro ao buscar trailer:", err);
        document.getElementById("movie-trailer").href = "#";
      }
  
    } catch (error) {
      console.error("Erro ao buscar filmes populares:", error);
    } finally {
        skeleton.classList.add("hidden");
        content.classList.remove("hidden");
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
async function getTrailerUrl(movieId) {
    const response = await fetch(`/api/movies/${movieId}/videos`);
    const data = await response.json();
    
    const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "#";
}

async function searchMulti(query) {
    const multiResponse = await fetch(`/api/movies/multi?q=${encodeURIComponent(query)}`);
    if (!multiResponse.ok) {
        throw new Error('Erro ao buscar dados multi');
    }
    const multiData = await multiResponse.json();

    return multiData.results;
}

function renderSearchResults(results) {
    const container = document.getElementById("search-results");
    container.innerHTML = "";

    if (!results.length) {
        container.innerHTML = `<p class="p-4 text-sm text-zinc-400">Nenhum resultado encontrado.</p>`;
        showSearchResults(container);
        return;
    }

    results.forEach(item => {
        console.log(item)
        const card = document.createElement("a");
        card.className = "flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors duration-200 rounded cursor-pointer";
        card.href = `/${item.media_type === 'movie' ? 'movies' : item.media_type === 'tv' ? 'series' : 'people'}/${item.id}`;
    
        const title = item.title || item.name || item.original_name || item.original_title;

        if (title) {
            const type = item.media_type === "movie" ? "🎬 Filme" :
            item.media_type === "tv" ? "📺 Série" :
                     item.media_type === "person" ? "👤 Pessoa" : "🎲 Outro";
            const year = item.first_air_date ? new Date(item.first_air_date).getFullYear() : "";
    
            const imagePath = item.poster_path || item.profile_path || item.backdrop_path;
            const imageUrl = imagePath 
                ? `https://image.tmdb.org/t/p/w92${imagePath}` 
                : "images/image_not_found.png";
        
            card.innerHTML = `
                <img src="${imageUrl}" alt="Imagem de ${title}" class="w-12 h-16 object-cover rounded bg-zinc-800" />
                <div class="flex flex-col">
                    <div class="flex flex-row gap-3">
                        <h3 class="text-sm font-medium line-clamp-1">${title}</h3>
                        <h3 class="text-sm font-light line-clamp-1 text-gray-400">${year}</h3>
                    </div>
                    <p class="text-xs text-zinc-400">${type}</p>
                </div>
                `;
                
            container.appendChild(card);
        }
    });
        
    showSearchResults(container);
}

function showSearchResults(container) {
    container.classList.remove('scale-y-0', 'opacity-0', 'pointer-events-none');
    container.classList.add('scale-y-100', 'opacity-100', 'pointer-events-auto');
}

function hideSearchResults(container) {
    container.classList.remove('scale-y-100', 'opacity-100', 'pointer-events-auto');
    container.classList.add('scale-y-0', 'opacity-0', 'pointer-events-none');
}


async function updateMain() {
    const response = await fetch("/api/movies/popular");
    const data = await response.json();

//     for(i=0; i<=10; i++){
//     setTimeout(() => {
        
//     }, "30000")
// }
    const movie = data.results[0];
    if (!movie) return;

    // Atualiza os elementos principais
    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("movie-rating").textContent = movie.vote_average.toFixed(1);
    document.getElementById("movie-year").textContent = new Date(movie.release_date).getFullYear();
    document.querySelector('.sinopse').textContent = movie.overview;
    document.querySelector('#background-img').src = await getBackgroundImage(movie.id)
    return movie
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


async function getBackgroundImage(movieId) {
    images = await fetch(`/api/movies/${movieId}/images`);
    data = await images.json()
    const backdrops = data['backdrops'][0]
    const file_path = backdrops['file_path']
    
    return `https://image.tmdb.org/t/p/original/${file_path}`
}