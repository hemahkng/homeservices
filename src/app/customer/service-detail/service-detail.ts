import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '../../shared/models/service';
import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';
import { categoryIcon } from '../category-icon';
import { Catalog, PublicProvider } from '../services/catalog';

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, Loader, RatingStars],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss',
})
export class ServiceDetail implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);

  service = signal<Service | null>(null);
  prov = signal<PublicProvider | null>(null);
  loading = signal(true);
  error = signal('');

  icon = computed(() => categoryIcon(this.service()?.category.name ?? ''));
  duration = computed(() => {
    const m = this.service()?.durationMin ?? 0;
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  });
  reviews = computed(() => (this.prov()?.reviews ?? []).slice(0, 3));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.catalog.service(id).subscribe({
      next: (s) => {
        this.service.set(s);
        this.loading.set(false);
        this.catalog.provider(s.provider.id).subscribe({ next: (p) => this.prov.set(p), error: () => {} });
      },
      error: () => { this.error.set('This service is no longer available.'); this.loading.set(false); },
    });
  }
}