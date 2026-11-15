
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Auth } from '../../core/services/auth';
import {
  ProviderService,
  ProviderStats
} from '../services/provider-service';

import { Loader } from '../../shared/components/loader/loader';
import { RatingStars } from '../../shared/components/rating-stars/rating-stars';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    Loader,
    RatingStars,
    StatusBadge
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private api = inject(ProviderService);
  auth = inject(Auth);

  stats = signal<ProviderStats | null>(null);
  loading = signal(true);
  error = signal('');

  firstName = computed(() =>
    (this.auth.currentUser()?.name ?? '').split(' ')[0]
  );

  greeting = computed(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  });

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ?? 'Could not load dashboard'
        );
        this.loading.set(false);
      },
    });
  }
}
