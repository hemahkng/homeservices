import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EarningsResponse, ProviderService } from '../services/provider-service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-earnings',
  imports: [DatePipe, DecimalPipe, RouterLink, Loader, EmptyState],
  templateUrl: './earnings.html',
  styleUrl: './earnings.scss',
})
export class Earnings implements OnInit {
  private api = inject(ProviderService);
  data = signal<EarningsResponse | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.api.earnings().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load earnings'); this.loading.set(false); },
    });
  }
}