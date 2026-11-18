import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi, UserRow } from '../services/admin';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  imports: [FormsModule, DatePipe, Loader, TranslatePipe],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private api = inject(AdminApi);

  items = signal<UserRow[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  q = '';
  role = '';
  status = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.users({ q: this.q.trim() || undefined, role: this.role || undefined, status: this.status || undefined }).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load users'); this.loading.set(false); },
    });
  }

  bookings(u: UserRow) { return u._count.customerBookings + u._count.providerBookings; }

  toggle(u: UserRow) {
    const blocking = u.status !== 'blocked';
    if (blocking && !confirm(`Block ${u.name}? They will be logged out and cannot sign in.`)) return;
    this.busyId.set(u.id);
    (blocking ? this.api.block(u.id) : this.api.unblock(u.id)).subscribe({
      next: () => { this.busyId.set(null); this.load(); },
      error: (e) => { this.busyId.set(null); this.error.set(e.error?.message ?? 'Action failed'); },
    });
  }
}