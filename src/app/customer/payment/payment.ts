
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Api } from '../../core/services/api';
import { Booking } from '../../shared/models/booking';
import { Loader } from '../../shared/components/loader/loader';
import { CustomerBooking } from '../services/customer-booking';

interface UpiOrderResponse {
  reference: string;
  amount: string;
  upiId: string;
  payeeName: string;
  upiUrl: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    RouterLink,
    Loader,
    DatePipe,
    TitleCasePipe,
    TranslatePipe
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit {
  private api = inject(Api);
  private bookings = inject(CustomerBooking);
  private translate = inject(TranslateService);

  private bookingId = Number(
    inject(ActivatedRoute).snapshot.paramMap.get('bookingId')
  );

  booking = signal<Booking | null>(null);

  loading = signal(true);
  paying = signal(false);
  submittingUtr = signal(false);

  error = signal('');
  done = signal(false);

  upiOrder = signal<UpiOrderResponse | null>(null);
  transactionId = signal('');
  utrSubmitted = signal(false);

  paymentAmount = signal<number | null>(null);

  totalAmount = computed(() => {
    const b = this.booking();
    return Number(b?.payment?.amount ?? b?.total ?? 0);
  });

  paidAmount = computed(() => {
    return Number(this.booking()?.payment?.paidAmount ?? 0);
  });

  remainingAmount = computed(() => {
    return Math.max(0, this.totalAmount() - this.paidAmount());
  });

  transactions = computed(() => {
    return this.booking()?.payment?.transactions ?? [];
  });

  private message(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  ngOnInit(): void {
    if (!Number.isInteger(this.bookingId) || this.bookingId <= 0) {
      this.error.set(this.message('CUSTOMER_PAYMENT.INVALID_BOOKING_ID'));
      this.loading.set(false);
      return;
    }

    this.loadBooking();
  }

  private loadBooking(): void {
    this.bookings.get(this.bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);

        if (this.remainingAmount() <= 0) {
          this.done.set(true);
        } else {
          this.paymentAmount.set(this.remainingAmount());
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.message('CUSTOMER_PAYMENT.LOAD_ERROR'));
        this.loading.set(false);
      },
    });
  }

  updatePaymentAmount(value: string): void {
    this.error.set('');

    if (value.trim() === '') {
      this.paymentAmount.set(null);
      return;
    }

    const amount = Number(value);

    this.paymentAmount.set(
      Number.isFinite(amount) ? amount : null
    );
  }

  startUpiPayment(): void {
    this.error.set('');

    if (this.paying()) {
      return;
    }

    const amount = this.paymentAmount();
    const remaining = this.remainingAmount();

    if (!amount || !Number.isInteger(amount) || amount <= 0) {
      this.error.set(this.message('CUSTOMER_PAYMENT.VALID_AMOUNT'));
      return;
    }

    if (amount > remaining) {
      this.error.set(
        this.message('CUSTOMER_PAYMENT.MAX_AMOUNT', { amount: remaining })
      );
      return;
    }

    this.paying.set(true);

    this.api.post<UpiOrderResponse>('/payments/order', {
      bookingId: this.bookingId,
      amount,
    }).subscribe({
      next: (order) => {
        const requestedAmount = Number(order.amount);

        if (requestedAmount !== amount) {
          this.error.set(this.message('CUSTOMER_PAYMENT.AMOUNT_MISMATCH'));
          this.paying.set(false);
          return;
        }

        this.upiOrder.set(order);
        this.paying.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ||
          this.message('CUSTOMER_PAYMENT.CREATE_ERROR')
        );
        this.paying.set(false);
      },
    });
  }

  submitTransactionId(): void {
    const order = this.upiOrder();
    const utr = this.transactionId().trim();
    const amount = this.paymentAmount();

    this.error.set('');

    if (!order) {
      this.error.set(this.message('CUSTOMER_PAYMENT.CREATE_FIRST'));
      return;
    }

    if (!utr || utr.length < 6) {
      this.error.set(this.message('CUSTOMER_PAYMENT.VALID_UTR'));
      return;
    }

    if (!amount || !Number.isInteger(amount) || amount <= 0) {
      this.error.set(this.message('CUSTOMER_PAYMENT.VALID_AMOUNT'));
      return;
    }

    if (amount > this.remainingAmount()) {
      this.error.set(this.message('CUSTOMER_PAYMENT.EXCEEDS_BALANCE'));
      return;
    }

    if (this.submittingUtr()) {
      return;
    }

    this.submittingUtr.set(true);

    this.api.post('/payments/submit-utr', {
      bookingId: this.bookingId,
      reference: order.reference,
      transactionId: utr,
      amount,
    }).subscribe({
      next: () => {
        this.submittingUtr.set(false);
        this.utrSubmitted.set(true);
        this.loadBooking();
      },
      error: (e) => {
        this.error.set(
          e.error?.message ||
          this.message('CUSTOMER_PAYMENT.SUBMIT_ERROR')
        );
        this.submittingUtr.set(false);
      },
    });
  }

  retryPayment(): void {
    if (this.submittingUtr()) {
      return;
    }

    this.upiOrder.set(null);
    this.transactionId.set('');
    this.utrSubmitted.set(false);
    this.error.set('');
  }

  makeAnotherPayment(): void {
    this.upiOrder.set(null);
    this.transactionId.set('');
    this.utrSubmitted.set(false);
    this.paymentAmount.set(this.remainingAmount());
    this.error.set('');
  }
}
