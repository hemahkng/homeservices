
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
import { ProviderService } from '../services/provider-service';

@Component({
  selector: 'app-provider-layout',
  standalone: true,
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
  private api = inject(ProviderService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  open = signal(false);
  pending = signal(0);
  language = signal<'en' | 'ta'>('en');

  initial = computed(() =>
    (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase()
  );

  links = [
    { path: '/provider/dashboard', key: 'DASHBOARD' },
    { path: '/provider/requests', key: 'BOOKING_REQUESTS' },
    { path: '/provider/services', key: 'MY_SERVICES' },
    { path: '/provider/availability', key: 'AVAILABILITY' },
    { path: '/provider/earnings', key: 'EARNINGS' },
    { path: '/provider/reviews', key: 'REVIEWS' },
    { path: '/provider/profile', key: 'PROFILE' },
  ];

  constructor() {
    const savedLanguage = localStorage.getItem('app-language');
    const initialLanguage = savedLanguage === 'ta' ? 'ta' : 'en';

    this.language.set(initialLanguage);
    this.translate.use(initialLanguage);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed()
      )
      .subscribe(() =>
        this.api.stats().subscribe({
          next: (s) => this.pending.set(s.pending),
          error: () => {},
        })
      );
  }

  changeLanguage(lang: string): void {
    if (lang !== 'en' && lang !== 'ta') return;

    this.language.set(lang);
    localStorage.setItem('app-language', lang);
    this.translate.use(lang);
  }
}
