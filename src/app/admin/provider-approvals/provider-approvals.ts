import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { AdminApi, ProviderRow } from '../services/admin';

type Tab = 'pending' | 'active' | 'blocked';

@Component({
  selector: 'app-provider-approvals',
  imports: [DatePipe, Loader],
  templateUrl: './provider-approvals.html',
  styleUrl: './provider-approvals.scss',
})
export class ProviderApprovals implements OnInit {
  private api = inject(AdminApi);

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'blocked', label: 'Blocked / rejected' },
  ];
  tab = signal<Tab>('pending');
  items = signal<ProviderRow[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  ngOnInit() { this.load(); }

  select(t: Tab) { this.tab.set(t); this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.providers(this.tab()).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load providers'); this.loading.set(false); },
    });
  }

  private run(p: ProviderRow, call: () => ReturnType<AdminApi['approve']>, msg?: string) {
    if (msg && !confirm(msg)) return;
    this.busyId.set(p.id);
    this.error.set('');
    call().subscribe({
      next: () => { this.busyId.set(null); this.items.update((l) => l.filter((x) => x.id !== p.id)); },
      error: (e) => { this.busyId.set(null); this.error.set(e.error?.message ?? 'Action failed'); },
    });
  }

  approve(p: ProviderRow) { this.run(p, () => this.api.approve(p.id)); }
  reject(p: ProviderRow) { this.run(p, () => this.api.reject(p.id), `Reject ${p.name}? They will not be able to log in.`); }
  block(p: ProviderRow) { this.run(p, () => this.api.block(p.id), `Block ${p.name}? Their services will be hidden.`); }
  reactivate(p: ProviderRow) { this.run(p, () => this.api.unblock(p.id)); }
}