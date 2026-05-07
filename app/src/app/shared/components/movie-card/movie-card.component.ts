import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  readonly Star = Star;

  @Input() id!: number;
  @Input() title!: string;
  @Input() posterPath: string | null = null;
  @Input() year: string = '';
  @Input() rating: number = 0;
  @Input() mediaType: 'movies' | 'series' = 'movies';

  get posterUrl(): string {
    return this.posterPath
      ? `https://image.tmdb.org/t/p/w342${this.posterPath}`
      : '/images/image_not_found.png';
  }

  get detailsRoute(): string[] {
    return ['/search', this.mediaType, String(this.id)];
  }
}
