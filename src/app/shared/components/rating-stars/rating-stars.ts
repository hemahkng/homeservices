import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  template: `<span class="st" [style.font-size.px]="size()"><span class="fill" [style.width.%]="pct()">★★★★★</span>★★★★★</span>`,
  styles: `
    :host { display: inline-block; }
    .st { position: relative; display: inline-block; color: #dee2e6; letter-spacing: 1px; line-height: 1; }
    .fill { position: absolute; left: 0; top: 0; overflow: hidden; white-space: nowrap; color: #fab005; }
  `,
})
export class RatingStars {
  value = input(0);
  size = input(16);
  pct = computed(() => Math.max(0, Math.min(100, (this.value() / 5) * 100)));
}