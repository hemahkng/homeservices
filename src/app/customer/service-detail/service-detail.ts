
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Service } from '../../shared/models/service';
import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';
import { categoryIcon } from '../category-icon';
import { Catalog, PublicProvider } from '../services/catalog';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    Loader,
    RatingStars,
    TranslatePipe,
  ],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss',
})
export class ServiceDetail implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  service = signal<Service | null>(null);
  prov = signal<PublicProvider | null>(null);
  loading = signal(true);
  error = signal('');

  icon = computed(() =>
    categoryIcon(this.service()?.category.name ?? '')
  );

  duration = computed(() => {
    const m = this.service()?.durationMin ?? 0;

    if (m < 60) {
      return this.translate.instant('CUSTOMER_SERVICE_DETAIL.MINUTES', {
        count: m,
      });
    }

    const h = Math.floor(m / 60);
    const r = m % 60;

    if (r) {
      return this.translate.instant(
        'CUSTOMER_SERVICE_DETAIL.HOURS_MINUTES',
        {
          hours: h,
          minutes: r,
        }
      );
    }

    return this.translate.instant('CUSTOMER_SERVICE_DETAIL.HOURS', {
      count: h,
    });
  });

  reviews = computed(() =>
    (this.prov()?.reviews ?? []).slice(0, 3)
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.catalog.service(id).subscribe({
      next: (s) => {
        this.service.set(s);
        this.loading.set(false);

        this.catalog.provider(s.provider.id).subscribe({
          next: (p) => this.prov.set(p),
          error: () => {},
        });
      },
      error: () => {
        this.error.set(
          this.translate.instant('CUSTOMER_SERVICE_DETAIL.SERVICE_ERROR')
        );
        this.loading.set(false);
      },
    });
  }
}
