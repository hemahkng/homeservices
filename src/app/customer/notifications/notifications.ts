import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';
import { AppNotification, CustomerAccount } from '../services/customer-account';

@Component({
  selector: 'app-notifications',
  imports: [Loader],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  private account = inject(CustomerAccount);
  private router = inject(Router);

  items = signal<AppNotification[]>([]);
  loading = signal(true);
  error = signal('');
  unread = computed(() => this.items().filter((n) => !n.isRead).length);

  ngOnInit() {
    this.account.notifications().subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message ?? 'Could not load notifications'); this.loading.set(false); },
    });
  }

  ago(iso: string) {
    const s = (Date.now() - +new Date(iso)) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
  }

  open(n: AppNotification) {
    if (!n.isRead) {
      this.items.update((l) => l.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      this.account.markRead(n.id).subscribe({ error: () => {} });
    }
    if (n.link) this.router.navigateByUrl(n.link);
  }

  markAll() {
    this.account.markAllRead().subscribe(() =>
      this.items.update((l) => l.map((x) => ({ ...x, isRead: true })))
    );
  }
}