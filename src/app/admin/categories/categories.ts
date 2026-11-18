
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Loader } from '../../shared/components/loader/loader';
import { categoryIcon } from '../../customer/category-icon';
import { AdminApi, AdminCategory } from '../services/admin';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, Loader, TranslatePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private api = inject(AdminApi);
  private translate = inject(TranslateService);

  readonly icon = categoryIcon;

  items = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  totalCategories = computed(() => this.items().length);

  activeCategories = computed(
    () => this.items().filter(c => c.isActive).length
  );

  hiddenCategories = computed(
    () => this.items().filter(c => !c.isActive).length
  );

  totalServices = computed(
    () => this.items().reduce((sum, c) => sum + c._count.services, 0)
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);

    this.api.categories().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ?? this.translate.instant('CATEGORIES.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  toggle(c: AdminCategory) {
    if (
      c.isActive &&
      !confirm(
        this.translate.instant('CATEGORIES.HIDE_CONFIRM', { name: c.name })
      )
    ) return;

    this.busyId.set(c.id);

    this.api.updateCategory(c.id, {
      name: c.name,
      icon: c.icon ?? undefined,
      isActive: !c.isActive
    }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (e) => {
        this.busyId.set(null);
        this.error.set(
          e.error?.message ?? this.translate.instant('CATEGORIES.UPDATE_ERROR')
        );
      },
    });
  }
}
