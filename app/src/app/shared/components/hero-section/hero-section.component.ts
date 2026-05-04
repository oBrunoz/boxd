import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Genre } from '../../../core/models/tmdb.models';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  @Input() label = '';
  @Input() title = '';
  @Input() backgroundUrl = '';
  @Input() isLoading = false;
  @Input() hasError = false;
  @Input() rating?: number;
  @Input() releaseYear = '';
  @Input() runtime = '';
  @Input() tagline = '';
  @Input() genres: Genre[] = [];
  @Input() overview = '';
  @Input() trailerUrl = '#';
  @Input() scrollLabel = 'Ver mais';
  @Input() scrollTarget = '#content';

  @Output() retryClicked = new EventEmitter<void>();
  @Output() addToListClicked = new EventEmitter<void>();

  @ViewChild('trailerPlayer') trailerPlayer?: ElementRef<HTMLIFrameElement>;

  isTrailerVisible = signal(false);
  isBgLoaded = signal(false);

  onBackgroundLoad(): void {
    this.isBgLoaded.set(true);
  }

  openTrailer(): void {
    if (!this.trailerUrl || this.trailerUrl === '#') return;
    this.isTrailerVisible.set(true);
    if (this.trailerPlayer) {
      this.trailerPlayer.nativeElement.src = `${this.trailerUrl}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`;
    }
  }

  closeTrailer(): void {
    this.isTrailerVisible.set(false);
    if (this.trailerPlayer) {
      this.trailerPlayer.nativeElement.src = '';
    }
  }
}
