
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  imports: [RouterLink, Loader],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit {
  private api = inject(Api);
  private bookings = inject(CustomerBooking);

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

  ngOnInit(): void {
    if (!Number.isInteger(this.bookingId) || this.bookingId <= 0) {
      this.error.set('Invalid booking ID');
      this.loading.set(false);
      return;
    }

    this.loadBooking();
  }

  private loadBooking(): void {
    this.bookings.get(this.bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);

        if (booking.payment?.status === 'paid') {
          this.done.set(true);
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Booking not found');
        this.loading.set(false);
      },
    });
  }

  // Create UPI payment request
  startUpiPayment(): void {
    this.error.set('');

    if (this.paying()) {
      return;
    }

    this.paying.set(true);

    this.api.post<UpiOrderResponse>(
      '/payments/order',
      {
        bookingId: this.bookingId,
      }
    ).subscribe({
      next: (order) => {
        this.upiOrder.set(order);
        this.paying.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message || 'Could not create UPI payment request'
        );

        this.paying.set(false);
      },
    });
  }

  // Submit UPI transaction ID
  submitTransactionId(): void {
    const order = this.upiOrder();
    const utr = this.transactionId().trim();

    this.error.set('');

    if (!order) {
      this.error.set('Please create a payment request first');
      return;
    }

    if (!utr || utr.length < 6) {
      this.error.set('Please enter a valid UPI transaction ID');
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
    }).subscribe({
      next: () => {
        this.submittingUtr.set(false);
        this.utrSubmitted.set(true);
      },
      error: (e) => {
        this.error.set(
          e.error?.message || 'Could not submit transaction ID'
        );

        this.submittingUtr.set(false);
      },
    });
  }

  // Reset the payment request if the customer needs to retry
  retryPayment(): void {
    if (this.utrSubmitted()) {
      return;
    }

    this.upiOrder.set(null);
    this.transactionId.set('');
    this.error.set('');
  }
}
