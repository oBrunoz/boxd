import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MovieService } from '../../core/services/movie.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { HeroSectionComponent } from '../../shared/components/hero-section/hero-section.component';
import { Movie, SpotlightData } from '../../core/models/tmdb.models';
import {
  LucideArrowRight,
  LucideFilm,
  LucideStar,
  LucideList,
  LucideDynamicIcon,
  type LucideIcon,
} from '@lucide/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent, HeroSectionComponent, LucideArrowRight, LucideDynamicIcon],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  spotlight = signal<SpotlightData | null>(null);
  trendingMovies = signal<Movie[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  skeletonItems = Array(5).fill(0);
  featuresData: { icon: LucideIcon; title: string; desc: string }[] = [
    {
      icon: LucideFilm,
      title: 'Acompanhe filmes',
      desc: 'Mantenha um registro de todos os filmes que você assistiu e quer assistir. Nunca mais perca suas recomendações.',
    },
    {
      icon: LucideStar,
      title: 'Avalie e critique',
      desc: 'Compartilhe suas opiniões sobre filmes e leia avaliações de outros usuários para descobrir novas obras.',
    },
    {
      icon: LucideList,
      title: 'Crie listas',
      desc: 'Organize seus filmes em listas personalizadas e compartilhe com amigos. Crie coleções temáticas e muito mais.',
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadSpotlight();
      this.loadTrending();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSpotlight(): void {
    this.movieService
      .getSpotlightMovie()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.spotlight.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar spotlight:', err);
          this.isLoading.set(false);
          this.hasError.set(true);
        },
      });
  }

  private loadTrending(): void {
    this.movieService
      .getTrendingMovies('week')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.trendingMovies.set(data.results.slice(0, 10));
        },
        error: (err) => console.error('Erro ao carregar trending:', err),
      });
  }

  get runtime(): string {
    const rt = this.spotlight()?.details?.runtime;
    if (!rt) return '';
    return `${Math.floor(rt / 60)}h ${rt % 60}min`;
  }

  get releaseYear(): string {
    const date = this.spotlight()?.movie?.release_date;
    return date ? String(new Date(date).getFullYear()) : '';
  }

  getMovieYear(movie: Movie): string {
    return movie.release_date ? String(new Date(movie.release_date).getFullYear()) : '';
  }

  retry(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.spotlight.set(null);
    this.trendingMovies.set([]);
    setTimeout(() => {
      this.loadSpotlight();
      this.loadTrending();
    }, 500);
  }
}
