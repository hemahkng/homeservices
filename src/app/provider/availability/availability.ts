
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DayAvailability, ProviderService } from '../services/provider-service';
import { Loader } from '../../shared/components/loader/loader';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

const DAY_KEYS: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

interface Row extends DayAvailability {
  name: string;
}

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [FormsModule, Loader, TranslatePipe],
  templateUrl: './availability.html',
  styleUrl: './availability.scss',
})
export class Availability implements OnInit {
  private api = inject(ProviderService);
  private translate = inject(TranslateService);

  rows: Row[] = [];
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  get openDays() {
    return this.rows.filter((r) => r.isActive).length;
  }

  ngOnInit() {
    this.api.availability().subscribe({
      next: (list) => {
        const hasSaved = list.length > 0;
        const byDay = new Map(list.map((d) => [d.dayOfWeek, d]));

        this.rows = ORDER.map((dow) => {
          const d = byDay.get(dow);

          return {
            dayOfWeek: dow,
            name: this.translate.instant(
              `PROVIDER_AVAILABILITY.DAYS.${DAY_KEYS[dow]}`
            ),
            startTime: d?.startTime ?? '09:00',
            endTime: d?.endTime ?? '18:00',
            isActive: d ? d.isActive : !hasSaved && dow !== 0,
          };
        });

        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_AVAILABILITY.LOAD_ERROR')
        );
        this.loading.set(false);
      },
    });
  }

  copyToAll() {
    const first = this.rows.find((r) => r.isActive);
    if (!first) return;

    this.rows.forEach((r) => {
      if (r.isActive) {
        r.startTime = first.startTime;
        r.endTime = first.endTime;
      }
    });
  }

  save() {
    this.error.set('');

    const bad = this.rows.find(
      (r) =>
        r.isActive &&
        (!r.startTime || !r.endTime || r.startTime >= r.endTime)
    );

    if (bad) {
      this.error.set(
        this.translate.instant('PROVIDER_AVAILABILITY.END_TIME_ERROR', {
          day: bad.name,
        })
      );
      return;
    }

    this.saving.set(true);

    const days: DayAvailability[] = this.rows
      .map(({ dayOfWeek, startTime, endTime, isActive }) => ({
        dayOfWeek,
        startTime,
        endTime,
        isActive,
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    this.api.saveAvailability(days).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(
          e.error?.message ??
          this.translate.instant('PROVIDER_AVAILABILITY.SAVE_ERROR')
        );
      },
    });
  }
}
