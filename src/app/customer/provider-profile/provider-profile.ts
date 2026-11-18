
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';
import { Catalog, PublicProvider } from '../services/catalog';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    Loader,
    EmptyState,
    RatingStars,
    TranslatePipe,
  ],
  templateUrl: './provider-profile.html',
  styleUrl: './provider-profile.scss',
})
export class ProviderProfile implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  p = signal<PublicProvider | null>(null);
  loading = signal(true);
  error = signal('');
  tab = signal<'services' | 'reviews'>('services');

  rating = computed(() => this.p()?.providerProfile?.ratingAvg ?? 0);

  ngOnInit(): void {
    this.catalog.provider(this.route.snapshot.paramMap.get('id')!).subscribe({
      next: (p) => {
        this.p.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          this.translate.instant('CUSTOMER_PROVIDER_PROFILE.PROVIDER_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  duration(m: number): string {
    if (m < 60) {
      return this.translate.instant('CUSTOMER_PROVIDER_PROFILE.MINUTES', {
        count: m,
      });
    }

    const h = Math.floor(m / 60);
    const r = m % 60;

    if (r) {
      return this.translate.instant('CUSTOMER_PROVIDER_PROFILE.HOURS_MINUTES', {
        hours: h,
        minutes: r,
      });
    }

    return this.translate.instant('CUSTOMER_PROVIDER_PROFILE.HOURS', {
      count: h,
    });
  }
}
