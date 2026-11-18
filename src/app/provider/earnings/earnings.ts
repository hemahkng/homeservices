
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import {
  EarningsResponse,
  ProviderService
} from '../services/provider-service';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    Loader,
    EmptyState,
    TranslatePipe
  ],
  templateUrl: './earnings.html',
  styleUrl: './earnings.scss',
})
export class Earnings implements OnInit {

  private api = inject(ProviderService);
  private translate = inject(TranslateService);

  data = signal<EarningsResponse | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.api.earnings().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_EARNINGS.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }
}
