
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi, BalanceRow, PayoutRow } from '../services/admin';

@Component({
  selector: 'app-payouts',
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    Loader,
    EmptyState,
    TranslatePipe
  ],
  templateUrl: './payouts.html',
  styleUrl: './payouts.scss',
})
export class Payouts implements OnInit {
  private api = inject(AdminApi);
  private translate = inject(TranslateService);

  balances = signal<BalanceRow[]>([]);
  history = signal<PayoutRow[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  ok = signal('');

  payingId = signal<number | null>(null);
  amount = 0;
  reference = '';

  totalDue = computed(() =>
    this.balances().reduce((s, r) => s + Math.max(0, r.due), 0)
  );

  totalPaidOut = computed(() =>
    this.balances().reduce((s, r) => s + r.paidOut, 0)
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.balances().subscribe({
      next: (r) => {
        this.balances.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PAYOUTS.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });

    this.api.payoutHistory().subscribe({
      next: (h) => this.history.set(h),
      error: () => {},
    });
  }

  openPay(r: BalanceRow) {
    this.payingId.set(r.providerId);
    this.amount = r.due;
    this.reference = '';
    this.error.set('');
    this.ok.set('');
  }

  submit(r: BalanceRow) {
    if (!Number.isInteger(this.amount) || this.amount < 1) {
      this.error.set(
        this.translate.instant('PAYOUTS.ENTER_AMOUNT')
      );
      return;
    }

    if (this.amount > r.due) {
      this.error.set(
        this.translate.instant('PAYOUTS.AMOUNT_EXCEEDS', {
          amount: r.due,
        })
      );
      return;
    }

    const confirmation = this.translate.instant(
      'PAYOUTS.CONFIRM_MESSAGE',
      {
        amount: this.amount,
        name: r.name,
      }
    );

    if (!confirm(confirmation)) return;

    this.saving.set(true);
    this.error.set('');

    this.api.createPayout({
      providerId: r.providerId,
      amount: this.amount,
      reference: this.reference.trim() || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.payingId.set(null);

        this.ok.set(
          this.translate.instant('PAYOUTS.PAYOUT_SUCCESS', {
            amount: this.amount,
            name: r.name,
          })
        );

        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(
          e.error?.message ??
          this.translate.instant('PAYOUTS.SAVE_ERROR')
        );
      },
    });
  }
}
