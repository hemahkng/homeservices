import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { AdminApi } from '../services/admin';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  auth = inject(Auth);
  private api = inject(AdminApi);
  private router = inject(Router);

  open = signal(false);
  pending = signal(0);
  initial = computed(() => (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase());

  links = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/provider-approvals', label: 'Provider approvals', icon: '🛡️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { path: '/admin/payments', label: 'Payments', icon: '💳' },
    { path: '/admin/payouts', label: 'Payouts', icon: '🏦' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), startWith(null), takeUntilDestroyed())
      .subscribe(() =>
        this.api.badges().subscribe({ next: (b) => this.pending.set(b.pendingProviders), error: () => {} })
      );
  }
}