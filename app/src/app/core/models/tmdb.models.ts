export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  character: string;
}

export interface Credits {
  cast: CastMember[];
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  media_type?: string;
}

export interface TvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  episode_run_time?: number[];
  tagline?: string;
  media_type?: string;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type?: string;
}

export type MediaResult = Movie | TvShow | Person;

export interface TmdbListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface ImageBackdrop {
  file_path: string;
  width: number;
  height: number;
}

export interface ImagesResponse {
  backdrops: ImageBackdrop[];
  posters: ImageBackdrop[];
  logos: ImageBackdrop[];
}

export interface ContentDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres?: Genre[];
  tagline?: string;
  media_type?: string;
  credits?: Credits;
  similar?: TmdbListResponse<MediaResult>;
}

export interface SpotlightData {
  movie: Movie;
  details: ContentDetails;
  backgroundUrl: string;
  trailerUrl: string;
  logoUrl: string;
}