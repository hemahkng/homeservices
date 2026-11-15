import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi, PaymentsResponse } from '../services/admin';

type Tab = 'all' | 'paid' | 'unpaid';

@Component({
  selector: 'app-payments',
  imports: [DatePipe, DecimalPipe, RouterLink, Loader, EmptyState],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments implements OnInit {
  private api = inject(AdminApi);

  data = signal<PaymentsResponse | null>(null);
  loading = signal(true);
  error = signal('');
  tab = signal<Tab>('all');

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'paid', label: 'Paid' }, { key: 'unpaid', label: 'Not completed' },
  ];

  visible = computed(() => {
    const items = this.data()?.items ?? [];
    const t = this.tab();
    return t === 'all' ? items : items.filter((p) => (t === 'paid' ? p.status === 'paid' : p.status !== 'paid'));
  });

  ngOnInit() {
    this.api.payments().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load payments'); this.loading.set(false); },
    });
  }
}