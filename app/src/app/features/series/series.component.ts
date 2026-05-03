import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MovieService } from '../../core/services/movie.service';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { TvShow } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent],
  templateUrl: './series.component.html',
})
export class SeriesComponent implements OnInit, OnDestroy {
  shows = signal<TvShow[]>([]);
  isLoading = signal(true);
  skeletonItems = Array(20).fill(0);

  private destroy$ = new Subject<void>();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService
      .getTrendingTv('week')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.shows.set(data.results);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getShowYear(show: TvShow): string {
    return show.first_air_date ? String(new Date(show.first_air_date).getFullYear()) : '';
  }
}
