
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    Loader,
    RatingStars,
    StatusBadge,
    TranslatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private api = inject(ProviderService);
  private translate = inject(TranslateService);

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
      return 'PROVIDER_DASHBOARD.WELCOME_MORNING';
    }

    if (hour < 17) {
      return 'PROVIDER_DASHBOARD.WELCOME_AFTERNOON';
    }

    return 'PROVIDER_DASHBOARD.WELCOME_EVENING';
  });

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_DASHBOARD.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }
}
