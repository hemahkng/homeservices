
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Booking } from '../../shared/models/booking';
import {
  JobActionDef,
  ProviderBooking,
  actionsFor
} from '../services/provider-booking';

import { Loader } from '../../shared/components/loader/loader';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    StatusBadge,
    Loader,
    TranslatePipe
  ],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail implements OnInit {
  private jobs = inject(ProviderBooking);
  private translate = inject(TranslateService);

  private id: string;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }

  b = signal<Booking | null>(null);
  loading = signal(true);
  busy = signal(false);
  error = signal('');

  readonly steps = ['Requested', 'Accepted', 'In progress', 'Completed'];

  stepIndex = computed(() =>
    ({
      pending: 0,
      accepted: 1,
      in_progress: 2,
      completed: 3
    } as Record<string, number>)[this.b()?.status ?? ''] ?? 0
  );

  acts = computed(() => actionsFor(this.b()?.status ?? ''));

  endsAt = computed(() => {
    const j = this.b();
    return j
      ? new Date(
          new Date(j.scheduledAt).getTime() +
          j.service.durationMin * 60000
        )
      : null;
  });

  mapUrl = computed(() => {
    const j = this.b();
    return j
      ? 'https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(j.address)
      : '';
  });

  ngOnInit(): void {
    this.jobs.get(this.id).subscribe({
      next: (j) => {
        this.b.set(j);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_JOB_DETAIL.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  run(d: JobActionDef): void {
    const j = this.b();

    if (!j || (d.confirm && !confirm(d.confirm))) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.jobs.act(j.id, d.action).subscribe({
      next: (u) => {
        this.b.set(u);
        this.busy.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_JOB_DETAIL.ACTION_ERROR')
        );
        this.busy.set(false);
      },
    });
  }
}
