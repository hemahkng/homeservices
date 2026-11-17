
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import {
  AdminApi,
  AdminPayment,
  PaymentTransaction,
  PaymentsResponse
} from '../services/admin';

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

  verifyingId = signal<number | null>(null);
  actionError = signal('');
  actionMessage = signal('');

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'unpaid', label: 'Not completed' },
  ];

  visible = computed(() => {
    const items = this.data()?.items ?? [];
    const t = this.tab();

    return t === 'all'
      ? items
      : items.filter((p) =>
        t === 'paid' ? p.status === 'paid' : p.status !== 'paid'
      );
  });

  ngOnInit() {
    this.loadPayments();
  }

  verify(p: AdminPayment, selectedTransaction?: PaymentTransaction) {
    // For compatibility with the existing HTML, use the first
    // submitted transaction if no individual transaction is supplied.
    const transaction =
      selectedTransaction ??
      p.transactions?.find((t) => t.status === 'submitted');

    if (!transaction) {
      this.actionError.set(
        'No submitted transaction is available for verification.'
      );
      return;
    }

    const enteredAmount = window.prompt(
      `Enter the actual amount received for UTR ${transaction.txnId}.`,
      String(transaction.amount)
    );

    if (enteredAmount === null) return;

    const verifiedAmount = Number(enteredAmount);

    if (
      !Number.isFinite(verifiedAmount) ||
      !Number.isInteger(verifiedAmount) ||
      verifiedAmount <= 0
    ) {
      this.actionError.set('Enter a valid positive whole-number amount.');
      return;
    }

    if (verifiedAmount > transaction.amount) {
      this.actionError.set(
        `Verified amount cannot exceed the submitted amount of ₹${transaction.amount}.`
      );
      return;
    }

    const adminRemarks =
      window.prompt('Admin remarks (optional):', '') ?? '';

    const confirmed = window.confirm(
      `Have you verified this UTR in your bank/UPI account?\n\n` +
      `Booking: #${p.booking.id}\n` +
      `UTR: ${transaction.txnId}\n` +
      `Submitted amount: ₹${transaction.amount}\n` +
      `Verified amount: ₹${verifiedAmount}`
    );

    if (!confirmed) return;

    this.verifyingId.set(transaction.id);
    this.actionError.set('');
    this.actionMessage.set('');

    this.api.verifyPayment(
      p.booking.id,
      transaction.paymentRequest?.reference || p.orderId,
      transaction.txnId,
      verifiedAmount,
      adminRemarks
    ).subscribe({
      next: (response: any) => {
        this.verifyingId.set(null);
        this.actionMessage.set(
          response?.message || 'Transaction verified successfully.'
        );
        this.loadPayments();
      },
      error: (err) => {
        this.verifyingId.set(null);
        this.actionError.set(
          err.error?.message || 'Could not verify transaction.'
        );
      },
    });
  }

  loadPayments() {
    this.loading.set(true);
    this.error.set('');

    this.api.payments().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Could not load payments');
        this.loading.set(false);
      },
    });
  }
}
