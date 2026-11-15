import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { ProviderService } from '../services/provider-service';

@Component({
  selector: 'app-provider-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  auth = inject(Auth);
  private api = inject(ProviderService);
  private router = inject(Router);

  open = signal(false);
  pending = signal(0);
  initial = computed(() => (this.auth.currentUser()?.name ?? '?').charAt(0).toUpperCase());

  links = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/provider/requests', label: 'Booking requests', icon: '📥' },
    { path: '/provider/services', label: 'My services', icon: '🧰' },
    { path: '/provider/availability', label: 'Availability', icon: '🗓️' },
    { path: '/provider/earnings', label: 'Earnings', icon: '💰' },
    { path: '/provider/reviews', label: 'Reviews', icon: '⭐' },
    { path: '/provider/profile', label: 'Profile', icon: '👤' },
  ];

  constructor() {
    // refresh the pending-requests badge after every navigation
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), startWith(null), takeUntilDestroyed())
      .subscribe(() =>
        this.api.stats().subscribe({ next: (s) => this.pending.set(s.pending), error: () => {} })
      );
  }
}