import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-stripes-banner',
  standalone: true,
  templateUrl: './stripes-banner.component.html',
  styleUrls: ['./stripes-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StripesBannerComponent {}
