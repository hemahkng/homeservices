import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking } from '../../shared/models/booking';
import { JobActionDef, ProviderBooking, actionsFor } from '../services/provider-booking';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

type Tab = 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'all';

@Component({
  selector: 'app-requests',
  imports: [DatePipe, DecimalPipe, RouterLink, StatusBadge, Loader, EmptyState],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests implements OnInit {
  private jobs = inject(ProviderBooking);
  readonly actionsFor = actionsFor;

  all = signal<Booking[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);
  tab = signal<Tab>('pending');

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  counts = computed(() => {
    const l = this.all();
    return {
      pending: l.filter((b) => b.status === 'pending').length,
      upcoming: l.filter((b) => b.status === 'accepted').length,
      in_progress: l.filter((b) => b.status === 'in_progress').length,
      completed: l.filter((b) => b.status === 'completed').length,
      all: l.length,
    } as Record<Tab, number>;
  });

  visible = computed(() => {
    const t = this.tab();
    const l = this.all();
    const list =
      t === 'all' ? [...l]
      : t === 'upcoming' ? l.filter((b) => b.status === 'accepted')
      : l.filter((b) => b.status === t);
    const asc = t === 'pending' || t === 'upcoming' || t === 'in_progress';
    return list.sort((a, b) =>
      asc ? +new Date(a.scheduledAt) - +new Date(b.scheduledAt) : +new Date(b.scheduledAt) - +new Date(a.scheduledAt)
    );
  });

  ngOnInit() {
    this.jobs.list().subscribe({
      next: (r) => {
        this.all.set(r);
        this.loading.set(false);
        if (this.counts().pending === 0 && r.length) this.tab.set('all');
      },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load requests'); this.loading.set(false); },
    });
  }

  run(b: Booking, d: JobActionDef) {
    if (d.confirm && !confirm(d.confirm)) return;
    this.busyId.set(b.id);
    this.error.set('');
    this.jobs.act(b.id, d.action).subscribe({
      next: (u) => { this.all.update((l) => l.map((x) => (x.id === u.id ? u : x))); this.busyId.set(null); },
      error: (e) => { this.error.set(e.error?.message ?? 'Action failed'); this.busyId.set(null); },
    });
  }
}