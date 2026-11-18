
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { filter, startWith } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { CustomerAccount } from '../services/customer-account';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  auth = inject(Auth);
  private account = inject(CustomerAccount);
  private router = inject(Router);
  private translate = inject(TranslateService);

  language = signal<'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi'>('en');

  unread = signal(0);
  initial = computed(() => (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase());
  firstName = computed(() => (this.auth.currentUser()?.name ?? '').split(' ')[0]);

  links = [
    { path: '/customer/home', key: 'CUSTOMER_LAYOUT.HOME' },
    { path: '/customer/services', key: 'CUSTOMER_LAYOUT.SERVICES' },
    { path: '/customer/my-bookings', key: 'CUSTOMER_LAYOUT.MY_BOOKINGS' },
  ];

  tabs = [
    { path: '/customer/home', key: 'CUSTOMER_LAYOUT.HOME', icon: '🏠' },
    { path: '/customer/services', key: 'CUSTOMER_LAYOUT.SERVICES', icon: '🔍' },
    { path: '/customer/my-bookings', key: 'CUSTOMER_LAYOUT.BOOKINGS', icon: '📅' },
    { path: '/customer/notifications', key: 'CUSTOMER_LAYOUT.ALERTS', icon: '🔔' },
    { path: '/customer/profile', key: 'CUSTOMER_LAYOUT.PROFILE', icon: '👤' },
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
      .pipe(filter((e) => e instanceof NavigationEnd), startWith(null), takeUntilDestroyed())
      .subscribe(() =>
        this.account.unreadCount().subscribe({
          next: (r) => this.unread.set(r.count),
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
