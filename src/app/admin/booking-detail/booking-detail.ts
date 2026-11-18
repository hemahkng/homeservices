
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AdminApi, AdminBooking } from '../services/admin';

@Component({
  selector: 'app-booking-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, Loader, StatusBadge, TranslatePipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
})
export class BookingDetail implements OnInit {
  private api = inject(AdminApi);
  private translate = inject(TranslateService);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  b = signal<AdminBooking | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal('');

  readonly steps = ['Requested', 'Accepted', 'In progress', 'Completed'];

  stepIndex = computed(() =>
    ({ pending: 0, accepted: 1, in_progress: 2, completed: 3 } as Record<string, number>)[this.b()?.status ?? ''] ?? 0
  );

  canCancel = computed(() =>
    ['pending', 'accepted', 'in_progress'].includes(this.b()?.status ?? '')
  );

  paid = computed(() => this.b()?.payment?.status === 'paid');

  ngOnInit() {
    this.api.booking(this.id).subscribe({
      next: (b) => {
        this.b.set(b);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? this.translate.instant('BOOKING_DETAIL.LOAD_ERROR'));
        this.loading.set(false);
      },
    });
  }

  cancel() {
    const j = this.b();
    if (!j) return;

    const warn = this.paid()
      ? this.translate.instant('BOOKING_DETAIL.CANCEL_PAID_WARNING')
      : this.translate.instant('BOOKING_DETAIL.CANCEL_WARNING');

    if (!confirm(warn)) return;

    this.busy.set(true);
    this.error.set('');

    this.api.cancelBooking(j.id).subscribe({
      next: (u) => {
        this.b.set(u);
        this.busy.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? this.translate.instant('BOOKING_DETAIL.CANCEL_ERROR'));
        this.busy.set(false);
      },
    });
  }
}
