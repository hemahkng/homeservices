import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProviderReview, ProviderService } from '../services/provider-service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';

@Component({
  selector: 'app-reviews',
  imports: [DatePipe, DecimalPipe, Loader, EmptyState, RatingStars],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews implements OnInit {
  private api = inject(ProviderService);

  items = signal<ProviderReview[]>([]);
  loading = signal(true);
  error = signal('');

  average = computed(() => {
    const l = this.items();
    return l.length ? l.reduce((s, r) => s + r.rating, 0) / l.length : 0;
  });

  distribution = computed(() => {
    const l = this.items();
    return [5, 4, 3, 2, 1].map((star) => {
      const n = l.filter((r) => r.rating === star).length;
      return { star, n, pct: l.length ? (n / l.length) * 100 : 0 };
    });
  });

  ngOnInit() {
    this.api.reviews().subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load reviews'); this.loading.set(false); },
    });
  }
}