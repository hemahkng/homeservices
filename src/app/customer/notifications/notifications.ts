
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Loader } from '../../shared/components/loader/loader';
import { AppNotification, CustomerAccount } from '../services/customer-account';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [Loader, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  private account = inject(CustomerAccount);
  private router = inject(Router);
  private translate = inject(TranslateService);

  items = signal<AppNotification[]>([]);
  loading = signal(true);
  error = signal('');

  unread = computed(() =>
    this.items().filter((n) => !n.isRead).length
  );

  ngOnInit(): void {
    this.account.notifications().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('CUSTOMER_NOTIFICATIONS.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  ago(iso: string): string {
    const seconds = (Date.now() - +new Date(iso)) / 1000;

    if (seconds < 60) {
      return this.translate.instant('CUSTOMER_NOTIFICATIONS.JUST_NOW');
    }

    if (seconds < 3600) {
      return this.translate.instant('CUSTOMER_NOTIFICATIONS.MINUTES_AGO', {
        count: Math.floor(seconds / 60),
      });
    }

    if (seconds < 86400) {
      return this.translate.instant('CUSTOMER_NOTIFICATIONS.HOURS_AGO', {
        count: Math.floor(seconds / 3600),
      });
    }

    return this.translate.instant('CUSTOMER_NOTIFICATIONS.DAYS_AGO', {
      count: Math.floor(seconds / 86400),
    });
  }

  open(n: AppNotification): void {
    if (!n.isRead) {
      this.items.update((list) =>
        list.map((x) =>
          x.id === n.id ? { ...x, isRead: true } : x
        )
      );

      this.account.markRead(n.id).subscribe({
        error: () => {},
      });
    }

    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  markAll(): void {
    this.account.markAllRead().subscribe(() =>
      this.items.update((list) =>
        list.map((x) => ({ ...x, isRead: true }))
      )
    );
  }
}
