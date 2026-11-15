import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';
import { Catalog, PublicProvider } from '../services/catalog';

@Component({
  selector: 'app-provider-profile',
  imports: [RouterLink, DatePipe, DecimalPipe, Loader, EmptyState, RatingStars],
  templateUrl: './provider-profile.html',
  styleUrl: './provider-profile.scss',
})
export class ProviderProfile implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);

  p = signal<PublicProvider | null>(null);
  loading = signal(true);
  error = signal('');
  tab = signal<'services' | 'reviews'>('services');

  rating = computed(() => this.p()?.providerProfile?.ratingAvg ?? 0);

  ngOnInit() {
    this.catalog.provider(this.route.snapshot.paramMap.get('id')!).subscribe({
      next: (p) => { this.p.set(p); this.loading.set(false); },
      error: () => { this.error.set('This provider is not available.'); this.loading.set(false); },
    });
  }

  duration(m: number) {
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  }
}