import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AdminApi, AdminBooking } from '../services/admin';

@Component({
  selector: 'app-bookings',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink, Loader, StatusBadge],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings implements OnInit {
  private api = inject(AdminApi);

  items = signal<AdminBooking[]>([]);
  loading = signal(true);
  error = signal('');
  q = '';
  status = '';

  readonly statuses = ['pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.bookings({ q: this.q.trim() || undefined, status: this.status || undefined }).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load bookings'); this.loading.set(false); },
    });
  }
}