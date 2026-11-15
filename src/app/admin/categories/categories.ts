
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Loader } from '../../shared/components/loader/loader';
import { categoryIcon } from '../../customer/category-icon';
import { AdminApi, AdminCategory } from '../services/admin';

@Component({
  selector: 'app-categories',
  imports: [RouterLink, Loader],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private api = inject(AdminApi);

  readonly icon = categoryIcon;

  items = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  // Summary statistics
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
        this.error.set(e.error?.message ?? 'Could not load categories');
        this.loading.set(false);
      },
    });
  }

  toggle(c: AdminCategory) {
    if (
      c.isActive &&
      !confirm(
        `Hide "${c.name}"? It will disappear from search and registration, but existing data is kept.`
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
        this.error.set(e.error?.message ?? 'Could not update');
      },
    });
  }
}
