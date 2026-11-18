
import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Service } from '../../shared/models/service';
import { ProviderService } from '../services/provider-service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-my-services',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    Loader,
    EmptyState,
    TranslatePipe
  ],
  templateUrl: './my-services.html',
  styleUrl: './my-services.scss',
})
export class MyServices implements OnInit {
  private api = inject(ProviderService);
  private translate = inject(TranslateService);

  items = signal<Service[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.myServices().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_MY_SERVICES.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  duration(min: number): string {
    if (min < 60) {
      return this.translate.instant('PROVIDER_MY_SERVICES.MINUTES', {
        count: min
      });
    }

    const h = Math.floor(min / 60);
    const m = min % 60;

    if (m) {
      return this.translate.instant('PROVIDER_MY_SERVICES.HOURS_MINUTES', {
        hours: h,
        minutes: m
      });
    }

    return this.translate.instant('PROVIDER_MY_SERVICES.HOURS', {
      count: h
    });
  }

  remove(s: Service): void {
    const confirmation = this.translate.instant(
      'PROVIDER_MY_SERVICES.DELETE_CONFIRM',
      { title: s.title }
    );

    if (!confirm(confirmation)) {
      return;
    }

    this.busyId.set(s.id);

    this.api.deleteService(s.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.items.update((l) => l.filter((x) => x.id !== s.id));
      },
      error: (e) => {
        this.busyId.set(null);
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_MY_SERVICES.DELETE_ERROR')
        );
      },
    });
  }
}
