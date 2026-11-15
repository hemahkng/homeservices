import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AdminApi, AdminStats } from '../services/admin';

const STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, Loader, StatusBadge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private api = inject(AdminApi);
  auth = inject(Auth);

  stats = signal<AdminStats | null>(null);
  loading = signal(true);
  error = signal('');

  total = computed(() =>
    (Object.values(this.stats()?.bookings ?? {}) as (number | undefined)[]).reduce((a: number, b) => a + (b ?? 0), 0)
  );
  maxBar = computed(() => Math.max(1, ...(this.stats()?.series.map((s) => s.count) ?? [])));
  rows = computed(() => {
    const s = this.stats();
    const t = this.total() || 1;
    return STATUSES.map((k) => {
      const n = s?.bookings[k] ?? 0;
      return { key: k, label: k.replace('_', ' '), n, pct: (n / t) * 100 };
    });
  });

  ngOnInit() {
    this.api.stats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load dashboard'); this.loading.set(false); },
    });
  }
}