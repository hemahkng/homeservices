
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Booking } from '../../shared/models/booking';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { CustomerBooking, canCancel, canPay, canRate } from '../services/customer-booking';

type Tab = 'upcoming' | 'completed' | 'cancelled' | 'all';

@Component({
  selector: 'app-my-bookings',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    Loader,
    EmptyState,
    StatusBadge,
    TranslatePipe
  ],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookings implements OnInit {
  private svc = inject(CustomerBooking);
  private translate = inject(TranslateService);

  readonly canPay = canPay;
  readonly canCancel = canCancel;
  readonly canRate = canRate;

  all = signal<Booking[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);
  tab = signal<Tab>('upcoming');

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
  ];

  private match(b: Booking, t: Tab) {
    switch (t) {
      case 'upcoming':
        return ['pending', 'accepted', 'in_progress'].includes(b.status);
      case 'completed':
        return b.status === 'completed';
      case 'cancelled':
        return ['rejected', 'cancelled'].includes(b.status);
      default:
        return true;
    }
  }

  counts = computed(() => {
    const l = this.all();

    return Object.fromEntries(
      this.tabs.map((t) => [
        t.key,
        l.filter((b) => this.match(b, t.key)).length
      ])
    ) as Record<Tab, number>;
  });

  visible = computed(() => {
    const t = this.tab();
    const list = this.all().filter((b) => this.match(b, t));

    return list.sort((a, b) =>
      t === 'upcoming'
        ? +new Date(a.scheduledAt) - +new Date(b.scheduledAt)
        : +new Date(b.scheduledAt) - +new Date(a.scheduledAt)
    );
  });

  ngOnInit() {
    this.svc.list().subscribe({
      next: (r) => {
        this.all.set(r);
        this.loading.set(false);

        if (this.counts().upcoming === 0 && r.length) {
          this.tab.set('all');
        }
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_BOOKINGS.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  cancel(b: Booking) {
    if (!confirm(this.translate.instant('CUSTOMER_BOOKINGS.CANCEL_CONFIRM'))) {
      return;
    }

    this.busyId.set(b.id);
    this.error.set('');

    this.svc.cancel(b.id).subscribe({
      next: (u) => {
        this.all.update((l) =>
          l.map((x) => (x.id === u.id ? u : x))
        );
        this.busyId.set(null);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_BOOKINGS.CANCEL_ERROR')
        );
        this.busyId.set(null);
      },
    });
  }
}
