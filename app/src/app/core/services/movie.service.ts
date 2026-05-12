import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Movie,
  TvShow,
  TmdbListResponse,
  VideoResponse,
  ImagesResponse,
  ContentDetails,
  MediaResult,
  SpotlightData
} from '../models/tmdb.models';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;
  private readonly lang = 'pt-BR';

  constructor(private http: HttpClient) {}

  private get<T>(endpoint: string, extraParams: Record<string, any> = {}): Observable<T> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', this.lang);

    Object.entries(extraParams).forEach(([key, value]) => {
      params = params.set(key, String(value));
    });

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  getPopularMovies(page = 1): Observable<TmdbListResponse<Movie>> {
    return this.get<TmdbListResponse<Movie>>('/movie/popular', { page });
  }

  getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page = 1): Observable<TmdbListResponse<Movie>> {
    return this.get<TmdbListResponse<Movie>>(`/trending/movie/${timeWindow}`, { page });
  }

  getTrendingTv(timeWindow: 'day' | 'week' = 'week', page = 1): Observable<TmdbListResponse<TvShow>> {
    return this.get<TmdbListResponse<TvShow>>(`/trending/tv/${timeWindow}`, { page });
  }

  searchMulti(query: string, page = 1): Observable<TmdbListResponse<MediaResult>> {
    return this.get<TmdbListResponse<MediaResult>>('/search/multi', { query, page });
  }

  getMovieDetails(id: number): Observable<ContentDetails> {
    return this.get<ContentDetails>(`/movie/${id}`, {
      append_to_response: 'credits,similar,recommendations',
    });
  }

  getTvDetails(id: number): Observable<ContentDetails> {
    return this.get<ContentDetails>(`/tv/${id}`, {
      append_to_response: 'credits,similar,recommendations',
    });
  }

  getMovieVideos(id: number): Observable<VideoResponse> {
    return this.get<VideoResponse>(`/movie/${id}/videos`);
  }

  getTvVideos(id: number): Observable<VideoResponse> {
    return this.get<VideoResponse>(`/tv/${id}/videos`);
  }

  getMovieImages(id: number): Observable<ImagesResponse> {
    return this.get<ImagesResponse>(`/movie/${id}/images`, {
      include_image_language: 'pt,en,null',
    });
  }

  getTvImages(id: number): Observable<ImagesResponse> {
    return this.get<ImagesResponse>(`/tv/${id}/images`, {
      include_image_language: 'pt,en,null',
    });
  }

  private pickLogoUrl(images: ImagesResponse): string {
    const logos = images?.logos ?? [];
    const ptLogo = logos.find((l) => l.iso_639_1 === 'pt');
    const enLogo = logos.find((l) => l.iso_639_1 === 'en');
    const logo = ptLogo ?? enLogo ?? logos[0];
    return logo
      ? `${environment.tmdbImageUrl}/original${logo.file_path}`
      : '/images/image_not_found.png';
  }

  getContentImages(id: number, type: 'movie' | 'tv'): Observable<ImagesResponse> {
    return type === 'movie' ? this.getMovieImages(id) : this.getTvImages(id);
  }

  getTrailerUrl(id: number, type: 'movie' | 'tv' = 'movie'): Observable<string> {
    const videosReq = type === 'movie' ? this.getMovieVideos(id) : this.getTvVideos(id);

    return videosReq.pipe(
      switchMap((data) => {
        const trailer = data?.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer) return of(`https://www.youtube.com/embed/${trailer.key}`);

        // Fallback: busca em inglês se não encontrar em pt-BR
        let params = new HttpParams()
          .set('api_key', this.apiKey)
          .set('language', 'en-US');
        const endpoint = type === 'movie' ? `/movie/${id}/videos` : `/tv/${id}/videos`;
        return this.http.get<VideoResponse>(`${this.baseUrl}${endpoint}`, { params }).pipe(
          map((d) => {
            const t = d?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
            return t ? `https://www.youtube.com/embed/${t.key}` : '#';
          }),
          catchError(() => of('#'))
        );
      }),
      catchError(() => of('#'))
    );
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return '/images/image_not_found.png';
    return `${environment.tmdbImageUrl}/${size}${path}`;
  }

  getSpotlightMovie(): Observable<SpotlightData> {
    return this.getPopularMovies().pipe(
      switchMap((data) => {
        const movie = data.results[0] ?? data.results[0];
        return forkJoin({
          movie: of(movie),
          details: this.getMovieDetails(movie.id),
          images: this.getMovieImages(movie.id),
          trailerUrl: this.getTrailerUrl(movie.id, 'movie'),
        });
      }),
      map(({ movie, details, images, trailerUrl }) => ({
        movie,
        details,
        backgroundUrl: images?.backdrops?.[0]
          ? `${environment.tmdbImageUrl}/original${images.backdrops[0].file_path}`
          : '/images/image_not_found.png',
        logoUrl: this.pickLogoUrl(images),
        trailerUrl,
      }))
    );
  }

  getSpotlightMovies(count = 5): Observable<SpotlightData[]> {
    return this.getTrendingMovies().pipe(
      switchMap((data) => {
        const movies = data.results.slice(0, count);
        
        return forkJoin(
          movies.map((movie) =>
            forkJoin({
              movie: of(movie),
              details: this.getMovieDetails(movie.id),
              images: this.getMovieImages(movie.id),
              trailerUrl: this.getTrailerUrl(movie.id, 'movie'),
            })
          )
        );
      }),
      map((results) =>
        results.map(({ movie, details, images, trailerUrl }) => ({
          movie,
          details,
          backgroundUrl: images?.backdrops?.[0]
            ? `${environment.tmdbImageUrl}/original${images.backdrops[0].file_path}`
            : '/images/image_not_found.png',
          logoUrl: this.pickLogoUrl(images),
          trailerUrl,
        }))
      )
    );
  }
}
