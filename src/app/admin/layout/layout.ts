
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, startWith } from 'rxjs';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Auth } from '../../core/services/auth';
import { AdminApi } from '../services/admin';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  auth = inject(Auth);
  private api = inject(AdminApi);
  private router = inject(Router);
  private translate = inject(TranslateService);

  open = signal(false);
  pending = signal(0);

  language = signal<'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi'>('en');

  initial = computed(() =>
    (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase()
  );

  links = [
    { path: '/admin/dashboard', label: 'ADMIN.DASHBOARD' },
    { path: '/admin/provider-approvals', label: 'ADMIN.PROVIDER_APPROVALS' },
    { path: '/admin/users', label: 'ADMIN.USERS' },
    { path: '/admin/bookings', label: 'ADMIN.BOOKINGS' },
    { path: '/admin/payments', label: 'ADMIN.PAYMENTS' },
    { path: '/admin/payouts', label: 'ADMIN.PAYOUTS' },
    { path: '/admin/reports', label: 'ADMIN.REPORTS' },
    { path: '/admin/categories', label: 'ADMIN.CATEGORIES' },
    { path: '/admin/settings', label: 'ADMIN.SETTINGS' },
  ];

  constructor() {
    const savedLanguage = localStorage.getItem('app-language');

    const initialLanguage: 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi' =
      savedLanguage === 'ta' ||
        savedLanguage === 'te' ||
        savedLanguage === 'kn' ||
        savedLanguage === 'hi' ||
        savedLanguage === 'ml'
        ? savedLanguage
        : 'en';

    this.language.set(initialLanguage);
    this.translate.use(initialLanguage);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed()
      )
      .subscribe(() =>
        this.api.badges().subscribe({
          next: (b) => this.pending.set(b.pendingProviders),
          error: () => { },
        })
      );
  }

  changeLanguage(lang: string) {
    if (lang !== 'en' && lang !== 'ta' && lang !== 'te' && lang !== 'kn' && lang !== 'hi' && lang !== 'ml') return;

    this.language.set(lang);
    localStorage.setItem('app-language', lang);
    this.translate.use(lang);
  }
}