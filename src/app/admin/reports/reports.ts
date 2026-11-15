import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi, ReportData } from '../services/admin';

const STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

@Component({
  selector: 'app-reports',
  imports: [DecimalPipe, Loader],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  private api = inject(AdminApi);

  readonly ranges = [7, 30, 90];
  days = signal(30);
  data = signal<ReportData | null>(null);
  loading = signal(true);
  error = signal('');

  maxRev = computed(() => Math.max(1, ...(this.data()?.daily.map((d) => d.revenue) ?? [])));
  maxBook = computed(() => Math.max(1, ...(this.data()?.daily.map((d) => d.bookings) ?? [])));
  statusRows = computed(() => {
    const d = this.data();
    const total = Object.values(d?.byStatus ?? {}).reduce((a, b) => a + b, 0) || 1;
    return STATUSES.map((k) => ({ key: k, label: k.replace('_', ' '), n: d?.byStatus[k] ?? 0, pct: ((d?.byStatus[k] ?? 0) / total) * 100 }));
  });
  maxCat = computed(() => Math.max(1, ...(this.data()?.topCategories.map((c) => c.bookings) ?? [])));
  maxProv = computed(() => Math.max(1, ...(this.data()?.topProviders.map((p) => p.revenue) ?? [])));

  ngOnInit() { this.load(); }

  pick(n: number) { this.days.set(n); this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.reports(this.days()).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load reports'); this.loading.set(false); },
    });
  }

  showLabel(i: number) {
    const step = this.days() > 30 ? 10 : this.days() > 7 ? 5 : 1;
    return i % step === 0;
  }
}