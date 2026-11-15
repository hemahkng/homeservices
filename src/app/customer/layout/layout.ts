import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { CustomerAccount } from '../services/customer-account';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  auth = inject(Auth);
  private account = inject(CustomerAccount);
  private router = inject(Router);

  unread = signal(0);
  initial = computed(() => (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase());
  firstName = computed(() => (this.auth.currentUser()?.name ?? '').split(' ')[0]);

  links = [
    { path: '/customer/home', label: 'Home' },
    { path: '/customer/services', label: 'Services' },
    { path: '/customer/my-bookings', label: 'My bookings' },
  ];

  tabs = [
    { path: '/customer/home', label: 'Home', icon: '🏠' },
    { path: '/customer/services', label: 'Services', icon: '🔍' },
    { path: '/customer/my-bookings', label: 'Bookings', icon: '📅' },
    { path: '/customer/notifications', label: 'Alerts', icon: '🔔' },
    { path: '/customer/profile', label: 'Profile', icon: '👤' },
  ];

  constructor() {
    // refresh the unread badge after every navigation
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), startWith(null), takeUntilDestroyed())
      .subscribe(() =>
        this.account.unreadCount().subscribe({ next: (r) => this.unread.set(r.count), error: () => {} })
      );
  }
}