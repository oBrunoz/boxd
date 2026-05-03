import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, switchMap, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MovieService } from '../../core/services/movie.service';
import { ContentDetails } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('trailerPlayer') trailerPlayer?: ElementRef<HTMLIFrameElement>;

  details = signal<ContentDetails | null>(null);
  contentType = signal<'movies' | 'series' | 'people'>('movies');
  trailerUrl = signal<string>('#');
  backgroundUrl = signal<string>('');
  isLoading = signal(true);
  isTrailerVisible = signal(false);

  skeletonCast = Array(6).fill(0);
  skeletonSimilar = Array(6).fill(0);

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const type = params['content_type'] as 'movies' | 'series' | 'people';
          const id = Number(params['id']);
          this.contentType.set(type);
          this.isLoading.set(true);

          const detailsReq =
            type === 'movies'
              ? this.movieService.getMovieDetails(id)
              : type === 'series'
              ? this.movieService.getTvDetails(id)
              : of(null as any);

          const trailerReq =
            type === 'movies'
              ? this.movieService.getTrailerUrl(id, 'movie')
              : type === 'series'
              ? this.movieService.getTrailerUrl(id, 'tv')
              : of('#');

          return forkJoin({
            details: detailsReq.pipe(catchError(() => of(null))),
            trailerUrl: trailerReq.pipe(catchError(() => of('#'))),
          });
        })
      )
      .subscribe({
        next: ({ details, trailerUrl }) => {
          this.details.set(details);
          this.trailerUrl.set(trailerUrl);
          if (details?.backdrop_path) {
            this.backgroundUrl.set(
              `https://image.tmdb.org/t/p/original${details.backdrop_path}`
            );
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get contentLabel(): string {
    const t = this.contentType();
    if (t === 'movies') return 'Filme';
    if (t === 'series') return 'Série';
    return 'Pessoa';
  }

  get title(): string {
    return this.details()?.title || this.details()?.name || '';
  }

  get releaseYear(): string {
    const date = this.details()?.release_date || this.details()?.first_air_date;
    return date ? String(new Date(date).getFullYear()) : '';
  }

  get runtime(): string {
    const d = this.details();
    if (!d) return '';
    if (this.contentType() === 'movies' && d.runtime) {
      return `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}min`;
    }
    if (this.contentType() === 'series' && d.episode_run_time?.length) {
      return `${d.episode_run_time[0]} min/ep`;
    }
    return '';
  }

  openTrailer(): void {
    const url = this.trailerUrl();
    if (!url || url === '#') return;
    this.isTrailerVisible.set(true);
    if (this.trailerPlayer) {
      this.trailerPlayer.nativeElement.src = `${url}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`;
    }
  }

  closeTrailer(): void {
    this.isTrailerVisible.set(false);
    if (this.trailerPlayer) {
      this.trailerPlayer.nativeElement.src = '';
    }
  }
}
