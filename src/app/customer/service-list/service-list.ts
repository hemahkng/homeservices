
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Category } from '../../shared/models/category';
import { Service } from '../../shared/models/service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { categoryIcon } from '../category-icon';
import { Catalog } from '../services/catalog';

type Sort = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

@Component({
  selector: 'app-service-list',
  imports: [FormsModule, Loader, EmptyState, ServiceCard, TranslatePipe],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList implements OnInit {
  private catalog = inject(Catalog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  readonly icon = categoryIcon;
  categories = signal<Category[]>([]);
  all = signal<Service[]>([]);
  loading = signal(true);
  error = signal('');

  term = '';
  categoryId = signal(0);
  sort = signal<Sort>('relevance');
  maxPrice = signal<number | null>(null);

  visible = computed(() => {
    let list = [...this.all()];
    const max = this.maxPrice();

    if (max) list = list.filter((s) => s.price <= max);

    const rating = (s: Service) => s.provider.providerProfile?.ratingAvg ?? 0;

    switch (this.sort()) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => rating(b) - rating(a));
      default:
        return list;
    }
  });

  ngOnInit() {
    this.catalog.categories().subscribe((c) => this.categories.set(c));

    this.route.queryParamMap.subscribe((p) => {
      this.term = p.get('q') ?? '';
      this.categoryId.set(Number(p.get('categoryId') ?? 0));
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.catalog.services({
      categoryId: this.categoryId() || undefined,
      q: this.term,
    }).subscribe({
      next: (r) => {
        this.all.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ?? this.translate.instant('CUSTOMER_SERVICES.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  search(categoryId = this.categoryId()) {
    this.router.navigate([], {
      queryParams: {
        categoryId: categoryId || null,
        q: this.term.trim() || null,
      },
    });
  }

  clear() {
    this.term = '';
    this.maxPrice.set(null);
    this.sort.set('relevance');
    this.search(0);
  }
}
