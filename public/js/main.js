document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fetchTrendingMovies();
    }, 1500);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Alternar visibilidade da senha
    const togglePassword = document.getElementById('toggle-password');
    const password = document.getElementById('password');

    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
});
})

async function fetchTrendingMovies() {
    const response = await fetch("/api/movies/popular");
    const data = await response.json();

    // Pega o primeiro filme da lista
    const movie = data.results[0];
    console.log(movie)
    if (!movie) return;

    // Atualiza o conteúdo da página com os dados do filme
    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("movie-rating").textContent = movie.vote_average.toFixed(1);
    document.getElementById("movie-year").textContent = new Date(movie.release_date).getFullYear();

    fetch(`/api/movies/${movie.id}`).then(data => data.json()).then(({runtime}) => 
        document.querySelector("#movie-duration").textContent = `${Math.floor(runtime / 60)}h ${runtime % 60}min`
    ) 
    document.querySelector('.sinopse').textContent = movie.overview
    
    // Pegando o primeiro gênero da lista
    document.getElementById("movie-genre").textContent = movie.genre_ids.length > 0 ? await getGenreName(movie.genre_ids[0]) : "Desconhecido";
    
    document.getElementById("movie-description").textContent = movie.overview;
    document.getElementById("movie-poster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    
    // Link para o trailer (precisa buscar os vídeos do filme)
    const trailerUrl = await getTrailerUrl(movie.id);
    document.getElementById("movie-trailer").href = trailerUrl;
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