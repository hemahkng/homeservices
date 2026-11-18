
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Booking } from '../../shared/models/booking';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { CustomerBooking, canCancel, canPay, canRate } from '../services/customer-booking';

@Component({
  selector: 'app-booking-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    Loader,
    StatusBadge,
    TranslatePipe
  ],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
})
export class BookingDetail implements OnInit {
  private svc = inject(CustomerBooking);
  private translate = inject(TranslateService);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  readonly canPay = canPay;
  readonly canCancel = canCancel;
  readonly canRate = canRate;

  b = signal<Booking | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal('');

  readonly steps = ['Requested', 'Accepted', 'In progress', 'Completed'];

  stepIndex = computed(() =>
    ({
      pending: 0,
      accepted: 1,
      in_progress: 2,
      completed: 3
    } as Record<string, number>)[this.b()?.status ?? ''] ?? 0
  );

  endsAt = computed(() => {
    const j = this.b();

    return j
      ? new Date(
        new Date(j.scheduledAt).getTime() +
        j.service.durationMin * 60000
      )
      : null;
  });

  ngOnInit() {
    this.svc.get(this.id).subscribe({
      next: (b) => {
        this.b.set(b);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_BOOKING_DETAIL.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  cancel() {
    const j = this.b();

    if (
      !j ||
      !confirm(
        this.translate.instant('CUSTOMER_BOOKING_DETAIL.CANCEL_CONFIRM')
      )
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.svc.cancel(j.id).subscribe({
      next: () =>
        this.svc.get(j.id).subscribe({
          next: (b) => {
            this.b.set(b);
            this.busy.set(false);
          },
          error: (e) => {
            this.error.set(
              e.error?.message ??
              this.translate.instant('CUSTOMER_BOOKING_DETAIL.LOAD_ERROR')
            );
            this.busy.set(false);
          },
        }),
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_BOOKING_DETAIL.CANCEL_ERROR')
        );
        this.busy.set(false);
      },
    });
  }
}
